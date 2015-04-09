var JSC          = require("jscheck");
var assert       = require("chai").assert;
var _            = require("lodash");
var getTestUtils = require("../TestUtils.js");

var identityFunction = function(arg) { return arg; };

module.exports = function(config) {
  var Immutable = config.implementation;
  var TestUtils = getTestUtils(Immutable);

  var checkImmutableMutable = TestUtils.checkImmutableMutable(100, [JSC.array([TestUtils.ComplexObjectSpecifier()])]);

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

      if (config.id === "dev") {
        it("is frozen", function() {
          checkImmutableMutable(function(immutable, mutable) {
            assert.isTrue(Object.isFrozen(immutable));
          });
        });
      }

      if (config.id === "prod") {
        it("is not frozen", function() {
          checkImmutableMutable(function(immutable, mutable) {
            assert.isFalse(Object.isFrozen(immutable));
          });
        });
      }

      it("is tagged as immutable", function() {
        checkImmutableMutable(function(immutable, mutable) {
          TestUtils.assertIsDeeplyImmutable(immutable);
        })
      });

      if (config.id === "dev") {
        it("cannot have its elements directly mutated", function () {
          checkImmutableMutable(function (immutable, mutable, randomIndex, randomData) {
            immutable[randomIndex] = randomData;

            assert.typeOf(randomIndex, "number");
            assert.strictEqual(immutable.length, mutable.length);
            assert.deepEqual(immutable[randomIndex], mutable[randomIndex]);
          }, [JSC.integer(), JSC.any()]);
        });
      }

      if (config.id === "prod") {
        it("can have its elements directly mutated", function () {
          var immutableArr = Immutable([1, 2, 3]);
          immutableArr[0] = 4;
          assert.equal(immutableArr[0], 4);

          immutableArr.sort();
          assert.deepEqual(immutableArr, [2, 3, 4]);
        });
      }

      it("makes nested content immutable as well", function() {
        checkImmutableMutable(function(immutable, mutable, innerArray, obj) {
          mutable.push(innerArray); // Make a nested immutable
          mutable.push(obj); // Get an object in there too

          immutable = Immutable(mutable);

          assert.strictEqual(immutable.length, mutable.length);

          for (var index in mutable) {
            TestUtils.assertIsDeeplyImmutable(immutable[index]);
          }

          TestUtils.assertIsDeeplyImmutable(immutable);
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
        TestUtils.assertImmutable(methodName, immutable, mutable, methodArgs);
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
