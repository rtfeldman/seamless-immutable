var Immutable = require("../../seamless-immutable.js");
var JSC       = require("jscheck");
var TestUtils = require("../TestUtils.js");
var assert    = require("chai").assert;
var _         = require("lodash")
var check     = TestUtils.check;

function generateArrayOfObjects() {
  return JSC.array()().map(function() { return TestUtils.ComplexObjectSpecifier()(); });
}

module.exports = function() {
  describe("#merge", function() {
    function generateMergeTestsFor(specifiers) {
      var runs = 100;

      function checkMultiple(callback) {
        check(runs, specifiers, function(list) {
          var useVarArgs = !(list instanceof Array);

          if (arguments.length > 1) {
            list = Array.prototype.slice.call(arguments);
          } else if (useVarArgs) {
            list = [list]
          }

          assert.notStrictEqual(list.length, 0, "Can't usefully check merge() with no objects");

          var immutable = Immutable(list[0]);

          function runMerge(others) {
            others = others || list;

            return useVarArgs ?
              immutable.merge.apply(immutable, others) :
              immutable.merge(others);
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
              assert(result.hasOwnProperty(key));
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

      it("returns a deeply Immutable Object", function() {
        checkMultiple(function(immutable, mutables, runMerge) {
          var result = runMerge();

          assert.instanceOf(result, Object);
          assert(Immutable.isImmutable(result));
          for(key in result) {
            assert(Immutable.isImmutable( result[key] ));
          };
        });
      });
    }

    // Sanity check to make sure our QuickCheck logic isn't off the rails.
    it("passes a basic sanity check on canned input", function() {
      var expected = Immutable({all: "your base", are: {belong: "to us"}});
      var actual   = Immutable({all: "your base", are: {belong: "to them"}}).merge({are: {belong: "to us"}})

      assert.deepEqual(actual, expected);
    });

    it("is a no-op when passed nothing", function() {
      check(100, [JSC.object()], function(obj) {
        var expected = Immutable(obj);
        var actual   = expected.merge();

        assert.deepEqual(actual, expected);
      });
    });

    describe("when passed a single object", function() {
      generateMergeTestsFor([JSC.object()]);
    });

    describe("when passed multiple objects", function() {
      generateMergeTestsFor([JSC.object(), JSC.object(), JSC.object()]);
    });

    describe("when passed an array of objects", function() {
      generateMergeTestsFor([generateArrayOfObjects]);
    });
  });
};