var wd = require('../lib/main');
var async = require('async');
var should = require('should');
require('colors');

describe('synchronizing with slow pages', function() {
  this.timeout(10000);

  var urlRoot = 'http://localhost:8000/';
  var browser;

  before(function(done) {
    browser = wd.remote();
    browser.init({
      browserName: 'chrome'
    }, function() {
      // browser.on('status', function(info) {
      //   console.log(info.cyan);
      // });
      // browser.on('command', function(meth, path, data) {
      //   console.log(' > ' + meth.yellow, path.grey, data || '');
      // });
      done();
    });
  });

  beforeEach(function(done) {
    browser.get(urlRoot + 'app/index.html#/async', done);
  });

  after(function() {
    browser.quit();
  });

  it('waits for http calls', function(done) {
    var status, button;
    async.waterfall([
      function(done) {browser.elementByNgBinding('slowHttpStatus', done);},
      function(_status,done) { status = _status;
        browser.elementByCss('[ng-click="slowHttp()"]', done);},
      function(_button, done) { button = _button;
        status.text(done);},
      function(status, done) { status.should.equal('not started');
        button.click(done);},
      function(done) {browser.waitForAngular(done);},
      function(done) {
        status.text(done);},
      function(status, done) {status.should.equal('done');
        done();},
    ], done);
  });

  it('waits for long javascript execution', function(done) {
    var status, button;
    async.waterfall([
      function(done) {browser.elementByNgBinding('slowFunctionStatus', done);},
      function(_status,done) { status = _status;
        browser.elementByCss('[ng-click="slowFunction()"]', done);},
      function(_button, done) { button = _button;
        status.text(done);},
      function(status, done) { status.should.equal('not started');
        button.click(done);},
      function(done) {browser.waitForAngular(done);},
      function(done) {
        status.text(done);},
      function(status, done) {status.should.equal('done');
        done();},
    ], done);
  });

  it('DOES NOT wait for timeout', function(done) {
   var status, button;
    async.waterfall([
      function(done) {browser.elementByNgBinding('slowTimeoutStatus', done);},
      function(_status,done) { status = _status;
        browser.elementByCss('[ng-click="slowTimeout()"]', done);},
      function(_button, done) { button = _button;
        status.text(done);},
      function(status, done) { status.should.equal('not started');
        button.click(done);},
      function(done) {browser.waitForAngular(done);},
      function(done) {
        status.text(done);},
      function(status, done) {status.should.equal('pending...');
        done();},
    ], done);
  });

  it('waits for $timeout', function(done) {
    var status, button;
    async.waterfall([
      function(done) {browser.elementByNgBinding('slowAngularTimeoutStatus', done);},
      function(_status,done) { status = _status;
        browser.elementByCss('[ng-click="slowAngularTimeout()"]', done);},
      function(_button, done) { button = _button;
        status.text(done);},
      function(status, done) { status.should.equal('not started');
        button.click(done);},
      function(done) {browser.waitForAngular(done);},
      function(done) {
        status.text(done);},
      function(status, done) {status.should.equal('done');
        done();},
    ], done);
  });

  it('waits for $timeout then a promise', function(done) {
    var status, button;
    async.waterfall([
      function(done) {browser.elementByNgBinding('slowAngularTimeoutPromiseStatus', done);},
      function(_status,done) { status = _status;
        browser.elementByCss('[ng-click="slowAngularTimeoutPromise()"]', done);},
      function(_button, done) { button = _button;
        status.text(done);},
      function(status, done) { status.should.equal('not started');
        button.click(done);},
      function(done) {browser.waitForAngular(done);},
      function(done) {
        status.text(done);},
      function(status, done) {status.should.equal('done');
        done();},
    ], done);
  });

  it('waits for long http call then a promise', function(done) {
    var status, button;
    async.waterfall([
      function(done) {browser.elementByNgBinding('slowHttpPromiseStatus', done);},
      function(_status,done) { status = _status;
        browser.elementByCss('[ng-click="slowHttpPromise()"]', done);},
      function(_button, done) { button = _button;
        status.text(done);},
      function(status, done) { status.should.equal('not started');
        button.click(done);},
      function(done) {browser.waitForAngular(done);},
      function(done) {
        status.text(done);},
      function(status, done) {status.should.equal('done');
        done();},
    ], done);
  });
});
