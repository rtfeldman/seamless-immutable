var JSC          = require("jscheck");
var assert       = require("chai").assert;
var _            = require("lodash");
var getTestUtils = require("../TestUtils.js");


module.exports = function(config) {
  var Immutable = config.implementation;
  var TestUtils = getTestUtils(Immutable);
  var check     = TestUtils.check;

  function getPathComponent() {
    // It's very convenient to use lodash.set, but it has funky behaviour
    // with numeric keys.
    var s = JSC.string()().replace(/[^\w]/g, '_');
    return /^\d+$/.test(s) ? s + 'a' : s;
  }

  describe("#set", function() {
    it("sets a property by name", function () {
      check(100, [TestUtils.ComplexObjectSpecifier()], function(ob) {
        var clone = _.cloneDeep(ob),
          prop = getPathComponent(),
          value = Math.random();
        assert.deepEqual(
          Immutable(ob).set(prop, value),
          _.set(clone, prop, value)
        );
      });
    });
  });

  describe("#setIn", function() {
    it("sets a property by path", function () {
      check(100, [TestUtils.ComplexObjectSpecifier()], function(ob) {
        var clone = _.cloneDeep(ob),
          value = Math.random();

        assert.deepEqual(Immutable(ob), clone);

        var path = [], depth = 1 + Math.random() * 5;
        for (var j = 0; j < depth; j++) {
          path.push(getPathComponent());
        }

        assert.deepEqual(
          Immutable(ob).setIn(path, value),
          _.set(clone, path, value)
        );
      });
    });
  });
};
