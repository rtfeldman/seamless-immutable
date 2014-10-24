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

  function addImmutabilityTag(target) {
    addPropertyTo(target, "__immutable_invariants_hold", true);
  }

  var privateArrayMethods = [
    "push", "sort", "splice", "shift", "unshift", "reverse"
  ];

  function ImmutableError(message) {
    this.name    = "ImmutableError";
    this.message = (message || "");
  }

  ImmutableError.prototype = Error.prototype;

  function makeImmutableArray() {
    var result = [];

    // Fill the array while it still supports push().
    result.push.apply(result, arguments);

    // Make all mutating methods throw exceptions.
    for (var index in privateArrayMethods) {
      (function(methodName) {
        addPropertyTo(result, methodName, function() {
          throw new ImmutableError("The " + methodName +
            " method cannot be invoked on an ImmutableArray.");
        });
      })(privateArrayMethods[index]);
    }

    // Tag it so we can quickly tell it's immutable later.
    addImmutabilityTag(result);

    // Freeze it and return it.
    Object.freeze(result);
    return result;
  }

  // TODO: make it immutable
  function makeImmutableMap(obj) {
    return obj;
  }

  // Export the library

  var Immutable = {
    Array:          makeImmutableArray,
    Map:            makeImmutableMap,
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