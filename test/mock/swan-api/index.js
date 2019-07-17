/**
 * @file mock swan-api
 * @author lvlei(lvlei03@baidu.com)
 */

import {noop} from '../../utils';

export const swan = {

    getNetworkType(params = {}) {
        params.success && params.success({
            networkType: 'wifi'
        });
    },

    getNetworkTypeMaker(networkType = 'wifi') {
        return obj => {
            obj.success && obj.success({
                networkType
            });
        };
    },

    loadSubPackage(params) {
        window.loadSubPackageParams = params;
    },

    createCanvasContext(...args) {
        return args;
    },

    navigateTo(params) {
        return params.url.cb();
    },
    redirectTo(params) {
        return params.url.cb();
    },
    switchTab(params) {
        return params.url.cb();
    },
    reLaunch(params) {
        if (typeof params.url.cb === 'function') {
            return params.url.cb();
        } else {
            return params;
        }
    },
    navigateBack(params) {
        return params;
    },
    openShare(params) {
        return params;
    },

    getSystemInfo(params) {
        params.success && params.success({
            devicePixelRatio: 3,
            batteryLevel: -1,
            version: '11.6.0.0',
            system: 'iOS 12.1',
            navigationBarHeight: 44,
            brand: 'iPhone',
            windowHeight: 808,
            host: 'baiduboxapp',
            cacheLocation: {
                countryCode: '54003',
                country: 'United States',
                province: 'California',
                city: 'San Francisco',
                street: 'Ellis Street',
                cityCode: '54537'
            },
            pixelRatio: 3,
            SDKVersion: '3.30.13',
            statusBarHeight: 44,
            screenHeight: 896,
            language: 'zh_CN',
            platform: 'ios',
            windowWidth: 414,
            model: 'iPhone Simulator <x86-64>',
            screenWidth: 414,
            fontSizeSetting: 2
        });
    },

    getCommonSysInfo(params = {}) {
        var res = {
            baidu_id: '7D1E974B54015C594E698EF122029A93:FG=1',
            cuid: '4B3BB7B174644FA6DBC77A84E275858C7B9DA4AA4FHRGNPNQFC',
            sid: '126886_114551_129916_129231_106370_130486_129947_125695_120191_130173_107313_118895_118877_118839_118830_118802_130384_129564_129751_130157_…',
            uid: 'yN_Eq6ONpuvu-GfgQRZFRQ',
            zid: ''
        };
        params.success && params.success(res);
    },

    getLocation(params = {}) {
        var res = {
            accuracy: 5,
            altitude: 0,
            city: 'San Francisco',
            cityCode: '54537',
            country: 'United States',
            countryCode: '54003',
            district: '',
            horizontalAccuracy: 5,
            latitude: 37.785834,
            longitude: -122.406417,
            province: 'California',
            speed: -1,
            street: 'Ellis Street',
            streetNumber: '',
            verticalAccuracy: -1,
        };
        params.success && params.success(res);
    }
};

export const swaninterface = {
    handlerQueue: [],
    loadJsQueue: {},
    boxjs: {
        data: {
            get({
                name
            }) {
                if (name === 'swan-appInfoSync') {
                    return {
                        appId: '123456',
                        appLaunchScheme: 'baiduboxapp://swan/mock/launch',
                        appid: '123456',
                        appname: 'mockappname',
                        clkid: '',
                        cuid: 'mockcuid',
                        extraData: {},
                        mtjCuid: '',
                        scene: '123456789',
                        srcAppId: 'mockSrcAppId'
                    };
                }
            }
        },
        device: {
            systemInfo({
                type
            }) {
                if (type === 'sync') {
                    return {
                        SDKVersion: '1.2.0'
                    };
                }
            }
        },
        log: noop,
        platform: {
            versionCompare: noop,
            boxVersion: noop
        },
        extend(apis) {
            apis.forEach(api => {
                // 仅做汇聚处理
                this[api.name] = api;
            });
        }
    },
    swan: {
        strUseForAfter: 'str',
        useForAfter(args) {
            return args;
        },
        request() {
            return 'originReq';
        },
        login(params) {
            return params;
        },
        createSelectorQuery() {
            return {
                in () {
                    return {};
                }
            };
        },
        createIntersectionObserver() {
            return {};
        },
        reLaunch(params) {
            return Promise.resolve(params);
        }
    },
    communicator: {
        fireMessage: noop
    },
    bind(type, cb) {
        document.addEventListener(type, cb, false);
        return this;
    },
    unbind(type, cb) {
        document.removeEventListener(type, cb, false);
        return this;
    },
    loadJs(params) {
        params.success && params.success();
        return Promise.resolve('loadJs');
    },
    invoke(type, ...args) {
        return this[type] && this[type](...args);
    },
    navigateTo(params) {
        if (params.isFail) {
            params.fail && params.fail(params);
        } else {
            params.success && params.success(params);
        }
        params.complete && params.complete();
    },
    navigateBack(params) {
        return new Promise((resolve, reject) => {
            params.thenable ? resolve() : reject();
        });
    },
    switchTab(params = {}) {
        params.success && params.success({});
        return Promise.resolve({});
    },
    reLaunch(params) {
        if (params.hasRoot) {
            params.root = 'assets';
        }
        if (params.status === 'success') {
            params.success && params.success({
                ...params,
                resVal: 'success'
            });
        } else {
            params.fail && params.fail(params);
        }
        params.complete && params.complete(params);
    },
    redirectTo(params) {
        if (params.isFail) {
            params.fail && params.fail(params);
        } else {
            params.success && params.success(params);
        }
        params.complete && params.complete();
    },
    onRoute(cb) {
        cb({
            routeType: 'init',
            fromId: 0,
            toId: 1,
            toPage: '/mock/one',
            toTabIndex: 1
        });
    },
    adaptMaster() {
        return 'adaptor';
    },
    bindSlaveLoadedEvents: noop,
    getAppConfig: noop,
    init: noop,
    postMessage(slaveId, message) {
        if (slaveId === 'master') {
            window.testutils.clientActions.sendMasterMessage(message);
        } else {
            return '123';
        }
    },
    onMessage(cb) {
        cb({
            type: 'slavePageComponentAttached'
        });
        return this;
    }
};