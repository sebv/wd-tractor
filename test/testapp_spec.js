/* global describe, it, before, beforeEach */

var wd = require('../lib/main');
//var util = require('util');
var async = require('async');
var should = require('should');

function elemTextShouldEqual(browser, elem, text, done) {
  browser.text(elem, function(err, elemText) {
    elemText.should.equal(text);
    done(null);
  });
}

describe('longer example', function() {
  this.timeout(5000);
  var urlRoot = 'http://localhost:8000/';
  var browser;

  before(function(done) {
    browser = wd.remote();

    async.series([
      function(done) {
        browser.init({
          browserName: 'chrome'
        }, done);
      },
      function(done) {
        browser.setAsyncScriptTimeout(10000, done);
      }
    ], done);
  });

  describe('synchronizing with Angular', function() {
    beforeEach(function(done) {
      browser.get(urlRoot + 'app/index.html', done);
    });

    it('should wait for slow RPCs', function(done) {
      async.series([
        function(done) {browser.elementById('sample1', done);},
        function(done) {browser.elementById('sample2', done);},
        function(done) {browser.elementById('fetch', done);}
      ], function(err, res) {
        if(err) {return done(err);}
        var sample1Button = res[0];
        var sample2Button = res[1];
        var fetchButton = res[2];
        async.series([
          function(done) { browser.clickElement(fetchButton, done); },
          // The quick RPC works fine.

          function(done) {browser.elementByNgBinding('{{status}}', function(err, elem) {
            elemTextShouldEqual(browser, elem, '200', done);
          });},
          function(done) {browser.elementByNgBinding('data', function(err, elem) {
            elemTextShouldEqual(browser, elem, 'done', done);
          });},
          function(done) {browser.clickElement(sample2Button, done);},
          function(done) {browser.clickElement(fetchButton, done);},
          function(done) {browser.elementById('statuscode', function(err, elem) {
            elemTextShouldEqual(browser, elem, '200', done);
          });},
          function(done) {browser.elementById('data', function(err, elem) {
            elemTextShouldEqual(browser, elem, 'finally done', done);
          });}
        ], done);

      }, done);
    });

    // describe('slow rendering', function() {
    //   beforeEach(function(done) {
    //     browser.get(urlRoot + 'app/index.html#/repeater', done);
    //   });

    //   it('should synchronize with a slow action', function(done) {
    //     var addOneButton;
    //     async.waterfall([
    //       function(done) {browser.elementById('addone', done);},
    //       function(_addOneButton, done) {
    //         addOneButton = _addOneButton;
    //         browser.click(addOneButton, done);
    //       },
    //     ]);
    //     browser.elementById('addone', function(err, addOneButton) {
    //       if(err) {return done(err);}
    //       async.series([
    //         function(done) {browser.click(addOneButton, done);},
    //       ], done);
    //     });
    //     // var topNumber = ptor.findElement(
    //     //     protractor.By.repeater('foo in foos').row(1).
    //     //     column('{{foo.b}}'));

    //     // expect(topNumber.getText()).toEqual('14930352');

    //     // addOneButton.click();

    //     // topNumber = ptor.findElement(
    //     //     protractor.By.repeater('foo in foos').row(1).
    //     //     column('{{foo.b}}'));

    //     // expect(topNumber.getText()).toEqual('24157817');
    //   });
    // });


  });

});
