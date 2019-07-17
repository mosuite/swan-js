/**
 * @file 宿主扩展的加载、注册、解析
 * @author sunweinan(sunweinan@baidu.com)
 */
import {loader} from '../utils';
import {require} from '../utils/module';
import EventsEmitter from '../utils/events-emitter';

export default class Extension {

    /**
     * 构造函数
     *
     * @param {Object} context - 全局环境
     * @param {Object} swaninterface - 端能力对象
     */
    constructor(context, swaninterface) {
        this.context = context;
        this.swaninterface = swaninterface;
    }
    /**
     * 向boxjs中注入底层方法，供调用
     *
     * @param {Object} extension - 宿主extension中的extension对象
     */
    injectHostMethods(extension) {
        let {
            hostMethodDescriptions = [],
            name: hostName
        } = extension;
        try {
            this.swaninterface.boxjs.extend(
                hostMethodDescriptions.map(description => {
                    // 默认args直接传data即可
                    let {
                        args = [{
                            name: 'data',
                            value: 'Object'
                        }]
                    } = description;
                    // 默认的name就是description本身，如果开发者有特殊要求会写成对象
                    let {
                        name = description,
                        path,
                        authority = 'swanAPI'
                    } = description;

                    path = path || ('/' + name);

                    // 最后配置文件要用的配置

                    if (~['wifikey', 'netdisk'].indexOf(hostName)) {
                        args.forEach(function (item) {
                            if (typeof item.value === 'string') {
                                item.value.replace(/=?$/, res => res ? '' : '=');
                            }
                        });
                    }
                    return {
                        args,
                        name,
                        path,
                        authority
                    };
                }),
                hostName
            );
        } catch (ex) {
            console.error(ex);
        }
    }




    /**
     * 向swan上挂载API，供开发者调用
     *
     * @param {Object} extension - 宿主extension中的extension对象
     */
    injectHostAPI(extension) {
        const namespace = extension.name;
        let swan = this.context.swan;
        let swanHostSpace = this.context.swan[namespace] = {};

        extension.methods
            && Object
                .keys(extension.methods)
                .forEach(apiName => {
                    const api = extension.methods[apiName];
                    switch (typeof api) {
                        // 如果直接传function，默认直接挂载到namespace上
                        case 'function':
                            swanHostSpace[apiName] = api;
                            break;
                        // 正确逻辑
                        case 'object':
                            api.scope === 'root' ? (swan[apiName] = api.method) : (swanHostSpace[apiName] = api.method);
                            break;
                        // 格式错误
                        default:
                            console.error('api in extension-methods must function or object');
                            break;
                    }
                });

        // 将extension信息提供给debug小程序以提示宿主
        if (!!this.context._envVariables) {
            this.context.swan._extensionSrc = extension;
        }
    }

    /**
     * 注册扩展的 components
     *
     * @param {Object} extension - 宿主extension中的extension对象
     */
    injectHostComponents(extension) {
        const namespace = extension.name;
        if (!extension.components) {
            return;
        }
        Object
            .keys(extension.components)
            .forEach(ComponentName => {
                let finalComponentName = ComponentName;
                if (extension.components[ComponentName].scope !== 'root') {
                    finalComponentName = namespace + '-' + ComponentName;
                }
                this.context.componentFactory.componentDefine(
                    finalComponentName, extension.components[ComponentName]
                );
            });
        this.context.componentFactory.getComponents();
    }

    /**
     * 加载并使用宿主的extension包
     * @param {Object} context - 框架的master或slave对象
     * @param {number} isMaster - 是否是master对象
     */
    use(context, isMaster) {
        const isSlave = !isMaster;

        // 获得extension路径
        const extensionPath = this.context._envVariables.sdkExtension;
        if (!extensionPath) {
            return;
        }

        // 加载css
        isSlave && loader.loadcss(`${extensionPath}/extension.css`);
        // 加载js
        loader.loadjs(`${extensionPath}/extension.js`)
            .then(() => {
                // 模块引入
                const extension = require('swan-extension');
                // 在swan上挂载宿主的API
                this.injectHostAPI(extension);
                // 注入底层方法
                this.injectHostMethods(extension);
                // 组件注册
                isSlave && this.injectHostComponents(extension);
                // 注入宿主的分享自定义方法
                isMaster && this.injectHostShareHook(extension);
                // 统计逻辑
                try {
                    isMaster && extension.customLog(EventsEmitter.merge(
                        context.pageLifeCycleEventEmitter,
                        context.appLifeCycleEventEmitter,
                        context.swanEventsCommunicator,
                        context.context.swanEvents
                    ));
                } catch (e) {
                    console.error(e);
                }
            })
            .catch(console.error);

        return {
            isSlave,
            extensionPath
        };
    }

    /**
     * 配置分享链接
     *
     * @param {Object} extension - 宿主配置的extension
     */
    injectHostShareHook(extension) {
        this.getShareURL = extension.getShareURL;
    }

    /**
     * 分享时使用，作为分享url过滤器，优先使用宿主的getShareURL方法
     *
     * @param {Object} userParams - 接入宿主的配置
     * @param {Object} appInfo - 当前的上下文环境信息
     * @return {Object} 处理后的分享参数
     */
    hostShareParamsProccess(userParams, appInfo) {
        if (typeof this.getShareURL === 'function') {
            return {
                ...userParams,
                forceReplaceShareUrl: true,
                ...this.getShareURL({
                    ...userParams,
                    appId: appInfo.appId,
                    scene: appInfo.scene
                })
            };
        }
        return userParams;
    }

}
