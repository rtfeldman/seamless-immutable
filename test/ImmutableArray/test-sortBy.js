var JSC = require("jscheck");
var getTestUtils = require("../TestUtils.js");
var assert = require("chai").assert;

module.exports = function(config) {
    var Immutable = config.implementation;
    var TestUtils = getTestUtils(Immutable);
    var check = TestUtils.check;

    function dummySorter(a, b) {
        if(b > a) {
            return 1;
        } else if(b < a) {
            return -1;
        } else {
            return 0;
        }
    }

    describe("#sortBy", function() {
        it("produces a sorted immutable array", function() {
            check(100, [JSC.array(JSC.integer(4), JSC.any())], function(array) {
                var immutable = Immutable(array);
                var mutable = array.slice();

                var resultImmutable = Immutable.sortBy(immutable);
                var resultMutable = mutable.slice();
                resultMutable.sort();

                TestUtils.assertJsonEqual(resultImmutable, resultMutable);
            });
        });

        it("produces a sorted immutable array when provided with a sorter function", function() {
            check(100, [JSC.array(JSC.integer(4), JSC.any())], function(array) {
                var immutable = Immutable(array);
                var mutable = array.slice();

                var resultImmutable = Immutable.sortBy(immutable, dummySorter);
                var resultMutable = mutable.slice();
                resultMutable.sort(dummySorter);

                TestUtils.assertJsonEqual(resultImmutable, resultMutable);
            });
        });

        it("returns the same array if it is already sorted", function() {
            check(100, [JSC.array(JSC.integer(4), JSC.any())], function(array) {
                var mutable = array.slice().sort();
                var immutable = Immutable(mutable);

                var resultImmutable = Immutable.sortBy(immutable);

                assert.strictEqual(resultImmutable, immutable);
            });
        });
    });
};
