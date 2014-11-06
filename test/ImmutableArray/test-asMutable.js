var Immutable = require("../../seamless-immutable.js");
var JSC       = require("jscheck");
var TestUtils = require("../TestUtils.js");
var assert    = require("chai").assert;
var _         = require("lodash")
var check     = TestUtils.check;

module.exports = function() {
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