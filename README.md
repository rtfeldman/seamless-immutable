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

[![build status][1]][2] [![NPM version][3]][4]

[![Sauce Test Status](https://saucelabs.com/browser-matrix/seamless-immutable.svg)](https://saucelabs.com/u/seamless-immutable)

## Performance

Whenever you deeply clone large nested objects, it should typically go much faster with `Immutable` data structures. This is because the library reuses the existing nested objects rather than instantiating new ones.

Note that these objects are [frozen](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze), and [Safari is relatively slow to iterate over frozen objects](http://jsperf.com/performance-frozen-object/20). If this makes a noticeable difference in your use case, or if you use libraries like [React](http://reactjs.com) that need to annotate  objects with harmless marker properties, you can monkey patch `Object.freeze` to be [the identity function](http://stackoverflow.com/questions/11485508/use-of-the-identity-function-in-javascript) before using `Immutable`. If you do, be aware that this carries the drawback of re-enabling property reassignment like `array[2] = "new value"`.

## API Overview

`Immutable()` returns a backwards-compatible immutable representation of whatever you pass it, so feel free to pass it absolutely anything.

Since numbers, strings, `undefined`, and `null` are all immutable to begin with, the only unusual things it returns are Immutable Arrays and Immutable Objects. These have the same [ES5 methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) you’re used to seeing on them, but with three important differences:

1. All the methods that would normally mutate the data structures instead throw `ImmutableError`.
2. All the methods that return a relevant value now return an immutable equivalent of that value.
3. A few additional methods have been added for convenience.

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

Beyond the usual Array fare, the following methods have been added.

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

## Immutable Object

Like a regular Object, but immutable! You can construct these by passing an
object to `Immutable()`.

```javascript
Immutable({foo: "bar"})
// An immutable object containing the key "foo" and the value "bar".
```

Beyond the usual Object fare, the following methods have been added.

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

Multiple objects can be provided, either in an Array or as extra arguments,
in which case more `merge` invocations will be performed using each
provided object in turn.

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

[1]: https://secure.travis-ci.org/rtfeldman/seamless-immutable.svg
[2]: https://travis-ci.org/rtfeldman/seamless-immutable
[3]: https://badge.fury.io/js/seamless-immutable.svg
[4]: https://badge.fury.io/js/seamless-immutable
