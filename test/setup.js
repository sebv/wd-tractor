/*global wd:true, initBrowser:true, urlRoot:true, Q:true */

require("mocha-as-promised")();
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
chai.should();

wd = require('../lib/main');
var verbose = false;

initBrowser = function() {
  var browser = wd.promiseRemote();
  return browser.init({
    browserName: 'chrome'
  }).then(function() {
    Q = browser.Q;
    if(verbose) {
      browser._debugPromise();
      browser.on('status', function(info) {
        console.log(info);
      });
      browser.on('command', function(meth, path, data) {
        console.log(' > ' + meth, path, data || '');
      });
    }
  });
};

urlRoot = 'http://localhost:8000/';
