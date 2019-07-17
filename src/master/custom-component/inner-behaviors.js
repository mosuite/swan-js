/**
 * @file 自定义组件内置behaviors处理
 * @author lvlei(lvlei03@baidu.com)
 */

const innerBehaviorsMap = {

    /**
     * 内置属性swan://form-field处理
     *
     * @param {Object} selectRes - 选择的组件实例
     */
    swanFormField(initialInstance) {
        const hasTheBehavior = initialInstance.behaviors
            .some(behavior => /\s*swan:\/\/form-field\s*/.test(behavior));
        if (!hasTheBehavior) {
            return;
        }
        initialInstance.pageinstance
            .sendMessageToCurSlave({
                type: 'customComponentInnerBehavior',
                nodeId: initialInstance.nodeId,
                extraMessage: {
                    eventType: 'insertFormField'
                }
            });
    },

    /**
     * 内置属性swan://component-export处理
     *
     * @param {Object} initialInstance - 选择的组件实例
     */
    swanComponentExport(initialInstance) {
        if (initialInstance && initialInstance.behaviors) {
            const hasTheBehavior = initialInstance.behaviors
                .some(behavior => /\s*swan:\/\/component-export\s*/.test(behavior));
            if (hasTheBehavior && initialInstance.export) {
                return {
                    isBuiltInBehavior: true,
                    resData: initialInstance.export()
                };
            }
        }
        return {};
    }
}

export const builtInBehaviorsAction = (behavior, ...args) => {
    return innerBehaviorsMap[behavior](...args);
};
