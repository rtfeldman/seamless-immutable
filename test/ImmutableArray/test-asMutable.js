var JSC          = require("jscheck");
var assert       = require("chai").assert;
var _            = require("lodash");
var getTestUtils = require("../TestUtils.js");

module.exports = function(config) {
  var Immutable = config.implementation;
  var TestUtils = getTestUtils(Immutable);
  var check     = TestUtils.check;

  describe("#asMutable", function() {
    it("returns an empty mutable array from an empty immutable array", function() {
        var immutable = Immutable([]);
        var mutable = Immutable.asMutable(immutable);

        assertIsArray(mutable);
        assertCanBeMutated(mutable);
        assert.isFalse( Immutable.isImmutable(mutable));
        TestUtils.assertJsonEqual(immutable,mutable);
    });

    it("returns a shallow mutable copy if not provided the deep flag", function() {
      check(100, [ JSC.array([TestUtils.TraversableObjectSpecifier, JSC.any()]) ], function(array) {
        var immutable = Immutable(array);
        var mutable = Immutable.asMutable(immutable);

        assertIsArray(mutable);
        assertCanBeMutated(mutable);
        assert.isFalse( Immutable.isImmutable(mutable));
        TestUtils.assertIsDeeplyImmutable(mutable[0]);
        TestUtils.assertIsDeeplyImmutable(mutable[0].deep);
        TestUtils.assertJsonEqual(immutable,mutable);
      });

    });

    it("returns a deep mutable copy if provided the deep flag", function() {
      check(100, [ JSC.array([TestUtils.TraversableObjectSpecifier, JSC.any()]) ], function(array) {
        var immutable = Immutable(array);
        var mutable = Immutable.asMutable(immutable, { deep: true });

        assertIsArray(mutable);
        assertCanBeMutated(mutable);
        assert.isFalse( Immutable.isImmutable(mutable));
        assert.isFalse( Immutable.isImmutable(mutable[0]));
        assert.isFalse( Immutable.isImmutable(mutable[0]['deep']));
        TestUtils.assertJsonEqual(immutable,mutable);
      });
    });
  });

  function assertCanBeMutated(array) {
    try {
      var newElement = { foo: "bar" };
      var originalLength = array.length;

      array.push(newElement);

      assert.equal(array[array.length - 1], newElement);
      assert.equal(array.length, originalLength + 1);

      array.pop(newElement);
    } catch(error) {
      assert.fail("Exception when trying to verify that this array was mutable: " + JSON.stringify(array));
    }
  }

  function assertIsArray(array) {
    assert(array instanceof Array, "Expected an Array, but did not get one. Got: " + JSON.stringify(array))
  }
};
