var Immutable = require("./seamless-immutable.js");

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
function testSuiteFromClaims(JSC, claims, claimToPredicate) {
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
  }).on_lost(function(lostClaim) {
    var test = testObjectsByName[lostClaim.name];
    test.ok(false, lostClaim.name +
      " due to being lost, with args: " + JSON.stringify(lostClaim.args));
  });

  for (var description in claims) {
    (function(description) {
      var claim = claims[description];

      testSuite[description] = function(test) {
        testObjectsByName[description] = test;

        test.expect(100);

        var predicate = claimToPredicate(claim);

        JSC.claim(description, predicate, [JSC.array()].concat(claim.specifiers || []));
        JSC.check(timeoutMs);
        JSC.clear();

        test.done();
      }
    })(description);
  };

  return testSuite;
}

module.exports = {
  isEqual:                 isEqual,
  identityFunction:        identityFunction,
  returnsImmutable:        returnsImmutable,
  throwsException:         throwsException,
  ImmutableArraySpecifier: ImmutableArraySpecifier,
  testSuiteFromClaims:     testSuiteFromClaims
}