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
    xit("sets a property by name", function () {
      check(100, [TestUtils.ComplexObjectSpecifier()], function(ob) {
        var immutable = Immutable(ob);
        var mutable = _.assign({}, ob);
        var prop = getPathComponent();
        var value = JSC.any()();

        TestUtils.assertJsonEqual(
          Immutable.set(immutable, prop, value),
          _.set(mutable, prop, value)
        );
      });
    });

    xit("sets a property by name with deep compare if provided the deep flag", function () {
      check(100, [TestUtils.ComplexObjectSpecifier()], function(ob) {
        var immutable = Immutable(ob);
        var mutable = _.assign({}, ob);
        var prop = getPathComponent();
        var value;
        do {
            value = JSC.any()();
        } while (TestUtils.isDeepEqual(value, immutable[prop]));

        var resultImmutable = Immutable.set(immutable, prop, value, {deep: true});
        var resultMutable = _.set(mutable, prop, value);
        TestUtils.assertJsonEqual(
          resultImmutable,
          resultMutable
        );
        assert.notEqual(
          immutable,
          resultImmutable
        );
        assert.equal(
          Immutable.set(resultImmutable, prop, value, {deep: true}),
          resultImmutable
        );
      });
    });

    it("static method continues to work after overriding the instance method", function() {
      var I = Immutable.static;

      var immutable;

      immutable = I({set: 'string'});
      TestUtils.assertJsonEqual(immutable, {set: 'string'});

      immutable = I({});
      immutable = I.set(immutable, 'set', 'string');
      TestUtils.assertJsonEqual(immutable, {set: 'string'});
      immutable = I.set(immutable, 'new_key', 'new_data');
      TestUtils.assertJsonEqual(immutable, {set: 'string', new_key: 'new_data'});
    });

    it("supports non-static syntax", function() {
        var obj = Immutable({});
        obj = obj.set('test', 'test');
        TestUtils.assertJsonEqual(obj, {test: 'test'});
    });
  });


  describe("#setIn", function() {
    xit("sets a property by path", function () {
      check(100, [TestUtils.ComplexObjectSpecifier()], function(ob) {
        var immutable = Immutable(ob);
        var mutable = _.assign({}, ob);

        TestUtils.assertJsonEqual(immutable, mutable);

        var path = [], depth = JSC.integer(1, 5)();
        for (var j = 0; j < depth; j++) {
          path.push(getPathComponent());
        }

        var value;
        do {
            value = JSC.any()();
        } while (TestUtils.isDeepEqual(value, _.get(immutable, path)));

        TestUtils.assertJsonEqual(
          Immutable.setIn(immutable, path, value),
          _.set(mutable, path, value)
        );
      });
    });


    it("handles creating an array for missing index properties", function() {
      var ob = {};
      var path = ["foo", 0, "bar"];
      var val = "val";

      var immutable = Immutable(ob);
      var final = Immutable.setIn(immutable, path, val);

      assert.deepEqual(final, { foo: [{ bar: "val" }] });
    });


    it("handles creating an array for a missing index leaf property", function() {
      var ob = {};
      var path = ["foo", 0];
      var val = "val";

      var immutable = Immutable(ob);
      var final = Immutable.setIn(immutable, path, val);

      assert.deepEqual(final, { foo: ["val"] });
    });


    it("handles setting a numeric key for existing object", function() {
      var ob = {foo: {}};
      var path = ["foo", 0];
      var val = "val";

      var immutable = Immutable(ob);
      var final = Immutable.setIn(immutable, path, val);

      assert.deepEqual(final, { foo: {0: "val"} });
    });


    it("handles setting a new object on existing leaf array correctly", function () {
      var ob = {foo: []};
      var path = ['foo', 0, 'bar'];
      var val = 'val';

      var immutable = Immutable(ob);
      var final = Immutable.setIn(immutable, path, val);

      assert.deepEqual(final, {foo: [{bar: 'val'}]});
    });


    xit("sets a property by path with deep compare if provided the deep flag", function () {
      check(100, [TestUtils.ComplexObjectSpecifier()], function(ob) {
        var immutable = Immutable(ob);
        var mutable = _.assign({}, ob);
        var value = JSC.any()();

        TestUtils.assertJsonEqual(immutable, mutable);

        var path = [], depth = JSC.integer(1, 5)();
        for (var j = 0; j < depth; j++) {
          path.push(getPathComponent());
        }

        var resultImmutable = Immutable.setIn(immutable, path, value, {deep: true});
        var resultMutable = _.set(mutable, path, value);
        TestUtils.assertJsonEqual(
          resultImmutable,
          resultMutable
        );
        assert.notEqual(
          immutable,
          resultImmutable
        );
        assert.equal(
          Immutable.setIn(resultImmutable, path, value, {deep: true}),
          resultImmutable
        );
      });
    });

    it("static method continues to work after overriding the instance method", function() {
      var I = Immutable.static;

      var immutable;

      immutable = I({setIn: 'string'});
      TestUtils.assertJsonEqual(immutable, {setIn: 'string'});

      immutable = I({});
      immutable = I.setIn(immutable, ['setIn'], 'string');
      TestUtils.assertJsonEqual(immutable, {setIn: 'string'});
      immutable = I.setIn(immutable, ['new_key'], 'new_data');
      TestUtils.assertJsonEqual(immutable, {setIn: 'string', new_key: 'new_data'});
    });

    it("supports non-static syntax", function() {
        var obj = Immutable({});
        obj = obj.setIn(['test'], 'test');
        TestUtils.assertJsonEqual(obj, {test: 'test'});
    });
  });
};
