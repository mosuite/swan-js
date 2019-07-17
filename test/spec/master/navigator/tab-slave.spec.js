/**
 * @file swan-core test for navigator tab slave
 * @author lvlei(lvlei03@baidu.com)
 */

import TabSlave from '../../../../src/master/navigator/tab-slave';
import {swaninterface} from '../../../mock/swan-api';
import {randomNum, type, appRootPath} from '../../../utils';

const slaveId = randomNum();

const tabSlaveConstructorParmas = {
    list: [{
        pagePath: '/mock/tabslave0',
        uri: '/mock/tabslave0'
    }, {
        pagePath: '/mock/tabslave1',
        uri: '/mock/tabslave1'
    }],
    currentIndex: 0,
    appConfig: {
        appRootPath
    },
    swaninterface
};

const tabSlave = new TabSlave(tabSlaveConstructorParmas);

describe('TabSlave', () => {
    it('should TabSlave be a class', done => {
        expect(TabSlave).toEqual(jasmine.any(Function));
        expect(tabSlave).toEqual(jasmine.any(Object));
        done();
    });

    it('can constructMySlave create a single slave', done => {
        const constructMySlaveRes = tabSlave.constructMySlave();
        expect(constructMySlaveRes).toEqual(jasmine.any(Object));
        done();
    });

    it('can isTheSlave function identife the slave with uri', done => {
        let isTheSlaveRes;
        isTheSlaveRes = tabSlave.isTheSlave('/mock/tabslave0');

        expect(isTheSlaveRes).toEqual(true);

        isTheSlaveRes = tabSlave.isTheSlave('/mock/tabslave_nopage');

        expect(isTheSlaveRes).toEqual(false);
        done();
    });

    it('can get slaveId correctly after getSlaveId be called', done => {
        tabSlave.children.forEach((slave, i) => {
            slave.setSlaveId(`${slaveId}${i}`);
        });

        let id;
        id = tabSlave.getSlaveId();

        expect(id).toEqual(`${slaveId}0`);

        tabSlave.currentIndex = 1;
        id = tabSlave.getSlaveId();

        expect(id).toEqual(`${slaveId}1`);

        tabSlave.currentIndex = 0;
        done();
    });

    it('can seek slave correctly after seekSlaveQueue be called with parameter is a uri', done => {
        const uri = '/mock/tabslave0';
        const slaveQueue = tabSlave.seekSlaveQueue(uri);

        expect(slaveQueue).toEqual(jasmine.any(Array));
        expect(slaveQueue[0].uri).toEqual(uri);
        done();
    });

    it('can seek slave child correctly after findChild be called with parameter is a uri', done => {
        const uri = '/mock/tabslave0';
        const child = tabSlave.findChild(uri);

        expect(child).toEqual(jasmine.any(Object));
        expect(child.uri).toEqual(uri);
        done();
    });

    it('can seek slave child index correctly after findChildIndex be called with parameter is a uri', done => {
        const uri = '/mock/tabslave0';
        const childIndex = tabSlave.findChildIndex(uri);

        expect(childIndex).toEqual(0);
        done();
    });

    it('can get child index correctly after getIndexBySlaveId be called with parameter is a slaveId', done => {
        const id = `${slaveId}0`;
        const childIndex = tabSlave.getIndexBySlaveId(id);

        expect(childIndex).toEqual(0);
        done();
    });

    it('can get current child correctly after getCurrentChildren be called', done => {
        const id = `${slaveId}1`;
        const child = tabSlave.getCurrentChildren(id);

        expect(child.accessUri).toEqual(tabSlaveConstructorParmas.list[0].uri);
        done();
    });

    it('can init slave correctly after init be called', done => {
        const initRes = tabSlave.init({});
        expect(type(initRes)).toEqual('Promise');
        done();
    });

    it('can get current slave uri correctly after getUri be called', done => {
        const currentUri = tabSlave.getUri();
        expect(currentUri).toEqual('/mock/tabslave0');
        done();
    });

    it('can get current slave front uri correctly after getFrontUri be called', done => {
        const frontUri = tabSlave.getFrontUri();
        expect(frontUri).toEqual('/mock/tabslave0');
        done();
    });

    it('can call slave methods correctly after callPrivatePageMethod be called', done => {
        let status = 0;
        tabSlave.children.forEach(child => {
            child.userPageInstance = {
                privateMethod: {
                    custom() {
                        status++;
                    }
                }
            };
        });
        tabSlave.callPrivatePageMethod('custom');

        expect(status).toEqual(2);
        done();
    });

    it('should set currentIndex when setToIndex be called with uri', done => {
        const currentIndex = tabSlave.setToIndex('/mock/tabslave1');
        expect(currentIndex).toEqual(1);
        done();
    });

    it('should set currentIndex when setCurrentIndex be called with index', done => {
        const currentIndex = tabSlave.setCurrentIndex(0);
        expect(currentIndex).toBeUndefined();
        expect(tabSlave.currentIndex).toEqual(0);
        done();
    });

    describe('reLaunch', () => {
        const reLaunch = tabSlave.reLaunch;

        it('should reLaunch be a function', done => {
            expect(reLaunch).toEqual(jasmine.any(Function));
            done();
        });

        it('should return correctly after reLaunch be called', done => {
            const paramsObj = {
                url: '/mock/tabslave1'
            };
            const reLaunchRes = reLaunch.call(tabSlave, paramsObj);
            expect(type(reLaunchRes)).toEqual('Promise');
            done();
        });
    });

    describe('switchTab', () => {
        const switchTab = tabSlave.switchTab;

        it('should switchTab be a function', done => {
            expect(switchTab).toEqual(jasmine.any(Function));
            done();
        });

        it('should call success after switchTab be called', done => {
            let status = 0;
            const paramsObj = {
                success() {
                    status++;
                }
            };
            switchTab.call(tabSlave, paramsObj);
            expect(status).toEqual(1);
            done();
        });
    });

    describe('onswitchTab test', () => {
        const onswitchTab = tabSlave.onswitchTab;

        it('should onswitchTab be a function', done => {
            expect(onswitchTab).toEqual(jasmine.any(Function));
            done();
        });

        it('should call getCurrentChildren correctly after onswitchTab be called could found the slave', done => {
            const paramsObj = {
                fromId: '/mock/tabslave0',
                toId: `${slaveId}5`,
                toPage: '/mock/tabslave1',
                toTabIndex: 1
            };

            const onswitchTabRes = onswitchTab.call(tabSlave, paramsObj);

            expect(type(onswitchTabRes)).toEqual('Promise');
            done();
        });

        it('should return correctly after onswitchTab be called', done => {
            const paramsObj = {
                fromId: `${slaveId}0`,
                toId: `${slaveId}5`,
                toPage: '/mock/tabslave1',
                toTabIndex: 1
            };
            const onswitchTabRes = onswitchTab.call(tabSlave, paramsObj);

            expect(type(onswitchTabRes)).toEqual('Promise');
            done();
        });

        it('should return correctly after onswitchTab be called when toId does not exist in child slave', done => {
            const paramsObj = {
                fromId: `${slaveId}0`,
                toId: `${slaveId}_noId`,
                toPage: '/mock/tabslave1'
            };
            const onswitchTabRes = onswitchTab.call(tabSlave, paramsObj);

            expect(type(onswitchTabRes)).toEqual('Promise');
            done();
        });

        it('should return correctly after onswitchTab be called when toId exist in child slave', done => {
            const paramsObj = {
                fromId: `${slaveId}0`,
                toId: `${slaveId}1`,
                toPage: '/mock/tabslave1',
                toTabIndex: 1
            };

            const onswitchTabRes = onswitchTab.call(tabSlave, paramsObj);

            expect(type(onswitchTabRes)).toEqual('Promise');

            onswitchTabRes.then(res => {
                expect(res).toEqual(jasmine.objectContaining({
                    type: 'onTabItemTap',
                    wvID: `${slaveId}1`
                }));
            });
            done();
        });
    });

    describe('redirect', () => {
        const redirect = tabSlave.redirect;

        it('should redirect be a function', done => {
            expect(redirect).toEqual(jasmine.any(Function));
            done();
        });

        it('should return correctly after redirect be called', done => {
            const paramsObj = {
                url: '/mock/tabslave1'
            };
            const redirectRes = redirect.call(tabSlave, paramsObj);
            expect(type(redirectRes)).toEqual('Promise');
            done();
        });
    });

    describe('open', () => {
        const open = tabSlave.open;

        it('should open be a function', done => {
            expect(open).toEqual(jasmine.any(Function));
            done();
        });

        it('should return correctly after open be called', done => {
            const paramsObj = {
                url: '/mock/tabslave1'
            };
            const openRes = open.call(tabSlave, paramsObj);
            expect(type(openRes)).toEqual('Promise');
            done();
        });
    });

    it('should return correctly after close be called', done => {
        const closeRes = tabSlave.close();
        tabSlave.children.forEach(child => {
            expect(child.status).toEqual(0);
        });
        expect(closeRes).toBeUndefined();
        done();
    });

    it('should return correctly after onEnqueue be called', done => {
        const onEnqueueRes = tabSlave.onEnqueue();
        expect(type(onEnqueueRes)).toEqual('Promise');
        onEnqueueRes.then(res => {
            expect(res).toEqual('loadJs');
        });
        done();
    });
});