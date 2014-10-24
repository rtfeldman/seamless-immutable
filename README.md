seamless-immutable
==================

Immutable JS data structures which are backwards compatible with normal Arrays and Objects.

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

[1]: https://secure.travis-ci.org/rtfeldman/seamless-immutable.svg
[2]: https://travis-ci.org/rtfeldman/seamless-immutable
[3]: https://badge.fury.io/js/seamless-immutable.svg
[4]: https://badge.fury.io/js/seamless-immutable
