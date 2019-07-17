/**
 * @file 请求图片或者css等浏览器资源
 *
 * @author houyu(houyu01@baidu.com)
 */

/**
 * 预加载的所有具体加载策略
 */
const prefetchStrategy = {

    image: uri => {
        (new Image()).src = uri;
    }

};

export default {

    load: (type, uris) => {
        uris = [].concat(uris);
        uris.forEach(uri => prefetchStrategy[type](uri));
    }

};
