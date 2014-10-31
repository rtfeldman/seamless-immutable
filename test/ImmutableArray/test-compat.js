var Immutable = require("../../seamless-immutable.js");
var JSC       = require("jscheck");
var TestUtils = require("../TestUtils.js");
var assert    = require("chai").assert;
var _         = require("lodash")

var identityFunction      = TestUtils.identityFunction;
var checkImmutableMutable = TestUtils.checkImmutableMutable(100, [JSC.array()]);

module.exports = function() {
  describe("ImmutableArray", function() {
    describe("which is compatible with vanilla mutable arrays", function() {
      it("is an instance of Array", function() {
        checkImmutableMutable(function(immutable, mutable) {
          assert.instanceOf(immutable, Array);
        });
      });

      it("has the same length as its mutable equivalent", function() {
        checkImmutableMutable(function(immutable, mutable) {
          assert.strictEqual(immutable.length, mutable.length);
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

      it("supports concat", function() {
        checkImmutableMutable(function(immutable, mutable, otherArray) {
          assert.deepEqual(immutable.concat(otherArray), mutable.concat(otherArray));
        }, [JSC.array()]);
      });

      it("supports being an argument to a normal immutable's concat", function() {
        checkImmutableMutable(function(immutable, mutable, otherArray) {
          assert.deepEqual(otherArray.concat(immutable), otherArray.concat(mutable));
        }, [JSC.array()]);
      });

      it("can be concatted to itself", function() {
        checkImmutableMutable(function(immutable, mutable) {
          assert.deepEqual(immutable.concat(immutable), mutable.concat(mutable));
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
          mutable.push(innerArray); // Make a nested immutable
          mutable.push(obj); // Get an object in there too

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
          mutable.push(innerArray); // Make a nested immutable
          mutable.push(obj); // Get an object in there too

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

  // Add a "returns immutable" claim for each non-mutating method on Array.
  nonMutatingArrayMethods = {
    map:         [JSC.literal(identityFunction)],
    filter:      [JSC.literal(identityFunction)],
    reduce:      [JSC.literal(identityFunction), JSC.any()],
    reduceRight: [JSC.literal(identityFunction), JSC.any()],
    concat:      [JSC.array()],
    slice:       [JSC.integer(), JSC.integer()]
  }

  _.each(nonMutatingArrayMethods, function(specifiers, methodName) {
    it("returns only immutables when you call its " +
        methodName + "() method", function() {
      checkImmutableMutable(function(immutable, mutable) {
        var methodArgs = specifiers.map(function(generator) { return generator() });
        assert.isTrue(TestUtils.returnsImmutable(methodName, immutable, mutable, methodArgs));
      });
    });
  });

  [ // Add a "reports banned" claim for each mutating method on Array.
    "setPrototypeOf", "push", "pop", "sort", "splice", "shift", "unshift", "reverse"
  ].forEach(function(methodName) {
    var description = "it throws an ImmutableError when you try to call its " +
      methodName + "() method";

    checkImmutableMutable(function(immutable, mutable, innerArray, obj) {
      assert.throw(function() {
        array[methodName].apply(array, methodArgs);
      });
    }, Immutable.ImmutableError);
  });
};