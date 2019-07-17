/**
 * @file 小程序打印框架级日志
 * @author houyu(houyu01@baidu.com)
 */
import uuid from './uuid';
import {paramSplit, noop} from '../index';
import {getApiWrappers} from '../code-process';

const LOG_ADRESS = 'https://pimlog.baidu.com/mapp/advlog';

// TODO 重试策略
const retry = () => {};

let apiWrappers = [];

/**
 * 获取所有日志需要的依赖（有缓存）
 *
 * @param {Object} [swaninterface] - swan调用API使用的接口
 * @return {Array} - 所有的日志需要的依赖上线文信息
 */
const getLogDependencies = swaninterface => {
    if (apiWrappers.length) {
        return apiWrappers;
    }
    // 获取Promise化的一些接口
    apiWrappers = getApiWrappers(swaninterface.swan, [
        'getSystemInfo',
        'getCommonSysInfo',
        'getNetworkType',
        'getLocation',
        () => swaninterface.boxjs.data.get({name: 'swan-appInfoSync'})
    ]);
    return apiWrappers;
};

export default {

    /**
     * 打印框架级日志
     *
     * @param {Object} [swaninterface] - swan与boxjs的集合
     * @param {Object} [cachedApis] - 缓存的API，防止之后被开发者改掉
     * @param {Object} [params] - 调用的原始swan
     */
    sendFrameWorkLog: (swaninterface, cachedApis, params) => {

        // 此处等待整体重构
        let ENV_VARIABLES = {};
        try {
            ENV_VARIABLES = Object.assign({}, JSON.parse(global._naSwan.getEnvVariables()));
        } catch (e) {
            ENV_VARIABLES.scheme = 'baiduboxapp';
        }


        Promise
            .all(getLogDependencies(swaninterface))
            .then(([systemInfo, commonSysInfo, networkInfo, loc, appInfo]) => {

                const hostInfo = (new RegExp('swan-' + systemInfo.host + '/([\\d\\.]+)'))
                    .exec(navigator.userAgent);
                const hostVersion = hostInfo ? hostInfo[1] : '';

                const [
                    publicParams,
                    privateParams
                ] = paramSplit(params, ['groupId', 'bizId', 'eventName', 'success', 'fail']);

                cachedApis.request({
                    url: LOG_ADRESS,
                    method: 'POST',
                    data: {
                        system: {
                            os: systemInfo.platform,
                            osversion: systemInfo.system,
                            model: systemInfo.model,
                            deviceType: 'phone',
                            sdk: systemInfo.system.replace(/^iOS|Android\s*/, ''),
                            brand: systemInfo.brand,
                            screen: systemInfo.screenWidth + '_' + systemInfo.screenHeight,
                            density: systemInfo.pixelRatio,
                            imei: commonSysInfo.imei || '',
                            idfa: commonSysInfo.idfa || ''
                        },
                        containerAppName: systemInfo.host,
                        scheme: ENV_VARIABLES.scheme,
                        appVersion: hostVersion,
                        uuid: appInfo.cuid,
                        net: networkInfo.networkType,
                        location: {
                            accuracy: loc.accuracy,
                            horizontalAccuracy: loc.horizontalAccuracy,
                            verticalAccuracy: loc.verticalAccuracy,
                            latitude: loc.latitude,
                            longitude: loc.longitude
                        },
                        smartAppId: appInfo.appid,
                        smartAppName: appInfo.appname,
                        smartAppVersion: hostVersion,
                        swanCoreVersion: systemInfo.SDKVersion,
                        swanType: 'swan',
                        groupId: publicParams.groupId,
                        bizId: publicParams.bizId,
                        logid: uuid(),
                        eventName: publicParams.eventName,
                        eventType: '0',
                        timestamp: +new Date,
                        propagation: {
                            source: appInfo.scene,
                            ext: {}
                        },
                        content: privateParams
                    },
                    success: publicParams.success || noop,
                    fail: publicParams.fail || noop
                });
            })
            .catch(function (e) {
                console.log('打印日志时获取信息失败', e);
            });
    }
};
