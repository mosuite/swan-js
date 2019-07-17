/**
 * @file webpack test config for swan
 * @author xuechao(xuechao02@baidu.com)
 */

const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf.js');

module.exports = merge(
    baseWebpackConfig, {
        module: {
            loaders: [{
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['env'],
                    plugins: [
                        'transform-class-properties',
                        ['transform-object-rest-spread', {
                            useBuiltIns: true
                        }],
                        'transform-decorators-legacy',
                        'transform-object-assign',
                        ['istanbul', {
                            exclude: [
                                'src/utils/**/*.js',
                                'test/**/*.js'
                            ]
                        }]
                    ]
                }
            }]
        }
    }
);