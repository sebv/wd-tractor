var wd = require('wd');
var WdTractor = require('./wd_tractor')(wd);

wd.setBaseClasses(WdTractor.Webdriver, WdTractor.Element);

wd.Module = function(code) {
  this.code = code;
};

module.exports = wd;
