var JSC          = require("jscheck");
var assert       = require("chai").assert;
var _            = require("lodash");
var getTestUtils = require("../TestUtils.js");

function generateArrayOfStrings() {
  return JSC.array()().map(function() { return JSC.string()(); });
}

function argumentsToArray(theArguments) {
  return Array.prototype.slice.call(theArguments);
}

function dropKeysPredicate(keys) {
  return function (value, key) {
    return _.includes(keys, key);
  }
}

module.exports = function(config) {
  var Immutable = config.implementation;
  var TestUtils = getTestUtils(Immutable);
  var check     = TestUtils.check;

  describe("#without", function() {

    function checkImmutableWithKeys(keysSpecifier, callback/*function(immutable, keys)*/) {
      var runs = 100;

      function checkMultiple(callback) {
        // keysSpecifier = array of generators
        check(runs, keysSpecifier, function(singleArrayOrFirstKey) {

          var useVarArgs = !(singleArrayOrFirstKey instanceof Array);

          var keys;
          if (arguments.length > 1) {
            keys = Array.prototype.slice.call(arguments);
          } else if (singleArrayOrFirstKey instanceof Array) {
            keys = singleArrayOrFirstKey;
          } else {
            keys = [singleArrayOrFirstKey];
          }

          assert.notStrictEqual(keys.length, 0, "Can't usefully check without() with no objects");

          // Make an object that at LEAST contains the specified keys.
          var immutable = Immutable(keys).asObject(function(key) {
            return [key, JSC.any()()];
          }).merge(TestUtils.ComplexObjectSpecifier()());

          callback(immutable, keys, useVarArgs);
        })
      }

      checkMultiple(callback);
    }

    function generateWithoutTestsFor(firstSpecifier) {

      var keysSpecifier = (firstSpecifier === generateArrayOfStrings) ?
        [firstSpecifier] : argumentsToArray(arguments);

      checkImmutableWithKeys(keysSpecifier, function(immutable, keys, useVarArgs) {

        it("returns the same result as a corresponding without(predicate)", function() {
          var expected = Immutable.without(immutable, dropKeysPredicate(keys));
          var actual   = useVarArgs ?
            Immutable.without.apply(Immutable, [immutable].concat(keys)) :
            Immutable.without(immutable, keys); 
          TestUtils.assertJsonEqual(actual, expected);
        });

        it("drops the keys", function() {
          var expectedKeys = _.difference(_.keys(immutable), keys);
          var result = Immutable.without(immutable, keys);

          TestUtils.assertJsonEqual(_.keys(result), expectedKeys);
        });
      });
    }

    // Sanity check to make sure our QuickCheck logic isn't off the rails.
    it("passes a basic sanity check on canned input", function() {
      var expected = Immutable({cat: "meow", dog: "woof"});
      var actual   = Immutable({cat: "meow", dog: "woof", fox: "???"});
      actual = Immutable.without(actual, "fox");

      TestUtils.assertJsonEqual(actual, expected);
    });

    // Check that numeric keys are removed too.
    it("passes a basic sanity check with numeric keys", function() {
      var expected = Immutable({cat: "meow", dog: "woof"});
      var actual   = Immutable({cat: "meow", dog: "woof", 42: "???"});
      actual = Immutable.without(actual, 42);
      TestUtils.assertJsonEqual(actual, expected);

      actual       = Immutable({cat: "meow", dog: "woof", 42: "???", 0.5: "xxx"});
      actual = Immutable.without(actual, [42, 0.5]);
      TestUtils.assertJsonEqual(actual, expected);
    });

    it("is a no-op when passed nothing", function() {
      check(100, [TestUtils.ComplexObjectSpecifier()], function(obj) {
        var expected = Immutable(obj);
        var actual   = Immutable.without(expected);

        TestUtils.assertJsonEqual(actual, expected);
      });
    });

    it("preserves prototypes after call to without", function() {
      function TestClass(o) { _.extend(this, o); };
      var data = new TestClass({a: 1, b: 2});

      var immutable = Immutable(data, {prototype: TestClass.prototype});
      var result = Immutable.without(immutable, 'b');

      TestUtils.assertJsonEqual(result, _.omit(data, 'b'));
      TestUtils.assertHasPrototype(result, TestClass.prototype);
    });

    describe("when passed a single key", function() {
      generateWithoutTestsFor(JSC.string());
    });

    describe("when passed multiple keys", function() {
      generateWithoutTestsFor(JSC.string(), JSC.string(), JSC.string());
    });

    describe("when passed an array of keys", function() {
      generateWithoutTestsFor(generateArrayOfStrings);
    });

    describe("when passed a predicate", function() {
      checkImmutableWithKeys([generateArrayOfStrings], function(immutable, keys) {

        it("drops the keys satisfying the predicate", function() {
          var expectedKeys = _.difference(_.keys(immutable), keys);
          var result = Immutable.without(immutable, dropKeysPredicate(keys));

          TestUtils.assertJsonEqual(_.keys(result), expectedKeys);

          // Make sure the remaining keys still point to the same values
          _.each(_.keys(result), function(key) {
            TestUtils.assertJsonEqual(immutable[key], result[key]);;
          });
        });

        it("returns an Immutable Object", function() {
          var result = Immutable.without(immutable, dropKeysPredicate(keys));
          assert.instanceOf(result, Object);
          TestUtils.assertIsDeeplyImmutable(result);
        });

        it("works the same way as _.omitBy", function() {
          var expected = _.omitBy(immutable, function (value, key) {
            return _.includes(keys, key);
          });

          var actual = Immutable.without(immutable, function (value, key) {
            return _.includes(keys, key);
          });

          TestUtils.assertJsonEqual(expected, actual);
        });

      });

    });
  });
};
