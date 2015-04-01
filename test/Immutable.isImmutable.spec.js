var Immutable = require("../seamless-immutable.development.js");
var TestUtils = require("./TestUtils.js");
var JSC       = require("jscheck");
var _         = require("lodash");
var assert    = require("chai").assert;

describe("Immutable.isImmutable", function() {
  _.each({
    "ImmutableArrays": [true,  TestUtils.ImmutableArraySpecifier(JSC)],
    "strings":         [true,  JSC.string()],
    "numbers":         [true,  JSC.number()],
    "booleans":        [true,  JSC.boolean()],
    "undefined":       [true,  JSC.literal(undefined)],
    "null":            [true,  JSC.literal(null)],
    "objects":         [false, JSC.object()],
    "arrays":          [false, JSC.array()]
  }, function(tuple, type) {
    var expectImmutable = tuple[0];
    var specifier       = tuple[1];

    it("recognizes " + type + (expectImmutable ? " as immutable" : " as MUTABLE"), function() {
      TestUtils.check(100, [specifier], function(value) {    
        assert.strictEqual(expectImmutable, Immutable.isImmutable(value));
      });
    });
  });
});
