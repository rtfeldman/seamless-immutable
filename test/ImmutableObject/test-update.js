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

  describe("#update", function() {
    it("updates a property using updater function", function () {
      check(100, [TestUtils.TraversableObjectSpecifier], function(ob) {
        var immutable = Immutable(ob);
        var mutable = Immutable.asMutable(immutable, {deep: true});
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
        var mutable = Immutable.asMutable(immutable, {deep: true});
        var prop = 'complex';

        TestUtils.assertJsonEqual(
          Immutable.update(immutable, prop, dummyUpdater, "agr1", 42),
          _.set(mutable, prop, dummyUpdater(_.get(mutable, prop), "agr1", 42))
        );
      });
    });

    it("static method continues to work after overriding the instance method", function() {
      function dummyUpdater(data) {
          return data + '_updated';
      }

      var I = Immutable.static;

      var immutable;

      immutable = I({update: 'string'});
      TestUtils.assertJsonEqual(immutable, {update: 'string'});

      immutable = I({});
      immutable = I.set(immutable, 'update', 'string');
      TestUtils.assertJsonEqual(immutable, {update: 'string'});
      immutable = I.update(immutable, 'update', dummyUpdater);
      TestUtils.assertJsonEqual(immutable, {update: 'string_updated'});

    });

    it("supports non-static syntax", function() {
        function dummyUpdater(data) {
          return data + '_updated';
        }
        var obj = Immutable({test: 'test'});
        obj = obj.update('test', dummyUpdater);
        TestUtils.assertJsonEqual(obj, {test: 'test_updated'});
    });
  });

  describe("#updateIn", function() {
    it("updates a property in path using updater function", function () {
      check(100, [TestUtils.TraversableObjectSpecifier], function(ob) {
        var immutable = Immutable(ob);
        var mutable = Immutable.asMutable(immutable, {deep: true});

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
        var mutable = Immutable.asMutable(immutable, {deep: true});

        TestUtils.assertJsonEqual(immutable, mutable);

        var path = ['deep', 'complex'];

        TestUtils.assertJsonEqual(
          Immutable.updateIn(immutable, path, dummyUpdater, "agr1", 42),
          _.set(mutable, path, dummyUpdater(_.get(mutable, path), "agr1", 42))
        );
      });
    });

    it("static method continues to work after overriding the instance method", function() {
      function dummyUpdater(data) {
          return data + '_updated';
      }

      var I = Immutable.static;

      var immutable;

      immutable = I({updateIn: 'string'});
      TestUtils.assertJsonEqual(immutable, {updateIn: 'string'});

      immutable = I({});
      immutable = I.setIn(immutable, ['updateIn'], 'string');
      TestUtils.assertJsonEqual(immutable, {updateIn: 'string'});
      immutable = I.updateIn(immutable, ['updateIn'], dummyUpdater);
      TestUtils.assertJsonEqual(immutable, {updateIn: 'string_updated'});
    });

    it("supports non-static syntax", function() {
        function dummyUpdater(data) {
          return data + '_updated';
        }
        var obj = Immutable({test: 'test'});
        obj = obj.updateIn(['test'], dummyUpdater);
        TestUtils.assertJsonEqual(obj, {test: 'test_updated'});
    });
  });
};
