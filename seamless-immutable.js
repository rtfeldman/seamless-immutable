(function(){
  "use strict";

  function addMethodTo(target, methodName, implementation) {
    Object.defineProperty(target, methodName, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: implementation
    });
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
        addMethodTo(result, methodName, function() {
          throw new ImmutableError("The " + methodName +
            " method cannot be invoked on an ImmutableArray.");
        });
      })(privateArrayMethods[index]);
    }

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