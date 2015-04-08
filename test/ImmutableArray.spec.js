var testCompat   = require("./ImmutableArray/test-compat.js");
var testFlatMap  = require("./ImmutableArray/test-flatMap.js");
var testAsObject = require("./ImmutableArray/test-asObject.js");
var testToMutable = require("./ImmutableArray/test-asMutable.js");

[
  {id: "dev", name: "Development build", src: "../../seamless-immutable.development.js"},
  {id: "prod", name: "Production build",  src: "../../seamless-immutable.production.min.js"}
].forEach(function(config) {
  describe(config.name, function () {
    describe("ImmutableArray", function () {
      testCompat(config);
      testFlatMap(config);
      testAsObject(config);
      testToMutable(config);
    });
  });
});
