/**
 * @file firstRenderHookQueue.js
 * @author haoran@baidu.com
 */

/* globals _naSwan */
let firstRenderHookQueue = {
    firstRenderEnd: false,
    queue: []
};


let firstRenderPriorityEnable = false;
const isRenderPriorityV8 = () => {
    // 判断是否需要在v8环境下开启渲染前置
    return typeof swanGlobal !== 'undefined'
    && _naSwan.env && _naSwan.env.config
    && _naSwan.env.config.abTestSwitch
    && parseInt(_naSwan.env.config.abTestSwitch['swanswitch_first_render_priority'], 10) === 1;
};

const isRenderPriorityWV = () => {
    // 判断是否需要在webview环境下开启渲染前置
    return typeof swanGlobal === 'undefined'
    && window.extraConfig && window.extraConfig.abTestSwitch
    && parseInt(window.extraConfig.abTestSwitch['swanswitch_first_render_priority'], 10) === 1;
};

if (isRenderPriorityV8() || isRenderPriorityWV()) {
    // v8/jsc环境
    firstRenderPriorityEnable = true;
}

export default firstRenderHookQueue;

/**
 * 小程序首屏渲染前置优化方法入栈函数装饰器
 *
 * @param {Function} [target] - 装饰对象
 * @param {string} [hookName] - 装饰对象名称
 * @return {Function} [] - 装饰后的方法
 */

export function renderHookEnqueue(target, hookName) {
    return function (...params) {
        let that = this;
        if (firstRenderPriorityEnable && !firstRenderHookQueue.firstRenderEnd) {
            firstRenderHookQueue.queue.push({
                stage: hookName,
                delay() {
                    target.call(that, ...params);
                }
            });
            return;
        }
        target.call(that, ...params);
    };
}