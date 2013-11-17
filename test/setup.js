/*global wd:true, initBrowser:true, urlRoot:true, Q:true */

require('mocha-as-promised')();

require('colors');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

wd = require('../lib/main');

Q = wd.Q;

// enables chai assertion chaining
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

var verbose = false;

initBrowser = function() {
  var browser = wd.promiseChainRemote();
  return browser
    .init({
      browserName: 'chrome'
    })
    .then(function() {
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
