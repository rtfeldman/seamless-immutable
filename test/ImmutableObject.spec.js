var testMerge   = require("./ImmutableObject/test-merge.js");
var testCompat  = require("./ImmutableObject/test-compat.js");
var testWithout = require("./ImmutableObject/test-without.js");

describe("ImmutableObject", function() {
  testCompat();
  testMerge();
  testWithout();
});
