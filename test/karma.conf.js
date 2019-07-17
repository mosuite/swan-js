/**
 * @file karam config for swan-core
 * @author lvlei(lvlei03@baidu.com)
 */

const webpackConfig = require('../webpack.test.conf.js');
module.exports = function (config) {
    config.set({
        basePath: '..',
        frameworks: ['jasmine'],
        browsers: ['SwanChromeHeadless'],
        captureTimeout: 60000,
        customLaunchers: {
            SwanChromeHeadless: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox']
            }
        },
        port: 9876,
        colors: true,
        autoWatch: false,
        customContextFile: 'test/swan-context.html',
        files: [
            'test/**/*.spec.js'
        ],
        exclude: [
            '**/*.swp'
        ],
        preprocessors: {
            'test/**/*.spec.js': ['webpack']
        },
        client: {
            jasmine: {
                random: false,
                timeoutInterval: 10000
            }
        },
        webpack: webpackConfig,
        webpackMiddleware: {
            stats: 'errors-only'
        },
        reporters: ['coverage', 'html'],
        htmlReporter: {
            outputDir: './test', // where to put the reports 
            reportName: 'report' // report summary filename; browser info by default
        },
        coverageReporter: {
            dir: 'test/coverage',
            reporters: [{
                    type: 'lcov',
                    subdir: '.'
                },
                {
                    type: 'text-summary'
                }
            ]
        },
        singleRun: true,
        concurrency: Infinity
    });
};
