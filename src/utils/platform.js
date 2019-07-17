/**
 * @file 与环境、系统相关的工具函数
 * @author berg
 */


/**
 * 判断是否 iOS 平台
 * @return {boolean} 是否在 iOS 平台
 */
export const isIOS = () => {
    return /(iPhone|iPod|iPad)/.test(window.navigator.userAgent);
};

/**
 * 设置当前环境的基本路径
 *
 * @param {string} basePath - 设置当前环境的基本加载路径
 */
export const setPageBasePath = basePath => {
    const baseElement = document.createElement('base');
    baseElement.setAttribute('href', basePath);
    document.head.appendChild(baseElement);
};
