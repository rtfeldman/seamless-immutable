var Immutable = require("../seamless-immutable.js");

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

  return isEqual(immutableResult, Immutable.toImmutable(mutableResult));
}

function ImmutableArraySpecifier(JSC) {
  var args = Array.prototype.slice.call(arguments);

  return function generator() {
    var array = JSC.array.apply(JSC.array, args)();

    return Immutable.Array.apply(Immutable.Array, array);
  }
}

// Build a nodeunit test suite from claims.
function testSuiteFromClaims(suiteName, JSC, claims, claimToPredicate) {
  describe(suiteName, function() {
    for (var description in claims) {
      (function(description) {
        var claim = claims[description];

        it(description, function() {
          var predicate = claimToPredicate(claim);
          var resultSpy = jasmine.createSpy('JSCheck result');

          JSC.on_pass(function() {
            total += 1
          }).on_fail(function(failedClaim) {
            expect(false).toBe(true, failedClaim.name +
              " with args: " + JSON.stringify(failedClaim.args));
          }).on_lost(function(lostClaim) {
            expect(false).toBe(true, lostClaim.name +
              " due to being lost, with args: " + JSON.stringify(lostClaim.args));
          }).on_result(resultSpy);

          JSC.claim(description, predicate, [JSC.array()].concat(claim.specifiers || []));
          JSC.check(timeoutMs);

          var result = resultSpy.calls.mostRecent().args[0];

          expect(result.total).toBe(100);
          expect(result.ok).toBe(true);

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
  testSuiteFromClaims:     testSuiteFromClaims
}