var JSC       = require("jscheck");
var assert    = require("chai").assert;
var _         = require("lodash");
var deepEqual    = require("deep-equal");

function assertJsonEqual(first, second) {
  if (typeof first === "object" && typeof second === "object" && first !== null && second !== null) {
    var keys = _.keys(first).sort();
    assert.deepEqual(keys, _.keys(second).sort());
    _.each(keys, function(key) {
      assertJsonEqual(first[key], second[key]);
    });
  } else {
    assert.strictEqual(JSON.stringify(first), JSON.stringify(second));
  }
}

function wrapAssertImmutable(Immutable) {
  return function assertImmutable(methodName, immutableArray, mutableArray, args) {
    var mutableResult = mutableArray[methodName].apply(mutableArray, args);
    var immutableResult = Immutable(immutableArray[methodName].apply(immutableArray, args));

    assertJsonEqual(immutableResult, mutableResult);
  }
}

// Immutable.isImmutable only checks (for performance reasons) that objects
// are shallowly immutable. For tests, though, we want to be thorough!
function wrapAssertIsDeeplyImmutable(Immutable) {
  return function assertIsDeeplyImmutable(obj) {
    assert(Immutable.isImmutable(obj));

    if (typeof obj === "object") {
      _.each(obj, assertIsDeeplyImmutable);
    }
  }
}

function assertHasPrototype(obj, expectedPrototype) {
  assert.strictEqual(Object.getPrototypeOf(obj), expectedPrototype);
}

function withoutIntegerKeys(obj) {
  return _.fromPairs(_.map(obj, function(value, key) {
    // Don't choose keys that can be parsed as 32-bit unsigned integers,
    // as browsers make no guarantee on key ordering for those,
    // and we rely on ordered keys to simplify several tests.
    if (JSON.stringify(parseInt(key)) === key && key !== Infinity && key !== -Infinity && !isNaN(key)) {
      return [key + "n", value];
    }

    return [key, value];
  }));
}

// Returns an object which may or may not contain nested objects and arrays.
function ComplexObjectSpecifier() {
  return function() {
    var obj = _.fromPairs(_.map(JSC.array()(), function() {
      var key   = JSC.string()();
      var value = JSC.one_of([JSC.array(), JSC.object(),
        JSC.falsy(), JSC.integer(), JSC.number(), JSC.string(),
        true, Infinity, -Infinity])();

      if (typeof value === "object") {
        return [key, withoutIntegerKeys(value)];
      }

      return [key, value];
    }));

    return withoutIntegerKeys(obj);
  }
}

function TraversableObjectSpecifier() {
  var complexFactory = JSC.one_of([ComplexObjectSpecifier(), JSC.array()]);
  var obj = JSC.object({complex: complexFactory,
                        deep: JSC.object({complex: complexFactory})
                     })();

  obj[JSC.string()()] = JSC.any()();
  return withoutIntegerKeys(obj);
}

function wrapImmutableArraySpecifier(Immutable) {
  return function ImmutableArraySpecifier(JSC) {
    var args = Array.prototype.slice.call(arguments);

    return function generator() {
      var mutable = JSC.array.apply(JSC.array, args)();

      return Immutable(mutable);
    }
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

function wrapCheckImmutableMutable(Immutable) {
  return function checkImmutableMutable(runs, specifiers) {
    return function (callback, extraSpecifiers) {
      extraSpecifiers = extraSpecifiers || [];

      check(runs, specifiers.concat(extraSpecifiers), function (mutable) {
        var immutable = Immutable(mutable);
        var args = Array.prototype.slice.call(arguments);

        callback.apply(callback, [immutable].concat(args));
      });
    };
  }
}

function isDeepEqual(a, b) {
  // Avoid false positives due to (NaN !== NaN) evaluating to true
  return (deepEqual(a, b) || (a !== a && b !== b));
}

module.exports = function(Immutable) {
  return {
    assertJsonEqual:         assertJsonEqual,
    assertImmutable:         wrapAssertImmutable(Immutable),
    assertIsDeeplyImmutable: wrapAssertIsDeeplyImmutable(Immutable),
    assertHasPrototype:      assertHasPrototype,
    ImmutableArraySpecifier: wrapImmutableArraySpecifier(Immutable),
    ComplexObjectSpecifier:  ComplexObjectSpecifier,
    TraversableObjectSpecifier: TraversableObjectSpecifier,
    check:                   check,
    checkImmutableMutable:   wrapCheckImmutableMutable(Immutable),
    isDeepEqual:             isDeepEqual
  }
};
