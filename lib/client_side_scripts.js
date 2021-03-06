/* global document, window, angular */
/* jshint eqeqeq: false */

/**
 * All scripts to be run on the client via executeAsyncScript or
 * executeScript should be put here. These scripts are transmitted over
 * the wire using their toString representation, and cannot reference
 * external variables. They can, however use the array passed in to
 * arguments. Instead of params, all functions on clientSideScripts
 * should list the arguments array they expect.
 */
var clientSideScripts = module.exports = {};

/**
 * Wait until Angular has finished rendering and has
 * no outstanding $http calls before continuing.
 *
 * arguments[0] {string} The selector housing an ng-app
 * arguments[1] {function} callback
 */
clientSideScripts.waitForAngular = function() {
  var el = document.querySelector(arguments[0]);
  var callback = arguments[1];
  angular.element(el).injector().get('$browser').
      notifyWhenNoOutstandingRequests(callback);
};

/**
 * Find an element in the page by their angular binding.
 *
 * arguments[0] {string} The binding, e.g. {{cat.name}}.
 *
 * @return {WebElement} The element containing the binding.
 */
clientSideScripts.findBinding = function() {
  var bindings = document.getElementsByClassName('ng-binding');
  var matches = [];
  var binding = arguments[0];
  for (var i = 0; i < bindings.length; ++i) {
    var bindingName = angular.element(bindings[i]).data().$binding[0].exp ||
        angular.element(bindings[i]).data().$binding;
    if (bindingName.indexOf(binding) != -1) {
      matches.push(bindings[i]);
    }
  }
  return matches[0]; // We can only return one with webdriver.findElement.
};

/**
 * Find a list of elements in the page by their angular binding.
 *
 * arguments[0] {string} The binding, e.g. {{cat.name}}.
 *
 * @return {Array.<WebElement>} The elements containing the binding.
 */
clientSideScripts.findBindings = function() {
  var bindings = document.getElementsByClassName('ng-binding');
  var matches = [];
  var binding = arguments[0];
  for (var i = 0; i < bindings.length; ++i) {
    var bindingName = angular.element(bindings[i]).data().$binding[0].exp ||
        angular.element(bindings[i]).data().$binding;
    if (bindingName.indexOf(binding) != -1) {
      matches.push(bindings[i]);
    }
  }
  return matches; // Return the whole array for webdriver.findElements.
};

/**
 * Find a row within an ng-repeat.
 *
 * arguments[0] {string} The text of the repeater, e.g. 'cat in cats'.
 * arguments[1] {number} The row index.
 *
 * @return {Element} The row element.
 */
 clientSideScripts.findRepeaterRow = function() {
  var repeater = arguments[0];
  var index = arguments[1];

  var rows = [];
  var prefixes = ['ng-', 'ng_', 'data-ng-', 'x-ng-', 'ng\\:'];
  for (var p = 0; p < prefixes.length; ++p) {
    var attr = prefixes[p] + 'repeat';
    var repeatElems = document.querySelectorAll('[' + attr + ']');
    attr = attr.replace(/\\/g, '');
    for (var i = 0; i < repeatElems.length; ++i) {
      if (repeatElems[i].getAttribute(attr).indexOf(repeater) != -1) {
        rows.push(repeatElems[i]);
      }
    }
  }
  return rows[index - 1];
 };

/**
 * Find an element within an ng-repeat by its row and column.
 *
 * arguments[0] {string} The text of the repeater, e.g. 'cat in cats'.
 * arguments[1] {number} The row index.
 * arguments[2] {string} The column binding, e.g. '{{cat.name}}'.
 *
 * @return {Element} The element.
 */
clientSideScripts.findRepeaterElement = function() {
  var matches = [];
  var repeater = arguments[0];
  var index = arguments[1];
  var binding = arguments[2];

  var rows = [];
  var prefixes = ['ng-', 'ng_', 'data-ng-', 'x-ng-', 'ng\\:'];
  var i,p;
  for (p = 0; p < prefixes.length; ++p) {
    var attr = prefixes[p] + 'repeat';
    var repeatElems = document.querySelectorAll('[' + attr + ']');
    attr = attr.replace(/\\/g, '');
    for (i = 0; i < repeatElems.length; ++i) {
      if (repeatElems[i].getAttribute(attr).indexOf(repeater) != -1) {
        rows.push(repeatElems[i]);
      }
    }
  }
  var row = rows[index - 1];
  var bindings = [];
  if (row.className.indexOf('ng-binding') != -1) {
    bindings.push(row);
  }
  var childBindings = row.getElementsByClassName('ng-binding');
  for (i = 0; i < childBindings.length; ++i) {
    bindings.push(childBindings[i]);
  }
  for (i = 0; i < bindings.length; ++i) {
    var bindingName = angular.element(bindings[i]).data().$binding[0].exp ||
        angular.element(bindings[i]).data().$binding;
    if (bindingName.indexOf(binding) != -1) {
      matches.push(bindings[i]);
    }
  }
  // We can only return one with webdriver.findElement.
  return matches[0];
};

/**
 * Find the elements in a column of an ng-repeat.
 *
 * arguments[0] {string} The text of the repeater, e.g. 'cat in cats'.
 * arguments[1] {string} The column binding, e.g. '{{cat.name}}'.
 *
 * @return {Array.<Element>} The elements in the column.
 */
clientSideScripts.findRepeaterColumn = function() {
  var matches = [];
  var repeater = arguments[0];
  var binding = arguments[1];

  var rows = [];
  var p,i,j,k;
  var prefixes = ['ng-', 'ng_', 'data-ng-', 'x-ng-', 'ng\\:'];
  for (p = 0; p < prefixes.length; ++p) {
    var attr = prefixes[p] + 'repeat';
    var repeatElems = document.querySelectorAll('[' + attr + ']');
    attr = attr.replace(/\\/g, '');
    for (i = 0; i < repeatElems.length; ++i) {
      if (repeatElems[i].getAttribute(attr).indexOf(repeater) != -1) {
        rows.push(repeatElems[i]);
      }
    }
  }
  for (i = 0; i < rows.length; ++i) {
    var bindings = [];
    if (rows[i].className.indexOf('ng-binding') != -1) {
      bindings.push(rows[i]);
    }
    var childBindings = rows[i].getElementsByClassName('ng-binding');
    for (k = 0; k < childBindings.length; ++k) {
      bindings.push(childBindings[k]);
    }
    for (j = 0; j < bindings.length; ++j) {
      var bindingName = angular.element(bindings[j]).data().$binding[0].exp ||
          angular.element(bindings[j]).data().$binding;
      if (bindingName.indexOf(binding) != -1) {
        matches.push(bindings[j]);
      }
    }
  }
  return matches;
};

/**
 * Find an input element by model name.
 *
 * arguments[0] {string} The model name.
 *
 * @return {Element} The first matching input element.
*/
clientSideScripts.findInput = function() {
  var model = arguments[0];
  var prefixes = ['ng-', 'ng_', 'data-ng-', 'x-ng-', 'ng\\:'];
  for (var p = 0; p < prefixes.length; ++p) {
    var selector = 'input[' + prefixes[p] + 'model="' + model + '"]';
    var inputs = document.querySelectorAll(selector);
    if (inputs.length) {
      return inputs[0];
    }
  }
};

 /**
  * Find an select element by model name.
  *
  * arguments[0] {string} The model name.
  *
  * @return {Element} The first matching select element.
  */
clientSideScripts.findSelect = function() {
  var model = arguments[0];
  var prefixes = ['ng-', 'ng_', 'data-ng-', 'x-ng-', 'ng\\:'];
  for (var p = 0; p < prefixes.length; ++p) {
    var selector = 'select[' + prefixes[p] + 'model="' + model + '"]';
    var inputs = document.querySelectorAll(selector);
    if (inputs.length) {
      return inputs[0];
    }
  }
};

/**
  * Find an selected option element by model name.
  *
  * arguments[0] {string} The model name.
  *
  * @return {Element} The first matching input element.
  */
clientSideScripts.findSelectedOption = function() {
  var model = arguments[0];
  var prefixes = ['ng-', 'ng_', 'data-ng-', 'x-ng-', 'ng\\:'];
  for (var p = 0; p < prefixes.length; ++p) {
    var selector =
        'select[' + prefixes[p] + 'model="' + model + '"] option:checked';
    var inputs = document.querySelectorAll(selector);
    if (inputs.length) {
      return inputs[0];
    }
  }
};

/**
 * Tests whether the angular global variable is present on a page. Retries
 * in case the page is just loading slowly.
 *
 * arguments none.
 */
 clientSideScripts.testForAngular = function() {
  var attempts = arguments[0];
  var callback = arguments[arguments.length - 1];
  var check = function(n) {
    if (window.angular && window.angular.resumeBootstrap) {
      callback(true);
    } else if (n < 1) {
      callback(false);
    } else {
      window.setTimeout(function() {check(n - 1);}, 1000);
    }
  };
  check(attempts);
};

/**
  * eval the given angular expression in the given element scope.
  *
  * arguments[0] {Element} The current element.
  * arguments[1] {String} The angular expression.
  *
  * @return {Object} The result.
  */
clientSideScripts.$eval = function() {
  var el = arguments[0];
  var expr = arguments[1];
  var scope = angular.element(el).scope();
  if(!scope){ throw new Error('Cannot retrieve scope for element.');}
  return scope.$eval(expr);
};
