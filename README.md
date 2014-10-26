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

This level of backwards compatibility requires [ECMAScript 5](http://kangax.github.io/compat-table/es5/) features like `Object.defineProperty` and `Object.freeze` to exist and work correctly, which limits the browsers that can use this library to the ones shown in the test results below. (tl;dr IE9+)

[![build status][1]][2] [![NPM version][3]][4]

[![Sauce Test Status](https://saucelabs.com/browser-matrix/seamless-immutable.svg)](https://saucelabs.com/u/seamless-immutable)

## Performance

Deep cloning large, nested objects should typically go much faster with `Immutable` data structures, because the library simply reuses the existing nested objects rather than instantiating new ones.

Note that these objects are [frozen](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze), and [Safari is relatively slow to iterate over frozen objects](http://jsperf.com/performance-frozen-object/20). If this makes a noticeable difference in your use case, you can monkey patch `Object.freeze` to be [the identity function](http://stackoverflow.com/questions/11485508/use-of-the-identity-function-in-javascript) before using `Immutable`, but be aware that this carries the drawback of re-enabling property reassignment like `array[2] = "new value"`.

## API Overview

`Immutable()` returns a backwards-compatible immutable representation of whatever you pass it, so feel free to pass it absolutely anything.

Since numbers, strings, `undefined`, and `null` are all immutable to begin with, the only unusual things it returns are Immutable Arrays and Immutable Objects. These have the same [ES5 methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) you’re used to seeing on them, but with three important differences:

1. All the methods that normally mutate the data structures instead throw `ImmutableError` if you invoke them.
2. All the methods that return a value now return an immutable equivalent of that value.
3. Some additional methods have been added for convenience.

For example:

```javascript
Immutable([3, 1, 4]).sort()
// This will throw an ImmutableError, because sort() is a mutating method.

Immutable([1, 2, 3]).concat([10, 9, 8]).sort()
// This will also throw ImmutableError, because an Immutable Array's methods
// (including concat()) are guaranteed to return other immutable values.

[1, 2, 3].concat(Immutable([6, 5, 4])).sort()
// This will succeed, and will yield a sorted mutable array, because
// a vanilla array's concat() method has no knowledge of Immutable.

Immutable({all: "your base", are: {belong: "to them"}}).merge({are: {belong: "to us"}})
// This handy new method will return the following:
// Immutable({all: "your base", are: {belong: "to us"}})
```

## Immutable Array

Like a regular array, but immutable!

## Immutable Object

Like a regular object, but immutable!

[1]: https://secure.travis-ci.org/rtfeldman/seamless-immutable.svg
[2]: https://travis-ci.org/rtfeldman/seamless-immutable
[3]: https://badge.fury.io/js/seamless-immutable.svg
[4]: https://badge.fury.io/js/seamless-immutable
