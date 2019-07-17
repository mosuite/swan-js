/**
 * @file swan-core test for page slave-events-router
 * @author lvlei(lvlei03@baidu.com)
 */

import SlaveEventsRouter from '../../../../src/master/page/slave-events-router'; 
import Slave from '../../../../src/master/navigator/slave';
import EventsEmitter from '../../../../src/utils/events-emitter';
import {randomNum, catchTips, appRootPath} from '../../../utils';
import {dispatchEvent} from '../../../mock/swan-na';
import {swaninterface} from '../../../mock/swan-api';

const pageLifeCycleEventEmitter = new EventsEmitter();

const mockMasterManager = {
    navigator: {
        history: {},

    },
    communicator: new EventsEmitter(),
    swaninterface,
    lifeCycleEventEmitter: new EventsEmitter()
};

let slaveEventsRouter = new SlaveEventsRouter(
    mockMasterManager,
    pageLifeCycleEventEmitter
);

const slaveId = randomNum();

describe('slaveEventsRouter test', () => {

    it('should SlaveEventsRouter be a class', done => {
        expect(SlaveEventsRouter).toEqual(jasmine.any(Function));
        expect(slaveEventsRouter).toEqual(jasmine.any(Object));
        done();
    });

    it('should call some methods after initbindingEvents be called', done => {
        // 做替换前的缓存, 避免改其原始方法
        const {
            bindPrivateEvents,
            bindDeveloperEvents,
            bindEnvironmentEvents,
            bindLifeCycleEvent
        } = slaveEventsRouter;


        const callManager = {
            bindPrivateEventsStatus: 0,
            bindDeveloperEventsStatus: 0,
            bindEnvironmentEventsStatus: 0,
            bindLifeCycleEventStatus: 0
        };

        slaveEventsRouter.bindPrivateEvents = () => {
            callManager.bindPrivateEventsStatus++;
        };
        slaveEventsRouter.bindDeveloperEvents = () => {
            callManager.bindDeveloperEventsStatus++;
        };
        slaveEventsRouter.bindEnvironmentEvents = () => {
            callManager.bindEnvironmentEventsStatus++;
        };
        slaveEventsRouter.bindLifeCycleEvent = () => {
            callManager.bindLifeCycleEventStatus++;
        };

        slaveEventsRouter.initbindingEvents();

        expect(callManager.bindPrivateEventsStatus).toEqual(1);
        expect(callManager.bindDeveloperEventsStatus).toEqual(1);
        expect(callManager.bindEnvironmentEventsStatus).toEqual(1);
        expect(callManager.bindLifeCycleEventStatus).toEqual(1);

        slaveEventsRouter.bindPrivateEvents = bindPrivateEvents;
        slaveEventsRouter.bindDeveloperEvents = bindDeveloperEvents;
        slaveEventsRouter.bindEnvironmentEvents = bindEnvironmentEvents;
        slaveEventsRouter.bindLifeCycleEvent = bindLifeCycleEvent;
        done();
    });

    describe('callEventOccurredPageMethod', () => {

        it('should call occurredSlave callPrivatePageMethod correctly while the slave existed', done => {
            slaveEventsRouter.history.seek = () => {
                return {
                    callPrivatePageMethod(methodName, options) {
                        return {
                            methodName,
                            options
                        }
                    }
                }
            }
            const originMethodName = 'mockName';
            const originOptions = {
                from: 'test'
            };
    
            const res = slaveEventsRouter.callEventOccurredPageMethod(
                slaveId,
                originMethodName,
                originOptions
            );
    
            const {
                methodName,
                options
            } = res;
            expect(methodName).toEqual(originMethodName);
            expect(options.from).toEqual(originOptions.from);
            done();
        });

        it('should return null while the slave does not exist', done => {
            slaveEventsRouter.history.seek = () => {
                return undefined;
            }

            const originMethodName = 'mockName';
            const originOptions = {
                from: 'test'
            };

            const res = slaveEventsRouter.callEventOccurredPageMethod(
                slaveId,
                originMethodName,
                originOptions
            );

            expect(res).toEqual(null);
            done();
        });
    });

    it('should call history each correctly while dispatchAllSlaveEvent be called', done => {
        let eachCalledStatus = 0;

        slaveEventsRouter.history.each = cb => {
            eachCalledStatus++;
            cb({
                callPrivatePageMethod() {}
            });
        }

        const originMethodName = 'customName';
        const originoOptions = {
            from: 'dispatchAllSlaveEvent'
        };
        slaveEventsRouter.dispatchAllSlaveEvent(originMethodName, originoOptions);

        expect(eachCalledStatus).toEqual(1);
        done();
    });

    describe('bindPrivateEvents', () => {

        it('should be return while the fireMessage value type is rendered', done => {
            slaveEventsRouter.bindPrivateEvents();
            slaveEventsRouter.slaveCommunicator.fireMessage({
                type: 'abilityMessage',
                value: {
                    type: 'rendered'
                }
            });
            done();
        });

        it('should call callEventOccurredPageMethod correctly when the fireMessage value type is not rendered', done => {
            let cbParams;

            slaveEventsRouter.callEventOccurredPageMethod = (slaveId, type, params) => {
                cbParams = {
                    slaveId,
                    type,
                    params
                };
            }

            slaveEventsRouter.bindPrivateEvents();

            slaveEventsRouter.slaveCommunicator.fireMessage({
                type: 'abilityMessage',
                value: {
                    type: 'isNotRendered',
                    params: {
                        from: 'isNotRendered'
                    }
                },
                slaveId
            });

            expect(cbParams.slaveId).toEqual(slaveId);
            expect(cbParams.type).toEqual('isNotRendered');
            done();
        });

        it('should be caught when some error happened', done => {

            slaveEventsRouter.callEventOccurredPageMethod = 'mockMethodError';

            slaveEventsRouter.bindPrivateEvents();

            // 预留
            catchTips();
            slaveEventsRouter.slaveCommunicator.fireMessage({
                type: 'abilityMessage',
                value: {
                    type: 'isNotRendered_error'
                },
                slaveId
            });

            done();
        });
    });

    describe('emitPageRender', () => {

        it('should call callEventOc correctly after emitPageRender be called and abilityMessage emitted with type is ', done => {
            let cbParams;

            slaveEventsRouter.callEventOccurredPageMethod = (slaveId, type, args, params) => {
                cbParams = {
                    slaveId,
                    type,
                    args,
                    params
                }
            };
    
            slaveEventsRouter.emitPageRender(slaveId);
    
            slaveEventsRouter.slaveCommunicator.fireMessage({
                type: 'abilityMessage',
                value: {
                    type: 'rendered',
                    params: {
                        from: 'emitPageRender'
                    }
                },
                slaveId
            });
    
            expect(cbParams.slaveId).toEqual(slaveId);
            expect(cbParams.type).toEqual('rendered');
            expect(Object.keys(cbParams.args).length).toEqual(0);
            expect(cbParams.params.from).toEqual('emitPageRender');
            done();
        });
    });

    describe('callPageMethod', () => {

        it('should return occurredSlave method response correctly while the slave existed and its method is a function', done => {
            slaveEventsRouter.history.seek = () => {
                return {
                    userPageInstance: {
                        custom(args) {
                            return args;
                        }
                    }
                }
            }
            
            const methodName = 'custom';
            const args = {
                from: 'callPageMethod'
            };
    
            const res = slaveEventsRouter.callPageMethod(slaveId, methodName, args);
    
            expect(res.from).toEqual(args.from);
            done();
        });

        it('should return null while the slave existed but its method is not a function', done => {
            slaveEventsRouter.history.seek = () => {
                return {
                    userPageInstance: {
                        custom: 'isNotAFunction_error'
                    }
                }
            }
            
            const methodName = 'custom';
            const args = {
                from: 'callPageMethod'
            };
    
            const res = slaveEventsRouter.callPageMethod(slaveId, methodName, args);
    
            expect(res).toEqual(null);
            done();
        });

        it('should return null while the slave does not exist', done => {
            slaveEventsRouter.history.seek = () => undefined;
            
            const methodName = 'custom';
            const args = {
                from: 'callPageMethod'
            };
    
            const res = slaveEventsRouter.callPageMethod(slaveId, methodName, args);
    
            expect(res).toEqual(null);
            done();
        });

        it('should be caught when some error happened', done => {
            slaveEventsRouter.history.seek = () => {
                return {
                    userPageInstance: {
                        custom() {
                            catchTips();
                            console.log(a);
                        }
                    }
                }
            }
            
            const methodName = 'custom';
            const args = {
                from: 'callPageMethod'
            };
    
            const res = slaveEventsRouter.callPageMethod(slaveId, methodName, args);
    
            expect(res).toEqual(null);
            done();
        });
    });

    describe('bindDeveloperEvents', () => {

        slaveEventsRouter.bindDeveloperEvents();
        let lastCbParams;

        it('should call callComponentMethod correctly while events includes customEventParams', done => {
            let cbParams;
            slaveEventsRouter.history.seek = () => {
                return {
                    getUserPageInstance() {
                        return {
                            from: 'bindDeveloperEvents',
                            privateMethod: {
                                callComponentMethod(nodeId, value) {
                                    cbParams = {
                                        nodeId,
                                        value
                                    }
                                }
                            }
                        };
                    }
                };
            };

            slaveEventsRouter.slaveCommunicator.fireMessage({
                type: 'event',
                slaveId: 666,
                customEventParams: {
                    nodeId: 1
                },
                value: {
                    from: 'swan-msg'
                }
            });

            expect(cbParams.nodeId).toEqual(1);
            expect(cbParams.value.from).toEqual('swan-msg');
            done();
        });

        it('should call callMethod correctly while eventOccurredPageObject includes reflectMethod', done => {
            let cbParams;
            slaveEventsRouter.history.seek = () => {
                return {
                    getUserPageInstance() {
                        return {
                            privateMethod: {
                                callMethod(reflectMethod, value) {
                                    cbParams = {
                                        reflectMethod,
                                        value
                                    }
                                }
                            },
                            custom() {}
                        };
                    }
                };
            };

            slaveEventsRouter.slaveCommunicator.fireMessage({
                type: 'event',
                slaveId: 666,
                value: {
                    from: 'swan-msg',
                    reflectMethod: 'custom'
                }
            });

            expect(cbParams.reflectMethod).toEqual('custom');
            expect(cbParams.value.from).toEqual('swan-msg');

            lastCbParams = cbParams;
            done();
        });

        it('should do nothing while the slave does not exist', done => {
            slaveEventsRouter.history.seek = () => undefined;

            slaveEventsRouter.slaveCommunicator.fireMessage({
                type: 'event',
                slaveId: 777,
                value: {
                    from: 'slave-does-not-exist',
                    reflectMethod: 'custom'
                }
            });

            // 如果slave取到的是空，则不会做任何操作，取到的值还是上一次的
            expect(lastCbParams.value.from).toEqual('swan-msg');
            done();
        });
    });

    describe('bindEnvironmentEvents', () => {
        slaveEventsRouter.bindEnvironmentEvents();

        it('should call callEventOccurredPageMethod correctly after sharebtn event was dispathed', done => {
            let cbParams;
            slaveEventsRouter.callEventOccurredPageMethod = (wvID, action, args, event, from) => {
                cbParams = {
                    wvID,
                    action,
                    args,
                    event,
                    from
                };
            }

            dispatchEvent(document, 'sharebtn', {
                wvID: 666
            });

            expect(cbParams.wvID).toEqual(666);
            expect(cbParams.action).toEqual('share');
            expect(Object.keys(cbParams.args).length).toEqual(0);
            expect(cbParams.event.wvID).toEqual(666);
            expect(cbParams.from).toEqual('menu');
            done();
        });

        it('should call dispatchAllSlaveEvent correctly after accountChange event was dispathed', done => {
            let cbParams;
            slaveEventsRouter.dispatchAllSlaveEvent = eventName => {
                cbParams = eventName;
            }

            dispatchEvent(document, 'accountChange', {});
    
            expect(cbParams).toEqual('accountChange');
            done();
        });

        it('should call reLaunch correctly after backtohome event was dispathed and from relaunch', done => {
            let cbParams;
            slaveEventsRouter.history.getTopSlaves = () => {
                return [{

                }];
            }
            slaveEventsRouter.masterManager.navigator.reLaunch = params => {
                cbParams = params.url;
            }

            dispatchEvent(document, 'backtohome', {
                url: 'mock/backtohome',
                from: 'relaunch'
            });
    
            expect(cbParams).toEqual('/mock/backtohome');
            done();
        });

        it('should call reLaunch correctly after backtohome event was dispathed but is not from relaunch', done => {
            let cbParams;
            slaveEventsRouter.history.getTopSlaves = () => {
                return [{

                }];
            }
            slaveEventsRouter.masterManager.navigator.reLaunch = params => {
                cbParams = params.url;
            }

            dispatchEvent(document, 'backtohome', {
                url: 'mock/backtohome',
                from: 'notRelaunch'
            });
    
            expect(cbParams).toEqual('/mock/backtohome');
            done();
        });
        it('backtohome events from relanch but currentSlaveUrl equal topSlave accessUri ', done => {
            let cbParams;
            const newAppConfig = {
                belongs: 'setConfig',
                pages: [
                    'mock/backtohome'
                ],
                subPackages: [],
                appRootPath
            };
            let mockSlave = new Slave({
                uri: newAppConfig.pages[0],
                appConfig: newAppConfig,
                swaninterface
            });
            slaveEventsRouter.history.getTopSlaves = () => {
                return [mockSlave];
            }
            slaveEventsRouter.masterManager.navigator.reLaunch = params => {
                cbParams = params.url;
            }

            dispatchEvent(document, 'backtohome', {
                url: 'mock/backtohome',
                from: 'relaunch'
            });

            setTimeout(() => {
                expect(cbParams).toBeUndefined();
                done();
            }, 30);
        });
    });

    describe('bindLifeCycleEvent', () => {
        slaveEventsRouter.bindLifeCycleEvent(pageLifeCycleEventEmitter);

        it('should call callPageMethod correctly after PagelifeCycle event was emitted', done => {
            let cbParams;
            slaveEventsRouter.callPageMethod = (slaveId, eventName, args, event) => {
                cbParams = {
                    slaveId,
                    eventName,
                    args,
                    event
                }
            }

            pageLifeCycleEventEmitter.fireMessage({
                type: 'PagelifeCycle',
                params: {
                    eventName: 'onLoad',
                    slaveId
                }
            });

            slaveEventsRouter.masterManager.lifeCycleEventEmitter.fireMessage({
                type: `onShow${slaveId}`,
                event: {
                    wvID: slaveId
                }
            });

            expect(cbParams.slaveId).toEqual(slaveId);
            expect(cbParams.eventName).toEqual('_onShow');
            expect(Object.keys(cbParams.args).length).toEqual(0);
            expect(cbParams.event.wvID).toEqual(slaveId);
            done();
        });

        describe('onTabItemTap event', () => {

            it('should return undefined after onTabItemTap emitted from switchTab', done => {    
                pageLifeCycleEventEmitter.fireMessage({
                    type: 'onTabItemTap',
                    event: {
                        wvID: slaveId,
                        type: 'onTabItemTap',
                        tabIndexPage: 0
                    },
                    from: 'switchTab'
                });
    
                done();
            });

            it('should call callPageMethod correctly after onTabItemTap emitted never from switchTab and the slave existed', done => {
                slaveEventsRouter.history.seek = () => true;
    
                let cbParams;
                slaveEventsRouter.callPageMethod = (wvID, type, event) => {
                    cbParams = {
                        wvID,
                        type,
                        event
                    };
                }
    
                pageLifeCycleEventEmitter.fireMessage({
                    type: 'onTabItemTap',
                    event: {
                        wvID: slaveId,
                        type: 'onTabItemTap',
                        tabIndexPage: 0
                    },
                    from: 'notFromSwitchTab'
                });
    
                expect(cbParams.wvID).toEqual(slaveId);
                expect(cbParams.type).toEqual('_onTabItemTap');
                expect(cbParams.event.wvID).toEqual(slaveId);
                done();
            });

            it('should call callPageMethod correctly after onTabItemTap emitted never from switchTab and the slave does not exist', done => {
                slaveEventsRouter.history.seek = () => false;
    
                let cbParams;
                slaveEventsRouter.callPageMethod = () => {
                    cbParams = {}
                }
    
                pageLifeCycleEventEmitter.fireMessage({
                    type: 'onTabItemTap',
                    event: {
                        wvID: slaveId,
                        type: 'onTabItemTap',
                        tabIndexPage: 0,
                        index: '0',
                        pagePath: '/mock/onTabItemTap'
                    },
                    from: 'notFromSwitchTab'
                });
    
                expect(cbParams).toBeUndefined();
                done();
            });

            it('should call callPageMethod correctly after onTabItemTap emitted from switchTab again', done => {    
                let cbParams;
                slaveEventsRouter.callPageMethod = (wvID, type, event) => {
                    cbParams = {
                        wvID,
                        type,
                        event
                    };
                }

                pageLifeCycleEventEmitter.fireMessage({
                    type: 'onTabItemTap',
                    event: {
                        wvID: slaveId,
                        type: 'onTabItemTap',
                        tabIndexPage: '0/mock/onTabItemTap'
                    },
                    from: 'switchTab'
                });
    
                expect(cbParams.wvID).toEqual(slaveId);
                expect(cbParams.type).toEqual('_onTabItemTap');
                expect(cbParams.event.wvID).toEqual(slaveId);
                expect(cbParams.event.pagePath).toEqual('/mock/onTabItemTap'); // 上一次onTabItemTap记录的
                done();
            });
        });

        it('should call callPageMethod correctly after onHide emitted', done => {    
            let cbParams;
            slaveEventsRouter.callPageMethod = (wvID, type, args, event) => {
                cbParams = {
                    wvID,
                    type,
                    args,
                    event
                };
            }

            slaveEventsRouter.masterManager.lifeCycleEventEmitter.fireMessage({
                type: 'onHide',
                event: {
                    wvID: slaveId,
                    from: 'swan-hide-test'
                }
            });

            expect(cbParams.wvID).toEqual(slaveId);
            expect(cbParams.type).toEqual('_onHide');
            expect(Object.keys(cbParams.args).length).toEqual(0);
            expect(cbParams.event.from).toEqual('swan-hide-test');
            done();
        });

        it('should fire onTabItemTap event correctly after onTabItemTap dispatched', done => {    
            let cbParams;
            pageLifeCycleEventEmitter.onMessage('onTabItemTap', e => {
                cbParams = e;
            });

            dispatchEvent(document, 'onTabItemTap', {
                from: 'swan-onTabItemTap-test'
            });

            expect(cbParams.type).toEqual('onTabItemTap');
            expect(cbParams.event.from).toEqual('swan-onTabItemTap-test');
            done();
        });

        describe('onForceReLaunch', () => {
            it('should call redirectTo correctly while the currentSlave existed', done => {    
                slaveEventsRouter.history.seek = () => {
                    return {
                        userPageInstance: {
                            onForceReLaunch({homePath, pagePath}) {
                                return homePath + pagePath;
                            }
                        }
                    }
                };
    
                let redirectToUrl;
                slaveEventsRouter.masterManager.navigator.redirectTo = ({url}) => {
                    redirectToUrl = url;
                }
    
                let reLaunchParams;
                slaveEventsRouter.masterManager.navigator.reLaunch = ({url, force}) => {
                    reLaunchParams = {
                        url,
                        force
                    };
                }
    
                let cbParams;
                pageLifeCycleEventEmitter.onMessage('onTabItemTap', e => {
                    cbParams = e;
                });
    
                dispatchEvent(document, 'onForceReLaunch', {
                    slaveId,
                    homePath: '/homePath',
                    pagePath: '/pagePath',
                    from: 'swan-onForceReLaunch-test'
                });
    
                expect(redirectToUrl).toEqual('/homePath/pagePath');
                done();
            });

            it('should call reLaunch correctly while the currentSlave does not exist', done => {    
                slaveEventsRouter.history.seek = () => false;

                let reLaunchParams;
                slaveEventsRouter.masterManager.navigator.reLaunch = ({url, force}) => {
                    reLaunchParams = {
                        url,
                        force
                    };
                }
    
                dispatchEvent(document, 'onForceReLaunch', {
                    slaveId,
                    homePath: 'homePath',
                    pagePath: '/pagePath',
                    from: 'swan-onForceReLaunch-test'
                });
    
                expect(reLaunchParams.url).toEqual('/homePath');
                expect(reLaunchParams.force).toEqual(true);
                done();
            });

            it('should call reLaunch correctly while the onForceReLaunch is not a function', done => {    
                slaveEventsRouter.history.seek = () => {
                    return {
                        userPageInstance: {
                            onForceReLaunch: 'isNotAFunction'
                        }
                    }
                };
    
                let reLaunchParams;
                slaveEventsRouter.masterManager.navigator.reLaunch = ({url, force}) => {
                    reLaunchParams = {
                        url,
                        force
                    };
                }
    
                dispatchEvent(document, 'onForceReLaunch', {
                    slaveId,
                    homePath: 'homePath/reLaunch',
                    pagePath: '/pagePath',
                    from: 'swan-onForceReLaunch-test'
                });
    
                expect(reLaunchParams.url).toEqual('/homePath/reLaunch');
                expect(reLaunchParams.force).toEqual(true);
                done();
            });

            it('should be caught and call reLaunch correctly when some error happened', done => {
                slaveEventsRouter.history.seek = () => {
                    return {
                        userPageInstance: {
                            onForceReLaunch({homePath, pagePath}) {
                                catchTips();
                                console.log(a);
                                return homePath + pagePath;
                            }
                        }
                    }
                };

                let reLaunchParams;
                slaveEventsRouter.masterManager.navigator.reLaunch = ({url, force}) => {
                    reLaunchParams = {
                        url,
                        force
                    };
                }

                dispatchEvent(document, 'onForceReLaunch', {
                    slaveId,
                    homePath: 'homePath',
                    pagePath: '/pagePath',
                    from: 'swan-onForceReLaunch-test'
                });

                expect(reLaunchParams.url).toEqual('/homePath');
                expect(reLaunchParams.force).toEqual(true);
                done();
            });
        });
    });
});