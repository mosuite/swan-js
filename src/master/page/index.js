/**
 * @file 控制了master中所有的用户的page的创建/初始化/merge私有方法
 * @author houyu(houyu01@baidu.com)
 */
import swanEvents from '../../utils/swan-events';
import EventsEmitter from '../../utils/events-emitter';
import SlaveEventsRouter from './slave-events-router';
import {getPagePrototypeInstance} from './page-prototype';
import {Data, getParams, Share, deepClone, getAppInfo} from '../../utils';

/**
 * 页面所有的生命周期相关事件派发器
 *
 */
const pageLifeCycleEventEmitter = new EventsEmitter();

let global = window;

/**
 * slave的绑定事件初始化
 *
 * @param {Object} [master] - master全局变量实例
 * @return {Object} - 所有slave事件的事件流集合
 */
export const slaveEventInit = master => {
    const slaveEventsRouter = new SlaveEventsRouter(
            master,
            pageLifeCycleEventEmitter
        );
    slaveEventsRouter.initbindingEvents();
    return {
        pageLifeCycleEventEmitter
    };
};

/**
 * 暴露给用户的 Page 方法
 *
 * @param {Object} [pageObj] - 开发者的page原型对象
 * @return {Object} - 开发者的page原型对象
 */
export const Page = pageObj => {
    const uri = global.__swanRoute;
    const usingComponents = global.usingComponents || [];
    const pageProto = {data: {}};
    global.masterManager.pagesQueue[uri] = {...pageProto, ...pageObj, uri, usingComponents};
    return global.masterManager.pagesQueue[uri];
};

/**
 * 初始化页面实例，附带页面原型，页面的创建函数
 *
 * @param {Object} [pageInstance] - 页面实例
 * @param {string} [slaveId] - 页面的slaveId
 * @param {string} [accessUri] - 页面的URL(带query)
 * @param {Object} [masterManager] - 小程序的全局挂载实例
 * @param {Object} [globalSwan] - 页面的swan接口对象（开发者用的那个swan）
 * @param {Object} [appConfig] - 页面配置对象(app.json中的配置内容)
 * @return {Object} - 创建页面实例
 */
const _createPageInstance = (pageInstance, slaveId, accessUri, masterManager, globalSwan) => {
    const swaninterface = masterManager.swaninterface;
    const appid = getAppInfo(swaninterface).appid;
    slaveId = '' + slaveId;

    // 获取page的原型方法单例，防止对每个page都生成方法集合
    const pagePrototype = getPagePrototypeInstance(masterManager, globalSwan, pageLifeCycleEventEmitter);
    const [route, query] = accessUri.split('?');
    // merge page的原型方法
    Object.assign(pageInstance,
        {
            privateProperties: {
                slaveId,
                accessUri,
                raw: new Data(pageInstance.data),
                hooks: [],
                share: new Share(swaninterface, appid, pageInstance, '')
            },
            route,
            options: getParams(query)
        },
        pagePrototype
    );

    Page.__hooks.forEach(hook => {
        if (accessUri.match(hook.url)) {
            pageInstance.privateProperties.hooks.push(hook);
        }
    });

    swanEvents('masterActiveInitUserPageInstance', pageInstance);

    return pageInstance;
};

// Page对象中，写保护的所有key
const isWriteProtected = pageKey => {
    const protectedKeys = [
        'uri', 'setData', 'getData', 'shiftData',
        'popData', 'unshiftData', 'spliceData',
        'privateMethod', 'privateProperties'
    ];
    return false;
};

/**
 * 克隆page对象方法
 *
 * @param {Object} [pagePrototype] - 开发者的页面原型
 * @return {Object} - 克隆出的页面实例
 */
const cloneSwanPageObject = (pagePrototype = {}) => {
    let newSwanObject = {};
    pagePrototype.data = pagePrototype.data || {};
    newSwanObject.data = JSON.parse(JSON.stringify(pagePrototype.data));
    Object.keys(pagePrototype).filter(pageKey => pageKey !== 'data')
    .forEach(pageKey => {
        if (!isWriteProtected(pageKey)) {
            newSwanObject[pageKey] = deepClone(pagePrototype[pageKey]);
        }
        else {
            console.error(`关键字保护：${pageKey} is write-protected`);
        }
    });
    return newSwanObject;
};

// 优化redirectTo和naviagteTo时的性能
// 提前在调用路由端能力之前把initData准备好
// 减少一次单独发送initData的端能力调用
export const getInitDataAdvanced = accessUri => {
    swanEvents('master_active_get_salve_data_advanced');
    const uriPath = accessUri.split('?')[0];
    // 如果是在子包中的页面，直接返回，这种情况不做处理
    if (!global.masterManager.pagesQueue[uriPath]) {
        return {
            data: {},
            componentsData: {}
        };
    }
    // 因为获取页面原型的方法是单例，因此这里提前调用没有副作用
    const pagePrototype = getPagePrototypeInstance(global.masterManager, global.swan, pageLifeCycleEventEmitter);
    // 现获取页面本身的data
    let data = global.masterManager.pagesQueue[uriPath].data || {};
    // 再获取自定义组件里面的data
    let componentsData = pagePrototype
        .privateMethod
        .getCustomComponentsData(global.masterManager.pagesQueue[uriPath].usingComponents);
    return {
        data,
        componentsData
    };
};

// 当页面打开时(即slave加载完毕，通知master时)master可以将页面对应的page对象进行实例化
export const createPageInstance = (accessUri, slaveId, appConfig) => {
    swanEvents('masterActiveGetUserPageInstance');
    // 过滤传过来的originUri,临时方案；后面和生成path做个统一的方法；
    const uriPath = accessUri.split('?')[0];
    return _createPageInstance(
        cloneSwanPageObject(global.masterManager.pagesQueue[uriPath]),
        slaveId,
        accessUri,
        global.masterManager,
        global.swan,
        appConfig
    );
};

/**
 * 获取用户当前页面栈
 *
 * @return {Array} - 页面栈
 */
export const getCurrentPages = () => {
    return global.masterManager.navigator.history.getAllSlaves()
        .map(currentSlave => currentSlave.getCurrentChildren()
            .getUserPageInstance()
        );
};

const normalizeRegx = raw => new RegExp(raw);

Page.__hooks = [];

/**
 * Page的切面注入方法
 *
 * @param {Object} options 传入的切面对象
 * @param {Object} options.methods 传入的切面对象
 */
Page.after = function (options) {

    const urlRegx = normalizeRegx(options.url || '.*');

    Page.__hooks.push({
        ...options,
        url: urlRegx
    });

    global.masterManager.navigator.history
        .each(currentSlave => {
            if (currentSlave.accessUri
                && currentSlave.accessUri.match(urlRegx)
                && currentSlave.isCreated()
            ) {
                currentSlave.userPageInstance
                    .privateProperties.hooks.push(options);
            }
        }, {
            recursive: true
        });
};
