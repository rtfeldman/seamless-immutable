/* (c) 2016, Richard Feldman, github.com/rtfeldman/seamless-immutable/blob/master/LICENSE */!function () {
  "use strict";
  function a(b) {
    function c(a) {
      return "object" == typeof a && !Array.isArray(a) && null !== a;
    }function d(a) {
      var b = Object.getPrototypeOf(a);return b ? Object.create(b) : {};
    }function e(a, b, c) {
      Object.defineProperty(a, b, { enumerable: !1, configurable: !1, writable: !1, value: c });
    }function f(a) {
      e(a, Q, !0);
    }function g(a) {
      return "object" != typeof a || null === a || Boolean(Object.getOwnPropertyDescriptor(a, Q));
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
        return J(c.apply(a, arguments));
      });
    }function m(a, b, c) {
      var d = c && c.deep;if (a in this && (d && this[a] !== b && i(b) && i(this[a]) && (b = J.merge(this[a], b, { deep: !0, mode: "replace" })), h(this[a], b))) return this;var e = t.call(this);return e[a] = J(b), o(e);
    }function n(a, b, c) {
      var d = a[0];if (1 === a.length) return m.call(this, d, b, c);var e,
          f = a.slice(1),
          g = this[d];if ("object" == typeof g && null !== g) e = J.setIn(g, f, b);else {
        var h = f[0];e = "" !== h && isFinite(h) ? n.call(W, f, b) : z.call(X, f, b);
      }if (d in this && g === e) return this;var i = t.call(this);return i[d] = e, o(i);
    }function o(a) {
      for (var b in U) if (U.hasOwnProperty(b)) {
        var c = U[b];l(a, c);
      }P.use_static || (e(a, "flatMap", r), e(a, "asObject", u), e(a, "asMutable", t), e(a, "set", m), e(a, "setIn", n), e(a, "update", B), e(a, "updateIn", D));for (var d = 0, f = a.length; d < f; d++) a[d] = J(a[d]);return k(a, T);
    }function p(a) {
      return P.use_static || e(a, "asMutable", q), k(a, V);
    }function q() {
      return new Date(this.getTime());
    }function r(a) {
      if (0 === arguments.length) return this;var b,
          c = [],
          d = this.length;for (b = 0; b < d; b++) {
        var e = a(this[b], b, this);Array.isArray(e) ? c.push.apply(c, e) : c.push(e);
      }return o(c);
    }function s(a) {
      if ("undefined" == typeof a && 0 === arguments.length) return this;if ("function" != typeof a) {
        var b = Array.isArray(a) ? a.slice() : Array.prototype.slice.call(arguments);b.forEach(function (a, b, c) {
          "number" == typeof a && (c[b] = a.toString());
        }), a = function (a, c) {
          return b.indexOf(c) !== -1;
        };
      }var c = d(this);for (var e in this) this.hasOwnProperty(e) && a(this[e], e) === !1 && (c[e] = this[e]);return G(c);
    }function t(a) {
      var b,
          c,
          d = [];if (a && a.deep) for (b = 0, c = this.length; b < c; b++) d.push(v(this[b]));else for (b = 0, c = this.length; b < c; b++) d.push(this[b]);return d;
    }function u(a) {
      "function" != typeof a && (a = function (a) {
        return a;
      });var b,
          c = {},
          d = this.length;for (b = 0; b < d; b++) {
        var e = a(this[b], b, this),
            f = e[0],
            g = e[1];c[f] = g;
      }return G(c);
    }function v(a) {
      return !a || "object" != typeof a || !Object.getOwnPropertyDescriptor(a, Q) || a instanceof Date ? a : J.asMutable(a, { deep: !0 });
    }function w(a, b) {
      for (var c in a) Object.getOwnPropertyDescriptor(a, c) && (b[c] = a[c]);return b;
    }function x(a, b) {
      function c(a, c, e) {
        var g = J(c[e]),
            j = m && m(a[e], g, b),
            l = a[e];if (void 0 !== f || void 0 !== j || !a.hasOwnProperty(e) || !h(g, l)) {
          var n;n = j ? j : k && i(l) && i(g) ? J.merge(l, g, b) : g, h(l, n) && a.hasOwnProperty(e) || (void 0 === f && (f = w(a, d(a))), f[e] = n);
        }
      }function e(a, b) {
        for (var c in a) b.hasOwnProperty(c) || (void 0 === f && (f = w(a, d(a))), delete f[c]);
      }if (0 === arguments.length) return this;if (null === a || "object" != typeof a) throw new TypeError("Immutable#merge can only be invoked with objects or arrays, not " + JSON.stringify(a));var f,
          g,
          j = Array.isArray(a),
          k = b && b.deep,
          l = b && b.mode || "merge",
          m = b && b.merger;if (j) for (var n = 0, o = a.length; n < o; n++) {
        var p = a[n];for (g in p) p.hasOwnProperty(g) && c(void 0 !== f ? f : this, p, g);
      } else {
        for (g in a) Object.getOwnPropertyDescriptor(a, g) && c(this, a, g);"replace" === l && e(this, a);
      }return void 0 === f ? this : G(f);
    }function y(a, b) {
      var c = b && b.deep;if (0 === arguments.length) return this;if (null === a || "object" != typeof a) throw new TypeError("Immutable#replace can only be invoked with objects or arrays, not " + JSON.stringify(a));return J.merge(this, a, { deep: c, mode: "replace" });
    }function z(a, b, c) {
      if (!(a instanceof Array) || 0 === a.length) throw new TypeError('The first argument to Immutable#setIn must be an array containing at least one "key" string.');var e = a[0];if (1 === a.length) return A.call(this, e, b, c);var f,
          g = a.slice(1),
          h = this[e];if (f = this.hasOwnProperty(e) && "object" == typeof h && null !== h ? J.setIn(h, g, b) : z.call(X, g, b), this.hasOwnProperty(e) && h === f) return this;var i = w(this, d(this));return i[e] = f, G(i);
    }function A(a, b, c) {
      var e = c && c.deep;if (this.hasOwnProperty(a) && (e && this[a] !== b && i(b) && i(this[a]) && (b = J.merge(this[a], b, { deep: !0, mode: "replace" })), h(this[a], b))) return this;var f = w(this, d(this));return f[a] = J(b), G(f);
    }function B(a, b) {
      var c = Array.prototype.slice.call(arguments, 2),
          d = this[a];return J.set(this, a, b.apply(d, [d].concat(c)));
    }function C(a, b) {
      for (var c = 0, d = b.length; null != a && c < d; c++) a = a[b[c]];return c && c == d ? a : void 0;
    }function D(a, b) {
      var c = Array.prototype.slice.call(arguments, 2),
          d = C(this, a);return J.setIn(this, a, b.apply(d, [d].concat(c)));
    }function E(a) {
      var b,
          c = d(this);if (a && a.deep) for (b in this) this.hasOwnProperty(b) && (c[b] = v(this[b]));else for (b in this) this.hasOwnProperty(b) && (c[b] = this[b]);return c;
    }function F() {
      return {};
    }function G(a) {
      return P.use_static || (e(a, "merge", x), e(a, "replace", y), e(a, "without", s), e(a, "asMutable", E), e(a, "set", A), e(a, "setIn", z), e(a, "update", B), e(a, "updateIn", D)), k(a, R);
    }function H(a) {
      return "object" == typeof a && null !== a && (a.$$typeof === O || a.$$typeof === N);
    }function I(a) {
      return "undefined" != typeof File && a instanceof File;
    }function J(a, b, c) {
      if (g(a) || H(a) || I(a)) return a;if (Array.isArray(a)) return o(a.slice());if (a instanceof Date) return p(new Date(a.getTime()));var d = b && b.prototype,
          e = d && d !== Object.prototype ? function () {
        return Object.create(d);
      } : F,
          f = e();for (var h in a) Object.getOwnPropertyDescriptor(a, h) && (f[h] = J(a[h], void 0, c));return G(f);
    }function K(a) {
      function b() {
        var b = [].slice.call(arguments),
            c = b.shift();return a.apply(c, b);
      }return b;
    }function L(a, b) {
      function c() {
        var c = [].slice.call(arguments),
            d = c.shift();return Array.isArray(d) ? b.apply(d, c) : a.apply(d, c);
      }return c;
    }function M(a, b, c) {
      function d() {
        var d = [].slice.call(arguments),
            e = d.shift();return Array.isArray(e) ? b.apply(e, d) : e instanceof Date ? c.apply(e, d) : a.apply(e, d);
      }return d;
    }var N = "function" == typeof Symbol && Symbol["for"] && Symbol["for"]("react.element"),
        O = 60103,
        P = { use_static: !1 };c(b) && void 0 !== b.use_static && (P.use_static = Boolean(b.use_static));var Q = "__immutable_invariants_hold",
        R = ["setPrototypeOf"],
        S = ["keys"],
        T = R.concat(["push", "pop", "sort", "splice", "shift", "unshift", "reverse"]),
        U = S.concat(["map", "filter", "slice", "concat", "reduce", "reduceRight"]),
        V = R.concat(["setDate", "setFullYear", "setHours", "setMilliseconds", "setMinutes", "setMonth", "setSeconds", "setTime", "setUTCDate", "setUTCFullYear", "setUTCHours", "setUTCMilliseconds", "setUTCMinutes", "setUTCMonth", "setUTCSeconds", "setYear"]);j.prototype = Error.prototype;var W = J([]),
        X = J({});return J.from = J, J.isImmutable = g, J.ImmutableError = j, J.merge = K(x), J.replace = K(y), J.without = K(s), J.asMutable = M(E, t, q), J.set = L(A, m), J.setIn = L(z, n), J.update = K(B), J.updateIn = K(D), J.flatMap = K(r), J.asObject = K(u), P.use_static || (J["static"] = a({ use_static: !0 })), Object.freeze(J), J;
  }var b = a();"function" == typeof define && define.amd ? define(function () {
    return b;
  }) : "object" == typeof module ? module.exports = b : "object" == typeof exports ? exports.Immutable = b : "object" == typeof window ? window.Immutable = b : "object" == typeof global && (global.Immutable = b);
}();
