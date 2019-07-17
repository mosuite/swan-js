/**
 * @file swan-core test for extension
 * @author lvlei(lvlei03@baidu.com)
 */

import Extension from '../../../src/extension';
import {swaninterface} from '../../mock/swan-api';
import EventsEmitter from '../../../src/utils/events-emitter';
import {catchTips, appRootPath, getEnvVariables} from '../../utils';

const swanEventsCommunicator = new EventsEmitter();
const pageLifeCycleEventEmitter = new EventsEmitter();
const appLifeCycleEventEmitter = new EventsEmitter();

describe('Extension', () => {

    const extension = new Extension(window, swaninterface);

    it('should Extension is a class', done => {
        expect(Extension).toEqual(jasmine.any(Function));
        expect(extension).toEqual(jasmine.any(Object));
        done();
    });

    describe('injectHostMethods', () => {

        it('should extend boxjs API after injectHostMethods be called correctly', done => {
            const service = {
                hostMethodDescriptions: ['publishThreadMock']
            };

            extension.injectHostMethods(service);

            const publishThreadMock = swaninterface.boxjs.publishThreadMock;

            expect(publishThreadMock).toBeDefined();
            expect(publishThreadMock.authority).toEqual('swanAPI');
            expect(publishThreadMock.args).toEqual(jasmine.any(Array));

            done();
        });

        it('should be caught when some error happened', done => {
            const service = {
                hostMethodDescriptions: 'ERROR_TYPE'
            };

            catchTips();
            const res = extension.injectHostMethods(service);

            expect(res).toBeUndefined();
            done();
        });

        it('wifikey extend boxjs API', done => {
            const service = {
                hostMethodDescriptions: [{
                    'name': 'pushSettingStateSync',
                    'path': '/getPushSettingStateSync',
                    'args': [{name: 'url', value: 'string='}]
                }],
                name: 'wifikey'
            };

            extension.injectHostMethods(service);

            const pushSettingStateSync = swaninterface.boxjs.pushSettingStateSync;

            expect(pushSettingStateSync).toBeDefined();
            expect(pushSettingStateSync.authority).toEqual('swanAPI');
            expect(pushSettingStateSync.args).toEqual(jasmine.any(Array));

            done();
        });
    });

    describe('injectHostAPI', () => {
        const injectHostAPI = extension.injectHostAPI;

        it('should injectHostAPI be a function', done => {
            expect(injectHostAPI).toEqual(jasmine.any(Function));
            done();
        });

        it('should extend method API while extension value is a function', done => {
            const extensionMethodAPIRes = 'extension-api';
            const service = {
                name: 'tieba',
                methods: {
                    extensionMethodAPI() {
                        return extensionMethodAPIRes;
                    }
                }
            };

            injectHostAPI.call(extension, service);

            const extensionMethodAPI = window.swan.tieba.extensionMethodAPI;

            expect(extensionMethodAPI).toEqual(jasmine.any(Function));
            expect(extensionMethodAPI()).toEqual(extensionMethodAPIRes);
            done();
        });

        it('should extend obj API while extension value is a object and scope is root', done => {
            const extensionMethodAPI1Res = 'extension-obj-api-1';
            const service = {
                name: 'tieba',
                methods: {
                    extensionObjAPI1: {
                        scope: 'root',
                        method() {
                            return extensionMethodAPI1Res;
                        }
                    }
                }
            };

            injectHostAPI.call(extension, service);

            expect(window.swan.extensionObjAPI1).toEqual(jasmine.any(Function));
            expect(window.swan.extensionObjAPI1()).toEqual(extensionMethodAPI1Res);
            done();
        });

        it('should extend obj API while extension value is a object and scope is not root', done => {
            const extensionMethodAPI2Res = 'extension-obj-api-2';
            const service = {
                name: 'tieba',
                methods: {
                    extensionObjAPI2: {
                        method() {
                            return extensionMethodAPI2Res;
                        }
                    }
                }
            };

            injectHostAPI.call(extension, service);

            expect(window.swan.tieba.extensionObjAPI2).toEqual(jasmine.any(Function));
            expect(window.swan.tieba.extensionObjAPI2()).toEqual(extensionMethodAPI2Res);
            done();
        });

        it('shold console error while extension value is a object and function', done => {
            const service = {
                name: 'tieba',
                methods: {
                    extensionAPI3: 'error type'
                }
            };

            injectHostAPI.call(extension, service);

            expect(window.swan.extensionAPI3).toBeUndefined();
            done();
        });

        it('should extend debugSDK api while the SDK is debug', done => {
            const extensionDebugAPIRes = 'extension-debug-api-';

            const service = {
                name: 'tieba',
                methods: {
                    extensionDebugAPI: {
                        method() {
                            return extensionDebugAPIRes;
                        }
                    }
                }
            };

            extension.context._envVariables = {
                isDebugSdk: true
            };

            injectHostAPI.call(extension, service);

            const extensionDebugAPI = window.swan._extensionSrc.methods.extensionDebugAPI;

            expect(extensionDebugAPI).toEqual(jasmine.any(Object));
            expect(extensionDebugAPI.method()).toEqual(extensionDebugAPIRes);
            done();
        });
    });

    describe('injectHostComponents', () => {
        const injectHostComponents = extension.injectHostComponents;

        extension.context.componentFactory = {
            getComponents() {}
        };

        it('should injectHostComponents be a function', done => {
            expect(injectHostComponents).toEqual(jasmine.any(Function));
            done();
        });

        it('should get response right while component has not scoped', done => {
            const extensionPool = {
                status: 0,
                params: {}
            };
            let componentDefine = extension.context.componentFactory.componentDefine;
            extension.context.componentFactory.componentDefine = (componentName, componentProto) => {
                extensionPool.status++;
                extensionPool.params.componentName = componentName;
                extensionPool.params.componentProto = componentProto;
            };
            const service = {
                name: 'teiba',
                components: {
                    video: {
                        scope: 'root'
                    }
                }
            };
            extension.injectHostComponents.call(extension, service);

            expect(extensionPool.status).toEqual(1);
            expect(extensionPool.params.componentName).toEqual('video');
            expect(extensionPool.params.componentProto).toEqual(service.components.video);
            extension.context.componentFactory.componentDefine = componentDefine;
            done();
        });

        it('should get response right while component has scoped', done => {
            const extensionPool = {
                status: 0,
                params: {}
            };
            let componentDefine = extension.context.componentFactory.componentDefine;

            extension.context.componentFactory.componentDefine = (componentName, componentProto) => {
                extensionPool.status++;
                extensionPool.params.componentName = componentName;
                extensionPool.params.componentProto = componentProto;
            };

            const service = {
                name: 'teiba',
                components: {
                    video: {
                        behaviors: ['userTouchEvents', 'animateEffect'],
                        template: '<div class="tieba-video" on-click="testTap">{{content}}<slot></slot></div>',
                        depandencies: ['swaninterface'],
                        initData() {
                            return {
                                content: 'Extension Content'
                            };
                        },
                        testTap() {
                            swan.tieba.testAPI();
                            alert('testVideo Used!');
                        },
                        attached() {}
                    }
                }
            };

            extension.injectHostComponents.call(extension, service);

            expect(extensionPool.status).toEqual(1);
            expect(extensionPool.params.componentName).toEqual(`${service.name}-video`);
            expect(extensionPool.params.componentProto).toEqual(service.components.video);
            extension.context.componentFactory.componentDefine = componentDefine;

            done();
        });
    });

    describe('use', () => {

        it('extension use in master', done => {
            window._envVariables.sdkExtension = appRootPath;
            const mockContext = {
                pageLifeCycleEventEmitter,
                appLifeCycleEventEmitter,
                swanEventsCommunicator,
                context: {
                    swanEvents() {}
                },
            }
            const useRes = extension.use(mockContext, 1);
            
            expect(useRes).toEqual(jasmine.any(Object));
            expect(useRes.isSlave).toEqual(false);
            expect(useRes.extensionPath).toEqual(jasmine.any(String));
            done();
        });
    
        it('extension use in slave', done => {
            window._envVariables.sdkExtension = appRootPath;
            const mockContext = {
                from: 'testmock',
                registerComponents() {},
                pageLifeCycleEventEmitter,
                appLifeCycleEventEmitter,
                swanEventsCommunicator,
                context: {
                    swanEvents() {}
                }
            };
            const useRes = extension.use(mockContext);
    
            expect(useRes).toEqual(jasmine.any(Object));
            expect(useRes.isSlave).toEqual(true);
            expect(useRes.extensionPath).toEqual(jasmine.any(String));
            done();
        });
    
        it('should be interrupt after extension use in slave without sdkAddr', done => {
            window._envVariables.sdkExtension = undefined;
            const mockContext = {
                from: 'testmock',
                pageLifeCycleEventEmitter,
                appLifeCycleEventEmitter,
                swanEventsCommunicator,
                context: {
                    swanEvents() {}
                }
            };
            const useRes = extension.use(mockContext);
    
            expect(useRes).toBeUndefined();
    
            window._envVariables.sdkExtension = appRootPath;
            done();
        });

        it('should be interrupt after extension use in master without sdkAddr', done => {
            window._envVariables.sdkExtension = undefined;
            const mockContext = {
                from: 'testmock',
                pageLifeCycleEventEmitter,
                appLifeCycleEventEmitter,
                swanEventsCommunicator,
                context: {
                    swanEvents() {}
                }
            };
            const useRes = extension.use(mockContext, 1);

            expect(useRes).toBeUndefined();

            window._envVariables.sdkExtension = appRootPath;
            done();
        });
    });

    it('should getShareURL extended after injectHostShareHook be called', done => {
        const shareURL = 'mockURL';
        const service = {
            getShareURL() {
                return shareURL;
            }
        };

        extension.injectHostShareHook(service);

        expect(extension.getShareURL()).toEqual(shareURL);
        done();
    });

    describe('hostShareParamsProccess', () => {

        it('should return userParams while the instance getShareURL is not a function', done => {
            const cacheMethod = extension.getShareURL;

            extension.getShareURL = 'isNotAFunction';

            const userParams = {
                from: 'getShareURLIsNotAFunction'
            };
            const res = extension.hostShareParamsProccess.call(extension, userParams, {});

            expect(res.from).toEqual(userParams.from);

            extension.getShareURL = cacheMethod;
            done();
        });

        it('should return assigned userParams after hostShareParamsProccess be called', done => {
            const userParams = {
                getShareURLType: 'method'
            };
            const appInfo = {
                appId: 'abc',
                scene: 'share'
            };

            extension.getShareURL = params => params;

            const res = extension.hostShareParamsProccess(userParams, appInfo);

            const {
                getShareURLType,
                forceReplaceShareUrl,
                appId,
                scene
            } = res;

            expect(getShareURLType).toEqual(userParams.getShareURLType);
            expect(forceReplaceShareUrl).toEqual(true);
            expect(appId).toEqual(appInfo.appId);
            expect(scene).toEqual(appInfo.scene);
            done();
        });
    });
});
