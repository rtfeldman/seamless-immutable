var Immutable = require("../../seamless-immutable.js");
var JSC       = require("jscheck");
var TestUtils = require("../TestUtils.js");
var assert    = require("chai").assert;
var _         = require("lodash")
var check     = TestUtils.check;

describe("#toMutable", function() {
  it("returns a mutable copy of the given immutable object", function() {
    check(100, [JSC.array( JSC.integer(0,10), JSC.one_of([JSC.any(), JSC.array() ] ) )], function(array) {
      immutable = Immutable(array)
      mutable = immutable.toMutable()
      assert.isFalse( Immutable.isImmutable(mutable) )
      assert.deepEqual(immutable,mutable)
    })
  })
})   
