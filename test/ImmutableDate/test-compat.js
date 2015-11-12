var JSC          = require("jscheck");
var assert       = require("chai").assert;
var _            = require("lodash");
var getTestUtils = require("../TestUtils.js");

function notParseableAsInt(str) {
  return parseInt(str).toString() !== str;
}

module.exports = function(config) {
  var Immutable = config.implementation;
  var TestUtils = getTestUtils(Immutable);

  var checkImmutableMutable = TestUtils.checkImmutableMutable(1, [JSC.literal(new Date())]);

  describe("which is compatible with vanilla mutable Dates", function() {
    it("is an instance of Date", function () {
      checkImmutableMutable(function(immutable, mutable) {
        assert.instanceOf(immutable, Date);
      });
    });

    it("has the same keys as its mutable equivalent", function() {
      checkImmutableMutable(function(immutable, mutable) {
        // Exclude properties that can be parsed as 32-bit unsigned integers,
        // as they have no sort order guarantees.
        var immutableKeys = Object.keys(immutable).filter(notParseableAsInt);
        var mutableKeys = Object.keys(mutable).filter(notParseableAsInt);

        assert.deepEqual(immutableKeys, mutableKeys);
      });
    });

    it("has a toString() method that works like a regular immutable's toString()", function() {
      checkImmutableMutable(function(immutable, mutable) {
        assert.strictEqual(immutable.toString(), mutable.toString());
      });
    });

    it("supports being passed to JSON.stringify", function() {
      TestUtils.check(1, [JSC.literal(new Date())], function(mutable) {
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

    if (config.id === "dev") {
      it("is frozen", function () {
        checkImmutableMutable(function(immutable, mutable) {
          assert.isTrue(Object.isFrozen(immutable));
        });
      });
    }

    if (config.id === "prod") {
      it("is frozen", function () {
        checkImmutableMutable(function(immutable, mutable) {
          assert.isFalse(Object.isFrozen(immutable));
        });
      });
    }

    it("is tagged as immutable", function() {
      checkImmutableMutable(function(immutable, mutable) {
        TestUtils.assertIsDeeplyImmutable(immutable);
      });
    });

    [ // Add a "reports banned" claim for each mutating method on Date.
      "setDate", "setFullYear", "setHours", "setMilliseconds", "setMinutes", "setMonth", "setSeconds",
      "setTime", "setUTCDate", "setUTCFullYear", "setUTCHours", "setUTCMilliseconds", "setUTCMinutes",
      "setUTCMonth", "setUTCSeconds", "setYear"
    ].forEach(function(methodName) {
      var description = "it throws an ImmutableError when you try to call its " +
        methodName + "() method";

      checkImmutableMutable(function(immutable, mutable, innerArray, obj) {
        assert.throw(function() {
          date[methodName].apply(date, methodArgs);
        });
      }, Immutable.ImmutableError);
    });
  });
};
