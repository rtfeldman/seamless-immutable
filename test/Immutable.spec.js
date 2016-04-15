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
      it("makes an Immutable for Object.create(null)", function () {
        var mutable = Object.create(null);
        var immutable = Immutable(mutable);

        assert.typeOf(immutable, "object");
        assert.isTrue(Immutable.isImmutable(immutable));
        assert.isFalse(Immutable.isImmutable(mutable));
      });


      it("makes an Immutable Array when passed a mutable array", function () {
        TestUtils.check(100, [JSC.array()], function (mutable) {
          var immutable = Immutable(mutable);

          TestUtils.assertJsonEqual(immutable, mutable);
          assert.isTrue(Immutable.isImmutable(immutable));
          assert.isFalse(Immutable.isImmutable(mutable));
        });
      });

      it("makes an Immutable Date when passed a mutable Date", function () {
        TestUtils.check(100, [JSC.literal(new Date())], function (mutable) {
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

          TestUtils.assertJsonEqual(immutable, mutable);
          assert.isTrue(Immutable.isImmutable(immutable));
          assert.isTrue(Immutable.isImmutable(immutable[1]))
        })
      });

      it("doesn't fail when a function is defined on Array.prototype", function() {
        Array.prototype.veryEvilFunction = function() {};
        Immutable([]);
        delete Array.prototype.veryEvilFunction;
      });

      it("returns an object with the given optional prototype", function() {
        function TestClass(o) { _.extend(this, o); };
        var data = new TestClass({a: 1, b: 2});

        var immutable = Immutable(data, {prototype: TestClass.prototype});

        TestUtils.assertJsonEqual(immutable, data);
        TestUtils.assertHasPrototype(immutable, TestClass.prototype);
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

            // should still pass through with a faulty prototype option
            assert.strictEqual(Immutable(value, {prototype: Object.prototype}), value);
          });
        });
      });

      it("detects cycles", function() {
        var obj = {};
        obj.prop = obj;
        var expectedError;

        if (config.id === 'prod') {
          if (typeof window === "undefined") {
            expectedError = RangeError;
          } else if (window.navigator.userAgent.indexOf("MSIE") !== -1) {
            expectedError = Error;
          } else if (window.navigator.userAgent.indexOf("Firefox") !== -1) {
            expectedError = InternalError;
          } else {
            expectedError = RangeError;
          }
        } else {
          expectedError = /deeply nested/;
        }

        assert.throws(function() { Immutable(obj); }, expectedError);
      });

      it("can configure stackRemaining", function() {
        var mutable = {bottom: true};
        _.range(65).forEach(function() {
          mutable = {prop: mutable};
        });

        if (config.id === 'prod') {
          TestUtils.assertJsonEqual(mutable, Immutable(mutable));
        } else {
          assert.throws(function() { Immutable(mutable); }, /deeply nested/);
          TestUtils.assertJsonEqual(mutable, Immutable(mutable, null, 66));
        }
      });
    });
  });
});
