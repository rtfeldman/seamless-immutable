var JSC          = require("jscheck");
var assert       = require("chai").assert;
var _            = require("lodash");
var getTestUtils = require("../TestUtils.js");

module.exports = function(config) {
    var Immutable = config.implementation;
    var TestUtils = getTestUtils(Immutable);
    var check     = TestUtils.check;
    var identityFn = function (x) { return x; }

    describe("#sortBy", function() {
        it('should returns an immutable array', function() {
            var array = Immutable(['foo', 'foo2', 'bar', 'bar2']);
            var sorted = Immutable.sortBy(array, identityFn);
            assert.equal(Immutable.isImmutable(sorted), true);
        })

        it('should returns the same array when it is already sorted', function() {
            var array = Immutable([1, 2, 3, 4]);
            var sorted = Immutable.sortBy(array, identityFn)
            assert.equal(sorted, array)
        })

        it('should order the array in an ascendant way by default', function() {
            var array = Immutable([3, 4, 1, 2]);
            var sorted = Immutable.sortBy(array, identityFn);
            TestUtils.assertJsonEqual(sorted, Immutable([1, 2, 3, 4]));
        })

        it('should order the array in a descendant way', function() {
            var array = Immutable([3, 4, 1, 2]);
            var sorted = Immutable.sortBy(array, identityFn, Immutable.OrderTypes.DESC);
            TestUtils.assertJsonEqual(sorted, Immutable([4, 3, 2, 1]));
        })

        it('should throw an error when you pass in the attribute argument with a type different to a function', function() {
            var array = Immutable([{ age: 1 }, { age: 2 }]);
            var fnWithError = function() {
                Immutable.sortBy(array, 'invalid');
            }
            assert.throws(fnWithError, 'The attribute must be a function that returns the value used to order the array. You got string')
        })

        it('should throw an error if you pass something different to an array as the array param', function() {
            var fnWithError = function() {
                Immutable.sortBy({}, 'invalid');
            }
            assert.throws(fnWithError, 'The first argument must be an array, you got object');
        })

        it('should order an array with object by attribute correctly', function() {
            var fn = function(person) { return person.age }
            var people = Immutable([{ name: 'Josh', age: 34 }, { name: 'Melanie', age: 18 }, { name: 'Mark', age: 44 }]);
            var sortedByAge = Immutable.sortBy(people, fn, Immutable.OrderTypes.ASC);
            var expected = Immutable([{ name: 'Melanie', age: 18 }, { name: 'Josh', age: 34 }, { name: 'Mark', age: 44 }]);
            TestUtils.assertJsonEqual(sortedByAge, expected);
        })
    });
};
