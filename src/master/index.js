/**
 * @file 管理小程序的master(包括对于master的global的装饰，对于swan接口的装饰)
 *       小程序上使用的interface
 * @author houyu(houyu01@baidu.com)
 */

/* globals swanGlobal*/
import {getAppMethods} from './app';
import Extension from '../extension';
import {Navigator} from './navigator';
import swanEvents from '../utils/swan-events';
import {define, require} from '../utils/module';
import {loader, getABSwitchValue, appConfigStorer} from '../utils';
import Communicator from '../utils/communication';
import {absolutePathResolver} from '../utils/path';
import EventsEmitter from '../utils/events-emitter';
import VirtualComponentFactory from './custom-component';
import {apiProccess} from './proccessors/api-proccessor';
import prefetch from '../utils/prefetch/prefetch-request';
import {getCurrentPages, Page, slaveEventInit} from './page';
import firstRenderHookQueue from '../utils/firstRenderHookQueue';

const PERFORMANCE_PANEL_SWITCH = 'swanswitch_performance_panel';

export default class Master {

    constructor(context, swaninterface, swanComponents) {
        swanEvents('masterPreloadStart');
        this.handleError(context);
        this.swaninterface = swaninterface;
        this.swanComponents = swanComponents;
        this.pagesQueue = {};
        this.navigator = new Navigator(swaninterface, context);
        this.communicator = new Communicator(swaninterface);
        swanEvents('masterPreloadCommunicatorListened');

        this.swanEventsCommunicator = new EventsEmitter();
        this.virtualComponentFactory = new VirtualComponentFactory(swaninterface);
        swanEvents('masterPreloadVirtualComponentFactoryInstantiated');

        this.extension = new Extension(context, swaninterface);
        swanEvents('masterPreloadExtensionInstantiated');

        // perfAudit data hook
        this.perfAudit = {};
        // 记录启动时客户端传递过来的信息
        this.initEvent = {};
        // 监听app、page所有生命周期事件
        this.bindLifeCycleEvents();
        // 监听所有的slave事件
        const allSlaveEventEmitters = slaveEventInit(this);
        swanEvents('masterPreloadAllSlaveEventsListened');

        this.pageLifeCycleEventEmitter = allSlaveEventEmitters.pageLifeCycleEventEmitter;

        // 装饰当前master的上下文(其实就是master的window，向上挂方法/对象)
        this.context = this.decorateContext(context);
        swanEvents('masterPreloadContextDecorated');

        this.openSourceDebugger();
        // 监听加载小程序文件的事件
        this.listenDispatchJSFiles();
        // 监听appReady
        this.listenAppReady();
        swanEvents('masterPreloadAppReadyListened');

        // 监听首屏渲染
        this.listenFirstRender();

        // 适配环境
        this.adaptEnvironment();
        // 解析宿主包
        this.extension.use(this, 1);

        swanEvents('masterPreloadEnd');
    }

    listenFirstRender() {
        this.swaninterface.invoke('onMessage', data => {
            if (data.type === 'slavePageComponentAttached' && !firstRenderHookQueue.firstRenderEnd) {
                while (!!firstRenderHookQueue.queue.length) {
                    let hook = firstRenderHookQueue.queue.shift();
                    hook.delay && hook.delay();
                }
                firstRenderHookQueue.firstRenderEnd = true;
            }
        });
    }

    /**
     * 开源宿主调试工具debug
     */
    openSourceDebugger() {
        try {
            const {
                ctsJsAddress = {},
                host, // IDE所在pc的host
                port, // IDE所在pc的port
                udid
            } = this.context._envVariables;

            // 提供使用的udid和和所通信pc地址，便于ws连接
            global._openSourceDebugInfo = {host, port: +port, udid};
            // 加载cts资源
            const masterCtsAddrList = ctsJsAddress.master;
            masterCtsAddrList
            && Array.isArray(masterCtsAddrList)
            && masterCtsAddrList.forEach(src => {
                src.trim() !== '' && loader.loadjs(src);
            });
        } catch (err) {
            return false;
        }
    }

    /**
     * 预下载分包
     */
    preLoadSubPackage() {
        const appConfig = this.context.parsedAppConfig;
        //配置项格式校验
        if ((!appConfig.preloadRule || !appConfig.subPackages)
            || typeof appConfig.preloadRule !== 'object'
            || !(appConfig.subPackages instanceof Array)) {
            return;
        }

        // 获得网络状态
        swan.getNetworkType({
            success: function (res) {
                let packages = [];
                let rootConfigs = appConfig.subPackages.map(v => v.root);
                //遍历配置项
                Object
                    .keys(appConfig.preloadRule)
                    .forEach(key => {
                        let item = appConfig.preloadRule[key];
                        // 配置项格式校验
                        if (!(item.packages instanceof Array)) {
                            return;
                        }
                        // 预下载分包
                        item.packages.forEach(rootName => {
                            // 校验是否已定义此项分包，为用户配置容错
                            rootConfigs.includes(rootName)
                                // 校验是否配置重复
                                && !packages.includes(rootName)
                                // 校验网络状态
                                && (res.networkType === 'wifi' || item.network === 'all')
                                && packages.push(rootName)
                                && swan.loadSubPackage({
                                        root: rootName
                                    });
                        });
                    });
            }
        });
    }

    /**
     * 监听客户端事件，若收到dispatch-js事件，就可以加载开发者代码
     */
    listenDispatchJSFiles() {
        this.swaninterface.bind('dispatchJSMaster', event => {
            if (this.appReadyTriggered) {
                return;
            }
            swanEvents('masterLogicStart');

            this.context.appConfig = event.appConfig;
            appConfigStorer(this.context, event.appConfig);

            this.initSlaveAndLoadAppFiles(event);
        });
    }

    /**
     * 监听客户端的调起逻辑
     */
    listenAppReady() {
        this.swaninterface.bind('AppReady', event => {
            this.appReadyTriggered = true;
            if (event.devhook === 'true') {
                if (swanGlobal) {
                    loader.loadjs('./swan-devhook/master.js');
                } else {
                    loader.loadjs('../swan-devhook/master.js');
                }
            }
            swanEvents('masterActiveStart');
            // 给三方用的，并非给框架用，请保留
            if (event.appConfig) {
                this.context.appConfig = event.appConfig;
                appConfigStorer(this.context, event.appConfig);
            }
            else {
                event.appConfig = this.context.appConfig;
            }

            // 初始化master的入口逻辑
            this.setGLobalAppInfo();
            // 性能面板实验开关值
            let performancePanel = getABSwitchValue(PERFORMANCE_PANEL_SWITCH);
            // 根据AB实验的值，判断是否需要采用端上传来的环境变量
            if (performancePanel === 1) {
                this.context.showPerformancePanel = event.showPerformancePanel;
            }
            // 初始化master的入口逻辑
            swanEvents('masterActiveInitRenderStart');
            this.initRender(event);
            this.preLoadSubPackage();
        });
    }

    /**
     * 装饰当前的上下文环境
     *
     * @param {Object} context - 待装饰的上下文
     * @return {Object} 装饰后的上下文
     */
    decorateContext(context) {
        Object.assign(context, this.getAppMethods());
        context.masterManager = this;
        swanEvents('masterPreloadMountMastermanagerToGlobal');
        context.define = define;
        context.require = require;
        context.swaninterface = this.swaninterface; // 远程调试工具的依赖
        context.swan = this.decorateSwan(Object.assign(this.swaninterface.swan, context.swan || {}));
        context.getCurrentPages = getCurrentPages;
        context.global = {};
        context.Page = Page;

        context.Component = this.virtualComponentFactory
            .defineVirtualComponent.bind(this.virtualComponentFactory);

        context.Behavior = this.virtualComponentFactory
            .defineBehavior.bind(this.virtualComponentFactory);

        return context;
    }

    /**
     * 初始化master中的slave对象，加载相关资源
     * @param {Object} initEvent - 客户端传递的初始化事件对象
     */
    initSlaveAndLoadAppFiles(initEvent) {
        // 设置appConfig
        this.navigator.setAppConfig({
            ...this.context.parsedAppConfig,
            ...{
                appRootPath: initEvent.appPath
            }
        });
        this.appPath = initEvent.appPath;
        this.initEvent = initEvent;
        this.dispatchJSPromise = this.navigator.startLoadAppFiles({
            pageUrl: initEvent.pageUrl,
            slaveId: +initEvent.wvID,
            root: initEvent.root,
            preventAppLoad: initEvent.preventAppLoad
        });
    }

    /**
     * 掉用getAppInfo端能力获取信息，必须在端上的Activity绑定之后才能调用
     */
    setGLobalAppInfo() {
        // 将初始化之后的app对象，返回到上面，getApp时，可以访问
        // 获取app的相关信息，onLaunch是框架帮忙执行的，所以需要注入客户端信息
        const appInfo = this.swaninterface.boxjs.data.get({name: 'swan-appInfoSync'});
        global.monitorAppid = appInfo['appid'];
        global.__swanAppInfo = appInfo;
        try {
            global.rainMonitor.opts.appkey = appInfo['appid'];
            global.rainMonitor.opts.cuid = appInfo['cuid'];
        } catch (e) {
            // avoid empty state
        }
    }

    /**
     * 初始化渲染
     *
     * @param {Object} initEvent - 客户端传递的初始化事件对象
     * @param {string} initEvent.appConfig - 客户端将app.json的内容（json字符串）给前端用于处理
     * @param {string} initEvent.appPath - app在手机上的磁盘位置
     * @param {string} initEvent.wvID - 第一个slave的id
     * @param {string} initEvent.pageUrl - 第一个slave的url
     */
    initRender(initEvent) {
        if (this.dispatchJSPromise
            && initEvent.appPath === this.appPath
            && initEvent.pageUrl === this.initEvent.pageUrl
            && initEvent.slaveId === this.initEvent.slaveId) {
            this.dispatchJSPromise
                .then(() => this.navigator.pushInitSlaveToHistory());
            swanEvents('masterActivePushInitslave');
            return;
        }

        // 设置appConfig
        if (initEvent.appConfig && initEvent.appPath) {
            this.navigator.setAppConfig({
                ...this.context.parsedAppConfig,
                ...{
                    appRootPath: initEvent.appPath
                }
            });
            this.appPath = initEvent.appPath;
            this.initEvent = initEvent;
        }
        swanEvents('masterActiveInitRender');

        // 初始化prefetch机制，并替换request
        prefetch.init(this.navigator.appConfig.prefetches, this.swaninterface);

        swanEvents('masterActivePushInitSlaveStart');

        // 压入initSlave
        this.navigator.pushInitSlave({
            pageUrl: initEvent.pageUrl,
            slaveId: +initEvent.wvID,
            root: initEvent.root,
            preventAppLoad: initEvent.preventAppLoad
        });
        swanEvents('masterActivePushInitslave');
    }

    /**
     * 当开发者调用了工程相对路径，前端需要将其处理为绝对路径，当是远程地址或绝对路径时则忽略
     *
     * @param {string} path - 用户传递的路径
     * @return {string} 计算出的文件的绝对路径
     */
    getPathFromFront(path) {
        const frontUri = this.navigator.history.getTopSlaves()[0].getFrontUri();
        return absolutePathResolver(this.appPath, frontUri, path);
    }

    /**
     * 获取所有App级相关的方法
     *
     * @return {Object} 用户App的操作相关方法集合
     */
    getAppMethods() {
        this.appLifeCycleEventEmitter = new EventsEmitter();
        return getAppMethods(
                this.swaninterface,
                this.appLifeCycleEventEmitter,
                this.lifeCycleEventEmitter
            );
    }

    /**
     * 将导出给用户的swan进行封装，补充一些非端能力相关的框架层能力
     * 后续，向对外暴露的swan对象上，添加框架级方时，均在此处添加
     *
     * @param {Object} [originSwan] 未封装过的，纯boxjs导出的swan对象
     * @return {Object} 封装后的swan对象
     */
    decorateSwan(originSwan) {
        return apiProccess(originSwan, {
            swanComponents: this.swanComponents,
            navigator: this.navigator,
            communicator: this.communicator,
            pageLifeCycleEventEmitter: this.pageLifeCycleEventEmitter,
            appLifeCycleEventEmitter: this.appLifeCycleEventEmitter,
            swanEventsCommunicator: this.swanEventsCommunicator,
            hostShareParamsProccess: this.extension.hostShareParamsProccess.bind(this.extension),
            swaninterface: this.swaninterface
        });
    }

    /**
     * 绑定生命周期事件
     */
    bindLifeCycleEvents() {
        this.lifeCycleEventEmitter = new EventsEmitter();
        this.swaninterface.bind('lifecycle', event => {
            this.lifeCycleEventEmitter.fireMessage({
                type: event.lcType + (event.lcType === 'onShow' ? event.wvID : ''),
                event
            });
        });
    }

    /**
     * 适配master上下文
     */
    adaptEnvironment() {
        this.swaninterface.adaptMaster();
    }


    /**
     * 捕获全局错误
     * @param {Object} [global] - 全局对象
     */
    handleError(global) {
        global.addEventListener('error', e => {
            global.myerror = e;
            let app = global.getApp();
            app && app._onAppError({
                appInfo: global.appInfo || {},
                event: e,
                type: 'onAppError'
            });
        });
    }
}