/**
 * @file 分享相关的抽象
 * @author houyu(houyu01@baidu.com)
 *          jianglian(jianglian@baidu.com)
 */
import {getAppInfo} from './index';

export class Share {
    static shareDefaultConfig = {
        content: '世界很复杂，百度更懂你',
        path: null,
        success() {},
        fail() {},
        complete() {}
    }
    constructor(swaninterface, appid, pageObj, initPath, shareConfig) {
        this.appid = appid;
        this.pageObj = pageObj;
        this.swaninterface = swaninterface;
        this.shareConfig = this.mergeShareConfig(shareConfig, {path: initPath});
    }
    getAppNameAndDes(attribute) {
        const attrValue = typeof global.__swanAppInfo === 'object'
            ? global.__swanAppInfo[attribute]
            : getAppInfo(this.swaninterface)[attribute];
        return attrValue;
    }
    mergeShareConfig(config, options) {
        const title = this.getAppNameAndDes('appname');
        const content = this.getAppNameAndDes('appDesc');
        if (!!content) {
            config = config || {...Share.shareDefaultConfig, ...{title}, ...{content}};
        } else {
            config = config || {...Share.shareDefaultConfig, ...{title}};
        }
        return {...config, ...options};
    }

    getShareParams({from = 'menu', target = null, webViewUrl}) {
        let shareConfig = this.shareConfig;
        if (this.pageObj.onShareAppMessage) {
            let data = {from};
            target && (data.target = target);
            webViewUrl && (data.webViewUrl = webViewUrl);
            const userShareParams = this.pageObj.onShareAppMessage(data);

            if (typeof userShareParams === 'object') {
                shareConfig = {...this.shareConfig, ...userShareParams};
            }
        }
        return shareConfig;
    }
    shareAction({from, target, webViewUrl}) {
        const shareParams = this.getShareParams({from, target, webViewUrl});
        return new Promise((resolve, reject) => {
            global.swan.openShare({
                ...shareParams,
                success(res) {
                    shareParams.success(res);
                    resolve(res);
                },
                fail(err) {
                    shareParams.fail(err);
                    reject(err);
                }
            });
        });
    }
}
