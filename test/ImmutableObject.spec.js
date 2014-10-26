var testMerge = require("./ImmutableObject/test-merge.js");
var testCompat= require("./ImmutableObject/test-compat.js");

describe("ImmutableObject", function() {
  testCompat();
  testMerge();
});
