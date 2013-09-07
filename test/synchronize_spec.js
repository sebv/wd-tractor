describe('synchronizing with slow pages', function() {

  var browser;

  before(function() {
    return browser = initBrowser();
  });

  after(function() {
    return browser.quit();
  });

  beforeEach(function() {
    return browser.get(urlRoot + 'app/index.html#/async');
  });

  var click = function(button){
    return function() {
      return button.click();
    };
  };

  var check = function(status, expected){
    return function() {
      return status.text().should.become(expected);
    };
  };

  it('waits for http calls', function() {
    var status = browser.elementByNgBinding('slowHttpStatus');
    var button = browser.elementByCss('[ng-click="slowHttp()"]');
    return browser
      .then( check(status,'not started') )
      .then( click(button) )
      .waitForAngular()
      .then( check(status,'done') );
  });

  it('waits for long javascript execution', function() {
    var status = browser.elementByNgBinding('slowFunctionStatus');
    var button = browser.elementByCss('[ng-click="slowFunction()"]');
    return browser
      .then( check(status,'not started') )
      .then( click(button) )
      .waitForAngular()
      .then( check(status,'done') );
  });

  it('DOES NOT wait for timeout', function() {
    var status = browser.elementByNgBinding('slowTimeoutStatus');
    var button = browser.elementByCss('[ng-click="slowTimeout()"]');
    return browser
      .then( check(status,'not started') )
      .then( click(button) )
      .waitForAngular()
      .then( check(status,'pending...') );
  });


  it('waits for $timeout', function() {
    var status = browser.elementByNgBinding('slowAngularTimeoutStatus');
    var button = browser.elementByCss('[ng-click="slowAngularTimeout()"]');
    return browser
      .then( check(status,'not started') )
      .then( click(button) )
      .waitForAngular()
      .then( check(status,'done') );
  });

  it('waits for $timeout then a promise', function() {
    var status = browser.elementByNgBinding('slowAngularTimeoutPromiseStatus');
    var button = browser.elementByCss('[ng-click="slowAngularTimeoutPromise()"]');
    return browser
      .then( check(status,'not started') )
      .then( click(button) )
      .waitForAngular()
      .then( check(status,'done') );
  });

  it('waits for long http call then a promise', function() {
    var status = browser.elementByNgBinding('slowHttpPromiseStatus');
    var button = browser.elementByCss('[ng-click="slowHttpPromise()"]');
    return browser
      .then( check(status,'not started') )
      .then( click(button) )
      .waitForAngular()
      .then( check(status,'done') );
  });
});
