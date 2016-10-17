var JSC          = require("jscheck");
var assert       = require("chai").assert;
var _            = require("lodash");
var getTestUtils = require("../TestUtils.js");

module.exports = function(config) {
  var Immutable = config.implementation;
  var TestUtils = getTestUtils(Immutable);
  var check     = TestUtils.check;

  describe("#flatMap", function() {
    // Sanity check to make sure our QuickCheck logic isn't off the rails.
    it("passes a basic sanity check on canned input", function() {
      var expected = Immutable(["foo", "foo2", "bar", "bar2", "baz", "baz2"]);
      var actual   = Immutable.flatMap(Immutable(["foo", "bar", "baz"]), function(elem) {
        return [elem, elem + "2"];
      });

      TestUtils.assertJsonEqual(actual, expected);
    });

    it("works the same way as map when the iterator function returns non-arrays", function() {
      check(100, [JSC.array()], function(array) {
        var returnValues = array.map(function() { return JSC.any()(); });
        var iterator = function(value, index) { return returnValues[index]; };
        var expected = _.map(array, iterator);
        var actual   = Immutable.flatMap(Immutable(array), iterator);

        TestUtils.assertJsonEqual(actual, expected);
      });
    });

    it("passes the expected index value", function() {
      check(100, [JSC.array()], function(array) {
        var iterator = function(value, index) { return index; };
        var expected = _.map(array, iterator);
        var actual   = Immutable.flatMap(Immutable(array), iterator);

        TestUtils.assertJsonEqual(actual, expected);
      });
    });

    it("works the same way as map followed by flatten when the iterator function returns arrays", function() {
      check(100, [JSC.array()], function(array) {
        var returnValues = array.map(function() { return [JSC.any()()]; });
        var iterator = function(value, index) { return returnValues[index]; };
        var expected = _.flatten(_.map(array, iterator));
        var actual   = Immutable.flatMap(Immutable(array), iterator);

        TestUtils.assertJsonEqual(actual, expected);
      });
    });

    it("works the same way as flatten when called with no arguments", function() {
      check(100, [JSC.array()], function(array) {
        var expected = _.flatten(array);
        var actual   = Immutable.flatMap(Immutable(array));

        TestUtils.assertJsonEqual(actual, expected);
      });
    });

    it("results in an empty array if the iterator function returns empty array", function() {
      var expected = Immutable([]);
      var iterator = function() { return [] };

      check(100, [JSC.array()], function(array) {
        var actual = Immutable.flatMap(array, iterator);

        TestUtils.assertJsonEqual(actual, expected);
      });
    });
  });
};
