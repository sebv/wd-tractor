#wd-tractor

A port of [protractor](https://github.com/angular/protractor) to the wd driver.

This is an early version so expect a few bugs. 

## Credit

- Thanks to the [Protractor](https://github.com/angular/protractor) team. A lot
of ideas and code have been lifted from there.

## Install

```
npm install wd-tractor
```

You also need to have Selenium runnong, or use Saucelabs.

## Code sample

``` Javascript
/**
 * This assumes that a selenium server is running at localhost:4444.
 */
var wd;
try {
  wd = require('wd-tractor');
} catch(ign) {
  wd = require('../index.js');
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
```

## Api

### wd

wd-tractor extends the wd api.
[wd doc is here](https://github.com/admc/wd/blob/master/doc/jsonwire-mapping.md).

### Extra methods

```
/**
 * Wait until Angular has finished rendering and has
 * no outstanding $http calls before continuing.
 */
waitForAngular(cb) -> cb(err)

/**
 * Addi a mock module 
 */
addMockModule(name, script)

/**
 * Clear all mock modules 
 */
clearMockModules()

/**
 * Original wd get. 
 */
wdGet(url, cb) -> cb(err)

/**
 * Angular Javascript get. Use the `NG_DEFER_BOOTSTRAP!` functionality
 * to enable Angular module mocking. Default get.
 */
ngGet(url, cb) -> cb(err)


/**
 * Methods to lookup element(s) using angular bindings.  
 */
elementByNgBinding(binding, cb) -> cb(err, el)
elementByNgBindingIfExists(binding, cb) -> cb(err, el)
elementByNgBindingOrNull(binding, cb) -> cb(err, el)
elementsByNgBinding(binding, cb) -> cb(err, els)
hasElementByNgBinding(binding, cb) -> cb(err, status)
waitForElementByNgBinding(binding, cb) -> cb(err)
waitForVisibleByNgBinding(binding, cb) -> cb(err)


/**
 * Methods to lookup input bound to ng-model.  
 */
elementByNgInput(model.cb) -> cb(err, el)
elementByNgInputIfExists(model.cb) -> cb(err, el)
elementByNgInputOrNull(model.cb) -> cb(err, el)
hasElementByNgInput(model.cb) -> cb(err, status)
waitForElementByNgInput(model.cb) -> cb(err)
waitForVisibleByNgInput(model.cb) -> cb(err)

/**
 * Methods to lookup select bound to ng-model.  
 */
elementByNgSelect(model.cb) -> cb(err, el)
elementByNgSelectIfExists(model.cb) -> cb(err, el)
elementByNgSelectOrNull(model.cb) -> cb(err, el)
hasElementByNgSelect(model.cb) -> cb(err, status)
waitForElementByNgSelect(model.cb) -> cb(err)
waitForVisibleByNgSelect(model.cb) -> cb(err)

/**
 * Methods to lookup selected options bound to ng-model.  
 */
elementByNgSelectedOption(model.cb) -> cb(err, el)
elementByNgSelectedOptionIfExists(model.cb) -> cb(err, el)
elementByNgSelectedOptionOrNull(model.cb) -> cb(err, el)
hasElementByNgSelectedOption(model.cb) -> cb(err, status)
waitForElementByNgSelectedOption(model.cb) -> cb(err)
waitForVisibleByNgSelectedOption(model.cb) -> cb(err)

/**
 * Methods to lookup specific elements within ng repeaters, identified by a row
 * and a column.
 */
elementByNgRepeater(repeatDescriptor, index, binding, cb) -> cb(err, el)
elementByNgRepeaterIfExists(repeatDescriptor, index, binding, cb) -> cb(err, el)
elementByNgRepeaterOrNull(repeatDescriptor, index, binding, cb) -> cb(err, el)
hasElementByNgRepeater(repeatDescriptor, index, binding, cb) -> cb(err, status)
waitForElementByNgRepeater(repeatDescriptor, index, binding, cb) -> cb(err)
waitForVisibleByNgRepeater(repeatDescriptor, index, binding, cb) -> cb(err)

/**
 * Methods to lookup a row elements within ng repeaters. This returns the div
 * containing the whole row.
 */
elementByNgRepeaterRow(repeatDescriptor, index, cb) -> cb(err, el)
elementByNgRepeaterRowIfExists(repeatDescriptor, index, cb) -> cb(err, el)
elementByNgRepeaterRowOrNull(repeatDescriptor, index, cb) -> cb(err, el)
hasElementByNgRepeaterRow(repeatDescriptor, index, cb) -> cb(err, status)
waitForElementByNgRepeaterRow(repeatDescriptor, index, cb) -> cb(err)
waitForVisibleByNgRepeaterRow(repeatDescriptor, index, cb) -> cb(err)

/**
 * Methods to lookup a column within ng repeaters. This returns alist containing
 * the column elements.
 */
elementsByNgRepeaterColumn(repeatDescriptor, binding, cb) -> cb(err, els)
```

## Todo

- Add debugging functionality.
