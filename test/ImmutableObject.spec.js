var testMerge     = require("./ImmutableObject/test-merge.js");
var testCompat    = require("./ImmutableObject/test-compat.js");
var testWithout   = require("./ImmutableObject/test-without.js");
var testAsMutable = require("./ImmutableObject/test-asMutable.js");
var devBuild      = require("../seamless-immutable.development.js");
var prodBuild     = require("../seamless-immutable.production.min.js");
var getTestUtils  = require("./TestUtils.js");

[
  {id: "dev",  name: "Development build", implementation: devBuild},
  {id: "prod", name: "Production build",  implementation: prodBuild}
].forEach(function(config) {
  var Immutable = config.implementation;
  var TestUtils = getTestUtils(Immutable);

  describe(config.name, function () {
    describe("ImmutableObject", function () {
      testCompat(config);
      testMerge(config);
      testWithout(config);
      testAsMutable(config);
    });
  });
});
