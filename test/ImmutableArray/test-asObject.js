var Immutable = require("../../seamless-immutable.js");
var JSC       = require("jscheck");
var TestUtils = require("../TestUtils.js");
var assert    = require("chai").assert;
var _         = require("lodash")
var check     = TestUtils.check;

module.exports = function() {
  describe("#asObject", function() {
    it("works on arrays of various lengths", function() {
      check(100, [JSC.array()], function(mutableArray) {
        var keys   = mutableArray.map(function() { return JSC.string()(); })
        var values = mutableArray.map(function() { return JSC.any()(); })
        var array  = Immutable(mutableArray);

        var result = array.asObject(function(value, index) {
          // Check that the index argument we receive works as expected.
          assert.deepEqual(value, array[index], "Expected array[" + index + "] to be " + value);

          return [keys[index], values[index]]
        });

        _.each(keys, function(key, index) {
          assert.deepEqual(values[index], result[key]);
        });
      });
    });

    it("works without an iterator on arrays that are already organized properly", function() {
      check(100, [JSC.array()], function(mutableArray) {
        var keys   = mutableArray.map(function() { return JSC.string()(); })
        var values = mutableArray.map(function() { return JSC.any()(); })
        var array  = Immutable(_.map(mutableArray, function(value, index) {
          return [keys[index], values[index]];
        }));

        var result = array.asObject();

        _.each(keys, function(key, index) {
          var value = values[index];

          assert.deepEqual(key,   array[index][0]);
          assert.deepEqual(value, array[index][1]);
          assert.deepEqual(value, result[key]);
        });
      });
    });

    // Sanity check to make sure our QuickCheck logic isn't off the rails.
    it("passes a basic sanity check on canned input", function() {
      var expected = Immutable({all: "your base", are: {belong: "to us"}});
      var actual   = Immutable([{key: "all", value: "your base"}, {key: "are", value: {belong: "to us"}}]).asObject(function(elem) {
        return [elem.key, elem.value];
      });

      assert.deepEqual(actual, expected);
    });
  });
};