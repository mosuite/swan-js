/**
 * @file 模拟创建时间 event 对象
 * @author  yangyang55(yangyang55@baidu.com)
 */


const eventStartTime = Date.now();

/**
 * triggerEvent 模拟创建event 为 triggerEvent 使用
 *
 * @param {Object} target - 点击目标对象
 * @param {string} eventName - 触发的事件名
 * @param {*} detail - 参数
 * @return {Object}  - event对象
 */
export const createEvent = (target, eventName, detail) => {
    let timeStamp = Date.now() - eventStartTime;
    let eventDetail = {};
    // 兼容旧版本
    if (Object.prototype.toString.call(detail) === '[object Object]') {
        eventDetail = {
            ...detail
        };
    }
    eventDetail.type = eventDetail.type || eventName;
    eventDetail.detail = detail;
    eventDetail.timeStamp = timeStamp;
    eventDetail.currentTarget = eventDetail.currentTarget || {
        id: target.id,
        dataset: target.dataset
    };
    eventDetail.target = eventDetail.target || {
        id: target.id,
        dataset: target.dataset
    };
    return eventDetail;
};