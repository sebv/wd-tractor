describe('longer example', function() {

  var browser;

  before(function() {
    return browser = initBrowser();
  });

  after(function() {
    return browser.quit();
  });

  describe('synchronizing with Angular', function() {

    beforeEach(function() {
      return browser.get(urlRoot + 'app/index.html');
    });

    it('should wait for slow RPCs', function() {
      return  browser
        .elementById('fetch').click()
        .elementByNgBinding('{{status}}').text().should.become('200')
        .elementByNgBinding('data').text().should.become('done')
        .elementById('sample2').click()
        .elementById('fetch').click()
        .elementById('statuscode').text().should.become('200')
        .elementById('data').text().should.become('finally done');
    });

    describe('slow rendering', function() {

      beforeEach(function() {
        return browser.get(urlRoot + 'app/index.html#/repeater');
      });

      it('should synchronize with a slow action', function() {
        return browser
          .elementById('addone').click()
          .elementByNgRepeater('foo in foos', 1, '{{foo.b}}')
            .text().should.become('14930352')
          .elementById('addone').click()
          .elementByNgRepeater('foo in foos', 1, '{{foo.b}}')
            .text().should.become('24157817');
      });
    });

  });
});
