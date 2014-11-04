var Immutable = require("../../seamless-immutable.js");
var JSC       = require("jscheck");
var TestUtils = require("../TestUtils.js");
var assert    = require("chai").assert;
var _         = require("lodash")
var check     = TestUtils.check;

describe("#toMutable", function() {
  it("returns a shallow mutable copy if not provided the deep flag", function() {
    check(100, [ TestUtils.TraversableObjectSpecifier ], function(obj) {
      immutable = Immutable(obj)
      mutable = immutable.toMutable()
      assert.isFalse( Immutable.isImmutable(mutable) )
      assert.isTrue( Immutable.isImmutable(mutable['complex']) )
      assert.isTrue( Immutable.isImmutable(mutable['deep']['complex']) )

      assert.deepEqual(immutable,mutable)
    })
  })

  it("returns a deep mutable copy if provided the deep flag", function() {
    check(100, [ TestUtils.TraversableObjectSpecifier ], function(obj) {
      immutable = Immutable(obj)
      mutable = immutable.toMutable({ deep: true })
      assert.isFalse( Immutable.isImmutable(mutable) )
      assert.isFalse( Immutable.isImmutable(mutable['complex']) )
      assert.isFalse( Immutable.isImmutable(mutable['deep']['complex']) )

      assert.deepEqual(immutable,mutable)
    })
  })
})   
