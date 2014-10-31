var Immutable = require("../../seamless-immutable.js");
var JSC       = require("jscheck");
var TestUtils = require("../TestUtils.js");
var assert    = require("chai").assert;
var _         = require("lodash")
var check     = TestUtils.check;

module.exports = function() {
  describe("#asObject", function() {
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