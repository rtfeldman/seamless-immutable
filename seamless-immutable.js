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

  function makeImmutableArray(array) {
    // Don't change their implementations, but wrap these functions to make sure
    // they always return an immutable value.
    for (var index in nonMutatingArrayMethods) {
      var methodName = nonMutatingArrayMethods[index];
      makeMethodReturnImmutable(array, methodName);
    }

    addPropertyTo(array, "flatMap", flatMap);

    return makeImmutable(array, mutatingArrayMethods);
  }

  /**
   * Effectively performs a map() over the elements in the array, using the
   * provided iterator, except that whenever the iterator returns an array, that
   * array's elements are added to the final result instead of the array itself.
   *
   * @param {function} iterator - The iterator function that will be invoked on each element in the array. It will receive three arguments: the current value, the current index, and the current object.
   */
  function flatMap(iterator) {
    // Calling .flatMap() with no arguments is a no-op. Don't bother cloning.
    if (arguments.length === 0) {
      return this;
    }

    var result = [];

    for (var key in this) {
      var iteratorResult = iterator(this[key], key, this);

      if (iteratorResult instanceof Array) {
        // Concatenate Array results into the return value we're building up.
        result.push.apply(result, iteratorResult);
      } else {
        // Handle non-Array results the same way map() does.
        result.push(iteratorResult);
      }
    }

    return makeImmutableArray(result);
  };

  /**
   * Returns an Immutable Object containing the properties and values of both
   * this object and the provided object, prioritizing the provided object's
   * values whenever the same key is present in both objects.
   *
   * @param {object} other - The other object to merge. Multiple objects can be passed, either as an array or as extra arguments. In such a case, the later an object appears in that list, the higher its priority.
   */
  function merge(others) {
    // Calling .merge() with no arguments is a no-op. Don't bother cloning.
    if (arguments.length === 0) {
      return this;
    }

    var result = {};

    for (var key in this) {
      result[key] = this[key];
    }

    if (!(others instanceof Array)) {
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
      return makeImmutableArray(Array.prototype.slice.call(arguments));
    } else if (isImmutable(obj)) {
      return obj;
    } else if (obj instanceof Array) {
      return makeImmutableArray(obj.slice());
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