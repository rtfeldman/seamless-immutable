var Immutable = require("../seamless-immutable.js");
var JSC       = require("jscheck");
var TestUtils = require("./TestUtils.js");
var assert    = require("chai").assert;
var _         = require("lodash")

var identityFunction      = TestUtils.identityFunction;
var checkImmutableMutable = TestUtils.checkImmutableMutable(100, [JSC.object()]);

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
    it("prioritizes the argument's properties", function() {
      checkImmutableMutable(function(immutable, mutable) {
        var
          other    = JSC.object()(),
          key      = _.keys(immutable)[0],
          value    = immutable[key],
          newValue = value + "foo";

        other[key] = newValue;

        assert.notEqual(newValue, immutable[key]);

        var result = immutable.merge(other);

        assert.deepEqual(newValue, result[key]);
      });
    });

    it("contains all the argument's properties", function() {
      checkImmutableMutable(function(immutable, mutable) {
        var other  = JSC.object()();
        var result = immutable.merge(other);

        _.each(other, function (value, key) {
          assert.deepEqual(value, result[key]);
        });
      });
    });

    it("contains all the original's properties, except where the argument has those properties", function() {
      checkImmutableMutable(function(immutable, mutable) {
        var
          other    = JSC.object()(),
          key      = _.keys(immutable)[0],
          value    = immutable[key],
          newValue = value + "foo";

        other[key] = newValue;

        assert.notEqual(newValue, immutable[key]);

        var result = immutable.merge(other);

        _.each(immutable, function (value, key) {
          if (!other.hasOwnProperty(key)) {
            assert.deepEqual(value, result[key]);
          }
        });
      });
    });

    it("returns immutable objects", function() {
      checkImmutableMutable(function(immutable, mutable) {
        var other  = JSC.object()();
        var result = immutable.merge(mutable);

        assert.instanceOf(result, Object);
        assert.isTrue(Immutable.isImmutable(result));
      });
    });
  });
});
