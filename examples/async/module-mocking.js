/**
 * This assumes that a selenium server is running at localhost:4444.
 */
var wd;
try {
  wd = require('wd-tractor');
} catch(ign) {
  wd = require('../../index.js');
}
var async = require('async');
require('colors');
require('should');

var browser = wd.remote();
browser.on('status', function(info) {
  console.log(info);
});
browser.on('command', function(meth, path, data) {
  console.log(' > ' + meth, path, data || '');
});

var mockModuleA = function() {
  var newModule = angular.module('moduleA', []);
  newModule.value('version', '2');
};

var mockModuleB = "angular.module('moduleB', []).value('version', '3');";

// should find better example this actually does nothing
async.waterfall([
  function(done) { browser.init({browserName: 'chrome'}, done); },

  function(session, done) {
    // adding module A mock before getting the page
    browser.addMockModule('moduleA', mockModuleA);
    browser.get('http://www.angularjs.org', done );
  }, function(done) {
    // clearing mocks
    browser.clearMockModules();
    browser.get('http://www.angularjs.org', done );
  }, function(done) {
    // reading 2  mocks
    browser.addMockModule('moduleA', mockModuleA);
    browser.addMockModule('moduleB', mockModuleB);
    browser.get('http://www.angularjs.org', done );
  }
], function(err) {
  if(err) {throw err;}
  browser.quit();
});

