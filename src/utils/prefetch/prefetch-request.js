/**
 * @file 对于请求的prefetch机制
 *
 * @author houyu(houyu01@baidu.com)
 */
import {getAppInfo, processParam} from '../index';

let prefetchTaskList = {};

const linkResolve = (link, params) => {
    for (let key in params) {
        link = link.replace('${' + key + '}', params[key]);
    }
    return link;
};

export default {

    init(prefetchConfig, swaninterface) {

        if (Object.prototype.toString.call(prefetchConfig) === '[object Array]') {

            prefetchConfig.forEach(link => {

                // 这块需要重构，获取参数在life-cycle中有
                let appInfo = getAppInfo(swaninterface);

                // 这块也需要重构，改引用的方法需要变成函数式
                processParam(appInfo);

                // 处理后的link
                let processedLink = linkResolve(link, appInfo.query);

                prefetchTaskList[processedLink] = new Promise((resolve, reject) => {
                    return swaninterface.swan.request({
                        url: processedLink,
                        success: resolve,
                        fail: reject
                    });
                });
            });

            swaninterface.swan.request = this.wrapRequest(swaninterface.swan.request);
        }
    },

    wrapRequest(originRequest) {
        return params => {
            if (params.usePrefetchCache) {
                if (prefetchTaskList[params.url]) {
                    prefetchTaskList[params.url]
                        .then((...args) => {
                            params.success && params.success(...args);
                            params.complete && params.complete(...args);
                        })
                        .catch((...args) => {
                            params.fail && params.fail(...args);
                            params.complete && params.complete(...args);
                        });
                    return true;
                }
                console.error(`配置错误：${params.url} 没有在配置项中，无法取缓存`);
                return originRequest.call(this, params);
            }
            return originRequest.call(this, params);
        };
    }
};
