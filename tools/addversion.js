var fs = require('fs');
var config = require('../package.json');
var args = process.argv.splice(2);

config.version = config.version.split('.')
    .map((val, index) => {
        if (+args[0] === index) {
            return +val + (+args[1]);
        }
        else if (+args[0] < index) {
            return 0;
        }
        return val;
    }).join('.');
fs.writeFileSync(__dirname + '/../package.json', JSON.stringify(config, null, 4), 'utf-8');
