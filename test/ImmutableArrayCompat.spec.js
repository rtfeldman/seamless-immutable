var Immutable = require("../seamless-immutable.js");
var JSC       = require("jscheck");
var TestUtils = require("./TestUtils.js");

var isEqual          = TestUtils.isEqual;
var throwsException  = TestUtils.throwsException;
var identityFunction = TestUtils.identityFunction;

var claims = {
  "it is an instanceof Array": {
    predicate: function(immutable, mutable) {
      return immutable instanceof Array;
    }
  },

  "it has the same length as its mutable equivalent": {
    predicate: function(immutable, mutable) {
      return immutable.length === mutable.length;
    }
  },

  "it supports accessing elements by index via []": {
    predicate: function(immutable, mutable, randomIndex) {
      return (typeof randomIndex === "number") &&
        isEqual(immutable[randomIndex], mutable[randomIndex]);
    },
    specifiers: [JSC.integer()]
  },

  "it works with for loops": {
    predicate: function(immutable, mutable) {
      for (var index=0; index < immutable.length; index++) {
        if (!isEqual(immutable[index], mutable[index])) {
          return false;
        }
      }

      return true;
    }
  },

  "it works with for..in loops": {
    predicate: function(immutable, mutable) {
      for (var index in immutable) {
        if (!isEqual(immutable[index], mutable[index])) {
          return false;
        }
      }

      return true;
    }
  },

  "it supports concat": {
    predicate: function(immutable, mutable, otherArray) {
      return isEqual(immutable.concat(otherArray), mutable.concat(otherArray));
    },
    specifiers: [JSC.array()]
  },

  "it supports being an argument to a normal immutable's concat": {
    predicate: function(immutable, mutable, otherArray) {
      return isEqual(otherArray.concat(immutable), otherArray.concat(mutable));
    },
    specifiers: [JSC.array()]
  },

  "it can be concatted to itself": {
    predicate: function(immutable, mutable) {
      return isEqual(immutable.concat(immutable), mutable.concat(mutable));
    }
  },

  "it has a toString() method that works like a regular immutable's toString()": {
    predicate: function(immutable, mutable) {
      return isEqual(immutable.toString(), mutable.toString());
    }
  },

  "it supports being passed to JSON.stringify": {
    predicate: function(immutable, mutable) {
      return isEqual(JSON.stringify(immutable), JSON.stringify(mutable));
    }
  },

  "it is frozen": {
    predicate: function(immutable, mutable) {
      return Object.isFrozen(immutable);
    }
  },

  "it is tagged as immutable": {
    predicate: function(immutable, mutable) {
      return Immutable.isImmutable(immutable);
    }
  },

  "it cannot have its elements directly mutated": {
    predicate: function(immutable, mutable, randomIndex, randomData) {
      immutable[randomIndex] = randomData;

      return (typeof randomIndex === "number") &&
        immutable.length === mutable.length &&
        isEqual(immutable[randomIndex], mutable[randomIndex]);
    },
    specifiers: [JSC.integer(), JSC.any()]
  },

  "it makes nested content immutable as well": {
    predicate: function(immutable, mutable, innerArray, obj) {
      mutable.push(innerArray); // Make a nested immutable
      mutable.push(obj); // Get an object in there too

      immutable = Immutable(mutable);

      if (immutable.length !== mutable.length) {
        return false;
      }

      for (var index in mutable) {
        if (!Immutable.isImmutable(immutable[index])) {
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
    predicate: function(immutable, mutable, innerArray, obj) {
      mutable.push(innerArray); // Make a nested immutable
      mutable.push(obj); // Get an object in there too

      immutable = Immutable(mutable);

      var copiedArray = Immutable(immutable);

      if (copiedArray.length !== immutable.length) {
        return false;
      }

      for (var index in copiedArray) {
        var expected = immutable[index];
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

// Add a "returns immutable" claim for each non-mutating method on Array.
nonMutatingArrayMethods = {
  map:         [JSC.literal(identityFunction)],
  filter:      [JSC.literal(identityFunction)],
  reduce:      [JSC.literal(identityFunction), JSC.any()],
  reduceRight: [JSC.literal(identityFunction), JSC.any()],
  concat:      [JSC.array()],
  slice:       [JSC.integer(), JSC.integer()]
}

for (methodName in nonMutatingArrayMethods) {
  (function(methodName, specifiers) {
    var description = "it returns only immutables when you call its " +
      methodName + "() method";

    claims[description] = {
      predicate: function(immutable, mutable) {
        var methodArgs = Array.prototype.slice.call(arguments, 2);
        return TestUtils.returnsImmutable(methodName, immutable, mutable, methodArgs);
      },
      specifiers: specifiers
    };
  })(methodName, nonMutatingArrayMethods[methodName]);
}

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

TestUtils.testClaims('ImmutableArray', claims,
  function(claim) {
    return function(verdict, mutable) {
      var argsWithoutVerdict = Array.prototype.slice.call(arguments, 1);
      var immutableArray = Immutable(mutable);
      var newArgs = [immutableArray].concat(argsWithoutVerdict);
      var result = claim.predicate.apply(claim, newArgs);

      verdict(result);
    };
  });