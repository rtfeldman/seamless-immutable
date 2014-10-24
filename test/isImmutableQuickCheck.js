var Immutable = require("../seamless-immutable.js");
var TestUtils = require("../TestUtils.js");
var JSC       = require("jscheck");

var immutabilityByType = {
  "ImmutableArrays": [true,  TestUtils.ImmutableArraySpecifier(JSC)],
  "strings":         [true,  JSC.string()],
  "numbers":         [true,  JSC.number()],
  "booleans":        [true,  JSC.boolean()],
  "undefined":       [true,  JSC.literal(undefined)],
  "null":            [true,  JSC.literal(null)],
  "objects":         [false, JSC.object()],
  "arrays":          [false, JSC.array()]
};

var claims = {}

for (var type in immutabilityByType) {
  (function(type) {
    var tuple = immutabilityByType[type];
    var expectedToBeImmutable = tuple[0];
    var description;

    if (expectedToBeImmutable) {
      description = "it recognizes " + type + " as immutable"
    } else {
      description = "it recognizes " + type + " as MUTABLE"
    }

    claims[description] = {
      predicate: function(throwaway, obj) {
        return Immutable.isImmutable(obj) === expectedToBeImmutable;
      },
      specifiers: [tuple[1]]
    };
  })(type);
}

module.exports = TestUtils.testSuiteFromClaims(JSC, claims, 
  function(claim) {
    return function(verdict, arrayConstructorArgs) {
      var argsWithoutVerdict = Array.prototype.slice.call(arguments, 1);

      verdict(claim.predicate.apply(claim, argsWithoutVerdict));
    };
  });