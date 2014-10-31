var testCompat   = require("./ImmutableArray/test-compat.js");
var testFlatMap  = require("./ImmutableArray/test-flatMap.js");
var testAsObject = require("./ImmutableArray/test-asObject.js");

describe("ImmutableArray", function() {
  testCompat();
  testFlatMap();
  testAsObject();
});
