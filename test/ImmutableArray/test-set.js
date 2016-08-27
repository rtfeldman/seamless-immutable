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
    it("sets an array element", function () {
      check(100, [ JSC.array([TestUtils.TraversableObjectSpecifier, JSC.any()]) ], function(array) {
        var immutable = Immutable(array);
        var mutable = array.slice();
        var index = JSC.integer(0, array.length);
        var newValue = JSC.any();

        var resultImmutable = Immutable.set(immutable, index, newValue);
        var resultMutable = mutable.slice();
        resultMutable[index] = newValue;

        TestUtils.assertJsonEqual(resultImmutable, resultMutable);
      });
    });

    it("sets an array element with deep compare if provided the deep flag", function () {
      check(100, [ JSC.array([TestUtils.TraversableObjectSpecifier]) ], function(array) {
        var immutable = Immutable(array);
        var mutable = array.slice();
        var index = JSC.integer(0, array.length);
        
        var newValue;
        do {
          value = JSC.any()();
        } while (TestUtils.isDeepEqual(value, array[index]));

        var resultImmutable = immutable.set(index, newValue, {deep: true});
        var resultMutable = mutable.slice();
        resultMutable[index] = newValue;

        TestUtils.assertJsonEqual(
          resultImmutable,
          resultMutable
        );
        assert.notEqual(
          immutable,
          resultImmutable
        );
        assert.equal(
          resultImmutable.set(index, newValue, {deep: true}),
          resultImmutable
        );
      });
    });
  });

  describe("#setIn", function() {
    it("sets a property by path", function () {
      check(100, [ JSC.array([TestUtils.TraversableObjectSpecifier]) ], function(array) {
        var immutable = Immutable(array);
        var mutable = array.slice();
        var value = JSC.any()();

        var idx = JSC.integer(0, array.length-1);
        var key = JSC.one_of(_.keys(immutable[idx]))();

        var util = require('util');
        function printArr(arr) {
          return '[\n\t>'+_.map(arr, util.inspect).join('\n\t>')+'\n]';
        }

        TestUtils.assertJsonEqual(immutable, mutable);
        var resultMutable = mutable.slice();
        resultMutable[idx][key] = value;

        TestUtils.assertJsonEqual(
          Immutable.setIn(immutable, [idx, key], value),
          resultMutable
        );
      });
    });

    it("sets a property by path with deep compare if provided the deep flag", function () {
      check(100, [ JSC.array([TestUtils.TraversableObjectSpecifier]) ], function(array) {
        var immutable = Immutable(array);
        var mutable = array.slice();

        var idx = JSC.integer(0, array.length-1);
        var key = JSC.one_of(_.keys(immutable[idx]))();
        var value;
        do {
          value = JSC.any()();
        } while (TestUtils.isDeepEqual(value, immutable[idx][key]));

        TestUtils.assertJsonEqual(immutable, mutable);

        var resultImmutable = Immutable.setIn(immutable, [idx, key], value, {deep: true});
        var resultMutable = mutable.slice();
        resultMutable[idx][key] = value;
        
        TestUtils.assertJsonEqual(
          resultImmutable,
          resultMutable
        );
        assert.notEqual(
          immutable,
          resultImmutable
        );
        assert.equal(
          Immutable.setIn(resultImmutable, [idx, key], value, {deep: true}),
          resultImmutable
        );
      });
    });
  });
};
