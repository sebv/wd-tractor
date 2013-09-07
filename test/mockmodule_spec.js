describe('mock modules', function() {

  // A module to override the 'version' service. This function will be
  // executed in the context of the application under test, so it may
  // not refer to any local variables.
  var mockModuleA = function() {
    var newModule = angular.module('moduleA', []);
    newModule.value('version', '2');
  };

  // A second module overriding the 'version' service.
  // This module shows the use of a string for the load
  // function.
  // TODO(julie): Consider this syntax. Should we allow loading the
  // modules from files? Provide helpers?
  var mockModuleB = "angular.module('moduleB', []).value('version', '3');";

  var browser;

  before(function() {
    return browser = initBrowser();
  });

  after(function() {
    return browser.quit();
  });

  afterEach(function() {
    browser.clearMockModules();
  });

  it('should override services via mock modules', function() {
    browser
      .addMockModule('moduleA', mockModuleA)
      .get(urlRoot + 'app/index.html')
      .elementByCss('[app-version]').text().should.become('2');
  });

  it('should override services via mock modules', function() {
    return browser
      .addMockModule('moduleA', mockModuleA)
      .addMockModule('moduleB', mockModuleB)
      .get(urlRoot + 'app/index.html')
      .elementByCss('[app-version]').text().should.become('3');
  });
});
