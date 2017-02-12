var JSC          = require("jscheck");
var _            = require("lodash");
var getTestUtils = require("../TestUtils.js");


module.exports = function(config) {
  var Immutable = config.implementation;
  var TestUtils = getTestUtils(Immutable);
  var check     = TestUtils.check;

  describe("#getIn", function() {
    it("gets a property by path", function () {
      check(100, [ JSC.array([TestUtils.TraversableObjectSpecifier]) ], function(array) {
        var immutable = Immutable(array);
        var idx = JSC.integer(0, array.length-1);
        var key = JSC.one_of(_.keys(immutable[idx]))();
        var value = immutable[idx][key];

        TestUtils.assertJsonEqual(
          Immutable.getIn(immutable, [idx, key]),
          value
        );
      });
    });

    it("returns the default value if the resolved value is undefined", function () {
      check(100, [TestUtils.ComplexObjectSpecifier()], function(ob) {
        var immutable = Immutable([0,1,2]);

        TestUtils.assertJsonEqual(
          Immutable.getIn(immutable, [3], 'default'),
          'default'
        );
      });
    });

    it("supports non-static syntax", function() {
      var obj = Immutable(['test']);
      obj = obj.getIn([0]);
      TestUtils.assertJsonEqual(obj, 'test');
    });
  });
};


