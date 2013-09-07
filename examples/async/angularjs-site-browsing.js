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


async.waterfall([
  function(done) { browser.init({browserName: 'chrome'}, done); },
  function(session, done) { browser.get('http://www.angularjs.org', done );},
  // Displaying your name
  function(done) { browser.elementByNgInput('yourName', done);},
  function(input ,done) { input.type('Bozzo', done); },
  function(done) { browser.elementByNgBinding('{{yourName}}', done );},
  function(name, done) { name.text(done); },
  function(name, done) { name.should.equal('Hello Bozzo!'); done(); },
  // Getting todo list
  function(done) { browser.get('http://www.angularjs.org', done );},
  function(done) {
    browser.elementByNgRepeaterRow('todo in todos', 2, done);
  }, function(todo, done) { todo.text(done); },
  function(todo, done) { todo.should.equal('build an angular app'); done(); },
], function(err) {
  if(err) {throw err;}
  browser.quit();
});
