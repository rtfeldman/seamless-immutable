var Immutable = require("../../seamless-immutable.js");
var JSC       = require("jscheck");
var TestUtils = require("../TestUtils.js");
var assert    = require("chai").assert;
var _         = require("lodash")
var check     = TestUtils.check;

module.exports = function() {
  describe("#flatMap", function() {
    // Sanity check to make sure our QuickCheck logic isn't off the rails.
    it("passes a basic sanity check on canned input", function() {
      var expected = Immutable(["foo", "foo2", "bar", "bar2", "baz", "baz2"]);
      var actual   = Immutable(["foo", "bar", "baz"]).flatMap(function(elem) {
        return [elem, elem + "2"];
      });

      assert.deepEqual(actual, expected);
    });
  });
};