var Immutable = require("../seamless-immutable.js");
var JSC       = require("jscheck");
var assert    = require("chai").assert;

function assertImmutable(methodName, immutableArray, mutableArray, args) {
  var mutableResult   =   mutableArray[methodName].apply(mutableArray,   args);
  var immutableResult = Immutable(immutableArray[methodName].apply(immutableArray, args));

  assert.deepEqual(immutableResult, mutableResult);
}

function ImmutableArraySpecifier(JSC) {
  var args = Array.prototype.slice.call(arguments);

  return function generator() {
    var mutable = JSC.array.apply(JSC.array, args)();

    return Immutable(mutable);
  }
}

function check(runs, generators, runTest) {
  var completed;

  for (completed=0; completed < runs; completed++) {
    var generated = generators.map(function(generator) { return generator() });

    runTest.apply(runTest, generated);
  }

  assert.strictEqual(completed, runs,
    "The expected " + runs + " runs were not completed.");

  return completed;
}

function checkImmutableMutable(runs, specifiers) {
  return function(callback, extraSpecifiers) {
    extraSpecifiers = extraSpecifiers || [];

    check(runs, specifiers.concat(extraSpecifiers), function(mutable) {
      var immutable = Immutable(mutable);
      var args      = Array.prototype.slice.call(arguments);

      callback.apply(callback, [immutable].concat(args));
    });
  };
}

module.exports = {
  assertImmutable:         assertImmutable,
  ImmutableArraySpecifier: ImmutableArraySpecifier,
  check:                   check,
  checkImmutableMutable:   checkImmutableMutable
}