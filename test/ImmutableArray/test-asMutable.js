var JSC          = require("jscheck");
var assert       = require("chai").assert;
var _            = require("lodash");
var getTestUtils = require("../TestUtils.js");

module.exports = function(config) {
  var Immutable = config.implementation;
  var TestUtils = getTestUtils(Immutable);
  var check     = TestUtils.check;

  describe("#asMutable", function() {
    it("returns a shallow mutable copy if not provided the deep flag", function() {
      check(100, [ JSC.array([TestUtils.TraversableObjectSpecifier, JSC.any()]) ], function(array) {
        var immutable = Immutable(array);
        var mutable = immutable.asMutable();
        assert.isFalse( Immutable.isImmutable(mutable));
        TestUtils.assertIsDeeplyImmutable(mutable[0]);
        TestUtils.assertIsDeeplyImmutable(mutable[0].deep);
        assert.deepEqual(immutable,mutable);
      });

    });

    it("returns a deep mutable copy if provided the deep flag", function() {
      check(100, [ JSC.array([TestUtils.TraversableObjectSpecifier, JSC.any()]) ], function(array) {
        var immutable = Immutable(array);
        var mutable = immutable.asMutable({ deep: true });
        assert.isFalse( Immutable.isImmutable(mutable));
        assert.isFalse( Immutable.isImmutable(mutable[0]));
        assert.isFalse( Immutable.isImmutable(mutable[0]['deep']));
        assert.deepEqual(immutable,mutable);
      });
    });
  });  
};
