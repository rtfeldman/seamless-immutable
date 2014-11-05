var testCompat   = require("./ImmutableArray/test-compat.js");
var testFlatMap  = require("./ImmutableArray/test-flatMap.js");
var testAsObject = require("./ImmutableArray/test-asObject.js");
var testToMutable = require("./ImmutableArray/test-asMutable.js");

describe("ImmutableArray", function() {
  testCompat();
  testFlatMap();
  testAsObject();
  testToMutable();
});
