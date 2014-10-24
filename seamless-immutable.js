(function(){
  "use strict";

  // TODO: make it immutable
  function makeImmutableArray() {
    return Array.prototype.slice.call(arguments);
  }

  // TODO: make it immutable
  function makeImmutableMap(obj) {
    return obj;
  }

  // Export the library

  var Immutable = {
    Array: makeImmutableArray,
    Map:   makeImmutableMap
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