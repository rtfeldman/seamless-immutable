var JSC       = require("jscheck");
var _         = require("lodash");
var assert    = require("chai").assert;

[
  {id: "dev", name: "Development build", src: "../seamless-immutable.development.js"},
  {id: "prod", name: "Production build",  src: "../seamless-immutable.production.min.js"}
].forEach(function(config) {
  var Immutable = require(config.src);
  var TestUtils = require("./TestUtils.js")(Immutable);

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
        "arrays": [false, JSC.array()]
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
