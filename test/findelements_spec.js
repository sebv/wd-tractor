var wd = require('../index');
var should = require('should');
var async = require('async');

describe('finding elements', function() {
  this.timeout(10000);
  var urlRoot = 'http://localhost:8000/';
  var browser;

  before(function(done) {
    browser = wd.remote();
    browser.init({
      browserName: 'chrome'
    }, function() {
      // browser.on('status', function(info) {
      //   console.log(info);
      // });
      // browser.on('command', function(meth, path, data) {
      //   console.log(' > ' + meth, path, data || '');
      // });
      done();
    });
  });

  after(function() {
    browser.quit();
  });

  describe('in forms', function() {

    beforeEach(function(done) {
      browser.get( urlRoot + 'app/index.html#/form', done);
    });

    it('should find an element by binding', function(done) {
      async.waterfall([
        function(done) {browser.elementByNgBinding('{{greeting}}', done);},
        function(greeting, done) {greeting.text(done);},
        function(text) {text.should.equal('Hiya');done();},
      ], done);
    });

    it('should find a binding by partial match', function(done) {
      async.waterfall([
        function(done) {browser.elementByNgBinding('greet', done);},
        function(greeting, done) {greeting.text(done);},
        function(text) {text.should.equal('Hiya');done();},
      ], done);
    });

    it('should find a binding by partial match', function(done) {
      async.waterfall([
        function(done) {browser.elementByNgBinding('username', done);},
        function(name, done) {name.text(done);},
        function(name) {name.should.equal('Anon');done();},
      ], done);
    });

    it('should find an element by text input model', function(done) {
      async.waterfall([
        function(done) {browser.elementByNgInput('username', done);},
        function(name, done) {
          async.waterfall([
            function(done) {name.click(done);},
            function(done) {name.clear(done);},
            function(done) {name.type('Jane Doe', done);},
            function(done) {name.getValue(done);},
            function(name, done) {
              name.should.equal('Jane Doe');
              done();
            }
          ], done);
        }
      ], done);
    });

    it('should find an element by checkbox input model', function(done) {
      var shower;
      async.waterfall([
        function(done) {browser.elementById('shower', done);},
        function(_shower, done) {shower = _shower; shower.isDisplayed(done);},
        function(isDisplayed, done) {isDisplayed.should.be.ok; done();},

        function(done) {browser.elementByNgInput('show', done);},
        function(show, done) {show.click(done);},
        function(done) {shower.isDisplayed(done);},
        function(isDisplayed, done) {isDisplayed.should.not.be.ok; done();},
       ], done);
    });


    it('should find inputs with alternate attribute forms', function(done) {
      var letterlist;
      async.waterfall([
        function(done) {browser.elementById('letterlist', done);},
        function(_letterlist, done) {
          letterlist = _letterlist;
          letterlist.text(done);},
        function(text, done) {text.should.equal(''); done();},

        function(done) {browser.elementByNgInput('check.w', done);},
        function(check, done) {check.click(done);},
        function(done) {letterlist.text(done);},
        function(text, done) {text.should.equal('w'); done();},

        function(done) {browser.elementByNgInput('check.x', done);},
        function(check, done) {check.click(done);},
        function(done) {letterlist.text(done);},
        function(text, done) {text.should.equal('wx'); done();},

        function(done) {browser.elementByNgInput('check.y', done);},
        function(check, done) {check.click(done);},
        function(done) {letterlist.text(done);},
        function(text, done) {text.should.equal('wxy'); done();},

        function(done) {browser.elementByNgInput('check.z', done);},
        function(check, done) {check.click(done);},
        function(done) {letterlist.text(done);},
        function(text, done) {text.should.equal('wxyz'); done();},
       ], done);
    });

    it('should find a repeater by partial match', function(done) {
      async.waterfall([
        function(done) {browser.elementByNgRepeater(
          'baz in days | filter:\'T\'', 1, '{{baz}}', done);},
        function(fullMatch, done) {fullMatch.text(done);},
        function(fullMatch) {fullMatch.should.equal('Tue');done();},

        function(done) {browser.elementByNgRepeater(
          'baz in days', 1, 'b', done);},
        function(partialMatch, done) {partialMatch.text(done);},
        function(partialMatch) {partialMatch.should.equal('Tue');done();},

        function(done) {browser.elementByNgRepeaterRow(
          'baz in days', 1, done);},
        function(partialRowMatch, done) {partialRowMatch.text(done);},
        function(partialRowMatch) {partialRowMatch.should.equal('Tue');done();},

      ], done);
    });

    it('should find a repeater using data-ng-repeat', function(done) {
      async.waterfall([
        function(done) {browser.elementByNgRepeaterRow(
          'day in days', 3, done);},
        function(byRow, done) {byRow.text(done);},
        function(byRow) {byRow.should.equal('Wed');done();},

        function(done) {browser.elementByNgRepeater(
          'day in days', 3, 'day', done);},
        function(byCol, done) {byCol.text(done);},
        function(byCol) {byCol.should.equal('Wed');done();},
      ], done);
    });

    it('should find a repeater using ng:repeat', function(done) {
      async.waterfall([
        function(done) {browser.elementByNgRepeaterRow(
          'bar in days', 3, done);},
        function(byRow, done) {byRow.text(done);},
        function(byRow) {byRow.should.equal('Wed');done();},

        function(done) {browser.elementByNgRepeater(
          'bar in days', 3, 'bar', done);},
        function(byCol, done) {byCol.text(done);},
        function(byCol) {byCol.should.equal('Wed');done();},
      ], done);
    });

    it('should find a repeater using ng_repeat', function(done) {
      async.waterfall([
        function(done) {browser.elementByNgRepeaterRow(
          'foo in days', 3, done);},
        function(byRow, done) {byRow.text(done);},
        function(byRow) {byRow.should.equal('Wed');done();},

        function(done) {browser.elementByNgRepeater(
          'foo in days', 3, 'foo', done);},
        function(byCol, done) {byCol.text(done);},
        function(byCol) {byCol.should.equal('Wed');done();},
      ], done);
    });

    it('should find a repeater using x-ng-repeat', function(done) {
      async.waterfall([
        function(done) {browser.elementByNgRepeaterRow(
          'qux in days', 3, done);},
        function(byRow, done) {byRow.text(done);},
        function(byRow) {byRow.should.equal('Wed');done();},

        function(done) {browser.elementByNgRepeater(
          'qux in days', 3, 'qux', done);},
        function(byCol, done) {byCol.text(done);},
        function(byCol) {byCol.should.equal('Wed');done();},
      ], done);
    });
  });

  describe('further examples', function() {

    beforeEach(function(done) {
      browser.get( urlRoot + 'app/index.html#/bindings', done);
    });

    it('should find elements using a select', function(done) {
      async.waterfall([
        function(done) {browser.elementByNgSelectedOption('planet', done);},
        function(planet, done) {planet.text(done);},
        function(planet, done) {planet.should.equal('Mercury');done();},

        function(done) {browser.elementByNgSelect('planet', done);},
        function(planet, done) {planet.elementByCss('option[value="4"]' ,done);},
        function(planet, done) {planet.click(done);},

        function(done) {browser.elementByNgSelectedOption('planet', done);},
        function(planet, done) {planet.text(done);},
        function(planet, done) {planet.should.equal('Jupiter');done();},
      ], done);
    });


    it('should find elements using a repeater', function(done) {
      // Returns the element for the entire row.

      var planets;
      async.waterfall([
        function(done) {browser.elementByNgRepeaterRow(
          'ball in planets', 3, done);},
        function(planet, done) {planet.text(done);},
        function(planet, done) {planet.should.equal('Earth:3');done();},

        function(done) {browser.elementByNgRepeater(
          'ball in planets', 2, '{{ball.name}}',done);},
        function(planet, done) {planet.text(done);},
        function(planet, done) {planet.should.equal('Venus');done();},

        function(done) {browser.elementsByNgRepeaterColumn(
          'ball in planets', '{{ball.name}}',done);},
        function(_planets, done) {planets = _planets;
          planets[1].text(done);},
        function(planet, done) {planet.should.equal('Venus');done();},
        function(done) {planets[2].text(done);},
        function(planet, done) {planet.should.equal('Earth');done();},
      ], done);
    });

    it('should find multiple elements by binding', function(done) {
      var moons;
      async.waterfall([

        function(done) {browser.elementByNgSelect('planet', done);},
        function(planet, done) {planet.elementByCss('option[value="4"]' ,done);},
        function(planet, done) {planet.click(done);},

        function(done) {browser.elementsByNgBinding('{{moon}}', done);},
        function(_moons, done) {moons = _moons;
          moons[0].text(done);},
        function(moon, done) { moon.should.equal('Europa');
          moons[2].text(done);},
        function(moon, done) { moon.should.equal('Ganymede');done();},
      ], done);
    });
  });
});
