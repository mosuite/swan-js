/**
 * @file swan-core test for page prototype
 * @author lvlei(lvlei03@baidu.com)
 */

import {getPagePrototypeInstance} from '../../../../src/master/page/page-prototype'; 
import EventsEmitter from '../../../../src/utils/events-emitter';
import {randomNum, catchTips} from '../../../utils';
import {Data} from '../../../../src/utils/data';
import {swan} from '../../../mock/swan-api';

describe('page prototype test', () => {

    const navigate = {
        navigateStatus: 0,
        redirectToStatus: 0,
        switchTabStatus: 0,
        reLaunchStatus: 0,
        navigateBackStatus: 0
    };

    const instance = getPagePrototypeInstance(window.masterManager, swan, new EventsEmitter());

    const initData = {
        from: 'initData',
        custom: 'customInitData',
        arr: [1]
    };

    Object.assign(instance, {
        privateProperties: {
            raw: new Data(initData),
            slaveId: randomNum(),
            share: {
                shareAction() {
                    return Promise.resolve()
                }
            },
            customComponents: {
                _2c76: {
                    componentName: 'custom',
                    data: {
                        from: 'haha'
                    },
                    className: 'custom',
                    nodeId: 'custom',
                    ownerId: '_2c75'
                },
                _2c74: {
                    componentName: 'custom-parent',
                    data: {
                        from: 'custom-parent'
                    },
                    className: 'custom-parent',
                    nodeId: 'custom-parent',
                    ownerId: '_2c73'
                }
            }
        }
    });

    it('should return an object after getPagePrototypeInstance be called', done => {
        expect(instance).toEqual(jasmine.any(Object));
        done();
    });

    describe('data operation', () => {

        it('should get instance data correctly after getData be called', done => {
            expect(instance.getData).toEqual(jasmine.any(Function));
            const from = instance.getData('from');
            const initData = 'initData';
            expect(from).toEqual(initData);
            done();
        });

        it('should set new data correctly after setData be called', done => {
            expect(instance.setData).toEqual(jasmine.any(Function));
            instance.setData('from', 'afterData');
            const from = instance.getData('from');
            const afterData = 'afterData';
            expect(from).toEqual(afterData);
            done();
        });

        it('should set set new data correctly after setData be called with arguments 1 is an object', done => {
            instance.setData({'from': 'afterData1'});
            const from = instance.getData('from');
            const afterData = 'afterData1';
            expect(from).toEqual(afterData);
            done();
        });

        it('should set set new data correctly after setData be called with arguments 2 is a function', done => {
            const cb = () => {};
            instance.setData({'from': 'afterData2'}, cb);
            const from = instance.getData('from');
            const afterData = 'afterData2';
            expect(from).toEqual(afterData);
            done();
        });

        it('should push a data correctly after pushData be called', done => {
            expect(instance.pushData).toEqual(jasmine.any(Function));

            instance.setData('arr', []);
            instance.pushData('arr', 1);

            const afterArr = instance.getData('arr');

            expect(afterArr[0]).toEqual(1);
            done();
        });

        it('should pop a data correctly after popData be called', done => {
            expect(instance.popData).toEqual(jasmine.any(Function));

            instance.setData('arr', [2]);
            instance.popData('arr');

            const afterArr = instance.getData('arr');

            expect(afterArr.length).toEqual(0);
            done();
        });

        it('should unshift a data correctly after unshiftData be called', done => {
            expect(instance.unshiftData).toEqual(jasmine.any(Function));

            instance.setData('arr', [3]);
            instance.unshiftData('arr', 4);

            const afterData = instance.getData('arr');

            expect(afterData[0]).toEqual(4);
            expect(afterData[1]).toEqual(3);
            done();
        });

        it('should shift a data correctly after shiftData be called', done => {
            expect(instance.shiftData).toEqual(jasmine.any(Function));
            
            instance.setData('arr', [5]);

            instance.shiftData('arr');

            const afterData = instance.getData('arr');

            expect(afterData.length).toEqual(0);
            done();
        });

        it('can remove a data correctly after removeAtData be called', done => {
            expect(instance.removeAtData).toEqual(jasmine.any(Function));
            instance.removeAtData('arr');
            done();
        });

        it('can splice a data correctly after spliceData be called', done => {
            expect(instance.spliceData).toEqual(jasmine.any(Function));

            instance.setData('arr', [6]);
            instance.spliceData('arr', 0);

            const afterData = instance.getData('arr');

            expect(afterData.length).toEqual(0);
            done();
        });
    });

    describe('customComponent data operation', () => {

        beforeAll(() => {
            spyOn(instance, 'nextTick');
        });

        it('should call nextTick after customComponent setData be called', done => {
            instance.sendDataOperation({
                path: 'custom',
                value: 'modifiedCustomData',
                type: 'setCustomComponent',
                cb: () => {},
                options: {
                    nodeId: randomNum()
                }
            });

            expect(instance.nextTick).toHaveBeenCalled();
            done();
        });
    });

    describe('page prototype API createCanvasContext test', () => {

        it('should return an array correctly after createCanvasContext be called', done => {
            expect(instance.createCanvasContext).toEqual(jasmine.any(Function));
            const cvsRes = instance.createCanvasContext({
                from: 'canvas'
            });
            expect(cvsRes).toEqual(jasmine.any(Array));
            expect(cvsRes[0].from).toEqual('canvas');
            done();
        });
    });

    describe('select customComponent test', () => {

        it('should get an array correctly after selectAllComponents be called with selector is an id', done => {
            expect(instance.selectAllComponents).toEqual(jasmine.any(Function));

            const selectAllRes = instance.selectAllComponents('#custom');
            expect(selectAllRes).toEqual(jasmine.any(Array));
            done();
        });

        it('should get an array correctly after selectAllComponents be called with selector is class', done => {
            expect(instance.selectAllComponents).toEqual(jasmine.any(Function));

            const selectAllRes = instance.selectAllComponents('.custom');
            expect(selectAllRes).toEqual(jasmine.any(Array));
            done();
        });

        it('should get an array correctly after selectAllComponents be called while it has parentId', done => {
            instance.privateProperties.customComponents._2c76.parentId = '_2c74';
            expect(instance.selectAllComponents).toEqual(jasmine.any(Function));

            const selectAllRes = instance.selectAllComponents('.haha .custom');
            expect(selectAllRes).toEqual(jasmine.any(Array));
            done();
        });

        it('should get an array correctly after selectComponent be called', done => {
            expect(instance.selectComponent).toEqual(jasmine.any(Function));

            const selectAllRes = instance.selectComponent('.custom');
            expect(selectAllRes).toEqual(jasmine.any(Object));
            done();
        });
    });

    describe('page prototype privateMethod test', () => {
        const privateMethod = instance.privateMethod;

        it('should privateMethod be an object', done => {
            expect(privateMethod).toEqual(jasmine.any(Object));
            done();
        });

        it('sendInitData test', done => {
            expect(privateMethod.sendInitData).toEqual(jasmine.any(Function));

            // 预留
            privateMethod.sendInitData.call(instance, {});
            done();
        });

        it('should call navigate correctly after privateMethod navigate be called with openType is navigate', done => {
            expect(privateMethod.sendInitData).toEqual(jasmine.any(Function));
            privateMethod.navigate.call(instance, {
                openType: 'navigate',
                uri: {
                    cb() {
                        navigate.navigateStatus++;
                    }
                }
            });

            expect(navigate.navigateStatus).toEqual(1);
            done();
        });

        it('should call redirect correctly after privateMethod navigate be called with openType is redirect', done => {
            privateMethod.navigate.call(instance, {
                openType: 'redirect',
                uri: {
                    cb() {
                        navigate.redirectToStatus++;
                    }
                }
            });

            expect(navigate.redirectToStatus).toEqual(1);
            done();
        });

        it('should call switchTab correctly after privateMethod navigate be called with openType is switchTab', done => {
            privateMethod.navigate.call(instance, {
                openType: 'switchTab',
                uri: {
                    cb() {
                        navigate.switchTabStatus++;
                    }
                }
            });

            expect(navigate.switchTabStatus).toEqual(1);
            done();
        });

        it('should call reLaunch correctly after privateMethod navigate be called with openType is reLaunch', done => {
            privateMethod.navigate.call(instance, {
                openType: 'reLaunch',
                uri: {
                    cb() {
                        navigate.reLaunchStatus++;
                    }
                }
            });
            expect(navigate.reLaunchStatus).toEqual(1);
            done();
        });

        it('should call navigateBack correctly after privateMethod navigate be called with openType is navigateBack', done => {
            privateMethod.navigate.call(instance, {
                openType: 'navigateBack',
                delta: '1'
            });
            done();
        });

    });

    describe('lifecycle test', () => {
        const privateMethod = instance.privateMethod;
        const lifecycle = {
            onReadyStatus: 0,
            onReadyParams: null,

            reachBottomStatus: 0,
            reachBottomParams: null,

            onPageScrollStatus: 0,
            onPageScrollParams: null,

            onPageRenderStatus: 0,
            onPageRenderParams: null,

            shareStatus: 0,
            shareParams: null,

            pullDownRefreshStatus: 0,
            pullDownRefreshParams: null,

            nextTickReachStatus: 0
        };

        it('rendered', done => {
            instance._onReady = e => {
                lifecycle.onReadyStatus++;
                lifecycle.onReadyParams = e;
            };
            const res = privateMethod.rendered.call(instance, {});

            expect(res).toBeUndefined();
            expect(lifecycle.onReadyStatus).toEqual(1);
            expect(lifecycle.onReadyParams).toEqual(jasmine.any(Object));
            done();
        });

        it('onPageRender', done => {
            instance.privateMethod.registerCustomComponents = e => {
                lifecycle.onPageRenderStatus++;
                lifecycle.onPageRenderParams = e;
            };
            const res = privateMethod.onPageRender.call(instance, {
                customComponents: [{}]
            });

            expect(res).toBeUndefined();
            expect(lifecycle.onPageRenderStatus).toEqual(1);
            expect(lifecycle.onPageRenderParams.length).toEqual(1);
            done();
        });

        it('reachBottom', done => {
            instance._reachBottom = e => {
                lifecycle.reachBottomStatus++;
                lifecycle.reachBottomParams = e;
            };
            privateMethod.reachBottom.call(instance, {
                from: 'reachBottom'
            });

            expect(lifecycle.reachBottomStatus).toEqual(1);
            expect(lifecycle.reachBottomParams.from).toEqual('reachBottom');
            done();
        });

        it('onPageScroll', done => {
            instance._onPageScroll = e => {
                lifecycle.onPageScrollStatus++;
                lifecycle.onPageScrollParams = e;
            };
            privateMethod.onPageScroll.call(instance, {
                event: 'onPageScroll'
            });

            expect(lifecycle.onPageScrollStatus).toEqual(1);
            expect(lifecycle.onPageScrollParams).toEqual('onPageScroll');
            done();
        });

        describe('share', () => {
            it('should params not includes webViewUrl after share be called from button', done => {
                instance._share = e => {
                    lifecycle.shareStatus++;
                    lifecycle.shareParams = e;
                };
                privateMethod.share.call(instance, {
                    webViewUrl: '/mock/webViewUrl1'
                });

                expect(lifecycle.shareStatus).toEqual(1);
                expect(lifecycle.shareParams.from).toEqual('button');
                expect(lifecycle.shareParams.target.webViewUrl).toEqual('/mock/webViewUrl1');
                expect(lifecycle.shareParams.webViewUrl).toBeUndefined();
                done();
            });

            it('should params includes webViewUrl after share be called from menu', done => {
                instance._share = e => {
                    lifecycle.shareStatus++;
                    lifecycle.shareParams = e;
                };
                privateMethod.share.call(instance, {
                    webViewUrl: '/mock/webViewUrl2'
                }, 'menu');

                expect(lifecycle.shareStatus).toEqual(2);
                expect(lifecycle.shareParams.from).toEqual('menu');
                expect(lifecycle.shareParams.webViewUrl).toEqual('/mock/webViewUrl2');
                done();
            });
        });

        it('pullDownRefresh', done => {
            instance._pullDownRefresh = e => {
                lifecycle.pullDownRefreshStatus++;
                lifecycle.pullDownRefreshParams = e;
            };
            privateMethod.pullDownRefresh.call(instance, {
                from: 'pullDownRefresh'
            });

            expect(lifecycle.pullDownRefreshStatus).toEqual(1);
            expect(lifecycle.pullDownRefreshParams.from).toEqual('pullDownRefresh');
            done();
        });

        it('should call send message to slave while accountChange be called', done => {
            let sendMessageParams;
            const cacheCommunicator = window.masterManager.communicator;
            Object.defineProperty(window.masterManager.communicator, 'sendMessage', {
                value: (slaveId, params) => {
                    sendMessageParams = params;
                }
            });
            privateMethod.accountChange.call(instance, {
                from: 'accountChange'
            });

            expect(sendMessageParams.type).toEqual('openDataAccountChange');

            window.masterManager.communicator = cacheCommunicator;
            done();
        });

        it('should call nextTick method after nextTickReach message already arrived', done => {
            masterManager.communicator.onMessage(`nextTick:${instance.privateProperties.slaveId}`, () => {
                lifecycle.nextTickReachStatus++;
            });
            privateMethod.nextTickReach.call(instance, {});

            expect(lifecycle.nextTickReachStatus).toEqual(1);
            done();
        });

        it('should return undefined while dispatchToSlave be called', done => {
            const res = privateMethod.dispatchToSlave.call(instance, {});
            expect(res).toBeUndefined();
            done();
        });
    });

    describe('callComponentMethod', () => {
        const privateMethod = instance.privateMethod;
        let callComponentMethodStatus = 0;
        let callComponentMethodParma = null;

        instance.privateProperties.customComponents['_2c76'].mock = e => {
            callComponentMethodStatus++;
            callComponentMethodParma = e;
        };

        it('should call reflectComponent method after callComponentMethod be called and its method existed', done => {
            privateMethod.callComponentMethod.call(instance, '_2c76', {
                e: {
                    from: 'mock'
                },
                reflectMethod: 'mock'
            });

            expect(callComponentMethodStatus).toEqual(1);
            expect(callComponentMethodParma.from).toEqual('mock');
            done();
        });

        it('should console error after callComponentMethod be called and its method does not exist', done => {

            privateMethod.callComponentMethod.call(instance, '_2c76', {
                e: {
                    from: 'mock'
                },
                reflectMethod: 'notExistMethod'
            });

            catchTips();
            expect(callComponentMethodStatus).toEqual(1); // will not change
            expect(callComponentMethodParma.from).toEqual('mock');
            done();
        });
    });

    describe('callMethod', () => {
        const privateMethod = instance.privateMethod;
        let status = 0;
        let params;

        instance.mockMethod = e => {
            status++;
            params = e;
        };

        it('should call mockMethod correctly after callMethod be called', done => {
            instance.privateProperties.hooks = [{
                events: {
                    '[data-just-from="custom"]:mock': () => {}
                }
            }];

            privateMethod.callMethod.call(instance, 'mockMethod', {
                e: {
                    from: 'mockMethod',
                    currentTarget: {
                        dataset: {
                            justFrom: 'custom'
                        }
                    }
                },
                eventType: 'mock'
            });

            expect(status).toEqual(1);
            expect(params.from).toEqual('mockMethod');
            done();
        });

        it('should call mockMethod again correctly after callMethod be called', done => {
            instance.privateProperties.hooks = [{
                events: {
                    '[data-just-from="other-custom"]:mock': () => {}
                }
            }];

            privateMethod.callMethod.call(instance, 'mockMethod', {
                e: {
                    from: 'mockMethod',
                    currentTarget: {
                        dataset: {
                            justFrom: 'custom'
                        }
                    }
                },
                eventType: 'mock'
            });

            expect(status).toEqual(2);
            expect(params.from).toEqual('mockMethod');
            done();
        });
    });
});