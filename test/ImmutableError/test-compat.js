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

  it("is an instance of ImmutableError", function () {
    var e = new Immutable.ImmutableError();
    assert.instanceOf(e, Immutable.ImmutableError);
  });

  it("is an instance of Error", function () {
    var e = new Immutable.ImmutableError();
    assert.instanceOf(e, Error);
  });
};
