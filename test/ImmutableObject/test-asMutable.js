var JSC          = require("jscheck");
var assert       = require("chai").assert;
var _            = require("lodash");
var getTestUtils = require("../TestUtils.js");

module.exports = function(config) {
  var Immutable = config.implementation;
  var TestUtils = getTestUtils(Immutable);
  var check     = TestUtils.check;

  describe("#asMutable", function() {
    it("returns an empty mutable oject from an empty immutable array", function() {
        var immutable = Immutable({});
        var mutable = Immutable.asMutable(immutable);

        assertNotArray(mutable);
        assertCanBeMutated(mutable);
        assert.isFalse( Immutable.isImmutable(mutable));
        TestUtils.assertJsonEqual(immutable,mutable);
        assert.equal(Object.keys(mutable).length, 0);
    });

    it("returns a shallow mutable copy if not provided the deep flag", function() {
      check(100, [ TestUtils.TraversableObjectSpecifier ], function(obj) {
        var immutable = Immutable(obj);
        var mutable = Immutable.asMutable(immutable);

        assertNotArray(mutable);
        assertCanBeMutated(mutable);
        assert.isFalse(Immutable.isImmutable(mutable));
        TestUtils.assertIsDeeplyImmutable(mutable.complex);
        TestUtils.assertIsDeeplyImmutable(mutable.deep.complex);
        TestUtils.assertJsonEqual(immutable,mutable);
      })
    })

    it("returns a deep mutable copy if provided the deep flag", function() {
      check(100, [ TestUtils.TraversableObjectSpecifier ], function(obj) {
        var immutable = Immutable(obj);
        var mutable = Immutable.asMutable(immutable, { deep: true });

        assertNotArray(mutable);
        assertCanBeMutated(mutable);
        assert.isFalse(Immutable.isImmutable(mutable));
        assert.isFalse(Immutable.isImmutable(mutable['complex']));
        assert.isFalse(Immutable.isImmutable(mutable['deep']['complex']));
        TestUtils.assertJsonEqual(immutable,mutable);
      });
    });

    it("does not throw an error when asMutable deep = true is called on an Immutable with a nested date", function() {
      check(100, [ TestUtils.TraversableObjectSpecifier ], function(obj) {
        var test = Immutable({ testDate: new Date()});
        Immutable.asMutable(test, {deep: true});
      });
    });

    it("preserves prototypes after call to asMutable", function() {
      function TestClass(o) { _.extend(this, o); };
      var data = new TestClass({a: 1, b: 2});

      var immutable = Immutable(data, {prototype: TestClass.prototype});
      var result = Immutable.asMutable(immutable);

      TestUtils.assertJsonEqual(result, data);
      TestUtils.assertHasPrototype(result, TestClass.prototype);
    });

  });

  function assertCanBeMutated(obj) {
    try {
      var newElement = { foo: "bar" };
      var originalKeyCount = Object.keys(obj).length;
      var key = "__test__field__";

      assert.equal(false, obj.hasOwnProperty(key));

      obj[key] = newElement;

      assert.equal(true, obj.hasOwnProperty(key));

      assert.equal(obj[key], newElement);
      assert.equal(Object.keys(obj).length, originalKeyCount + 1);

      delete obj[key];
    } catch(error) {
      assert.fail("Exception when trying to verify that this object was mutable: " + JSON.stringify(obj));
    }
  }

  function assertNotArray(obj) {
    assert(!(obj instanceof Array), "Did not expect an Array, but got one. Got: " + JSON.stringify(obj))
  }
};
