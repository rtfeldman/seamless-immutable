var Immutable = require("../seamless-immutable.js");
var JSC       = require("jscheck");

timeoutMs = 3000;

function ImmutableArraySpecifier() {
  var args = Array.prototype.slice.call(arguments);

  return function generator() {
    var array = JSC.array.apply(JSC.array, args)();

    return Immutable.Array.apply(Immutable.Array, array);
  }
}

var immutabilityByType = {
  "ImmutableArrays": [true,  ImmutableArraySpecifier()],
  "strings":         [true,  JSC.string()],
  "numbers":         [true,  JSC.number()],
  "booleans":        [true,  JSC.boolean()],
  "undefined":       [true,  JSC.literal(undefined)],
  "null":            [true,  JSC.literal(null)],
  "objects":         [false, JSC.object()],
  "arrays":          [false, JSC.array()]
};

// Build a nodeunit test suite from the claims.
var testSuite = {};
var testObjectsByName = {};

JSC.on_pass(function(passedClaim) {
  var test = testObjectsByName[passedClaim.name];
  test.ok(true, passedClaim.name +
    " with args: " + JSON.stringify(passedClaim.args));
}).on_fail(function(failedClaim) {
  var test = testObjectsByName[failedClaim.name];
  test.ok(false, failedClaim.name +
    " with args: " + JSON.stringify(failedClaim.args));
});

for (var type in immutabilityByType) {
  (function(type) {
    var tuple = immutabilityByType[type];
    var expected = tuple[0];
    var predicate = tuple[1];
    var claim = {
      predicate: function(obj) {
        return Immutable.isImmutable(obj) === expected;
      },
      specifiers: [tuple[1]]
    }

    var description;

    if (expected) {
      description = "it recognizes " + type + " as immutable"
    } else {
      description = "it recognizes " + type + " as MUTABLE"
    }

    testSuite[description] = function(test) {
      testObjectsByName[description] = test;

      test.expect(100);

      var predicate = function(verdict) {
        var argsWithoutVerdict = Array.prototype.slice.call(arguments, 1);
        var result = claim.predicate.apply(claim, argsWithoutVerdict);

        verdict(result);
      };

      JSC.claim(description, predicate, (claim.specifiers || []));
      JSC.check(timeoutMs);
      JSC.clear();

      test.done();
    }
  })(type);
};

module.exports = testSuite;