/**
 * @file APP的lifeCycle抽象
 * @author houyu(houyu01@baidu.com)
 */
import {processParam} from '../../utils/index';
import swanEvents from '../../utils/swan-events';

import {renderHookEnqueue} from '../../utils/firstRenderHookQueue';

const lifeCyclePrototype = {

    /**
     * 生命周期的函数中接收到的参数处理函数
     *
     * @param {Object} [data] - 待处理的数据
     * @return {Object} 处理后的数据
     */
    _lifeCycleParamsHandle(data) {
        const appInfo = data && data.appInfo || {};

        //  取出 appInfo 中的 path, query, scene, shareTicket
        let result = ['path', 'query', 'scene', 'shareTicket']
            .reduce((prev, cur) => {
                prev[cur] = appInfo[cur] || '';
                return prev;
            }, {});

        // 如果是从小程序跳转来的，则增加引用信息 referrerInfo
        appInfo.srcAppId && (result.referrerInfo = appInfo.referrerInfo);

        return result;
    },

    /**
     * onShow生命周期的参数的处理
     * @param {Object} data - 待处理的数据
     * @return {Object} 处理后的传给开发者的参数
     * @private
     */
    _onAppShowLifeCycleParamsHandle(data) {
        const result = this._lifeCycleParamsHandle(data);
        const appInfo = data && data.appInfo || {};

        // 对于 onShow，传递entryType 及 appURL信息，以增加场景触发标识参数
        // {string} entryType 值同showBy，有'user'  | 'schema' | 'sys' 标识onShow的调起方式，'user'通过home前后台切换或者锁屏调起，'schema'是通过协议调起，'sys'为默认值(未覆盖到的打开场景)
        // {string=} appURL showBy为schema时存在，为调起协议的完整链接
        if (appInfo.showBy) {
            result.entryType = appInfo.showBy;
            if (appInfo.showBy === 'schema') {
                result.appURL = appInfo.appURL;
            }
        }
        return result;
    },

    /**
     * 向事件流中发送生命周期消息
     *
     * @param {Object} [eventName] - 生命周期事件名称
     * @param {Object} [e] - 事件对象
     */
    _sendAppLifeCycleMessage(eventName, e) {
        this._appLifeCycleEventEmitter.fireMessage({
            type: 'ApplifeCycle',
            params: {
                eventName,
                e
            }
        });
    },

    /**
     * appLaunch生命周期，在app启动时即自执行
     *
     * @param {Object} [params] - appLaunch的生命周期函数
     */
    _onAppLaunch(params) {
        processParam(params.appInfo);
        swanEvents('masterOnAppLaunchHookStart');
        try {
            this.onLaunch && this.onLaunch(this._lifeCycleParamsHandle(params));
        }
        catch (e) {
            console.error(e);
        }
        swanEvents('masterOnAppLaunchHookEnd');
        this._sendAppLifeCycleMessage('onLaunch', {
            e: params.appInfo
        });
    },

    /**
     * appShow生命周期，在app启动/前后台切换时触发
     *
     * @param {Object} [params] - appShow生命周期参数
     */
    _onAppShow: renderHookEnqueue(function (params) {
        processParam(params.appInfo);
        this._sendAppLifeCycleMessage('onPreShow', {e: params.appInfo});
        try {
            this.onShow && this.onShow(this._onAppShowLifeCycleParamsHandle(params));
        }
        catch (e) {
            console.error(e);
        }
        this._sendAppLifeCycleMessage('onShow', {
            e: params.appInfo
        });
    }, '_onAppShow'),

    /**
     * appHide生命周期，在app前后台切换时触发
     *
     * @param {Object} [params] - appHide生命周期参数
     */
    _onAppHide: renderHookEnqueue(function (params) {
        processParam(params.appInfo);
        try {
            this.onHide && this.onHide(this._lifeCycleParamsHandle(params));
        }
        catch (e) {
            console.error(e);
        }
        this._sendAppLifeCycleMessage('onHide', {
            e: params.appInfo
        });
    }, '_onAppHide'),

    /**
     * appError生命周期，在app生命周期内，如果发生错误，即触发
     *
     * @param {Object} [params] - appError生命周期的参数
     */
    _onAppError(params) {
        try {
            this.onError && this.onError(params.event);
        }
        catch (e) {
            console.error(e);
        }
        this._sendAppLifeCycleMessage('onError', {
            e: params.appInfo
        });
    },

    /**
     * 页面找不到时触发
     *
     * @param {Object} [params] - appError生命周期的参数
     */
    _onPageNotFound(params) {
        if (this._hasNotFoundRedirect || !this.onPageNotFound) {
            return;
        }

        try {
            this.onPageNotFound(params.event);
        } catch (e) {
            console.error(e);
        }

        this._hasNotFoundRedirect = true;
        this._sendAppLifeCycleMessage('onPageNotFound', {
            e: params.appInfo
        });
    },

    /**
     * app中如果发生login的变化，则触发此函数，并携带用户信息
     *
     * @param {Object} [params] - 登录后的用户信息
     */
    _onLogin(params) {
        try {
            this.onLogin && this.onLogin(params.event.loginMsg);
        }
        catch (e) {
            console.error(e);
        }
        this._sendAppLifeCycleMessage('onLogin', {
            e: params.appInfo
        });
    }
};


/**
 * 初始化app的生命周期的mixin函数
 *
 * @param {Object} [appObject] - app的原型对象
 * @param {Object} [appLifeCycleEventEmitter] - app生命周期的事件流对象
 * @return {Object} 装饰后的app原型对象
 */
export const mixinLifeCycle = (appObject, appLifeCycleEventEmitter) => {
    return Object.assign(appObject, lifeCyclePrototype, {
        _appLifeCycleEventEmitter: appLifeCycleEventEmitter
    });
};
