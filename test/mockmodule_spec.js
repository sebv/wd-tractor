var wd = require('../lib/main');
var async = require('async');
var should = require('should');
require('colors');

describe('mock modules', function() {
  this.timeout(10000);

  // A module to override the 'version' service. This function will be
  // executed in the context of the application under test, so it may
  // not refer to any local variables.
  var mockModuleA = function() {
    var newModule = angular.module('moduleA', []);
    newModule.value('version', '2');
  };

  // A second module overriding the 'version' service.
  // This module shows the use of a string for the load
  // function.
  // TODO(julie): Consider this syntax. Should we allow loading the
  // modules from files? Provide helpers?
  var mockModuleB = "angular.module('moduleB', []).value('version', '3');";

  var urlRoot = 'http://localhost:8000/';
  var browser;

  before(function(done) {
    browser = wd.remote();
    browser.init({
      browserName: 'chrome'
    }, function() {
      browser.on('status', function(info) {
        console.log(info.cyan);
      });
      browser.on('command', function(meth, path, data) {
        console.log(' > ' + meth.yellow, path.grey, data || '');
      });
      done();
    });
  });

  after(function() {
    browser.quit();
  });

  afterEach(function() {
    browser.clearMockModules();
  });

  it('should override services via mock modules', function(done) {
    browser.addMockModule('moduleA', mockModuleA);
    async.waterfall([
      function(done) {browser.get(urlRoot + 'app/index.html', done);},
      function(session, done) {browser.elementByCss('[app-version]', done);},
      function(appVersion, done) {appVersion.text(done);},
      function(appVersion, done) {appVersion.should.equal('2'); done();},
    ], done);
  });

  it('should have the version of the last loaded module', function(done) {
    browser.addMockModule('moduleA', mockModuleA);
    browser.addMockModule('moduleB', mockModuleB);

    async.waterfall([
      function(done) {browser.get(urlRoot + 'app/index.html', done);},
      function(session, done) {browser.elementByCss('[app-version]', done);},
      function(appVersion, done) {appVersion.text(done);},
      function(appVersion, done) {appVersion.should.equal('3'); done();},
    ], done);


  //   expect(ptor.findElement(protractor.By.css('[app-version]')).getText()).
  //       toEqual('3');
  });
});
