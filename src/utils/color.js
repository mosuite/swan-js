/**
 * @file 色值转换函数
 * @author qiaolin(qialin@baidu.com)
 */
/**
 * rgb色值转换成十六进制
 * @param  {string} color rgb色值
 * @return {string} 十六进制色值
 */
export const hexColor = color => {
    try {
        if (color.indexOf('#') >= 0) {
            return color;
        }
        const regular = color.match(/\d+/g);
        const res = [];
        regular.map((item, index) => {
            if (index < 3) {
                item = parseInt(item, 10).toString(16);
                item = item.length > 1 ? item : '0' + item;
                res.push(item);
            }
        });
        if (regular.length > 3) {
            if (regular.length > 3) {
                let item = parseFloat(regular.slice(3).join('.'));
                if (+item === 0) {
                    res.unshift('00');
                } else if (item >= 1) {
                    res.unshift('ff');
                } else {
                    item = parseInt(255 * item, 10).toString(16);
                    item = item.length > 1 ? item : '0' + item;
                    res.unshift(item);
                }
            }
        }
        return `#${res.join('')}`;
    } catch (e) {
        return 'ff000000';
    }
    // if (color.indexOf('#') >= 0) {
    //     return color;
    // } else if (!color) {
    //     return '#000000';
    // }

    // try {
    //     const regular = color.match(/\d+/g);
    //     let arr = [];
    //     if (regular.map((item, key) => {
    //         if (key < 3) {
    //             item = parseInt(item, 10).toString(16);
    //             item = item.length > 1 ? item : '0' + item;
    //             arr.push(item);
    //         }
    //     }), regular.length > 3) {
    //         let item = parseFloat(regular.slice(3).join('.'));
    //         if (+item === 0) {
    //             arr.push('00');
    //         } else if (item >= 1) {
    //             arr.push('ff');
    //         } else {
    //             item = parseInt(255 * item, 10).toString(16);
    //             item = item.length > 1 ? item : '0' + item;
    //             arr.push(item);
    //         }
    //     }
    //     return '#' + arr.join('');
    // } catch (e) {
    //     return '#000000';
    // }
};