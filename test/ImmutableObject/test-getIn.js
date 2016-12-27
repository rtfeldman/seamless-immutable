var JSC          = require("jscheck");
var assert       = require("chai").assert;
var _            = require("lodash");
var getTestUtils = require("../TestUtils.js");


module.exports = function(config) {
  var Immutable = config.implementation;
  var TestUtils = getTestUtils(Immutable);
  var check     = TestUtils.check;

  function getPathComponent() {
    // It's very convenient to use lodash.set, but it has funky behaviour
    // with numeric keys.
    var s = JSC.string()().replace(/[^\w]/g, '_');
    return /^\d+$/.test(s) ? s + 'a' : s;
  }

  describe("#getIn", function() {
    it("gets a property by path", function () {
      check(100, [TestUtils.ComplexObjectSpecifier()], function(ob) {
        var immutable = Immutable(ob);

        var path = [], depth = JSC.integer(1, 5)();
        for (var j = 0; j < depth; j++) {
          path.push(getPathComponent());
        }

        TestUtils.assertJsonEqual(
          Immutable.getIn(immutable, path),
          _.get(immutable, path)
        );
      });
    });

    it("returns the default value if the resolved value is undefined", function () {
      check(100, [TestUtils.ComplexObjectSpecifier()], function(ob) {
        var immutable = Immutable({ test: 'test'});

        TestUtils.assertJsonEqual(
          Immutable.getIn(immutable, ['notFound'], 'default'),
          'default'
        );
      });
    });

    it("static method continues to work after overriding the instance method", function() {
      var I = Immutable.static;

      var immutable;

      immutable = I({getIn: 'string'});
      TestUtils.assertJsonEqual(immutable, {getIn: 'string'});
      var value = I.getIn(immutable, ['getIn']);
      TestUtils.assertJsonEqual(value, 'string');
    });

    it("supports non-static syntax", function() {
      var obj = Immutable({ test: 'test' });
      var value = obj.getIn(['test']);
      TestUtils.assertJsonEqual(value, 'test');
    });
  });
};
