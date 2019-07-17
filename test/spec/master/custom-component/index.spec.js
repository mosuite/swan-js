/**
 * @file swan-core test for custom component
 * @author yangyang(yangyang55@baidu.com)
 */

import VirtualComponentFactory from '../../../../src/master/custom-component/index.js';
import {
    swaninterface
} from '../../../mock/swan-api';
import {noop} from '../../../../src/utils/index.js';
import {catchTips} from '../../../utils';

VirtualComponentFactory.prototype.privateMethod = {};
let virtualComponentFactory = new VirtualComponentFactory(swaninterface);
let pageInstance = {
    sendDataOperation: noop,
    sendMessageToCurSlave: noop
};
pageInstance.privateMethod = virtualComponentFactory.getCustomComponentMethods.call(virtualComponentFactory);

pageInstance.privateProperties = {};
let myBehavior = null;
let Component = virtualComponentFactory
    .defineVirtualComponent.bind(virtualComponentFactory);

let Behavior = virtualComponentFactory
    .defineBehavior.bind(virtualComponentFactory);

let lifetimesArr = [];
describe("custom-compopnents test", function () {
    it("custom-compopnents created", done => {
        expect(typeof virtualComponentFactory).toBe('object');
        done();
    });

    it('custom-components Instance', done => {
        window.__swanRoute = 'components/custom/custom';
        window.usingComponents = [];
        Component({
            options: {
                // addGlobalClass: true
            },
            // externalClasses: ['excla'],
            properties: {
                time: {
                    type: null,
                    value: 1,
                    observer: function observer(newVal, oldVal) {}
                }
            },
            data: {
                red: 'red'
            },
            lifetimes: {
                created: function created() {},

                attached: function attached() {},
                ready: function ready() {},

                detached: function detached() {}
            },
            pageLifetimes: {
                show: function show() {},
                hide: function hide() {}
            },
            methods: {
                onTap: function onTap() {}
            }
        });
        let virtualClassInfo = virtualComponentFactory.virtualClassInfo;
        expect(typeof virtualClassInfo).toBe('object');
        expect(Object.keys(virtualClassInfo)[0]).toBe('components/custom/custom');
        done();
    });

    it('Component getCustomComponentsData', done => {
        window.__swanRoute = 'components/ant/ant';
        Component({
            data: {
                red: 'red',
                num: 2,
                date: new Date(),
                neicusval: '222',
                person: {name: 'Lebron James', pos: 'SF', age: 33}
            },
            lifetimes: {
                created: function created() {
                    lifetimesArr.push('created');
                },
        
                attached: function attached() {
                    this.dispatch('parentChildmessage', {
                        name: 'swan'
                    });
                    lifetimesArr.push('attached');

                },
                ready: function ready() {
                    lifetimesArr.push('ready');
                },
        
                detached: function detached() {
                }
            },
            pageLifetimes: {
                show: function show() {

                    // 组件所在的页面被展示时触发
                },
                hide: function hide() {

                    // 组件所在的页面被隐藏时触发
                }
            },
            methods: {
            }
        });
        window.__swanRoute = 'components/cl-item/cl-item';
        window.usingComponents = ['components/ant/ant'];
        Component({
            options: {
                addGlobalClass: true
            },
            behaviors: [],
            externalClasses: ['excla'],
            properties: {
                time: { // 属性名
                    type: null, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
                    value: 1, // 属性初始值（必填）
                    observer: function observer(newVal, oldVal) {
                        // 属性被改变时执行的函数（可选）
                    }
                }
            },
            export() {
                return {
                    componentField: 'componentValue'
                };
            },
            data: {
                red: 'red',
                num: 2,
                date: new Date(),
                neicusval: '222',
                person: {name: 'Lebron James', pos: 'SF', age: 33}
            },
            lifetimes: {
                created: function created() {
                    lifetimesArr.push('created');
                },
        
                attached: function attached() {
                    this.dispatch('childmessage', {
                        name: 'swan'
                    });
                    lifetimesArr.push('attached');

                },
                ready: function ready() {
                    lifetimesArr.push('ready');

                },
        
                detached: function detached() {
                }
            },
            pageLifetimes: {
                show: function show() {

                    // 组件所在的页面被展示时触发
                },
                hide: function hide() {

                    // 组件所在的页面被隐藏时触发
                }
            },
            methods: {
                onTap: function onTap(e) {
                    this.triggerEvent('myevent', {
                        xx: 'xxx'
                    });
                },

                cc: function cc() {
                    x[0].setData({
                        xx: 3
                    });
                    this.setData({
                        neicusval: 333
                    });
                }
            }
        });
        let myBehavior2 = Behavior({
            data: {
                myBehavior2Data: 0
            },
            definitionFilter(defFields) {
                defFields.data.from = 'behavior';
            },
            methods: {
                myBehavior2Method: function () {
                    this.setData({
                        myBehavior2Data: 1
                    });
                }
            }
        });
        let myBehavior1 = Behavior({
            behaviors: [myBehavior2],
            properties: {
                myBehaviorProperty: {
                    type: String,
                    value: 'behavior'
                }
            },
            data: {
                myBehaviorData: {
                    myBehaviorData: 0
                }
            },
            pageLifetimes: {
                show: function show() {
                    this.setData({
                        show: 3
                    });
                },
                hide: function hide() {
                    this.setData({
                        hide: 3
                    });
                }
            },
            methods: {
                myBehaviorMethod: function () {}
            },
            lifetimes: {
                attached: function attached() {
                    this.setData({
                        attached: 1
                    });
                    this.setData('myBehaviorData', {
                        myBehaviorData: 1
                    });
                    lifetimesArr.push('attached');
                },
            },
        });
        myBehavior = Behavior({
            behaviors: [myBehavior1],
            properties: {
                myBehaviorProperty: {
                    type: String,
                    value: 'behavior'
                }
            },
            data: {
                myBehaviorData: {}
            },
            methods: {
                myBehaviorMethod: function () {}
            }
        });
        window.__swanRoute = 'components/custom/custom';
        window.usingComponents = ['components/cl-item/cl-item'];
        Component({
            options: {
                addGlobalClass: true
            },
            behaviors: [myBehavior, 'swan://form-field', 'swan://component-export'],
            externalClasses: ['excla'],
            export() {
                return {
                    componentField: 'componentValue'
                };
            },
            properties: {
                swaninfo: {
                    type: Object,
                    value: {},
                    observer: function (newVal, oldVal) {}
                },
                monkey: {
                    type: null,
                    value: 1,
                    observer: function observer(newVal, oldVal) {
                        this.setData({
                            monkeyObserverData: 1
                        });
                    }
                },
                pig: {
                    type: null,
                    value: 1,
                    observer: 'setPigObserverData'
                }
            },
            messages: {
                childmessage: function (e) {
                    this.setData({
                        dispatchData: 1
                    });
                },
                parentChildmessage: function (e) {
                    this.setData({
                        parentDispatchData: 1
                    });
                }
            },
            data: {
                data: 0,
                created: 0,
                attached: 0,
                ready: 0,
                show: 0,
                hide: 0,
                methodData: 0,
                dispatchData: 0,
                parentDispatchData: 0,
                monkeyObserverData: 0,
                pigObserverData: 0
            },
            lifetimes: {
                created() {
                    this.setData({
                        created: 1
                    });
                    lifetimesArr.push('created');
                },

                ready: function ready() {
                    this.setData({
                        ready: 1
                    });
                    lifetimesArr.push('ready');

                },
                detached: function detached() {
                    this.setData({
                        detached: 1
                    });
                }
            },
            pageLifetimes: {
                show: function show() {
                    this.setData({
                        show: 1
                    });
                },
                hide: function hide() {
                    this.setData({
                        hide: 1
                    });
                }
            },
            methods: {
                setPigObserverData: function () {
                    this.setData({
                        pigObserverData: 1
                    });
                },
                onTap: function onTap() {
                    this.triggerEvent('myevent', {});
                    this.setData({
                        methodData: 1
                    });
                }
            }
        });
        window.__swanRoute = 'pages/custest/custest';
        window.usingComponents = ['components/custom/custom'];
        let data = pageInstance.privateMethod.getCustomComponentsData.call(pageInstance, ['components/custom/custom']);
        expect(typeof data).toBe('object');
        expect(data['components/custom/custom'].data).toBe(0);
        expect(data['components/custom/custom'].created).toBe(0);
        expect(data['components/custom/custom'].attached).toBe(0);
        expect(data['components/custom/custom'].ready).toBe(0);
        expect(data['components/custom/custom'].show).toBe(0);
        expect(data['components/custom/custom'].hide).toBe(0);
        expect(data['components/custom/custom'].methodData).toBe(0);
        catchTips();
        try {
            pageInstance.privateMethod.getCustomComponentsData.call(pageInstance, ['components/custom/custom3']);
        }
        catch (e) {
            console.log(e);
        }
        done();
        // onShow 现在有bug

    });
    it('Component registerCustomComponents', done => {
        pageInstance.privateMethod.registerCustomComponents.call(pageInstance,
            [
                {
                    componentName: 'ant',
                    componentPath: 'components/ant/ant',
                    nodeId: '_eb88',
                    id: '_eb88',
                    is: 'components/ant/ant',
                    dataset: {
                        data: 0
                    },
                    className: '',
                    data: {
                        id: '_eb88',
                        data: 0,
                        created: 0,
                        attached: 0,
                        ready: 0,
                        show: 0,
                        hide: 0,
                        methodData: 0,
                        swaninfo: {}
                    },
                    parentId: '',
                    ownerId: '_eb87',
                    customEventMap: {}
                }, {
                    componentName: 'cl-item',
                    componentPath: 'components/cl-item/cl-item',
                    nodeId: '_eb87',
                    id: '_eb87',
                    is: 'components/cl-item/cl-item',
                    dataset: {
                        data: 0
                    },
                    className: 'custom__xxxx',
                    data: {
                        id: '_eb87',
                        data: 0,
                        created: 0,
                        attached: 0,
                        ready: 0,
                        show: 0,
                        hide: 0,
                        methodData: 0,
                        swaninfo: {}
                    },
                    parentId: '_eb86',
                    ownerId: '_eb86',
                    customEventMap: {}
                }, {
                    componentName: 'custom',
                    componentPath: 'components/custom/custom',
                    nodeId: '_eb86',
                    id: '_eb86',
                    is: 'components/custom/custom',
                    dataset: {
                        data: 0
                    },
                    className: '',
                    data: {
                        id: '_eb86',
                        data: 0,
                        created: 0,
                        attached: 0,
                        ready: 0,
                        show: 0,
                        hide: 0,
                        methodData: 0,
                        swaninfo: {}
                    },
                    ownerId: '',
                    customEventMap: {}
                }]
        );
        let customComponents = pageInstance.privateProperties.customComponents;
        expect(typeof customComponents).toBe('object');
        let customComponent = customComponents._eb86;
        let componentName = customComponent.componentName;
        expect(componentName).toEqual('custom');
        expect(customComponent.hasBehavior(myBehavior)).toEqual(true);
        let groupSetDataData = 0;
        customComponent.groupSetData(function () {
            groupSetDataData = 1;
        });
        expect(groupSetDataData).toBe(1);

        done();
    });
    it('Component lifeCycle&behavior', done => {
        let customComponents = pageInstance.privateProperties.customComponents;
        let customComponent = customComponents._eb86;
        setTimeout(() => {
            let data = customComponent.data;
            let opt = customComponent.data;
            expect(data.created).toEqual(1);
            expect(data.attached).toEqual(1);
            expect(data.ready).toEqual(1);
            expect(typeof data.myBehaviorData).toBe('object');
            expect(lifetimesArr).toEqual(['created', 'created', 'created', 'attached', 'attached', 'attached', 'ready', 'ready', 'ready'])
            done();
        }, 0);
    });
    it('Component dispatch&event', done => {
        let customComponents = pageInstance.privateProperties.customComponents;
        let customComponent = customComponents._eb86;
        let data = customComponent.data;
        expect(data.dispatchData).toBe(1);
        expect(data.parentDispatchData).toBe(1);
        customComponent.onTap();

        expect(data.methodData).toBe(1);
        done();
    });

    it('ComponentcreateSelectorQuery&createIntersectionObserver&selectComponent', done => {
        let customComponents = pageInstance.privateProperties.customComponents;
        let customComponent = customComponents._eb86;
        expect(typeof customComponent.createSelectorQuery()).toBe('object');
        expect(typeof customComponent.createIntersectionObserver()).toBe('object');
        let getComponentsFromList = pageInstance.privateMethod.getComponentsFromList;
        pageInstance.privateMethod.getComponentsFromList = () => {
            return [{}];
        };
        expect(Object.keys(customComponent.selectComponent('.xxxx')).length).toBe(0);
        pageInstance.privateMethod.getComponentsFromList = () => {
            return [{
                behaviors: ['swan://component-export'],
                export: () => 1
            }
            ];
        };
        expect(customComponent.selectComponent('.xxxx')).toBe(1);
        let customComponent2 = customComponents._eb87;
        customComponent2.callMethod('onTap');
        pageInstance.privateMethod.getComponentsFromList = getComponentsFromList;
        done();
    });
    it('Component props', done => {
        let customComponents = pageInstance.privateProperties.customComponents;
        let customComponent = customComponents._eb86;
        expect(typeof customComponent.properties).toBe('object');
        pageInstance.privateMethod.customComponentEvent.call(pageInstance, {
            type: 'customComponent:_propsChange',
            nodeId: '_eb86',
            raw: {
                key: 'monkey',
                value: 2
            }
        });
        pageInstance.privateMethod.customComponentEvent.call(pageInstance, {
            type: 'customComponent:_propsChange',
            nodeId: '_eb86',
            raw: {
                key: 'pig',
                value: 2
            }
        });
        setTimeout(() => {
            let data = customComponent.data;
            expect(data.monkeyObserverData).toBe(1);
            expect(data.pigObserverData).toBe(1);
            done();
        }, 0);

    });
    it('detached', done => {
        let customComponents = pageInstance.privateProperties.customComponents;
        let customComponent = customComponents._eb86;
        pageInstance.privateMethod.customComponentEvent.call(pageInstance, {
            type: 'customComponent:detached',
            nodeId: '_eb86'
        });
        let data = customComponent.data;
        expect(data.detached).toEqual(1);
        done();
    });
});
