var Immutable = require("../seamless-immutable.js");
var JSC       = require("jscheck");

timeoutMs = 3000;

function isEqual(expected, actual) {
  if ((expected instanceof Array) && (actual instanceof Array)) {
    for (var index in expected) {
      if (!isEqual(expected[index], actual[index])) {
        return false;
      }

      return true;
    }
  } else {
    return expected === actual || (isNaN(expected) && isNaN(actual));
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

var claims = {
  "it is an instanceof Array": {
    predicate: function(array, args) {
      return array instanceof Array;
    }
  },

  "it has the same length as the length of its constructor args": {
    predicate: function(array, args) {
      return array.length === args.length;
    }
  },

  "it supports accessing elements by index via []": {
    predicate: function(array, args, randomIndex) {
      return (typeof randomIndex === "number") &&
        isEqual(array[randomIndex], args[randomIndex]);
    },
    specifiers: [JSC.integer()]
  },

  "it works with for loops": {
    predicate: function(array, args) {
      for (var index=0; index < array.length; index++) {
        if (!isEqual(array[index], args[index])) {
          return false;
        }
      }

      return true;
    }
  },

  "it works with for..in loops": {
    predicate: function(array, args) {
      for (var index in array) {
        if (!isEqual(array[index], args[index])) {
          return false;
        }
      }

      return true;
    }
  },

  "it supports concat": {
    predicate: function(array, args, otherArray) {
      return isEqual(array.concat(otherArray), args.concat(otherArray));
    },
    specifiers: [JSC.array()]
  },

  "it supports being an argument to a normal array's concat": {
    predicate: function(array, args, otherArray) {
      return isEqual(otherArray.concat(array), otherArray.concat(args));
    },
    specifiers: [JSC.array()]
  },

  "it can be concatted to itself": {
    predicate: function(array, args) {
      return isEqual(array.concat(array), args.concat(args));
    }
  },

  "it supports being passed to JSON.stringify": {
    predicate: function(array, args) {
      return isEqual(JSON.stringify(array), JSON.stringify(args));
    }
  },

  "it is frozen": {
    predicate: function(array, args) {
      return Object.isFrozen(array);
    }
  },

  "it cannot have elements mutated": {
    predicate: function(array, args, randomIndex, randomData) {
      array[randomIndex] = randomData;

      return (typeof randomIndex === "number") &&
        array.length === args.length &&
        isEqual(array[randomIndex], args[randomIndex]);
    },
    specifiers: [JSC.integer(), JSC.any()]
  },

  "it throws an ImmutableError when you try to call its push() method": {
    predicate: function(array, args, pushArgs) {
      return throwsException(Immutable.ImmutableError, function() {
        array.push.apply(array, pushArgs);
      });
    },
    specifiers: [JSC.array()]
  },


  "it throws an ImmutableError when you try to call its sort() method": {
    predicate: function(array, args) {
      return throwsException(Immutable.ImmutableError, function() {
        array.sort();
      });
    }
  },

  "it throws an ImmutableError when you try to call its splice() method": {
    predicate: function(array, args, spliceArg) {
      return throwsException(Immutable.ImmutableError, function() {
        array.splice(spliceArg);
      });
    },
    specifiers: [JSC.any()]
  },

  "it throws an ImmutableError when you try to call its shift() method": {
    predicate: function(array, args, shiftArg) {
      return throwsException(Immutable.ImmutableError, function() {
        array.shift(shiftArg);
      });
    },
    specifiers: [JSC.any()]
  },

  "it throws an ImmutableError when you try to call its unshift() method": {
    predicate: function(array, args, unshiftArgs) {
      return throwsException(Immutable.ImmutableError, function() {
        array.unshift.apply(array, unshiftArgs);
      });
    },
    specifiers: [JSC.array()]
  },

  "it throws an ImmutableError when you try to call its reverse() method": {
    predicate: function(array, args) {
      return throwsException(Immutable.ImmutableError, function() {
        array.reverse();
      });
    }
  },
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

for (var description in claims) {
  (function(description) {
    var claim = claims[description];

    testSuite[description] = function(test) {
      testObjectsByName[description] = test;

      test.expect(100);

      var predicate = function(verdict, arrayConstructorArgs) {
        var argsWithoutVerdict = Array.prototype.slice.call(arguments, 1);
        var immutableArray = Immutable.Array.apply(Immutable.Array, arrayConstructorArgs);
        var newArgs = [immutableArray].concat(argsWithoutVerdict);
        var result = claim.predicate.apply(claim, newArgs);

        verdict(result);
      };

      JSC.claim(description, predicate, [JSC.array()].concat(claim.specifiers || []));
      JSC.check(timeoutMs);
      JSC.clear();

      test.done();
    }
  })(description);
};

module.exports = testSuite;