/**
 * @file swan-core test for page index
 * @author lvlei(lvlei03@baidu.com)
 */

import {Page, getInitDataAdvanced, createPageInstance} from '../../../../src/master/page/index';
import {randomNum} from '../../../utils';

describe('index test', () => {

    window.__swanRoute = '/mock/spec/page/index';

    const pageRes = Page({
        data: {
            from: 'page/index'
        },
        customMethod() {
            return 'customMethod';
        }
    });

    it('Page constructor test', done  => {
        expect(pageRes).toEqual(jasmine.any(Object));
        expect(pageRes.data).toEqual(jasmine.any(Object));
        expect(pageRes.data.from).toEqual('page/index');
        expect(pageRes.uri).toEqual('/mock/spec/page/index');
        expect(pageRes.usingComponents).toEqual(jasmine.any(Array));
        expect(pageRes.usingComponents.length).toEqual(0);
        done();
    });

    it('should get current pages after getCurrentPages be called', done => {
        const cacheHistory = window.masterManager.navigator.history;

        window.masterManager.navigator.history = {
            getAllSlaves() {
                return [{
                    getCurrentChildren() {
                        return {
                            getUserPageInstance() {
                                return {
                                    from: 'getCurrentPages'
                                };
                            }
                        }
                    }
                }];
            }
        }
        const currentPages = getCurrentPages();

        expect(getCurrentPages).toEqual(jasmine.any(Function));
        expect(currentPages).toEqual(jasmine.any(Array));
        expect(currentPages[0].from).toEqual('getCurrentPages');

        window.masterManager.navigator.history = cacheHistory;
        done();
    });

    describe('getInitDataAdvanced', () => {

        it('should return initial data while pagesQueue not includes uriPath', done => {
            const initData = getInitDataAdvanced('/mock/accessUri?from=page');
            expect(initData).toEqual(jasmine.any(Object));
    
            expect(Object.keys(initData.data).length).toEqual(0);
            expect(Object.keys(initData.componentsData).length).toEqual(0);
            done();
        });

        it('should return decorated data while pagesQueue includes uriPath', done => {
            const initData = getInitDataAdvanced('/mock/spec/page/index');

            expect(initData).toEqual(jasmine.any(Object));
            expect(initData.data).toEqual(jasmine.any(Object));
            expect(initData.data.from).toEqual('page/index');
            expect(initData.componentsData).toEqual(jasmine.any(Object));
            done();
        });

        it('should return decorated data while pagesQueue includes uriPath and data is undefined', done => {
            const accessUri = '/mock/spec/page/index';

            global.masterManager.pagesQueue[accessUri].data = undefined;
            const initData = getInitDataAdvanced(accessUri);

            expect(initData).toEqual(jasmine.any(Object));
            expect(Object.keys(initData.data).length).toEqual(0);
            expect(initData.componentsData).toEqual(jasmine.any(Object));
            done();
        });
    });

    describe('createPageInstance test', () => {

        beforeAll(() => {
            Page.__hooks = [{
                url: '/mock/spec/page/index',
                method: {
                    onLoad() {}
                }
            }];
        });

        it('could accessUri match hook url after createPageInstance be called', done => {
            const slaveId = randomNum();
            const instance = createPageInstance('/mock/spec/page/index?from=create', slaveId, '');
    
            expect(instance).toEqual(jasmine.any(Object));
            done();
        });

        it('could accessUri not match hook url after createPageInstance be called', done => {
            const slaveId = randomNum();
            const instance = createPageInstance('/mock/spec/isNotExist', slaveId, '');
    
            expect(instance).toEqual(jasmine.any(Object));
            done();
        });
    });

    it('Page hooks test', done => {
        Page.__hooks = [{
            url: '/mock/spec/',
            method: {
                onLoad() {}
            }
        }];

        const slaveId = randomNum();
        const instance = createPageInstance('/mock/spec/page/index?from=create', slaveId, '');

        expect(instance.privateProperties.hooks.length).toEqual(1);
        done();
    });

    // nothing
    it('isWriteProtected test', done => {
        const slaveId = randomNum();
        const instance = createPageInstance('/mock/spec/page/index?from=create', slaveId, '');

        expect(instance).toEqual(jasmine.any(Object));
        done();
    });

    describe('page.after can inject token after it be called', () => {

        it('should Page.after be a function', done => {
            expect(Page.after).toEqual(jasmine.any(Function));
            done();
        });

        it('should page hooks length increased while its options includes a url', done => {
            const hooks = [];
            const history = window.masterManager.navigator.history;
            
            Object.defineProperties(history, {
                historyStack: {
                    value: [{
                        userPageInstance: {
                            privateProperties: {
                                hooks
                            }
                        },
                        accessUri: '/mock/accessUri',
                        isCreated() {
                            return true;
                        }
                    }]
                },
                each: {
                    value: (fn, options) => {
                        history.historyStack.forEach(slave => {
                            if (options.recursive && slave.children) {
                                slave.children.forEach(fn);
                            }
                            else {
                                fn(slave);
                            }
                        });
                    }
                }
            });

            Page.after({
                url: '/mock'
            });

            expect(hooks.length).toEqual(1);

            window.masterManager.navigator.history.historyStack.pop();
            done();
        });

        it('should page hooks length increased while its options not includes a url and the slave instance not includes accessUri', done => {
            let isCreatedStatus = 0;
            window.masterManager.navigator.history.historyStack.push({
                userPageInstance: {
                    privateProperties: {
                        hooks: []
                    }
                },
                isCreated() {
                    isCreatedStatus++;
                }
            });

            Page.after({});

            expect(isCreatedStatus).toEqual(0);

            window.masterManager.navigator.history.historyStack.pop();
            done();
        });
    });
});
