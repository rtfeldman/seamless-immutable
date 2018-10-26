var testCompat    = require("./ImmutableArray/test-compat.js");
var testFlatMap   = require("./ImmutableArray/test-flatMap.js");
var testAsObject  = require("./ImmutableArray/test-asObject.js");
var testAsMutable = require("./ImmutableArray/test-asMutable.js");
var testSet       = require("./ImmutableArray/test-set.js");
var testUpdate    = require("./ImmutableArray/test-update.js");
var testGetIn    = require("./ImmutableArray/test-getIn.js");
var testSortBy    = require("./ImmutableArray/test-sortBy");
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
    describe("ImmutableArray", function () {
      testCompat(config);
      testFlatMap(config);
      testAsObject(config);
      testAsMutable(config);
      testSet(config);
      testUpdate(config);
      testGetIn(config);
      testSortBy(config);
    });
  });
});
