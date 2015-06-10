var JSC          = require("jscheck");
var assert       = require("chai").assert;
var _            = require("lodash");
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
    describe("Immutable", function () {
      it("converts multiple arguments into an array, but leaves single arguments alone", function () {
        TestUtils.check(100, [JSC.array()], function (args) {
          var immutable = Immutable.apply(Immutable, args);

          if (args.length > 1) {
            assert.deepEqual(immutable, Immutable(args));
          } else if (isNaN(immutable) && isNaN(args[0])) {
            assert.ok(true);
          } else {
            assert.strictEqual(immutable, args[0]);
          }
        })
      });

      it("makes an Immutable Array when passed a mutable array", function () {
        TestUtils.check(100, [JSC.array()], function (mutable) {
          var immutable = Immutable(mutable);

          assert.deepEqual(immutable, mutable);
          assert.isTrue(Immutable.isImmutable(immutable));
          assert.isFalse(Immutable.isImmutable(mutable));
        });
      });

      it("makes an Immutable Object when passed a mutable object", function () {
        TestUtils.check(100, [JSC.object()], function (mutable) {
          var immutable = Immutable(mutable);

          assert.typeOf(immutable, "object");
          assert.isTrue(Immutable.isImmutable(immutable));
          assert.isFalse(Immutable.isImmutable(mutable));
        });
      });

      it("makes a deeply Immutable Object when passed a complex mutable object", function () {
        var complexObjFactory = JSC.array([JSC.integer(), JSC.object()]);
        TestUtils.check(100, [complexObjFactory], function (mutable) {
          var immutable = Immutable(mutable);

          assert.deepEqual(immutable, mutable);
          assert.isTrue(Immutable.isImmutable(immutable));
          assert.isTrue(Immutable.isImmutable(immutable[1]))
        })
      })

      it("doesn't fail when a function is defined on Array.prototype", function() {
        Array.prototype.veryEvilFunction = function() {};
        Immutable([]);
        delete Array.prototype.veryEvilFunction;
      });

      // These are already immutable, and should pass through Immutable() untouched.
      _.each({
        "string": JSC.string(),
        "number": JSC.number(),
        "boolean": JSC.boolean(),
        "null": JSC.literal(null),
        "undefined": JSC.literal(undefined)
      }, function (specifier, type) {
        it("simply returns its argument when passed a value of type " + type, function () {
          TestUtils.check(100, [specifier], function (value) {
            assert.strictEqual(Immutable(value), value);
          });
        });
      });
    });
  });
});
