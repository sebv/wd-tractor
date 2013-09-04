var WdTractor = require('./wd_tractor');
var wd = require('wd');

wd.factory.WebDriver = WdTractor;

module.exports = wd;
