/**
 * @file swan's slave '.swan' file compiled runtime js
 * @author houyu(houyu01@baidu.com)
 */
((global, san) => {
    global.errorMsg = [];

    // 自定义模板区域
    <%-swanCustomComponentsCodeJson%>
    const templateComponents = Object.assign({}, <%-swanCustomComponentsMapJson%>);

    let param = {};
    const filterArr = JSON.parse('<%-filter%>');
    <%-modules%>

    function processTemplateModule(filterTemplateArrs, filterModule) {
        eval(filterModule);
        let modules = {};
        let templateFiltersObj = {};
        filterTemplateArrs && filterTemplateArrs.forEach(element => {
            let {filterName, func, module} = element;
            modules[module] = eval(module);
            templateFiltersObj[filterName] = (...args) => modules[module][func](...args);
        });
        return templateFiltersObj;
    }

    try {

        filterArr && filterArr.forEach(item => {
            param[item.module] = eval(item.module);
        });

        const pageContent = `<%-swanContent%>`;

        // 新的渲染逻辑
        const renderPage = (filters, modules) => {
            const componentFactory = global.componentFactory;
            // 获取所有内置组件 + 自定义组件的fragment
            const componentFragments = componentFactory.getAllComponents();

            // 所有的自定义组件
            "#swanCustomComponentsDefine#";

            // 路径与该组件映射
            var customAbsolutePathMap = "#customAbsolutePathMap#";

            // 当前页面使用的自定义组件
            const pageUsingComponentMap = JSON.parse(`#pageUsingComponenttMap#`);

            // 生成该页面引用的自定义组件
            const customComponents = Object.keys(pageUsingComponentMap).reduce((customComponents, customName) => {
                customComponents[customName] = customAbsolutePathMap[pageUsingComponentMap[customName]];
                return customComponents;
            }, {});

            // 启动页面渲染逻辑
            global.pageRender(pageContent, templateComponents, customComponents, filters, modules);
        };

        // 兼容旧的swan-core
        const oldPatch = PageComponent => {
            Object.assign(PageComponent.components, <%-swanCustomComponentsMapJson%>);
            // 渲染整个页面的顶层组件，template会在编译时被替换为用户的swan模板
            class Index extends PageComponent {
                constructor(options) {
                    super(options);
                    this.components = PageComponent.components;
                }
                static template = `<swan-wrapper tabindex="-1">${pageContent}</swan-wrapper>`;
            }
            // 初始化页面对象
            const index = new Index();
            // 调用页面对象的加载完成通知
            index.slaveLoaded();
            // 监听等待initData，进行渲染
            index.communicator.onMessage('initData', params => {
                // 根据master传递的data，设定初始数据，并进行渲染
                index.setInitData(params);
                // 真正的页面渲染，发生在initData之后
                index.attach(document.body);
            }, {listenPreviousEvent: true});
        };

        if (global.pageRender) {
            renderPage(filterArr, param);
        }
        else {
            oldPatch(window.PageComponent);
        }
    }
    catch (e) {
        global.errorMsg['execError'] = e;
        throw e;
    }
})(window, window.san);
