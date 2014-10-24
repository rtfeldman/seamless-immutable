var Immutable = require("../seamless-immutable.js");
var JSC       = require("jscheck");

var timeoutMs = 3000;

function isEqual(expected, actual) {
  if ((expected instanceof Array) && (actual instanceof Array)) {
    if (expected.length !== actual.length) {
      return false;
    }

    for (var index in expected) {
      if (!isEqual(expected[index], actual[index])) {
        return false;
      }
    }

    return true;
  } else if ((typeof expected === "object") && (typeof actual === "object")) {
    if (expected === null || actual === null) {
      return expected === actual;
    }

    for (var key in expected) {
      if (!isEqual(expected[key], actual[key])) {
        return false;
      }
    }

    for (var key in actual) {
      if (!isEqual(actual[key], expected[key])) {
        return false;
      }
    }

    return true;
  } else {
    return (expected === actual) || (isNaN(expected) && isNaN(actual));
  }
}

function throwsException(exceptionType, logic) {
  try {
    logic()
  } catch (err) {
    return err instanceof exceptionType;
  }

  return false;
}

function identityFunction(obj){ return obj; }

function returnsImmutable(methodName, immutableArray, mutableArray, args) {
  var mutableResult   =   mutableArray[methodName].apply(mutableArray,   args);
  var immutableResult = immutableArray[methodName].apply(immutableArray, args);

  return isEqual(immutableResult, Immutable(mutableResult));
}

function ImmutableArraySpecifier(JSC) {
  var args = Array.prototype.slice.call(arguments);

  return function generator() {
    var mutable = JSC.array.apply(JSC.array, args)();

    return Immutable(mutable);
  }
}

// Build a nodeunit test suite from claims.
function testClaims(suiteName, claims, claimToPredicate) {
  describe(suiteName, function() {
    for (var description in claims) {
      (function(description) {
        var claim = claims[description];

        it(description, function() {
          var predicate = claimToPredicate(claim);
          var completedChecks = 0;

          JSC.on_pass(function() {
            completedChecks++;
          }).on_fail(function(failedClaim) {
            completedChecks++;
            expect(false).toBe(true, failedClaim.name +
              " with args: " + JSON.stringify(failedClaim.args));
          }).on_lost(function(lostClaim) {
            completedChecks++;
            expect(false).toBe(true, lostClaim.name +
              " due to being lost, with args: " + JSON.stringify(lostClaim.args));
          });

          JSC.claim(description, predicate, [JSC.array()].concat(claim.specifiers || []));
          JSC.check(timeoutMs);

          expect(completedChecks).toBe(100);

          JSC.clear();
        });
      })(description);
    };
  });
}

module.exports = {
  isEqual:                 isEqual,
  identityFunction:        identityFunction,
  returnsImmutable:        returnsImmutable,
  throwsException:         throwsException,
  ImmutableArraySpecifier: ImmutableArraySpecifier,
  testClaims:              testClaims
}