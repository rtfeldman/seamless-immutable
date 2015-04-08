var JSC       = require("jscheck");
var assert    = require("chai").assert;
var _         = require("lodash");

module.exports = function(config) {
  var Immutable = require(config.src);
  var TestUtils = require("../TestUtils.js")(Immutable);
  var check     = TestUtils.check;

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
