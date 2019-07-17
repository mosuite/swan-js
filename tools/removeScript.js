var fs = require('fs');

var packageJson = require('./package.json');

packageJson.scripts = {};

fs.writeFileSync(__dirname + '/package.json', JSON.stringify(packageJson, null, 4), 'utf-8');
