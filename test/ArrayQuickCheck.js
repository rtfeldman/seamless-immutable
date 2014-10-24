var Immutable = require("../seamless-immutable.js");
var JSC       = require("jscheck");

timeoutMs = 3000;

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

  "it has a toString() method that works like a regular array's toString()": {
    predicate: function(array, args) {
      return isEqual(array.toString(), args.toString());
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

  "it is tagged as immutable": {
    predicate: function(array, args) {
      return Immutable.isImmutable(array);
    }
  },

  "it cannot have its elements directly mutated": {
    predicate: function(array, args, randomIndex, randomData) {
      array[randomIndex] = randomData;

      return (typeof randomIndex === "number") &&
        array.length === args.length &&
        isEqual(array[randomIndex], args[randomIndex]);
    },
    specifiers: [JSC.integer(), JSC.any()]
  },

  "it makes nested content immutable as well": {
    predicate: function(array, args, innerArray, obj) {
      args.push(innerArray); // Make a nested array
      args.push(obj); // Get an object in there too

      array = Immutable.Array.apply(Immutable.Array, args);

      if (array.length !== args.length) {
        return false;
      }

      for (var index in args) {
        if (!Immutable.isImmutable(array[index])) {
          return false;
        }
      }

      return true;
    },
    specifiers: [JSC.array(), JSC.object()]
  },

  // TODO this never fails under Node, even after removing Immutable.Array's
  // call to toImmutable(). Need to verify that it can fail in browsers.
  "it reuses existing immutables during construction": {
    predicate: function(array, args, innerArray, obj) {
      args.push(innerArray); // Make a nested array
      args.push(obj); // Get an object in there too

      array = Immutable.Array.apply(Immutable.Array, args);

      var copiedArray = Immutable.Array.apply(Immutable.Array, array);

      if (copiedArray.length !== array.length) {
        return false;
      }

      for (var index in copiedArray) {
        var expected = array[index];
        var actual   = copiedArray[index];

        if ((expected !== actual) &&
          (expected === expected) &&
          (actual === actual)) {
          return false;
        }
      }

      return true;
    },
    specifiers: [JSC.array(), JSC.object()]
  }
};


[ // Add a "reports banned" claim for each mutating method on Array.
  "setPrototypeOf", "push", "pop", "sort", "splice", "shift", "unshift", "reverse"
].forEach(function(methodName) {
  var description = "it throws an ImmutableError when you try to call its " +
    methodName + "() method";

  claims[description] = {
    predicate: function(array, args, methodArgs) {
      return throwsException(Immutable.ImmutableError, function() {
        array[methodName].apply(array, methodArgs);
      });
    },
    specifiers: [JSC.any()]
  };
});

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