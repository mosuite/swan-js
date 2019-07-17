/**
 * @file swan-core test for navigator index
 * @author lvlei(lvlei03@baidu.com)
 */

import {Navigator} from '../../../../src/master/navigator';
import {swaninterface} from '../../../mock/swan-api';
import {deleteObjItems, randomNum, type, appRootPath} from '../../../utils';
import EventsEmitter from '../../../../src/utils/events-emitter';

const slaveId = randomNum();

const pageLifeCycleEventEmitter = new EventsEmitter();

describe('navigator', () => {
    const currentContext = {
        getApp() {},
        appInfo: {},
        masterManager: {
            pageLifeCycleEventEmitter
        }
    };

    const navigator = new Navigator(swaninterface, currentContext);

    it('should Navigator be a class', done => {
        expect(Navigator).toEqual(jasmine.any(Function));
        expect(navigator).toEqual(jasmine.any(Object));
        done();
    });

    it('can set app config after setAppConfig be called', done => {
        const newAppConfig = {
            belongs: 'setConfig',
            pages: [
                '/test/navigator/index'
            ],
            subPackages: [{
                root: '/test',
                pages: [
                    'page2'
                ]
            }],
            appRootPath
        };

        navigator.setAppConfig(newAppConfig);

        expect(navigator.appConfig.belongs).toEqual(newAppConfig.belongs);
        done();
    });

    describe('pushInitSlave', () => {
        let cacheListenRoute, cacheCreateInitSlave;

        beforeEach(() => {
            cacheListenRoute = navigator.listenRoute;
            cacheCreateInitSlave = navigator.createInitSlave;
        });

        afterEach(() => {
            navigator.listenRoute = cacheListenRoute;
            navigator.createInitSlave = cacheCreateInitSlave;
        });

        it('should call some method correctly after pushInitSlave be called with subPackages', done => {
            let listenRouteStatus = 0;
            navigator.listenRoute = () => {
                listenRouteStatus++;
            };

            let createInitSlaveCbParams = null;
            navigator.createInitSlave = (pageUrl, appConfig) => {
                createInitSlaveCbParams = {
                    pageUrl,
                    appConfig
                };
                return {
                    init(initParams) {
                        return Promise.resolve(initParams);
                    },
                    onEnqueue() {}
                };
            };

            navigator.setAppConfig({
                belongs: 'pushInitSlave',
                splitAppJs: true,
                subPackages: []
            });
            const initParams = {
                pageUrl: '/test/pushInitSlave'
            };
            navigator.pushInitSlave(initParams);

            setTimeout(() => {
                expect(listenRouteStatus).toEqual(2);
                expect(createInitSlaveCbParams.pageUrl).toEqual(initParams.pageUrl);
                expect(createInitSlaveCbParams.appConfig.belongs).toEqual('pushInitSlave');
                done();
            }, 0);

        });
    });

    describe('handleNavigatorError', () => {

        it('should call _onPageNotFound correctly after handleNavigatorError be called and the appInfo existed', done => {
            let status = 0;
            navigator.context.getApp = () => {
                return {
                    _onPageNotFound() {
                        status++;
                    }
                };
            };
    
            navigator.handleNavigatorError({
                query: 'from=swan'
            });
    
            expect(status).toEqual(1);
            done();
        });

        it('should call _onPageNotFound correctly after handleNavigatorError be called and the appInfo does not exist', done => {
            const cacheAppInfo = navigator.context.appInfo;

            navigator.context.appInfo = undefined;

            let status = 0;
            navigator.context.getApp = () => {
                return {
                    _onPageNotFound() {
                        status++;
                    }
                };
            };
    
            navigator.handleNavigatorError({
                query: 'from=swan'
            });
    
            expect(status).toEqual(1);

            navigator.context.appInfo = cacheAppInfo;
            done();
        });
    
    });

    describe('preCheckPageExist', () => {

        it('should preCheckPageExist be a function', done => {
            expect(navigator.preCheckPageExist).toEqual(jasmine.any(Function));
            done();
        });

        it('should return true while url existed', done => {
            navigator.appConfig = {
                pages: ['test/preCheckPageExist']
            };

            const url = 'test/preCheckPageExist';
            const res = navigator.preCheckPageExist(url);

            expect(res).toEqual(true);
            done();
        });

        it('should return true while pageUrl does not exist in pages but pagesQueues', done => {
            window.masterManager.pagesQueue['/test/queuesOnePage'] = {};

            const navigatorURL = '/test/queuesOnePage';
            const res = navigator.preCheckPageExist(navigatorURL);

            expect(res).toEqual(true);

            deleteObjItems(window.masterManager.pagesQueue, '/test/queuesOnePage');
            done();
        });

        it('should return true while subPackages inlcudes the pageUrl', done => {
            navigator.appConfig.subPackages = [{
                root: '/root',
                pages: ['test/subPackage']
            }];
            const navigatorURL = '/root/test/subPackage';
            const res = navigator.preCheckPageExist(navigatorURL);

            expect(res).toEqual(true);
            done();
        });

        it('should call handleNavigatorError and return fasle while the navigation url does not exist', done => {
            const cacheHandleNavigatorError = navigator.handleNavigatorError;
            let handleNavigatorErrorStatus = 0;
            navigator.handleNavigatorError = () => {
                handleNavigatorErrorStatus++;
            }
            const navigatorURL = '/test/isNotExist';
            const res = navigator.preCheckPageExist(navigatorURL);

            expect(res).toEqual(false);
            expect(handleNavigatorErrorStatus).toEqual(1);

            navigator.handleNavigatorError = cacheHandleNavigatorError;
            done();
        });
    });

    describe('navigateTo test', () => {

        const navigateTo = navigator.navigateTo;

        it('should navigateTo be a function', done => {
            expect(navigateTo).toEqual(jasmine.any(Function));
            done();
        });

        it('should get new slave info while navigatTo be called', done => {
            const cacheResolvePathByTopSlave = navigator.resolvePathByTopSlave;
            const cachePreCheckPageExist = navigator.preCheckPageExist;

            navigator.resolvePathByTopSlave = url => url;
            navigator.preCheckPageExist = () => true;

            const params = {
                url: 'test/navigator/navigateTo',
                slaveId,
                wvID: '88'
            };
            const navigateToRes = navigateTo.call(navigator, params);

            expect(type(navigateToRes)).toEqual('Promise');
            navigateToRes.then(res => {
                expect(res.url).toEqual(params.url);
                expect(res.slaveId).toEqual(params.slaveId);
                expect(res.wvID).toEqual(params.wvID);
            });

            navigator.resolvePathByTopSlave = cacheResolvePathByTopSlave;
            navigator.preCheckPageExist = cachePreCheckPageExist;
            done();
        });
    });

    describe('redirectTo', () => {

        it('should redirectTo be a function', done => {
            expect(navigator.redirectTo).toEqual(jasmine.any(Function));
            done();
        });

        it('should call slave redirectTo method after navigator.redirectTo be called', done => {
            const cacheResolvePathByTopSlave = navigator.resolvePathByTopSlave;
            const cachePreCheckPageExist = navigator.preCheckPageExist;

            navigator.resolvePathByTopSlave = url => url;
            navigator.preCheckPageExist = () => true;

            navigator.history.historyStack = [{
                isClosing: false,
                redirect(params) {
                    return Promise.resolve(params);
                }
            }];

            const params = {
                url: 'test/navigator/redirectTo',
                slaveId,
                wvId: `wv_${slaveId}`
            };
            const redirectToRes = navigator.redirectTo(params);

            expect(type(redirectToRes)).toEqual('Promise');
            redirectToRes.then(res => {
                expect(res.url).toEqual(params.url);
                expect(res.slaveId).toEqual(params.slaveId);
                expect(res.wvId).toEqual(params.wvId);
            });
            
            navigator.resolvePathByTopSlave = cacheResolvePathByTopSlave;
            navigator.preCheckPageExist = cachePreCheckPageExist;
            done();
        });
    });

    describe('navigateBack', () => {

        let cacheResolvePathByTopSlave;
        beforeAll(() => {
            cacheResolvePathByTopSlave = navigator.resolvePathByTopSlave;
            navigator.resolvePathByTopSlave = url => url;
        });

        afterAll(() => {
            navigator.resolvePathByTopSlave = cacheResolvePathByTopSlave;
        });

        it('should navigateBack be a function', done => {
            expect(navigator.navigateBack).toEqual(jasmine.any(Function));
            done();
        });

        it('should be resolved when invoke navigateBack correctly', done => {
            navigator.history.getTopSlaves = () => {
                return [{
                    isClosing: true,
                    show() {}
                }];
            };

            const params = {
                url: '/test/navigator/navigateBack',
                slaveId,
                wvId: `wv_${slaveId}`

            };
            const navigateBackRes = navigator.navigateBack(params);

            expect(type(navigateBackRes)).toEqual('Promise');

            const expectIsClosing = false;
            navigateBackRes.then(res => {
                expect(res).toEqual(expectIsClosing);
            });

            done();
        });

        it('should be caught when invoke navigateBack error', done => {
            const navigateBackRes = navigator.navigateBack({
                url: '/test/navigator/index',
                slaveId,
                wvId: `wv_${slaveId}`,
                thenable: true
            });

            const expectIsClosing = false;
            navigateBackRes.then(res => {
                expect(res).toEqual(expectIsClosing);
            });

            done();
        });
    });

    describe('switchTab', () => {

        it('should switchTab be a function', done => {
            expect(navigator.switchTab).toEqual(jasmine.any(Function));
            done();
        });

        it('should call history popTo method after switchTab be called', done => {
            const cacheResolvePathByTopSlave = navigator.resolvePathByTopSlave;
            navigator.resolvePathByTopSlave = url => url;

            Object.defineProperties(navigator.initSlave, {
                switchTab: {
                    value: params => Promise.resolve(params)
                },
                getSlaveId: {
                    value: () => {}
                }
            });

            let popToCbStatus = 0;
            navigator.history.popTo = () => {
                popToCbStatus++;
            }

            const switchTabParams = {
                url: '/test/navigator/switchTab',
                slaveId,
                wvId: `wv_${slaveId}`
            };
            const cacheSwitchTabParams = {...switchTabParams};
            const switchTabRes = navigator.switchTab.call(navigator, switchTabParams);

            expect(type(switchTabRes)).toEqual('Promise');
            switchTabRes.then(res => {
                for (const key in res) {
                    expect(res[key]).toEqual(cacheSwitchTabParams[key]);
                }

                expect(popToCbStatus).toEqual(1);
            });

            navigator.resolvePathByTopSlave = cacheResolvePathByTopSlave;
            done();
        });
    });

    describe('reLaunch', () => {
        let onEnqueueCbStatus = 0;
        let cacheResolvePathByTopSlave;

        beforeAll(() => {
            navigator.history.getCurrentSlaveId = () => {}
            navigator.history.seek = () => {
                return {
                    reLaunch(params) {
                        return Promise.resolve(params);
                    },
                    getOnloadToShowStatus() {
                        return false;
                    },
                    onEnqueue() {
                        onEnqueueCbStatus++;
                    }
                };
            };

            cacheResolvePathByTopSlave = navigator.resolvePathByTopSlave;
            navigator.resolvePathByTopSlave = url => url;
        });

        afterAll(() => {
            navigator.resolvePathByTopSlave = cacheResolvePathByTopSlave;
        });

        it('should reLaunch be a function', done => {
            expect(navigator.reLaunch).toEqual(jasmine.any(Function));
            done();
        });

        it('should relaunch page after reLaunch be called with params has not url', done => {
            navigator.history.getTopSlaves = () => {
                return [{
                    getUri() {
                        return 'test/frontUri';
                    },
                    getFrontUri() {
                        return 'test/frontUri';
                    },
                    show() {}
                }];
            };

            const params = {
                slaveId,
                wvID: `wv_${slaveId}`
            };
            const reLaunchRes = navigator.reLaunch.call(navigator, params);

            expect(type(reLaunchRes)).toEqual('Promise');
            reLaunchRes.then(res => {
                expect(onEnqueueCbStatus).toEqual(1);
                expect(res.slaveId).toEqual(params.slaveId);
                expect(res.wvID).toEqual(params.wvID);
                expect(res.url).toEqual('test/frontUri');
            });
            done();
        });

        it('should relaunch page after reLaunch be called and params contains url ', done => {
            const params = {
                slaveId,
                wvID: `wv_${slaveId}`,
                url: 'test/reLaunch'
            };
            const reLaunchRes = navigator.reLaunch.call(navigator, params);

            expect(type(reLaunchRes)).toEqual('Promise');
            reLaunchRes.then(res => {
                expect(onEnqueueCbStatus).toEqual(2);
                expect(res.slaveId).toEqual(params.slaveId);
                expect(res.wvID).toEqual(params.wvID);
                expect(res.url).toEqual(params.url);
            });
            done();
        });
    });

    // [预留开始] slave中预留的方法
    describe('listenRoute', () => {
        it('should listenRoute be a function and never return', done => {
            const res = navigator.listenRoute.call(navigator);
            expect(navigator.listenRoute).toEqual(jasmine.any(Function));
            expect(navigator.hasListenRoute).toEqual(true);
            expect(res).toBeUndefined();
            done();
        });
    });

    describe('listenRoute only once', () => {
        it('should listenRoute only once', done => {
            const res = navigator.listenRoute.call(navigator);
            expect(res).toBeUndefined();
            expect(navigator.hasListenRoute).toEqual(true);
            done();
        });
    });

    describe('oninit', () => {
        it('should oninit be a function and never return', done => {
            const res = navigator.oninit();
            expect(navigator.oninit).toEqual(jasmine.any(Function));
            expect(res).toBeUndefined();
            done();
        });
    });

    describe('onnavigateTo test', () => {
        it('should onnavigateTo be a function and never return', done => {
            const res = navigator.onnavigateTo();
            expect(navigator.onnavigateTo).toEqual(jasmine.any(Function));
            expect(res).toBeUndefined();
            done();
        });
    });

    describe('onredirectTo test', () => {
        it('should onredirectTo be a function and never return', done => {
            const res = navigator.onredirectTo();
            expect(navigator.onredirectTo).toEqual(jasmine.any(Function));
            expect(res).toBeUndefined();
            done();
        });
    });

    describe('onreLaunch test', () => {
        it('should onreLaunch be a function and never return', done => {
            const res = navigator.onreLaunch();
            expect(navigator.onreLaunch).toEqual(jasmine.any(Function));
            expect(res).toBeUndefined();
            done();
        });
    });
    // [预留结束]

    it('should onnavigateBack be a function and call popTo correctly after onnavigateBack be called', done => {
        expect(navigator.onnavigateBack).toEqual(jasmine.any(Function));

        let popToCbStatus = 0;
        navigator.history.popTo = () => {
            popToCbStatus++;
        }
        
        navigator.onnavigateBack('111', '222');

        expect(popToCbStatus).toEqual(1);
        done();
    });

    describe('onswitchTab', () => {

        it('should onswitchTab be a function', done => {
            expect(navigator.onswitchTab).toEqual(jasmine.any(Function));
            done();
        });

        it('should emit onTabItemTap event after navigator.onswitchTab be called', done => {
            let onswitchTabStatus = 0;
            const pageLifeCycleEventEmitter = navigator.context.masterManager.pageLifeCycleEventEmitter;
            pageLifeCycleEventEmitter.onMessage('onTabItemTap', () => {
                onswitchTabStatus++;
                expect(onswitchTabStatus).toEqual(1);
            });
            navigator.initSlave = {
                onswitchTab() {
                    return Promise.resolve();
                }
            };

            const res = navigator.onswitchTab(0, slaveId, '/test/frontUri', 1);

            expect(res).toBeUndefined();
            done();
        });
    });

    describe('resolvePathByTopSlave', () => {

        it('should start char / be replaced and return path when the path is absolute', done => {
            const path = '/test/resolvePathByTopSlave';
            const res = navigator.resolvePathByTopSlave(path);

            expect(res).toEqual('test/resolvePathByTopSlave');
            done();
        });

        it('should return path when the path is not absolute', done => {
            navigator.history.getTopSlaves = () => {
                return [{
                    getUri() {
                        return 'root';
                    }
                }];
            }
            const path = 'test/resolvePathByTopSlave';
            const res = navigator.resolvePathByTopSlave(path);

            expect(res).toEqual('test/resolvePathByTopSlave');
            done();
        });
    });

    it('should slave be recreated while the slave does not exist', done => {
        const cacheCreateInitSlave = navigator.createInitSlave;


        navigator.history.seek = () => false;
        navigator.appConfig = {
            from: 'getSlaveEnsure'
        };
        navigator.createInitSlave = (url, appConfig) => {
            return {
                url,
                appConfig
            };
        }

        const targetSlave = navigator.getSlaveEnsure('test/getSlaveEnsure', 'topSlave');

        expect(targetSlave.url).toEqual('test/getSlaveEnsure');
        expect(targetSlave.appConfig.from).toEqual('getSlaveEnsure');

        navigator.createInitSlave = cacheCreateInitSlave;
        done();
    })

    describe('createInitSlave', () => {

        it('can create tabSlave after createInitSlave be called with appConfig includes tabBarList;', done => {
            const initUri = '/test/uri1';
            const appConfig = {
                tabBar: {
                    list: [{
                        pagePath: '/test/uri1'
                    }, {
                        pagePath: '/test/uri2'
                    }]
                }
            };
            const res = navigator.createInitSlave(initUri, appConfig);

            expect(res.list.length).toEqual(2);
            expect(res.currentIndex).toEqual(0);
            expect(res.list[0].pagePath).toEqual('/test/uri1');
            done();
        });

        it('can create single slave after createInitSlave be called with appConfig never includes tabBarList;', done => {
            const initUri = '/test/uri1';
            const appConfig = {};
            const res = navigator.createInitSlave(initUri, appConfig);

            expect(res.list).toBeUndefined();
            expect(res.uri).toEqual(initUri);
            expect(res.accessUri).toEqual(initUri);
            done();
        });
    });

    it('should reset allJsLoaded to fasle after pushInitSlave be called without subPackages', done => {
        let listenRouteStatus = 0;
        navigator.listenRoute = () => {
            listenRouteStatus++;
        }

        let createInitSlaveCbParams = null;
        navigator.createInitSlave = (pageUrl, appConfig) => {
            createInitSlaveCbParams = {
                pageUrl,
                appConfig
            };
            return {
                init(initParams) {
                    return Promise.resolve(initParams);
                },
                onEnqueue() {}
            }
        }

        navigator.setAppConfig({
            belongs: 'pushInitSlave',
            splitAppJs: true
        });
        const initParams = {
            pageUrl: '/test/pushInitSlave'
        };
        navigator.pushInitSlave(initParams);

        expect(listenRouteStatus).toEqual(1);
        expect(createInitSlaveCbParams.pageUrl).toEqual(initParams.pageUrl);
        expect(createInitSlaveCbParams.appConfig.belongs).toEqual('pushInitSlave');
        done();
    });
});
