/**
 * @file swan-core test for api-proccessor
 * @author lvlei(lvlei03@baidu.com)
 */

import {apiProccess} from '../../../../src/master/proccessors/api-proccessor';
import {swaninterface, swan} from '../../../mock/swan-api';
import EventsEmitter from '../../../../src/utils/events-emitter';
import Communicator from '../../../../src/utils/communication';
import {randomNum, type} from '../../../utils';
import {dispatchEvent} from '../../../mock/swan-na';

const slaveId = randomNum();

const originSwan = Object.assign(swaninterface.swan, swan || {}, {
    request: function (params) {
        params.success && params.success(params);
        return 'originReq';
    }
});

const swanComponents = {
    getContextOperators(swaninterface, communicator, getSlaveId) {
        const slaveId = getSlaveId();
        return {
            createSelectorQuery() {
                return `createSelectorQuery_${slaveId}`;
            }
        };
    }
};

const navigator = {
    history: {
        getTopSlaves() {
            return [{
                getSlaveId() {
                    return slaveId;
                }
            }];
        }
    },
    navigateTo() {},
    navigateBack() {},
    redirectTo() {},
    switchTab() {},
    reLaunch() {}
};

const swanEventsCommunicator = new EventsEmitter();
const pageLifeCycleEventEmitter = new EventsEmitter();
const appLifeCycleEventEmitter = new EventsEmitter();

const processedAPI = apiProccess(originSwan, {
    navigator,
    swanComponents,
    pageLifeCycleEventEmitter,
    appLifeCycleEventEmitter,
    swanEventsCommunicator,
    hostShareParamsProccess(userParams, appInfo) {
        return {
            userParams,
            appInfo
        };
    },
    communicator: new Communicator(swaninterface),
    swaninterface
});

describe('processapi', () => {

    beforeAll(() => {
        spyOn(navigator.history, 'getTopSlaves');
    });

    it('should processedAPI is an object', done => {
        expect(processedAPI).toEqual(jasmine.any(Object));
        done();
    });

    describe('navigator', () => {

        // 检测有没有被挂载上
        it('should navigateTo be a function', done => {
            expect(processedAPI.navigateTo).toEqual(jasmine.any(Function));
            done();
        });

        it('should navigateBack be a function', done => {
            expect(processedAPI.navigateBack).toEqual(jasmine.any(Function));
            done();
        });

        it('should redirectTo be function', done => {
            expect(processedAPI.redirectTo).toEqual(jasmine.any(Function));
            done();
        });

        it('should switchTab be a function', done => {
            expect(processedAPI.switchTab).toEqual(jasmine.any(Function));
            done();
        });

        it('should reLaunch be a function', done => {
            expect(processedAPI.reLaunch).toEqual(jasmine.any(Function));
            done();
        });
    });

    it('should getContextOperators be a function and it has a correct response', done => {
        const createSelectorQuery = processedAPI.createSelectorQuery;

        expect(createSelectorQuery).toEqual(jasmine.any(Function));
        expect(createSelectorQuery()).toEqual(`createSelectorQuery_${slaveId}`);
        done();
    });

    describe('reportAnalytics', () => {
        const reportAnalytics = processedAPI.reportAnalytics;

        it('should reportAnalytics be a function', done => {
            expect(reportAnalytics).toEqual(jasmine.any(Function));
            done();
        });

        it('should reportAnalytics has a correct response', done => {
            const reportAnalyticsManager = {
                status: 0,
                params: null
            };

            swanEventsCommunicator.onMessage('SwanEvents', e => {
                reportAnalyticsManager.status++;
                reportAnalyticsManager.params = e.params;
            });

            const reportAnalyticsRes = reportAnalytics('reportName', {
                from: 'reportAnalytics'
            });

            expect(reportAnalyticsRes).toEqual(jasmine.any(Object));

            const {
                status,
                params
            } = reportAnalyticsManager;

            expect(status).toEqual(1);
            expect(params.e).toEqual(jasmine.objectContaining({
                reportName: 'reportName',
                reportParams: {
                    from: 'reportAnalytics'
                }
            }));
            done();
        });
    });

    describe('setPageInfo', () => {
        const setPageInfo = processedAPI.setPageInfo;

        it('should setPageInfo be a function', done => {
            expect(setPageInfo).toEqual(jasmine.any(Function));
            done();
        });

        it('should setPageInfo has a correct response', done => {
            const setPageInfoManager = {
                status: 0,
                params: null
            };
            swanEventsCommunicator.onMessage('SwanEvents', e => {
                setPageInfoManager.status++;
                setPageInfoManager.params = e.params;
            });

            const setPageInfoRes = setPageInfo({pv: 100});

            expect(setPageInfoRes).toEqual(jasmine.any(Object));

            const {
                status,
                params
            } = setPageInfoManager;

            expect(status).toEqual(1);
            expect(params.e).toEqual(jasmine.objectContaining({pv: 100}));
            done();
        });
    });

    describe('openShare', () => {
        const openShare = processedAPI.openShare;

        it('should openShare be a function', done => {
            expect(openShare).toEqual(jasmine.any(Function));
            done();
        });

        it('should reportAnalytics has a correct response', done => {
            const openShareRes = openShare({
                from: 'openShareRes'
            });

            expect(openShareRes).toEqual(jasmine.any(Object));

            const appInfo = swaninterface.boxjs.data.get({name: 'swan-appInfoSync'});

            expect(openShareRes).toEqual(jasmine.objectContaining({
                userParams: {
                    from: 'openShareRes'
                },
                appInfo
            }));
            done();
        });
    });

    describe('login API', () => {
        const login = processedAPI.login;

        it('should login be a function', done => {
            expect(login).toEqual(jasmine.any(Function));
            done();
        });

        it('should call originSwan login after login be called with app onshow', done => {
            const loginParams = {
                belongs: 'beforeAppShow',
                success() {},
                fail() {}
            };
            const loginRes = login(loginParams);

            expect(loginRes.belongs).toEqual(loginParams.belongs);
            expect(loginRes.fail).toEqual(jasmine.any(Function));
            done();
        });

        it('can send it arbitrarily when it does not exist in the show app lifecycles', done => {
            appLifeCycleEventEmitter.fireMessage({
                type: 'ApplifeCycle',
                params: {
                    eventName: 'onPreShow'
                }
            });

            const loginParams = {
                belongs: 'app-onPreShow',
                success() {},
                fail() {}
            };
            const loginRes = login(loginParams);

            expect(loginRes.belongs).toEqual(loginParams.belongs);
            expect(loginRes.success).toEqual(jasmine.any(Function));

            done();
        });

        it('can send it arbitrarily when it does not exist in the show page lifecycles', done => {
            pageLifeCycleEventEmitter.fireMessage({
                type: 'PagelifeCycle',
                params: {
                    eventName: 'onPreShow'
                }
            });

            let failCbStatus = 0;
            const loginParams = {
                belongs: 'page-onPreShow',
                success() {},
                fail() {
                    failCbStatus++;
                }
            };
            const loginRes = login(loginParams);

            expect(loginRes).toEqual(false);
            expect(failCbStatus).toEqual(1);
            setTimeout(() => {
                done();
            }, 2e3);
        });
    });

    describe('onUserCaptureScreen API', () => {
        const onUserCaptureScreenMap = {
            cb() {}
        };

        beforeAll(() => {
            spyOn(onUserCaptureScreenMap, 'cb');
        });

        const onUserCaptureScreen = processedAPI.onUserCaptureScreen;

        it('should onUserCaptureScreen be a function', done => {
            expect(onUserCaptureScreen).toEqual(jasmine.any(Function));
            done();
        });

        it('should onUserCaptureScreen has a correct response', done => {
            onUserCaptureScreen(onUserCaptureScreenMap.cb);

            dispatchEvent(document, 'onUserCaptureScreen', () => {});

            expect(onUserCaptureScreenMap.cb).toHaveBeenCalled();
            done();
        });
    });

    describe('nextTick API', () => {
        let nextTickStatus = 0;

        const nextTick = processedAPI.nextTick;

        it('should nextTick be a function', done => {
            expect(nextTick).toEqual(jasmine.any(Function));
            done();
        });

        it('should nextTick cb be called correctly in the next time period', done => {
            nextTick(() => {
                nextTickStatus++;
                expect(nextTickStatus).toEqual(1);
            });

            expect(nextTickStatus).toEqual(0);
            done();
        });
    });

    describe('sendFrameWorkLog', () => {
        const sendFrameWorkLog =  processedAPI.sendFrameWorkLog;
        it('should sendFrameWorkLog be a function', done => {
            expect(type(sendFrameWorkLog)).toEqual('Function');
            sendFrameWorkLog({
                convertType: 2,
                success: function (res) {
                    expect(type(res)).toEqual('Object');
                    expect(type(res.data)).toEqual('Object');
                    done();
                }
            });
        });
    });

    describe('after test', () => {
        const after =  processedAPI.after;

        it('should after be a function', done => {
            expect(type(after)).toEqual('Function');
            done();
        });

        it('actions property value is not a function', done => {
            const actions = {
                strUseForAfter: 'str'
            };

            const res = after.call(processedAPI, actions);

            expect(res).toBeUndefined();
            done();
        });

        it('should actions property value be a function and has some correct response', done => {
            const actions = {
                request(params) {
                    return params;
                }
            };

            after.call(processedAPI, actions);

            const actionCalledRes = processedAPI.request({
                from: 'newReq'
            });

            expect(actionCalledRes.returnValue).toEqual('originReq');
            expect(actionCalledRes.args[0].from).toEqual('newReq');
            expect(actionCalledRes.thisObject.request).toEqual(jasmine.any(Function));
            done();
        });

        it('should actions property value be an object while the success and returning does not exist', done => {
            const actions = {
                useForAfter: {}
            };

            after.call(processedAPI, actions);

            const actionCalledRes = processedAPI.useForAfter({
                success() {}
            });

            expect(actionCalledRes.success).toEqual(jasmine.any(Function));
            done();
        });

        it('should actions property value be an object while the returning does not exist', done => {
            const useForAfterPool = {
                status: 0,
                params: null
            };

            const actions = {
                useForAfter: {
                    success(params) {
                        useForAfterPool.status++;
                        useForAfterPool.params = params;
                        return params;
                    }
                }
            };

            after.call(processedAPI, actions);

            const useForAfterParams = {
                success(params) {
                    return params;
                }
            };

            const actionCalledRes = processedAPI.useForAfter(useForAfterParams);
            expect(actionCalledRes.success).toEqual(jasmine.any(Function));

            useForAfterParams.success({
                from: 'success'
            });

            expect(useForAfterPool.status).toEqual(1);
            expect(useForAfterPool.params.args[0].from).toEqual('success');
            done();
        });

        it('should actions property value be an object while the success and returning existed', done => {
            const actions = {
                useForAfter: {
                    success(params) {
                        return params;
                    },
                    returning(params) {
                        return params;
                    }
                }
            };

            after.call(processedAPI, actions);

            const useForAfterParams = {
                success(params) {
                    return params;
                }
            };

            const actionCalledRes = processedAPI.useForAfter(useForAfterParams);

            expect(actionCalledRes.args.success).toEqual(jasmine.any(Function));
            expect(actionCalledRes.returnValue).toEqual(jasmine.any(Object));
            done();
        });
    });
});
