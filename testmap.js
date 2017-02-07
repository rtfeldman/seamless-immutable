// ./node_modules/.bin/babel seamless-immutable.development.js --out-file map.js

// ./node_modules/.bin/grunt map

// ./node_modules/.bin/grunt map && ./node_modules/.bin/babel seamless-immutable.development.js --out-file map.js

var Imm = require('./map.js');
/*
var that = new Map();
that.set('one', 2);
var thing = Imm.from([1,2,3,4,5,6]);

var thang = Imm.asObject(thing);
// thang[1] = 3;

var thiz = new Map();
thiz.set(1, 2)
var newthing = Imm.merge(thing, [2, 2, 3]);
var expected = Imm({all: "your base", are: {belong: "to us"}});
var actual   = Imm({all: "your base", are: {belong: "to them"}})
actual = Imm.merge(actual, {are: {belong: "to us"}})
*/
var one = Imm({
  id: 3,
  list: [1, 3, 5]
});

var two = {
  id: 3,
  list: [2, 4, 6]
};

var arrayConcatMerger = function(current, other) {
  if (current instanceof Array && other instanceof Array) {
    return current.concat(other);
  }

  return;
}

var result = Imm.merge(one, one, {deep: true, mode: 'replace'});

var expected =  {
  id: 3,
  list: [1, 3, 5, 2, 4, 6]
};
console.dir([result, one]);


// from, asMutable, asObject, merge
