var Immutable = require("../../seamless-immutable.js");
var JSC       = require("jscheck");
var TestUtils = require("../TestUtils.js");
var assert    = require("chai").assert;
var _         = require("lodash")
var check     = TestUtils.check;

module.exports = function() {
  describe("#toMutable", function() {
    it("returns a shallow mutable copy if not provided the deep flag", function() {
      check(100, [ JSC.array([TestUtils.TraversableObjectSpecifier, JSC.any()]) ], function(array) {
        immutable = Immutable(array);
        mutable = immutable.toMutable();
        assert.isFalse( Immutable.isImmutable(mutable));
        assert.isTrue( Immutable.isImmutable(mutable[0]));
        assert.isTrue( Immutable.isImmutable(mutable[0]['deep']));
        assert.deepEqual(immutable,mutable);
      });

    });

    it("returns a deep mutable copy if provided the deep flag", function() {
      check(100, [ JSC.array([TestUtils.TraversableObjectSpecifier, JSC.any()]) ], function(array) {
        immutable = Immutable(array);
        mutable = immutable.toMutable({ deep: true });
        assert.isFalse( Immutable.isImmutable(mutable));
        assert.isFalse( Immutable.isImmutable(mutable[0]));
        assert.isFalse( Immutable.isImmutable(mutable[0]['deep']));
        assert.deepEqual(immutable,mutable);
      });
    });
  });  
};