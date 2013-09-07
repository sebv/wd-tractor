describe('finding elements', function() {
  var browser;

  before(function() {
    return browser = initBrowser();
  });

  after(function() {
    return browser.quit();
  });

  describe('in forms', function() {

    beforeEach(function() {
      return browser.get( urlRoot + 'app/index.html#/form');
    });

    it('should find an element by binding', function() {
      return browser
        .elementByNgBinding('{{greeting}}').text().should.become('Hiya');
    });

    it('should find a binding by partial match', function() {
      return browser
        .elementByNgBinding('greet').text().should.become('Hiya');
    });

    it('should find a binding by partial match', function() {
      return browser
        .elementByNgBinding('username').text().should.become('Anon');
    });

    it('should find an element by text input model', function() {
      var username = browser.elementByNgInput('username');
      return username.click().clear().type('Jane Doe')
        .getValue().should.become('Jane Doe');
    });

    it('should find an element by checkbox input model', function() {
      var shower = browser.elementById('shower');
      return shower.isDisplayed().should.eventually.be.ok
        .elementByNgInput('show').click()
        .then(function() {
          return shower.isDisplayed().should.eventually.not.be.ok;
        });
    });

    it('should find inputs with alternate attribute forms', function() {
      var letterlist = browser.elementById('letterlist');

      var clickAndCheck = function(field, expected) {
        return function() {
          return browser
            .elementByNgInput(field)
            .click().then(function() {
              return letterlist.text().should.become(expected);
      });};};

      return letterlist.text().should.become('')
        .then( clickAndCheck('check.w', 'w' ) )
        .then( clickAndCheck('check.x', 'wx' ) )
        .then( clickAndCheck('check.y', 'wxy' ) )
        .then( clickAndCheck('check.z', 'wxyz' ) );
    });

    it('should find a repeater by partial match', function() {
      return browser
        .elementByNgRepeater('baz in days | filter:\'T\'', 1, '{{baz}}')
          .text().should.become('Tue')
        .elementByNgRepeater('baz in days', 1, 'b').text().should.become('Tue')
        .elementByNgRepeaterRow('baz in days', 1).text().should.become('Tue');
    });

    it('should find a repeater using data-ng-repeat', function() {
      return browser
        .elementByNgRepeaterRow('day in days', 3).text().should.become('Wed')
        .elementByNgRepeater('day in days', 3, 'day').text().should.become('Wed');
    });

    it('should find a repeater using data-ng-repeat', function() {
      return browser
        .elementByNgRepeaterRow('bar in days', 3).text().should.become('Wed')
        .elementByNgRepeater('bar in days', 3, 'bar').text().should.become('Wed');
    });

    it('should find a repeater using data-ng-repeat', function() {
      return browser
        .elementByNgRepeaterRow('foo in days', 3).text().should.become('Wed')
        .elementByNgRepeater('foo in days', 3, 'foo').text().should.become('Wed');
    });

    it('should find a repeater using data-ng-repeat', function() {
      return browser
        .elementByNgRepeaterRow('qux in days', 3).text().should.become('Wed')
        .elementByNgRepeater('qux in days', 3, 'qux').text().should.become('Wed');
    });
  });

  describe('further examples', function() {

    beforeEach(function() {
      return browser.get( urlRoot + 'app/index.html#/bindings');
    });

    it('should find elements using a select', function() {
      var planet = browser.elementByNgSelectedOption('planet');
      return planet.text().should.become('Mercury')
        .elementByCss('<', 'option[value="4"]').click()
        .then(function() {
          planet.text().should.become('Jupiter');
        });
    });


    it('should find elements using a repeater', function() {
      return browser
        .elementByNgRepeaterRow('ball in planets', 3)
          .text().should.become('Earth:3')
        .elementByNgRepeater('ball in planets', 2, '{{ball.name}}')
          .text().should.become('Venus')
        .elementsByNgRepeaterColumn('ball in planets', '{{ball.name}}')
        .then(function(planets) {
          return Q.all([
            planets[1].text().should.become('Venus'),
            planets[2].text().should.become('Earth')
          ]);
        });
    });

    it('should find multiple elements by binding', function() {
      return browser
        .elementByNgSelect('planet')
        .elementByCss('>', 'option[value="4"]').click()
        .elementsByNgBinding('{{moon}}').then(function(moons) {
          return Q.all([
            moons[0].text().should.become('Europa'),
            moons[2].text().should.become('Ganymede')
          ]);
        });
    });
  });
});
