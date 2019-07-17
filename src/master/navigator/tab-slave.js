/**
 * @file swan's slave set, it is an abstract set for who has more than on tab(slave) on first page
 *       in this page we can use switch tab to switch the current page in the first tab, these pages are slaves
 * @author houyu(houyu01@baidu.com)
 */
import Slave from './slave';
import {STATUS_MAP} from './slave-common-parts';

export default class TabSlave {

    /**
     * TabSlave 构造函数
     *
     * @param {Array} list 在app.json中配置的list
     * @param {number} currentIndex 在app.json中配置的list
     * @param {Object} appConfig 全局的app配置
     */
    constructor({
            list,
            currentIndex = 0,
            appConfig,
            swaninterface = {}
        }) {
        this.list = list;
        this.currentIndex = currentIndex;
        this.slaveQueue = [];
        this.appConfig = appConfig;
        this.swaninterface = swaninterface;
        this.children = this.constructMySlave();
    }

    constructMySlave() {
        return this.list.map(item => {
            const {appConfig, swaninterface} = this;
            return new Slave({
                uri: item.pagePath,
                appConfig,
                swaninterface
            });
        });
    }

    /**
     * 根据uri来判断是否当前slave是某一slave
     *
     * @param {string} uri 判断slave使用的uri
     * @return {boolean} 判断当前slave是否所指定slave
     */
    isTheSlave(uri) {
        return !!this.findChild(uri);
    }

    getSlaveId() {
        return this.getCurrentChildren().getSlaveId();
    }

    seekSlaveQueue(uri) {
        return this.list.filter(item => item.uri === uri);
    }

    findChild(uri) {
        return this.children.filter(child => child.isTheSlave(uri))[0];
    }

    findChildIndex(uri) {
        return this.children.findIndex(child => child.isTheSlave(uri));
    }

    getIndexBySlaveId(slaveId) {
        for (let i = 0, len = this.children.length; i < len; i++) {
            let item = this.children[i];
            if (+item.slaveId === +slaveId) {
                return i;
            }
        }
    }

    getCurrentChildren() {
        return this.children[this.currentIndex];
    }

    init(initParams) {
        return this.getCurrentChildren().init(initParams);
    }

    getUri() {
        return this.getCurrentChildren().getUri();
    }

    getFrontUri() {
        return this.getCurrentChildren().getFrontUri();
    }

    /**
     * 真实slave的代理方法
     *
     * @param {string} methodName 方法名
     * @param {Object} options 调用私有方法的选项
     * @param {...*} args 传递给page对象的方法
     * @return {Array} 私有方法的return值
     */
    callPrivatePageMethod(methodName, options = {}, ...args) {
        return this.children.map(child => child.callPrivatePageMethod(methodName, options, ...args));
    }

    reLaunch(paramsObj) {
        this.setToIndex(paramsObj.url);
        this.children = this.constructMySlave();
        return this.findChild(paramsObj.url).reLaunch(paramsObj);
    }

    setToIndex(uri) {
        this.setCurrentIndex(this.findChildIndex(uri));
        return this.currentIndex;
    }

    setCurrentIndex(index) {
        this.currentIndex = index;
    }

    switchTab(paramsObj) {
        return this.swaninterface.invoke('switchTab', paramsObj);
    }

    onswitchTab({fromId, toId, toPage, toTabIndex}) {
        // 解决多个tab配置同一个页面case。先通过slaveId找，没找到则通过tab下标找
        let toChild = this.findChild(toId);
        let webviewIndex;
        if (!toChild) {
            // 开发者工具暂时没传toTabIndex，走老逻辑通过url找页面
            if (toTabIndex === undefined) {
                toChild = this.findChild(toPage);
                webviewIndex = this.setToIndex(toPage);
            }
            else {
                toChild = this.children[toTabIndex];
                webviewIndex = toTabIndex;
            }

        }
        else {
            webviewIndex = this.getIndexBySlaveId(toId);
        }
        this.setCurrentIndex(webviewIndex);

        // 触发被切换到的slave的onEnqueue
        return toChild.setSlaveId(toId).onEnqueue()
            .then(() => {
                const text = this.list[webviewIndex].text || '';
                toChild.onswitchTab({
                    webviewIndex,
                    text
                });
                return {
                    wvID: toId,
                    tabIndexPage: toTabIndex + toPage,
                    type: 'onTabItemTap'
                };
            });
    }

    redirect(paramsObj) {
        return this.getCurrentChildren().redirect(paramsObj);
    }

    open(paramsObj) {
        this.status = STATUS_MAP.CREATING;
        return this.getCurrentChildren().open(paramsObj)
            .then(res => {
                this.status = STATUS_MAP.CREATED;
                return res;
            });
    }

    close() {
        this.children.forEach(child => child.close());
        this.status = STATUS_MAP.CLOSED;
    }
    
    onEnqueue(params) {
        return this.getCurrentChildren().onEnqueue(params);
    }
}
