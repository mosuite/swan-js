/**
 * @file 处理外部使用代码的工具函数封装
 * @author houyu(houyu01@baidu.com)
 */

/**
 * 运行代码时，需要捕获开发者问题并抛出
 *
 * @param {Function} fn 需要运行的function
 * @param {*} context 函数执行的上下文
 * @param {string} errorMessage 函数报错时现实的报错信息
 * @param {Array} args 需要传入执行函数的参数
 * @return {*} 被包裹函数的执行返回值
 */
export const executeWithTryCatch = (fn, context, errorMessage, args) => {
    if (!fn) {
        return null;
    }
    let execResult = undefined;
    try {
        execResult = fn.call(context, args);
    }
    catch (e) {
        console.error(errorMessage);
        throw Error(e);
    }
    return execResult;
};


/**
 * 获取Promise化后的一些API接口
 *
 * @param {Object} [swan] - 要包装的swan对象
 * @param {string|Function} [rules] - 要包装的swan对象
 * @return {Promise|Array} - 包装后的swan-api对象
 */
export const getApiWrappers = (swan, rules) => {
    if (Object.prototype.toString.call(rules) === '[object Array]') {
        return rules.map(rule => getApiWrappers(swan, rule));
    }
    return new Promise((resolve, reject) => {
        if (typeof rules === 'string') {
            swan[rules]({
                success: resolve,
                fail: resolve
            });
        }
        else if (typeof rules === 'function') {
            resolve(rules());
        }
    });
};
