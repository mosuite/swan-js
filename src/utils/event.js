/**
 * @file 事件相关属性以事件相关方法集合
 * @author houyu(houyu01@baidu.com)
 */
import san from 'san';

const eventProxyAnode = san.parseTemplate(`<a
    on-touchstart="onTouchStart($event, false)"
    on-touchstart="capture:onTouchStart($event, true)"
    on-touchmove="onTouchMove($event, false)"
    on-touchmove="capture:onTouchMove($event, true)"
    on-touchend="onTouchEnd($event, false)"
    on-touchend="capture:onTouchEnd($event, true)"
    on-touchcancel="onTouchcancel($event)"
    on-contextmenu="onContextmenu($event)"
></a>`);

const normalEventList = {
    touchstart: 1,
    touchend: 1,
    touchmove: 1,
    touchcancel: 1
};

const customEventList = {
    capturebindtap: 1,
    bindtap: 1,
    bindtouchend: 1,
    bindtouchstart: 1,
    bindtouchmove: 1,
    bindtouchcancel: 1
};

const nativeBehaviorEventList = {
    contextmenu: 1
};

const normalEvents = eventProxyAnode.children[0].events
.filter(event => normalEventList[event.name]);

const nativeBehaviorEvents = eventProxyAnode.children[0].events
.filter(event => nativeBehaviorEventList[event.name]);

export const eventUtils = {
    normalEvents,
    nativeBehaviorEvents
};

export const hasCustomEvent = (listener, props) => {
    for (let event in listener) {
        if (customEventList[event]) {
            return true;
        }
    }
    return false;
};

export const getCustomEventMap = listeners => Object.keys(listeners)
.reduce((listenerMap, listenerName) => {
    const listener = listeners[listenerName][0];
    if (listener) {
        const exprValue = listener.declaration.expr.raw;
        const eventFuncName = /eventHappen\([^,]*,[^,]*,\s*'([^,]*)',[^)]*\)/g.exec(exprValue);
        if (eventFuncName) {
            listenerMap[listenerName] = eventFuncName[1];
        }
    }
    return listenerMap;
}, {});