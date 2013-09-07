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


browser
  .init({browserName: 'chrome'})
  .get('http://www.angularjs.org')
  .elementByNgInput('yourName').type('Bozzo')
  .elementByNgBinding('{{yourName}}')
    .text().should.become('Hello Bozzo!')
  .get('http://www.angularjs.org')
  .elementByNgRepeaterRow('todo in todos', 2)
    .text().should.become('build an angular app')
  .quit()
  .done();

