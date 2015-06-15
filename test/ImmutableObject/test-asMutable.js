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

      it("does not throw an error when asMutable deep = true is called on an Immutable with a nested date", function() {
          check(100, [ TestUtils.TraversableObjectSpecifier ], function(obj) {
              var test = Immutable({ testDate: new Date()});
              test.asMutable({deep: true});
          });
      });
  });
};
