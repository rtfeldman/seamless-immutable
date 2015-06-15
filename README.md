seamless-immutable
==================

Immutable JS data structures which are backwards-compatible with normal Arrays and Objects.

Use them in `for` loops, pass them to functions expecting vanilla JavaScript data structures, etc.

```javascript
var array = Immutable(["totally", "immutable", {hammer: "Can’t Touch This"}]);

array[1] = "I'm going to mutate you!"
array[1] // "immutable"

array[2].hammer = "hm, surely I can mutate this nested object..."
array[2].hammer // "Can’t Touch This"

for (var index in array) { console.log(array[index]); }
// "totally"
// "immutable"
// { hammer: 'Can’t Touch This' }

JSON.stringify(array) // '["totally","immutable",{"hammer":"Can’t Touch This"}]'
```

This level of backwards compatibility requires [ECMAScript 5](http://kangax.github.io/compat-table/es5/) features like [Object.defineProperty](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) and [Object.freeze](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) to exist and work correctly, which limits the browsers that can use this library to the ones shown in the test results below. (tl;dr [IE9+](https://saucelabs.com/u/seamless-immutable))

[![build status][1]][2] [![NPM version][3]][4] [![coverage status][5]][6]

[![Sauce Test Status](https://saucelabs.com/browser-matrix/seamless-immutable.svg)](https://saucelabs.com/u/seamless-immutable)

## Performance

Whenever you deeply clone large nested objects, it should typically go much faster with `Immutable` data structures. This is because the library reuses the existing nested objects rather than instantiating new ones.

In the development build, objects are [frozen](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze). (Note that [Safari is relatively slow to iterate over frozen objects](http://jsperf.com/performance-frozen-object/20).) The development build also overrides unsupported methods (methods that ordinarily mutate the underlying data structure) to throw helpful exceptions.

The production (minified) build does neither of these, which significantly improves performance.

## API Overview

`Immutable()` returns a backwards-compatible immutable representation of whatever you pass it, so feel free to pass it absolutely anything that can be serialized as JSON. (As is the case with JSON, objects containing circular references are not allowed. Functions are allowed, unlike in JSON, but they will not be touched.)

Since numbers, strings, `undefined`, and `null` are all immutable to begin with, the only unusual things it returns are Immutable Arrays and Immutable Objects. These have the same [ES5 methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) you’re used to seeing on them, but with these important differences:

1. All the methods that would normally mutate the data structures instead throw `ImmutableError`.
2. All the methods that return a relevant value now return an immutable equivalent of that value.
3. Attempting to reassign values to their elements (e.g. `foo[5] = bar`) will not work. Browsers other than Internet Explorer will throw a `TypeError` if [use strict](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) is enabled, and in all other cases it will fail silently.
4. A few additional methods have been added for convenience.

For example:

```javascript
Immutable([3, 1, 4]).sort()
// This will throw an ImmutableError, because sort() is a mutating method.

Immutable([1, 2, 3]).concat([10, 9, 8]).sort()
// This will also throw ImmutableError, because an Immutable Array's methods
// (including concat()) are guaranteed to return other immutable values.

[1, 2, 3].concat(Immutable([6, 5, 4])).sort()
// This will succeed, and will yield a sorted mutable array containing
// [1, 2, 3, 4, 5, 6], because a vanilla array's concat() method has
// no knowledge of Immutable.

Immutable({all: "your base", are: {belong: "to them"}}).merge({are: {belong: "to us"}})
// This handy new method will return the following:
// Immutable({all: "your base", are: {belong: "to us"}})
```

## Immutable Array

Like a regular Array, but immutable! You can construct these either by passing
an array to `Immutable()`, or simply by passing it multiple arguments:

```javascript
Immutable([1, 2, 3])
// An immutable array containing 1, 2, and 3.

Immutable(1, 2, 3)
// Also an immutable array containing 1, 2, and 3.

Immutable(1)
// Just the number 1 (not an array), as numbers are already immutable in JS.
```

Beyond [the usual Array fare](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#Accessor_methods), the following methods have been added.

### flatMap

```javascript
Immutable(["here", "we", "go"]).flatMap(function(str) {
  return [str, str, str];
});
// returns Immutable(["here", "here", "here", "we", "we", "we", "go", "go", "go"])

Immutable(["drop the numbers!", 3, 2, 1, 0, null, undefined]).flatMap(function(value) {
  if (typeof value === "number") {
    return [];
  } else {
    return value;
  }
});
// returns Immutable(["drop the numbers!", null, undefined])
```

Effectively performs a [map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) over the elements in the array, except that whenever the provided
iterator function returns an Array, that Array's elements are each added to the final result.

### asObject

```javascript
Immutable(["hey", "you"]).asObject(function(str) {
  return [str, str.toUpperCase()];
});
// returns Immutable({hey: "HEY", you: "YOU"})
```

Effectively performs a [map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) over the elements in the array, expecting that the iterator function
will return an array of two elements - the first representing a key, the other
a value. Then returns an Immutable Object constructed of those keys and values.

You can also call `.asObject` without passing an iterator, in which case it will proceed assuming the Array
is already organized as desired.

### asMutable

```javascript
var mutableArray = Immutable(["hello", "world"]).asMutable();

mutableArray.push("!!!");

mutableArray // ["hello", "world", "!!!"]
```

Returns a mutable copy of the array. For a deeply mutable copy, in which any instances of `Immutable` contained in nested data structures within the array have been converted back to mutable data structures, call `.asMutable({deep: true})` instead.

## Immutable Object

Like a regular Object, but immutable! You can construct these by passing an
object to `Immutable()`.

```javascript
Immutable({foo: "bar"})
// An immutable object containing the key "foo" and the value "bar".
```

Beyond [the usual Object fare](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object#Methods_of_Object_instances), the following methods have been added.

### merge

```javascript
Immutable({status: "good", hypothesis: "plausible", errors: 0}).merge({status: "funky", hypothesis: "confirmed"})
// returns Immutable({status: "funky", hypothesis: "confirmed", errors: 0})

Immutable({status: "bad", errors: 37}).merge([
  {status: "funky", errors: 1}, {status: "groovy", errors: 2}, {status: "sweet"}])
// returns Immutable({status: "sweet", errors: 2})
// because passing an Array (or just multiple arguments) is shorthand for
// invoking a separate merge for each object in turn.
```
Returns an Immutable Object containing the properties and values of both
this object and the provided object, prioritizing the provided object's
values whenever the same key is present in both objects.

Multiple objects can be provided in an Array in which case more `merge`
invocations will be performed using each provided object in turn.

A second argument can be provided to perform a deep merge: `{deep: true}`.

### without

```javascript
Immutable({the: "forests", will: "echo", with: "laughter"}).without("with")
// returns Immutable({the: "forests", will: "echo"})

Immutable({the: "forests", will: "echo", with: "laughter"}).without(["will", "with"])
// returns Immutable({the: "forests"})

Immutable({the: "forests", will: "echo", with: "laughter"}).without("will", "with")
// returns Immutable({the: "forests"})
```

Returns an Immutable Object excluding the given keys from the existing object.

Multiple keys can be provided, either in an Array or as extra arguments.

### asMutable

```javascript
var mutableObject = Immutable({when: "the", levee: "breaks"}).asMutable();

mutableObject.have = "no place to go";

mutableObject // {when: "the", levee: "breaks", have: "no place to go"}
```

Returns a mutable copy of the object. For a deeply mutable copy, in which any instances of `Immutable` contained in nested data structures within the object have been converted back to mutable data structures, call `.asMutable({deep: true})` instead.

### Releases

#### 2.4.2

Calling .asMutable({deep: true}) on an Immutable data structure with a nested Date no longer throws an exception.

#### 2.4.1

Arrays with nonstandard prototypes no longer throw exceptions when passed to `Immutable`.

#### 2.4.0

Custom mergers now check for reference equality and abort early if there is no more work needed, allowing improved performance.

#### 2.3.2

Fixes a bug where indices passed into iterators for flatMap and asObject were strings instead of numbers.

#### 2.3.1

Fixes an IE and Firefox bug related to cloning Dates while preserving their prototypes.

#### 2.3.0

Dates now retain their prototypes, the same way Arrays do.

#### 2.2.0

Adds a minified production build with no freezing or defensive unsupported methods, for a ~2x performance boost.

#### 2.1.0

Adds optional `merger` function to `#merge`.

#### 2.0.2

Bugfix: `#merge` with `{deep: true}` no longer attempts (unsuccessfully) to deeply merge arrays as though they were regular objects.

#### 2.0.1

Minor documentation typo fix.

#### 2.0.0

Breaking API change: `#merge` now takes exactly one or exactly two arguments. The second is optional and allows specifying `deep: true`.

#### 1.3.0

Don't bother returning a new value from `#merge` if no changes would result.

#### 1.2.0

Make error message for invalid `#asObject` less fancy, resulting in a performance improvement.

#### 1.1.0

Adds `#asMutable`

#### 1.0.0

Initial stable release

[1]: https://secure.travis-ci.org/rtfeldman/seamless-immutable.svg
[2]: https://travis-ci.org/rtfeldman/seamless-immutable
[3]: https://badge.fury.io/js/seamless-immutable.svg
[4]: https://badge.fury.io/js/seamless-immutable
[5]: http://img.shields.io/coveralls/rtfeldman/seamless-immutable.svg
[6]: https://coveralls.io/r/rtfeldman/seamless-immutable
