export const noop = () => {};

/**
 * 随机数模拟, 类似于生成slaveId
 */
export const randomNum = () => Math.random().toString(10).slice(-5, -1);

export const deleteObjItems = (obj, ...keys) => {
    keys.forEach(item => {
        if (item in obj) {
            delete obj[item];
        }
    });
};

export const type = parma => Object.prototype.toString.call(parma).slice(8, -1);

export const catchTips = () => {
    console.log('Dont Worry! The following error is that the statement belongs to the overlay catch operation.');
};

export const appRootPath = 'http://b.bdstatic.com/searchbox/icms/searchbox/js/swantest';

export const getEnvVariables = () => {
    return {
        sdkExtension,
        ctsJsAddress: {
            master: [],
            slave: []
        }
    }
};

export const getAppConfig = () => {
    return {
        "pages": ["pages/custest/custest"],
        "networkTimeout": {
            "downloadFile": 10000,
            "connectSocket": 10000,
            "request": 30000,
            "uploadFile": 10000
        },
        "debug": false,
        "window": {
            "backgroundColorTop": "red",
            "navigationBarTitleText": "智能小程序官方组件",
            "backgroundTextStyle": "black",
            "enablePullDownRefresh": false,
            "navigationBarTextStyle": "black",
            "navigationBarBackgroundColor": "#ffffff",
            "backgroundColor": "#f5f5f5"
        },
        "appRootPath": "/Users/baidu/Library/Developer/CoreSimulator/Devices/7A2FFC96-F345-4F2F-BB21-6EAC95832EFD/data/Containers/Data/Application/33490E92-F40B-4B79-884B-93F368A6F197/Documents/SwanCaches/2590b9d7716f3653362f87e0eb374260/7824"
    }
};