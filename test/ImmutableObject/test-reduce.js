var JSC          = require("jscheck");
var assert       = require("chai").assert;
var _            = require("lodash");
var getTestUtils = require("../TestUtils.js");


module.exports = function(config) {
  var Immutable = config.implementation;
  var TestUtils = getTestUtils(Immutable);

  describe("#reduce", function() {
    it("static reduces object to array", function () {
        var ob = {
          key1: 'value1',
          key2: {
            key3: 'value3'
          }
        };
        var expected = Immutable([
          ['key1', 'value1'],
          ['key2', { key3: 'value3' }],
        ]);
        var immutable = Immutable(ob);

        TestUtils.assertJsonEqual(
          Immutable.reduce(immutable, function(accumulator, currentValue, key, index, object) {
            return accumulator.concat([[key, currentValue]]);
          }, Immutable([])),
          expected
        );
    });

    it("non-static reduces object to array", function () {
        var ob = {
          key1: 'value1',
          key2: {
            key3: 'value3'
          }
        };
        var expected = Immutable([
          ['key1', 'value1'],
          ['key2', { key3: 'value3' }],
        ]);
        var immutable = Immutable(ob);

        TestUtils.assertJsonEqual(
          immutable.reduce(function(accumulator, currentValue, key, index, object) {
            return accumulator.concat([[key, currentValue]]);
          }, Immutable([])),
          expected
        );
    });
    it("static reduces non-immutable object", function () {
        var ob = {
          key1: 'value1',
          key2: {
            key3: 'value3'
          }
        };
        var expected = [
          ['key1', 'value1'],
          ['key2', { key3: 'value3' }],
        ];

        TestUtils.assertJsonEqual(
          Immutable.reduce(ob, function(accumulator, currentValue, key, index, object) {
            return accumulator.concat([[key, currentValue]]);
          }, Immutable([])),
          expected
        );
    });
  })
}
