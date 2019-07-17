/**
 * @file 在下一个时间周期运行任务, 标准san nextTick方法
 * @author lvlei(lvlei03@baidu.com)
 */

/**
 * 下一个周期要执行的任务列表
 *
 * @inner
 * @type {Array}
 */
let nextTasks = [];

/**
 * 执行下一个周期任务的函数
 *
 * @inner
 * @type {Function}
 */
let nextHandler;

/**
 * 浏览器是否支持原生Promise
 * 对Promise做判断，是为了禁用一些不严谨的Promise的polyfill
 *
 * @inner
 * @type {boolean}
 */
const isNativePromise = typeof Promise === 'function' && /native code/.test(Promise);

/**
 * nextTick方法, 在下一个时间周期运行任务
 *
 * @inner
 * @param {Function} fn 要运行的任务函数
 * @param {Object=} thisArg this指向对象
 */
export default (fn, thisArg) => {
    if (thisArg) {
        fn = fn.bind(thisArg);
    }
    nextTasks.push(fn);

    if (nextHandler) {
        return;
    }

    nextHandler = function () {
        const tasks = nextTasks.slice(0);
        nextTasks = [];
        nextHandler = null;

        for (let i = 0, l = tasks.length; i < l; i++) {
            try {
                typeof tasks[i] === 'function' && tasks[i]();
            } catch (err) {
                console.error(err);
            }
        }
    };

    // 非标准方法，但是此方法非常吻合要求。
    if (typeof setImmediate === 'function') {
        setImmediate(nextHandler);
    }
    // 用MessageChannel去做setImmediate的polyfill
    // 原理是将新的message事件加入到原有的dom events之后
    else if (typeof MessageChannel === 'function') {
        const channel = new MessageChannel();
        const port = channel.port2;
        channel.port1.onmessage = nextHandler;
        port.postMessage(1);
    }
    // for native app
    else if (isNativePromise) {
        Promise.resolve().then(nextHandler);
    }
    else {
        setTimeout(nextHandler, 0);
    }
};
