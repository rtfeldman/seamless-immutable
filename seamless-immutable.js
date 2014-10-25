(function(){
  "use strict";

  function addPropertyTo(target, methodName, value) {
    Object.defineProperty(target, methodName, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: value
    });
  }

  function banProperty(target, methodName) {
    addPropertyTo(target, methodName, function() {
      throw new ImmutableError("The " + methodName +
        " method cannot be invoked on an ImmutableArray.");
    });
  }

  var immutabilityTag = "__immutable_invariants_hold";

  function addImmutabilityTag(target) {
    addPropertyTo(target, immutabilityTag, true);
  }

  function isImmutable(target) {
    if (typeof target === "object") {
      return target === null || target.hasOwnProperty(immutabilityTag);
    } else {
      // Only objects are even potentially mutable.
      return true;
    }
  }

  var mutatingObjectMethods = [
    "setPrototypeOf"
  ];

  var nonMutatingObjectMethods = [
    "keys"
  ];

  var mutatingArrayMethods = mutatingObjectMethods.concat([
    "push", "pop", "sort", "splice", "shift", "unshift", "reverse"
  ]);

  var nonMutatingArrayMethods = nonMutatingObjectMethods.concat([
    "map", "filter", "slice", "concat", "reduce", "reduceRight"
  ]);

  function ImmutableError() {}
  ImmutableError.prototype = Error.prototype;

  function makeImmutable(obj, bannedMethods) {
    // Make all mutating methods throw exceptions.
    for (var index in bannedMethods) {
      banProperty(obj, bannedMethods[index]);
    }

    // Tag it so we can quickly tell it's immutable later.
    addImmutabilityTag(obj);

    // Freeze it and return it.
    Object.freeze(obj);

    return obj;
  }

  function makeMethodReturnImmutable(obj, methodName) {
    var currentMethod = obj[methodName];

    addPropertyTo(obj, methodName, function() {
      return Immutable(currentMethod.apply(obj, arguments));
    })
  }

  function makeImmutableArray() {
    var result = [];

    // Populate the array before it gets frozen.
    for (var index in arguments) {
      result.push(Immutable(arguments[index]));
    }

    // Don't change their implementations, but wrap these functions to make sure
    // they always return an immutable value.
    for (var index in nonMutatingArrayMethods) {
      var methodName = nonMutatingArrayMethods[index];
      makeMethodReturnImmutable(result, methodName);
    }

    return makeImmutable(result, mutatingArrayMethods);
  }

  /**
   * Returns an Immutable Object containing the properties and values of both
   * this object and the provided object, prioritizing the provided object's
   * values whenever the same key is present in both objects.
   *
   * @param {object} other - The other object to merge. Multiple objects can be passed, either as an array or as extra arguments. In such a case, the later an object appears in that list, the higher its priority.
   */
  function merge(arg) {
    // Calling .merge() with no arguments is a no-op. Don't bother cloning.
    if (arguments.length === 0) {
      return this;
    }

    var result = {};

    for (var key in this) {
      result[key] = this[key];
    }

    var others;

    if (arg instanceof Array) {
      others = arg;
    } else {
      others = arguments;
    }

    // Loop through the other objects in order, achieving prioritization by
    // overwriting any preexisting values that get in the way.
    for (var index in others) {
      var other = others[index];

      for (var key in other) {
        result[key] = other[key];
      }
    }

    return makeImmutableObject(result);
  };

  // Finalizes an object with immutable methods, freezes it, and returns it.
  function makeImmutableObject(obj) {
    addPropertyTo(obj, "merge", merge);

    return makeImmutable(obj, mutatingObjectMethods);
  }

  function Immutable(obj) {
    // If the user passes multiple arguments, assume what they want is an array.
    if (arguments.length > 1) {
      return makeImmutableArray.apply(makeImmutableArray, arguments);
    } else if (isImmutable(obj)) {
      return obj;
    } else if (obj instanceof Array) {
      return makeImmutableArray.apply(makeImmutableArray, obj);
    } else {
      // Don't freeze the object we were given; make a clone and use that.
      var clone = {};

      if (obj !== null && obj !== undefined) {
        for (var key in obj) {
          clone[key] = Immutable(obj[key]);
        }
      }

      return makeImmutableObject(clone);
    }
  }

  // Export the library
  Immutable.isImmutable    = isImmutable;
  Immutable.ImmutableError = ImmutableError;

  Object.freeze(Immutable);

  if (typeof module === "object") {
    module.exports = Immutable;
  } else if (typeof exports === "object") {
    exports.Immutable = Immutable;
  } else if (typeof window === "object") {
    window.Immutable = Immutable;
  } else if (typeof global === "object") {
    global.Immutable = Immutable;
  }
})();