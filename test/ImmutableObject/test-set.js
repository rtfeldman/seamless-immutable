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

  describe("#set", function() {
    it("sets a property by name", function () {
      check(100, [TestUtils.ComplexObjectSpecifier()], function(ob) {
        var immutable = Immutable(ob);
        var mutable = immutable.asMutable();
        var prop = getPathComponent();
        var value = JSC.any()();

        TestUtils.assertJsonEqual(
          Immutable.set(immutable, prop, value),
          _.set(mutable, prop, value)
        );
      });
    });
  });

  describe("#setIn", function() {
    it("sets a property by path", function () {
      check(100, [TestUtils.ComplexObjectSpecifier()], function(ob) {
        var immutable = Immutable(ob);
        var mutable = immutable.asMutable();
        var value = JSC.any()();

        TestUtils.assertJsonEqual(immutable, mutable);

        var path = [], depth = JSC.integer(1, 5)();
        for (var j = 0; j < depth; j++) {
          path.push(getPathComponent());
        }

        TestUtils.assertJsonEqual(
          Immutable.setIn(immutable, path, value),
          _.set(mutable, path, value)
        );
      });
    });

    it("handles setting a new object on existing leaf array correctly", function () {
      var ob = {foo: []};
      var path = ['foo', 0, 'bar'];
      var val = 'val';

      var immutable = Immutable(ob);
      var final = Immutable.setIn(immutable, path, val);

      assert.deepEqual(final, {foo: [{bar: 'val'}]});
    });
  });
};
