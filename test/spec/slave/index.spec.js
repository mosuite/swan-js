/**
 * @file swan-core test for slave
 * @author yangyang(yangyang55@baidu.com)
 */

import Slave from '../../../src/slave/index.js';
import Communicator from '../../../src/utils/communication';
import {
    catchTips,
    appRootPath
} from '../../utils';
import {
    dispatchEvent
} from '../../mock/swan-na';
import {
    swaninterface
} from '../../mock/swan-api';
import {
    swanComponents
} from '../../mock/swan-components';

const slave = new Slave(window, swaninterface, swanComponents);

describe('slave test', function () {
    afterEach(function () {
        slave.userResourceLoaded = false;
        slave.hasSendFMP = false;
    });
    it('slave created', function () {
        expect(typeof slave).toBe('object');
    });
    it('componentFactory created', function () {
        let componentFactory = window.componentFactory;
        expect(typeof componentFactory).toBe('object');
        expect(typeof componentFactory.componentInfos).toBe('object');
    });
    it('pageRender created', function () {
        expect(typeof window.pageRender).toBe('function');
    });

    it('Page and custom create early', done => {
        dispatchEvent(document, 'dispatchJSSlave', {
            devhook: 'false',
            root: null,
            pagePath: 'custest',
            appPath: appRootPath,
            onReachBottomDistance: '50',
            initData: {
                data: 1
            }
        });

        setTimeout(() => {
            let componentFactory = window.componentFactory;
            let custom0 = componentFactory.getComponents('components/custom/custom0');
            let custom2 = componentFactory.getComponents('components/custom/custom2');
            let cl1 = componentFactory.getComponents('components/cl-item/cl-item1');
            expect(typeof custom0).toBe('function');
            expect(typeof custom2).toBe('function');
            expect(typeof cl1).toBe('function');
            done();
        }, 2500);
    });

    it('Page and custom create after advanced dispatch js', done => {
        slave.userResourceLoaded = true;
        dispatchEvent(document, 'PageReady', {
            devHook: 'false',
            root: null,
            pagePath: 'custest',
            appPath: appRootPath,
            onReachBottomDistance: '50',
            initData: {
                data: 1
            }
        });

        setTimeout(() => {
            let componentFactory = window.componentFactory;
            let custom0 = componentFactory.getComponents('components/custom/custom0');
            expect(typeof custom0).toBe('function');
            done();
        }, 2500);
    });

    it('Page and custom create', done => {
        dispatchEvent(document, 'PageReady', {
            devHook: 'false',
            root: null,
            pagePath: 'custest',
            appPath: appRootPath,
            onReachBottomDistance: '50',
            initData: {
                data: 1
            }
        });

        setTimeout(() => {
            let componentFactory = window.componentFactory;
            let custom0 = componentFactory.getComponents('components/custom/custom0');
            let custom2 = componentFactory.getComponents('components/custom/custom2');
            let cl1 = componentFactory.getComponents('components/cl-item/cl-item1');
            expect(typeof custom0).toBe('function');
            expect(typeof custom2).toBe('function');
            expect(typeof cl1).toBe('function');
            done();
        }, 2500);
    });

    it('page initData', done => {
        // 这个点是内核注入的，只能mock;
        let originMethod = slave.swaninterface.boxjs.platform.isAndroid;
        slave.swaninterface.boxjs.platform.isAndroid = function () {
            return true;
        };
        slave.context.performance.timing.domFirstScreenPaint = 1;
        let communicator = Communicator.getInstance(swaninterface);
        communicator.fireMessage({
            type: 'initData',
            path: 'initData',
            value: {
                propcusval: '111',
                array: [1, 22, 3],
                invocationRoutine: 'invocationRoutine',
                swaninfo: {}
            },
            extraMessage: {
                componentsData: {
                    'custom': {
                        myBehaviorData: {
                            myBehaviorData: 0
                        },
                        data: 0,
                        created: 0,
                        attached: 0,
                        ready: 0,
                        show: 0,
                        hide: 0,
                        methodData: 0,
                        myBehaviorProperty: 'behavior',
                        swaninfo: {}
                    },
                    'cl-item': {
                        red: 'red',
                        num: 2,
                        date: '2019-03-19T02:24:50.812Z',
                        neicusval: '222',
                        person: {
                            name: 'Lebron James',
                            pos: 'SF',
                            age: 33
                        },
                        time: 1
                    }
                }
            },
            slaveId: '1',
            appConfig: {
                pages: ['custest', 'api', 'cus'],
                networkTimeout: {
                    downloadFile: 10000,
                    connectSocket: 10000,
                    request: 30000,
                    uploadFile: 10000
                },
                debug: false,
                window: {
                    backgroundColorTop: 'red',
                    navigationBarTitleText: '智能小程序官方组件',
                    backgroundTextStyle: 'black',
                    enablePullDownRefresh: false,
                    navigationBarTextStyle: 'black',
                    navigationBarBackgroundColor: '#ffffff',
                    backgroundColor: '#f5f5f5'
                },
                appRootPath: '/Users/baidu/Library/Developer/CoreSimulator/Devices/7A2FFC96-F345-4F2F-BB21-6EAC95832EFD/data/Containers/Data/Application/33490E92-F40B-4B79-884B-93F368A6F197/Documents/SwanCaches/2590b9d7716f3653362f87e0eb374260/7824'
            }
        });
        setTimeout(() => {
            slave.swaninterface.boxjs.platform.isAndroid = originMethod;
            done();
        }, 200);

    });
    it('custom as Page', done => {
        catchTips('css');
        dispatchEvent(document, 'PageReady', {
            devHook: 'false',
            root: null,
            pagePath: 'custompage',
            appPath: appRootPath,
            onReachBottomDistance: '50',
            initData: '[{"data": 1}]'
        });
        setTimeout(() => {
            let componentFactory = window.componentFactory;
            let pageInfo = componentFactory.componentInfos['components/custom-component/custom-component0'];
            expect(pageInfo.componentPrototype.template).toBe('<swan-custom-component><view >i am custompag {{\'\' | swanmessage()}}</view></swan-custom-component>');
            done();
        }, 2500);
    });
    it('page browserPatch touchstart', done => {
        let longtapeventData = 0;

        let body = document.querySelector('body');
        body.addEventListener('longtapevent', () => {
            longtapeventData = 1;
        });
        let myEvent = new CustomEvent('touchstart', {
            target: document.querySelector('body')
        });
        document.body.dispatchEvent(myEvent);

        let startEvent = new CustomEvent('touchstart', {});
        body.dispatchEvent(startEvent);

        setTimeout(() => {
            expect(longtapeventData).toBe(1);
            done();
        }, 400);
    });
    it('page browserPatch touchend', done => {
        let tapeventData = 0;

        let body = document.querySelector('body');
        body.addEventListener('tapevent', () => {
            tapeventData = 1;
        });

        let myEvent = new CustomEvent('touchstart', {
            target: document.querySelector('body')
        });
        document.body.dispatchEvent(myEvent);

        let endEvent = new CustomEvent('touchend', {});
        body.dispatchEvent(endEvent);

        setTimeout(() => {
            expect(tapeventData).toBe(1);
            done();
        }, 300);
    });
    it('page browserPatch touchcancel', done => {
        let tapeventData = 0;

        let body = document.querySelector('body');
        body.addEventListener('tapevent', () => {
            tapeventData = 1;
        });

        let myEvent = new CustomEvent('touchstart', {
            target: document.querySelector('body')
        });
        document.body.dispatchEvent(myEvent);

        let cancelEvent = new CustomEvent('touchcancel', {});
        body.dispatchEvent(cancelEvent);

        setTimeout(() => {
            expect(tapeventData).toBe(0);
            done();
        }, 400);
    });
    it('openSourceDebugger', done => {
        window._envVariables = {
            isDebugSdk: true,
            host: 8888,
            port: 'localhost',
            udid: '1',
            ctsJsAddress: {
                slave: ['xx']
            }
        };
        slave.openSourceDebugger();
        window._envVariables = {
            isDebugSdk: true,
            host: 8888,
            port: 'localhost',
            udid: '1',
            ctsJsAddress: {
                slave: [123]
            }
        };
        expect(slave.openSourceDebugger()).toBe(false);
        done();
    });
    it('Page loadHook', done => {
        catchTips();
        window.advancedInitData = {};
        dispatchEvent(document, 'PageReady', {
            devhook: 'false',
            root: null,
            pagePath: 'nocustompage',
            appPath: appRootPath,
            onReachBottomDistance: '50',
            initData: '[{"data": 1}]',
            devhook: 'true'
        });
        setTimeout(() => {
            let componentFactory = window.componentFactory;
            let pageInfo = componentFactory.componentInfos.page;
            expect(pageInfo.componentPrototype.template).toBe('<swan-page tabindex="-1"><view id="filter-page">xxx</view></swan-page>');
            done();
        }, 2500);
    });
});
