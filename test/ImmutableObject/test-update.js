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

  function dummyUpdater (x) {
    return JSON.stringify(x) + "_updated";
  }

  function dummyUpdaterWithAggitionalArgs (x, y, z) {
    return dummyUpdater(x) + y + z;
  }

  describe("#update", function() {
    it("updates a property using updater function", function () {
      check(100, [TestUtils.TraversableObjectSpecifier], function(ob) {
        var immutable = Immutable(ob);
        var mutable = immutable.asMutable({deep: true});
        var prop = 'complex';

        TestUtils.assertJsonEqual(
          Immutable.update(immutable, prop, dummyUpdater),
          _.set(mutable, prop, dummyUpdater(_.get(mutable, prop)))
        );
      });
    });

    it("allows passing additional parameters to updater function", function () {
      check(100, [TestUtils.TraversableObjectSpecifier], function(ob) {
        var immutable = Immutable(ob);
        var mutable = immutable.asMutable({deep: true});
        var prop = 'complex';

        TestUtils.assertJsonEqual(
          Immutable.update(immutable, prop, dummyUpdater, "agr1", 42),
          _.set(mutable, prop, dummyUpdater(_.get(mutable, prop), "agr1", 42))
        );
      });
    });
  });

  describe("#updateIn", function() {
    it("updates a property in path using updater function", function () {
      check(100, [TestUtils.TraversableObjectSpecifier], function(ob) {
        var immutable = Immutable(ob);
        var mutable = immutable.asMutable({deep: true});

        TestUtils.assertJsonEqual(immutable, mutable);

        var path = ['deep', 'complex'];

        TestUtils.assertJsonEqual(
          Immutable.updateIn(immutable, path, dummyUpdater),
          _.set(mutable, path, dummyUpdater(_.get(mutable, path)))
        );
      });
    });

    it("allows passing additional parameters to updater function", function () {
      check(100, [TestUtils.TraversableObjectSpecifier], function(ob) {
        var immutable = Immutable(ob);
        var mutable = immutable.asMutable({deep: true});

        TestUtils.assertJsonEqual(immutable, mutable);

        var path = ['deep', 'complex'];

        TestUtils.assertJsonEqual(
          Immutable.updateIn(immutable, path, dummyUpdater, "agr1", 42),
          _.set(mutable, path, dummyUpdater(_.get(mutable, path), "agr1", 42))
        );
      });
    });
  });
};
