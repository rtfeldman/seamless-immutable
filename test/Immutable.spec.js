require('jsdom-global')()
var JSC          = require("jscheck");
var assert       = require("chai").assert;
var _            = require("lodash");
var React        = require("react");
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
      describe("#from", function() {
        it("is a reference to Immutable", function() {
          assert.equal(Immutable, Immutable.from);
        });
      });

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

      it("makes the promise fulfillment value immutable, but not the promise itself", function() {
        var promise = Promise.resolve([1,2,3]);
        var wrappedPromise = Immutable(promise);

        wrappedPromise.then(result => {
          assert.isTrue(Immutable.isImmutable(result), 'The promise fulfillment value should be immutable');
          assert.isFalse(Immutable.isImmutable(wrappedPromise), 'The promise itself should not be immutable');
        });
      });

      it("doesn't wrap the promise rejection reason", function() {
        var reason = new Error('foo');
        var promise = Promise.reject(reason);
        var wrappedPromise = Immutable(promise);

        wrappedPromise.catch(catchedReason => {
          assert.strictEqual(reason, catchedReason, 'The promise rejection reason should be left untouched');
        });
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

      it("doesn't modify React classes", function() {
        var reactClass = React.createClass({
          render: function() {}
        });
        var factory = React.createFactory(reactClass);

        var component = factory();
        var immutableComponent = Immutable(component);

        assert.typeOf(immutableComponent, 'object');
        assert.isTrue(React.isValidElement(immutableComponent), 'Immutable component was not a valid react element');
        assert.isFalse(Immutable.isImmutable(immutableComponent), 'React element should not be immutable');
        TestUtils.assertJsonEqual(immutableComponent, component);
      });

      it("doesn't modify React elements", function() {
        var reactElement = React.createElement('div');
        var immutableElement = Immutable(reactElement);

        assert.typeOf(immutableElement, 'object');
        assert.isTrue(React.isValidElement(immutableElement), 'Immutable element was not a valid react element');
        assert.isFalse(Immutable.isImmutable(immutableElement), 'React element should not be immutable');
        TestUtils.assertJsonEqual(immutableElement, reactElement);
      });

      it("doesn't modify File objects", function() {
        var file = new File(['part'], 'filename.jpg');
        var immutableFile = Immutable(file);

        assert.isTrue(file instanceof File, "file instanceof File");
        assert.isTrue(immutableFile instanceof File, "immutableFile instanceof File");
        assert.equal(immutableFile, file);
      });

      it("doesnt modify Blob objects", function() {
        var blob = new Blob();
        var immutableBlob = Immutable(blob);

        assert.isTrue(blob instanceof Blob, "blob instanceof Blob");
        assert.isTrue(immutableBlob instanceof Blob, "immutableBlob instanceof Blob");
        assert.equal(immutableBlob, blob);
      });

      it("doesn't modify Error objects", function () {
        var error = new Error('Oh no something bad happened!');
        var immutableError = Immutable(error);
        assert.strictEqual(error, immutableError, 'Immutable should pass the error directly through')
      });

      it("detects cycles", function() {
        var obj = {};
        obj.prop = obj;
        var expectedError;

        if (config.id === 'prod') {
          if (typeof navigator === "undefined") {
            // Node.js
            expectedError = RangeError;
          } else if (navigator.userAgent.indexOf("MSIE") !== -1) {
            // IE9-10
            expectedError = /Out of stack space/;
          } else if (navigator.userAgent.indexOf("Trident") !== -1) {
            // IE11
            expectedError = /Out of stack space/;
          } else if (navigator.userAgent.indexOf("Firefox") !== -1) {
            // Firefox
            expectedError = InternalError;
          } else {
            // Chrome/Safari/Opera
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
