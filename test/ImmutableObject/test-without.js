var JSC          = require("jscheck");
var assert       = require("chai").assert;
var _            = require("lodash");
var getTestUtils = require("../TestUtils.js");

function generateArrayOfStrings() {
  return JSC.array()().map(function() { return JSC.string()(); });
}

module.exports = function(config) {
  var Immutable = config.implementation;
  var TestUtils = getTestUtils(Immutable);
  var check     = TestUtils.check;

  describe("#without", function() {
    function generateWithoutTestsFor(specifiers) {
      var runs = 100;

      function checkMultiple(callback) {
        check(runs, specifiers, function(list) {
          var useVarArgs = !(list instanceof Array);

          if (arguments.length > 1) {
            list = Array.prototype.slice.call(arguments);
          } else if (useVarArgs) {
            list = [list]
          }

          assert.notStrictEqual(list.length, 0, "Can't usefully check without() with no objects");

          // Make an object that at LEAST contains the specified keys.
          var immutable = Immutable(list).asObject(function(key) {
            return [key, JSC.any()()];
          }).merge(TestUtils.ComplexObjectSpecifier()());

          function runWithout(keys) {
            keys = keys || list;

            return useVarArgs ?
              immutable.without.apply(immutable, keys) :
              immutable.without(keys);
          }

          callback(immutable, list, runWithout);
        })
      }

      it("drops the listed keys", function() {
        checkMultiple(function(immutable, keys, runWithout) {
          var expectedKeys = _.difference(_.keys(immutable), keys);
          var result = runWithout(keys);

          assert.deepEqual(_.keys(result), expectedKeys);

          // Make sure the remaining keys still point to the same values
          _.each(_.keys(result), function(key) {
            assert.deepEqual(immutable[key], result[key]);;
          });
        });
      });

      it("returns an Immutable Object", function() {
        checkMultiple(function(immutable, mutables, runWithout) {
          var result = runWithout();

          assert.instanceOf(result, Object);

          TestUtils.assertIsDeeplyImmutable(result);
        });
      });
    }

    // Sanity check to make sure our QuickCheck logic isn't off the rails.
    it("passes a basic sanity check on canned input", function() {
      var expected = Immutable({cat: "meow", dog: "woof"});
      var actual   = Immutable({cat: "meow", dog: "woof", fox: "???"}).without("fox");

      assert.deepEqual(actual, expected);
    });

    it("is a no-op when passed nothing", function() {
      check(100, [TestUtils.ComplexObjectSpecifier()], function(obj) {
        var expected = Immutable(obj);
        var actual   = expected.without();

        assert.deepEqual(actual, expected);
      });
    });

    describe("when passed a single key", function() {
      generateWithoutTestsFor([JSC.string()]);
    });

    describe("when passed multiple keys", function() {
      generateWithoutTestsFor([JSC.string(), JSC.string(), JSC.string()]);
    });

    describe("when passed an array of keys", function() {
      generateWithoutTestsFor([generateArrayOfStrings]);
    });
  });
};
