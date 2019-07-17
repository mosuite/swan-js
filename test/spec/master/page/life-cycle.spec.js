/**
 * @file swan-core test for page lifecycle
 * @author lvlei(lvlei03@baidu.com)
 */

import {initLifeCycle} from '../../../../src/master/page/life-cycle';
import EventsEmitter from '../../../../src/utils/events-emitter';
import {randomNum} from '../../../utils';

describe('page life-cycle test', () => {
    const lifeCycle = {
        onLoadStatus: 0,
        onLoadParams: null,

        onShowStatus: 0,
        onShowParams: null,

        onReadyStatus: 0,
        onReadyParams: null,

        onHideStatus: 0,
        onHideParams: null,

        onUnloadStatus: 0,
        onUnloadParams: null,

        onForceReLaunchStatus: 0,
        onForceReLaunchParams: null,

        pullDownRefreshStatus: 0,
        pullDownRefreshParams: null,

        onTabItemTapStatus: 0,
        onTabItemTapParams: null,

        onReachBottomStatus: 0,
        onReachBottomParams: null,

        onPageScrollStatus: 0,
        onPageScrollParams: null,

        shareStatus: 0,
        shareParams: null,

        customComponentsOnLoadStatus: 0,
        customComponentsOnShowStatus: 0,
        pageLifetimesOnShowStatus: 0

    };

    window.__swanRoute = '/mock/spec/page/lifecycle';

    const pagePrototype = Page({
        data: {
            from: 'page_lifecycle'
        },
        onLoad(e) {
            lifeCycle.onLoadStatus++;
            lifeCycle.onLoadParams = e;
            e.method && e.method();
        },
        onShow(e) {
            lifeCycle.onShowStatus++;
            lifeCycle.onShowParams = e;
            e.method && e.method();
        },
        onReady(e) {
            lifeCycle.onReadyStatus++;
            lifeCycle.onReadyParams = e;
            e.method && e.method();
        },
        onHide(e) {
            lifeCycle.onHideStatus++;
            lifeCycle.onHideParams = e;
        },
        onUnload(e) {
            lifeCycle.onUnloadStatus++;
            lifeCycle.onUnloadParams = e;
        },
        onForceReLaunch(e) {
            lifeCycle.onForceReLaunchStatus++;
            lifeCycle.onForceReLaunchParams = e;
        },
        onPullDownRefresh(e) {
            lifeCycle.pullDownRefreshStatus++;
            lifeCycle.pullDownRefreshParams = e;
        },
        onTabItemTap(e) {
            lifeCycle.onTabItemTapStatus++;
            lifeCycle.onTabItemTapParams = e;
        },
        onReachBottom(e) {
            lifeCycle.onReachBottomStatus++;
            lifeCycle.onReachBottomParams = e;
        },
        onPageScroll(e) {
            lifeCycle.onPageScrollStatus++;
            lifeCycle.onPageScrollParams = e;
        }
    });

    const pageLifeCycle = initLifeCycle(
        pagePrototype,
        new EventsEmitter()
    );

    pageLifeCycle.privateProperties = {
        slaveId: randomNum(),
        accessUri: '/mock/hooksuri',
        hooks: []
    };

    it('should pageLifeCycle be an object', done => {
        expect(pageLifeCycle).toEqual(jasmine.any(Object));
        done();
    });

    describe('onLoad test', () => {

        it('should call onLoad correctly after _onLoad be called', done => {
            pageLifeCycle._onLoad({
                from: 'page_onload'
            });
            const {
                onLoadStatus,
                onLoadParams
            } = lifeCycle;
            expect(onLoadStatus).toEqual(1);
            expect(onLoadParams).toEqual(jasmine.objectContaining({from: 'page_onload'}));
            done();
        });

        it('should be caught while some error happened from calling onLoad', done => {
            pageLifeCycle._onLoad({
                from: 'page_onload',
                method: 'error mock'
            });
            const onLoadStatus = lifeCycle.onLoadStatus;
            expect(onLoadStatus).toEqual(2);
            done();
        });
    });

    describe('onShow test', () => {

        it('should call onShow correctly after _onShow be called', done => {
            pageLifeCycle._onShow({
                from: 'page_onShow'
            });
            const {
                onShowStatus,
                onShowParams
            } = lifeCycle;
            expect(onShowStatus).toEqual(1);
            expect(onShowParams).toEqual(jasmine.objectContaining({from: 'page_onShow'}));
            done();
        });

        it('should be caught while some error happened from calling onShow', done => {
            pageLifeCycle._onShow({
                from: 'page_onShow',
                method: 'error mock'
            });
            const onShowStatus = lifeCycle.onShowStatus;
            expect(onShowStatus).toEqual(2);
            done();
        });
    });

    describe('onReady test', () => {

        it('should call onReady correctly after _onReady be called', done => {
            pageLifeCycle._onReady({
                from: 'page_onReady'
            });
            const {
                onReadyStatus,
                onReadyParams
            } = lifeCycle;
            expect(onReadyStatus).toEqual(1);
            expect(onReadyParams).toEqual(jasmine.objectContaining({from: 'page_onReady'}));
            done();
        });

        it('should be caught while some error happened from calling onReady', done => {
            pageLifeCycle._onReady({
                from: 'page_onReady',
                method: 'error mock'
            });
            const onReadyStatus = lifeCycle.onReadyStatus;
            expect(onReadyStatus).toEqual(2);
            done();
        });
    });

    it('should onHide be called correctly', done => {
        pageLifeCycle._onHide({
            from: 'page_onHide'
        });

        const {
            onHideStatus,
            onHideParams
        } = lifeCycle;

        expect(onHideStatus).toEqual(1);
        expect(onHideParams).toEqual(jasmine.objectContaining({from: 'page_onHide'}));
        done();
    });

    it('should onUnload be called correctly', done => {
        pageLifeCycle._onUnload({
            from: 'page_onUnload'
        });

        const {
            onUnloadStatus,
            onUnloadParams
        } = lifeCycle;

        expect(onUnloadStatus).toEqual(1);
        expect(onUnloadParams).toEqual(jasmine.objectContaining({from: 'page_onUnload'}));
        done();
    });

    it('should onForceReLaunch be called correctly', done => {
        pageLifeCycle._onForceReLaunch({
            from: 'page_onForceReLaunch'
        });

        const {
            onForceReLaunchStatus,
            onForceReLaunchParams
        } = lifeCycle;

        expect(onForceReLaunchStatus).toEqual(1);
        expect(onForceReLaunchParams).toEqual(jasmine.objectContaining({from: 'page_onForceReLaunch'}));
        done();
    });

    it('should pullDownRefresh be called correctly', done => {
        pageLifeCycle._pullDownRefresh({
            from: 'page_pullDownRefresh'
        });

        const {
            pullDownRefreshStatus,
            pullDownRefreshParams
        } = lifeCycle;

        expect(pullDownRefreshStatus).toEqual(1);
        expect(pullDownRefreshParams).toEqual(jasmine.objectContaining({from: 'page_pullDownRefresh'}));
        done();
    });

    it('should onTabItemTap be called correctly', done => {
        pageLifeCycle._onTabItemTap({
            from: 'page_onTabItemTap'
        });

        const {
            onTabItemTapStatus,
            onTabItemTapParams
        } = lifeCycle;

        expect(onTabItemTapStatus).toEqual(1);
        expect(onTabItemTapParams).toEqual(jasmine.objectContaining({from: 'page_onTabItemTap'}));
        done();
    });

    it('should onReachBottom be called correctly', done => {
        pageLifeCycle._reachBottom({
            from: 'page_onReachBottom'
        });

        const {
            onReachBottomStatus,
            onReachBottomParams
        } = lifeCycle;

        expect(onReachBottomStatus).toEqual(1);
        expect(onReachBottomParams).toEqual(jasmine.objectContaining({from: 'page_onReachBottom'}));
        done();
    });

    it('should onPageScroll be called correctly', done => {
        pageLifeCycle._onPageScroll({
            from: 'page_onPageScroll'
        });

        const {
            onPageScrollStatus,
            onPageScrollParams
        } = lifeCycle;

        expect(onPageScrollStatus).toEqual(1);
        expect(onPageScrollParams).toEqual(jasmine.objectContaining({from: 'page_onPageScroll'}));
        done();
    });

    describe('share test', () => {
        it('share success', done => {
            pageLifeCycle.privateProperties.share = {
                shareAction: params => new Promise((resolve, reject) => {
                    lifeCycle.shareStatus++;
                    lifeCycle.shareParams = params;
                    resolve({});
                })
            };

            pageLifeCycle._share({
                from: 'page_share'
            });

            const {
                shareStatus,
                shareParams
            } = lifeCycle;

            expect(shareStatus).toEqual(1);
            expect(shareParams).toEqual(jasmine.objectContaining({from: 'page_share'}));
            done();
        });

        it('share fail', done => {
            pageLifeCycle.privateProperties.share = {
                shareAction: params => new Promise((resolve, reject) => {
                    lifeCycle.shareStatus++;
                    lifeCycle.shareParams = params;
                    reject({});
                })
            };

            pageLifeCycle._share({
                from: 'page_sharefail'
            });

            const {
                shareStatus,
                shareParams
            } = lifeCycle;

            expect(shareStatus).toEqual(2);
            expect(shareParams).toEqual(jasmine.objectContaining({from: 'page_sharefail'}));
            done();
        });
    });

    describe('customComponent page life-cycle test', () => {
        Object.assign(pageLifeCycle, {
            route: '/custom',
            _isCustomComponentPage: true
        });

        Object.assign(pageLifeCycle.privateProperties, {
            customComponents: {
                custom: {
                    is: '/custom',
                    onLoad() {
                        lifeCycle.customComponentsOnLoadStatus++;
                    },
                    onShow() {
                        lifeCycle.customComponentsOnShowStatus++;
                    },
                    pageLifetimes: {
                        show() {
                            lifeCycle.pageLifetimesOnShowStatus++;
                        }
                    }
                }
            }
        });

        it('should call onLoad correctly after _onLoad be called', done => {
            pageLifeCycle._onLoad({});
            expect(lifeCycle.customComponentsOnLoadStatus).toEqual(1);
            done();
        });

        it('should call onShow be correctly after _onShow be called', done => {
            pageLifeCycle._onShow({});
            expect(lifeCycle.customComponentsOnShowStatus).toEqual(2);
            done();
        });

        it('should call pageLifetimes show correctly after _onShow be called', done => {
            expect(lifeCycle.pageLifetimesOnShowStatus).toEqual(2);
            done();
        });
    });

    it('should call hook method correctly after _sendPageLifeCycleMessage be called', done => {
        let status = 0;
        pageLifeCycle.privateProperties.hooks = [{
            url: '/mock/hooksuri',
            methods: {
                onLoad() {
                    status++;
                }
            }
        }];

        pageLifeCycle._onLoad({});

        expect(status).toEqual(1);
        done();
    });
});
