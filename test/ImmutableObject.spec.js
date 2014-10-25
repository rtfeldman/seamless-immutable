var Immutable = require("../seamless-immutable.js");
var JSC       = require("jscheck");
var TestUtils = require("./TestUtils.js");
var assert    = require("chai").assert;
var _         = require("lodash")

var identityFunction      = TestUtils.identityFunction;
var checkImmutableMutable = TestUtils.checkImmutableMutable(100, [JSC.object()]);

describe("ImmutableObject", function() {
  describe("which is compatible with vanilla mutable objects", function() {
    it("is an instance of Object", function() {
      checkImmutableMutable(function(immutable, mutable) {
        assert.instanceOf(immutable, Object);
      });
    });

    it("has the same keys as its mutable equivalent", function() {
      checkImmutableMutable(function(immutable, mutable) {
        assert.deepEqual(_.keys(immutable), _.keys(mutable));
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
      checkImmutableMutable(function(immutable, mutable) {
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
});
