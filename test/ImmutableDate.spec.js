var testAsMutable = require("./ImmutableDate/test-asMutable.js");
var testCompat    = require("./ImmutableDate/test-compat.js");
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
    describe("ImmutableDate", function () {
      testCompat(config);
      testAsMutable(config);
    });
  });
});
