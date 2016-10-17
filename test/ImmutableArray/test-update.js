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
    return x + "updated";
  }

  describe("#update", function() {
    it("updates an array element using updater function", function () {
      check(100, [ JSC.array([TestUtils.TraversableObjectSpecifier, JSC.any()]) ], function(array) {
        var immutable = Immutable(array);
        var mutable = immutable.asMutable();
        var index = JSC.integer(0, array.length);

        immutable = Immutable.update(immutable, index, dummyUpdater);
        mutable[index] = dummyUpdater(mutable[index]);

        TestUtils.assertJsonEqual(immutable, mutable);
      });
    });
  });

  describe("#updateIn", function() {
    it("updates a property by path using updater function", function () {
      check(100, [ JSC.array([TestUtils.TraversableObjectSpecifier]) ], function(array) {
        var immutable = Immutable(array);
        // var value = JSC.any()();

        var idx = JSC.integer(0, array.length-1);
        var key = JSC.one_of(_.keys(immutable[idx]))();

        var util = require('util');
        function printArr(arr) {
          return '[\n\t>'+_.map(arr, util.inspect).join('\n\t>')+'\n]';
        }

        var mutable = immutable.asMutable();
        TestUtils.assertJsonEqual(immutable, mutable);
        if (Immutable.isImmutable(mutable[idx])) {
          mutable[idx] = mutable[idx].asMutable();
        }
        mutable[idx][key] = dummyUpdater(mutable[idx][key]);

        TestUtils.assertJsonEqual(
          Immutable.updateIn(immutable, [idx, key], dummyUpdater),
          mutable
        );
      });
    });
  });
};
