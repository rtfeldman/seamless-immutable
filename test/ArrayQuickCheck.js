var Immutable = require("../seamless-immutable.js");
var JSC       = require("jscheck");
var TestUtils = require("../TestUtils.js");

var isEqual          = TestUtils.isEqual;
var throwsException  = TestUtils.throwsException;
var identityFunction = TestUtils.identityFunction;

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
      predicate: function(array, args) {
        var methodArgs = Array.prototype.slice.call(arguments, 2);
        return TestUtils.returnsImmutable(methodName, array, args, methodArgs);
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

module.exports = TestUtils.testSuiteFromClaims(JSC, claims, 
  function(claim) {
    return function(verdict, arrayConstructorArgs) {
      var argsWithoutVerdict = Array.prototype.slice.call(arguments, 1);
      var immutableArray = Immutable.Array.apply(Immutable.Array, arrayConstructorArgs);
      var newArgs = [immutableArray].concat(argsWithoutVerdict);
      var result = claim.predicate.apply(claim, newArgs);

      verdict(result);
    };
  });