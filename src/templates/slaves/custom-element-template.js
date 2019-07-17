/**
 * @file swan中自定义组件的模板，自定义组件被编译为js，使用改模板作为原型
 * @author houyu(houyu01@baidu.com)
 */

const #uniqueCustomComponentName# = ((global, componentFragments) => {
    const templateComponents = {};
    const usingComponentMap = JSON.parse(`#usingComponentMap#`);

    "#swanCustomComponentTemplates#";

    // filter 模块名以及对应的方法名集合
    const filterCustomArr = JSON.parse('<%-filters%>');

    // 闭包封装filter模块
    <%-modules-%>

    let modules = {};
    let filtersObj = {};
    filterCustomArr && filterCustomArr.forEach(element => {
        modules[element.module] = eval(element.module);

        let func = element.func;
        let module = element.module;
        filtersObj[element.filterName] = (...args) => {
            return modules[module][func](...args);
        };
    });

    const components = {...componentFragments, ...templateComponents};
    global.componentFactory.componentDefine(
        '<%-customComponentPath%>',
        Object.assign({}, componentFactory.getProtos('super-custom-component'), {
            template: `<swan-<%-customComponentName%>><%-customComponentTemplate%></swan-<%-customComponentName%>>`,
            componentPath: '<%-customComponentPath%>',
            componentName: '<%-customComponentName%>',
            customComponentCss: `<%-customComponentCss%>`
        }),
        {
            classProperties: {
                components,
                filters: {
                    ...filtersObj
                }
            }
        }
    );

    Promise.resolve().then(() => {
        for (let customName in usingComponentMap) {
            components[customName] = customAbsolutePathMap[usingComponentMap[customName]];
        }
    });
    return global.componentFactory.getComponents('<%-customComponentPath%>');
})(global, componentFragments);
