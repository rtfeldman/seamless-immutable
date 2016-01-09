var JSC          = require("jscheck");
var _            = require("lodash");
var assert       = require("chai").assert;
var devBuild     = require("../seamless-immutable.development.js");
var prodBuild    = require("../seamless-immutable.production.min.js");
var getTestUtils = require("./TestUtils.js");

[
  {id: "dev",  name: "Development build", implementation: devBuild},
  {id: "prod", name: "Production build",  implementation: prodBuild}
].forEach(function(config) {
  var Immutable = config.implementation;
  var TestUtils = getTestUtils(Immutable);

  describe(config.name, function () {
    describe("Immutable.isImmutable", function () {
      _.each({
        "ImmutableArrays": [true, TestUtils.ImmutableArraySpecifier(JSC)],
        "strings": [true, JSC.string()],
        "numbers": [true, JSC.number()],
        "booleans": [true, JSC.boolean()],
        "undefined": [true, JSC.literal(undefined)],
        "null": [true, JSC.literal(null)],
        "objects": [false, JSC.object()],
        "arrays": [false, JSC.array()],
        "dates": [false, JSC.literal(new Date())]
      }, function (tuple, type) {
        var expectImmutable = tuple[0];
        var specifier = tuple[1];

        it("recognizes " + type + (expectImmutable ? " as immutable" : " as MUTABLE"), function () {
          TestUtils.check(100, [specifier], function (value) {
            assert.strictEqual(expectImmutable, Immutable.isImmutable(value));
          });
        });
      });
    });
  });
});
