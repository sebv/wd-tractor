/**
 * This assumes that a selenium server is running at localhost:4444.
 *
 * npm install chai chai-as-promised colors
 */

var wd;
try {
  wd = require('wd-tractor');
} catch(ign) {
  wd = require('../../index.js');
}

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

require('colors');
var browser = wd.promiseRemote();
browser.on('status', function(info) {
  console.log(info);
});
browser.on('command', function(meth, path, data) {
  console.log(' > ' + meth, path, data || '');
});

var Module = wd.Module;

var mockModuleA = new Module( function() {
  var newModule = angular.module('moduleA', []);
  newModule.value('version', '2');
});

var mockModuleB = new Module( "angular.module('moduleB', []).value('version', '3');");

// should find better example this actually does nothing
browser
  .init({browserName: 'chrome'})
  .addMockModule('moduleA', mockModuleA)
  .get('http://www.angularjs.org')
  // do something
  .clearMockModules()
  .addMockModule('moduleA', mockModuleA)
  .addMockModule('moduleB', mockModuleB)
  .get('http://www.angularjs.org')
  // do something
  .quit()
  .done();
