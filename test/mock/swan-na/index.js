/**
 * @file mock swan-na
 * @author lvlei(lvlei03@baidu.com)
 */

/**
 * 获取当前的环境变量
 */
export const getEnvVariables = () => {
    return `{
        "isDebugSdk": true,
        "ctsJsAddress": {
            "master": ["http://baidu.com"],
            "slave":["http://baidu.com"]
        }
    }`;
};

/**
 * 模拟客户端事件触发
 *
 * @param {Object} env - 作用的对象(window|document)
 * @param {string} type - 事件名
 * @param {*} params - 传递的参数
 */
export const dispatchEvent = (env, type, params = {}) => {
    const event = new Event(type);
    for (const k in params) {
        event[k] = params[k];
    }
    env.dispatchEvent(event);
}