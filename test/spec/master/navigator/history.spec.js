/**
 * @file swan-core test for navigator history
 * @author lvlei(lvlei03@baidu.com)
 */

import History from '../../../../src/master/navigator/history';
import {randomNum, catchTips} from '../../../utils';

const slaveId = randomNum();
const currentSlaveId = randomNum();

const history = new History();

describe('history', () => {

    it('should History be a class', done => {
        expect(History).toEqual(jasmine.any(Function));
        expect(history).toEqual(jasmine.any(Object));
        done();
    });

    it('should historyStack be an array', done => {
        const historyStack = history.historyStack;
        expect(historyStack).toEqual(jasmine.any(Array));
        expect(historyStack.length).toEqual(0);
        done();
    });

    it('can push a history after history.pushHistory be called', done => {
        history.pushHistory({
            slaveId
        });

        const historyStack = history.historyStack;

        expect(historyStack).toEqual(jasmine.any(Array));
        expect(historyStack.length).toEqual(1);
        done();
    });

    it('can pop a new history after history.popHistory be called', done => {
        const popHistory = history.popHistory;
        expect(popHistory).toEqual(jasmine.any(Function));

        const poppedSlaves = popHistory.call(history);
        expect(poppedSlaves).toEqual(jasmine.any(Array));
        expect(poppedSlaves[0].slaveId).toEqual(slaveId);

        const historyStack = history.historyStack;
        expect(historyStack.length).toEqual(0);
        done();
    });

    it('can replace a history after history.replaceHistory be called', done => {
        const replaceHistory = history.replaceHistory;
        expect(replaceHistory).toEqual(jasmine.any(Function));

        history.pushHistory({
            slaveId
        });

        const willBeReplaceSlave = {
            slaveId,
            from: 'replcedSlave',
            isTheSlave(slaveId) {
                return slaveId === this.slaveId;
            },
            close() {},
            findChild(slaveId) {
                return slaveId;
            }
        };

        history.replaceHistory(willBeReplaceSlave);
        const historyStack = history.historyStack;

        expect(historyStack.length).toEqual(1);
        expect(historyStack[0].from).toEqual('replcedSlave');
        done();
    });

    it('can get top slaves after history.getTopSlaves be called', done => {
        const getTopSlaves = history.getTopSlaves;
        expect(getTopSlaves).toEqual(jasmine.any(Function));

        const topSlave = getTopSlaves.call(history);
        expect(topSlave).toEqual(jasmine.any(Array));
        expect(topSlave[0].from).toEqual('replcedSlave');
        done();
    });

    it('can get all slaves after history.getAllSlaves be called', done => {
        const getAllSlaves = history.getAllSlaves;
        expect(getAllSlaves).toEqual(jasmine.any(Function));

        const allSlaves = getAllSlaves.call(history);
        expect(allSlaves).toEqual(jasmine.any(Array));
        expect(allSlaves.length).toEqual(1);
        done();
    });

    describe('popTo', () => {
        const popTo = history.popTo;

        it('can pop to a histoy after history.popTo be called with the slave existed', done => {
            const popToMap = {
                status: 0,
                params: null
            };
            expect(popTo).toEqual(jasmine.any(Function));
    
            history.pushHistory({
                slaveId: currentSlaveId,
                from: 'otherSlave',
                isTheSlave(slaveId) {
                    return slaveId === this.slaveId;
                },
                close() {}
            });
    
            history.popTo.call(history, slaveId, e => {
                popToMap.status++;
                popToMap.params = e;
            });
            const {
                status,
                params
            } = popToMap;
    
            expect(status).toEqual(1);
            expect(params).toEqual(jasmine.objectContaining({
                slaveId: currentSlaveId,
                from: 'otherSlave'
            }));
            done();
        });

        it('can not pop to a histoy after history.popTo be called with the slaveId does not exist', done => {
            const popToMap = {
                status: 0,
                params: null
            };
            history.pushHistory({
                isTheSlave(slaveId) {
                    return slaveId === this.slaveId;
                }
            });
    
            const otherSlaveId = currentSlaveId + '00';
            history.popTo.call(history, otherSlaveId, e => {
                popToMap.status++;
                popToMap.params = e;
            });
            const {
                status,
                params
            } = popToMap;
    
            expect(status).toEqual(0);
            expect(params).toEqual(null);
            done();
        });
    });

    it('can judge whether slave exists', done => {
        const hasTheSlave = history.hasTheSlave;
        expect(hasTheSlave).toEqual(jasmine.any(Function));

        let res;
        res = hasTheSlave.call(history, slaveId);
        expect(res).toEqual(true);

        res = hasTheSlave.call(history, slaveId + '2');
        expect(res).toEqual(false);
        done();
    });

    describe('seek', () => {

        const seek = history.seek;

        it('can seek the slave while the historyStack has the slave', done => {
            expect(seek).toEqual(jasmine.any(Function));
    
            const res = seek.call(history, slaveId);
            expect(res).toEqual(slaveId);
            done();
        });

        it('can seek the slave while the child has the slave', done => {
            const cacheHistoryStack = history.historyStack;

            history.historyStack = [{
                isTheSlave() {
                    return true;
                },
                from: 'superSlave'
            }];
            const res = seek.call(history, slaveId, true);
            expect(res.from).toEqual('superSlave');

            history.historyStack = cacheHistoryStack;
            done();
        });
    });

    describe('clear', () => {

        it('can clear the historyStack after history.clear be called', done => {
            const clear = history.clear;
            expect(clear).toEqual(jasmine.any(Function));

            clear.call(history);
            const historyStack = history.historyStack;
            expect(historyStack.length).toEqual(0);

            history.historyStack = 1;
            done();
        });

        it('cover catch after clear be called', done => {
            history.historyStack = 1;
            history.clear();
            catchTips();
            expect(history.historyStack.length).toEqual(0);
            done();
        });
    });

    describe('each', () => {

        it('can traversal slave', done => {
            let status = 0;

            history.historyStack = [{}];
            const fn = () => {
                status++;
            };
            const options = {};
            history.each(fn, options);

            expect(status).toEqual(1);
            done();
        });

        it('can recursive traversal the slave be child', done => {
            let recursiveChildStatus = 0;

            history.historyStack = [{
                children: [{}]
            }];
            const fn = () => {
                recursiveChildStatus++;
            };

            const options = {
                recursive: true
            };
            history.each(fn, options);

            expect(recursiveChildStatus).toEqual(1);
            done();
        });
    });
});
