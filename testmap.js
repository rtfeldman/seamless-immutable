// ./node_modules/.bin/babel seamless-immutable.development.js --out-file map.js

// ./node_modules/.bin/grunt map

// ./node_modules/.bin/grunt map && ./node_modules/.bin/babel seamless-immutable.development.js --out-file map.js

var Imm = require('./map.js');

var that = new Map();
that.set('one', 2);
that.set(10, { one:3, two: {three: 5}})
var those = new Map();
those.set('three', 4);
var thing = Imm.from(that);
var thang = Imm.asObject(thing);
// thang[1] = 3;

var thiz = new Map();
thiz.set(NaN, 2)
thiz.set(10, {one: 1, two: { three: 4}})
var newthing = Imm.merge(thing, thiz, {deep: true});
thiz = Imm.replace(thing, thiz);

thiz.set(5,9)
console.dir([thiz, Imm.merge(thiz, that),those, thiz.constructor , thing, thang, newthing]);


// from, asMutable, asObject, merge
