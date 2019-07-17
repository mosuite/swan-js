/**
 * @file 自定义组件相关工具方法
 * @author lvlei(lvlei03@baidu.com)
 */

// 自定义组件中的properites类型默认值映射
const propDefaultValMap = {
    String: '',
    Number: 0,
    Boolean: false,
    Object: null,
    Array: [],
    null: null
};

/**
 * 根据properites中的property类型获取该类行默认的值
 *
 * @param {*} propertyType - type类型
 * @return {*} property默认值
 */
const getDefaultVal = propertyType => {
    return Object.keys(propDefaultValMap)
        .filter(type => new RegExp(type).test(propertyType + ''))
        .map(type => propDefaultValMap[type])[0];
};

/**
 * 对自定义组件properites进行处理, 包括根据类型进行初始化数据
 *
 * @param {*} propertyVal - 该property的value, 可能是一个obj, 也可能是一个直接数据类型
 * @return {*} 处理之后的值
 */
export const getPropertyVal = propertyVal => {
    return Object.prototype.toString.call(propertyVal) === '[object Object]'
        ? propertyVal.value || getDefaultVal(propertyVal.type)
        : getDefaultVal(propertyVal);
};