var testMerge   = require("./ImmutableObject/test-merge.js");
var testCompat  = require("./ImmutableObject/test-compat.js");
var testWithout = require("./ImmutableObject/test-without.js");
var testToMutable = require("./ImmutableArray/test-asMutable.js");

describe("ImmutableObject", function() {
  testCompat();
  testMerge();
  testWithout();
  testToMutable();
});
