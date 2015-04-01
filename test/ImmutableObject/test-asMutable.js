var Immutable = require("../../seamless-immutable.development.js");
var JSC       = require("jscheck");
var TestUtils = require("../TestUtils.js");
var assert    = require("chai").assert;
var _         = require("lodash")
var check     = TestUtils.check;

module.exports = function() {
  describe("#asMutable", function() {
    it("returns a shallow mutable copy if not provided the deep flag", function() {
      check(100, [ TestUtils.TraversableObjectSpecifier ], function(obj) {
        var immutable = Immutable(obj);
        var mutable = immutable.asMutable();
        assert.isFalse(Immutable.isImmutable(mutable));
        TestUtils.assertIsDeeplyImmutable(mutable.complex);
        TestUtils.assertIsDeeplyImmutable(mutable.deep.complex);
        assert.deepEqual(immutable,mutable);
      })
    })

    it("returns a deep mutable copy if provided the deep flag", function() {
      check(100, [ TestUtils.TraversableObjectSpecifier ], function(obj) {
        var immutable = Immutable(obj);
        var mutable = immutable.asMutable({ deep: true });
        assert.isFalse(Immutable.isImmutable(mutable));
        assert.isFalse(Immutable.isImmutable(mutable['complex']));
        assert.isFalse(Immutable.isImmutable(mutable['deep']['complex']));
        assert.deepEqual(immutable,mutable);
      });
    });
  });
  }; 
