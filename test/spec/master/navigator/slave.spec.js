/**
 * @file swan-core test for navigator slave
 * @author lvlei(lvlei03@baidu.com)
 */

import Slave from '../../../../src/master/navigator/slave';
import {swaninterface} from '../../../mock/swan-api';
import {randomNum, type, appRootPath} from '../../../utils';

const slaveId = randomNum();

const slaveConstructorParmas = {
    uri: '/mock/slaveUri',
    slaveId,
    appConfig: {
        appRootPath
    },
    swaninterface
};

const slave = new Slave(slaveConstructorParmas);

describe('slave', () => {
    it('should Slave be a class', done => {
        expect(Slave).toEqual(jasmine.any(Function));
        expect(slave).toEqual(jasmine.any(Object));
        done();
    });

    it('should return a bool after isCreated be called', done => {
        const isCreatedRes = slave.isCreated();
        expect(type(isCreatedRes)).toEqual('Boolean');
        done();
    });

    it('should get uri after getUri be called', done => {
        const getUri = slave.getUri();
        expect(getUri).toEqual(slaveConstructorParmas.uri);
        done();
    });

    it('should set page instance after setUserPageInstance be called', done => {
        const willBeSettedInstance = {
            status: 'mock',
            privateMethod: {
                say() {
                    return 'swanMock';
                }
            }
        };
        slave.setUserPageInstance(willBeSettedInstance);

        expect(slave.userPageInstance.status).toEqual(willBeSettedInstance.status);
        done();
    });

    it('should get pageInstance after getUserPageInstance be called', done => {
        const instance = slave.getUserPageInstance();
        expect(instance.status).toEqual('mock');
        done();
    });

    describe('should change slaveId or status after setSlaveId be called', () => {

        it('should change status after setSlaveId be called', done => {
            const res = slave.setSlaveId(slaveId + '1');
            expect(res).toEqual(jasmine.any(Object));
            expect(slave.status).toEqual(2);
            done();
        });

        it('should change slaveId after setSlaveId be called', done => {
            const res = slave.setSlaveId(slaveId);
            expect(res).toEqual(jasmine.any(Object));
            expect(res.slaveId).toEqual(slaveId);
            done();
        });
    });

    it('should get slaveId after getSlaveId be called', done => {
        const id = slave.getSlaveId();
        expect(id).toEqual(slaveId);
        done();
    });

    it('should get getFrontUri after getFrontUri be called', done => {
        const id = slave.getFrontUri();
        expect(id).toEqual(slaveConstructorParmas.uri);
        done();
    });

    it('should get child after findChild be called', done => {
        const child = slave.findChild();
        expect(child).toEqual(slave);
        done();
    });

    it('should get currentChild after getCurrentChildren be called', done => {
        const currentChild = slave.getCurrentChildren();
        expect(currentChild).toEqual(slave);
        done();
    });

    it('should get undefined when onswitchTab be called', done => {
        const onswitchTabRes = slave.onswitchTab();
        expect(onswitchTabRes).toBeUndefined();
        done();
    });

    it('should get right response when callPrivatePageMethod be called', done => {
        const res = slave.callPrivatePageMethod('say');
        expect(res).toEqual('swanMock');
        done();
    });

    describe('reLaunch', () => {
        const reLaunch = slave.reLaunch;
        it('should reLaunch be a function', done => {
            expect(reLaunch).toEqual(jasmine.any(Function));
            done();
        });

        describe('can call success cb after invoke reLaunch success', () => {

            it('params never includes root', done => {
                const reLaunchRes = reLaunch.call(slave, {
                    status: 'success'
                });
                expect(type(reLaunchRes)).toEqual('Promise');
                reLaunchRes.then(({
                    wvID,
                    resVal
                }) => {
                    expect(resVal).toEqual('success');
                    slave.slaveId = slaveId;
                });
                done();
            });

            it('params includes root', done => {
                const reLaunchRes = reLaunch.call(slave, {
                    status: 'success',
                    hasRoot: true
                });

                expect(type(reLaunchRes)).toEqual('Promise');

                reLaunchRes.then(({
                    wvID,
                    resVal
                }) => {
                    expect(slave.slaveId).toEqual('234');
                    expect(wvID).toEqual('234');
                    expect(resVal).toEqual('success');
                    slave.slaveId = slaveId;
                });
                done();
            });
        });

        it('can call fail cb after invoke reLaunch fail', done => {
            const reLaunchRes = reLaunch.call(slave, {
                status: 'fail'
            });
            expect(type(reLaunchRes)).toEqual('Promise');
            done();
        });
    });

    describe('should return true after isTheSlave be called and the slave existed', () => {

        it('call params is uri', done => {
            const res = slave.isTheSlave('/mock/slaveUri');
            expect(res).toEqual(true);
            done();
        });

        it('call params is slaveId', done => {
            slave.slaveId = slaveId;
            const res = slave.isTheSlave(slaveId);
            expect(res).toEqual(true);
            done();
        });
    });

    describe('init page', () => {
        const init = slave.init;

        it('should init be a function', done => {
            expect(init).toEqual(jasmine.any(Function));
            done();
        });

        it('should return correctly while its params has preventAppLoad', done => {
            const initParams = {
                preventAppLoad: true,
                pageUrl: '/mock/preventAppLoad',
                accessUri: '/mock/preventAppLoad',
                slaveId
            };
            const initRes = init.call(slave, initParams);

            expect(type(initRes)).toEqual('Promise');

            initRes.then(res => {
                expect(res).toEqual(jasmine.objectContaining(initParams));
            });
            done();
        });

        it('should return correctly while it has splitAppJs but not subPackages', done => {
            slave.appConfig.splitAppJs = true;
            slave.appConfig.subPackages = undefined;

            const initParams = {
                pageUrl: '/mock/preventAppLoad',
                accessUri: '/mock/preventAppLoad',
                slaveId
            };
            const initRes = init.call(slave, initParams);

            expect(type(initRes)).toEqual('Promise');

            initRes.then(res => {
                expect(res).toEqual(jasmine.objectContaining(initParams));
            });
            done();
        });
    });

    describe('loadJs method', () => {
        const loadJs = slave.loadJs;

        it('should loadJs be a function', done => {
            expect(loadJs).toEqual(jasmine.any(Function));
            done();
        });

        it('should return correctly when there is app.js split configuration and no subcontracting', done => {
            slave.appConfig.splitAppJs = true;
            const loadJsRes = loadJs.call(slave, {
                pageUrl: 'firstPageUri'
            });
            expect(type(loadJsRes)).toEqual('Promise');
            loadJsRes.then(res => {
                expect(res.pageUrl).toEqual('firstPageUri');
            });
            done();
        });

        it('should return correctly when home page is a subcontract page', done => {
            slave.appConfig.subPackages = [];
            const loadJsRes = loadJs.call(slave, {
                root: 'sub'
            });

            expect(type(loadJsRes)).toEqual('Promise');
            loadJsRes.then(res => {
                expect(res.root).toEqual('sub');
            });
            done();
        });
    });

    describe('loadFirst method', () => {
        const loadFirst = slave.loadFirst;

        it('should loadFirst be a function', done => {
            expect(loadFirst).toEqual(jasmine.any(Function));
            done();
        });

        it('can receive slave slaveAttached', done => {
            slave.loadFirst({
                pageUrl: 'firstPageUri'
            });
            const res = slave.loadJsCommunicator.fireMessage({
                type: 'slaveAttached',
                slaveId
            });
            done();
        });
    });

    describe('loadPages method', () => {
        const loadPages = slave.loadPages;

        it('should loadPages be a function', done => {
            expect(loadPages).toEqual(jasmine.any(Function));
            done();
        });

        it('should return correctly when loadPages be called', done => {
            const res = loadPages.call(slave, {
                root: 'sub'
            });
            expect(res).toBeUndefined();
            // 来自sub/pages
            // expect(window._loadPagesStatus).toEqual(1);
            done();
        });
    });

    it('should return corrently when onEnqueue be called', done => {
        const onEnqueueRes = slave.onEnqueue();

        onEnqueueRes.then(res => {
            expect(res).toEqual('loadJs');
        });
        done();
    });

    describe('slave open method', () => {
        const open = slave.open;

        it('should open be a function', done => {
            expect(open).toEqual(jasmine.any(Function));
            done();
        });

        it('params never includes root', done => {
            const openRes = open.call(slave, {
                root: 'sub'
            });

            expect(type(openRes)).toEqual('Promise');

            openRes.then(({wvID, resVal}) => {
                expect(slave.slaveId).toEqual('233');
                expect(wvID).toEqual('233');
                expect(resVal).toEqual('success');
                slave.slaveId = slaveId;
            });
            done();
        });

        it('params includes root', done => {
            const openRes = open.call(slave, {
                root: 'sub',
                isFail: true
            });

            expect(type(openRes)).toEqual('Promise');

            openRes.then(({wvID, resVal}) => {
                expect(slave.slaveId).toEqual('233');
                expect(wvID).toEqual('233');
                expect(resVal).toEqual('success');
                slave.slaveId = slaveId;
            });
            done();
        });
    });

    describe('openPage', () => {

        it('should call fail and rejected when some error happened', done => {
            const params = {
                url: 'test/openPage',
                isFail: true
            }
            const openPageRes = slave.openPage(params);
    
            openPageRes.catch(res => {
                expect(res.url).toEqual(params.url);
            });
            done();
        });

        it('should call success and resolved when open page success', done => {
            const params = {
                url: 'test/openPage',
                root: 'sub'
            }
            const openPageRes = slave.openPage(params);
    
            openPageRes.then(res => {
                expect(res.url).toEqual(params.url);
                expect(res.root).toEqual(params.root);
            });
            done();
        });
    });

    describe('redirectToPage test', () => {
        const redirectToPage = slave.redirectToPage;

        it('should redirect be a function', done => {
            expect(redirectToPage).toEqual(jasmine.any(Function));
            done();
        });

        it('params not includes root', done => {
            const params = {
                url: 'test/redirectToPage'
            };
            const redirectRes = redirectToPage.call(slave, params);

            expect(type(redirectRes)).toEqual('Promise');

            redirectRes.then(res => {
                expect(res.url).toEqual(params.url);
            });
            done();
        });

        it('params includes root', done => {
            const params = {
                url: 'test/redirectToPage',
                root: 'sub'
            };
            const redirectRes = redirectToPage.call(slave, params);

            expect(type(redirectRes)).toEqual('Promise');

            redirectRes.then(res => {
                expect(res.url).toEqual(params.url);
                expect(res.root).toEqual(params.root);
            });
            done();
        });

        it('should call fail and rejected when some error happened', done => {
            const params = {
                url: 'test/redirectToPage',
                root: 'sub',
                isFail: true
            };
            const redirectRes = redirectToPage.call(slave, params);

            redirectRes.catch(res => {
                expect(res.url).toEqual(params.url);
                expect(res.root).toEqual(params.root);
                expect(res.isFail).toEqual(params.isFail);
            })
            done();
        });
    });

    it('should return resolved promise after createPageInstance be called and slave status is isCreated', done => {
        slave.status = 3;
        const createPageInstanceRes = slave.createPageInstance();

        expect(type(createPageInstanceRes)).toEqual('Promise');

        createPageInstanceRes.then(() => {
            slave.status++;
            expect(slave.status).toEqual(4);
        });
        done();
    });

    it('should call swan.reLaunch after switchTab be called', done => {
        const cacheMethod = slave.swaninterface.swan.reLaunch;

        slave.swaninterface.swan.reLaunch = params => params;

        const params = {
            url: 'test/switchTab',
            from: 'switchTab'
        };
        const res = slave.switchTab(params);

        expect(res.url).toEqual(`/${params.url}`);
        expect(res.from).toEqual(params.from);

        slave.swaninterface.swan.reLaunch = cacheMethod;
        done();
    });
});

