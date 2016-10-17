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

  describe("#merge", function() {
    function generateMergeTestsFor(specifiers, config) {
      var runs = 100;

      function checkMultiple(callback) {
        check(runs, specifiers, function(list) {
          list = list instanceof Array ? list : [list];

          assert.notStrictEqual(list.length, 0, "Can't usefully check merge() with no objects");

          var immutable = Immutable(list[0]);

          function runMerge(others) {
            others = others || list;

            return Immutable.merge(immutable, others, config);
          }

          callback(immutable, list, runMerge);
        })
      }

      it("prioritizes the arguments' properties", function() {
        checkMultiple(function(immutable, mutables, runMerge) {
          var expectedChanges = {};

          _.each(mutables, function(mutable) {
            var keys = _.keys(immutable);

            assert.notStrictEqual(keys.length, 0, "Can't usefully check merge() with an empty object");

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
          });

          var result = runMerge(mutables);

          _.each(expectedChanges, function(expectedValue, key) {
            assert.notStrictEqual(expectedValue, immutable[key],
              "Expected to change key (" + key + "), but expected change was the same as the old value (" + expectedValue + ")");

            assert.strictEqual(result[key], expectedValue,
              "The merged object did not keep the key/newValue pair as expected.");
          });
        });
      });

      it("contains all the arguments' properties", function() {
        checkMultiple(function(immutable, mutables, runMerge) {
          var result = runMerge();

          _.each(mutables, function(mutable, index) {
            _.each(mutable, function (value, key) {
              assert(result.hasOwnProperty(key), "Result " + JSON.stringify(result) + " did not have property " + key + " with value " + value + " from " + JSON.stringify(mutable));
            });
          });
        });
      });

      it("contains all the original's properties", function() {
        checkMultiple(function(immutable, mutables, runMerge) {
          var result = runMerge();

          _.each(immutable, function (value, key) {
            assert(result.hasOwnProperty(key));
          });
        });
      });

      it("does not reproduce except when required #70", function() {
        var immutable = Immutable({a: {b: 1, c: 1}});

        // Non-deep merge is never equal for deep objects.
        assert.notStrictEqual(immutable, Immutable.merge(immutable, {a: {b: 1}}));

        // Deep merge for only some of the keys is equal, except in replace mode.
        assert.strictEqual(immutable, Immutable.merge(immutable, {a: {b: 1}}, {deep: true}));
        assert.notStrictEqual(immutable, Immutable.merge(immutable, {a: {b: 1}}, {deep: true, mode: 'replace'}));

        // Identical child objects in deep merge remain equal.
        assert.strictEqual(immutable.a, Immutable.merge(immutable, {d: {e: 2}}, {deep: true}).a);

        // Deep merge for all of the keys is always equal.
        assert.strictEqual(immutable, Immutable.merge(immutable, {a: {b: 1, c: 1}}, {deep: true}));
        assert.strictEqual(immutable, Immutable.merge(immutable, {a: {b: 1, c: 1}}, {deep: true, mode: 'replace'}));

        // Deep merge with updated data is never equal.
        assert.notStrictEqual(immutable, Immutable.merge(immutable, {a: {b: 1, c: 2}}, {deep: true}));
        assert.notStrictEqual(immutable, Immutable.merge(immutable, {a: {b: 1, c: 2}}, {deep: true, mode: 'replace'}));
      });

      it("does nothing when merging an identical object", function() {
        checkMultiple(function(immutable, mutables, runMerge) {
          _.each(mutables, function(mutable, index) {
            var identicalImmutable = Immutable(mutable);

            assert.strictEqual(identicalImmutable,
              Immutable.merge(identicalImmutable, mutable, {deep: true}));
            assert.strictEqual(identicalImmutable,
              Immutable.merge(identicalImmutable, mutable, {deep: true, mode: 'replace'}));
          });
        });
      });

      it("does nothing when passed a merge that will result in no changes", function() {
        checkMultiple(function(immutable, mutables, runMerge) {
          // Make sure all the changes will be no-ops.
          _.each(mutables, function(mutable, index) {
            _.each(mutable, function (value, key) {
              // If the immutable one has this key, use the same value.
              // Otherwise, delete the key.
              if (immutable.hasOwnProperty(key)) {
                mutable[key] = immutable[key];
              } else {
                delete mutable[key];
              }
            });
          });

          var result = runMerge();

          assert.strictEqual(result, immutable);
        });
      });

      it("returns a deeply Immutable Object", function() {
        checkMultiple(function(immutable, mutables, runMerge) {
          var result = runMerge();

          assert.instanceOf(result, Object);
          TestUtils.assertIsDeeplyImmutable(result);
        });
      });
    }

    // Sanity check to make sure our QuickCheck logic isn't off the rails.
    it("passes a basic sanity check on canned input", function() {
      var expected = Immutable({all: "your base", are: {belong: "to us"}});
      var actual   = Immutable({all: "your base", are: {belong: "to them"}})
      actual = Immutable.merge(actual, {are: {belong: "to us"}})

      TestUtils.assertJsonEqual(actual, expected);
    });

    it("does nothing when passed a canned merge that will result in no changes", function() {
      var expected = Immutable({all: "your base", are: {belong: "to us"}});
      var actual   = Immutable.merge(expected, {all: "your base"}); // Should result in a no-op.

      assert.strictEqual(expected, actual, JSON.stringify(expected) + " did not equal " + JSON.stringify(actual));
    });

    it("is a no-op when passed nothing", function() {
      check(100, [TestUtils.ComplexObjectSpecifier()], function(obj) {
        var expected = Immutable(obj);
        var actual   = expected.merge();

        TestUtils.assertJsonEqual(actual, expected);
      });
    });

    it("Throws an exception if you pass it a non-object", function() {
      check(100, [TestUtils.ComplexObjectSpecifier(), invalidMergeArgumentSpecifier()], function(obj, nonObj) {
        assert.isObject(obj, 0, "Test error: this specifier should always generate an object, which " + JSON.stringify(obj) + " was not.");
        assert.isNotObject(nonObj, 0, "Test error: this specifier should always generate a non-object, which" + JSON.stringify(nonObj) + " was not.");

        var immutable = Immutable(obj);

        assert.throws(function() {
          Immutable.merge(immutable, nonObj);
        }, TypeError)
      });
    });

    it("merges deep when the config tells it to", function() {
      var original = Immutable({all: "your base", are: {belong: "to us", you: {have: "x", make: "your time"}}});
      var toMerge  = {are: {you: {have: "no chance to survive"}}};

      var expectedShallow = Immutable({all: "your base", are: {you: {have: "no chance to survive"}}});
      var actualShallow   = Immutable.merge(original, toMerge);

      TestUtils.assertJsonEqual(actualShallow, expectedShallow);

      var expectedDeep = Immutable({all: "your base", are: {belong: "to us", you: {have: "no chance to survive", make: "your time"}}});
      var actualDeep   = Immutable.merge(original, toMerge, {deep: true});

      TestUtils.assertJsonEqual(actualDeep, expectedDeep);
    });

    it("merges deep when the config tells it to with an array as the first argument", function() {
      var original = Immutable({test: {a: true}});
      var toMerge  = [{test: {b: true}}, {test: {c: true}}];

      var expectedShallow = Immutable({test: {c: true}});
      var actualShallow   = Immutable.merge(original, toMerge);

      TestUtils.assertJsonEqual(actualShallow, expectedShallow);

      var expectedDeep = Immutable({test: {a: true, b: true, c: true}});
      var actualDeep   = Immutable.merge(original, toMerge, {deep: true});

      TestUtils.assertJsonEqual(actualDeep, expectedDeep);
    });

    it("merges deep on only objects", function() {
      var original = Immutable({id: 3, name: "three", valid: true, a: {id: 2}, b: [50], x: [1, 2], sub: {z: [100]}});
      var toMerge = {id: 3, name: "three", valid: false, a: [1000], b: {id: 4}, x: [3, 4], sub: {y: [10, 11], z: [101, 102]}};

      var expected = Immutable({id: 3, name: "three", valid: false, a: [1000], b: {id: 4}, x: [3, 4], sub: {z: [101, 102], y: [10, 11]}});
      var actual   = Immutable.merge(original, toMerge, {deep: true});

      TestUtils.assertJsonEqual(actual, expected);
    });

    function arrayMerger(thisValue, providedValue) {
      if (thisValue instanceof Array && providedValue instanceof Array) {
        return thisValue.concat(providedValue);
      }
    }

    it("merges with a custom merger when the config tells it to", function() {
      var expected = Immutable({all: "your base", are: {belong: "to us"}, you: ['have', 'no', 'chance', 'to', 'survive']});
      var actual = Immutable({all: "your base", are: {belong: "to us"}, you: ['have', 'no']});
      var actual = Immutable.merge(actual, {you: ['chance', 'to', 'survive']}, {merger: arrayMerger});

      TestUtils.assertJsonEqual(actual, expected);
    });

    it("merges deep with a custom merger when the config tells it to", function() {
      var original = Immutable({id: 3, name: "three", valid: true, a: {id: 2}, b: [50], x: [1, 2], sub: {z: [100]}});
      var toMerge = {id: 3, name: "three", valid: false, a: [1000], b: {id: 4}, x: [3, 4], sub: {y: [10, 11], z: [101, 102]}};

      var expected = Immutable({id: 3, name: "three", valid: false, a: [1000], b: {id: 4}, x: [1, 2, 3, 4], sub: {z: [100, 101, 102], y: [10, 11]}});
      var actual   = Immutable.merge(original, toMerge, {deep: true, merger: arrayMerger});

      TestUtils.assertJsonEqual(actual, expected);
    });

    it("merges with a custom merger that returns the current object the result is the same as the original", function() {
      var data = {id: 3, name: "three", valid: true, a: {id: 2}, b: [50], x: [1, 2], sub: {z: [100]}};
      var original = Immutable(data);
      var actualWithoutMerger = Immutable.merge(original, data);
      assert.notEqual(original, actualWithoutMerger);

      var config = {
        merger: function(current, other) {
          return current;
        }
      };
      var actualWithMerger = Immutable.merge(original, data, config);
      assert.equal(original, actualWithMerger);
    });

    it("preserves prototypes across merges", function() {
      function TestClass(o) { _.extend(this, o); };
      var data = new TestClass({a: 1, b: 2});
      var mergeData = {b: 3, c: 4};

      var immutable = Immutable(data, {prototype: TestClass.prototype});
      var result = Immutable.merge(immutable, mergeData);

      TestUtils.assertJsonEqual(result, _.extend({}, data, mergeData));
      TestUtils.assertHasPrototype(result, TestClass.prototype);
    });

    describe("when passed a single object", function() {
      generateMergeTestsFor([TestUtils.ComplexObjectSpecifier()]);
    });

    describe("when passed a single object with deep set to true", function() {
      generateMergeTestsFor([TestUtils.ComplexObjectSpecifier()], {deep: true});
    });

    describe("when passed a single object with deep set to true and mode set to replace", function() {
      generateMergeTestsFor([TestUtils.ComplexObjectSpecifier()], {deep: true, mode: 'replace'});
    });

    describe("when passed a single object with a custom merger", function() {
      generateMergeTestsFor([TestUtils.ComplexObjectSpecifier()], {merger: arrayMerger()});
    });

    describe("when passed an array of objects", function() {
      generateMergeTestsFor([generateArrayOfObjects]);
    });

    describe("when passed an array of objects with deep set to true", function() {
      generateMergeTestsFor([generateArrayOfObjects], {deep: true});
    });

    describe("when passed an array of objects with deep set to true and mode set to replace", function() {
      generateMergeTestsFor([generateArrayOfObjects], {deep: true, mode: 'replace'});
    });

    describe("when passed an array of objects with a custom merger", function() {
      generateMergeTestsFor([generateArrayOfObjects], {merger: arrayMerger()});
    });
  });
};
