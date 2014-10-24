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

  var mutatingArrayMethods = mutatingObjectMethods.concat([
    "push", "sort", "splice", "shift", "unshift", "reverse"
  ]);

  function ImmutableError(message) {
    this.name    = "ImmutableError";
    this.message = (message || "");
  }

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

  function makeImmutableArray() {
    var result = [];

    // Populate the array before it gets frozen.
    for (var index in arguments) {
      result.push(toImmutable(arguments[index]));
    }

    return makeImmutable(result, mutatingArrayMethods);
  }

  function toImmutable(obj) {
    if (isImmutable(obj)) {
      return obj;
    } else if (obj instanceof Array) {
      return makeImmutableArray.apply(this, obj);
    } else {
      return makeImmutableMap(obj);
    }
  }

  // TODO: make it immutable
  function makeImmutableMap(obj) {
    return obj;
  }

  // Export the library

  var Immutable = {
    Array:          makeImmutableArray,
    Map:            makeImmutableMap,
    isImmutable:    isImmutable,
    toImmutable:    toImmutable,
    ImmutableError: ImmutableError
  };

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