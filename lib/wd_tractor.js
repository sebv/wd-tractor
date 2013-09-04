/* global angular */
(function() {

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
   * Setting async timeout to 5 seconds on init
   */
   var _init = WdTractor.prototype.init;

  WdTractor.prototype.init = function() {
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
   * Instruct webdriver to wait until Angular has finished rendering and has
   * no outstanding $http calls before continuing.
   *
   * @return {!webdriver.promise.Promise} A promise that will resolve to the
   *    scripts return value.
   */
  WdTractor.prototype.waitForAngular = function(done) {
    this.executeAsync(clientSideScripts.waitForAngular, [this.rootEl], function(err,res) {
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
      return _.map(result, function(el) {return browser._newElement(el.value);});
    } else {
      return browser._newElement(result.value, browser);
    }
  }
  var _element = WdTractor.prototype.element;

  WdTractor.prototype.element = function() {
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

  var _elements = WdTractor.prototype.elements;

  WdTractor.prototype.elements = function() {
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
  _(ngSelectors).each(function(scripts , selector) {
    WdTractor.prototype._buildBySuffixMethods(selector, WdTractor.prototype,
      scripts.singular, scripts.plural);
  });

})();
