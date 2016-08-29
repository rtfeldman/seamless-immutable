var JSC          = require("jscheck");
var assert       = require("chai").assert;
var _            = require("lodash");
var getTestUtils = require("../TestUtils.js");

// Anything but an object, array, or undefined.
function invalidMergeArgumentSpecifier() {
  return JSC.one_of([
    (function() { return function() {}; }),
    JSC.integer(), JSC.number(), JSC.string(),
    true, Infinity, -Infinity
  ]);
}

module.exports = function(config) {
  var Immutable = config.implementation;
  var TestUtils = getTestUtils(Immutable);
  var check     = TestUtils.check;

  function generateArrayOfObjects() {
    return JSC.array()().map(function() { return TestUtils.ComplexObjectSpecifier()(); });
  }

  describe("#replace", function() {
    function generateReplaceTestsFor(specifiers, config) {
      var runs = 100;

      function checkSingle(callback) {
        check(runs, specifiers, function(mutable) {
          var immutable = Immutable(mutable);

          function runReplace(other) {
            other = other || mutable;
            return Immutable.replace(immutable, other, config);
          }

          callback(immutable, mutable, runReplace);
        })
      }

      it("prioritizes the arguments' properties", function() {
        checkSingle(function(immutable, mutable, runReplace) {
          var expectedChanges = {};

          var keys = _.keys(immutable);

          assert.notStrictEqual(keys.length, 0, "Can't usefully check replace() with an empty object");

          // Randomly change some values that share keys with the immutable.
          _.each(keys, function(key) {
            if (Math.random() > 0.5) {
              var value    = immutable[key],
                  suffix   = JSC.string()(),
                  newValue = value + suffix;

              assert.notStrictEqual(value, newValue, "Failed to change value (" + value + ") by appending \"" + suffix + "\"");

              // Record that we expect this to end up in the final result.
              expectedChanges[key] = newValue;
              assert(Immutable.isImmutable(expectedChanges[key]));

              mutable[key]  = newValue;
            } else if (mutable.hasOwnProperty(key) && mutable[key] !== immutable[key]) {
              // NaN will break tests, though not the actual function.
              if (isNaN(mutable[key])) {
                mutable[key] = 0;
              }

              expectedChanges[key] = mutable[key];
            }
          });

          var result = runReplace(expectedChanges);

          _.each(expectedChanges, function(value, key) {
            assert.notStrictEqual(value, immutable[key],
              "Expected to change key (" + key + "), but expected change was the same as the old value (" + value + ")");
          });

          _.each(result, function(value, key) {
              assert(expectedChanges.hasOwnProperty(key),
                "Result has key (" + key + "), but this key was not included in object set to .replace() call");
          });
        });
      });

      it("contains all the arguments' properties", function() {
        checkSingle(function(immutable, mutable, runReplace) {
          var result = runReplace();

          _.each(mutable, function (value, key) {
            assert(result.hasOwnProperty(key), "Result " + JSON.stringify(result) + " did not have property " + key + " with value " + value + " from " + JSON.stringify(mutable));
          });
        });
      });

      it("does not contain the original's properties", function() {
        checkSingle(function(immutable, mutable, runReplace) {
          var result = runReplace();

          _.each(immutable, function (value, key) {
            assert(!result.hasOwnProperty(key) || mutable.hasOwnProperty(key));
          });
        });
      });

      it("does not reproduce except when required #70", function() {
        var immutable = Immutable({a: {b: 1, c: 1}, d: {e: 1}});

        // Non-deep replace is never equal for deep objects.
        assert.notStrictEqual(immutable, Immutable.replace(immutable, {a: {b: 1, c: 1}, d: {e: 1}}));

        // Deep merge for only some of the keys is not equal
        assert.notStrictEqual(immutable, Immutable.replace(immutable, {a: {b: 1, c: 1}}, {deep: true}));

        // Identical child objects in deep merge remain equal.
        assert.strictEqual(immutable.a, Immutable.replace(immutable, {a: {b: 1, c: 1}}, {deep: true}).a);

        // Deep merge for all of the keys is always equal.
        assert.strictEqual(immutable, Immutable.replace(immutable, {a: {b: 1, c: 1}, d: {e: 1}}, {deep: true}));

        // Deep merge with updated data is never equal.
        assert.notStrictEqual(immutable, Immutable.replace(immutable, {a: {b: 1, c: 1}, d: {e: 2}}, {deep: true}));
      });

      it("does nothing when replacing an identical object", function() {
        checkSingle(function(immutable, mutable, runReplace) {
          var identicalImmutable = Immutable(mutable);

          assert.strictEqual(identicalImmutable,
            Immutable.replace(identicalImmutable, mutable, {deep: true}));
        });
      });

      it("returns a deeply Immutable Object", function() {
        checkSingle(function(immutable, mutable, runReplace) {
          var result = runReplace();

          assert.instanceOf(result, Object);
          TestUtils.assertIsDeeplyImmutable(result);
        });
      });
    }

    // Sanity check to make sure our QuickCheck logic isn't off the rails.
    it("passes a basic sanity check on canned input", function() {
      var expected = Immutable({are: {belong: "to us"}});
      var actual   = Immutable({all: "your base", are: {belong: "to them"}});
      actual = Immutable.replace(actual, {are: {belong: "to us"}})

      TestUtils.assertJsonEqual(actual, expected);
    });

    it("does nothing when passed a canned merge that will result in no changes", function() {
      var expected = Immutable({all: "your base"});
      var actual   = Immutable.replace(expected, {all: "your base"}); // Should result in a no-op.

      assert.strictEqual(expected, actual, JSON.stringify(expected) + " did not equal " + JSON.stringify(actual));
    });

    it("is a no-op when passed nothing", function() {
      check(100, [TestUtils.ComplexObjectSpecifier()], function(obj) {
        var expected = Immutable(obj);
        var actual   = Immutable.replace(expected);

        assert.strictEqual(actual, expected);
      });
    });

    it("Throws an exception if you pass it a non-object", function() {
      check(100, [TestUtils.ComplexObjectSpecifier(), invalidMergeArgumentSpecifier()], function(obj, nonObj) {
        assert.isObject(obj, 0, "Test error: this specifier should always generate an object, which " + JSON.stringify(obj) + " was not.");
        assert.isNotObject(nonObj, 0, "Test error: this specifier should always generate a non-object, which" + JSON.stringify(nonObj) + " was not.");

        var immutable = Immutable(obj);

        assert.throws(function() {
          Immutable.replace(immutable, nonObj);
        }, TypeError)
      });
    });

    it("merges deep when the config tells it to", function() {
      var original = Immutable({all: "your base", are: {belong: "to us", you: {have: "x", make: "your time"}}});
      var toMerge  = {are: {you: {have: "no chance to survive"}}};

      var expectedShallow = Immutable({are: {you: {have: "no chance to survive"}}});
      var actualShallow   = Immutable.replace(original, toMerge);

      TestUtils.assertJsonEqual(actualShallow, expectedShallow);

      var expectedDeep = Immutable({are: {you: {have: "no chance to survive"}}});
      var actualDeep   = Immutable.replace(original, toMerge, {deep: true});

      TestUtils.assertJsonEqual(actualDeep, expectedDeep);
    });

    it("merges deep on only objects", function() {
      var original = Immutable({id: 3, name: "three", valid: true, a: {id: 2}, b: [50], x: [1, 2], sub: {z: [100]}});
      var toMerge = {id: 3, name: "three", valid: false, a: [1000], b: {id: 4}, x: [3, 4], sub: {y: [10, 11], z: [101, 102]}};

      var expected = Immutable({id: 3, name: "three", valid: false, a: [1000], b: {id: 4}, x: [3, 4], sub: {y: [10, 11], z: [101, 102]}});
      var actual   = Immutable.replace(original, toMerge, {deep: true});

      TestUtils.assertJsonEqual(actual, expected);
    });

    it("preserves prototypes across merges", function() {
      function TestClass(o) { _.extend(this, o); };
      var data = new TestClass({a: 1, b: 2});
      var mergeData = {b: 3, c: 4};

      var immutable = Immutable(data, {prototype: TestClass.prototype});
      var result = Immutable.replace(immutable, mergeData);

      TestUtils.assertJsonEqual(result, _.extend(mergeData));
      TestUtils.assertHasPrototype(result, TestClass.prototype);
    });

    describe("when passed a single object", function() {
      generateReplaceTestsFor([TestUtils.ComplexObjectSpecifier()]);
    });

    describe("when passed a single object with deep set to true", function() {
      generateReplaceTestsFor([TestUtils.ComplexObjectSpecifier()], {deep: true});
    });
  });
};
