/**
 * @file 用户的自定义组件(在master中的句柄)的创建工厂
 * @author houyu(houyu01@baidu.com)
 */
import swanEvents from '../../utils/swan-events';
import {createEvent} from '../../utils/createEvent';
import {deepClone, Data, isEqual, convertToCamelCase} from '../../utils';
import {getPropertyVal} from '../../utils/custom-component';
import {builtInBehaviorsAction} from './inner-behaviors';
import {componentAttrMergeMethods, behaviorAttrMergeMethods} from './merge-behaviors';

export default class VirtualComponentFactory {

    constructor(swaninterface) {

        this.virtualClassInfo = {};

        this.behaviorsMap = {};

        this.swaninterface = swaninterface;
    }

    /**
     * 创建虚拟组件实例的方法
     *
     * @param {Object} componentProto - 自定义组件的实体对象
     * @param {Object} instanceProperties - 组件的所有实例化时需要装载的属性
     * @return {Object} 创建出来的自定义组件实例
     */
    createInstance(componentProto, instanceProperties) {

        const componentEntity = {...componentProto};

        const initialInstance = {
            ...instanceProperties,
            ...this.getBuiltInMethods(this.swaninterface)
        };

        // 创建一个自定义组件的句柄实例
        const specialProps = ['data', 'properties'];

        const instance = Object.keys(componentEntity)
            .reduce((instance, propName) => {
                if (!~specialProps.indexOf(propName)) {
                    instance[propName] = deepClone(componentEntity[propName]);
                }
                return instance;
            }, initialInstance);

        // 将lifetimes分解到自定义组件实例中
        const decoratedInstance = Object.assign(instance, instance.lifetimes);

        // 将behaviors分解并merge到自定义组件实例中
        this.mergeBehaviors(decoratedInstance, decoratedInstance.behaviors, componentEntity);

        // 将自定义组件中methods方法集合分解到自定义组件实例中
        Object.assign(decoratedInstance, decoratedInstance.methods);

        // 将已merge完成的数据绑定到自定义组件实例中
        this.bindDataToInstance(
            decoratedInstance,
            componentEntity.properties,
            componentEntity.data,
            instanceProperties.data
        );

        if (decoratedInstance.nodeId) {

            // Component中处理自定义组件扩展definitionFilter
            this.definitionFilterExecutor(decoratedInstance, decoratedInstance.behaviors);

            // 全局样式类处理
            if (decoratedInstance.options
                && decoratedInstance.options.addGlobalClass
            ) {
                this.processGlobalClass(decoratedInstance);
            }

            // 外部样式类处理
            if (decoratedInstance.externalClasses) {
                this.addExternalClasses(decoratedInstance);
            }

            // behaviors中内置属性 swan://form-field 处理
            if (decoratedInstance.behaviors) {
                builtInBehaviorsAction('swanFormField', decoratedInstance);
            }
        }

        return decoratedInstance;
    }

    /**
     * 通知自定义组件内的原生组件进行全局样式类处理
     *
     * @param {Object} initialInstance - 自定义组件实例
     */
    processGlobalClass(initialInstance) {
        if (initialInstance.pageinstance) {
            initialInstance.pageinstance
                .sendMessageToCurSlave({
                    type: 'convertCustomComponentClass',
                    nodeId: initialInstance.nodeId,
                    extraMessage: {
                        eventType: 'addGlobalClass'
                    }
                });
        }
    }

    /**
     * 相关class加工, 并通知自定义组件内的原生组件进行外部样式类处理
     *
     * @param {Object} initialInstance - 自定义组件实例
     */
    addExternalClasses(initialInstance) {

        if (Object.prototype.toString.call(initialInstance.externalClasses) === '[object Array]') {

            // 将Component中的externalClasses全部转换成驼峰形式
            const cameledClasses = initialInstance.externalClasses
                .map(externalClass => convertToCamelCase(externalClass));

            // Component中externalClasses与其转换成驼峰命名后的映射
            const cameledClassesMap = initialInstance.externalClasses
                .reduce((cameledClassesMap, className) => {
                    cameledClassesMap[className] = convertToCamelCase(className);
                    return cameledClassesMap;
                }, {});

            // 挂载在自定义组件具有实际作用的classes
            const availableClassesList = Object.keys(initialInstance.data)
                .filter(property => cameledClasses.includes(property))
                .map(property => initialInstance.data[property]);

            // Component中的externalClasses与挂载在自定义组件具有实际作用class的映射
            const convertedClassesMap = Object.keys(cameledClassesMap)
                .reduce((convertedClassesMap, convertedClass) => {
                    convertedClassesMap[convertedClass] = initialInstance
                        .data[cameledClassesMap[convertedClass]];
                    return convertedClassesMap;
                }, {});

            // 通知自定义组件内的原生组件进行外部样式类处理
            if (initialInstance.pageinstance) {
                initialInstance.pageinstance
                    .sendMessageToCurSlave({
                        type: 'convertCustomComponentClass',
                        nodeId: initialInstance.nodeId,
                        extraMessage: {
                            eventType: 'addExternalClasses',
                            value: {
                                externalClasses: initialInstance.externalClasses,
                                availableClasses: availableClassesList,
                                classes: convertedClassesMap
                            }
                        }
                    });
            }
        }
    }

    /**
     * 绑定产生的新数据到组件实例上
     *
     * @param {Object} initialInstance - 组件实例
     * @param {Object} properties      - 组件原型上的properties
     * @param {Object} initData        - 组件原型上的data
     * @param {Object} instanceData    - 组件实例中，外部传入的props
     * @return {Object} 绑定后的实例
     */
    bindDataToInstance(initialInstance, properties, initData, instanceData) {

        const instanceProperties = deepClone(properties);

        // 将properties与data进行融合
        const initDataObj = this.dataConverter(initialInstance, instanceProperties, initData);

        // 将原型的properties与传入的props融合一下
        initialInstance['_data'] = new Data(initDataObj);

        if (instanceData) {
            for (const prop in instanceData) {
                initialInstance['_data'].set(prop, instanceData[prop]);
            }
        }

        Object.defineProperties(initialInstance, {
            data: {
                get() {
                    return this._data.raw;
                },
                set(value) {
                    this._data.raw = value;
                }
            },
            properties: {
                get() {
                    return this._data.raw;
                },
                set(value) {
                    this._data.raw = value;
                }
            }
        });

        return initialInstance;
    }

    /**
     * 将用户设置的数据进行转换，包括将props与data进行merge，将props转换为我方代理
     *
     * @param {Object} context - 当数据发生变化时回调的上下文
     * @param {Object} props   - 用户设置的组件初始化props
     * @param {Object} data    - 用户设置的组件初始化私有数据
     * @return {Object} merge后的data对象
     */
    dataConverter(context, props = {}, data = {}) {
        const instanceData = JSON.parse(JSON.stringify(data));
        for (const name in props) {
            Object.defineProperty(instanceData, name, {
                get() {
                    // 此处不能以简单布尔判断, 如下前缀值判断使得用户传props值可以为false
                    return Object.keys(this).includes(`__${name}`)
                        ? this[`__${name}`] : getPropertyVal(props[name]);
                },
                set(value) {
                    // 当property值类型为object才进行后续的observer操作
                    if (Object.prototype.toString.call(props[name]) === '[object Object]') {
                        const observer = props[name].observer;
                        const oldValue = this[name];
                        if (!isEqual(oldValue, value)) {
                            setTimeout(() => {
                                try {
                                    if (typeof observer === 'function') {
                                        observer.call(context, value, oldValue);
                                    }
                                    else if (typeof observer === 'string'
                                        && typeof context[observer] === 'function'
                                    ) {
                                        context[observer].call(context, value, oldValue);
                                    }
                                } catch (err) {
                                    console.error(`execute observer ${observer} callback fail! err: ${err}`);
                                }
                            }, 0);
                        }
                    }
                    this[`__${name}`] = value;
                },
                enumerable: true
            });
        }
        return instanceData;
    }

    /**
     * 在Component构造方法中, 将behaviors融合到target对象上
     *
     * @param {Object} target   - 目标对象
     * @param {Array} behaviors - 需要merge的behaviors的集合
     * @param {Object} componentEntity - 组件的实体备份对象
     * @return {Object} 已merge完behaviors的目标对象
     */
    mergeBehaviors(target, behaviors = [], componentEntity) {
        const specialProps = ['data', 'properties'];
        behaviors
            .filter(behavior => Object.prototype.toString.call(behavior) === '[object Object]')
            .forEach(behavior => {
                for (const attribute in behavior) {
                    if (componentAttrMergeMethods[attribute]) {
                        if (specialProps.includes(attribute)) {
                            componentEntity[attribute]
                                = componentAttrMergeMethods[attribute](componentEntity[attribute], behavior[attribute]);
                        } else {
                            target[attribute]
                                = componentAttrMergeMethods[attribute](target[attribute], behavior[attribute]);
                        }
                    }
                }
            });
        return target;
    }

    /**
     * 获取用户组件实例需要的所有方法
     *
     * @param {Object} swaninterface - 相关接口方法
     * @return {Object} 组件上所有需要挂载的方法
     */
    getBuiltInMethods(swaninterface) {
        return {

            /**
             * 自定义组件的setData方法
             * @param {string} path 自定义组件设置数据的数据路径
             * @param {*} value 设置数据的值
             * @param {Function} cb setData回调
             */
            setData(path, value, cb) {
                this.pageinstance
                .sendDataOperation({
                    cb,
                    path,
                    value,
                    type: 'setCustomComponent',
                    options: {
                        nodeId: this.nodeId
                    }
                });
                const setObject = typeof path === 'object' ? path : {[path]: value};
                for (const path in setObject) {
                    this._data.set(path, setObject[path]);
                }
            },

            /**
             * 主动触发事件的方法
             *
             * @param {string} eventName 事件名
             * @param {Object=} eventData 触发的事件携带参数
             */
            triggerEvent(eventName, eventData = {}) {
                let eventDetail = createEvent(this, eventName, eventData);
                let nodeId = this.nodeId;
                let pageinstance = this.pageinstance;
                let ownerId = this.ownerId;
                let pageUsedComponents = pageinstance.privateProperties.customComponents;

                try {
                    // 获取该自定义组件的事件集合
                    let triggerEventName = pageUsedComponents[nodeId]['customEventMap']['bind' + eventName];
                    // 如果在页面的usingcomponent 中找到了他的父组件
                    if (pageUsedComponents && pageUsedComponents[ownerId]) {
                        pageUsedComponents[ownerId].callMethod(triggerEventName, eventDetail);
                    } else {
                        // 没找到组件默认走页面
                        pageinstance.callMethods(triggerEventName, eventDetail);
                    }
                } catch (e) {
                    console.error(e);
                }
            },
            callMethod(method, args) {
                if (typeof this[method] === 'function') {
                    this[method](args);
                }
            },
            dispatch(name, value) {
                try {
                    const parentComponent = this.pageinstance
                        .privateProperties.customComponents[this.ownerId];
                    if (parentComponent && parentComponent.messages) {
                        const receiver = parentComponent.messages[name]
                            || parentComponent.messages['*'];
                        if (typeof receiver === 'function') {
                            receiver.call(
                                parentComponent,
                                {target: this, value, name}
                            );
                            return;
                        }
                    }
                    parentComponent && parentComponent.dispatch(name, value);
                }
                catch (err) {
                    console.error(err);
                }
            },

            /**
             * 组件级选择某个(id、class)自定义组件的全部集合
             *
             * @param {string} selector - 待选择的自定义组件id或class
             * @return {Array} 所选的自定义组件全部集合
             */
            selectAllComponents(selector) {
                return this.pageinstance.privateMethod
                    .getComponentsFromList(
                        this.pageinstance.privateProperties.customComponents,
                        selector,
                        this.nodeId
                    );
            },

            /**
             * 组件级选择某个(id、class)第一个自定义组件
             *
             * @param {string} selector - 待选择的自定义组件id或class
             * @return {Object} 自定义组件被拦截的export输出 | 所选的自定义组件实例
             */
            selectComponent(selector) {
                const selectRes = this.selectAllComponents(selector)[0];
                // 内置属性swan://component-export拦截处理
                const exportRes = builtInBehaviorsAction('swanComponentExport', selectRes);
                return exportRes.isBuiltInBehavior ?  exportRes.resData : selectRes;
            },
            createSelectorQuery() {
                return swaninterface.swan.createSelectorQuery().in(this);
            },
            createIntersectionObserver(options) {
                return swaninterface.swan.createIntersectionObserver(this, options);
            },
            _propsChange({key, value}) {
                this._data.set(key, value);
            },
            hasBehavior() {
                return !!this.behaviors && !!this.behaviors.length;
            },
            groupSetData(cb) {
                typeof cb === 'function' && cb.call(this);
            }
        };
    }

    /**
     * 定义master中控制component的虚拟component对象，对外是Component函数
     *
     * @param {Object} componentProto - 组件的原型
     * @param {string} componentPath  - 组件的路径(当作组件的唯一标识)
     * @return {class} 注册好的类
     */
    defineVirtualComponent(componentProto, componentPath = window.__swanRoute) {

        const componentDefaultProto = {
            properties: {},
            data: {},
            methods: {}
        };

        this.virtualClassInfo[componentPath] = {
            componentProto: {
                ...componentDefaultProto,
                ...componentProto,
                usingComponents: window.usingComponents || []
            }
        };
    }

    /**
     * 全局函数Behavior处理初始化对象
     *
     * @param {Object} behaviorProto - 初始化处理Behavior数据
     * @return {Object} 经过处理之后的Behavior数据
     */
    defineBehavior(behaviorProto) {

        // 将lifeTimes中融合的生命周期分解到实例中, 便于自定义组件实例只处理已分解的生命周期
        Object.assign(behaviorProto, behaviorProto.lifetimes);

        // behaviors中的自定义组件扩展definitionFilter先行处理
        this.definitionFilterExecutor(behaviorProto, behaviorProto.behaviors);

        if (Object.prototype.toString.call(behaviorProto.behaviors) === '[object Array]') {
            behaviorProto.behaviors
                .filter(behavior => Object.prototype.toString.call(behavior) === '[object Object]')
                .forEach(behavior => {
                    for (const attribute in behavior) {
                        if (behaviorAttrMergeMethods[attribute]) {
                            behaviorProto[attribute] = behaviorAttrMergeMethods[attribute](
                                    behaviorProto[attribute],
                                    behavior[attribute]
                                );
                        }
                    }
                });
        }
        return behaviorProto;
    }

    /**
     * 定义阶段处理自定义组件扩展definitionFilter
     * 
     * @param {Object} instance          - 当前组件或behavior实例
     * @param {Array} behaviorDependence - 当前实例依赖的behaviors
     */
    definitionFilterExecutor(instance, behaviorDependence = []) {
        behaviorDependence
            .filter(behavior => behavior.definitionFilter)
            .forEach(behavior => {

                const innerBehaviors = behavior.behaviors || [];

                const definitionFilterArr = innerBehaviors
                    .map(singleBehavior => singleBehavior.definitionFilter)
                    .filter(filter => !!filter);

                if (typeof behavior.definitionFilter === 'function') {
                    behavior.definitionFilter.call(this, instance, definitionFilterArr);
                }
            });
    }

    /**
     * 获取一个component的实例
     *
     * @param {string} componentPath       - 创建component的路径
     * @param {Object} componentProperties - 创建component鞋带的property
     * @return {Object} 获取一个组件的实例
     */
    getComponentInstance(componentPath, componentProperties = {}) {
        try {
            return this.createInstance(
                    this.virtualClassInfo[componentPath].componentProto,
                    componentProperties
                );
        }
        catch (err) {
            console.error(`【Custom Component Error】can't find ${componentPath}, please check your config:
            1. Please check if the reference path is correct;
            2. If it is a page under this path, the "component: true" in the current page JSON should be removed.`);
        }
    }

    /**
     * 获取所有可序列化的数据值
     *
     * @param {Object} data - 数据对象树
     * @return {Object} 真正数据值的对象树
     */
    getDataValues(data) {
        return Object.keys(data)
            .reduce((dataValues, key) => {
                dataValues[key] = data[key];
                return dataValues;
            }, {});
    }

    /**
     * 获取某一类组件的可序列化数据，传到slave中初始化组件用
     *
     * @param {Array} componentPath - 所有当前页面用到的自定义组件的路径集合
     * @return {Object} 所有当前页面用到的自定义组件的初始化数据
     */
    getComponentData(componentPath) {

        const componentClass = this.getComponentInstance(componentPath);

        if (!componentClass) {
            console.error(`can't find ${componentPath}, please check your config`);
            return {};
        }

        return this.getDataValues(componentClass.data);
    }

    /**
     * 获取所有master中所有承接slave的自定义组件的方法
     * 当master收到slave来的消息后，会调用相应方法，注册或更改自己的virtual-component
     *
     * @return {Object} 所有承接slave自定义组件方法的集合
     */
    getCustomComponentMethods() {

        const virtualComponentFactory = this;

        const callMethodSafty = (obj, methodName, ...args) => {
            try {
                obj[methodName] && obj[methodName](...args);
            }
            catch (e) {
                console.error(e);
            }
        };

        return {

            /**
             * 获取某一组自定义组件的初始数据
             *
             * @param {Array} componentPathSet - 需要获取数据的一组自定义组件
             * @return {Object} 该类组件的数据
             */
            getCustomComponentsData(componentPathSet = [], communicator) {
                const getComponentPath = (componentPathSet = [], visitedPaths = []) => {
                    return componentPathSet.reduce((mergedSet, componentPath) => {
                        if (~visitedPaths.indexOf(componentPath)) {
                            return mergedSet.concat(componentPath);
                        }
                        const componentClass = virtualComponentFactory
                            .getComponentInstance(componentPath);
                        visitedPaths.push(componentPath);
                        const usingComponents = getComponentPath(
                                componentClass.usingComponents,
                                visitedPaths
                            );
                        return mergedSet.concat(componentPath).concat(usingComponents);
                    }, []);
                };

                const mergedComponentPaths = getComponentPath(componentPathSet);
                return mergedComponentPaths.reduce((componentsData, componentPath) => {
                    componentsData[componentPath] = virtualComponentFactory
                        .getComponentData(componentPath);
                    return componentsData;
                }, {});
            },

            /**
             * 注册一组自定义组件
             *
             * @param {Array} componentsInfo - 一组组件的原型
             */
            registerCustomComponents(componentsInfo = []) {
                componentsInfo
                    .forEach(componentInfo => {
                        return this.privateMethod.registerCustomComponent.call(this, componentInfo);
                    });
                this.privateMethod.callCustomComponentLifeTimes.call(this, componentsInfo);
            },

            /**
             * 调用组件生命周期
             *
             * @param {Array} componentsInfo  - 一组组件的原型
             */
            callCustomComponentLifeTimes(componentsInfo = []) {
                setTimeout(() => {
                    componentsInfo.forEach(component => {
                        callMethodSafty(this.privateProperties.customComponents[component['nodeId']], 'created');
                    });
                    componentsInfo.forEach(component => {
                        callMethodSafty(this.privateProperties.customComponents[component['nodeId']], 'attached');
                    });
                    componentsInfo.forEach(component => {
                        callMethodSafty(this.privateProperties.customComponents[component['nodeId']], 'ready');
                    });
                }, 0);
            },
            /**
             * 用于接收slave中发来的自定义组件的事件
             *
             * @param {Object} params 自定义组件事件的参数
             */
            customComponentEvent(params) {

                switch (params.type) {
                    case 'customComponent:detached':
                        callMethodSafty(
                            this.privateProperties.customComponents[params.nodeId],
                            'detached'
                        );
                        break;

                    case 'customComponent:_propsChange':
                        callMethodSafty(
                            this.privateProperties.customComponents[params.nodeId],
                            '_propsChange',
                            params.raw
                        );
                        break;

                }
            },

            /**
             * 注册一个自定义组件
             *
             * @param {Object} componentInfo               - 组件的注册信息
             * @param {string} componentInfo.componentName - 组件名称
             * @param {Object} componentInfo.data          - 组件的初始化数据(merge过用户传递的props之后)
             * @param {string} componentInfo.className     - 自定义组件的类
             * @param {string} componentInfo.nodeId        - 组件的唯一标识
             * @param {string} componentInfo.id            - 组件id
             * @param {string} componentInfo.is            - 组件文件路径
             * @param {Object} componentInfo.dataset       - 组件节点dataset
             * @param {string} componentInfo.ownerId       - 组件实例的父组件标识
             * @param {string} componentInfo.parentId      - 组件实例的视图父元素
             * @param {string} componentInfo.componentPath - 需要初始化的组件的路径
             */
            registerCustomComponent({
                componentName,
                data,
                className,
                nodeId,
                id,
                is,
                dataset,
                ownerId,
                parentId,
                customEventMap,
                componentPath
            }) {
                try {
                    this.privateProperties.customComponents = this.privateProperties.customComponents
                                                                || {};
                    this.privateProperties.customComponents[nodeId] = virtualComponentFactory
                        .getComponentInstance(componentPath, {
                            componentName,
                            data,
                            className,
                            nodeId,
                            id,
                            is,
                            dataset,
                            ownerId,
                            parentId,
                            customEventMap,
                            pageinstance: this
                        });
                }
                catch (e) {
                    console.error(e);
                }
            }
        };
    }
}
