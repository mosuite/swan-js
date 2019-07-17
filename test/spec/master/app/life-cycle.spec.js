/**
 * @file swan-core test for app lifecycle
 * @author lvlei(lvlei03@baidu.com)
 */

import {mixinLifeCycle} from '../../../../src/master/app/life-cycle';
import {catchTips} from '../../../utils';
import EventsEmitter from '../../../../src/utils/events-emitter';

describe('App life-cycle test', () => {
    const lifeCycle = {
        onLaunchParams: null,
        onShowParams: null,
        onHideParams: null,
        onErrorParams: null,
        onPageNotFoundParams: null,
        onLoginParams: null
    };

    const appObject = {
        onLaunch(e) {
            lifeCycle.onLaunchParams = e;
            catchTips();
            console.log(a);
        },
        onShow(e) {
            lifeCycle.onShowParams = e;
            catchTips();
            console.log(a);
        },
        onHide(e) {
            lifeCycle.onHideParams = e;
            catchTips();
            console.log(a);
        },
        onError(e) {
            lifeCycle.onErrorParams = e;
        },
        onPageNotFound(e) {
            lifeCycle.onPageNotFoundParams = e;
            return true;
        },
        onLogin(e) {
            lifeCycle.onLoginParams = e;
        }
    };
    
    const appLifeCycleEventEmitter = new EventsEmitter();
    
    const appProto = mixinLifeCycle(appObject, appLifeCycleEventEmitter);

    describe('_lifeCycleParamsHandle', () => {

        it('should return an object and its property value is empty string while the data not includes appInfo', done => {
            const data = {};
    
            const res = appProto._lifeCycleParamsHandle(data);
            
            ['path', 'query', 'scene', 'shareTicket'].forEach(token => {
                expect(res[token]).toEqual('');
            });

            expect(res.referrerInfo).toBeUndefined();
            done();
        });

        it('should return an object and its property value is string while data includes appInfo', done => {
            const data = {
                appInfo: {
                    path: 'path',
                    query: 'from=swan',
                    scene: 'search',
                    shareTicket: 'ticket'
                }
            };

            const res = appProto._lifeCycleParamsHandle(data);

            ['path', 'query', 'scene', 'shareTicket'].forEach(token => {
                expect(res[token]).toEqual(data.appInfo[token]);
            });

            expect(res.referrerInfo).toBeUndefined();
            done();
        });

        it('should set referrerInfo while appInfo includes srcAppId', done => {
            const data = {
                appInfo: {
                    path: 'path',
                    query: 'from=swan',
                    scene: 'search',
                    shareTicket: 'ticket',
                    srcAppId: 'srcAppId'
                }
            };

            const res = appProto._lifeCycleParamsHandle(data);
            
            ['path', 'query', 'scene', 'shareTicket'].forEach(token => {
                expect(res[token]).toEqual(data.appInfo[token]);
            });

            expect(res.query).toEqual(data.appInfo.query);
            done();
        });
    });

    describe('_onAppShowLifeCycleParamsHandle', () => {

        it('should return correct value while data never includes appInfo', done => {
            const cacheMethod = appProto._lifeCycleParamsHandle;
            appProto._lifeCycleParamsHandle = params => params;

            const data = {};

            const res = appProto._onAppShowLifeCycleParamsHandle(data);

            expect(Object.keys(res).length).toEqual(0);

            appProto._lifeCycleParamsHandle = cacheMethod;
            done();
        });

        it('should return correct value while the appInfo showBy is schema', done => {
            const cacheMethod = appProto._lifeCycleParamsHandle;
            appProto._lifeCycleParamsHandle = params => params;

            const data = {
                appInfo: {
                    showBy: 'schema',
                    appURL: 'appurl'
                }
            };

            const res = appProto._onAppShowLifeCycleParamsHandle(data);

            const {
                entryType,
                appURL
            } = res;

            expect(entryType).toEqual(data.appInfo.showBy);
            expect(appURL).toEqual(data.appInfo.appURL);

            appProto._lifeCycleParamsHandle = cacheMethod;
            done();
        });

        it('should return correct value while appInfo showBy is not schema', done => {
            const cacheMethod = appProto._lifeCycleParamsHandle;
            appProto._lifeCycleParamsHandle = params => params;

            const data = {
                appInfo: {
                    showBy: 'other',
                    appURL: 'appurl'
                }
            };

            const res = appProto._onAppShowLifeCycleParamsHandle(data);

            const {
                entryType,
                appURL
            } = res;

            expect(entryType).toEqual(data.appInfo.showBy);
            expect(appURL).toBeUndefined();

            appProto._lifeCycleParamsHandle = cacheMethod;
            done();
        });
    });

    it('should emit ApplifeCycle after _sendAppLifeCycleMessage be called', done => {
        const originEventName = '_onAppLaunch';
        const originParams = {
            from: 'test'
        };

        let cbParams;
        appProto._appLifeCycleEventEmitter.onMessage('ApplifeCycle', e => {
            cbParams = e;
        });

        appProto._sendAppLifeCycleMessage(originEventName, originParams);

        const {
            type,
            params: {
                eventName,
                e
            }
        } = cbParams;

        expect(type).toEqual('ApplifeCycle');
        expect(eventName).toEqual(originEventName);
        expect(e.from).toEqual(originParams.from);
        done();
    });

    describe('_onAppLaunch', () => {

        it('should call onLaunch after _onAppLaunch be called', done => {
            const cacheMethod = appProto._lifeCycleParamsHandle;
            appProto._lifeCycleParamsHandle = params => params;

            const launchParams = {
                appInfo: {
                    system: 'swanOS'
                },
                from: '_onAppLaunch'
            };

            appProto._onAppLaunch(launchParams);

            const {
                appInfo: {
                    system
                },
                from
            } = lifeCycle.onLaunchParams;

            expect(system).toEqual(launchParams.appInfo.system);
            expect(from).toEqual(launchParams.from);

            appProto._lifeCycleParamsHandle = cacheMethod;
            done();
        });
        
        it('should call _sendAppLifeCycleMessage after _onAppLaunch be called', done => {
            const cacheMethod1 = appProto._lifeCycleParamsHandle;
            const cacheMethod2 = appProto._sendAppLifeCycleMessage;

            const launchParams = {
                appInfo: {
                    system: 'swanOS'
                },
                from: '_onAppLaunch'
            };

            appProto._lifeCycleParamsHandle = params => params;

            appProto._sendAppLifeCycleMessage = (eventName, params) => {
                expect(eventName).toEqual('onLaunch');
                expect(params.e.system).toEqual(launchParams.appInfo.system);
            }

            appProto._onAppLaunch(launchParams);

            appProto._lifeCycleParamsHandle = cacheMethod1;
            appProto._sendAppLifeCycleMessage = cacheMethod2;
            done();
        });
    });

    describe('_onAppShow', () => {

        it('should call onShow after _onAppShow be called', done => {
            const cacheMethod1 = appProto._onAppShowLifeCycleParamsHandle;
            const cacheMethod2 = appProto._sendAppLifeCycleMessage;

            const eventList = ['onPreShow', 'onShow'];

            const onShowParams = {
                appInfo: {
                    system: 'swanOS'
                },
                from: '_onAppShow'
            };

            appProto._onAppShowLifeCycleParamsHandle = params => params;

            let i = 0;
            appProto._sendAppLifeCycleMessage = (eventName, params) => {
                expect(eventName).toEqual(eventList[i]);
                expect(params.e.system).toEqual(onShowParams.appInfo.system);
                i++;
            }

            appProto._onAppShow(onShowParams);

            const {
                appInfo: {
                    system
                },
                from
            } = lifeCycle.onShowParams;

            expect(system).toEqual(onShowParams.appInfo.system);
            expect(from).toEqual(onShowParams.from);

            appProto._onAppShowLifeCycleParamsHandle = cacheMethod1;
            appProto._sendAppLifeCycleMessage = cacheMethod2;
            done();
        });
    });

    describe('_onAppHide', () => {

        it('should call onShow after _onAppShow be called', done => {
            const cacheMethod1 = appProto._lifeCycleParamsHandle;
            const cacheMethod2 = appProto._sendAppLifeCycleMessage;

            const launchParams = {
                appInfo: {
                    system: 'swanOS'
                },
                from: '_onAppHide'
            };

            appProto._lifeCycleParamsHandle = params => params;
            appProto._sendAppLifeCycleMessage = (eventName, params) => {
                expect(eventName).toEqual('onHide');
                expect(params.e.system).toEqual(launchParams.appInfo.system);
            }

            appProto._onAppHide(launchParams);

            const {
                appInfo: {
                    system
                },
                from
            } = lifeCycle.onHideParams;

            expect(system).toEqual(launchParams.appInfo.system);
            expect(from).toEqual(launchParams.from);

            appProto._lifeCycleParamsHandle = cacheMethod1;
            appProto._sendAppLifeCycleMessage = cacheMethod2;
            done();
        });
    });
    
    it('should call onError after _onAppError be called', done => {
        const cacheMethod = appProto._sendAppLifeCycleMessage;

        const onErrorParams = {
            appInfo: {
                system: 'swanOS'
            },
            event: 'error'
        };

        appProto._sendAppLifeCycleMessage = (eventName, params) => {
            expect(eventName).toEqual('onError');
            expect(params.e.system).toEqual(onErrorParams.appInfo.system);
        }

        appProto._onAppError(onErrorParams);

        const event = lifeCycle.onErrorParams;

        expect(event).toEqual('error');

        appProto._sendAppLifeCycleMessage = cacheMethod;
        done();
    });

    it('should call onPageNotFound after _onPageNotFound be called', done => {
        const cacheMethod = appProto._sendAppLifeCycleMessage;

        appProto._hasNotFoundRedirect = false;

        const onPageNotFoundParams = {
            appInfo: {
                system: 'swanOS'
            },
            event: 'onPageNotFound'
        };

        appProto._sendAppLifeCycleMessage = (eventName, params) => {
            expect(eventName).toEqual('onPageNotFound');
            expect(params.e.system).toEqual(onPageNotFoundParams.appInfo.system);
        }

        appProto._onPageNotFound(onPageNotFoundParams);

        const event = lifeCycle.onPageNotFoundParams;

        expect(event).toEqual('onPageNotFound');
        expect(appProto._hasNotFoundRedirect).toEqual(true);

        appProto._sendAppLifeCycleMessage = cacheMethod;
        done();
    });

    it('should call onLogin after _onLogin be called', done => {
        const cacheMethod = appProto._sendAppLifeCycleMessage;

        appProto._hasNotFoundRedirect = false;

        const onLoginParams = {
            appInfo: {
                system: 'swanOS'
            },
            event: {
                loginMsg: 'loginMsg'
            }
        };

        appProto._sendAppLifeCycleMessage = (eventName, params) => {
            expect(eventName).toEqual('onLogin');
            expect(params.e.system).toEqual(onLoginParams.appInfo.system);
        }

        appProto._onLogin(onLoginParams);

        const loginMsg = lifeCycle.onLoginParams;

        expect(loginMsg).toEqual(onLoginParams.event.loginMsg);

        appProto._sendAppLifeCycleMessage = cacheMethod;
        done();
    });
});
