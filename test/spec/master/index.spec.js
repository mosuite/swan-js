/**
 * @file swan-core test for master index
 * @author lvlei(lvlei03@baidu.com)
 */

import Master from '../../../src/master/index.js';
import {swan, swaninterface} from '../../mock/swan-api';
import {swanComponents} from '../../mock/swan-components';
import {dispatchEvent} from '../../mock/swan-na';
import {randomNum, appRootPath, getEnvVariables} from '../../utils';

describe('master enter', () => {

    const master = new Master(window, swaninterface, swanComponents);

    describe('open source debug test', () => {

        beforeAll(() => {
            window._envVariables = {
                sdkExtension: appRootPath,
                isDebugSdk: true,
                ctsJsAddress: {
                    master: ['str'],
                    slave: []
                },
                host: 'host',
                port: 8888,
                udid: 'udid'
            };
        });

        describe('listenFirstRender', () => {
            it('should reset firstRenderEnd to true while it be called again', done => {
                const res = master.listenFirstRender();
                expect(res).toBeUndefined();
                done();
            });
        });

        it('can openSourceDebugger decorate swan and _openSourceDebugInfo while the SDK is debug', done => {
            master.openSourceDebugger();

            const {
                host,
                port,
                udid
            } = window._openSourceDebugInfo;

            expect(host).toEqual(_envVariables.host);
            expect(port).toEqual(_envVariables.port);
            expect(udid).toEqual(_envVariables.udid);
            done();
        });

        it('should be caught while the ctsAddr is not a string', done => {
            // while ctsAddr type error
            window._envVariables.ctsJsAddress.master = [1];
            const res = master.openSourceDebugger();

            expect(res).toEqual(false);
            done();
        });
    });

    describe('preLoadSubPackage', () => {
        let cacheParsedAppConfig = window.parsedAppConfig;
        let cacheGetNetworkType = window.swan.getNetworkType;
        let cacheLoadSubPackage = window.swan.loadSubPackage;

        beforeAll(() => {
            cacheParsedAppConfig = window.parsedAppConfig;
            cacheGetNetworkType = window.swan.getNetworkType;
            cacheLoadSubPackage = window.swan.loadSubPackage;
            window.parsedAppConfig = undefined;
            window.swan.getNetworkType = undefined;
            window.swan.loadSubPackage = undefined;
        });

        afterAll(() => {
            // 扩充的能力回收, 以免影响到其它单测
            window.parsedAppConfig = cacheParsedAppConfig;
            window.swan.getNetworkType = cacheGetNetworkType;
            window.swan.loadSubPackage = cacheLoadSubPackage;
        });

        it('should be return when preloadRule does not exist', done => {
            window.parsedAppConfig = {};
            const res = master.preLoadSubPackage();

            expect(res).toBeUndefined();
            done();
        });

        it('should be return when subPackages does not exist', done => {
            window.parsedAppConfig = {
                preloadRule: {}
            };
            const res = master.preLoadSubPackage();

            expect(res).toBeUndefined();
            done();
        });

        it('should be return when preloadRule is not a object', done => {
            window.parsedAppConfig = {
                preloadRule: "is not a object"
            };
            const res = master.preLoadSubPackage();
            expect(res).toBeUndefined();
            done();
        });

        it('should be return when subPackages is not instanceof Array', done => {
            window.parsedAppConfig = {
                preloadRule: {},
                subPackages: "is not instanceof Array"
            };
            const res = master.preLoadSubPackage();

            expect(res).toBeUndefined();
            done();
        });

        it('should return undefined when preloadRule has one value that type is not a array', done => {
            window.parsedAppConfig = {
                preloadRule: {
                    "key": "is not a array"
                },
                subPackages: [{
                    "root": "mockroot"
                }]
            };

            window.swan.getNetworkType = swan.getNetworkTypeMaker('4G');
            const res = master.preLoadSubPackage();

            expect(res).toBeUndefined();
            done();
        });

        it('should return undefined when appeal all params are right', done => {
            window.parsedAppConfig = {
                preloadRule: {
                    key: {
                        packages: ["mockroot"],
                        network: "all"
                    }
                },
                subPackages: [{
                    root: "mockroot"
                }]
            };
            window.swan.getNetworkType = swan.getNetworkTypeMaker('4G');
            window.swan.loadSubPackage = swan.loadSubPackage;

            const res = master.preLoadSubPackage();

            expect(res).toBeUndefined();
            done();
        });
    });

    /**
     * 检测方法/对象正确被装饰到全局对象上
     */
    describe('decorateContext context', () => {
        const {
            masterManager,
            define,
            require,
            swaninterface,
            swan,
            getCurrentPages,
            global,
            Page,
            App,
            getApp,
            Component,
            Behavior
        } = window;

        const decorateContext = master.decorateContext;

        it('should decorateContext be a function and its response is an object', done => {
            expect(decorateContext).toEqual(jasmine.any(Function));

            const res = decorateContext.call(master, {});
            expect(res).toEqual(jasmine.any(Object));
            done();
        });

        // 以下检测挂载情况
        it('should masterManager be an object', done => {
            expect(masterManager).toEqual(jasmine.any(Object));
            done();
        });

        it('should define be a function', done => {
            expect(define).toEqual(jasmine.any(Function));
            done();
        });

        it('should require be a function', done => {
            expect(require).toEqual(jasmine.any(Function));
            done();
        });

        it('should swaninterface be an object', done => {
            expect(swaninterface).toEqual(jasmine.any(Object));
            done();
        });

        it('should swan be an object', done => {
            expect(swan).toEqual(jasmine.any(Object));
            done();
        });

        it('should getCurrentPages be a function', done => {
            expect(getCurrentPages).toEqual(jasmine.any(Function));
            done();
        });

        it('should global be an object', done => {
            expect(global).toEqual(jasmine.any(Object));
            done();
        });

        it('should Page be a function', done => {
            expect(Page).toEqual(jasmine.any(Function));
            done();
        });

        it('should App be a function', done => {
            expect(App).toEqual(jasmine.any(Function));
            done();
        });

        it('should getApp be a function', done => {
            expect(getApp).toEqual(jasmine.any(Function));
            done();
        });

        it('should Component be a function', done => {
            expect(Component).toEqual(jasmine.any(Function));
            done();
        });

        it('should Behavior be a function', done => {
            expect(Behavior).toEqual(jasmine.any(Function));
            done();
        });
    });

    it('masterManager test', done => {

        expect(window.masterManager).toEqual(jasmine.any(Object));

        const {
            appLifeCycleEventEmitter,
            communicator,
            context,
            lifeCycleEventEmitter,
            navigator,
            pageLifeCycleEventEmitter,
            pagesQueue,
            perfAudit,
            swanComponents,
            swanEventsCommunicator,
            swaninterface,
            virtualComponentFactory
        } = window.masterManager;

        expect(appLifeCycleEventEmitter).toEqual(jasmine.any(Object));
        expect(communicator).toEqual(jasmine.any(Object));
        expect(context).toEqual(jasmine.any(Object));
        expect(lifeCycleEventEmitter).toEqual(jasmine.any(Object));
        expect(navigator).toEqual(jasmine.any(Object));
        expect(pageLifeCycleEventEmitter).toEqual(jasmine.any(Object));
        expect(pagesQueue).toEqual(jasmine.any(Object));
        expect(perfAudit).toEqual(jasmine.any(Object));
        expect(swanComponents).toEqual(jasmine.any(Object));
        expect(swanEventsCommunicator).toEqual(jasmine.any(Object));
        expect(swaninterface).toEqual(jasmine.any(Object));
        expect(virtualComponentFactory).toEqual(jasmine.any(Object));
        done();
    });

    describe('dispatch js advanced', () => {
        beforeAll(function () {
            master.dispatchJSPromise = Promise.resolve();
        });

        it('should start load files in initRender immediately', done => {
            let setAppConfigParams;
            let pushInitSlaveParams;
            let isTriggerImmediately = false;
            master.navigator = {
                appConfig: {
                    prefetches: ''
                },
                setAppConfig(params) {
                    setAppConfigParams = params;
                },
                pushInitSlave(params) {
                    pushInitSlaveParams = params;
                    return Promise.reject();
                },
                pushInitSlaveToHistory() {
                    isTriggerImmediately = true;
                },
                startLoadAppFiles() {
                }
            };

            const initEvent = {
                belongs: 'initRender',
                appConfig: `{
                    "from": "initRender"
                }`,
                appPath: '/appPath',
                pageUrl: '/test/initRender'
            };
            master.initEvent = initEvent;
            master.appPath = initEvent.appPath;
            master.initRender(initEvent);
            setTimeout(() => {
                expect(isTriggerImmediately).toEqual(true);
                done();
            }, 0);
        });
        afterAll(function () {
            master.dispatchJSPromise = null;
        });
    });

    describe('initRender', () => {

        it('should return undefuned after the initRender be called', done => {
            let setAppConfigParams;
            let pushInitSlaveParams;
            master.navigator = {
                appConfig: {
                    prefetches: ''
                },
                setAppConfig(params) {
                    setAppConfigParams = params;
                },
                pushInitSlave(params) {
                    pushInitSlaveParams = params;
                    return Promise.reject();
                }
            };

            const initEvent = {
                belongs: 'initRender',
                appConfig: `{
                    "from": "initRender"
                }`,
                appPath: '/appPath',
                pageUrl: '/test/initRender'
            };

            master.initRender(initEvent);

            expect(setAppConfigParams.appRootPath).toEqual(initEvent.appPath);
            expect(master.appPath).toEqual(initEvent.appPath);
            expect(pushInitSlaveParams.pageUrl).toEqual(initEvent.pageUrl);
            done();
        });
    });

    it('should return a correct decorated path after getPathFromFront be called', done => {
        master.navigator.history = {
            getTopSlaves() {
                return [{
                    getFrontUri() {
                        return '/frontUri';
                    }
                }];
            }
        }
        const path = '/fromFrontPath';
        const outPath = master.getPathFromFront(path);

        expect(outPath).toEqual(`/appPath${path}`);
        done();
    });

    it('should get some app methods after getApppMethods be called', done => {
        const appMethods = master.getAppMethods();

        expect(appMethods).toEqual(jasmine.any(Object));

        const {
            App,
            getApp
        } = appMethods;

        expect(App).toEqual(jasmine.any(Function));
        expect(getApp).toEqual(jasmine.any(Function));
        done();
    });

    describe('decorateSwan', () => {

        beforeAll(() => {
            Object.assign(master.navigator, {
                navigateTo() {},
                navigateBack() {},
                redirectTo() {},
                switchTab() {},
                reLaunch() {}
            });
        });

        it('should return an object after decorateSwan be called', done => {
            const originSwan = {};
            const decoratedSwan = master.decorateSwan.call(master, originSwan);

            expect(decoratedSwan).toEqual(jasmine.any(Object));
            done();
        });

        it('should decorated swan correctly after decorateSwan be called', done => {
            const originSwan = {
                say() {}
            };

            const decoratedSwan = master.decorateSwan.call(master, originSwan);

            const {
                say,
                navigateTo,
                navigateBack,
                redirectTo,
                switchTab,
                reLaunch,
                reportAnalytics,
                openShare,
                login,
                onUserCaptureScreen,
                nextTick,
                setPageInfo
            } = decoratedSwan;

            // 只要检测到挂上swan就算成功，具体功能测试其他模块做
            [
                say,
                navigateTo,
                navigateBack,
                redirectTo,
                switchTab,
                reLaunch,
                reportAnalytics,
                openShare,
                login,
                onUserCaptureScreen,
                nextTick,
                setPageInfo
            ].forEach(item => {
                expect(item).toBeDefined();
            });
            done();
        });
    });

    describe('bindLifeCycleEvents', () => {
        const event = {
            show() {},
            hide() {},
            pageNotFound() {}
        };

        beforeAll(() => {
            spyOn(event, 'show');
            spyOn(event, 'hide');
            spyOn(event, 'pageNotFound');
        });

        it('should emit one event after bindLifeCycleEvents be called and received lifecycle event', done => {
            const wvID = randomNum();

            master.bindLifeCycleEvents();
            master.lifeCycleEventEmitter.onMessage('onPageNotFound', () => {
                event.pageNotFound('hello');
            });

            dispatchEvent(document, 'lifecycle', {
                lcType: 'onPageNotFound',
                wvID
            });

            expect(event.pageNotFound).toHaveBeenCalledWith('hello');
            done();
        });

        it('should emit one event after bindLifeCycleEvents be called and received lifecycle event', done => {
            const wvID = randomNum();

            master.bindLifeCycleEvents();
            master.lifeCycleEventEmitter.onMessage('onAppHide', () => {
                event.hide('onHide');
            });

            dispatchEvent(document, 'lifecycle', {
                lcType: 'onAppHide',
                wvID
            });

            expect(event.hide).toHaveBeenCalledWith('onHide');
            done();
        });

        it('should emit one event after bindLifeCycleEvents be called and emit onAppShow event two times', done => {
            const wvID = randomNum();
            let onShowParams;

            master.bindLifeCycleEvents();
            master.lifeCycleEventEmitter.onMessage(`onShow${wvID}`, e => {
                onShowParams = e;
            });

            dispatchEvent(document, 'lifecycle', {
                lcType: 'onShow',
                wvID
            });

            expect(onShowParams.type).toEqual(`onShow${wvID}`);
            expect(onShowParams.event.wvID).toEqual(wvID);
            done();
        });
    });

    it('should call adaptMaster after adaptEnvironment be called', done => {
        const cacheMethod = master.swaninterface.adaptMaster;

        let adaptMasterStatus = 0;
        master.swaninterface.adaptMaster = () => {
            adaptMasterStatus++;
        };

        master.adaptEnvironment();

        expect(adaptMasterStatus).toEqual(1);

        master.swaninterface.adaptMaster = cacheMethod;
        done();
    });

    describe('handleError', () => {
        it('should add myerror to ctx and call _onAppError method while error event is dispatched', done => {
            const cacheMethod = master.addEventListener;
            const cacheGetApp = master.getApp;

            master.addEventListener = (eventName, cb) => {
                cb({
                    errorMsg: 'test-error'
                });
            };

            let errorParams;
            master.getApp = () => {
                return {
                    _onAppError(params) {
                        errorParams = params;
                    }
                }
            };

            master.handleError(master);

            expect(master.myerror.errorMsg).toEqual('test-error');
            expect(errorParams.appInfo).toEqual(jasmine.any(Object));
            expect(errorParams.event.errorMsg).toEqual('test-error');
            expect(errorParams.type).toEqual('onAppError');

            window.addEventListener = cacheMethod;
            window.getApp = cacheGetApp;
            done();
        });
    });

    describe('dispatchJSMaster', () => {
        it('should return a string when devhook is undefined', done => {
            master.navigator.startLoadAppFiles = function () {};

            dispatchEvent(document, 'dispatchJSMaster', {
                root: '',
                appPath: '/mockapppath',
                pageUrl: 'page1',
                wvID: '665',
                appConfig: `{
                    "pages": ["page1"]
                }`
            });
            
            expect(master.context.appConfig).toEqual(jasmine.any(String));
            done();
        });
    });

    describe('AppReady', () => {

        beforeAll(() => {
            window._naSwan = {
                getEnvVariables,
                include() {}
            };
        });
    
        afterEach(() => {
            window.swanGlobal = undefined;
        });
    
        afterAll(() => {
            window._naSwan = undefined;
        });
    
        it('should return a string when devhook is undefined', done => {
            master.navigator.startLoadAppFiles = function () {};
            dispatchEvent(document, 'AppReady', {
                root: '',
                appPath: '/mockapppath',
                pageUrl: 'page1',
                wvID: '665',
                appConfig: `{
                    "pages": ["page1"]
                }`
            });
    
            expect(window.appConfig).toEqual(jasmine.any(String));
            done();
        });
    
        it('should return a string when devhook is true and its enverionment is webview', done => {
            dispatchEvent(document, 'AppReady', {
                root: '',
                appPath: '/mockapppath',
                pageUrl: 'page1',
                devhook: 'true',
                wvID: '666',
                appConfig: `{
                    "pages": ["page1"]
                }`
            });
    
            expect(window.appConfig).toEqual(jasmine.any(String));
            done();
        });
    
        it('should return a string when devhook is true and enverionment is v8', done => {
            window.swanGlobal = true;
    
            dispatchEvent(document, 'AppReady', {
                root: '',
                appPath: '/mockapppath',
                pageUrl: 'page1',
                devhook: 'true',
                wvID: '666',
                appConfig: `{
                    "pages": ["page1"]
                }`
            });
    
            expect(window.appConfig).toEqual(jasmine.any(String));
            done();
        });
    
        it('should showPerformancePanel be expanded to context while performancePanel equals one', done => {
            window._envVariables = {
                abTestSwitch: {
                    swanswitch_performance_panel: 1
                }
            };
    
            dispatchEvent(document, 'AppReady', {
                root: '',
                appPath: '/mockapppath',
                pageUrl: 'page1',
                devhook: 'true',
                wvID: '666',
                appConfig: `{
                    "pages": ["page1"]
                }`,
                showPerformancePanel: 'mockpanel'
            });
    
            expect(window.showPerformancePanel).toEqual('mockpanel');
            done();
        });
    });
});
