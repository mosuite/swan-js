/**
 * @file 自定义组件Component和Behavior中对于相关数据的merge方法
 * @author lvlei(lvlei03@baidu.com)
 */

import {deepAssign} from '../../utils';

const mergeMethod = (oldMethod = {}, newMethod = {}) => function () {
    typeof newMethod === 'function' && newMethod.call(this);
    typeof oldMethod === 'function' && oldMethod.call(this);
};

// Component 与 Behavior 构造器中公共的merge方法
const commonAttrMergeMethods = {
    created: mergeMethod,
    attached: mergeMethod,
    ready: mergeMethod,
    detached: mergeMethod,
    pageLifetimes: (oldPageLifetimes = {}, newPageLifetimes = {}) => {
        const mergePageLifetimes = {...oldPageLifetimes, ...newPageLifetimes};
        return Object.keys(mergePageLifetimes)
            .reduce((pageLifetimeMap, eventName) => {
                pageLifetimeMap[eventName] = mergeMethod(
                        oldPageLifetimes[eventName],
                        newPageLifetimes[eventName]
                    );
                return pageLifetimeMap;
            }, {});
    }
};

// 在Component构造器中merge其他Behavior的方法
export const componentAttrMergeMethods = {
    properties: (oldProperties = {}, newProperties = {}) => {
        return ({...newProperties, ...oldProperties});
    },
    data: (oldData = {}, newData = {}) => deepAssign(newData, oldData),
    methods: (oldMethods = {}, newMethods = {}) => {
        return ({...newMethods, ...oldMethods});
    },
    ...commonAttrMergeMethods
};

// 在Behavior构造器中merge其他Behavior的方法
export const behaviorAttrMergeMethods = {
    properties: (oldProperties = {}, newProperties = {}) => {
        return ({...oldProperties, ...newProperties});
    },
    data: (oldData = {}, newData = {}) => deepAssign(oldData, newData),
    methods: (oldMethods = {}, newMethods = {}) => {
        return ({...oldMethods, ...newMethods});
    },
    ...commonAttrMergeMethods
};
