(function(){
  "use strict";

  // TODO: make it immutable
  function ImmutableError(message) {
    this.name    = "ImmutableError";
    this.message = (message || "");
  }

  ImmutableError.prototype = Error.prototype;

  function makeImmutableArray() {
    return Array.prototype.slice.call(arguments);
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