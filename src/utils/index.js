/**
 * @file utils for swan
 * @author houyu(houyu01@baidu.com)
 */
import {Data} from './data';
import Loader from './loader';

// 旧调起协议特征 `://v19`
const OLD_LAUNCH_SCHEME_REGEX = /:\/\/v[0-9]+/;
const OLD_SCHEME_PARAMS_REGEX = /params=({.*})/; // params=

// 新调起协议特征 `//swan/xxx/xxx?xxx`
const NEW_SCHEME_PARAM_REGEX = /\/\/swan\/[0-9a-z_A-Z]+\/?(.*?)\?(.*)$/;
const NEW_EXTRA_PARAM_REGEX = /(_baiduboxapp|callback|upgrade).*?(&|$)/g;

// const basePath = window.basePath;
export const loader = new Loader();
export {Share} from './share';
export {executeWithTryCatch} from './code-process';
export {Data};
export * from './path';

/* global _naSwan swanGLobal */
// 获取实验AB实验开关的值，开关值由端上传入
export const getABSwitchValue = name => {
    // V8与jsc环境
    if (typeof swanGlobal !== 'undefined'
    && _naSwan.env && _naSwan.env.config
    && _naSwan.env.config.abTestSwitch) {
        return _naSwan.env.config.abTestSwitch[name];
    }
    // webview上绑定之后的逻辑
    else if (window._envVariables
        && window._envVariables.abTestSwitch) {
        return window._envVariables.abTestSwitch[name];
    }
};

/**
 * 将客户端下发的stringifg appConfig进行统一解析缓存
 *
 * @param {Object} context - 缓存解析后appConfig的上下文
 * @param {string} appConfigStr  - 带解析的appConfig字符串
 */
export const appConfigStorer = (context, appConfigStr) => {
    try {
        if (!context.parsedAppConfig) {
            context.parsedAppConfig = JSON.parse(appConfigStr);
        }
    } catch (err) {
        console.log(`parsing appConfig error, errMsg: ${err}`);
    }
};

export const getParams = query => {
    if (!query) {
        return {};
    }

    return (/^[?#]/.test(query) ? query.slice(1) : query)
        .split('&')
        .reduce((params, param) => {
            let [key, value] = param.split('=');
            try {
                params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
            }
            catch (e) {
                params[key] = value;
            }
            return params;
        }, {});
};


/**
 * 获取首页地址
 * @return {string} 首页地址
 */
function getIndexPath() {
    try {
        const appConfig = global.parsedAppConfig;
        const index = appConfig.pages[0];
        const tabBarIndex = appConfig.tabBar
            && appConfig.tabBar.list
            && appConfig.tabBar.list[0]
            && appConfig.tabBar.list[0].pagePath;

        return tabBarIndex || index;
    }
    catch (e) {
        console.error(e);
        return '';
    }
}

/**
 * 从旧调起协议中获取params参数
 *
 * @param originScheme 调起协议
 * @return {Object} 从旧协议中提取出的参数对象
 * @return {{path: string, query: {}, extraData: *, navi: string} | {}}
 *          path: 调起协议的path,；query: 调起协议的query； navi: 有值代表小程序之间的调起； extraData: 小程序之间的调起时传递的数据
 */
function getParamsFromOldScheme(originScheme) {
    let path;
    let query = {};
    let navi = '';
    let extraData = {};

    // 获取协议字符串中的params字符串
    let paramsRegexResult = originScheme.match(OLD_SCHEME_PARAMS_REGEX);
    if (!paramsRegexResult) {
        return {};
    }

    let paramsStr = paramsRegexResult[1];

    // 解析params字符串，提取 path,query,navi,extraData 字段
    try {
        let paramsObj = JSON.parse(paramsStr);
        let fullPath = paramsObj.path || '';
        extraData = paramsObj.extraData || {};
        navi = paramsObj.navi || '';

        // eg: home/index/index?id=2
        if (fullPath) {
            let pathRegexResult = fullPath.match(/(.*)\?(.*)/);
            path = pathRegexResult ? pathRegexResult[1] : fullPath;
            query = pathRegexResult ? getParams(pathRegexResult[2]) : {};
        }
        else {
            // 默认首页地址作为path
            path = getIndexPath();
        }
    }
    catch (e) {
        console.error(e);
    }

    return {
        path,
        query,
        navi,
        extraData
    };
}

/**
 * 从新调起协议中获取 path 和 query
 *
 * @param originScheme 调起协议
 * @return {Object} path和query组成的对象
 */
function getParamsFromNewScheme(originScheme) {
    const scheme = originScheme.replace(NEW_EXTRA_PARAM_REGEX, '');
    const paramsRegexResult = scheme.match(NEW_SCHEME_PARAM_REGEX);

    const path = paramsRegexResult ? paramsRegexResult[1] : '';
    const query = paramsRegexResult ? getParams(paramsRegexResult[2]) : {};

    return {
        path: path ? path : getIndexPath(),
        query
    };
}

/**
 * 处理onAppLaunch、onAppShow、onAppHide的参数：从新旧调起协议中提取 path 和 query 和 extraData
 *
 * 旧调起协议格式 eg：
 * baiduboxapp://v19/swan/launch?params={"appKey":"xxx","path":"pages/home/home?id=3","extraData":{"foo":"baidu"},"appid":"xxx","navi":"naviTo","url":"pages/home/home?id=3"}&callback=_bdbox_js_328&upgrade=0
 *
 * 新调起协议格式 eg:
 * "baiduboxapp://swan/<appKey>/pages/home/home/?id=3&_baiduboxapp={"from":"","ext":{}}&callback=_bdbox_js_275&upgrade=0"
 *
 * @param {Object} appInfo 待处理的appInfo
 */
export const processParam = appInfo => {
    let originScheme = (appInfo && appInfo.appLaunchScheme) || '';
    if (!originScheme) {
        return;
    }
    originScheme = decodeURIComponent(originScheme);

    // 从协议中获取 path，query，extraData，navi
    let params = {};
    if (OLD_LAUNCH_SCHEME_REGEX.test(originScheme)) {
        params = getParamsFromOldScheme(originScheme);
    }
    else {
        params = getParamsFromNewScheme(originScheme);
    }
    appInfo = Object.assign(appInfo, params);

    // 新旧场景值的兼容，当是16为场景值的时候，取前8位
    let scene = appInfo.scene ? '' + appInfo.scene : '';
    appInfo.scene = scene.length === 16 ? scene.slice(0, 8) : scene;

    // 如果是从小程序跳转来的，则增加引用信息referrerInfo
    appInfo.srcAppId && (appInfo.referrerInfo = {
        appId: appInfo.srcAppId,
        extraData: appInfo.extraData
    });

    // 新增appURL字段用于app onShow透传给开发者
    appInfo.appURL = originScheme.replace(NEW_EXTRA_PARAM_REGEX, '');
};


export const noop = () => {};

export const getValueSafety = (data, path) => {
    return (new Data(data)).get(path);
};

export const convertToCamelCase = str => str.replace(/-([a-z])/g, (all, first) => first.toUpperCase());

/**
 * 用于判断是否为值相同数组（若为对象数组，则对指定key执行比较）
 * @param {Array} a 目标数组
 * @param {Array} b 对比数组
 * @param {string} key 数组为对象数组时指定的比较key
 * @return {boolean} 比较结果，true表示为不同，false为相同
 */
export const isDiffArray = (a, b, key) => {
    if (a.length !== b.length) {
        return true;
    }
    let length = a.length;
    // 依次比值
    for (let i = 0; i < length; i++) {
        let result = true;
        if (typeof a[i] === 'object' && typeof b[i] === 'object') {
            result = a[i][key] === b[i][key];
        }
        else {
            result = typeof a[i] === typeof b[i] && a[i] === b[i];
        }
        if (!result) {
            return true;
        }
    }
    return false;
};

/**
 * 用于判断是否为值相同对象（若有value为对象，则对指定key进行比较）
 * @param {Array} x 目标对象
 * @param {Array} y 对比对象
 * @return {boolean} 比较结果，true表示相同，false为不同
 */
export const isEqualObject = (x = {}, y = {}) => {
    let inx = x instanceof Object;
    let iny = y instanceof Object;
    if (!inx || !iny) {
        return x === y;
    }
    if (Object.keys(x).length !== Object.keys(y).length) {
        return false;
    }
    for (let key in x) {
        let a = x[key] instanceof Object;
        let b = y[key] instanceof Object;
        if (a && b) {
            if (!isEqualObject(x[key], y[key])) {
                return false;
            }
        } else if (x[key] !== y[key]) {
            return false;
        }
    }
    return true;
};

/**
 * underscore函数提取, 用于判断两个值是否相等
 *
 * @param {*} one - 目标值
 * @param {*} other - 对比值
 * @param {Array} oneStack 储存one递归比较过程中的值
 * @param {Array} otherStack 储存other递归比较过程中的值
 * @return {boolean} 比较结果，true表示相同，false为不同
 */
export const isEqual = (one, other, oneStack, otherStack) => {
    if (one === other) return one !== 0 || 1 / one === 1 / other;
    if (one == null || other == null) return false;
    if (one !== one) return other !== other;
    var type = typeof one;
    if (type !== 'function' && type !== 'object' && typeof other != 'object') return false;
    // one 和 other 的内部属性 [[class]] 相同时 返回 true
    var className = toString.call(one);
    if (className !== toString.call(other)) return false;
    switch (className) {
        case '[object RegExp]':
        case '[object String]':
            return '' + one === '' + other;
        case '[object Number]':
            if (+one !== +one) return +other !== +other;
            return +one === 0 ? 1 / +one === 1 / other : +one === +other;
        case '[object Date]':
        case '[object Boolean]':
            return +one === +other;
    }
    var areArrays = className === '[object Array]';
    // 不是数组
    if (!areArrays) {
        // 过滤掉两个函数的情况
        if (typeof one != 'object' || typeof other != 'object') return false;
        var oneCtor = one.constructor,
            otherCtor = other.constructor;
        // oneCtor 和 otherCtor 必须都存在并且都不是 Object 构造函数的情况下，oneCtor 不等于 otherCtor， 那这两个对象就不想等
        if (oneCtor !== otherCtor
            && !(Object.prototype.toString.call(oneCtor) === '[object Function]'
                && oneCtor instanceof oneCtor
                && Object.prototype.toString.call(otherCtor) === '[object Function]'
                && otherCtor instanceof otherCtor)
            && ('constructor' in one && 'constructor' in other)) {
            return false;
        }
    }
    oneStack = oneStack || [];
    otherStack = otherStack || [];
    var length = oneStack.length;
    // 检查是否有循环引用的部分
    while (length--) {
        if (oneStack[length] === one) {
            return otherStack[length] === other;
        }
    }
    oneStack.push(one);
    otherStack.push(other);
    // 数组判断
    if (areArrays) {
        length = one.length;
        if (length !== other.length) return false;
        while (length--) {
            if (!isEqual(one[length], other[length], oneStack, otherStack)) return false;
        }
    }
    else {
        var keys = Object.keys(one),
            key;
        length = keys.length;
        if (Object.keys(other).length !== length) return false;
        while (length--) {
            key = keys[length];
            if (!(other.hasOwnProperty(key) && isEqual(one[key], other[key], oneStack, otherStack))) return false;
        }
    }
    oneStack.pop();
    otherStack.pop();
    return true;
};

/**
 * 深度assign的函数
 * @param {Object} targetObject 要被拷贝的目标对象
 * @param {Object} originObject 拷贝的源对象
 * @return {Object} merge后的对象
 */
export const deepAssign = (targetObject = {}, originObject) => {
    const originType = Object.prototype.toString.call(originObject);
    if (originType === '[object Array]') {
        targetObject = originObject.slice(0);
        return targetObject;
    }
    else if (originType === '[object Object]' && originObject.constructor === Object) {
        for (const key in originObject) {
            targetObject[key] = deepAssign(targetObject[key], originObject[key]);
        }
        return targetObject;
    }
    else if (originType === '[object Date]') {
        return new Date(originObject.getTime());
    }
    else if (originType === '[object RegExp]') {
        const target = String(originObject);
        const lastIndex = target.lastIndexOf('/');
        return new RegExp(target.slice(1, lastIndex), target.slice(lastIndex + 1));
    }
    return originObject;
};

/**
 * 深度mixin函数
 * @param {...Array} targetObjects 需要merge的所有的对象
 * @return {Object} mixin之后的结果
 */
export const mixin = (...targetObjects) => targetObjects.reduce(deepAssign, {});

/**
 * 深度拷贝逻辑，不同于lodash等库，但是与微信一致
 * @param {*} [originObj] 原对象
 * @return {Object|Array} 拷贝结果
 */
export const deepClone = originObj => {
    return deepAssign(Object.prototype.toString.call(originObj) === '[object Array]' ? [] : {}, originObj);
};

export const parseUrl = url => {
    let matchs = url.match(/(.*?)\?(.*)/);
    let result = {
        pathname: matchs ? matchs[1] : url,
        query: {}
    };
    if (matchs) {
        let re = /([^&=]+)=([^&]*)/g;
        let m;
        while ((m = re.exec(matchs[2])) !== null) {
            result.query[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }
    }
    return result;
};

let appInfoCache = null;

/**
 * 获取App信息(包含：appId,scene,scheme)
 *
 * @param {Object} swaninterface - 端能力接口
 * @param {bool} [noCache=false] - 是否使用缓存的appInfo
 * @return {Object} - 获取得到的App信息
 */
export const getAppInfo = (swaninterface, noCache = false) => {
    if (noCache || !appInfoCache) {
        appInfoCache = swaninterface.boxjs.data.get({name: 'swan-appInfoSync'});
    }
    return appInfoCache;
};

/**
 * 参数分类
 *
 * @param {Object} [originParams] - 开发者传入的参数
 * @param {Object} [splitList] - 开发者传入的参数
 * @return {Array} - 分类后的参数
 */
export const paramSplit = (originParams, splitList = []) => {
    let paramsList = [{}, {}];

    for (let key in originParams) {
        if (~splitList.indexOf(key)) {
            paramsList[0][key] = originParams[key];
        }
        else {
            paramsList[1][key] = originParams[key];
        }
    }
    return paramsList;
};
