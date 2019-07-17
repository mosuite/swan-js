/**
 * @file page类的原型对象
 * @author houyu(houyu01@baidu.com)
 */
import {initLifeCycle} from './life-cycle';
import {builtInBehaviorsAction} from '../custom-component/inner-behaviors';

const noop = () => {};
const SETDATA_THROTTLE_TIME = 10;




/**
 * 创建一个用户的page对象的原型单例
 * @param {Object} [masterManager] masterManager底层接口方法
 * @return {Object} page存放着所有page对象的原型方法的对象
 */
export const createPagePrototype = (masterManager, globalSwan) => {
    return {
        getData(path) {
            return this.privateProperties.raw.get(path);
        },
        /**
         * 通用的，向slave传递的数据操作统一方法
         *
         * @param {Object} dataParams - 数据操作的参数
         * @param {string} dataParams.type - 数据操作的类型
         * @param {string} dataParams.path - 数据操作的路径值
         * @param {Object} dataParams.value - 数据操作的数据值
         * @param {Function} dataParams.cb - 数据操作后的回调
         * @param {Object} dataParams.options - 数据操作的额外选项
         */
        sendDataOperation({
            type,
            path,
            value,
            cb = noop,
            options
        }) {
            const {
                raw,
                slaveId
            } = this.privateProperties;
            const setObject = typeof path === 'object' ? path : {
                [path]: value
            };

            cb = typeof cb === 'function' ? cb : noop;
            const callback = typeof value === 'function' ? value : cb;  
            const pageUpdateStart = Date.now() + '';

            // 暂时只优化自定义组件的数据设置，进行throttle
            if (type === 'setCustomComponent') {
                this.operationSet = this.operationSet || [];
                this.operationSet.push({
                    setObject,
                    options,
                    pageUpdateStart
                });
                clearTimeout(this.operationTimmer);
                this.operationTimmer = setTimeout(() => {
                    // 先set到本地，然后通知slave更新视图
                    this.sendMessageToCurSlave({
                        slaveId,
                        type: `${type}Data`,
                        operationSet: this.operationSet
                    });
                    this.operationSet = [];
                }, SETDATA_THROTTLE_TIME);
            }
            else {
                // 先set到本地，然后通知slave更新视图
                this.sendMessageToCurSlave({
                    type: `${type}Data`,
                    slaveId,
                    setObject,
                    pageUpdateStart,
                    options
                });
            }
            // 更新data
            for (const path in setObject) {
                raw[type] && raw[type](path, setObject[path]);
            }
            this.nextTick(callback);
        },

        sendMessageToCurSlave(message) {
            masterManager.communicator.sendMessage(this.privateProperties.slaveId, {
                ...message,
                isStoreData: true
            });
        },

        /**
         * 页面中挂载的setData操作方法，操作后，会传到slave，对视图进行更改
         *
         * @param {string|Object} [path] - setData的数据操作路径，或setData的对象{path: value}
         * @param {*} [value] - setData的操作值
         * @param {Function} [cb] - setData的回调函数
         */
        setData(path, value, cb) {
            this.sendDataOperation({
                type: 'set',
                path,
                value,
                cb
            });
        },
        // splice方法系列
        pushData(path, value, cb) {
            this.sendDataOperation({
                type: 'push',
                path,
                value,
                cb
            });
        },
        popData(path, cb) {
            this.sendDataOperation({
                type: 'pop',
                path,
                value: null,
                cb
            });
        },
        unshiftData(path, value, cb) {
            this.sendDataOperation({
                type: 'unshift',
                path,
                value,
                cb
            });
        },
        shiftData(path, cb) {
            this.sendDataOperation({
                type: 'shift',
                path,
                value: null,
                cb
            });
        },
        removeAtData(path, index, cb) {
            this.sendDataOperation({
                type: 'remove',
                path,
                value: index,
                cb
            });
        },
        spliceData(path, args, cb) {
            this.sendDataOperation({
                type: 'splice',
                path,
                value: args,
                cb
            });
        },
        createCanvasContext(...args) {
            return globalSwan.createCanvasContext.call(this, ...args);
        },
        nextTick(fn) {
            masterManager.communicator
                .onMessage(`nextTick:${this.privateProperties.slaveId}`, () => fn(), {
                    once: true
                });
        },

        /**
         * 实例调用自己的方法
         *
         * @param {string} method - 调用的方法
         * @param {*} args - 传入的参数
         */
        callMethods(method, args) {
            if (typeof this[method] === 'function') {
                this[method](args);
            }
        },

        /**
         * 页面级选择某个(id、class)全部的自定义组件
         *
         * @param {string} selector - 待选择的自定义组件id
         * @return {Array} - 所选的全部自定义组件集合
         */
        selectAllComponents(selector) {
            return this.privateMethod
                .getComponentsFromList(this.privateProperties.customComponents, selector, '*');
        },

        /**
         * 页面级选择某个(id、class)第一个自定义组件
         *
         * @param {string} selector - 待选择的自定义组件id
         * @return {Object} - 自定义组件被拦截的export输出 | 所选的自定义组件实例
         */
        selectComponent(selector) {
            const selectRes = this.selectAllComponents(selector)[0];
            // 当自定义组件中包含内置behavior时, 进行拦截操作
            const exportRes = builtInBehaviorsAction('swanComponentExport', selectRes);
            return exportRes.isBuiltInBehavior ?  exportRes.resData : selectRes;
        },

        // page实例中的私有方法合集
        privateMethod: {

            /**
             * 发送初始数据到当前Page对应的slave上
             *
             * @param {Object} [appConfig] - 发送初始化数据时携带的appConfig信息
             */
            sendInitData(appConfig) {
                masterManager.communicator.sendMessage(
                    this.privateProperties.slaveId,
                    {
                        type: 'initData',
                        path: 'initData',
                        value: this.data,
                        extraMessage: {
                            componentsData: this.privateMethod.getCustomComponentsData
                                .call(this, this.usingComponents, masterManager.communicator)
                        },
                        slaveId: this.privateProperties.slaveId,
                        appConfig
                    }
                );
            },

            navigate(params) {
                switch (params.openType) {
                    case 'navigate':
                        globalSwan.navigateTo({
                            url: params.uri
                        });
                        break;
                    case 'redirect':
                        globalSwan.redirectTo({
                            url: params.uri
                        });
                        break;
                    case 'switchTab':
                        globalSwan.switchTab({
                            url: params.uri
                        });
                        break;
                    case 'reLaunch':
                        globalSwan.reLaunch({
                            url: params.uri
                        });
                        break;
                    case 'navigateBack':
                        globalSwan.navigateBack({
                            delta: +params.delta
                        });
                        break;
                }
            },

            rendered(params) {
                this._onReady({});
            },

            onPageRender(params) {
                this.privateMethod.registerCustomComponents.call(this, params.customComponents);
            },

            reachBottom(params) {
                this._reachBottom(params);
            },

            onPageScroll(params) {
                this._onPageScroll(params.event);
            },

            share(params, from) {
                // share有两种： menu/button。右上角系统分享from="menu"，button按钮from=undefined
                //      menu时候回传字段：from、有webview时候还需回传webViewUrl
                //      button时候回传两个字段：from、target
                let data = {
                    from: from || 'button'
                };
                data.from === 'menu' && params.webViewUrl && (data.webViewUrl = params.webViewUrl);
                data.from === 'button' && (data.target = params);
                this._share(data);
            },
            pullDownRefresh(params) {
                this._pullDownRefresh(params);
            },
            accountChange() {
                masterManager.communicator
                    .sendMessage(this.privateProperties.slaveId, {
                        type: 'openDataAccountChange'
                    });
            },
            /**
             * slave中的nextTick到达后，会进行通知
             */
            nextTickReach() {
                masterManager.communicator.fireMessage({
                    type: `nextTick:${this.privateProperties.slaveId}`
                });
            },
            customEventsMap(params) {
                this.privateProperties.customEventMap = params.eventParams.customEventMap;
            },
            /**
             * 向slave中发送message
             *
             * @param {Object} [message] - 发送的消息本体
             */
            dispatchToSlave(message) {
                masterManager.communicator.sendMessage(this.privateProperties.slaveId, message);
            },

            /**
             * 查询给定组件集合中的所有组件
             *
             * @param {Array} [componentList] - 要查询的基础自定义组件的列表
             * @param {string} [selector] - 查询自定义组件使用的选择器
             * @param {string} [nodeId] - 查询自定义组件的限定nodeId -- 即在某一个id为nodeId的组件下，查询自定义组件
             * @return {Array} 查询出来的自定义组件实例集合
             */
            getComponentsFromList(componentList, selector, nodeId) {
                // 将选择器表达式，切割成为数组
                const selectorArr = selector.split(' ');
                // 从右向左，先取出所有符合最后条件的集合
                const topSelector = selectorArr.pop();

                const judgeComponentMatch = (component, selector, ownerId) => {
                    return (component.nodeId === selector.replace(/^#/, '') || component.className.split(' ')
                        .find(className => {
                            return className.replace(/^[^$]*?__/g, '') === selector.replace(/^\./, '');
                        })) && (component.ownerId === ownerId || ownerId === '*');
                };
                // 依据某一个条件(className或nodeId)，选择出符合条件的组件实例列表
                const findInComponentList = (componentList, selector) => Object.values(componentList || {})
                    .filter(component => judgeComponentMatch(component, selector, nodeId));
                // 选择出的符合最后条件的集合
                const selectedComponents = findInComponentList(componentList, topSelector);

                // 针对某一个组件，从下向上遍历选择器，确定该组件是否符合条件
                const findReverse = (selectorArr, selectedComponent, index) => {
                    if (index < 0) {
                        return true;
                    }
                    if (!selectedComponent.parentId) {
                        return false;
                    }
                    const selector = selectorArr[index];
                    const matchSelector = judgeComponentMatch(selectedComponent, selector, nodeId);
                    return findReverse(
                        selectorArr,
                        componentList[selectedComponent.parentId],
                        matchSelector ? index - 1 : index
                    );
                };
                // 在所有符合最后条件的组件，过滤掉所有祖先元素不能满足剩下表达式的component，满足的则为目标对象
                return selectedComponents.filter(selectedComponent => {
                    return findReverse(selectorArr, selectedComponent, selectorArr.length - 1);
                });
            },

            /**
             * 调用当前页面的自定义组件上定义的方法
             *
             * @param {string} nodeId 自定义组件的id
             * @param {Object} eventValue 发生的事件对象
             */

            callComponentMethod(nodeId, eventValue) {
                const reflectComponent = this.privateProperties.customComponents[nodeId];
                if (reflectComponent
                    && reflectComponent[eventValue.reflectMethod]
                ) {
                    reflectComponent[eventValue.reflectMethod]
                        .call(reflectComponent, eventValue.e);
                }
                else {
                    console.error('no method found');
                }
            },

            /**
             * 根据传递的值推算出元素的属性
             *
             * @param {Object} target 元素的结构化对象
             * @return {Object} 元素的所有属性
             */
            getAttributes(target) {
                const dataset = target.dataset;
                let attributes = {};

                for (let name in dataset) {
                    attributes[`data-${name}`] = dataset[name];
                }
                attributes['id'] = target.id;
                return attributes;
            },

            matchAttribute(eventKey) {
                let dataAttributeExpression = /\[([^=]*?)(=['"]([^=]*?)['"])?\]:(.*?)$/g
                        .exec(eventKey);
                if (dataAttributeExpression) {
                    return {
                        type: 'data',
                        expression: dataAttributeExpression
                    }
                }

                let allAttributeExpression = /\*:(.*?)$/g.exec(eventKey);
                if (allAttributeExpression){
                    return {
                        type: '*',
                        expression: dataAttributeExpression
                    }
                }
            },

            handleHooksEvents(eventValue) {
                let returnValue = null;
                console.log(this.privateProperties.hooks)
                // 遍历所有的eventhook
                this.privateProperties.hooks
                    .forEach(hook => {
                        for (let eventKey in hook.events) {

                            console.log(eventKey);
                            // 使当前的hook匹配既定规则
                            let matched = this.privateMethod.matchAttribute(eventKey);

                            // 当前匹配了data-规则
                            if (matched.type == 'data') {
                                console.log("matched", matched)
                                const [, attributeKey, , attributeValue, eventType] = matched.expression;
                                const processedKey = attributeKey
                                    .replace(/(data-)(.*)$/, (all, prefix, suffix) => {
                                        return prefix + suffix
                                            .replace(/-(\w)/, (all, word) => word.toUpperCase());
                                    });

                                // 寻找元素节点的dataset
                                const attributes = this.privateMethod.getAttributes(eventValue.e.currentTarget);
                                for (let name in attributes) {
                                    // 寻找映射的method
                                    if (processedKey === name &&
                                        (attributeValue === attributes[name] ||
                                            attributeValue === undefined) &&
                                        eventValue.eventType === eventType
                                    ) {
                                        console.log('find event', eventValue)
                                        returnValue = hook.events[eventKey]({
                                            target: eventValue.e.currentTarget,
                                            thisObject: this,
                                            args: eventValue.e
                                        });
                                    }
                                }
                            }

                            // 当前匹配了*规则
                            if (matched.type == '*'){
                                console.log("matched", matched)
                            }
                        }
                    });
            },
            
            /**
             * 调用当前页面上的方法
             *
             * @param {string} methodName 页面上定义的方法名称
             * @param {Object} eventValue 发生事件的事件对象
             */
            callMethod(methodName, eventValue) {

                // 调用Page对象上的同名方法
                if (typeof this[methodName] === 'function') {
                    this[methodName](eventValue.e);
                }
                this.privateMethod.handleHooksEvents.call(this, eventValue);
            },

            ...masterManager.virtualComponentFactory.getCustomComponentMethods(),
            ...masterManager.swanComponents.getComponentRecievers(masterManager.communicator)
        }
    };
};

let pagePrototype = null;
// 获取page的prototype的单例方法，节省初始化
export const getPagePrototypeInstance = (masterManager, globalSwan, pageLifeCycleEventEmitter) => {
    if (!pagePrototype) {
        pagePrototype = createPagePrototype(masterManager, globalSwan);
        initLifeCycle(pagePrototype, pageLifeCycleEventEmitter);
    }
    return pagePrototype;
};
