/* global angular */
module.exports = function(wd) {
  var inherits = require('util').inherits;
  var _ = require('lodash');
  var async = require('async');

  var Webdriver = wd.Webdriver;
  var Element = wd.Element;

  var utils = require('./utils');
  var clientSideScripts = require('./client_side_scripts');

  var DEFER_LABEL = 'NG_DEFER_BOOTSTRAP!';

  // subclassing WebDriver
  var WdTractorWebdriver = function(){
    var args = Array.prototype.slice.call(arguments);
    Webdriver.apply(this, args);

    this.rootEl = 'body';
    this.moduleNames = [];
    this.modules = [];
  };

  inherits(WdTractorWebdriver, Webdriver);

  // // subclassing WebDriver element
  var WdTractorElement  = function(){
    var args = Array.prototype.slice.call(arguments);
    Element.apply(this, args);
  };

  inherits(WdTractorElement, Element);

  // creates a new element
  WdTractorWebdriver.prototype.newElement = function(jsonWireElement) {
    return new WdTractorElement(jsonWireElement, this);
  };

  /**
   * Setting async timeout to 5 seconds on init
   */
  var _init = WdTractorWebdriver.prototype.init;
  WdTractorWebdriver.prototype.init = function() {
    var _this = this;
    var fargs = utils.varargs(arguments);
    var cb = fargs.callback;
    var args = fargs.all;
    async.series([
      function(done) {
        args.push(done);
        _init.apply(_this, args);
      },
      function(done) {
        _this.setAsyncScriptTimeout(5000, done);
      }
    ], function(err, res) {
      if(err) {return cb(err);}
      cb(null, res[0]);
    });
  };

  /**
   * Set the Angular root element
   */
  WdTractorWebdriver.prototype.setRootEl = function(_rootEl){
    this.rootEl = _rootEl;
  };

  /**
   * Instruct webdriver to wait until Angular has finished rendering and has
   * no outstanding $http calls before continuing.
   *
   * @return {!webdriver.promise.Promise} A promise that will resolve to the
   *    scripts return value.
   */
  WdTractorWebdriver.prototype.waitForAngular = function(done) {
    this._waitForAngular(done);
  };

  // hidden implementation of above method
  WdTractorWebdriver.prototype._waitForAngular = function(done) {
    this.executeAsync(clientSideScripts.waitForAngular, [this.rootEl], function(err) {
      done(err);
    });
  };

  /**
   * Add a module to load before Angular whenever Protractor.get is called.
   * Modules will be registered after existing modules already on the page,
   * so any module registered here will override preexisting modules with the same
   * name.
   *
   * @param {!string} name The name of the module to load or override.
   * @param {!Module} script the module instance.
   */
  WdTractorWebdriver.prototype.addMockModule = function(name, module, cb) {
    this.moduleNames.push(name);
    this.modules.push(module);
    if(cb) {cb(null);}
  };

  /**
   * Clear the list of registered mock modules.
   */
  WdTractorWebdriver.prototype.clearMockModules = function(cb) {
    this.moduleNames = [];
    this.modules = [];
    if(cb) {cb(null);}
  };

  /**
   * See webdriver.WebDriver.get
   *
   * Navigate to the given destination and loads mock modules before
   * Angular.
   */
  WdTractorWebdriver.prototype.ngGet = function(destination, done) {
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
          _.map(_this.modules, function(module) {
            return function(done) {_this.execute(module.code, done);};
          })
        , done);
      },
      function(done) {
        _this.execute(function() {
          // Continue to bootstrap Angular.
          angular.resumeBootstrap(arguments[0]);
        }, [_this.moduleNames], done);
      }
    ], function(err) {
      if(err) { return done(err);}
      // ignoring all the results
      done(null);
    });
  };

  WdTractorWebdriver.prototype.ngEval = function(el, expr) {
    var fargs = utils.varargs(arguments);
    var cb = fargs.callback;
    // preparing element so that it is recognized by selenium
    if(el && el.value) {el = el.value;}
    el = {ELEMENT:el};
    this.execute(clientSideScripts.$eval, [el,expr], cb);
  };

  WdTractorElement.prototype.ngEval = function(expr) {
    var fargs = utils.varargs(arguments);
    var cb = fargs.callback;
    return this.browser.ngEval(this, expr, cb);
  };

  // by default get=ngGet
  WdTractorWebdriver.prototype.wdGet = WdTractorWebdriver.prototype.get;
  WdTractorWebdriver.prototype.get = WdTractorWebdriver.prototype.ngGet;

  // Adding binding selector to element and elements
  // ng binding: (binding)
  // ng select: (model)
  // ng selected option: (model)
  // ng select: (model)
  // ng repeater: (repeatDescriptor, index, binding)
  // ng repeater row: (epeatDescriptor, index)
  // ng repeater column: (repeatDescriptor, binding)
  var ngSelectors = {
    'ng binding': { singular: clientSideScripts.findBinding,
      plural: clientSideScripts.findBindings },
    'ng select': { singular: clientSideScripts.findSelect },
    'ng selected option': { singular: clientSideScripts.findSelectedOption },
    'ng input': { singular: clientSideScripts.findInput },
    'ng repeater': { singular: clientSideScripts.findRepeaterElement },
    'ng repeater row': { singular: clientSideScripts.findRepeaterRow },
    'ng repeater column': { plural: clientSideScripts.findRepeaterColumn }
  };

  function toElement(result, browser){
    if(_(result).isArray()){
      return _.map(result, function(el) {return browser.newElement(el.value);});
    } else {
      return browser.newElement(result.value);
    }
  }

  var _element = WdTractorWebdriver.prototype.element;

  WdTractorWebdriver.prototype.element = function() {
    var _this = this;
    var args = Array.prototype.slice.call(arguments);
    var fargs = utils.varargs(arguments);
    var locatorType = fargs.all[0];
    var locatorValues = _.rest(fargs.all);
    var cb = fargs.callback;
    if(ngSelectors[locatorType] && ngSelectors[locatorType].singular){
      this.execute(ngSelectors[locatorType].singular, locatorValues, function(err, el) {
        if(err) { return cb(err);}
        cb(null, toElement(el, _this));
      });
    } else {
      _element.apply(this, args);
    }
  };

  var _elements = WdTractorWebdriver.prototype.elements;

  WdTractorWebdriver.prototype.elements = function() {
    var _this = this;
    var args = Array.prototype.slice.call(arguments);
    var fargs = utils.varargs(arguments);
    var locatorType = fargs.all[0];
    var locatorValues = _.rest(fargs.all);
    var cb = fargs.callback;
    if(ngSelectors[locatorType] && ngSelectors[locatorType].plural){
      this.execute(ngSelectors[locatorType].plural, locatorValues, function(err, els) {
        if(err) { return cb(err);}
        cb(null, toElement(els, _this));
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
    var existing = WdTractorWebdriver.prototype[method];
    WdTractorWebdriver.prototype[method] = function() {
      var args = Array.prototype.slice.call(arguments);
      var fargs = utils.varargs(arguments);
      var cb = fargs.callback;
      var _this = this;
      this._waitForAngular(function(err) {
        if(err) {return cb(err);}
        existing.apply(_this, args);
      });
    };
  });

  // building byBinding methods similar to wd
  _(ngSelectors).each(function(scripts , selector) {
    WdTractorWebdriver.prototype._buildBySuffixMethods(selector, WdTractorWebdriver.prototype,
      scripts.singular, scripts.plural);
  });

  return {
    Webdriver: WdTractorWebdriver,
    Element: WdTractorElement
  };
};
