/**
 * @file 生成一个唯一标识
 * @author houyu(houyu01@baidu.com)
 */

/**
 * 产生随机的hash码
 *
 * @return {string} 产生的hash码
 */
/* globals msCrypto crypto */
function getRandomValue() {

    let getRandomValues = null;

    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        getRandomValues = crypto.getRandomValues.bind(crypto);
    }
    else if (typeof msCrypto !== 'undefined' && typeof window.msCrypto.getRandomValues === 'function') {
        getRandomValues =  msCrypto.getRandomValues.bind(msCrypto);
    }
    else {
        getRandomValues = () => {
            let rnds = new Array(16);
            let r = 0;
            for (let i = 0; i < 16; i++) {
                if ((i & 0x03) === 0) {
                    r = Math.random() * 0x100000000;
                }

                rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
            }
            return rnds;
        };
    }

    return getRandomValues(new Uint8Array(16));
}

let byteToHex = [];
for (let i = 0; i < 256; ++i) {
    byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf) {
    let i = 0;
    let bth = byteToHex;

    return ([bth[buf[i++]], bth[buf[i++]],
        bth[buf[i++]], bth[buf[i++]], '-',
        bth[buf[i++]], bth[buf[i++]], '-',
        bth[buf[i++]], bth[buf[i++]], '-',
        bth[buf[i++]], bth[buf[i++]], '-',
        bth[buf[i++]], bth[buf[i++]],
        bth[buf[i++]], bth[buf[i++]],
        bth[buf[i++]], bth[buf[i++]]]).join('');
}

export default () => {
    let rnds = getRandomValue();
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;
    return bytesToUuid(rnds);
};
