/* global angular */

var wd = require('wd');
var url = require('url');
var inherits = require('util').inherits;
var _ = require('lodash');
var async = require('async');
var Wd = wd.webdriver;

var utils = require('./utils');
var clientSideScripts = require('./client_side_scripts');

var DEFER_LABEL = 'NG_DEFER_BOOTSTRAP!';

var WdTractor =  module.exports = function(/*configUrl, _element*/){
  var args = Array.prototype.slice.call(arguments);
  Wd.apply(this, args);

  //this.rootEl = opt_rootElement || 'body';
  //this.baseUrl = opt_baseUrl || '';
  this.baseUrl = '';
  this.rootEl = 'body';
  this.moduleNames_ = [];
  this.moduleScripts_ = [];
};

inherits(WdTractor, Wd);

/**
 * Instruct webdriver to wait until Angular has finished rendering and has
 * no outstanding $http calls before continuing.
 *
 * @return {!webdriver.promise.Promise} A promise that will resolve to the
 *    scripts return value.
 */
WdTractor.prototype.waitForAngular = function(done) {
  this.executeAsync(clientSideScripts.waitForAngular, [this.rootEl], function(err,res) {
    done(err,res);
  });
};

/**
 * Add a module to load before Angular whenever Protractor.get is called.
 * Modules will be registered after existing modules already on the page,
 * so any module registered here will override preexisting modules with the same
 * name.
 *
 * @param {!string} name The name of the module to load or override.
 * @param {!string|Function} script The JavaScript to load the module.
 */
WdTractor.prototype.addMockModule = function(name, script) {
  this.moduleNames_.push(name);
  this.moduleScripts_.push(script);
};

/**
 * Clear the list of registered mock modules.
 */
WdTractor.prototype.clearMockModules = function() {
  this.moduleNames_ = [];
  this.moduleScripts_ = [];
};

/**
 * See webdriver.WebDriver.get
 *
 * Navigate to the given destination and loads mock modules before
 * Angular.
 */
WdTractor.prototype.ngGet = function(destination, done) {
  destination = url.resolve(this.baseUrl, destination);

  var _this = this;
  async.series([
    function(done) {_this.wdGet('about:blank', done);},
    function(done) {
      _this.execute('window.name += "' + DEFER_LABEL + '";' +
      'window.location.href = "' + destination + '"', done);
    },
    function(done) {
      // Make sure the page is an Angular page.
      _this.executeAsync(
        clientSideScripts.testForAngular,
        [10],
        function(err, hasAngular) {
          if(err) {return done(err);}
          if (!hasAngular) {
            return done( new Error('Angular could not be found on the page ' +
                destination));
          }
          done(null);
        }
      );
    },
    function(done) {
      // At this point, Angular will pause for us, until angular.resumeBootstrap
      // is called.
      async.series(
        _.map(_this.moduleScripts_, function(s) {
          return function(done) {_this.execute(s, done);};
        })
      , done);
    },
    function(done) {
      _this.execute(function() {
        // Continue to bootstrap Angular.
        angular.resumeBootstrap(arguments[0]);
      }, [_this.moduleNames_], done);
    }
  ], done);
};

// by default get=ngGet
WdTractor.prototype.wdGet = WdTractor.prototype.get;
WdTractor.prototype.get = WdTractor.prototype.ngGet;

(function() {
  // Adding binding selector to element and elements

  var ngSelectorScripts = {
    'ng binding': clientSideScripts.findBinding, // binding
    'ng select': clientSideScripts.findSelect, // model
    'ng selected option': clientSideScripts.findSelectedOption, // model
    'ng input': clientSideScripts.findInput, // model
    'ng repeater': clientSideScripts.findRepeaterElement, // repeatDescriptor, index, binding
    'ng repeater row': clientSideScripts.findRepeaterRow, // repeatDescriptor, index
    'ng repeater column': clientSideScripts.findRepeaterColumn, // repeatDescriptor, binding
  };

  function toWebElement(result){
    if(_(result).isArray()){
      return _.map(result, function(el) {return el.value;});
    } else {
      return result.value;
    }
  }
  var _element = WdTractor.prototype.element;

  WdTractor.prototype.element = function() {
    var args = Array.prototype.slice.call(arguments);
    var fargs = utils.varargs(arguments);
    var locatorType = fargs.all[0];
    var locatorValues = _.rest(fargs.all);
    var cb = fargs.callback;
    if(ngSelectorScripts[locatorType]){
      this.execute(ngSelectorScripts[locatorType], locatorValues, function(err, el) {
        if(err) { return cb(err);}
        cb(null, toWebElement(el));
      });
    } else {
      _element.apply(this, args);
    }
  };

  _elements = WdTractor.prototype.elements;
  WdTractor.prototype.elements = function() {
    var args = Array.prototype.slice.call(arguments);
    var fargs = utils.varargs(arguments);
    var locatorType = fargs.all[0];
    var locatorValue = fargs.all[1];
    var cb = fargs.callback;
    if(locatorType === 'ng binding'){
      this.execute(clientSideScripts.findBindings, [locatorValue], function(err, els) {
        if(err) { return cb(err);}
        cb(null, toWebElement(els));
      });
    } else {
      _elements.apply(this, args);
    }
  };

  /*
   * Patching find element function to waits for Angular to finish rendering
   * before searching for elements.
   *
   * TODO: make this optional.
   */
  var methodsToPatch = [ 'element', 'elementOrNull', 'elementIfExists',
    'elements','hasElement'];

  _(methodsToPatch).each(function(method) {
    var existing = WdTractor.prototype[method];
    WdTractor.prototype[method] = function() {
      var args = Array.prototype.slice.call(arguments);
      var fargs = utils.varargs(arguments);
      var cb = fargs.callback;
      var _this = this;
      this.waitForAngular(function(err) {
        if(err) {return cb(err);}
        existing.apply(_this, args);
      });
    };
  });

  // building byBinding methods similar to wd
  _(ngSelectorScripts).keys().each(function(key) {
    var plural = (key === 'ng binding'); // only ng binding has plurals
    WdTractor.prototype._buildBySuffixMethods(key, WdTractor.prototype, true, plural);
  });

})();
