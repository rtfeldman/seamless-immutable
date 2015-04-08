var testMerge   = require("./ImmutableObject/test-merge.js");
var testCompat  = require("./ImmutableObject/test-compat.js");
var testWithout = require("./ImmutableObject/test-without.js");
var testToMutable = require("./ImmutableObject/test-asMutable.js");

[
  {id: "dev", name: "Development build", src: "../../seamless-immutable.development.js"},
  {id: "prod", name: "Production build",  src: "../../seamless-immutable.production.min.js"}
].forEach(function(config) {
  describe(config.name, function () {
    describe("ImmutableObject", function () {
      testCompat(config);
      testMerge(config);
      testWithout(config);
      testToMutable(config);
    });
  });
});
