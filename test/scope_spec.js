describe('scope', function() {
  var browser;

  before(function() {
    return browser = initBrowser();
  });

  after(function() {
    return browser.quit();
  });

  describe('in forms', function() {

    beforeEach(function() {
      return browser.get( urlRoot + 'app/index.html');
    });

    it('should find an element by binding', function() {
      var urlInput = browser.elementByNgInput('url');

      return urlInput
      .getValue().should.become('/fastcall')
      .withEl(urlInput).clear().type('/abcd')
      .withEl(urlInput).getValue().should.become('/abcd')
      .withEl(urlInput).then(function(el) {
        return browser.ngEval(el,"url").should.become('/abcd');
      })
      .thenResolve(urlInput).ngEval("url").should.become('/abcd');
    });

  });
});
