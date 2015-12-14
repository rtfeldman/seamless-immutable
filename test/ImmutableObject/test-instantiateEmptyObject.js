var assert       = require("chai").assert;
var _            = require("lodash");
var getTestUtils = require("../TestUtils.js");

module.exports = function(config) {
  var Immutable = config.implementation;
  var TestUtils = getTestUtils(Immutable);

  describe("#instantiateEmptyObject", function() {
    it("return empty single Object if no prototype is present", function() {
      var immutable = Immutable({a: 1, b: 2});

      var obj = immutable.instantiateEmptyObject();
      assert.isFalse(Immutable.isImmutable(obj));
      TestUtils.assertJsonEqual(obj, {});
    });

    it("return object with prototype if prototype is present", function() {
      function TestClass(o) { _.extend(this, o); };
      var immutable = Immutable(new TestClass({a: 1, b: 2}),
        {prototype: TestClass.prototype});

      var obj = immutable.instantiateEmptyObject();
      assert.isFalse(Immutable.isImmutable(obj));
      TestUtils.assertJsonEqual(obj, {});
      TestUtils.assertHasPrototype(obj, TestClass.prototype);
    });
  });
};

