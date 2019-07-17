/**
 * @file swan-core test for app index
 * @author lvlei(lvlei03@baidu.com)
 */

import {getAppMethods} from '../../../../src/master/app';
import {swaninterface} from '../../../mock/swan-api';
import EventsEmitter from '../../../../src/utils/events-emitter';
import {dispatchEvent} from '../../../mock/swan-na';

const appLifeCycleEventEmitter = new EventsEmitter();
const lifeCycleEventEmitter = new EventsEmitter();

const originAppInfo = swaninterface.boxjs.data.get({name: 'swan-appInfoSync'});

const appMethods = getAppMethods(
    swaninterface,
    appLifeCycleEventEmitter,
    lifeCycleEventEmitter
);

describe('getAppMethods', () => {
    beforeEach(() => {
        window.rainMonitor = {
            opts: {}
        };
    });

    afterEach(() => {
        window.rainMonitor = undefined;
    });

    describe('App', () => {

        it('should return an object after App be called', done => {
            const appRes = appMethods.App({});
            expect(appRes).toEqual(jasmine.any(Object));
            done();
        });

        it('should set rainMonitor after App be called', done => {
            appMethods.App({});
            const {appkey, cuid} = window.rainMonitor.opts;

            expect(appkey).toEqual(originAppInfo.appid);
            expect(cuid).toEqual(originAppInfo.cuid);
            done();
        });

        it('should call onLaunch correctly after App be called', done => {
            const lifeCycle = {
                status: 0,
                params: null
            };

            appMethods.App({
                globalData: 'test',
                onLaunch(e) {
                    lifeCycle.status++;
                    lifeCycle.params = e;
                }
            });

            expect(lifeCycle.status).toEqual(1);
            
            const appInfo = lifeCycle.params;

            expect(appInfo.scene).toEqual(originAppInfo.scene);
            done();
        });

        it('can app hook not decorate to _hook while App.after params not includes methods', done => {
            appMethods.App({
                globalData: 'test'
            });
           const res = appMethods.App.after({});

            expect(res).toBeUndefined();
            done();
        });

        it('can app hook not decorate to _hook while App.after params includes methods that out of lifecycles', done => {
            appMethods.App({
                globalData: 'test'
            });
            const params = {
                methods: {
                    onUnLifeCycle() {}
                }
            };

            appMethods.App.after(params);

            expect(appMethods.App._hooks.onUnLifeCycle).toBeUndefined();
            done();
        });

        it('can app hook decorate to _hook', done => {
            appMethods.App({
                globalData: 'test'
            });
            const params = {
                methods: {
                    onLaunch() {},
                    onShow() {},
                    onHide() {},
                    onError() {},
                    onPageNotFound() {}
                }
            };

            appMethods.App.after(params);

            Object.values(appMethods.App._hooks).forEach(hook => {
                expect(hook.length).toEqual(1);
            });
            done();
        });
    });

    it('should emit app _hooks method after appLifeCycleEventEmitter be emitted', done => {
        let cbParams;
        appMethods.App._hooks = {
            onShow: [({args, returnValue, thisObject}) => {
                cbParams = {
                    args,
                    returnValue,
                    thisObject
                };
            }]
        };

        appLifeCycleEventEmitter.fireMessage({
            type: 'ApplifeCycle',
            params: {
                eventName: 'onShow',
                e: {
                    e: {
                        from: 'appLifeCycleEventEmitter'
                    }
                }
            }
        });

        expect(cbParams.args.from).toEqual('appLifeCycleEventEmitter');
        expect(cbParams.returnValue).toEqual(null);
        done();
    });
    
    describe('getApp', () => {
        it('should get app instance after getApp be called', done => {
            appMethods.App({
                globalData: 'mockData'
            });
            const appInstance = appMethods.getApp();

            expect(appInstance).toEqual(jasmine.any(Object));
            expect(appInstance.globalData).toEqual('mockData');
            done();
        });
    });

    describe('lifeCycleEventEmitter', () => {

        it('should call _onAppShow after lifeCycleEventEmitter emitted with type is onAppShow', done => {
            let cbParams;
            appMethods.App({
                onShow(e) {
                    cbParams = e;
                }
            });

            lifeCycleEventEmitter.fireMessage({
                type: 'onAppShow',
                event: {
                    lcType: 'onAppShow',
                    from: 'lifeCycleEventEmitter'
                }
            });
            expect(cbParams.scene).toEqual(originAppInfo.scene);
            done();
        });

        it('can emit nothing while the app instance not includes the event', done => {
            let cbParams;
            appMethods.App({
                uncludesEvent(e) {
                    cbParams = e;
                }
            });

            lifeCycleEventEmitter.fireMessage({
                type: 'onAppShow',
                event: {
                    lcType: 'uncludesEvent'
                }
            });
    
            expect(cbParams).toBeUndefined();
            done();
        });

        it('should call onLogin correctly after onLogin event dispathed', done => {
            const res = appMethods.App({
                onLogin() {}
            });

            dispatchEvent(document, 'onLogin', {
                event: {
                    loginMsg: 'loginMsg'
                },
                lcType: 'onLogin'
            });

            expect(res).toEqual(jasmine.any(Object));
            done();
        });
    });  
});
