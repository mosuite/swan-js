/**
 * @file app的相关方法
 * @author houyu(houyu01@baidu.com)
 */
import {
    mixinLifeCycle
} from './life-cycle';
import swanEvents from '../../utils/swan-events';
import {getAppInfo} from '../../utils';

/**
 * 绑定app的环境相关事件
 *
 * @param {Object} [appObject] - app对象的实例
 * @param {Object} [swaninterface] - swaninterface小程序底层接口
 * @param {Object} [lifeCycleEventEmitter] - 生命周期的事件流
 */
const bindLifeCycleEvent = (appObject, swaninterface, lifeCycleEventEmitter) => {
    const appEventsToLifeCycle = ['onAppShow', 'onAppHide', 'onAppError', 'onPageNotFound'];

    const messageHandler = (appObject, messages) => {
        // 筛选出本次的onShow的对应参数
        let event = messages[0] ? messages[0].event : messages.event;
        if (appObject[`_${event.lcType}`]) {
            appObject[`_${event.lcType}`]({
                event,
                appInfo: getAppInfo(swaninterface, true),
                type: event.lcType
            });
        }
    };
    appEventsToLifeCycle.forEach(eventName => {
        lifeCycleEventEmitter.onMessage(
            eventName,
            messages => messageHandler(appObject, messages),
            {
                listenPreviousEvent: true
            }
        );
    });

    swaninterface
        .bind('onLogin', event => {
            appObject['_onLogin']({
                event,
                appInfo: getAppInfo(swaninterface, true),
                type: event.lcType
            });
        });
    swanEvents('masterActiveInitBindingEnvironmentEvents');
};

/**
 * 获取所有的app操作方法(App/getApp)
 *
 * @param {Object} [swaninterface] - swan底层接口
 * @param {Object} [appLifeCycleEventEmitter] - app的数据流
 * @param {Object} [lifeCycleEventEmitter] - 整体生命周期的事件流对象
 * @return {Object} 所有App相关方法的合集
 */
export const getAppMethods = (swaninterface, appLifeCycleEventEmitter, lifeCycleEventEmitter) => {

    let initedAppObject = null;

    const getApp = () => initedAppObject;

    const App = appObject => {
        // 将初始化之后的app对象，返回到上面，getApp时，可以访问
        // 获取app的相关信息，onLaunch是框架帮忙执行的，所以需要注入客户端信息
        const appInfo = getAppInfo(swaninterface, true);
        global.monitorAppid = appInfo['appid'];
        try {
            global.rainMonitor.opts.appkey = appInfo['appid'];
            global.rainMonitor.opts.cuid = appInfo['cuid'];
        }
        catch (e) {
            // avoid empty state
        }
        initedAppObject = mixinLifeCycle(appObject, appLifeCycleEventEmitter);
        bindLifeCycleEvent(initedAppObject, swaninterface, lifeCycleEventEmitter);

        // 触发launch事件
        swanEvents('masterOnAppLaunchHookStart');
        initedAppObject._onAppLaunch({
            appInfo,
            event: {},
            type: 'onAppLaunch'
        });
        swanEvents('masterOnAppLaunchHookEnd');
        return initedAppObject;
    };

    /**
     * 用于存放所有的App的生命周期的hook
     *
     * @private
     * @type {Object}
     */
    App._hooks = {
        onShow: [],
        onHide: [],
        onLaunch: [],
        onError: [],
        onPageNotFound: []
    };

    /**
     * 增加切面的方法，此方法可以增加所有App级别的生命周期的hook方法
     *
     * @param {Object} options 传入的切面对象
     * @param {Object} options.methods 传入的切面，拦截的所有生命周期方法
     */
    App.after = function (options) {
        if (options.methods) {
            for (let methodName in options.methods) {
                if (App._hooks[methodName]) {
                    let method = options.methods[methodName];
                    App._hooks[methodName].push(method);
                }
            }
        }
    };

    appLifeCycleEventEmitter
        .onMessage('ApplifeCycle', ({params}) => {
            if (App._hooks[params.eventName]) {
                let returnValue = null;
                App._hooks[params.eventName].forEach(method => {
                    returnValue = method({
                        args: params.e.e,
                        returnValue,
                        thisObject: initedAppObject
                    });
                });
            }
        });

    return {
        App,
        getApp
    };
};
