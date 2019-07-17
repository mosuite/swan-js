/**
 * @file swan's slave leaf class
 * @author houyu(houyu01@baidu.com)
 */
import {createPageInstance, getInitDataAdvanced} from '../page';
import {STATUS_MAP} from './slave-common-parts';
import swanEvents from '../../utils/swan-events';
import Communicator from '../../utils/communication';
import {getParams, loader, executeWithTryCatch} from '../../utils';
import splitAppAccessory from '../../utils/splitapp-accessory';

const global = window;
export default class Slave {

    /**
     * Slave构造函数
     *
     * @param {Object} option slave构造的初始信息对象
     * @param {string} options.uri slave的uri
     * @param {string=} option.slaveId slave的唯一标识
     * @param {Object=} option.navigationParams slave的唯一标识
     * @param {Object=} option.swaninterface slave使用的swan-api
     */
    constructor({
        uri,
        slaveId = null,
        appConfig = {},
        swaninterface = {}
    }) {
        this.uri = uri.split('?')[0];
        this.accessUri = uri;
        this.slaveId = slaveId;
        this.status = STATUS_MAP.INITED;
        this.appConfig = appConfig;
        this.swaninterface = swaninterface;
        this.userPageInstance = {};
        this.appRootPath = appConfig.appRootPath;
        /* globals masterManager */
        this.loadJsCommunicator = masterManager.communicator;
    }

    /**
     * 判断slave当前状态
     *
     * @return {boolean} 当前状态
     */
    isCreated() {
        return this.status === STATUS_MAP.CREATED;
    }

    /**
     * 获取当前slave的uri
     *
     * @return {string} 当前slave的uri
     */
    getUri() {
        return this.uri;
    }

    /**
     * 将slave实例与用户的page对象进行绑定，一实例一对象，自己管理自己的页面对象
     * userPageInstance为用户(开发者)定义的页面对象
     *
     * @param {Object} userPageInstance 开发者设定的页面的生成实例
     */
    setUserPageInstance(userPageInstance) {
        this.userPageInstance = userPageInstance;
    }

    /**
     * 获取当前slave的开发者实例
     *
     * @return {Object} 开发者的slave实例
     */
    getUserPageInstance() {
        return this.userPageInstance;
    }

    /**
     * 设置slave的id
     *
     * @param {string} slaveId slave的客户端给出的id
     * @return {Object} 当前slave的操作实例
     */
    setSlaveId(slaveId) {
        // 如果新的slaveid与之前的slaveid不相等，证明本slave重新被创建，则进行一次重置
        if (+this.slaveId !== +slaveId) {
            this.status = STATUS_MAP.CREATING;
        }
        this.slaveId = slaveId;
        return this;
    }

    /**
     * 获取当前slave的id
     *
     * @return {string} 当前slave的id
     */
    getSlaveId() {
        return this.slaveId;
    }

    /**
     * 设置当前slave的uri
     *
     * @param {string} uri 当前slave的uri
     * @return {Object} 当前slave的操作实例
     */
    setSlaveUri(uri) {
        this.uri = uri;
        return this;
    }

    /**
     * 获取slave展示给用户的slave的uri，对于普通slave来讲，当前展示的就是自己
     *
     * @return {string} 当前slave的uri
     */
    getFrontUri() {
        return this.uri;
    }

    /**
     * 在当前slave中查找slave，对于普通slave来讲，获取的就是自己
     *
     * @return {Object} 当前slave实例
     */
    findChild() {
        return this;
    }

    /**
     * 在当前的slave中查找
     *
     * @return {Object} 当前slave的操作实例
     */
    getCurrentChildren() {
        return this;
    }

    /**
     * 切换tab客户端回调函数
     *
     * @param {Object} params 切换tab后，客户端派发的参数
     * @return {undefined} todo
     */
    onswitchTab(params) {
        return undefined;
    }

    /**
     * 调用当前slave的page对象的私有方法
     *
     * @param {string} methodName 方法名
     * @param {Object} options 调用私有方法的选项
     * @param {...*} args 传递给page对象的方法
     * @return {*} 私有方法的return值
     */
    callPrivatePageMethod(methodName, options = {}, ...args) {
        return this.userPageInstance.privateMethod[methodName]
            .call(this.userPageInstance, ...args);
    }

    /**
     * 重登录到某一个特定页面
     *
     * @param {Object} navigationParams navigation跳转的参数
     * @return {Promise} relaunch处理的事件流
     */
    reLaunch(navigationParams) {
        return new Promise(resolve => {
                if (splitAppAccessory.allJsLoaded) {
                    resolve();
                } else {
                    splitAppAccessory.routeResolve = resolve;
                }
            })
            .then(() => {
                return this.reLaunchPage(navigationParams);
            });
    }

    /**
     * 真正reLaunch到某个特定页面
     *
     * @param {Object} navigationParams navigation跳转的参数
     * @return {Promise} relaunch处理的事件流
     */
    reLaunchPage(navigationParams) {
        if (!navigationParams.url) {
            navigationParams.url = this.getFrontUri();
        }
        navigationParams.startTime = Date.now();
        this.status = STATUS_MAP.CREATING;
        return new Promise((resolve, reject) => {
                this.swaninterface.invoke('reLaunch', {
                    ...navigationParams,
                    ...{
                        success: res => {
                            executeWithTryCatch(
                                navigationParams.success,
                                null,
                                'success api execute error'
                            );
                            resolve(res);
                        },
                        fail: res => {
                            executeWithTryCatch(
                                navigationParams.fail,
                                null,
                                'fail api execute error'
                            );
                            reject(res);
                        },
                        complete: res => {
                            executeWithTryCatch(
                                navigationParams.complete,
                                null,
                                'complete api execute error'
                            );
                        }
                    }
                });
            })
            .then(res => {
                if (res.root) {
                    return loader
                        .loadjs(`${this.appRootPath}/${res.root}/app.js`)
                        .then(() => res);
                }
                return res;
            })
            .then(res => {
                this.slaveId = res.wvID;
                this.uri = navigationParams.url.split('?')[0];
                this.accessUri = navigationParams.url;
                this.setSlaveUri(navigationParams.url);
                return res;
            });
    }

    /**
     * 判断当前slave是否某一特定slave
     *
     * @param {string} tag 表示某一slave的特殊标记uri/slaveId均可
     * @return {boolean} 是否是当前slave
     */
    isTheSlave(tag) {
        return this.uri.split('?')[0] === ('' + tag).split('?')[0]
            || +this.slaveId === +tag;
    }

    /**
     * 初始化为第一个页面
     *
     * @param {Object} initParams 初始化的配置参数
     * @return {Promise} 返回初始化之后的Promise流
     */
    init(initParams) {
        return Promise.resolve(initParams)
            .then(initParams => {
                swanEvents('masterActiveInitAction', Communicator.getInstance(this.swaninterface));
                if (!!initParams.preventAppLoad) {
                    return initParams;
                }

                const loadCommonJs = this.appConfig.splitAppJs
                && !this.appConfig.subPackages
                ? 'common.js' : 'app.js';
                return loader
                    .loadjs(`${this.appRootPath}/${loadCommonJs}`, 'masterActiveAppJsLoaded')
                    .then(() => {
                        return this.loadJs.call(this, initParams);
                    });
            })
            .then(initParams => {
                this.uri = initParams.pageUrl.split('?')[0];
                this.accessUri = initParams.pageUrl;
                this.slaveId = initParams.slaveId;
                // init的事件为客户端处理，确保是在slave加载完成之后，所以可以直接派发
                this.swaninterface.communicator.fireMessage({
                    type: `slaveLoaded${this.slaveId}`,
                    message: {slaveId: this.slaveId}
                });
                return initParams;
            });
    }

    /**
     * 根据app.js拆分标识加载业务逻辑
     *
     * @param {Object} params 加载业务逻辑的参数
     * @return {Promise} 返回初始化之后的Promise流
     */
    loadJs(params) {
        return new Promise(resolve => {
            // 有app.js拆分配置，且没有分包
            if (this.appConfig.splitAppJs && !this.appConfig.subPackages) {
                this.loadFirst(params)
                    .then(() => resolve(params));
            }
            // 首页为分包页，加载该分包的app.js
            else if (!!params.root) {
                loader.loadjs(`${this.appRootPath}/${params.root}/app.js`)
                    .then(() => {
                        // 普通分包情况下自定义组件统计
                        swanEvents('customComponentStatistics');
                        resolve(params);
                    });
            }
            // 首页为正常页面
            else {
                swanEvents('customComponentStatistics');
                resolve(params);
            }
        });
    }

    /**
     * 加载首页业务逻辑, 首屏渲染完成利用之前的通信方式sendLogMessage, 节省一次通信
     *
     * @param {Object} params 加载首屏页面业务逻辑的参数
     * @return {Promise} 返回初始化之后的Promise流
     */
    loadFirst(params) {
        this.loadJsCommunicator
            .onMessage('slaveAttached', event => {
                return +event.slaveId === +this.slaveId
                    && this.loadPages(params);
            }, {once: true});
        const firstPageUri = params.pageUrl.split('?')[0];
        if (splitAppAccessory.tabBarList.length > 0) {
            let pageUriList = splitAppAccessory.tabBarList
                .map(tab => {
                    let pageUri = tab.pagePath.split('?')[0];
                    return pageUri;
                });
            if (pageUriList.indexOf(firstPageUri) < 0) {
                pageUriList.push(firstPageUri);
            }
            return Promise
                .all(pageUriList.map(pageUri => {
                    return loader.loadjs(`${this.appRootPath}/${pageUri}.js`);
                }));
        }
        else {
            return loader.loadjs(`${this.appRootPath}/${firstPageUri}.js`);
        }
    }

    /**
     * 加载其它所有pages业务逻辑
     *
     * @param {Object} params 加载首屏页面业务代码的参数
     */
    loadPages(params) {
        Promise
            .all([
                loader.loadjs(`${this.appRootPath}/pages.js`)
            ])
            .then(() => {
                splitAppAccessory.allJsLoaded = true;
                typeof splitAppAccessory.routeResolve === 'function'
                    && splitAppAccessory.routeResolve();

                // 拆appjs情况下自定义组件统计
                swanEvents('customComponentStatistics');
            });
    }

    /**
     * 入栈之后的生命周期方法
     *
     * @return {Object} 入栈之后，创建的本slave的页面实例对象
     */
    onEnqueue() {
        return this.createPageInstance();
    }

    /**
     * 页面打开逻辑open分支判断
     *
     * @param {Object} navigationParams 配置项
     * @return {Object} 打开页面以后返回对象
     */
    open(navigationParams) {
        return new Promise(resolve => {
                if (splitAppAccessory.allJsLoaded) {
                    resolve();
                }
                else {
                    splitAppAccessory.routeResolve = resolve;
                }
            })
            .then(() => this.openPage(navigationParams));
    }

    /**
     * 页面真正打开的执行逻辑
     *
     * @param {Object} navigationParams - 打开页面参数
     * @return {Object} 打开页面以后返回对象
     */
    openPage(navigationParams) {
        this.status = STATUS_MAP.CREATING;
        navigationParams.startTime = Date.now();
        return new Promise((resolve, reject) => {
                this.swaninterface.invoke('navigateTo', {
                    ...navigationParams,
                    ...{
                        success: res => {
                            executeWithTryCatch(
                                navigationParams.success,
                                null,
                                'success api execute error'
                            );
                            resolve(res);
                        },
                        fail: res => {
                            executeWithTryCatch(
                                navigationParams.fail,
                                null,
                                'fail api execute error'
                            );
                            reject(res);
                        },
                        complete: res => {
                            executeWithTryCatch(
                                navigationParams.complete,
                                null,
                                'complete api execute error'
                            );
                        }
                    }
                });
            })
            .then(res => {
                if (res.root) {
                    return loader
                        .loadjs(`${this.appRootPath}/${res.root}/app.js`)
                        .then(() => res);
                }
                return res;
            })
            .then(res => {
                this.slaveId = res.wvID;
                return res;
            });
    }

    /**
     * 页面打开逻辑redirect分支判断
     *
     * @param {Object} navigationParams - 打开页面参数
     * @return {Object} 打开页面以后返回对象
     */
    redirect(navigationParams) {
        return new Promise(resolve => {
                if (splitAppAccessory.allJsLoaded) {
                    resolve();
                }
                else {
                    splitAppAccessory.routeResolve = resolve;
                }
            })
            .then(() => {
                return this.redirectToPage(navigationParams);
            });
    }

    /**
     * 真正执行页面redirect打开的执行逻辑
     *
     * @param {Object} navigationParams - 打开页面参数
     * @return {Object} 打开页面以后返回对象
     */
    redirectToPage(navigationParams) {
        this.close();
        navigationParams.startTime = Date.now();
        return new Promise((resolve, reject) => {
                this.swaninterface.invoke('redirectTo', {
                    ...navigationParams,
                    ...{
                        success: res => {
                            executeWithTryCatch(
                                navigationParams.success,
                                null,
                                'success api execute error'
                            );
                            resolve(res);
                        },
                        fail: res => {
                            executeWithTryCatch(
                                navigationParams.fail,
                                null,
                                'fail api execute error'
                            );
                            reject(res);
                        },
                        complete: res => {
                            executeWithTryCatch(
                                navigationParams.complete,
                                null,
                                'complete api execute error'
                            );
                        }
                    }
                });
            })
            .then(res => {
                if (res.root) {
                    return loader
                        .loadjs(`${this.appRootPath}/${res.root}/app.js`)
                        .then(() => res);
                }
                return res;
            })
            .then(res => {
                this.uri = navigationParams.url.split('?')[0];
                this.accessUri = navigationParams.url;
                this.slaveId = res.wvID;
                this.status = STATUS_MAP.CREATING;
                this.createPageInstance();
                return res;
            });
    }

    /**
     * 创建页面实例，并且，当slave加载完成之后，向slave传递初始化data
     *
     * @return {Promise} 创建完成的事件流
     */
    createPageInstance() {
        if (this.isCreated()) {
            return Promise.resolve();
        }
        swanEvents('masterActiveCreatePageFlowStart', {
            uri: this.uri
        });
        const userPageInstance = createPageInstance(this.accessUri, this.slaveId, this.appConfig);
        const query = userPageInstance.privateProperties.accessUri.split('?')[1];
        this.setUserPageInstance(userPageInstance);

        try {
            swanEvents('masterPageOnLoadHookStart');
            userPageInstance._onLoad(getParams(query));
            swanEvents('masterPageOnLoadHookEnd');
        }
        catch (e) {
            // avoid empty state
        }
        this.status = STATUS_MAP.CREATED;
        return this.swaninterface.invoke('loadJs', {
            uri: this.uri,
            eventObj: {
                wvID: this.slaveId
            },
            success: () => {
                swanEvents('masterActiveCreatePageFlowEnd');
                swanEvents('masterActiveSendInitdataStart');
                userPageInstance.privateMethod
                    .sendInitData.call(userPageInstance, this.appConfig);
                swanEvents('masterActiveSendInitdataEnd');
            }
        });
    }

    switchTab(params) {
        params.startTime = Date.now();
        return this.swaninterface.swan.reLaunch({
                ...params,
                url: '/' + params.url
            });
    }

    /**
     * 析构方法
     *
     * @return {Object} 当前slave的操作实例
     */
    close() {
        try {
            this.userPageInstance._onUnload();
        }
        catch (e) {
            // avoid empty state
        }
        this.status = STATUS_MAP.CLOSED;
        return this;
    }
}
