/* (c) 2016, Richard Feldman, github.com/rtfeldman/seamless-immutable/blob/master/LICENSE */!function () {
  "use strict";
  function a(b) {
    function c(a) {
      return "object" == typeof a && !Array.isArray(a) && null !== a;
    }function d(a) {
      var b = Object.getPrototypeOf(a);return b ? b === Map.prototype ? new Map() : Object.create(b) : {};
    }function e(a, b, c) {
      Object.defineProperty(a, b, { enumerable: !1, configurable: !1, writable: !1, value: c });
    }function f(a) {
      e(a, R, !0);
    }function g(a) {
      return "object" != typeof a || null === a || Boolean(Object.getOwnPropertyDescriptor(a, R));
    }function h(a, b) {
      return a === b || a !== a && b !== b;
    }function i(a) {
      return !(null === a || "object" != typeof a || Array.isArray(a) || a instanceof Date);
    }function j(a) {
      var b = new Error(a);return b.__proto__ = j, b;
    }function k(a, b) {
      f(a);return a;
    }function l(a, b) {
      var c = a[b];e(a, b, function () {
        return K(c.apply(a, arguments));
      });
    }function m(a, b, c) {
      var d = c && c.deep;if (a in this && (d && this[a] !== b && i(b) && i(this[a]) && (b = K.merge(this[a], b, { deep: !0, mode: "replace" })), h(this[a], b))) return this;var e = u.call(this);return e[a] = K(b), o(e);
    }function n(a, b, c) {
      var d = a[0];if (1 === a.length) return m.call(this, d, b, c);var e,
          f = a.slice(1),
          g = this[d];if ("object" == typeof g && null !== g) e = K.setIn(g, f, b);else {
        var h = f[0];e = "" !== h && isFinite(h) ? n.call(Z, f, b) : A.call($, f, b);
      }if (d in this && g === e) return this;var i = u.call(this);return i[d] = e, o(i);
    }function o(a) {
      for (var b in V) if (V.hasOwnProperty(b)) {
        var c = V[b];l(a, c);
      }Q.use_static || (e(a, "flatMap", s), e(a, "asObject", v), e(a, "asMutable", u), e(a, "set", m), e(a, "setIn", n), e(a, "update", C), e(a, "updateIn", E));for (var d = 0, f = a.length; d < f; d++) a[d] = K(a[d]);return k(a, U);
    }function p(a) {
      for (var b in Y) if (Y.hasOwnProperty(b)) {
        var c = Y[b];l(a, c);
      }return Q.use_static || (e(a, "asObject", v), e(a, "asMutable", u)), a.forEach(function (b, c) {
        a.set(c, K(b));
      }), k(a, X);
    }function q(a) {
      return Q.use_static || e(a, "asMutable", r), k(a, W);
    }function r() {
      return new Date(this.getTime());
    }function s(a) {
      if (0 === arguments.length) return this;var b,
          c = [],
          d = this.length;for (b = 0; b < d; b++) {
        var e = a(this[b], b, this);Array.isArray(e) ? c.push.apply(c, e) : c.push(e);
      }return o(c);
    }function t(a) {
      if ("undefined" == typeof a && 0 === arguments.length) return this;if ("function" != typeof a) {
        var b = Array.isArray(a) ? a.slice() : Array.prototype.slice.call(arguments);b.forEach(function (a, b, c) {
          "number" == typeof a && (c[b] = a.toString());
        }), a = function (a, c) {
          return b.indexOf(c) !== -1;
        };
      }var c = d(this);for (var e in this) this.hasOwnProperty(e) && a(this[e], e) === !1 && (c[e] = this[e]);return H(c);
    }function u(a) {
      var b,
          c,
          d = [];if (a && a.deep) for (b = 0, c = this.length; b < c; b++) d.push(w(this[b]));else for (b = 0, c = this.length; b < c; b++) d.push(this[b]);return d;
    }function v(a) {
      "function" != typeof a && (a = function (a) {
        return a;
      });var b,
          c = {},
          d = this.length || this.size || 0;if (this instanceof Map) this.forEach(function (a, b) {
        c[String(b)] = a;
      });else for (b = 0; b < d; b++) {
        var e = a(this[b], b, this),
            f = e[0],
            g = void 0 !== typeof e[1] ? e[1] : f;c[f] = g;
      }return H(c);
    }function w(a) {
      return !a || "object" != typeof a || !Object.getOwnPropertyDescriptor(a, R) || a instanceof Date ? a : K.asMutable(a, { deep: !0 });
    }function x(a, b) {
      if (a instanceof Map) a.forEach(function (a, c) {
        b instanceof Map ? b.set(c, a) : b[c] = a;
      });else for (var c in a) Object.getOwnPropertyDescriptor(a, c) && (b[c] = a[c]);return b;
    }function y(a, b) {
      function c(a, c, e) {
        var g = c.get ? c.get(e) : c[e],
            j = K(g),
            l = m && m(a[e], j, b),
            n = a[e];if (void 0 !== f || void 0 !== l || !a.hasOwnProperty(e) || !h(j, n)) {
          var o;o = l ? l : k && i(n) && i(j) ? K.merge(n, j, b) : j, h(n, o) && a.hasOwnProperty(e) || (void 0 === f && (f = x(a, d(a))), o = "undefined" != typeof o ? o : e, f instanceof Map ? f.set(e, o) : f[e] = o);
        }
      }function e(a, b) {
        for (var c in a) b.hasOwnProperty(c) || (void 0 === f && (f = x(a, d(a))), delete f[c]);
      }if (0 === arguments.length) return this;if (null === a || "object" != typeof a) throw new TypeError("Immutable#merge can only be invoked with objects or arrays, not " + JSON.stringify(a));var f,
          g,
          j = Array.isArray(a),
          k = b && b.deep,
          l = b && b.mode || "merge",
          m = b && b.merger;if (j || a instanceof Map != !1) {
        if (j) for (var n = 0, o = a.length; n < o; n++) {
          var p = a[n];if (Array.isArray(p) || p === Object(p)) for (g in p) p.hasOwnProperty(g) && c(void 0 !== f ? f : this, p, g);else c(void 0 !== f ? f : this, p, n);
        } else {
          var q = this;a.forEach(function (b, d) {
            c(q, a, d);
          });
        }
      } else {
        for (g in a) Object.getOwnPropertyDescriptor(a, g) && c(this, a, g);"replace" === l && this === Object(this) && e(this, a);
      }return void 0 === f ? this : H(f);
    }function z(a, b) {
      var c = b && b.deep;if (0 === arguments.length) return this;if (null === a || "object" != typeof a) throw new TypeError("Immutable#replace can only be invoked with objects or arrays, not " + JSON.stringify(a));return K.merge(this, a, { deep: c, mode: "replace" });
    }function A(a, b, c) {
      if (!(a instanceof Array) || 0 === a.length) throw new TypeError('The first argument to Immutable#setIn must be an array containing at least one "key" string.');var e = a[0];if (1 === a.length) return B.call(this, e, b, c);var f,
          g = a.slice(1),
          h = this[e];if (f = this.hasOwnProperty(e) && "object" == typeof h && null !== h ? K.setIn(h, g, b) : A.call($, g, b), this.hasOwnProperty(e) && h === f) return this;var i = x(this, d(this));return i[e] = f, H(i);
    }function B(a, b, c) {
      var e = c && c.deep;if (this.hasOwnProperty(a) && (e && this[a] !== b && i(b) && i(this[a]) && (b = K.merge(this[a], b, { deep: !0, mode: "replace" })), h(this[a], b))) return this;var f = x(this, d(this));return f[a] = K(b), H(f);
    }function C(a, b) {
      var c = Array.prototype.slice.call(arguments, 2),
          d = this[a];return K.set(this, a, b.apply(d, [d].concat(c)));
    }function D(a, b) {
      for (var c = 0, d = b.length; null != a && c < d; c++) a = a[b[c]];return c && c == d ? a : void 0;
    }function E(a, b) {
      var c = Array.prototype.slice.call(arguments, 2),
          d = D(this, a);return K.setIn(this, a, b.apply(d, [d].concat(c)));
    }function F(a) {
      var b,
          c = d(this);if (a && a.deep) for (b in this) this.hasOwnProperty(b) && (c[b] = w(this[b]));else if (this.forEach) this.forEach(function (a, b) {
        this && this.has && this.has(b) && (c[b] = a);
      });else for (b in this) this.hasOwnProperty(b) && (c[b] = this[b]);return c;
    }function G() {
      return {};
    }function H(a) {
      return Q.use_static || (e(a, "merge", y), e(a, "replace", z), e(a, "without", t), e(a, "asMutable", F), e(a, "set", B), e(a, "setIn", A), e(a, "update", C), e(a, "updateIn", E)), k(a, T);
    }function I(a) {
      return "object" == typeof a && null !== a && (a.$$typeof === P || a.$$typeof === O);
    }function J(a) {
      return "undefined" != typeof File && a instanceof File;
    }function K(a, b, c) {
      if (g(a) || I(a) || J(a)) return a;if (Array.isArray(a)) return o(a.slice());if (a instanceof Date) return q(new Date(a.getTime()));if (a.constructor === Map) return p(new Map(a));var d = b && b.prototype,
          e = d && d !== Object.prototype ? function () {
        return Object.create(d);
      } : G,
          f = e();for (var h in a) Object.getOwnPropertyDescriptor(a, h) && (f[h] = K(a[h], void 0, c));return H(f);
    }function L(a) {
      function b() {
        var b = [].slice.call(arguments),
            c = b.shift();return a.apply(c, b);
      }return b;
    }function M(a, b) {
      function c() {
        var c = [].slice.call(arguments),
            d = c.shift();return Array.isArray(d) ? b.apply(d, c) : a.apply(d, c);
      }return c;
    }function N(a, b, c) {
      function d() {
        var d = [].slice.call(arguments),
            e = d.shift();return Array.isArray(e) ? b.apply(e, d) : e instanceof Date ? c.apply(e, d) : a.apply(e, d);
      }return d;
    }var O = "function" == typeof Symbol && Symbol["for"] && Symbol["for"]("react.element"),
        P = 60103,
        Q = { use_static: !1 };c(b) && void 0 !== b.use_static && (Q.use_static = Boolean(b.use_static));var R = "__immutable_invariants_hold",
        S = ["keys"],
        T = ["setPrototypeOf"],
        U = T.concat(["push", "pop", "sort", "splice", "shift", "unshift", "reverse"]),
        V = S.concat(["map", "filter", "slice", "concat", "reduce", "reduceRight"]),
        W = T.concat(["setDate", "setFullYear", "setHours", "setMilliseconds", "setMinutes", "setMonth", "setSeconds", "setTime", "setUTCDate", "setUTCFullYear", "setUTCHours", "setUTCMilliseconds", "setUTCMinutes", "setUTCMonth", "setUTCSeconds", "setYear"]),
        X = (T.concat(["delete", "set"]), ["clear", "delete", "set"]),
        Y = T.concat(["size", "entries", "forEach", "get", "has", "keys", "values"]);j.prototype = Error.prototype;var Z = K([]),
        $ = K({});return K.from = K, K.isImmutable = g, K.ImmutableError = j, K.merge = L(y), K.replace = L(z), K.without = L(t), K.asMutable = N(F, u, r), K.set = M(B, m), K.setIn = M(A, n), K.update = L(C), K.updateIn = L(E), K.flatMap = L(s), K.asObject = L(v), Q.use_static || (K["static"] = a({ use_static: !0 })), Object.freeze(K), K;
  }var b = a();"function" == typeof define && define.amd ? define(function () {
    return b;
  }) : "object" == typeof module ? module.exports = b : "object" == typeof exports ? exports.Immutable = b : "object" == typeof window ? window.Immutable = b : "object" == typeof global && (global.Immutable = b);
}();
