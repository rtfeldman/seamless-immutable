var Immutable = require("../seamless-immutable.js");
var JSC       = require("jscheck");
var TestUtils = require("./TestUtils.js");
var assert    = require("chai").assert;
var _         = require("lodash")
var check     = TestUtils.check;

var identityFunction      = TestUtils.identityFunction;
var checkImmutableMutable = TestUtils.checkImmutableMutable(100, [JSC.object()]);

function generateArrayOfObjects() {
  return JSC.array()().map(function() { return JSC.object()(); });
}

function notParseableAsInt(str) {
  return parseInt(str).toString() !== str;
}

describe("ImmutableObject", function() {
  describe("which is compatible with vanilla mutable objects", function() {
    it("is an instance of Object", function() {
      checkImmutableMutable(function(immutable, mutable) {
        assert.instanceOf(immutable, Object);
      });
    });

    it("has the same keys as its mutable equivalent", function() {
      checkImmutableMutable(function(immutable, mutable) {
        // Exclude properties that can be parsed as 32-bit unsigned integers,
        // as they have no sort order guarantees.
        var immutableKeys = Object.keys(immutable).filter(notParseableAsInt);
        var mutableKeys   = Object.keys(mutable).filter(notParseableAsInt);

        assert.deepEqual(immutableKeys, mutableKeys);
      });
    });

    it("supports accessing elements by index via []", function() {
      checkImmutableMutable(function(immutable, mutable, index) {
        assert.typeOf(index, "number");
        assert.deepEqual(immutable[index], mutable[index]);
      }, [JSC.integer()]);
    });

    it("works with for loops", function() {
      checkImmutableMutable(function(immutable, mutable) {
        for (var index=0; index < immutable.length; index++) {
          assert.deepEqual(immutable[index], mutable[index]);
        }
      });
    });

    it("works with for..in loops", function() {
      checkImmutableMutable(function(immutable, mutable) {
        for (var index in immutable) {
          assert.deepEqual(immutable[index], mutable[index]);
        }
      });
    });

    it("has a toString() method that works like a regular immutable's toString()", function() {
      checkImmutableMutable(function(immutable, mutable) {
        assert.strictEqual(immutable.toString(), mutable.toString());
      });
    });

    it("supports being passed to JSON.stringify", function() {
      TestUtils.check(100, [JSC.array()], function(mutable) {
        // Delete all the keys that could be parsed as 32-bit unsigned integers,
        // as there is no guaranteed sort order for them.
        for (var key in mutable) {
          if (!notParseableAsInt(mutable[key])) {
            delete mutable[key];
          }
        }

        var immutable = Immutable(mutable);
        assert.deepEqual(JSON.stringify(immutable), JSON.stringify(mutable));
      });
    });

    it("is frozen", function() {
      checkImmutableMutable(function(immutable, mutable) {
        assert.isTrue(Object.isFrozen(immutable));
      });
    });

    it("is tagged as immutable", function() {
      checkImmutableMutable(function(immutable, mutable) {
        assert.isTrue(Immutable.isImmutable(immutable));
      })
    });

    it("cannot have its elements directly mutated", function() {
      checkImmutableMutable(function(immutable, mutable, randomIndex, randomData) {
        immutable[randomIndex] = randomData;

        assert.typeOf(randomIndex, "number");
        assert.strictEqual(immutable.length, mutable.length);
        assert.deepEqual(immutable[randomIndex], mutable[randomIndex]);
      }, [JSC.integer(), JSC.any()]);
    });

    it("makes nested content immutable as well", function() {
      checkImmutableMutable(function(immutable, mutable, innerArray, obj) {
        mutable.foo = innerArray; // Make a nested immutable array
        mutable.bar = obj;        // Get an object in there too

        immutable = Immutable(mutable);

        assert.strictEqual(immutable.length, mutable.length);

        for (var index in mutable) {
          assert.isTrue(Immutable.isImmutable(immutable[index]));
        }
      });
    });

    // TODO this never fails under Node, even after removing Immutable.Array's
    // call to toImmutable(). Need to verify that it can fail in browsers.
    it("reuses existing immutables during construction", function() {
      checkImmutableMutable(function(immutable, mutable, innerArray, obj) {
        mutable.foo = innerArray; // Make a nested immutable array
        mutable.bar = obj;        // Get an object in there too

        immutable = Immutable(mutable);

        var copiedArray = Immutable(immutable);

        assert.strictEqual(copiedArray.length, immutable.length);

        for (var index in copiedArray) {
          assert.deepEqual(immutable[index], copiedArray[index]);
        }
      }, [JSC.array(), JSC.object()]);
    });
  });

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

      it("prioritizes the argument's properties", function() {
        checkMultiple(function(immutable, mutables, runMerge) {
          var expectedChanges = {};

          _.each(mutables, function(mutable) {
            var keys = _.keys(immutable);

            assert.notStrictEqual(keys.length, 0, "Can't usefully check merge() with an empty object");

            // Randomly change some values that share keys with the immutable.
            _.range(0, _.random(0, keys.length)).forEach(function(keyIndex) {
              var key      = keys[keyIndex],
                  value    = immutable[key],
                  suffix   = JSC.string()(),
                  newValue = value + suffix;

              assert.notStrictEqual(value, newValue, "Failed to change value (" + value + ") by appending \"" + suffix + "\"");

              // Record that we expect this to end up in the final result.
              expectedChanges[key] = newValue;

              mutable[key]  = newValue;
            });
          });

          var result = runMerge(mutables);

          _.each(expectedChanges, function(expectedValue, key) {
            assert.notStrictEqual(expectedValue, immutable[key],
              "Expected to change key (" + key + "), but expected change was the same as the old value (" + expectedValue + ")");

            assert.strictEqual(expectedValue, result[key],
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

      it("returns an Immutable Object", function() {
        checkMultiple(function(immutable, mutables, runMerge) {
          var result = runMerge();

          assert.instanceOf(result, Object);
          assert(Immutable.isImmutable(result));
        });
      });
    }

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
});
