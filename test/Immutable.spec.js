var Immutable = require("../seamless-immutable.js");
var JSC       = require("jscheck");
var TestUtils = require("./TestUtils.js");

var isEqual          = TestUtils.isEqual;
var throwsException  = TestUtils.throwsException;
var identityFunction = TestUtils.identityFunction;

var claims = {
  "it converts multiple arguments into an array, but leaves single arguments alone": {
    predicate: function(immutable, args) {
      var result = Immutable.apply(Immutable, args);

      if (args.length > 1) {
        return isEqual(result, Immutable(args));
      } else {
        return isEqual(result, args[0]);
      }
    },
    specifiers: [JSC.array()]
  },

  "it makes an Immutable Array when passed a mutable array": {
    predicate: function(immutable, mutable) {
      return immutable.length === mutable.length
        &&  isEqual(immutable, mutable)
        &&  Immutable.isImmutable(immutable)
        && !Immutable.isImmutable(mutable);
    },
    specifiers: [JSC.array()]
  },

  "it makes an Immutable Object when passed a mutable object": {
    predicate: function(immutable, mutable, obj) {
      immutable = Immutable(obj);

      return (typeof immutable === "object") &&
        Immutable.isImmutable(immutable) &&
       !Immutable.isImmutable(mutable);
    },
    specifiers: [JSC.object()]
  }
}

// These are already immutable, and should pass through Immutable() untouched.
var passThroughSpecifiers = {
  "string":    JSC.string(),
  "number":    JSC.number(),
  "boolean":   JSC.boolean(),
  "null":      JSC.literal(null),
  "undefined": JSC.literal(undefined)
}

for (var type in passThroughSpecifiers) {
  var specifier = passThroughSpecifiers[type];
  var description = "it just returns its argument when passed " +
    "a value of type " + type;

  claims[description] = {
    predicate: function(value) {
      return Immutable(value) === value
    },
    specifiers: [specifier]
  };
};

TestUtils.testClaims('Immutable()', claims,
  function(claim) {
    return function(verdict, mutable) {
      var argsWithoutVerdict = Array.prototype.slice.call(arguments, 1);
      var immutableArray = Immutable(mutable);
      var newArgs = [immutableArray].concat(argsWithoutVerdict);
      var result = claim.predicate.apply(claim, newArgs);

      verdict(result);
    };
  });