/*! For license information please see index.min.js.LICENSE.txt */
(() => {
  var e = {
      188: function (e, t, n) {
        var r, o;
        !(function () {
          'use strict';
          (r = function () {
            var e = function () {},
              t = 'undefined',
              n =
                typeof window !== t &&
                typeof window.navigator !== t &&
                /Trident\/|MSIE /.test(window.navigator.userAgent),
              r = ['trace', 'debug', 'info', 'warn', 'error'];
            function o(e, t) {
              var n = e[t];
              if ('function' == typeof n.bind) return n.bind(e);
              try {
                return Function.prototype.bind.call(n, e);
              } catch (t) {
                return function () {
                  return Function.prototype.apply.apply(n, [e, arguments]);
                };
              }
            }
            function i() {
              console.log &&
                (console.log.apply
                  ? console.log.apply(console, arguments)
                  : Function.prototype.apply.apply(console.log, [
                      console,
                      arguments,
                    ])),
                console.trace && console.trace();
            }
            function s(t, n) {
              for (var o = 0; o < r.length; o++) {
                var i = r[o];
                this[i] = o < t ? e : this.methodFactory(i, t, n);
              }
              this.log = this.debug;
            }
            function a(e, n, r) {
              return function () {
                typeof console !== t &&
                  (s.call(this, n, r), this[e].apply(this, arguments));
              };
            }
            function c(r, s, c) {
              return (
                (function (r) {
                  return (
                    'debug' === r && (r = 'log'),
                    typeof console !== t &&
                      ('trace' === r && n
                        ? i
                        : void 0 !== console[r]
                        ? o(console, r)
                        : void 0 !== console.log
                        ? o(console, 'log')
                        : e)
                  );
                })(r) || a.apply(this, arguments)
              );
            }
            function u(e, n, o) {
              var i,
                a = this,
                u = 'loglevel';
              function l() {
                var e;
                if (typeof window !== t) {
                  try {
                    e = window.localStorage[u];
                  } catch (e) {}
                  if (typeof e === t)
                    try {
                      var n = window.document.cookie,
                        r = n.indexOf(encodeURIComponent(u) + '=');
                      -1 !== r && (e = /^([^;]+)/.exec(n.slice(r))[1]);
                    } catch (e) {}
                  return void 0 === a.levels[e] && (e = void 0), e;
                }
              }
              e && (u += ':' + e),
                (a.name = e),
                (a.levels = {
                  TRACE: 0,
                  DEBUG: 1,
                  INFO: 2,
                  WARN: 3,
                  ERROR: 4,
                  SILENT: 5,
                }),
                (a.methodFactory = o || c),
                (a.getLevel = function () {
                  return i;
                }),
                (a.setLevel = function (n, o) {
                  if (
                    ('string' == typeof n &&
                      void 0 !== a.levels[n.toUpperCase()] &&
                      (n = a.levels[n.toUpperCase()]),
                    !('number' == typeof n && n >= 0 && n <= a.levels.SILENT))
                  )
                    throw 'log.setLevel() called with invalid level: ' + n;
                  if (
                    ((i = n),
                    !1 !== o &&
                      (function (e) {
                        var n = (r[e] || 'silent').toUpperCase();
                        if (typeof window !== t) {
                          try {
                            return void (window.localStorage[u] = n);
                          } catch (e) {}
                          try {
                            window.document.cookie =
                              encodeURIComponent(u) + '=' + n + ';';
                          } catch (e) {}
                        }
                      })(n),
                    s.call(a, n, e),
                    typeof console === t && n < a.levels.SILENT)
                  )
                    return 'No console available for logging';
                }),
                (a.setDefaultLevel = function (e) {
                  l() || a.setLevel(e, !1);
                }),
                (a.enableAll = function (e) {
                  a.setLevel(a.levels.TRACE, e);
                }),
                (a.disableAll = function (e) {
                  a.setLevel(a.levels.SILENT, e);
                });
              var d = l();
              null == d && (d = null == n ? 'WARN' : n), a.setLevel(d, !1);
            }
            var l = new u(),
              d = {};
            l.getLogger = function (e) {
              if ('string' != typeof e || '' === e)
                throw new TypeError(
                  'You must supply a name when creating a logger.'
                );
              var t = d[e];
              return (
                t || (t = d[e] = new u(e, l.getLevel(), l.methodFactory)), t
              );
            };
            var f = typeof window !== t ? window.log : void 0;
            return (
              (l.noConflict = function () {
                return (
                  typeof window !== t && window.log === l && (window.log = f), l
                );
              }),
              (l.getLoggers = function () {
                return d;
              }),
              l
            );
          }),
            void 0 === (o = r.call(t, n, t, e)) || (e.exports = o);
        })();
      },
      496: (e, t, n) => {
        'use strict';
        n.r(t), n.d(t, { v1: () => p, v3: () => w, v4: () => S, v5: () => C });
        var r =
            ('undefined' != typeof crypto &&
              crypto.getRandomValues &&
              crypto.getRandomValues.bind(crypto)) ||
            ('undefined' != typeof msCrypto &&
              'function' == typeof msCrypto.getRandomValues &&
              msCrypto.getRandomValues.bind(msCrypto)),
          o = new Uint8Array(16);
        function i() {
          if (!r)
            throw new Error(
              'crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported'
            );
          return r(o);
        }
        for (var s = [], a = 0; a < 256; ++a)
          s[a] = (a + 256).toString(16).substr(1);
        const c = function (e, t) {
          var n = t || 0,
            r = s;
          return [
            r[e[n++]],
            r[e[n++]],
            r[e[n++]],
            r[e[n++]],
            '-',
            r[e[n++]],
            r[e[n++]],
            '-',
            r[e[n++]],
            r[e[n++]],
            '-',
            r[e[n++]],
            r[e[n++]],
            '-',
            r[e[n++]],
            r[e[n++]],
            r[e[n++]],
            r[e[n++]],
            r[e[n++]],
            r[e[n++]],
          ].join('');
        };
        var u,
          l,
          d = 0,
          f = 0;
        const p = function (e, t, n) {
          var r = (t && n) || 0,
            o = t || [],
            s = (e = e || {}).node || u,
            a = void 0 !== e.clockseq ? e.clockseq : l;
          if (null == s || null == a) {
            var p = e.random || (e.rng || i)();
            null == s && (s = u = [1 | p[0], p[1], p[2], p[3], p[4], p[5]]),
              null == a && (a = l = 16383 & ((p[6] << 8) | p[7]));
          }
          var h = void 0 !== e.msecs ? e.msecs : new Date().getTime(),
            v = void 0 !== e.nsecs ? e.nsecs : f + 1,
            y = h - d + (v - f) / 1e4;
          if (
            (y < 0 && void 0 === e.clockseq && (a = (a + 1) & 16383),
            (y < 0 || h > d) && void 0 === e.nsecs && (v = 0),
            v >= 1e4)
          )
            throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
          (d = h), (f = v), (l = a);
          var b = (1e4 * (268435455 & (h += 122192928e5)) + v) % 4294967296;
          (o[r++] = (b >>> 24) & 255),
            (o[r++] = (b >>> 16) & 255),
            (o[r++] = (b >>> 8) & 255),
            (o[r++] = 255 & b);
          var g = ((h / 4294967296) * 1e4) & 268435455;
          (o[r++] = (g >>> 8) & 255),
            (o[r++] = 255 & g),
            (o[r++] = ((g >>> 24) & 15) | 16),
            (o[r++] = (g >>> 16) & 255),
            (o[r++] = (a >>> 8) | 128),
            (o[r++] = 255 & a);
          for (var _ = 0; _ < 6; ++_) o[r + _] = s[_];
          return t || c(o);
        };
        function h(e, t, n) {
          var r = function (e, r, o, i) {
            var s = (o && i) || 0;
            if (
              ('string' == typeof e &&
                (e = (function (e) {
                  e = unescape(encodeURIComponent(e));
                  for (var t = new Array(e.length), n = 0; n < e.length; n++)
                    t[n] = e.charCodeAt(n);
                  return t;
                })(e)),
              'string' == typeof r &&
                (r = (function (e) {
                  var t = [];
                  return (
                    e.replace(/[a-fA-F0-9]{2}/g, function (e) {
                      t.push(parseInt(e, 16));
                    }),
                    t
                  );
                })(r)),
              !Array.isArray(e))
            )
              throw TypeError('value must be an array of bytes');
            if (!Array.isArray(r) || 16 !== r.length)
              throw TypeError(
                'namespace must be uuid string or an Array of 16 byte values'
              );
            var a = n(r.concat(e));
            if (((a[6] = (15 & a[6]) | t), (a[8] = (63 & a[8]) | 128), o))
              for (var u = 0; u < 16; ++u) o[s + u] = a[u];
            return o || c(a);
          };
          try {
            r.name = e;
          } catch (e) {}
          return (
            (r.DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'),
            (r.URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8'),
            r
          );
        }
        function v(e, t) {
          var n = (65535 & e) + (65535 & t);
          return (((e >> 16) + (t >> 16) + (n >> 16)) << 16) | (65535 & n);
        }
        function y(e, t, n, r, o, i) {
          return v(
            ((s = v(v(t, e), v(r, i))) << (a = o)) | (s >>> (32 - a)),
            n
          );
        }
        function b(e, t, n, r, o, i, s) {
          return y((t & n) | (~t & r), e, t, o, i, s);
        }
        function g(e, t, n, r, o, i, s) {
          return y((t & r) | (n & ~r), e, t, o, i, s);
        }
        function _(e, t, n, r, o, i, s) {
          return y(t ^ n ^ r, e, t, o, i, s);
        }
        function m(e, t, n, r, o, i, s) {
          return y(n ^ (t | ~r), e, t, o, i, s);
        }
        const w = h('v3', 48, function (e) {
            if ('string' == typeof e) {
              var t = unescape(encodeURIComponent(e));
              e = new Array(t.length);
              for (var n = 0; n < t.length; n++) e[n] = t.charCodeAt(n);
            }
            return (function (e) {
              var t,
                n,
                r,
                o = [],
                i = 32 * e.length,
                s = '0123456789abcdef';
              for (t = 0; t < i; t += 8)
                (n = (e[t >> 5] >>> t % 32) & 255),
                  (r = parseInt(
                    s.charAt((n >>> 4) & 15) + s.charAt(15 & n),
                    16
                  )),
                  o.push(r);
              return o;
            })(
              (function (e, t) {
                var n, r, o, i, s;
                (e[t >> 5] |= 128 << t % 32),
                  (e[14 + (((t + 64) >>> 9) << 4)] = t);
                var a = 1732584193,
                  c = -271733879,
                  u = -1732584194,
                  l = 271733878;
                for (n = 0; n < e.length; n += 16)
                  (r = a),
                    (o = c),
                    (i = u),
                    (s = l),
                    (a = b(a, c, u, l, e[n], 7, -680876936)),
                    (l = b(l, a, c, u, e[n + 1], 12, -389564586)),
                    (u = b(u, l, a, c, e[n + 2], 17, 606105819)),
                    (c = b(c, u, l, a, e[n + 3], 22, -1044525330)),
                    (a = b(a, c, u, l, e[n + 4], 7, -176418897)),
                    (l = b(l, a, c, u, e[n + 5], 12, 1200080426)),
                    (u = b(u, l, a, c, e[n + 6], 17, -1473231341)),
                    (c = b(c, u, l, a, e[n + 7], 22, -45705983)),
                    (a = b(a, c, u, l, e[n + 8], 7, 1770035416)),
                    (l = b(l, a, c, u, e[n + 9], 12, -1958414417)),
                    (u = b(u, l, a, c, e[n + 10], 17, -42063)),
                    (c = b(c, u, l, a, e[n + 11], 22, -1990404162)),
                    (a = b(a, c, u, l, e[n + 12], 7, 1804603682)),
                    (l = b(l, a, c, u, e[n + 13], 12, -40341101)),
                    (u = b(u, l, a, c, e[n + 14], 17, -1502002290)),
                    (a = g(
                      a,
                      (c = b(c, u, l, a, e[n + 15], 22, 1236535329)),
                      u,
                      l,
                      e[n + 1],
                      5,
                      -165796510
                    )),
                    (l = g(l, a, c, u, e[n + 6], 9, -1069501632)),
                    (u = g(u, l, a, c, e[n + 11], 14, 643717713)),
                    (c = g(c, u, l, a, e[n], 20, -373897302)),
                    (a = g(a, c, u, l, e[n + 5], 5, -701558691)),
                    (l = g(l, a, c, u, e[n + 10], 9, 38016083)),
                    (u = g(u, l, a, c, e[n + 15], 14, -660478335)),
                    (c = g(c, u, l, a, e[n + 4], 20, -405537848)),
                    (a = g(a, c, u, l, e[n + 9], 5, 568446438)),
                    (l = g(l, a, c, u, e[n + 14], 9, -1019803690)),
                    (u = g(u, l, a, c, e[n + 3], 14, -187363961)),
                    (c = g(c, u, l, a, e[n + 8], 20, 1163531501)),
                    (a = g(a, c, u, l, e[n + 13], 5, -1444681467)),
                    (l = g(l, a, c, u, e[n + 2], 9, -51403784)),
                    (u = g(u, l, a, c, e[n + 7], 14, 1735328473)),
                    (a = _(
                      a,
                      (c = g(c, u, l, a, e[n + 12], 20, -1926607734)),
                      u,
                      l,
                      e[n + 5],
                      4,
                      -378558
                    )),
                    (l = _(l, a, c, u, e[n + 8], 11, -2022574463)),
                    (u = _(u, l, a, c, e[n + 11], 16, 1839030562)),
                    (c = _(c, u, l, a, e[n + 14], 23, -35309556)),
                    (a = _(a, c, u, l, e[n + 1], 4, -1530992060)),
                    (l = _(l, a, c, u, e[n + 4], 11, 1272893353)),
                    (u = _(u, l, a, c, e[n + 7], 16, -155497632)),
                    (c = _(c, u, l, a, e[n + 10], 23, -1094730640)),
                    (a = _(a, c, u, l, e[n + 13], 4, 681279174)),
                    (l = _(l, a, c, u, e[n], 11, -358537222)),
                    (u = _(u, l, a, c, e[n + 3], 16, -722521979)),
                    (c = _(c, u, l, a, e[n + 6], 23, 76029189)),
                    (a = _(a, c, u, l, e[n + 9], 4, -640364487)),
                    (l = _(l, a, c, u, e[n + 12], 11, -421815835)),
                    (u = _(u, l, a, c, e[n + 15], 16, 530742520)),
                    (a = m(
                      a,
                      (c = _(c, u, l, a, e[n + 2], 23, -995338651)),
                      u,
                      l,
                      e[n],
                      6,
                      -198630844
                    )),
                    (l = m(l, a, c, u, e[n + 7], 10, 1126891415)),
                    (u = m(u, l, a, c, e[n + 14], 15, -1416354905)),
                    (c = m(c, u, l, a, e[n + 5], 21, -57434055)),
                    (a = m(a, c, u, l, e[n + 12], 6, 1700485571)),
                    (l = m(l, a, c, u, e[n + 3], 10, -1894986606)),
                    (u = m(u, l, a, c, e[n + 10], 15, -1051523)),
                    (c = m(c, u, l, a, e[n + 1], 21, -2054922799)),
                    (a = m(a, c, u, l, e[n + 8], 6, 1873313359)),
                    (l = m(l, a, c, u, e[n + 15], 10, -30611744)),
                    (u = m(u, l, a, c, e[n + 6], 15, -1560198380)),
                    (c = m(c, u, l, a, e[n + 13], 21, 1309151649)),
                    (a = m(a, c, u, l, e[n + 4], 6, -145523070)),
                    (l = m(l, a, c, u, e[n + 11], 10, -1120210379)),
                    (u = m(u, l, a, c, e[n + 2], 15, 718787259)),
                    (c = m(c, u, l, a, e[n + 9], 21, -343485551)),
                    (a = v(a, r)),
                    (c = v(c, o)),
                    (u = v(u, i)),
                    (l = v(l, s));
                return [a, c, u, l];
              })(
                (function (e) {
                  var t,
                    n = [];
                  for (
                    n[(e.length >> 2) - 1] = void 0, t = 0;
                    t < n.length;
                    t += 1
                  )
                    n[t] = 0;
                  var r = 8 * e.length;
                  for (t = 0; t < r; t += 8)
                    n[t >> 5] |= (255 & e[t / 8]) << t % 32;
                  return n;
                })(e),
                8 * e.length
              )
            );
          }),
          S = function (e, t, n) {
            var r = (t && n) || 0;
            'string' == typeof e &&
              ((t = 'binary' === e ? new Array(16) : null), (e = null));
            var o = (e = e || {}).random || (e.rng || i)();
            if (((o[6] = (15 & o[6]) | 64), (o[8] = (63 & o[8]) | 128), t))
              for (var s = 0; s < 16; ++s) t[r + s] = o[s];
            return t || c(o);
          };
        function O(e, t, n, r) {
          switch (e) {
            case 0:
              return (t & n) ^ (~t & r);
            case 1:
            case 3:
              return t ^ n ^ r;
            case 2:
              return (t & n) ^ (t & r) ^ (n & r);
          }
        }
        function I(e, t) {
          return (e << t) | (e >>> (32 - t));
        }
        const C = h('v5', 80, function (e) {
          var t = [1518500249, 1859775393, 2400959708, 3395469782],
            n = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
          if ('string' == typeof e) {
            var r = unescape(encodeURIComponent(e));
            e = new Array(r.length);
            for (var o = 0; o < r.length; o++) e[o] = r.charCodeAt(o);
          }
          e.push(128);
          var i = e.length / 4 + 2,
            s = Math.ceil(i / 16),
            a = new Array(s);
          for (o = 0; o < s; o++) {
            a[o] = new Array(16);
            for (var c = 0; c < 16; c++)
              a[o][c] =
                (e[64 * o + 4 * c] << 24) |
                (e[64 * o + 4 * c + 1] << 16) |
                (e[64 * o + 4 * c + 2] << 8) |
                e[64 * o + 4 * c + 3];
          }
          for (
            a[s - 1][14] = (8 * (e.length - 1)) / Math.pow(2, 32),
              a[s - 1][14] = Math.floor(a[s - 1][14]),
              a[s - 1][15] = (8 * (e.length - 1)) & 4294967295,
              o = 0;
            o < s;
            o++
          ) {
            for (var u = new Array(80), l = 0; l < 16; l++) u[l] = a[o][l];
            for (l = 16; l < 80; l++)
              u[l] = I(u[l - 3] ^ u[l - 8] ^ u[l - 14] ^ u[l - 16], 1);
            var d = n[0],
              f = n[1],
              p = n[2],
              h = n[3],
              v = n[4];
            for (l = 0; l < 80; l++) {
              var y = Math.floor(l / 20),
                b = (I(d, 5) + O(y, f, p, h) + v + t[y] + u[l]) >>> 0;
              (v = h), (h = p), (p = I(f, 30) >>> 0), (f = d), (d = b);
            }
            (n[0] = (n[0] + d) >>> 0),
              (n[1] = (n[1] + f) >>> 0),
              (n[2] = (n[2] + p) >>> 0),
              (n[3] = (n[3] + h) >>> 0),
              (n[4] = (n[4] + v) >>> 0);
          }
          return [
            (n[0] >> 24) & 255,
            (n[0] >> 16) & 255,
            (n[0] >> 8) & 255,
            255 & n[0],
            (n[1] >> 24) & 255,
            (n[1] >> 16) & 255,
            (n[1] >> 8) & 255,
            255 & n[1],
            (n[2] >> 24) & 255,
            (n[2] >> 16) & 255,
            (n[2] >> 8) & 255,
            255 & n[2],
            (n[3] >> 24) & 255,
            (n[3] >> 16) & 255,
            (n[3] >> 8) & 255,
            255 & n[3],
            (n[4] >> 24) & 255,
            (n[4] >> 16) & 255,
            (n[4] >> 8) & 255,
            255 & n[4],
          ];
        });
      },
      401: function (e, t, n) {
        'use strict';
        var r =
            (this && this.__awaiter) ||
            function (e, t, n, r) {
              return new (n || (n = Promise))(function (o, i) {
                function s(e) {
                  try {
                    c(r.next(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function a(e) {
                  try {
                    c(r.throw(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function c(e) {
                  var t;
                  e.done
                    ? o(e.value)
                    : ((t = e.value),
                      t instanceof n
                        ? t
                        : new n(function (e) {
                            e(t);
                          })).then(s, a);
                }
                c((r = r.apply(e, t || [])).next());
              });
            },
          o =
            (this && this.__generator) ||
            function (e, t) {
              var n,
                r,
                o,
                i,
                s = {
                  label: 0,
                  sent: function () {
                    if (1 & o[0]) throw o[1];
                    return o[1];
                  },
                  trys: [],
                  ops: [],
                };
              return (
                (i = { next: a(0), throw: a(1), return: a(2) }),
                'function' == typeof Symbol &&
                  (i[Symbol.iterator] = function () {
                    return this;
                  }),
                i
              );
              function a(a) {
                return function (c) {
                  return (function (a) {
                    if (n)
                      throw new TypeError('Generator is already executing.');
                    for (; i && ((i = 0), a[0] && (s = 0)), s; )
                      try {
                        if (
                          ((n = 1),
                          r &&
                            (o =
                              2 & a[0]
                                ? r.return
                                : a[0]
                                ? r.throw || ((o = r.return) && o.call(r), 0)
                                : r.next) &&
                            !(o = o.call(r, a[1])).done)
                        )
                          return o;
                        switch (
                          ((r = 0), o && (a = [2 & a[0], o.value]), a[0])
                        ) {
                          case 0:
                          case 1:
                            o = a;
                            break;
                          case 4:
                            return s.label++, { value: a[1], done: !1 };
                          case 5:
                            s.label++, (r = a[1]), (a = [0]);
                            continue;
                          case 7:
                            (a = s.ops.pop()), s.trys.pop();
                            continue;
                          default:
                            if (
                              !(
                                (o =
                                  (o = s.trys).length > 0 && o[o.length - 1]) ||
                                (6 !== a[0] && 2 !== a[0])
                              )
                            ) {
                              s = 0;
                              continue;
                            }
                            if (
                              3 === a[0] &&
                              (!o || (a[1] > o[0] && a[1] < o[3]))
                            ) {
                              s.label = a[1];
                              break;
                            }
                            if (6 === a[0] && s.label < o[1]) {
                              (s.label = o[1]), (o = a);
                              break;
                            }
                            if (o && s.label < o[2]) {
                              (s.label = o[2]), s.ops.push(a);
                              break;
                            }
                            o[2] && s.ops.pop(), s.trys.pop();
                            continue;
                        }
                        a = t.call(e, s);
                      } catch (e) {
                        (a = [6, e]), (r = 0);
                      } finally {
                        n = o = 0;
                      }
                    if (5 & a[0]) throw a[1];
                    return { value: a[0] ? a[1] : void 0, done: !0 };
                  })([a, c]);
                };
              }
            },
          i =
            (this && this.__importDefault) ||
            function (e) {
              return e && e.__esModule ? e : { default: e };
            };
        Object.defineProperty(t, '__esModule', { value: !0 });
        var s = n(496),
          a = i(n(955)),
          c = i(n(351)),
          u = i(n(6)),
          l = n(403),
          d = i(n(810)),
          f = n(789),
          p = n(291),
          h = n(629),
          v = n(858),
          y = n(537),
          b = (function () {
            function e(e) {
              if (
                ((this.options = e),
                (this.uuid = (0, s.v4)()),
                (this.sessionid = ''),
                (this.subscriptions = {}),
                (this.expiresAt = 0),
                (this.signature = null),
                (this.relayProtocol = null),
                (this.contexts = []),
                (this.timeoutErrorCode = -32e3),
                (this.connection = null),
                (this._jwtAuth = !1),
                (this._doKeepAlive = !1),
                (this._autoReconnect = !0),
                (this._idle = !1),
                (this._executeQueue = []),
                !this.validateOptions())
              )
                throw new Error('Invalid init options');
              (this._onSocketOpen = this._onSocketOpen.bind(this)),
                (this._onSocketCloseOrError =
                  this._onSocketCloseOrError.bind(this)),
                (this._onSocketMessage = this._onSocketMessage.bind(this)),
                (this._handleLoginError = this._handleLoginError.bind(this)),
                (this._checkTokenExpiration =
                  this._checkTokenExpiration.bind(this)),
                this._attachListeners(),
                (this.connection = new c.default(this));
            }
            return (
              Object.defineProperty(e.prototype, '__logger', {
                get: function () {
                  return a.default;
                },
                enumerable: !1,
                configurable: !0,
              }),
              Object.defineProperty(e.prototype, 'connected', {
                get: function () {
                  return this.connection && this.connection.connected;
                },
                enumerable: !1,
                configurable: !0,
              }),
              Object.defineProperty(e.prototype, 'expired', {
                get: function () {
                  return this.expiresAt && this.expiresAt <= Date.now() / 1e3;
                },
                enumerable: !1,
                configurable: !0,
              }),
              Object.defineProperty(e.prototype, 'reconnectDelay', {
                get: function () {
                  return 1e3 * (0, v.randomInt)(6, 2);
                },
                enumerable: !1,
                configurable: !0,
              }),
              (e.prototype.execute = function (e) {
                var t = this;
                return this._idle
                  ? new Promise(function (n) {
                      return t._executeQueue.push({ resolve: n, msg: e });
                    })
                  : this.connected
                  ? this.connection.send(e).catch(function (e) {
                      throw (
                        (e.code &&
                          e.code === t.timeoutErrorCode &&
                          t._closeConnection(),
                        e)
                      );
                    })
                  : new Promise(function (n) {
                      t._executeQueue.push({ resolve: n, msg: e }), t.connect();
                    });
              }),
              (e.prototype.executeRaw = function (e) {
                this._idle
                  ? this._executeQueue.push({ msg: e })
                  : this.connection.sendRawText(e);
              }),
              (e.prototype.validateOptions = function () {
                var e = this.options,
                  t = e.project,
                  n = void 0 !== t && t,
                  r = e.token;
                return Boolean(n && void 0 !== r && r);
              }),
              (e.prototype.broadcast = function (e) {}),
              (e.prototype.subscribe = function (e) {
                var t = e.protocol,
                  n = e.channels,
                  i = e.handler;
                return r(this, void 0, void 0, function () {
                  var e,
                    r,
                    s,
                    a,
                    c,
                    u,
                    l = this;
                  return o(this, function (o) {
                    switch (o.label) {
                      case 0:
                        return (
                          (e = new h.Subscription({
                            command: f.ADD,
                            protocol: t,
                            channels: n,
                          })),
                          [4, this.execute(e)]
                        );
                      case 1:
                        return (
                          (r = o.sent()),
                          (s = r.failed_channels),
                          (a = void 0 === s ? [] : s),
                          (c = r.subscribe_channels),
                          (u = void 0 === c ? [] : c),
                          a.length &&
                            a.forEach(function (e) {
                              return l._removeSubscription(t, e);
                            }),
                          u.forEach(function (e) {
                            return l._addSubscription(t, i, e);
                          }),
                          [2, r]
                        );
                    }
                  });
                });
              }),
              (e.prototype.unsubscribe = function (e) {
                var t = e.protocol,
                  n = e.channels;
                return (
                  e.handler,
                  r(this, void 0, void 0, function () {
                    var e;
                    return o(this, function (r) {
                      return (
                        (e = new h.Subscription({
                          command: f.REMOVE,
                          protocol: t,
                          channels: n,
                        })),
                        [2, this.execute(e)]
                      );
                    });
                  })
                );
              }),
              (e.prototype.disconnect = function () {
                return r(this, void 0, void 0, function () {
                  return o(this, function (e) {
                    switch (e.label) {
                      case 0:
                        return (
                          clearTimeout(this._reconnectTimeout),
                          (this.subscriptions = {}),
                          (this._autoReconnect = !1),
                          (this.relayProtocol = null),
                          this._closeConnection(),
                          [4, y.sessionStorage.removeItem(this.signature)]
                        );
                      case 1:
                        return (
                          e.sent(),
                          (this._executeQueue = []),
                          this._detachListeners(),
                          [2]
                        );
                    }
                  });
                });
              }),
              (e.prototype.on = function (e, t) {
                return (0, l.register)(e, t, this.uuid), this;
              }),
              (e.prototype.off = function (e, t) {
                return (0, l.deRegister)(e, t, this.uuid), this;
              }),
              (e.prototype.refreshToken = function (e) {
                return r(this, void 0, void 0, function () {
                  var t, n, r, i, s, c;
                  return o(this, function (o) {
                    switch (o.label) {
                      case 0:
                        (this.options.token = e), (o.label = 1);
                      case 1:
                        return (
                          o.trys.push([1, 6, , 7]),
                          this.expired ? [4, this.connect()] : [3, 3]
                        );
                      case 2:
                        return o.sent(), [3, 5];
                      case 3:
                        return (
                          (t = new h.Reauthenticate(
                            this.options.project,
                            e,
                            this.sessionid
                          )),
                          [4, this.execute(t)]
                        );
                      case 4:
                        (n = o.sent()),
                          (r = n.authorization),
                          (i = (void 0 === r ? {} : r).expires_at),
                          (s = void 0 === i ? null : i),
                          (this.expiresAt = +s || 0),
                          (o.label = 5);
                      case 5:
                        return [3, 7];
                      case 6:
                        return (
                          (c = o.sent()),
                          a.default.error('refreshToken error:', c),
                          (0, l.trigger)(f.SwEvent.Error, c, this.uuid, !1),
                          [3, 7]
                        );
                      case 7:
                        return [2];
                    }
                  });
                });
              }),
              (e.prototype.connect = function () {
                return r(this, void 0, void 0, function () {
                  return o(this, function (e) {
                    return (
                      this.connection ||
                        (this.connection = new c.default(this)),
                      this._attachListeners(),
                      this.connection.isAlive || this.connection.connect(),
                      [2]
                    );
                  });
                });
              }),
              (e.prototype._handleLoginError = function (e) {
                (0, l.trigger)(f.SwEvent.Error, e, this.uuid);
              }),
              (e.prototype._onSocketOpen = function () {
                return r(this, void 0, void 0, function () {
                  var e, t, n, r, i, s, c, d, p, v, y, b, g, _, m, w, S;
                  return o(this, function (o) {
                    switch (o.label) {
                      case 0:
                        return (
                          (this._idle = !1),
                          (e = this._jwtAuth ? 'jwt_token' : 'token'),
                          (t = this.options),
                          (n = t.project),
                          (r = t.token),
                          (i = new h.Connect(
                            (((S = { project: n })[e] = r), S),
                            this.sessionid
                          )),
                          [4, this.execute(i).catch(this._handleLoginError)]
                        );
                      case 1:
                        return (s = o.sent())
                          ? ((this._autoReconnect = !0),
                            (c = s.sessionid),
                            (d = s.nodeid),
                            (p = s.master_nodeid),
                            (v = s.authorization),
                            (b = (y = void 0 === v ? {} : v).expires_at),
                            (g = void 0 === b ? null : b),
                            (_ = y.signature),
                            (m = void 0 === _ ? null : _),
                            (this.expiresAt = +g || 0),
                            (this.signature = m),
                            (w = this),
                            [4, (0, u.default)(this)])
                          : [3, 3];
                      case 2:
                        (w.relayProtocol = o.sent()),
                          this._checkTokenExpiration(),
                          (this.sessionid = c),
                          (this.nodeid = d),
                          (this.master_nodeid = p),
                          this._emptyExecuteQueues(),
                          (this._pong = null),
                          this._keepAlive(),
                          this._handleBladeConnectResponse(s),
                          (0, l.trigger)(f.SwEvent.Ready, this, this.uuid),
                          a.default.info('Session Ready!'),
                          (o.label = 3);
                      case 3:
                        return [2];
                    }
                  });
                });
              }),
              (e.prototype._handleBladeConnectResponse = function (e) {}),
              (e.prototype._onSocketCloseOrError = function (e) {
                var t = this;
                for (var n in (a.default.error(
                  'Socket '.concat(e.type, ' ').concat(e.message)
                ),
                this.relayProtocol && (0, l.deRegisterAll)(this.relayProtocol),
                this.subscriptions))
                  (0, l.deRegisterAll)(n);
                (this.subscriptions = {}),
                  (this.contexts = []),
                  this.expired &&
                    ((this._idle = !0),
                    (this._autoReconnect = !1),
                    (this.expiresAt = 0)),
                  this._autoReconnect &&
                    (this._reconnectTimeout = setTimeout(function () {
                      return t.connect();
                    }, this.reconnectDelay));
              }),
              (e.prototype._onSocketMessage = function (e) {
                var t = e.method,
                  n = e.params;
                switch (t) {
                  case f.BladeMethod.Broadcast:
                    (0, d.default)(this, n);
                    break;
                  case f.BladeMethod.Disconnect:
                    this._idle = !0;
                }
              }),
              (e.prototype._removeSubscription = function (e, t) {
                this._existsSubscription(e, t) &&
                  (t
                    ? (delete this.subscriptions[e][t],
                      (0, l.deRegister)(e, null, t))
                    : (delete this.subscriptions[e], (0, l.deRegisterAll)(e)));
              }),
              (e.prototype._addSubscription = function (e, t, n) {
                void 0 === t && (t = null),
                  this._existsSubscription(e, n) ||
                    (this._existsSubscription(e) ||
                      (this.subscriptions[e] = {}),
                    (this.subscriptions[e][n] = {}),
                    (0, v.isFunction)(t) && (0, l.register)(e, t, n));
              }),
              (e.prototype._existsSubscription = function (e, t) {
                return !(
                  !this.subscriptions.hasOwnProperty(e) ||
                  !(!t || (t && this.subscriptions[e].hasOwnProperty(t)))
                );
              }),
              (e.prototype._attachListeners = function () {
                this._detachListeners(),
                  this.on(f.SwEvent.SocketOpen, this._onSocketOpen),
                  this.on(f.SwEvent.SocketClose, this._onSocketCloseOrError),
                  this.on(f.SwEvent.SocketError, this._onSocketCloseOrError),
                  this.on(f.SwEvent.SocketMessage, this._onSocketMessage);
              }),
              (e.prototype._detachListeners = function () {
                this.off(f.SwEvent.SocketOpen, this._onSocketOpen),
                  this.off(f.SwEvent.SocketClose, this._onSocketCloseOrError),
                  this.off(f.SwEvent.SocketError, this._onSocketCloseOrError),
                  this.off(f.SwEvent.SocketMessage, this._onSocketMessage);
              }),
              (e.prototype._emptyExecuteQueues = function () {
                var e = this;
                this._executeQueue.forEach(function (t) {
                  var n = t.resolve,
                    r = t.msg;
                  'string' == typeof r ? e.executeRaw(r) : n(e.execute(r));
                });
              }),
              (e.prototype._closeConnection = function () {
                (this._idle = !0),
                  clearTimeout(this._keepAliveTimeout),
                  this.connection && this.connection.close();
              }),
              (e.prototype._checkTokenExpiration = function () {
                this.expiresAt &&
                  (this.expiresAt - Date.now() / 1e3 <= 60 &&
                    (a.default.warn(
                      'Your JWT is going to expire. You should refresh it to keep the session live.'
                    ),
                    (0, l.trigger)(
                      f.SwEvent.Notification,
                      { type: p.NOTIFICATION_TYPE.refreshToken, session: this },
                      this.uuid,
                      !1
                    )),
                  this.expired || setTimeout(this._checkTokenExpiration, 3e4));
              }),
              (e.prototype._keepAlive = function () {
                var e = this;
                if (!0 === this._doKeepAlive) {
                  if (!1 === this._pong) return this._closeConnection();
                  (this._pong = !1),
                    this.execute(new h.Ping())
                      .then(function () {
                        return (e._pong = !0);
                      })
                      .catch(function () {
                        return (e._pong = !1);
                      }),
                    (this._keepAliveTimeout = setTimeout(function () {
                      return e._keepAlive();
                    }, 1e4));
                }
              }),
              (e.on = function (e, t) {
                (0, l.register)(e, t);
              }),
              (e.off = function (e) {
                (0, l.deRegister)(e);
              }),
              (e.uuid = function () {
                return (0, s.v4)();
              }),
              e
            );
          })();
        t.default = b;
      },
      740: function (e, t, n) {
        'use strict';
        var r,
          o =
            (this && this.__extends) ||
            ((r = function (e, t) {
              return (
                (r =
                  Object.setPrototypeOf ||
                  ({ __proto__: [] } instanceof Array &&
                    function (e, t) {
                      e.__proto__ = t;
                    }) ||
                  function (e, t) {
                    for (var n in t)
                      Object.prototype.hasOwnProperty.call(t, n) &&
                        (e[n] = t[n]);
                  }),
                r(e, t)
              );
            }),
            function (e, t) {
              if ('function' != typeof t && null !== t)
                throw new TypeError(
                  'Class extends value ' +
                    String(t) +
                    ' is not a constructor or null'
                );
              function n() {
                this.constructor = e;
              }
              r(e, t),
                (e.prototype =
                  null === t
                    ? Object.create(t)
                    : ((n.prototype = t.prototype), new n()));
            }),
          i =
            (this && this.__awaiter) ||
            function (e, t, n, r) {
              return new (n || (n = Promise))(function (o, i) {
                function s(e) {
                  try {
                    c(r.next(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function a(e) {
                  try {
                    c(r.throw(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function c(e) {
                  var t;
                  e.done
                    ? o(e.value)
                    : ((t = e.value),
                      t instanceof n
                        ? t
                        : new n(function (e) {
                            e(t);
                          })).then(s, a);
                }
                c((r = r.apply(e, t || [])).next());
              });
            },
          s =
            (this && this.__generator) ||
            function (e, t) {
              var n,
                r,
                o,
                i,
                s = {
                  label: 0,
                  sent: function () {
                    if (1 & o[0]) throw o[1];
                    return o[1];
                  },
                  trys: [],
                  ops: [],
                };
              return (
                (i = { next: a(0), throw: a(1), return: a(2) }),
                'function' == typeof Symbol &&
                  (i[Symbol.iterator] = function () {
                    return this;
                  }),
                i
              );
              function a(a) {
                return function (c) {
                  return (function (a) {
                    if (n)
                      throw new TypeError('Generator is already executing.');
                    for (; i && ((i = 0), a[0] && (s = 0)), s; )
                      try {
                        if (
                          ((n = 1),
                          r &&
                            (o =
                              2 & a[0]
                                ? r.return
                                : a[0]
                                ? r.throw || ((o = r.return) && o.call(r), 0)
                                : r.next) &&
                            !(o = o.call(r, a[1])).done)
                        )
                          return o;
                        switch (
                          ((r = 0), o && (a = [2 & a[0], o.value]), a[0])
                        ) {
                          case 0:
                          case 1:
                            o = a;
                            break;
                          case 4:
                            return s.label++, { value: a[1], done: !1 };
                          case 5:
                            s.label++, (r = a[1]), (a = [0]);
                            continue;
                          case 7:
                            (a = s.ops.pop()), s.trys.pop();
                            continue;
                          default:
                            if (
                              !(
                                (o =
                                  (o = s.trys).length > 0 && o[o.length - 1]) ||
                                (6 !== a[0] && 2 !== a[0])
                              )
                            ) {
                              s = 0;
                              continue;
                            }
                            if (
                              3 === a[0] &&
                              (!o || (a[1] > o[0] && a[1] < o[3]))
                            ) {
                              s.label = a[1];
                              break;
                            }
                            if (6 === a[0] && s.label < o[1]) {
                              (s.label = o[1]), (o = a);
                              break;
                            }
                            if (o && s.label < o[2]) {
                              (s.label = o[2]), s.ops.push(a);
                              break;
                            }
                            o[2] && s.ops.pop(), s.trys.pop();
                            continue;
                        }
                        a = t.call(e, s);
                      } catch (e) {
                        (a = [6, e]), (r = 0);
                      } finally {
                        n = o = 0;
                      }
                    if (5 & a[0]) throw a[1];
                    return { value: a[0] ? a[1] : void 0, done: !0 };
                  })([a, c]);
                };
              }
            },
          a =
            (this && this.__rest) ||
            function (e, t) {
              var n = {};
              for (var r in e)
                Object.prototype.hasOwnProperty.call(e, r) &&
                  t.indexOf(r) < 0 &&
                  (n[r] = e[r]);
              if (
                null != e &&
                'function' == typeof Object.getOwnPropertySymbols
              ) {
                var o = 0;
                for (r = Object.getOwnPropertySymbols(e); o < r.length; o++)
                  t.indexOf(r[o]) < 0 &&
                    Object.prototype.propertyIsEnumerable.call(e, r[o]) &&
                    (n[r[o]] = e[r[o]]);
              }
              return n;
            },
          c =
            (this && this.__importDefault) ||
            function (e) {
              return e && e.__esModule ? e : { default: e };
            };
        Object.defineProperty(t, '__esModule', { value: !0 });
        var u = c(n(955)),
          l = c(n(401)),
          d = n(403),
          f = n(789),
          p = n(291),
          h = n(203),
          v = n(858),
          y = n(503),
          b = n(537),
          g = n(333),
          _ = n(317),
          m = (function (e) {
            function t(t) {
              var n = e.call(this, t) || this;
              return (
                (n.options = t),
                (n.calls = {}),
                (n.autoRecoverCalls = !0),
                (n._iceServers = []),
                (n._localElement = null),
                (n._remoteElement = null),
                (n._jwtAuth = !0),
                (n._devices = {}),
                (n._audioConstraints = !0),
                (n._videoConstraints = !1),
                (n._speaker = null),
                (_.WebRTCOverridesManager.getInstance().RTCPeerConnection =
                  t.RTCPeerConnection),
                (_.WebRTCOverridesManager.getInstance().enumerateDevices =
                  t.enumerateDevices),
                (_.WebRTCOverridesManager.getInstance().getUserMedia =
                  t.getUserMedia),
                (_.WebRTCOverridesManager.getInstance().getDisplayMedia =
                  t.getDisplayMedia),
                (_.WebRTCOverridesManager.getInstance().getSupportedConstraints =
                  t.getSupportedConstraints),
                (_.WebRTCOverridesManager.getInstance().attachMediaStream =
                  t.attachMediaStream),
                (_.WebRTCOverridesManager.getInstance().streamIsValid =
                  t.streamIsValid),
                n
              );
            }
            return (
              o(t, e),
              (t.prototype.validateOptions = function () {
                var t = this.options,
                  n = t.RTCPeerConnection,
                  r = t.getDisplayMedia,
                  o = t.getUserMedia,
                  i = t.attachMediaStream,
                  s = t.streamIsValid;
                return (
                  ((!n && !r && !o && !i && !s) ||
                    (!!n && !!r && !!o && !!i && !!s)) &&
                  e.prototype.validateOptions.call(this)
                );
              }),
              Object.defineProperty(t.prototype, 'reconnectDelay', {
                get: function () {
                  return 1e3;
                },
                enumerable: !1,
                configurable: !0,
              }),
              (t.prototype._handleBladeConnectResponse = function (e) {
                var t = e.ice_servers,
                  n = void 0 === t ? [] : t;
                this.iceServers = n;
              }),
              (t.prototype.connect = function () {
                return i(this, void 0, void 0, function () {
                  var t;
                  return s(this, function (n) {
                    switch (n.label) {
                      case 0:
                        return (
                          (t = this), [4, b.localStorage.getItem(f.SESSION_ID)]
                        );
                      case 1:
                        return (
                          (t.sessionid = n.sent()),
                          e.prototype.connect.call(this),
                          [2]
                        );
                    }
                  });
                });
              }),
              (t.prototype.checkPermissions = function (e, t) {
                return (
                  void 0 === e && (e = !0),
                  void 0 === t && (t = !0),
                  i(this, void 0, void 0, function () {
                    var n;
                    return s(this, function (r) {
                      switch (r.label) {
                        case 0:
                          return (
                            r.trys.push([0, 2, , 3]),
                            [4, (0, h.getUserMedia)({ audio: e, video: t })]
                          );
                        case 1:
                          return (n = r.sent()), (0, g.stopStream)(n), [2, !0];
                        case 2:
                          return r.sent(), [2, !1];
                        case 3:
                          return [2];
                      }
                    });
                  })
                );
              }),
              (t.prototype.logout = function () {
                this.disconnect();
              }),
              (t.prototype.disconnect = function () {
                return i(this, void 0, void 0, function () {
                  var t = this;
                  return s(this, function (n) {
                    switch (n.label) {
                      case 0:
                        return (
                          Object.keys(this.calls).forEach(function (e) {
                            return t.calls[e].setState(p.State.Purge);
                          }),
                          (this.calls = {}),
                          [4, e.prototype.disconnect.call(this)]
                        );
                      case 1:
                        return n.sent(), [2];
                    }
                  });
                });
              }),
              (t.prototype.speedTest = function (e) {
                var t = this;
                return new Promise(function (n, r) {
                  if (
                    ((0, d.registerOnce)(
                      f.SwEvent.SpeedTest,
                      function (t) {
                        var r = t.upDur,
                          o = t.downDur,
                          i = o ? (8 * e) / (o / 1e3) / 1024 : 0;
                        n({
                          upDur: r,
                          downDur: o,
                          upKps: (r ? (8 * e) / (r / 1e3) / 1024 : 0).toFixed(
                            0
                          ),
                          downKps: i.toFixed(0),
                        });
                      },
                      t.uuid
                    ),
                    !(e = Number(e)))
                  )
                    return r("Invalid parameter 'bytes': ".concat(e));
                  t.executeRaw('#SPU '.concat(e));
                  var o = e / 1024;
                  e % 1024 && o++;
                  for (var i = '.'.repeat(1024), s = 0; s < o; s++)
                    t.executeRaw('#SPB '.concat(i));
                  t.executeRaw('#SPE');
                });
              }),
              (t.prototype.getDevices = function () {
                var e = this;
                return (0, h.getDevices)().catch(function (t) {
                  return (0, d.trigger)(f.SwEvent.MediaError, t, e.uuid), [];
                });
              }),
              (t.prototype.getVideoDevices = function () {
                var e = this;
                return (0, h.getDevices)(p.DeviceType.Video).catch(function (
                  t
                ) {
                  return (0, d.trigger)(f.SwEvent.MediaError, t, e.uuid), [];
                });
              }),
              (t.prototype.getAudioInDevices = function () {
                var e = this;
                return (0, h.getDevices)(p.DeviceType.AudioIn).catch(function (
                  t
                ) {
                  return (0, d.trigger)(f.SwEvent.MediaError, t, e.uuid), [];
                });
              }),
              (t.prototype.getAudioOutDevices = function () {
                var e = this;
                return (0, h.getDevices)(p.DeviceType.AudioOut).catch(function (
                  t
                ) {
                  return (0, d.trigger)(f.SwEvent.MediaError, t, e.uuid), [];
                });
              }),
              (t.prototype.validateDeviceId = function (e, t, n) {
                return (0, h.assureDeviceId)(e, t, n);
              }),
              (t.prototype.refreshDevices = function () {
                return i(this, void 0, void 0, function () {
                  var e;
                  return s(this, function (t) {
                    switch (t.label) {
                      case 0:
                        return (
                          u.default.warn(
                            'This method has been deprecated. Use getDevices() instead.'
                          ),
                          (e = {}),
                          ['videoinput', 'audioinput', 'audiooutput'].map(
                            function (t) {
                              (e[t] = {}),
                                Object.defineProperty(e[t], 'toArray', {
                                  value: function () {
                                    var e = this;
                                    return Object.keys(this).map(function (t) {
                                      return e[t];
                                    });
                                  },
                                });
                            }
                          ),
                          [4, this.getDevices()]
                        );
                      case 1:
                        return (
                          t.sent().forEach(function (t) {
                            e.hasOwnProperty(t.kind) &&
                              (e[t.kind][t.deviceId] = t);
                          }),
                          (this._devices = e),
                          [2, this.devices]
                        );
                    }
                  });
                });
              }),
              Object.defineProperty(t.prototype, 'devices', {
                get: function () {
                  return this._devices || {};
                },
                enumerable: !1,
                configurable: !0,
              }),
              (t.prototype.getDeviceResolutions = function (e) {
                return i(this, void 0, void 0, function () {
                  return s(this, function (t) {
                    switch (t.label) {
                      case 0:
                        return (
                          t.trys.push([0, 2, , 3]),
                          [4, (0, h.scanResolutions)(e)]
                        );
                      case 1:
                        return [2, t.sent()];
                      case 2:
                        throw t.sent();
                      case 3:
                        return [2];
                    }
                  });
                });
              }),
              Object.defineProperty(t.prototype, 'videoDevices', {
                get: function () {
                  return (
                    u.default.warn(
                      'This property has been deprecated. Use getVideoDevices() instead.'
                    ),
                    this._devices.videoinput || {}
                  );
                },
                enumerable: !1,
                configurable: !0,
              }),
              Object.defineProperty(t.prototype, 'audioInDevices', {
                get: function () {
                  return (
                    u.default.warn(
                      'This property has been deprecated. Use getAudioInDevices() instead.'
                    ),
                    this._devices.audioinput || {}
                  );
                },
                enumerable: !1,
                configurable: !0,
              }),
              Object.defineProperty(t.prototype, 'audioOutDevices', {
                get: function () {
                  return (
                    u.default.warn(
                      'This property has been deprecated. Use getAudioOutDevices() instead.'
                    ),
                    this._devices.audiooutput || {}
                  );
                },
                enumerable: !1,
                configurable: !0,
              }),
              Object.defineProperty(t.prototype, 'mediaConstraints', {
                get: function () {
                  return {
                    audio: this._audioConstraints,
                    video: this._videoConstraints,
                  };
                },
                enumerable: !1,
                configurable: !0,
              }),
              (t.prototype.setAudioSettings = function (e) {
                return i(this, void 0, void 0, function () {
                  var t, n, r, o;
                  return s(this, function (i) {
                    switch (i.label) {
                      case 0:
                        return (
                          (t = e.micId),
                          (n = e.micLabel),
                          (r = a(e, ['micId', 'micLabel'])),
                          (0, h.removeUnsupportedConstraints)(r),
                          (o = this),
                          [
                            4,
                            (0, h.checkDeviceIdConstraints)(
                              t,
                              n,
                              'audioinput',
                              r
                            ),
                          ]
                        );
                      case 1:
                        return (
                          (o._audioConstraints = i.sent()),
                          (this.micId = t),
                          (this.micLabel = n),
                          [2, this._audioConstraints]
                        );
                    }
                  });
                });
              }),
              (t.prototype.disableMicrophone = function () {
                this._audioConstraints = !1;
              }),
              (t.prototype.enableMicrophone = function () {
                this._audioConstraints = !0;
              }),
              (t.prototype.setVideoSettings = function (e) {
                return i(this, void 0, void 0, function () {
                  var t, n, r, o;
                  return s(this, function (i) {
                    switch (i.label) {
                      case 0:
                        return (
                          (t = e.camId),
                          (n = e.camLabel),
                          (r = a(e, ['camId', 'camLabel'])),
                          (0, h.removeUnsupportedConstraints)(r),
                          (o = this),
                          [
                            4,
                            (0, h.checkDeviceIdConstraints)(
                              t,
                              n,
                              'videoinput',
                              r
                            ),
                          ]
                        );
                      case 1:
                        return (
                          (o._videoConstraints = i.sent()),
                          (this.camId = t),
                          (this.camLabel = n),
                          [2, this._videoConstraints]
                        );
                    }
                  });
                });
              }),
              (t.prototype.disableWebcam = function () {
                this._videoConstraints = !1;
              }),
              (t.prototype.enableWebcam = function () {
                this._videoConstraints = !0;
              }),
              Object.defineProperty(t.prototype, 'iceServers', {
                get: function () {
                  return this._iceServers;
                },
                set: function (e) {
                  this._iceServers =
                    'boolean' == typeof e
                      ? e
                        ? [{ urls: ['stun:stun.l.google.com:19302'] }]
                        : []
                      : e;
                },
                enumerable: !1,
                configurable: !0,
              }),
              Object.defineProperty(t.prototype, 'speaker', {
                get: function () {
                  return this._speaker;
                },
                set: function (e) {
                  this._speaker = e;
                },
                enumerable: !1,
                configurable: !0,
              }),
              Object.defineProperty(t.prototype, 'localElement', {
                get: function () {
                  return this._localElement;
                },
                set: function (e) {
                  this._localElement = (0, v.findElementByType)(e);
                },
                enumerable: !1,
                configurable: !0,
              }),
              Object.defineProperty(t.prototype, 'remoteElement', {
                get: function () {
                  return this._remoteElement;
                },
                set: function (e) {
                  this._remoteElement = (0, v.findElementByType)(e);
                },
                enumerable: !1,
                configurable: !0,
              }),
              (t.prototype.vertoBroadcast = function (e) {
                var t = e.nodeId,
                  n = e.channel,
                  r = void 0 === n ? '' : n,
                  o = e.data;
                if (!r) throw new Error('Invalid channel for broadcast: ' + r);
                var i = new y.Broadcast({
                  sessid: this.sessionid,
                  eventChannel: r,
                  data: o,
                });
                t && (i.targetNodeId = t),
                  this.execute(i).catch(function (e) {
                    return e;
                  });
              }),
              (t.prototype.vertoSubscribe = function (e) {
                var t = e.nodeId,
                  n = e.channels,
                  r = void 0 === n ? [] : n,
                  o = e.handler;
                return i(this, void 0, void 0, function () {
                  var e,
                    n,
                    i,
                    a,
                    c,
                    u,
                    l,
                    d = this;
                  return s(this, function (s) {
                    switch (s.label) {
                      case 0:
                        return (r = r.filter(function (e) {
                          return (
                            e && !d._existsSubscription(d.relayProtocol, e)
                          );
                        })).length
                          ? ((e = new y.Subscribe({
                              sessid: this.sessionid,
                              eventChannel: r,
                            })),
                            t && (e.targetNodeId = t),
                            [4, this.execute(e)])
                          : [2, {}];
                      case 1:
                        return (
                          (n = s.sent()),
                          (i = (0, h.destructSubscribeResponse)(n)),
                          (a = i.unauthorized),
                          (c = void 0 === a ? [] : a),
                          (u = i.subscribed),
                          (l = void 0 === u ? [] : u),
                          c.length &&
                            c.forEach(function (e) {
                              return d._removeSubscription(d.relayProtocol, e);
                            }),
                          l.forEach(function (e) {
                            return d._addSubscription(d.relayProtocol, o, e);
                          }),
                          [2, n]
                        );
                    }
                  });
                });
              }),
              (t.prototype.vertoUnsubscribe = function (e) {
                var t = e.nodeId,
                  n = e.channels,
                  r = void 0 === n ? [] : n;
                return i(this, void 0, void 0, function () {
                  var e,
                    n,
                    o,
                    i,
                    a,
                    c,
                    u,
                    l = this;
                  return s(this, function (s) {
                    switch (s.label) {
                      case 0:
                        return (r = r.filter(function (e) {
                          return e && l._existsSubscription(l.relayProtocol, e);
                        })).length
                          ? ((e = new y.Unsubscribe({
                              sessid: this.sessionid,
                              eventChannel: r,
                            })),
                            t && (e.targetNodeId = t),
                            [4, this.execute(e)])
                          : [2, {}];
                      case 1:
                        return (
                          (n = s.sent()),
                          (o = (0, h.destructSubscribeResponse)(n)),
                          (i = o.unsubscribed),
                          (a = void 0 === i ? [] : i),
                          (c = o.notSubscribed),
                          (u = void 0 === c ? [] : c),
                          a.forEach(function (e) {
                            return l._removeSubscription(l.relayProtocol, e);
                          }),
                          u.forEach(function (e) {
                            return l._removeSubscription(l.relayProtocol, e);
                          }),
                          [2, n]
                        );
                    }
                  });
                });
              }),
              t
            );
          })(l.default);
        t.default = m;
      },
      119: function (e, t, n) {
        'use strict';
        var r =
          (this && this.__assign) ||
          function () {
            return (
              (r =
                Object.assign ||
                function (e) {
                  for (var t, n = 1, r = arguments.length; n < r; n++)
                    for (var o in (t = arguments[n]))
                      Object.prototype.hasOwnProperty.call(t, o) &&
                        (e[o] = t[o]);
                  return e;
                }),
              r.apply(this, arguments)
            );
          };
        Object.defineProperty(t, '__esModule', { value: !0 });
        var o = n(496),
          i = (function () {
            function e() {}
            return (
              (e.prototype.buildRequest = function (e) {
                this.request = r({ jsonrpc: '2.0', id: (0, o.v4)() }, e);
              }),
              e
            );
          })();
        t.default = i;
      },
      629: (e, t, n) => {
        'use strict';
        Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.Ping =
            t.Reauthenticate =
            t.Execute =
            t.Subscription =
            t.Connect =
              void 0);
        var r = n(68);
        Object.defineProperty(t, 'Connect', {
          enumerable: !0,
          get: function () {
            return r.Connect;
          },
        });
        var o = n(821);
        Object.defineProperty(t, 'Execute', {
          enumerable: !0,
          get: function () {
            return o.Execute;
          },
        });
        var i = n(921);
        Object.defineProperty(t, 'Subscription', {
          enumerable: !0,
          get: function () {
            return i.Subscription;
          },
        });
        var s = n(408);
        Object.defineProperty(t, 'Reauthenticate', {
          enumerable: !0,
          get: function () {
            return s.Reauthenticate;
          },
        });
        var a = n(748);
        Object.defineProperty(t, 'Ping', {
          enumerable: !0,
          get: function () {
            return a.Ping;
          },
        });
      },
      503: function (e, t, n) {
        'use strict';
        var r,
          o =
            (this && this.__extends) ||
            ((r = function (e, t) {
              return (
                (r =
                  Object.setPrototypeOf ||
                  ({ __proto__: [] } instanceof Array &&
                    function (e, t) {
                      e.__proto__ = t;
                    }) ||
                  function (e, t) {
                    for (var n in t)
                      Object.prototype.hasOwnProperty.call(t, n) &&
                        (e[n] = t[n]);
                  }),
                r(e, t)
              );
            }),
            function (e, t) {
              if ('function' != typeof t && null !== t)
                throw new TypeError(
                  'Class extends value ' +
                    String(t) +
                    ' is not a constructor or null'
                );
              function n() {
                this.constructor = e;
              }
              r(e, t),
                (e.prototype =
                  null === t
                    ? Object.create(t)
                    : ((n.prototype = t.prototype), new n()));
            }),
          i =
            (this && this.__importDefault) ||
            function (e) {
              return e && e.__esModule ? e : { default: e };
            };
        Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.Result =
            t.Unsubscribe =
            t.Subscribe =
            t.Broadcast =
            t.Info =
            t.Modify =
            t.Bye =
            t.Attach =
            t.Answer =
            t.Invite =
            t.Login =
              void 0);
        var s = i(n(10)),
          a = n(521);
        Object.defineProperty(t, 'Login', {
          enumerable: !0,
          get: function () {
            return a.Login;
          },
        });
        var c = n(827);
        Object.defineProperty(t, 'Result', {
          enumerable: !0,
          get: function () {
            return c.Result;
          },
        });
        var u = n(291),
          l = (function (e) {
            function t() {
              return (null !== e && e.apply(this, arguments)) || this;
            }
            return (
              o(t, e),
              (t.prototype.toString = function () {
                return u.VertoMethod.Invite;
              }),
              t
            );
          })(s.default);
        t.Invite = l;
        var d = (function (e) {
          function t() {
            return (null !== e && e.apply(this, arguments)) || this;
          }
          return (
            o(t, e),
            (t.prototype.toString = function () {
              return u.VertoMethod.Answer;
            }),
            t
          );
        })(s.default);
        t.Answer = d;
        var f = (function (e) {
          function t() {
            return (null !== e && e.apply(this, arguments)) || this;
          }
          return (
            o(t, e),
            (t.prototype.toString = function () {
              return u.VertoMethod.Attach;
            }),
            t
          );
        })(s.default);
        t.Attach = f;
        var p = (function (e) {
          function t() {
            return (null !== e && e.apply(this, arguments)) || this;
          }
          return (
            o(t, e),
            (t.prototype.toString = function () {
              return u.VertoMethod.Bye;
            }),
            t
          );
        })(s.default);
        t.Bye = p;
        var h = (function (e) {
          function t() {
            return (null !== e && e.apply(this, arguments)) || this;
          }
          return (
            o(t, e),
            (t.prototype.toString = function () {
              return u.VertoMethod.Modify;
            }),
            t
          );
        })(s.default);
        t.Modify = h;
        var v = (function (e) {
          function t() {
            return (null !== e && e.apply(this, arguments)) || this;
          }
          return (
            o(t, e),
            (t.prototype.toString = function () {
              return u.VertoMethod.Info;
            }),
            t
          );
        })(s.default);
        t.Info = v;
        var y = (function (e) {
          function t() {
            return (null !== e && e.apply(this, arguments)) || this;
          }
          return (
            o(t, e),
            (t.prototype.toString = function () {
              return u.VertoMethod.Broadcast;
            }),
            t
          );
        })(s.default);
        t.Broadcast = y;
        var b = (function (e) {
          function t() {
            return (null !== e && e.apply(this, arguments)) || this;
          }
          return (
            o(t, e),
            (t.prototype.toString = function () {
              return u.VertoMethod.Subscribe;
            }),
            t
          );
        })(s.default);
        t.Subscribe = b;
        var g = (function (e) {
          function t() {
            return (null !== e && e.apply(this, arguments)) || this;
          }
          return (
            o(t, e),
            (t.prototype.toString = function () {
              return u.VertoMethod.Unsubscribe;
            }),
            t
          );
        })(s.default);
        t.Unsubscribe = g;
      },
      68: function (e, t, n) {
        'use strict';
        var r,
          o =
            (this && this.__extends) ||
            ((r = function (e, t) {
              return (
                (r =
                  Object.setPrototypeOf ||
                  ({ __proto__: [] } instanceof Array &&
                    function (e, t) {
                      e.__proto__ = t;
                    }) ||
                  function (e, t) {
                    for (var n in t)
                      Object.prototype.hasOwnProperty.call(t, n) &&
                        (e[n] = t[n]);
                  }),
                r(e, t)
              );
            }),
            function (e, t) {
              if ('function' != typeof t && null !== t)
                throw new TypeError(
                  'Class extends value ' +
                    String(t) +
                    ' is not a constructor or null'
                );
              function n() {
                this.constructor = e;
              }
              r(e, t),
                (e.prototype =
                  null === t
                    ? Object.create(t)
                    : ((n.prototype = t.prototype), new n()));
            }),
          i =
            (this && this.__importDefault) ||
            function (e) {
              return e && e.__esModule ? e : { default: e };
            };
        Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.setAgentName = t.Connect = void 0);
        var s = i(n(119)),
          a = null;
        t.setAgentName = function (e) {
          a = e;
        };
        var c = (function (e) {
          function t(t, n) {
            var r = e.call(this) || this;
            r.method = 'blade.connect';
            var o = {
              version: { major: 2, minor: 1, revision: 0 },
              authentication: t,
            };
            return (
              n && (o.sessionid = n),
              a && (o.agent = a),
              r.buildRequest({ method: r.method, params: o }),
              r
            );
          }
          return o(t, e), t;
        })(s.default);
        t.Connect = c;
      },
      821: function (e, t, n) {
        'use strict';
        var r,
          o =
            (this && this.__extends) ||
            ((r = function (e, t) {
              return (
                (r =
                  Object.setPrototypeOf ||
                  ({ __proto__: [] } instanceof Array &&
                    function (e, t) {
                      e.__proto__ = t;
                    }) ||
                  function (e, t) {
                    for (var n in t)
                      Object.prototype.hasOwnProperty.call(t, n) &&
                        (e[n] = t[n]);
                  }),
                r(e, t)
              );
            }),
            function (e, t) {
              if ('function' != typeof t && null !== t)
                throw new TypeError(
                  'Class extends value ' +
                    String(t) +
                    ' is not a constructor or null'
                );
              function n() {
                this.constructor = e;
              }
              r(e, t),
                (e.prototype =
                  null === t
                    ? Object.create(t)
                    : ((n.prototype = t.prototype), new n()));
            }),
          i =
            (this && this.__importDefault) ||
            function (e) {
              return e && e.__esModule ? e : { default: e };
            };
        Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.Execute = void 0);
        var s = (function (e) {
          function t(t, n) {
            void 0 === n && (n = '');
            var r,
              o = e.call(this) || this;
            return (
              (o.method = 'blade.execute'),
              (r = t.hasOwnProperty('result')
                ? { result: t }
                : { method: o.method, params: t }),
              n && (r.id = n),
              o.buildRequest(r),
              o
            );
          }
          return o(t, e), t;
        })(i(n(119)).default);
        t.Execute = s;
      },
      748: function (e, t, n) {
        'use strict';
        var r,
          o =
            (this && this.__extends) ||
            ((r = function (e, t) {
              return (
                (r =
                  Object.setPrototypeOf ||
                  ({ __proto__: [] } instanceof Array &&
                    function (e, t) {
                      e.__proto__ = t;
                    }) ||
                  function (e, t) {
                    for (var n in t)
                      Object.prototype.hasOwnProperty.call(t, n) &&
                        (e[n] = t[n]);
                  }),
                r(e, t)
              );
            }),
            function (e, t) {
              if ('function' != typeof t && null !== t)
                throw new TypeError(
                  'Class extends value ' +
                    String(t) +
                    ' is not a constructor or null'
                );
              function n() {
                this.constructor = e;
              }
              r(e, t),
                (e.prototype =
                  null === t
                    ? Object.create(t)
                    : ((n.prototype = t.prototype), new n()));
            }),
          i =
            (this && this.__importDefault) ||
            function (e) {
              return e && e.__esModule ? e : { default: e };
            };
        Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.Ping = void 0);
        var s = (function (e) {
          function t() {
            var t = e.call(this) || this;
            return (
              (t.method = 'blade.ping'),
              t.buildRequest({ method: t.method, params: {} }),
              t
            );
          }
          return o(t, e), t;
        })(i(n(119)).default);
        t.Ping = s;
      },
      408: function (e, t, n) {
        'use strict';
        var r,
          o =
            (this && this.__extends) ||
            ((r = function (e, t) {
              return (
                (r =
                  Object.setPrototypeOf ||
                  ({ __proto__: [] } instanceof Array &&
                    function (e, t) {
                      e.__proto__ = t;
                    }) ||
                  function (e, t) {
                    for (var n in t)
                      Object.prototype.hasOwnProperty.call(t, n) &&
                        (e[n] = t[n]);
                  }),
                r(e, t)
              );
            }),
            function (e, t) {
              if ('function' != typeof t && null !== t)
                throw new TypeError(
                  'Class extends value ' +
                    String(t) +
                    ' is not a constructor or null'
                );
              function n() {
                this.constructor = e;
              }
              r(e, t),
                (e.prototype =
                  null === t
                    ? Object.create(t)
                    : ((n.prototype = t.prototype), new n()));
            }),
          i =
            (this && this.__importDefault) ||
            function (e) {
              return e && e.__esModule ? e : { default: e };
            };
        Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.Reauthenticate = void 0);
        var s = (function (e) {
          function t(t, n, r) {
            var o = e.call(this) || this;
            o.method = 'blade.reauthenticate';
            var i = {
              sessionid: r,
              authentication: { project: t, jwt_token: n },
            };
            return o.buildRequest({ method: o.method, params: i }), o;
          }
          return o(t, e), t;
        })(i(n(119)).default);
        t.Reauthenticate = s;
      },
      921: function (e, t, n) {
        'use strict';
        var r,
          o =
            (this && this.__extends) ||
            ((r = function (e, t) {
              return (
                (r =
                  Object.setPrototypeOf ||
                  ({ __proto__: [] } instanceof Array &&
                    function (e, t) {
                      e.__proto__ = t;
                    }) ||
                  function (e, t) {
                    for (var n in t)
                      Object.prototype.hasOwnProperty.call(t, n) &&
                        (e[n] = t[n]);
                  }),
                r(e, t)
              );
            }),
            function (e, t) {
              if ('function' != typeof t && null !== t)
                throw new TypeError(
                  'Class extends value ' +
                    String(t) +
                    ' is not a constructor or null'
                );
              function n() {
                this.constructor = e;
              }
              r(e, t),
                (e.prototype =
                  null === t
                    ? Object.create(t)
                    : ((n.prototype = t.prototype), new n()));
            }),
          i =
            (this && this.__importDefault) ||
            function (e) {
              return e && e.__esModule ? e : { default: e };
            };
        Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.Subscription = void 0);
        var s = (function (e) {
          function t(t) {
            var n = e.call(this) || this;
            return (
              (n.method = 'blade.subscription'),
              t.hasOwnProperty('auto_create') &&
                !t.auto_create &&
                delete t.auto_create,
              t.hasOwnProperty('downstream') &&
                !t.downstream &&
                delete t.downstream,
              n.buildRequest({ method: n.method, params: t }),
              n
            );
          }
          return o(t, e), t;
        })(i(n(119)).default);
        t.Subscription = s;
      },
      10: function (e, t, n) {
        'use strict';
        var r,
          o =
            (this && this.__extends) ||
            ((r = function (e, t) {
              return (
                (r =
                  Object.setPrototypeOf ||
                  ({ __proto__: [] } instanceof Array &&
                    function (e, t) {
                      e.__proto__ = t;
                    }) ||
                  function (e, t) {
                    for (var n in t)
                      Object.prototype.hasOwnProperty.call(t, n) &&
                        (e[n] = t[n]);
                  }),
                r(e, t)
              );
            }),
            function (e, t) {
              if ('function' != typeof t && null !== t)
                throw new TypeError(
                  'Class extends value ' +
                    String(t) +
                    ' is not a constructor or null'
                );
              function n() {
                this.constructor = e;
              }
              r(e, t),
                (e.prototype =
                  null === t
                    ? Object.create(t)
                    : ((n.prototype = t.prototype), new n()));
            }),
          i =
            (this && this.__rest) ||
            function (e, t) {
              var n = {};
              for (var r in e)
                Object.prototype.hasOwnProperty.call(e, r) &&
                  t.indexOf(r) < 0 &&
                  (n[r] = e[r]);
              if (
                null != e &&
                'function' == typeof Object.getOwnPropertySymbols
              ) {
                var o = 0;
                for (r = Object.getOwnPropertySymbols(e); o < r.length; o++)
                  t.indexOf(r[o]) < 0 &&
                    Object.prototype.propertyIsEnumerable.call(e, r[o]) &&
                    (n[r[o]] = e[r[o]]);
              }
              return n;
            },
          s =
            (this && this.__importDefault) ||
            function (e) {
              return e && e.__esModule ? e : { default: e };
            };
        Object.defineProperty(t, '__esModule', { value: !0 });
        var a = s(n(119)),
          c = {
            id: 'callID',
            destinationNumber: 'destination_number',
            remoteCallerName: 'remote_caller_id_name',
            remoteCallerNumber: 'remote_caller_id_number',
            callerName: 'caller_id_name',
            callerNumber: 'caller_id_number',
          },
          u = (function (e) {
            function t(t) {
              void 0 === t && (t = {});
              var n = e.call(this) || this;
              if (t.hasOwnProperty('dialogParams')) {
                var r = t.dialogParams,
                  o =
                    (r.remoteSdp,
                    r.localStream,
                    r.remoteStream,
                    r.onNotification,
                    r.camId,
                    r.micId,
                    r.speakerId,
                    i(r, [
                      'remoteSdp',
                      'localStream',
                      'remoteStream',
                      'onNotification',
                      'camId',
                      'micId',
                      'speakerId',
                    ]));
                for (var s in c)
                  s && o.hasOwnProperty(s) && ((o[c[s]] = o[s]), delete o[s]);
                t.dialogParams = o;
              }
              return n.buildRequest({ method: n.toString(), params: t }), n;
            }
            return o(t, e), t;
          })(a.default);
        t.default = u;
      },
      521: function (e, t, n) {
        'use strict';
        var r,
          o =
            (this && this.__extends) ||
            ((r = function (e, t) {
              return (
                (r =
                  Object.setPrototypeOf ||
                  ({ __proto__: [] } instanceof Array &&
                    function (e, t) {
                      e.__proto__ = t;
                    }) ||
                  function (e, t) {
                    for (var n in t)
                      Object.prototype.hasOwnProperty.call(t, n) &&
                        (e[n] = t[n]);
                  }),
                r(e, t)
              );
            }),
            function (e, t) {
              if ('function' != typeof t && null !== t)
                throw new TypeError(
                  'Class extends value ' +
                    String(t) +
                    ' is not a constructor or null'
                );
              function n() {
                this.constructor = e;
              }
              r(e, t),
                (e.prototype =
                  null === t
                    ? Object.create(t)
                    : ((n.prototype = t.prototype), new n()));
            }),
          i =
            (this && this.__importDefault) ||
            function (e) {
              return e && e.__esModule ? e : { default: e };
            };
        Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.Login = void 0);
        var s = (function (e) {
          function t(t, n, r, o) {
            void 0 === o && (o = {});
            var i = e.call(this) || this;
            i.method = 'login';
            var s = { login: t, passwd: n, userVariables: o, loginParams: {} };
            return (
              r && (s.sessid = r),
              i.buildRequest({ method: i.method, params: s }),
              i
            );
          }
          return o(t, e), t;
        })(i(n(10)).default);
        t.Login = s;
      },
      827: function (e, t, n) {
        'use strict';
        var r,
          o =
            (this && this.__extends) ||
            ((r = function (e, t) {
              return (
                (r =
                  Object.setPrototypeOf ||
                  ({ __proto__: [] } instanceof Array &&
                    function (e, t) {
                      e.__proto__ = t;
                    }) ||
                  function (e, t) {
                    for (var n in t)
                      Object.prototype.hasOwnProperty.call(t, n) &&
                        (e[n] = t[n]);
                  }),
                r(e, t)
              );
            }),
            function (e, t) {
              if ('function' != typeof t && null !== t)
                throw new TypeError(
                  'Class extends value ' +
                    String(t) +
                    ' is not a constructor or null'
                );
              function n() {
                this.constructor = e;
              }
              r(e, t),
                (e.prototype =
                  null === t
                    ? Object.create(t)
                    : ((n.prototype = t.prototype), new n()));
            }),
          i =
            (this && this.__importDefault) ||
            function (e) {
              return e && e.__esModule ? e : { default: e };
            };
        Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.Result = void 0);
        var s = (function (e) {
          function t(t, n) {
            var r = e.call(this) || this;
            return r.buildRequest({ id: t, result: { method: n } }), r;
          }
          return o(t, e), t;
        })(i(n(10)).default);
        t.Result = s;
      },
      810: function (e, t, n) {
        'use strict';
        var r =
          (this && this.__importDefault) ||
          function (e) {
            return e && e.__esModule ? e : { default: e };
          };
        Object.defineProperty(t, '__esModule', { value: !0 });
        var o = r(n(955)),
          i = r(n(232));
        t.default = function (e, t) {
          var n = t.protocol,
            r = t.event,
            s = t.params,
            a = s.event_type,
            c = s.node_id;
          if (n !== e.relayProtocol)
            return o.default.error('Session protocol mismatch.');
          switch (r) {
            case 'queuing.relay.events':
              if ('webrtc.message' === a) {
                var u = new i.default(e);
                (u.nodeId = c), u.handleMessage(s.params);
              } else e.calling.notificationHandler(s);
              break;
            case 'queuing.relay.tasks':
              e.tasking.notificationHandler(s);
              break;
            case 'queuing.relay.messaging':
              e.messaging.notificationHandler(s);
              break;
            default:
              return o.default.error('Unknown notification type: '.concat(a));
          }
        };
      },
      351: function (e, t, n) {
        'use strict';
        var r =
          (this && this.__importDefault) ||
          function (e) {
            return e && e.__esModule ? e : { default: e };
          };
        Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.setWebSocket = void 0);
        var o = r(n(955)),
          i = n(789),
          s = n(858),
          a = n(403),
          c = n(858),
          u = 'undefined' != typeof WebSocket ? WebSocket : null;
        t.setWebSocket = function (e) {
          u = e;
        };
        var l = (function () {
          function e(e) {
            (this.session = e),
              (this._wsClient = null),
              (this._host = 'wss://relay.signalwire.com'),
              (this._timers = {}),
              (this.upDur = null),
              (this.downDur = null);
            var t = e.options.host;
            t && (this._host = (0, s.checkWebSocketHost)(t));
          }
          return (
            Object.defineProperty(e.prototype, 'connected', {
              get: function () {
                return this._wsClient && 1 === this._wsClient.readyState;
              },
              enumerable: !1,
              configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'connecting', {
              get: function () {
                return this._wsClient && 0 === this._wsClient.readyState;
              },
              enumerable: !1,
              configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'closing', {
              get: function () {
                return this._wsClient && 2 === this._wsClient.readyState;
              },
              enumerable: !1,
              configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'closed', {
              get: function () {
                return this._wsClient && 3 === this._wsClient.readyState;
              },
              enumerable: !1,
              configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'isAlive', {
              get: function () {
                return this.connecting || this.connected;
              },
              enumerable: !1,
              configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'isDead', {
              get: function () {
                return this.closing || this.closed;
              },
              enumerable: !1,
              configurable: !0,
            }),
            (e.prototype.connect = function () {
              var e = this;
              (this._wsClient = new u(this._host)),
                (this._wsClient.onopen = function (t) {
                  return (0, a.trigger)(
                    i.SwEvent.SocketOpen,
                    t,
                    e.session.uuid
                  );
                }),
                (this._wsClient.onclose = function (t) {
                  return (0, a.trigger)(
                    i.SwEvent.SocketClose,
                    t,
                    e.session.uuid
                  );
                }),
                (this._wsClient.onerror = function (t) {
                  return (0, a.trigger)(
                    i.SwEvent.SocketError,
                    t,
                    e.session.uuid
                  );
                }),
                (this._wsClient.onmessage = function (t) {
                  var n = (0, s.safeParseJson)(t.data);
                  'string' != typeof n
                    ? (e._unsetTimer(n.id),
                      o.default.debug(
                        'RECV: \n',
                        JSON.stringify(n, null, 2),
                        '\n'
                      ),
                      (0, a.trigger)(n.id, n) ||
                        (0, a.trigger)(
                          i.SwEvent.SocketMessage,
                          n,
                          e.session.uuid
                        ))
                    : e._handleStringResponse(n);
                });
            }),
            (e.prototype.sendRawText = function (e) {
              this._wsClient.send(e);
            }),
            (e.prototype.send = function (e) {
              var t = this,
                n = e.request,
                r = new Promise(function (e, r) {
                  if (n.hasOwnProperty('result')) return e();
                  (0, a.registerOnce)(n.id, function (t) {
                    var n = (0, s.destructResponse)(t),
                      o = n.result,
                      i = n.error;
                    return i ? r(i) : e(o);
                  }),
                    t._setTimer(n.id);
                });
              return (
                o.default.debug('SEND: \n', JSON.stringify(n, null, 2), '\n'),
                this._wsClient.send(JSON.stringify(n)),
                r
              );
            }),
            (e.prototype.close = function () {
              this._wsClient &&
                ((0, c.isFunction)(this._wsClient._beginClose)
                  ? this._wsClient._beginClose()
                  : this._wsClient.close()),
                (this._wsClient = null);
            }),
            (e.prototype._unsetTimer = function (e) {
              clearTimeout(this._timers[e]), delete this._timers[e];
            }),
            (e.prototype._setTimer = function (e) {
              var t = this;
              this._timers[e] = setTimeout(function () {
                (0, a.trigger)(e, {
                  error: {
                    code: t.session.timeoutErrorCode,
                    message: 'Timeout',
                  },
                }),
                  t._unsetTimer(e);
              }, 1e4);
            }),
            (e.prototype._handleStringResponse = function (e) {
              if (/^#SP/.test(e))
                switch (e[3]) {
                  case 'U':
                    this.upDur = parseInt(e.substring(4));
                    break;
                  case 'D':
                    (this.downDur = parseInt(e.substring(4))),
                      (0, a.trigger)(
                        i.SwEvent.SpeedTest,
                        { upDur: this.upDur, downDur: this.downDur },
                        this.session.uuid
                      );
                }
              else o.default.warn('Unknown message from socket', e);
            }),
            e
          );
        })();
        t.default = l;
      },
      403: (e, t, n) => {
        'use strict';
        Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.queueLength =
            t.isQueued =
            t.deRegisterAll =
            t.deRegister =
            t.registerOnce =
            t.register =
            t.trigger =
              void 0);
        var r = n(858),
          o = 'GLOBAL',
          i = {},
          s = function (e, t) {
            return (
              void 0 === t && (t = o),
              i.hasOwnProperty(e) && i[e].hasOwnProperty(t)
            );
          };
        (t.isQueued = s),
          (t.queueLength = function (e, t) {
            return void 0 === t && (t = o), s(e, t) ? i[e][t].length : 0;
          });
        var a = function (e, t, n) {
          void 0 === n && (n = o),
            i.hasOwnProperty(e) || (i[e] = {}),
            i[e].hasOwnProperty(n) || (i[e][n] = []),
            i[e][n].push(t);
        };
        (t.register = a),
          (t.registerOnce = function (e, t, n) {
            void 0 === n && (n = o);
            var r = function r(o) {
              c(e, r, n), t(o);
            };
            return (r.prototype.targetRef = t), a(e, r, n);
          });
        var c = function (e, t, n) {
          if ((void 0 === n && (n = o), !s(e, n))) return !1;
          if ((0, r.isFunction)(t))
            for (var a = i[e][n].length - 1; a >= 0; a--) {
              var c = i[e][n][a];
              (t === c || (c.prototype && t === c.prototype.targetRef)) &&
                i[e][n].splice(a, 1);
            }
          else i[e][n] = [];
          return (
            0 === i[e][n].length &&
              (delete i[e][n], (0, r.objEmpty)(i[e]) && delete i[e]),
            !0
          );
        };
        (t.deRegister = c),
          (t.trigger = function e(t, n, r, a) {
            void 0 === r && (r = o), void 0 === a && (a = !0);
            var c = a && r !== o;
            if (!s(t, r)) return c && e(t, n), !1;
            var u = i[t][r].length;
            if (!u) return c && e(t, n), !1;
            for (var l = u - 1; l >= 0; l--) i[t][r][l](n);
            return c && e(t, n), !0;
          }),
          (t.deRegisterAll = function (e) {
            delete i[e];
          });
      },
      6: function (e, t, n) {
        'use strict';
        var r =
            (this && this.__awaiter) ||
            function (e, t, n, r) {
              return new (n || (n = Promise))(function (o, i) {
                function s(e) {
                  try {
                    c(r.next(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function a(e) {
                  try {
                    c(r.throw(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function c(e) {
                  var t;
                  e.done
                    ? o(e.value)
                    : ((t = e.value),
                      t instanceof n
                        ? t
                        : new n(function (e) {
                            e(t);
                          })).then(s, a);
                }
                c((r = r.apply(e, t || [])).next());
              });
            },
          o =
            (this && this.__generator) ||
            function (e, t) {
              var n,
                r,
                o,
                i,
                s = {
                  label: 0,
                  sent: function () {
                    if (1 & o[0]) throw o[1];
                    return o[1];
                  },
                  trys: [],
                  ops: [],
                };
              return (
                (i = { next: a(0), throw: a(1), return: a(2) }),
                'function' == typeof Symbol &&
                  (i[Symbol.iterator] = function () {
                    return this;
                  }),
                i
              );
              function a(a) {
                return function (c) {
                  return (function (a) {
                    if (n)
                      throw new TypeError('Generator is already executing.');
                    for (; i && ((i = 0), a[0] && (s = 0)), s; )
                      try {
                        if (
                          ((n = 1),
                          r &&
                            (o =
                              2 & a[0]
                                ? r.return
                                : a[0]
                                ? r.throw || ((o = r.return) && o.call(r), 0)
                                : r.next) &&
                            !(o = o.call(r, a[1])).done)
                        )
                          return o;
                        switch (
                          ((r = 0), o && (a = [2 & a[0], o.value]), a[0])
                        ) {
                          case 0:
                          case 1:
                            o = a;
                            break;
                          case 4:
                            return s.label++, { value: a[1], done: !1 };
                          case 5:
                            s.label++, (r = a[1]), (a = [0]);
                            continue;
                          case 7:
                            (a = s.ops.pop()), s.trys.pop();
                            continue;
                          default:
                            if (
                              !(
                                (o =
                                  (o = s.trys).length > 0 && o[o.length - 1]) ||
                                (6 !== a[0] && 2 !== a[0])
                              )
                            ) {
                              s = 0;
                              continue;
                            }
                            if (
                              3 === a[0] &&
                              (!o || (a[1] > o[0] && a[1] < o[3]))
                            ) {
                              s.label = a[1];
                              break;
                            }
                            if (6 === a[0] && s.label < o[1]) {
                              (s.label = o[1]), (o = a);
                              break;
                            }
                            if (o && s.label < o[2]) {
                              (s.label = o[2]), s.ops.push(a);
                              break;
                            }
                            o[2] && s.ops.pop(), s.trys.pop();
                            continue;
                        }
                        a = t.call(e, s);
                      } catch (e) {
                        (a = [6, e]), (r = 0);
                      } finally {
                        n = o = 0;
                      }
                    if (5 & a[0]) throw a[1];
                    return { value: a[0] ? a[1] : void 0, done: !0 };
                  })([a, c]);
                };
              }
            },
          i =
            (this && this.__importDefault) ||
            function (e) {
              return e && e.__esModule ? e : { default: e };
            };
        Object.defineProperty(t, '__esModule', { value: !0 });
        var s = i(n(955)),
          a = n(629),
          c = n(537);
        t.default = function (e) {
          return r(void 0, void 0, void 0, function () {
            var t, n, r, i, u, l, d;
            return o(this, function (o) {
              switch (o.label) {
                case 0:
                  return (
                    (t = {}),
                    (n = e.signature),
                    (r = e.relayProtocol) && r.split('_')[1] === n
                      ? ((t.protocol = r), [3, 3])
                      : [3, 1]
                  );
                case 1:
                  return [4, c.sessionStorage.getItem(n)];
                case 2:
                  (i = o.sent()) && (t.protocol = i), (o.label = 3);
                case 3:
                  return (
                    (u = new a.Execute({
                      protocol: 'signalwire',
                      method: 'setup',
                      params: t,
                    })),
                    [4, e.execute(u)]
                  );
                case 4:
                  return (
                    (l = o.sent().protocol),
                    (d = void 0 === l ? null : l)
                      ? [
                          4,
                          e.subscribe({
                            protocol: d,
                            channels: ['notifications'],
                          }),
                        ]
                      : [3, 7]
                  );
                case 5:
                  return o.sent(), [4, c.sessionStorage.setItem(n, d)];
                case 6:
                  return o.sent(), [3, 8];
                case 7:
                  s.default.error('Error during setup the session protocol.'),
                    (o.label = 8);
                case 8:
                  return [2, d];
              }
            });
          });
        };
      },
      789: (e, t) => {
        'use strict';
        var n, r;
        Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.BladeMethod =
            t.SwEvent =
            t.SESSION_ID =
            t.REMOVE =
            t.ADD =
            t.STORAGE_PREFIX =
              void 0),
          (t.STORAGE_PREFIX = '@signalwire:'),
          (t.ADD = 'add'),
          (t.REMOVE = 'remove'),
          (t.SESSION_ID = 'sessId'),
          (function (e) {
            (e.SocketOpen = 'signalwire.socket.open'),
              (e.SocketClose = 'signalwire.socket.close'),
              (e.SocketError = 'signalwire.socket.error'),
              (e.SocketMessage = 'signalwire.socket.message'),
              (e.SpeedTest = 'signalwire.internal.speedtest'),
              (e.Ready = 'signalwire.ready'),
              (e.Error = 'signalwire.error'),
              (e.Notification = 'signalwire.notification'),
              (e.Messages = 'signalwire.messages'),
              (e.Calls = 'signalwire.calls'),
              (e.MediaError = 'signalwire.rtc.mediaError');
          })(n || (t.SwEvent = n = {})),
          (function (e) {
            (e.Broadcast = 'blade.broadcast'),
              (e.Disconnect = 'blade.disconnect');
          })(r || (t.BladeMethod = r = {}));
      },
      858: function (e, t, n) {
        'use strict';
        function r(e) {
          return (
            (r =
              'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                ? function (e) {
                    return typeof e;
                  }
                : function (e) {
                    return e &&
                      'function' == typeof Symbol &&
                      e.constructor === Symbol &&
                      e !== Symbol.prototype
                      ? 'symbol'
                      : typeof e;
                  }),
            r(e)
          );
        }
        var o =
            (this && this.__read) ||
            function (e, t) {
              var n = 'function' == typeof Symbol && e[Symbol.iterator];
              if (!n) return e;
              var r,
                o,
                i = n.call(e),
                s = [];
              try {
                for (; (void 0 === t || t-- > 0) && !(r = i.next()).done; )
                  s.push(r.value);
              } catch (e) {
                o = { error: e };
              } finally {
                try {
                  r && !r.done && (n = i.return) && n.call(i);
                } finally {
                  if (o) throw o.error;
                }
              }
              return s;
            },
          i =
            (this && this.__importDefault) ||
            function (e) {
              return e && e.__esModule ? e : { default: e };
            };
        Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.adaptToAsyncAPI =
            t.randomInt =
            t.destructResponse =
            t.checkWebSocketHost =
            t.findElementByType =
            t.isFunction =
            t.isDefined =
            t.safeParseJson =
            t.mutateLiveArrayData =
            t.mutateStorageKey =
            t.objEmpty =
            t.deepCopy =
              void 0);
        var s = i(n(955)),
          a = n(789);
        (t.deepCopy = function (e) {
          return JSON.parse(JSON.stringify(e));
        }),
          (t.objEmpty = function (e) {
            return 0 === Object.keys(e).length;
          }),
          (t.mutateStorageKey = function (e) {
            return ''.concat(a.STORAGE_PREFIX).concat(e);
          }),
          (t.mutateLiveArrayData = function (e) {
            var t = o(e, 6),
              n = t[0],
              r = t[1],
              i = t[2],
              a = t[3],
              c = t[4],
              u = t[5],
              l = {};
            try {
              l = JSON.parse(c.replace(/ID"/g, 'Id"'));
            } catch (e) {
              s.default.warn('Verto LA invalid media JSON string:', c);
            }
            return {
              participantId: Number(n),
              participantNumber: r,
              participantName: i,
              codec: a,
              media: l,
              participantData: u,
            };
          }),
          (t.safeParseJson = function (e) {
            if ('string' != typeof e) return e;
            try {
              return JSON.parse(e);
            } catch (t) {
              return e;
            }
          }),
          (t.isDefined = function (e) {
            return void 0 !== e;
          }),
          (t.isFunction = function (e) {
            return e instanceof Function || 'function' == typeof e;
          }),
          (t.findElementByType = function (e) {
            return 'object' ===
              ('undefined' == typeof document ? 'undefined' : r(document)) &&
              'getElementById' in document
              ? 'string' == typeof e
                ? document.getElementById(e) || null
                : 'function' == typeof e
                ? e()
                : e instanceof HTMLMediaElement
                ? e
                : null
              : null;
          });
        var c = /^(ws|wss):\/\//;
        (t.checkWebSocketHost = function (e) {
          var t = c.test(e) ? '' : 'wss://';
          return ''.concat(t).concat(e);
        }),
          (t.destructResponse = function (e, n) {
            void 0 === n && (n = null);
            var r = e.result,
              o = void 0 === r ? {} : r,
              i = e.error;
            if (i) return { error: i };
            var s = o.result,
              a = void 0 === s ? null : s;
            if (null === a) return null !== n && (o.node_id = n), { result: o };
            var c = a.code,
              u = void 0 === c ? null : c,
              l = a.node_id,
              d = void 0 === l ? null : l,
              f = a.result,
              p = void 0 === f ? null : f;
            return u && '200' !== u
              ? { error: a }
              : p
              ? (0, t.destructResponse)(p, d)
              : { result: a };
          }),
          (t.randomInt = function (e, t) {
            return Math.floor(Math.random() * (t - e + 1) + e);
          }),
          (t.adaptToAsyncAPI = function (e, t) {
            void 0 === t && (t = []);
            var n = new Set(t);
            return new Proxy(e, {
              get: function (e, t) {
                var r = Object.getOwnPropertyDescriptor(e, t);
                if (r && r.get) return Reflect.get(e, t);
                if ('function' == typeof e[t]) {
                  var o = e[''.concat(String(t), 'Async')] || e[t];
                  return function () {
                    for (var r = [], i = 0; i < arguments.length; i++)
                      r[i] = arguments[i];
                    var s = o.apply(e, r);
                    return !n.has(String(t)) || s instanceof Promise
                      ? s
                      : Promise.resolve(s);
                  };
                }
                return Reflect.get(e, t);
              },
              set: function (e, t, n) {
                return Reflect.set(e, t, n);
              },
            });
          });
      },
      587: (e, t) => {
        'use strict';
        Object.defineProperty(t, '__esModule', { value: !0 });
      },
      955: function (e, t, n) {
        'use strict';
        var r =
          (this && this.__importDefault) ||
          function (e) {
            return e && e.__esModule ? e : { default: e };
          };
        Object.defineProperty(t, '__esModule', { value: !0 });
        var o = r(n(188)).default.getLogger('signalwire'),
          i = o.methodFactory;
        (o.methodFactory = function (e, t, n) {
          var r = i(e, t, n);
          return function () {
            for (
              var e = [
                  new Date().toISOString().replace('T', ' ').replace('Z', ''),
                  '-',
                ],
                t = 0;
              t < arguments.length;
              t++
            )
              e.push(arguments[t]);
            r.apply(void 0, e);
          };
        }),
          o.setLevel(o.getLevel()),
          (t.default = o);
      },
      537: function (e, t, n) {
        'use strict';
        function r(e) {
          return (
            (r =
              'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                ? function (e) {
                    return typeof e;
                  }
                : function (e) {
                    return e &&
                      'function' == typeof Symbol &&
                      e.constructor === Symbol &&
                      e !== Symbol.prototype
                      ? 'symbol'
                      : typeof e;
                  }),
            r(e)
          );
        }
        var o =
            (this && this.__awaiter) ||
            function (e, t, n, r) {
              return new (n || (n = Promise))(function (o, i) {
                function s(e) {
                  try {
                    c(r.next(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function a(e) {
                  try {
                    c(r.throw(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function c(e) {
                  var t;
                  e.done
                    ? o(e.value)
                    : ((t = e.value),
                      t instanceof n
                        ? t
                        : new n(function (e) {
                            e(t);
                          })).then(s, a);
                }
                c((r = r.apply(e, t || [])).next());
              });
            },
          i =
            (this && this.__generator) ||
            function (e, t) {
              var n,
                r,
                o,
                i,
                s = {
                  label: 0,
                  sent: function () {
                    if (1 & o[0]) throw o[1];
                    return o[1];
                  },
                  trys: [],
                  ops: [],
                };
              return (
                (i = { next: a(0), throw: a(1), return: a(2) }),
                'function' == typeof Symbol &&
                  (i[Symbol.iterator] = function () {
                    return this;
                  }),
                i
              );
              function a(a) {
                return function (c) {
                  return (function (a) {
                    if (n)
                      throw new TypeError('Generator is already executing.');
                    for (; i && ((i = 0), a[0] && (s = 0)), s; )
                      try {
                        if (
                          ((n = 1),
                          r &&
                            (o =
                              2 & a[0]
                                ? r.return
                                : a[0]
                                ? r.throw || ((o = r.return) && o.call(r), 0)
                                : r.next) &&
                            !(o = o.call(r, a[1])).done)
                        )
                          return o;
                        switch (
                          ((r = 0), o && (a = [2 & a[0], o.value]), a[0])
                        ) {
                          case 0:
                          case 1:
                            o = a;
                            break;
                          case 4:
                            return s.label++, { value: a[1], done: !1 };
                          case 5:
                            s.label++, (r = a[1]), (a = [0]);
                            continue;
                          case 7:
                            (a = s.ops.pop()), s.trys.pop();
                            continue;
                          default:
                            if (
                              !(
                                (o =
                                  (o = s.trys).length > 0 && o[o.length - 1]) ||
                                (6 !== a[0] && 2 !== a[0])
                              )
                            ) {
                              s = 0;
                              continue;
                            }
                            if (
                              3 === a[0] &&
                              (!o || (a[1] > o[0] && a[1] < o[3]))
                            ) {
                              s.label = a[1];
                              break;
                            }
                            if (6 === a[0] && s.label < o[1]) {
                              (s.label = o[1]), (o = a);
                              break;
                            }
                            if (o && s.label < o[2]) {
                              (s.label = o[2]), s.ops.push(a);
                              break;
                            }
                            o[2] && s.ops.pop(), s.trys.pop();
                            continue;
                        }
                        a = t.call(e, s);
                      } catch (e) {
                        (a = [6, e]), (r = 0);
                      } finally {
                        n = o = 0;
                      }
                    if (5 & a[0]) throw a[1];
                    return { value: a[0] ? a[1] : void 0, done: !0 };
                  })([a, c]);
                };
              }
            };
        Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.sessionStorage = t.localStorage = void 0);
        var s = n(858),
          a = function () {
            return (
              'undefined' == typeof window && 'undefined' != typeof process
            );
          },
          c = function (e, t) {
            return o(void 0, void 0, void 0, function () {
              var n;
              return i(this, function (r) {
                return a()
                  ? [2, null]
                  : ((n = window[e].getItem((0, s.mutateStorageKey)(t))),
                    [2, (0, s.safeParseJson)(n)]);
              });
            });
          },
          u = function (e, t, n) {
            return o(void 0, void 0, void 0, function () {
              return i(this, function (o) {
                return a()
                  ? [2, null]
                  : ('object' === r(n) && (n = JSON.stringify(n)),
                    window[e].setItem((0, s.mutateStorageKey)(t), n),
                    [2]);
              });
            });
          },
          l = function (e, t) {
            return o(void 0, void 0, void 0, function () {
              return i(this, function (n) {
                return a()
                  ? [2, null]
                  : [2, window[e].removeItem((0, s.mutateStorageKey)(t))];
              });
            });
          };
        (t.localStorage = {
          getItem: function (e) {
            return c('localStorage', e);
          },
          setItem: function (e, t) {
            return u('localStorage', e, t);
          },
          removeItem: function (e) {
            return l('localStorage', e);
          },
        }),
          (t.sessionStorage = {
            getItem: function (e) {
              return c('sessionStorage', e);
            },
            setItem: function (e, t) {
              return u('sessionStorage', e, t);
            },
            removeItem: function (e) {
              return l('sessionStorage', e);
            },
          });
      },
      333: function (e, t, n) {
        'use strict';
        var r =
            (this && this.__awaiter) ||
            function (e, t, n, r) {
              return new (n || (n = Promise))(function (o, i) {
                function s(e) {
                  try {
                    c(r.next(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function a(e) {
                  try {
                    c(r.throw(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function c(e) {
                  var t;
                  e.done
                    ? o(e.value)
                    : ((t = e.value),
                      t instanceof n
                        ? t
                        : new n(function (e) {
                            e(t);
                          })).then(s, a);
                }
                c((r = r.apply(e, t || [])).next());
              });
            },
          o =
            (this && this.__generator) ||
            function (e, t) {
              var n,
                r,
                o,
                i,
                s = {
                  label: 0,
                  sent: function () {
                    if (1 & o[0]) throw o[1];
                    return o[1];
                  },
                  trys: [],
                  ops: [],
                };
              return (
                (i = { next: a(0), throw: a(1), return: a(2) }),
                'function' == typeof Symbol &&
                  (i[Symbol.iterator] = function () {
                    return this;
                  }),
                i
              );
              function a(a) {
                return function (c) {
                  return (function (a) {
                    if (n)
                      throw new TypeError('Generator is already executing.');
                    for (; i && ((i = 0), a[0] && (s = 0)), s; )
                      try {
                        if (
                          ((n = 1),
                          r &&
                            (o =
                              2 & a[0]
                                ? r.return
                                : a[0]
                                ? r.throw || ((o = r.return) && o.call(r), 0)
                                : r.next) &&
                            !(o = o.call(r, a[1])).done)
                        )
                          return o;
                        switch (
                          ((r = 0), o && (a = [2 & a[0], o.value]), a[0])
                        ) {
                          case 0:
                          case 1:
                            o = a;
                            break;
                          case 4:
                            return s.label++, { value: a[1], done: !1 };
                          case 5:
                            s.label++, (r = a[1]), (a = [0]);
                            continue;
                          case 7:
                            (a = s.ops.pop()), s.trys.pop();
                            continue;
                          default:
                            if (
                              !(
                                (o =
                                  (o = s.trys).length > 0 && o[o.length - 1]) ||
                                (6 !== a[0] && 2 !== a[0])
                              )
                            ) {
                              s = 0;
                              continue;
                            }
                            if (
                              3 === a[0] &&
                              (!o || (a[1] > o[0] && a[1] < o[3]))
                            ) {
                              s.label = a[1];
                              break;
                            }
                            if (6 === a[0] && s.label < o[1]) {
                              (s.label = o[1]), (o = a);
                              break;
                            }
                            if (o && s.label < o[2]) {
                              (s.label = o[2]), s.ops.push(a);
                              break;
                            }
                            o[2] && s.ops.pop(), s.trys.pop();
                            continue;
                        }
                        a = t.call(e, s);
                      } catch (e) {
                        (a = [6, e]), (r = 0);
                      } finally {
                        n = o = 0;
                      }
                    if (5 & a[0]) throw a[1];
                    return { value: a[0] ? a[1] : void 0, done: !0 };
                  })([a, c]);
                };
              }
            };
        Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.setMediaElementSinkId =
            t.toggleMuteMediaElement =
            t.unmuteMediaElement =
            t.muteMediaElement =
            t.stopStream =
            t.sdpToJsonHack =
            t.detachMediaStream =
            t.attachMediaStream =
            t.streamIsValid =
            t.getSupportedConstraints =
            t.enumerateDevices =
            t.getDisplayMedia =
            t.getUserMedia =
            t.RTCPeerConnection =
              void 0);
        var i = n(858);
        (t.RTCPeerConnection = function (e) {
          return new window.RTCPeerConnection(e);
        }),
          (t.getUserMedia = function (e) {
            return navigator.mediaDevices.getUserMedia(e);
          }),
          (t.getDisplayMedia = function (e) {
            return navigator.mediaDevices.getDisplayMedia(e);
          }),
          (t.enumerateDevices = function () {
            return navigator.mediaDevices.enumerateDevices();
          }),
          (t.getSupportedConstraints = function () {
            return navigator.mediaDevices.getSupportedConstraints();
          });
        var s = function (e) {
          return e && e instanceof MediaStream;
        };
        (t.streamIsValid = s),
          (t.attachMediaStream = function (e, t) {
            var n = (0, i.findElementByType)(e);
            null !== n &&
              (n.getAttribute('autoplay') ||
                n.setAttribute('autoplay', 'autoplay'),
              n.getAttribute('playsinline') ||
                n.setAttribute('playsinline', 'playsinline'),
              (n.srcObject = t));
          }),
          (t.detachMediaStream = function (e) {
            var t = (0, i.findElementByType)(e);
            t && (t.srcObject = null);
          }),
          (t.muteMediaElement = function (e) {
            var t = (0, i.findElementByType)(e);
            t && (t.muted = !0);
          }),
          (t.unmuteMediaElement = function (e) {
            var t = (0, i.findElementByType)(e);
            t && (t.muted = !1);
          }),
          (t.toggleMuteMediaElement = function (e) {
            var t = (0, i.findElementByType)(e);
            t && (t.muted = !t.muted);
          }),
          (t.setMediaElementSinkId = function (e, t) {
            return r(void 0, void 0, void 0, function () {
              var n;
              return o(this, function (r) {
                switch (r.label) {
                  case 0:
                    if (null === (n = (0, i.findElementByType)(e)))
                      return [2, !1];
                    r.label = 1;
                  case 1:
                    return r.trys.push([1, 3, , 4]), [4, n.setSinkId(t)];
                  case 2:
                    return r.sent(), [2, !0];
                  case 3:
                    return r.sent(), [2, !1];
                  case 4:
                    return [2];
                }
              });
            });
          }),
          (t.sdpToJsonHack = function (e) {
            return e;
          }),
          (t.stopStream = function (e) {
            s(e) &&
              e.getTracks().forEach(function (e) {
                return e.stop();
              }),
              (e = null);
          });
      },
      945: function (e, t, n) {
        'use strict';
        function r(e) {
          return (
            (r =
              'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                ? function (e) {
                    return typeof e;
                  }
                : function (e) {
                    return e &&
                      'function' == typeof Symbol &&
                      e.constructor === Symbol &&
                      e !== Symbol.prototype
                      ? 'symbol'
                      : typeof e;
                  }),
            r(e)
          );
        }
        var o =
            (this && this.__assign) ||
            function () {
              return (
                (o =
                  Object.assign ||
                  function (e) {
                    for (var t, n = 1, r = arguments.length; n < r; n++)
                      for (var o in (t = arguments[n]))
                        Object.prototype.hasOwnProperty.call(t, o) &&
                          (e[o] = t[o]);
                    return e;
                  }),
                o.apply(this, arguments)
              );
            },
          i =
            (this && this.__awaiter) ||
            function (e, t, n, r) {
              return new (n || (n = Promise))(function (o, i) {
                function s(e) {
                  try {
                    c(r.next(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function a(e) {
                  try {
                    c(r.throw(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function c(e) {
                  var t;
                  e.done
                    ? o(e.value)
                    : ((t = e.value),
                      t instanceof n
                        ? t
                        : new n(function (e) {
                            e(t);
                          })).then(s, a);
                }
                c((r = r.apply(e, t || [])).next());
              });
            },
          s =
            (this && this.__generator) ||
            function (e, t) {
              var n,
                r,
                o,
                i,
                s = {
                  label: 0,
                  sent: function () {
                    if (1 & o[0]) throw o[1];
                    return o[1];
                  },
                  trys: [],
                  ops: [],
                };
              return (
                (i = { next: a(0), throw: a(1), return: a(2) }),
                'function' == typeof Symbol &&
                  (i[Symbol.iterator] = function () {
                    return this;
                  }),
                i
              );
              function a(a) {
                return function (c) {
                  return (function (a) {
                    if (n)
                      throw new TypeError('Generator is already executing.');
                    for (; i && ((i = 0), a[0] && (s = 0)), s; )
                      try {
                        if (
                          ((n = 1),
                          r &&
                            (o =
                              2 & a[0]
                                ? r.return
                                : a[0]
                                ? r.throw || ((o = r.return) && o.call(r), 0)
                                : r.next) &&
                            !(o = o.call(r, a[1])).done)
                        )
                          return o;
                        switch (
                          ((r = 0), o && (a = [2 & a[0], o.value]), a[0])
                        ) {
                          case 0:
                          case 1:
                            o = a;
                            break;
                          case 4:
                            return s.label++, { value: a[1], done: !1 };
                          case 5:
                            s.label++, (r = a[1]), (a = [0]);
                            continue;
                          case 7:
                            (a = s.ops.pop()), s.trys.pop();
                            continue;
                          default:
                            if (
                              !(
                                (o =
                                  (o = s.trys).length > 0 && o[o.length - 1]) ||
                                (6 !== a[0] && 2 !== a[0])
                              )
                            ) {
                              s = 0;
                              continue;
                            }
                            if (
                              3 === a[0] &&
                              (!o || (a[1] > o[0] && a[1] < o[3]))
                            ) {
                              s.label = a[1];
                              break;
                            }
                            if (6 === a[0] && s.label < o[1]) {
                              (s.label = o[1]), (o = a);
                              break;
                            }
                            if (o && s.label < o[2]) {
                              (s.label = o[2]), s.ops.push(a);
                              break;
                            }
                            o[2] && s.ops.pop(), s.trys.pop();
                            continue;
                        }
                        a = t.call(e, s);
                      } catch (e) {
                        (a = [6, e]), (r = 0);
                      } finally {
                        n = o = 0;
                      }
                    if (5 & a[0]) throw a[1];
                    return { value: a[0] ? a[1] : void 0, done: !0 };
                  })([a, c]);
                };
              }
            },
          a =
            (this && this.__importDefault) ||
            function (e) {
              return e && e.__esModule ? e : { default: e };
            };
        Object.defineProperty(t, '__esModule', { value: !0 });
        var c = n(496),
          u = a(n(955)),
          l = n(503),
          d = a(n(24)),
          f = n(789),
          p = n(291),
          h = n(403),
          v = n(203),
          y = n(858),
          b = n(317),
          g = n(616),
          _ = (function () {
            function e(e, t) {
              var n = this;
              (this.session = e),
                (this.id = ''),
                (this.state = p.State[p.State.New]),
                (this.prevState = ''),
                (this.channels = []),
                (this.role = p.Role.Participant),
                (this.extension = null),
                (this._state = p.State.New),
                (this._prevState = p.State.New),
                (this.gotAnswer = !1),
                (this.gotEarly = !1),
                (this._lastSerno = 0),
                (this._targetNodeId = null),
                (this._iceTimeout = null),
                (this._iceDone = !1),
                (this._checkConferenceSerno = function (e) {
                  var t =
                    e < 0 ||
                    !n._lastSerno ||
                    (n._lastSerno && e === n._lastSerno + 1);
                  return t && e >= 0 && (n._lastSerno = e), t;
                });
              var r = e.iceServers,
                o = e.speaker,
                i = e.micId,
                s = e.micLabel,
                a = e.camId,
                c = e.camLabel,
                u = e.localElement,
                l = e.remoteElement,
                d = e.mediaConstraints,
                f = d.audio,
                h = d.video;
              (this.options = Object.assign(
                {},
                p.DEFAULT_CALL_OPTIONS,
                {
                  audio: f,
                  video: h,
                  iceServers: r,
                  localElement: u,
                  remoteElement: l,
                  micId: i,
                  micLabel: s,
                  camId: a,
                  camLabel: c,
                  speakerId: o,
                },
                t
              )),
                (this._onMediaError = this._onMediaError.bind(this)),
                this._init();
            }
            return (
              Object.defineProperty(e.prototype, 'nodeId', {
                get: function () {
                  return this._targetNodeId;
                },
                set: function (e) {
                  this._targetNodeId = e;
                },
                enumerable: !1,
                configurable: !0,
              }),
              Object.defineProperty(e.prototype, 'localStream', {
                get: function () {
                  return this.options.localStream;
                },
                enumerable: !1,
                configurable: !0,
              }),
              Object.defineProperty(e.prototype, 'remoteStream', {
                get: function () {
                  return this.options.remoteStream;
                },
                enumerable: !1,
                configurable: !0,
              }),
              Object.defineProperty(e.prototype, 'memberChannel', {
                get: function () {
                  return 'conference-member.'.concat(this.id);
                },
                enumerable: !1,
                configurable: !0,
              }),
              (e.prototype.invite = function () {
                (this.direction = p.Direction.Outbound),
                  (this.peer = new d.default(p.PeerType.Offer, this.options)),
                  this._registerPeerEvents();
              }),
              (e.prototype.answer = function (e) {
                e &&
                  (null == e ? void 0 : e.iceTransportPolicy) &&
                  (this.options.iceTransportPolicy =
                    null == e ? void 0 : e.iceTransportPolicy),
                  (this.direction = p.Direction.Inbound),
                  (this.peer = new d.default(p.PeerType.Answer, this.options)),
                  this._registerPeerEvents();
              }),
              (e.prototype.applyMediaConstraints = function (e) {
                var t = this,
                  n = e.mediaParams;
                n &&
                  Object.keys(n).forEach(function (e) {
                    return t.peer.applyMediaConstraints(e, n[e]);
                  });
              }),
              (e.prototype.hangup = function (e, t) {
                var n = this;
                void 0 === e && (e = {}),
                  void 0 === t && (t = !0),
                  (this.cause = e.cause || 'NORMAL_CLEARING'),
                  (this.causeCode = e.causeCode || 16),
                  this.setState(p.State.Hangup);
                var r = function () {
                  n.peer && n.peer.instance.close(),
                    n.setState(p.State.Destroy);
                };
                if (t) {
                  var o = new l.Bye({
                    sessid: this.session.sessionid,
                    dialogParams: this.options,
                  });
                  this._execute(o)
                    .catch(function (e) {
                      return u.default.error('verto.bye failed!', e);
                    })
                    .then(r.bind(this));
                } else r();
              }),
              (e.prototype.transfer = function (e) {
                var t = new l.Modify({
                  sessid: this.session.sessionid,
                  action: 'transfer',
                  destination: e,
                  dialogParams: this.options,
                });
                this._execute(t);
              }),
              (e.prototype.replace = function (e) {
                var t = new l.Modify({
                  sessid: this.session.sessionid,
                  action: 'replace',
                  replaceCallID: e,
                  dialogParams: this.options,
                });
                this._execute(t);
              }),
              (e.prototype.hold = function () {
                var e = new l.Modify({
                  sessid: this.session.sessionid,
                  action: 'hold',
                  dialogParams: this.options,
                });
                return this._execute(e)
                  .then(this._handleChangeHoldStateSuccess.bind(this))
                  .catch(this._handleChangeHoldStateError.bind(this));
              }),
              (e.prototype.unhold = function () {
                var e = new l.Modify({
                  sessid: this.session.sessionid,
                  action: 'unhold',
                  dialogParams: this.options,
                });
                return this._execute(e)
                  .then(this._handleChangeHoldStateSuccess.bind(this))
                  .catch(this._handleChangeHoldStateError.bind(this));
              }),
              (e.prototype.toggleHold = function () {
                var e = new l.Modify({
                  sessid: this.session.sessionid,
                  action: 'toggleHold',
                  dialogParams: this.options,
                });
                return this._execute(e)
                  .then(this._handleChangeHoldStateSuccess.bind(this))
                  .catch(this._handleChangeHoldStateError.bind(this));
              }),
              (e.prototype.dtmf = function (e) {
                var t = new l.Info({
                  sessid: this.session.sessionid,
                  dtmf: e,
                  dialogParams: this.options,
                });
                this._execute(t);
              }),
              (e.prototype.message = function (e, t) {
                var n = { from: this.session.options.login, to: e, body: t },
                  r = new l.Info({
                    sessid: this.session.sessionid,
                    msg: n,
                    dialogParams: this.options,
                  });
                this._execute(r);
              }),
              (e.prototype.muteAudio = function () {
                (0, v.disableAudioTracks)(this.options.localStream);
              }),
              (e.prototype.unmuteAudio = function () {
                (0, v.enableAudioTracks)(this.options.localStream);
              }),
              (e.prototype.toggleAudioMute = function () {
                (0, v.toggleAudioTracks)(this.options.localStream);
              }),
              (e.prototype.setAudioInDevice = function (e) {
                return i(this, void 0, void 0, function () {
                  var t, n, r, o, i;
                  return s(this, function (s) {
                    switch (s.label) {
                      case 0:
                        return [4, this.peer.instance.getSenders()];
                      case 1:
                        return (
                          (t = s.sent()),
                          (n = t.find(function (e) {
                            return 'audio' === e.track.kind;
                          })),
                          n
                            ? [
                                4,
                                (0, b.getUserMedia)({
                                  audio: { deviceId: { exact: e } },
                                }),
                              ]
                            : [3, 3]
                        );
                      case 2:
                        (r = s.sent()),
                          (o = r.getAudioTracks()[0]),
                          n.replaceTrack(o),
                          (this.options.micId = e),
                          (i = this.options.localStream)
                            .getAudioTracks()
                            .forEach(function (e) {
                              return e.stop();
                            }),
                          i.getVideoTracks().forEach(function (e) {
                            return r.addTrack(e);
                          }),
                          (this.options.localStream = r),
                          (s.label = 3);
                      case 3:
                        return [2];
                    }
                  });
                });
              }),
              (e.prototype.muteVideo = function () {
                (0, v.disableVideoTracks)(this.options.localStream);
              }),
              (e.prototype.unmuteVideo = function () {
                (0, v.enableVideoTracks)(this.options.localStream);
              }),
              (e.prototype.toggleVideoMute = function () {
                (0, v.toggleVideoTracks)(this.options.localStream);
              }),
              (e.prototype.setVideoDevice = function (e) {
                return i(this, void 0, void 0, function () {
                  var t, n, r, o, i, a, c;
                  return s(this, function (s) {
                    switch (s.label) {
                      case 0:
                        return [4, this.peer.instance.getSenders()];
                      case 1:
                        return (
                          (t = s.sent()),
                          (n = t.find(function (e) {
                            return 'video' === e.track.kind;
                          })),
                          n
                            ? [
                                4,
                                (0, b.getUserMedia)({
                                  video: { deviceId: { exact: e } },
                                }),
                              ]
                            : [3, 3]
                        );
                      case 2:
                        (r = s.sent()),
                          (o = r.getVideoTracks()[0]),
                          n.replaceTrack(o),
                          (i = this.options),
                          (a = i.localElement),
                          (c = i.localStream),
                          (0, b.attachMediaStream)(a, r),
                          (this.options.camId = e),
                          c.getAudioTracks().forEach(function (e) {
                            return r.addTrack(e);
                          }),
                          c.getVideoTracks().forEach(function (e) {
                            return e.stop();
                          }),
                          (this.options.localStream = r),
                          (s.label = 3);
                      case 3:
                        return [2];
                    }
                  });
                });
              }),
              (e.prototype.deaf = function () {
                (0, v.disableAudioTracks)(this.options.remoteStream);
              }),
              (e.prototype.undeaf = function () {
                (0, v.enableAudioTracks)(this.options.remoteStream);
              }),
              (e.prototype.toggleDeaf = function () {
                (0, v.toggleAudioTracks)(this.options.remoteStream);
              }),
              (e.prototype.setState = function (e) {
                var t = this;
                switch (
                  ((this._prevState = this._state),
                  (this._state = e),
                  (this.state = p.State[this._state].toLowerCase()),
                  (this.prevState = p.State[this._prevState].toLowerCase()),
                  u.default.info(
                    'Call '
                      .concat(this.id, ' state change from ')
                      .concat(this.prevState, ' to ')
                      .concat(this.state)
                  ),
                  this._dispatchNotification({
                    type: p.NOTIFICATION_TYPE.callUpdate,
                    call: this,
                  }),
                  e)
                ) {
                  case p.State.Purge:
                    this.hangup({ cause: 'PURGE', causeCode: '01' }, !1);
                    break;
                  case p.State.Active:
                    setTimeout(function () {
                      var e = t.options,
                        n = e.remoteElement,
                        r = e.speakerId;
                      n && r && (0, b.setMediaElementSinkId)(n, r);
                    }, 0);
                    break;
                  case p.State.Destroy:
                    this._finalize();
                }
              }),
              (e.prototype.handleMessage = function (e) {
                var t = e.method,
                  n = e.params;
                switch (t) {
                  case p.VertoMethod.Answer:
                    if (((this.gotAnswer = !0), this._state >= p.State.Active))
                      return;
                    this._state >= p.State.Early &&
                      this.setState(p.State.Active),
                      this.gotEarly || this._onRemoteSdp(n.sdp);
                    break;
                  case p.VertoMethod.Media:
                    if (this._state >= p.State.Early) return;
                    (this.gotEarly = !0), this._onRemoteSdp(n.sdp);
                    break;
                  case p.VertoMethod.Display:
                  case p.VertoMethod.Attach:
                    var r = n.display_name,
                      i = n.display_number,
                      s = n.display_direction;
                    this.extension = i;
                    var a =
                        s === p.Direction.Inbound
                          ? p.Direction.Outbound
                          : p.Direction.Inbound,
                      c = {
                        type: p.NOTIFICATION_TYPE[t],
                        call: this,
                        displayName: r,
                        displayNumber: i,
                        displayDirection: a,
                      };
                    (0, h.trigger)(f.SwEvent.Notification, c, this.id) ||
                      (0, h.trigger)(
                        f.SwEvent.Notification,
                        c,
                        this.session.uuid
                      );
                    break;
                  case p.VertoMethod.Info:
                  case p.VertoMethod.Event:
                    (c = o(o({}, n), {
                      type: p.NOTIFICATION_TYPE.generic,
                      call: this,
                    })),
                      (0, h.trigger)(f.SwEvent.Notification, c, this.id) ||
                        (0, h.trigger)(
                          f.SwEvent.Notification,
                          c,
                          this.session.uuid
                        );
                    break;
                  case p.VertoMethod.MediaParams:
                    this.applyMediaConstraints(n);
                    break;
                  case p.VertoMethod.Bye:
                    this.hangup(n, !1);
                }
              }),
              (e.prototype.handleConferenceUpdate = function (e, t) {
                return i(this, void 0, void 0, function () {
                  var n, r, i, a, c, l, d, f, h, v, b, g, _;
                  return s(this, function (s) {
                    switch (s.label) {
                      case 0:
                        if (
                          !this._checkConferenceSerno(e.wireSerno) &&
                          e.name !== t.laName
                        )
                          return (
                            u.default.error(
                              'ConferenceUpdate invalid wireSerno or packet name:',
                              e
                            ),
                            [2, 'INVALID_PACKET']
                          );
                        switch (
                          ((n = e.action),
                          (r = e.data),
                          (i = e.hashKey),
                          (a = void 0 === i ? String(this._lastSerno) : i),
                          (c = e.arrIndex),
                          n)
                        ) {
                          case 'bootObj':
                            return [3, 1];
                          case 'add':
                            return [3, 8];
                          case 'modify':
                            return [3, 9];
                          case 'del':
                            return [3, 10];
                          case 'clear':
                            return [3, 11];
                        }
                        return [3, 12];
                      case 1:
                        return (
                          (this._lastSerno = 0),
                          t.chatID,
                          (l = t.chatChannel),
                          (d = t.infoChannel),
                          (f = t.modChannel),
                          (h = t.laName),
                          (v = t.conferenceMemberID),
                          (b = t.role),
                          this._dispatchConferenceUpdate({
                            action: p.ConferenceAction.Join,
                            conferenceName: h,
                            participantId: Number(v),
                            role: b,
                          }),
                          l ? [4, this._subscribeConferenceChat(l)] : [3, 3]
                        );
                      case 2:
                        s.sent(), (s.label = 3);
                      case 3:
                        return d
                          ? [4, this._subscribeConferenceInfo(d)]
                          : [3, 5];
                      case 4:
                        s.sent(), (s.label = 5);
                      case 5:
                        return f && b === p.Role.Moderator
                          ? [4, this._subscribeConferenceModerator(f)]
                          : [3, 7];
                      case 6:
                        s.sent(), (s.label = 7);
                      case 7:
                        for (_ in ((g = []), r))
                          g.push(
                            o(
                              { callId: r[_][0], index: Number(_) },
                              (0, y.mutateLiveArrayData)(r[_][1])
                            )
                          );
                        return (
                          this._dispatchConferenceUpdate({
                            action: p.ConferenceAction.Bootstrap,
                            participants: g,
                          }),
                          [3, 13]
                        );
                      case 8:
                        return (
                          this._dispatchConferenceUpdate(
                            o(
                              {
                                action: p.ConferenceAction.Add,
                                callId: a,
                                index: c,
                              },
                              (0, y.mutateLiveArrayData)(r)
                            )
                          ),
                          [3, 13]
                        );
                      case 9:
                        return (
                          this._dispatchConferenceUpdate(
                            o(
                              {
                                action: p.ConferenceAction.Modify,
                                callId: a,
                                index: c,
                              },
                              (0, y.mutateLiveArrayData)(r)
                            )
                          ),
                          [3, 13]
                        );
                      case 10:
                        return (
                          this._dispatchConferenceUpdate(
                            o(
                              {
                                action: p.ConferenceAction.Delete,
                                callId: a,
                                index: c,
                              },
                              (0, y.mutateLiveArrayData)(r)
                            )
                          ),
                          [3, 13]
                        );
                      case 11:
                        return (
                          this._dispatchConferenceUpdate({
                            action: p.ConferenceAction.Clear,
                          }),
                          [3, 13]
                        );
                      case 12:
                        return (
                          this._dispatchConferenceUpdate({
                            action: n,
                            data: r,
                            callId: a,
                            index: c,
                          }),
                          [3, 13]
                        );
                      case 13:
                        return [2];
                    }
                  });
                });
              }),
              (e.prototype._addChannel = function (e) {
                this.channels.includes(e) || this.channels.push(e);
                var t = this.session.relayProtocol;
                this.session._existsSubscription(t, e) &&
                  (this.session.subscriptions[t][e] = o(
                    o({}, this.session.subscriptions[t][e]),
                    { callId: this.id }
                  ));
              }),
              (e.prototype._subscribeConferenceChat = function (e) {
                return i(this, void 0, void 0, function () {
                  var t,
                    n,
                    r = this;
                  return s(this, function (o) {
                    switch (o.label) {
                      case 0:
                        return (
                          (t = {
                            nodeId: this.nodeId,
                            channels: [e],
                            handler: function (e) {
                              var t = e.data,
                                n = t.direction,
                                o = t.from,
                                i = t.fromDisplay,
                                s = t.message,
                                a = t.type;
                              r._dispatchConferenceUpdate({
                                action: p.ConferenceAction.ChatMessage,
                                direction: n,
                                participantNumber: o,
                                participantName: i,
                                messageText: s,
                                messageType: a,
                                messageId: e.eventSerno,
                              });
                            },
                          }),
                          [
                            4,
                            this.session.vertoSubscribe(t).catch(function (e) {
                              u.default.error(
                                'ConfChat subscription error:',
                                e
                              );
                            }),
                          ]
                        );
                      case 1:
                        return (
                          (n = o.sent()),
                          (0, v.checkSubscribeResponse)(n, e) &&
                            (this._addChannel(e),
                            Object.defineProperties(this, {
                              sendChatMessage: {
                                configurable: !0,
                                value: function (t, n) {
                                  r.session.vertoBroadcast({
                                    nodeId: r.nodeId,
                                    channel: e,
                                    data: {
                                      action: 'send',
                                      message: t,
                                      type: n,
                                    },
                                  });
                                },
                              },
                            })),
                          [2]
                        );
                    }
                  });
                });
              }),
              (e.prototype._subscribeConferenceInfo = function (e) {
                return i(this, void 0, void 0, function () {
                  var t,
                    n,
                    r = this;
                  return s(this, function (o) {
                    switch (o.label) {
                      case 0:
                        return (
                          (t = {
                            nodeId: this.nodeId,
                            channels: [e],
                            handler: function (e) {
                              var t = e.eventData;
                              'layout-info' === t.contentType
                                ? ((t.callID = r.id),
                                  (0, g.MCULayoutEventHandler)(r.session, t))
                                : u.default.error(
                                    'Conference-Info unknown contentType',
                                    e
                                  );
                            },
                          }),
                          [
                            4,
                            this.session.vertoSubscribe(t).catch(function (e) {
                              u.default.error(
                                'ConfInfo subscription error:',
                                e
                              );
                            }),
                          ]
                        );
                      case 1:
                        return (
                          (n = o.sent()),
                          (0, v.checkSubscribeResponse)(n, e) &&
                            this._addChannel(e),
                          [2]
                        );
                    }
                  });
                });
              }),
              (e.prototype._confControl = function (e, t) {
                void 0 === t && (t = {});
                var n = o(
                  { application: 'conf-control', callID: this.id, value: null },
                  t
                );
                this.session.vertoBroadcast({
                  nodeId: this.nodeId,
                  channel: e,
                  data: n,
                });
              }),
              (e.prototype._subscribeConferenceModerator = function (e) {
                return i(this, void 0, void 0, function () {
                  var t,
                    n,
                    o,
                    i,
                    a = this;
                  return s(this, function (s) {
                    switch (s.label) {
                      case 0:
                        return (
                          (t = function (t, n, r) {
                            void 0 === n && (n = null),
                              void 0 === r && (r = null);
                            var o = parseInt(n) || null;
                            a._confControl(e, { command: t, id: o, value: r });
                          }),
                          (n = function () {
                            var e = a.options.video;
                            if (
                              ('boolean' == typeof e && !e) ||
                              ('object' === r(e) && (0, y.objEmpty)(e))
                            )
                              throw 'Conference '.concat(
                                a.id,
                                ' has no video!'
                              );
                          }),
                          (o = {
                            nodeId: this.nodeId,
                            channels: [e],
                            handler: function (e) {
                              var t = e.data;
                              if ('list-videoLayouts' === t['conf-command']) {
                                if (t.responseData) {
                                  var n = JSON.stringify(
                                    t.responseData
                                  ).replace(/IDS"/g, 'Ids"');
                                  a._dispatchConferenceUpdate({
                                    action: p.ConferenceAction.LayoutList,
                                    layouts: JSON.parse(n),
                                  });
                                }
                              } else
                                a._dispatchConferenceUpdate({
                                  action: p.ConferenceAction.ModCmdResponse,
                                  command: t['conf-command'],
                                  response: t.response,
                                });
                            },
                          }),
                          [
                            4,
                            this.session.vertoSubscribe(o).catch(function (e) {
                              u.default.error('ConfMod subscription error:', e);
                            }),
                          ]
                        );
                      case 1:
                        return (
                          (i = s.sent()),
                          (0, v.checkSubscribeResponse)(i, e) &&
                            ((this.role = p.Role.Moderator),
                            this._addChannel(e),
                            Object.defineProperties(this, {
                              listVideoLayouts: {
                                configurable: !0,
                                value: function () {
                                  t('list-videoLayouts');
                                },
                              },
                              playMedia: {
                                configurable: !0,
                                value: function (e) {
                                  t('play', null, e);
                                },
                              },
                              stopMedia: {
                                configurable: !0,
                                value: function () {
                                  t('stop', null, 'all');
                                },
                              },
                              deaf: {
                                configurable: !0,
                                value: function (e) {
                                  t('deaf', e);
                                },
                              },
                              undeaf: {
                                configurable: !0,
                                value: function (e) {
                                  t('undeaf', e);
                                },
                              },
                              startRecord: {
                                configurable: !0,
                                value: function (e) {
                                  t('recording', null, ['start', e]);
                                },
                              },
                              stopRecord: {
                                configurable: !0,
                                value: function () {
                                  t('recording', null, ['stop', 'all']);
                                },
                              },
                              snapshot: {
                                configurable: !0,
                                value: function (e) {
                                  n(), t('vid-write-png', null, e);
                                },
                              },
                              setVideoLayout: {
                                configurable: !0,
                                value: function (e, r) {
                                  n(), t('vid-layout', null, r ? [e, r] : e);
                                },
                              },
                              kick: {
                                configurable: !0,
                                value: function (e) {
                                  t('kick', e);
                                },
                              },
                              muteMic: {
                                configurable: !0,
                                value: function (e) {
                                  t('tmute', e);
                                },
                              },
                              muteVideo: {
                                configurable: !0,
                                value: function (e) {
                                  n(), t('tvmute', e);
                                },
                              },
                              presenter: {
                                configurable: !0,
                                value: function (e) {
                                  n(), t('vid-res-id', e, 'presenter');
                                },
                              },
                              videoFloor: {
                                configurable: !0,
                                value: function (e) {
                                  n(), t('vid-floor', e, 'force');
                                },
                              },
                              banner: {
                                configurable: !0,
                                value: function (e, r) {
                                  n(), t('vid-banner', e, encodeURI(r));
                                },
                              },
                              volumeDown: {
                                configurable: !0,
                                value: function (e) {
                                  t('volume_out', e, 'down');
                                },
                              },
                              volumeUp: {
                                configurable: !0,
                                value: function (e) {
                                  t('volume_out', e, 'up');
                                },
                              },
                              gainDown: {
                                configurable: !0,
                                value: function (e) {
                                  t('volume_in', e, 'down');
                                },
                              },
                              gainUp: {
                                configurable: !0,
                                value: function (e) {
                                  t('volume_in', e, 'up');
                                },
                              },
                              transfer: {
                                configurable: !0,
                                value: function (e, n) {
                                  t('transfer', e, n);
                                },
                              },
                            })),
                          [2]
                        );
                    }
                  });
                });
              }),
              (e.prototype._handleChangeHoldStateSuccess = function (e) {
                return (
                  'active' === e.holdState
                    ? this.setState(p.State.Active)
                    : this.setState(p.State.Held),
                  !0
                );
              }),
              (e.prototype._handleChangeHoldStateError = function (e) {
                return (
                  u.default.error(
                    'Failed to '.concat(e.action, ' on call ').concat(this.id)
                  ),
                  !1
                );
              }),
              (e.prototype._onRemoteSdp = function (e) {
                var t = this,
                  n = (0, v.sdpMediaOrderHack)(
                    e,
                    this.peer.instance.localDescription.sdp
                  );
                this.options.useStereo && (n = (0, v.sdpStereoHack)(n));
                var r = (0, b.sdpToJsonHack)({
                  sdp: n,
                  type: p.PeerType.Answer,
                });
                this.peer.instance
                  .setRemoteDescription(r)
                  .then(function () {
                    t.gotEarly && t.setState(p.State.Early),
                      t.gotAnswer && t.setState(p.State.Active);
                  })
                  .catch(function (e) {
                    u.default.error('Call setRemoteDescription Error: ', e),
                      t.hangup();
                  });
              }),
              (e.prototype._requestAnotherLocalDescription = function () {
                u.default.debug('_requestAnotherLocalDescription'),
                  (0, y.isFunction)(this.peer.onSdpReadyTwice)
                    ? (0, h.trigger)(
                        f.SwEvent.Error,
                        new Error(
                          'SDP without candidates for the second time!'
                        ),
                        this.session.uuid
                      )
                    : (Object.defineProperty(this.peer, 'onSdpReadyTwice', {
                        value: this._onIceSdp.bind(this),
                      }),
                      (this._iceDone = !1),
                      this.peer.startNegotiation());
              }),
              (e.prototype._onIceSdp = function (e) {
                var t = this;
                u.default.debug('_onIceSdp'),
                  this._iceTimeout && clearTimeout(this._iceTimeout),
                  (this._iceTimeout = null),
                  (this._iceDone = !0),
                  this.peer.resetNegotiating();
                var n = e.sdp,
                  r = e.type;
                if (-1 !== n.indexOf('candidate')) {
                  var o = null,
                    i = {
                      sessid: this.session.sessionid,
                      sdp: n,
                      dialogParams: this.options,
                    };
                  switch (r) {
                    case p.PeerType.Offer:
                      this.setState(p.State.Requesting), (o = new l.Invite(i));
                      break;
                    case p.PeerType.Answer:
                      this.setState(p.State.Answering),
                        (o =
                          !0 === this.options.attach
                            ? new l.Attach(i)
                            : new l.Answer(i));
                      break;
                    default:
                      return (
                        u.default.error(
                          ''.concat(this.id, ' - Unknown local SDP type:'),
                          e
                        ),
                        this.hangup({}, !1)
                      );
                  }
                  this._execute(o)
                    .then(function (e) {
                      var n = e.node_id,
                        o = void 0 === n ? null : n;
                      (t._targetNodeId = o),
                        r === p.PeerType.Offer
                          ? t.setState(p.State.Trying)
                          : t.setState(p.State.Active);
                    })
                    .catch(function (e) {
                      u.default.error(
                        ''.concat(t.id, ' - Sending ').concat(r, ' error:'),
                        e
                      ),
                        t.hangup();
                    });
                } else this._requestAnotherLocalDescription();
              }),
              (e.prototype._registerPeerEvents = function () {
                var e = this,
                  t = this.peer.instance;
                (this._iceDone = !1),
                  (t.onicecandidate = function (n) {
                    e._iceDone ||
                      (null === e._iceTimeout &&
                        (u.default.debug('Setting _iceTimeout to 1 second'),
                        (e._iceTimeout = setTimeout(function () {
                          return e._onIceSdp(t.localDescription);
                        }, 1e3))),
                      n.candidate
                        ? u.default.debug(
                            'IceCandidate: address:',
                            n.candidate.address,
                            ' - port:',
                            n.candidate.port,
                            ' - type:',
                            n.candidate.type
                          )
                        : e._onIceSdp(t.localDescription));
                  }),
                  t.addEventListener('track', function (t) {
                    e.options.remoteStream = t.streams[0];
                    var n = e.options,
                      r = n.remoteElement,
                      o = n.remoteStream;
                    !1 === n.screenShare && (0, b.attachMediaStream)(r, o);
                  }),
                  t.addEventListener('addstream', function (t) {
                    e.options.remoteStream = t.stream;
                  });
              }),
              (e.prototype._onMediaError = function (e) {
                this._dispatchNotification({
                  type: p.NOTIFICATION_TYPE.userMediaError,
                  error: e,
                }),
                  this.hangup({}, !1);
              }),
              (e.prototype._dispatchConferenceUpdate = function (e) {
                this._dispatchNotification(
                  o(
                    { type: p.NOTIFICATION_TYPE.conferenceUpdate, call: this },
                    e
                  )
                );
              }),
              (e.prototype._dispatchNotification = function (e) {
                !0 !== this.options.screenShare &&
                  ((0, h.trigger)(f.SwEvent.Notification, e, this.id, !1) ||
                    (0, h.trigger)(
                      f.SwEvent.Notification,
                      e,
                      this.session.uuid
                    ));
              }),
              (e.prototype._execute = function (e) {
                return (
                  this.nodeId && (e.targetNodeId = this.nodeId),
                  this.session.execute(e)
                );
              }),
              (e.prototype._init = function () {
                var e = this.options,
                  t = e.id,
                  n = e.userVariables,
                  r = e.remoteCallerNumber,
                  o = e.onNotification;
                t || (this.options.id = (0, c.v4)()),
                  (this.id = this.options.id),
                  (n && !(0, y.objEmpty)(n)) ||
                    (this.options.userVariables =
                      this.session.options.userVariables || {}),
                  r ||
                    (this.options.remoteCallerNumber =
                      this.options.destinationNumber),
                  (this.session.calls[this.id] = this),
                  (0, h.register)(
                    f.SwEvent.MediaError,
                    this._onMediaError,
                    this.id
                  ),
                  (0, y.isFunction)(o) &&
                    (0, h.register)(
                      f.SwEvent.Notification,
                      o.bind(this),
                      this.id
                    ),
                  this.setState(p.State.New),
                  u.default.info('New Call with Options:', this.options);
              }),
              (e.prototype._finalize = function () {
                var e = this.options,
                  t = e.remoteStream,
                  n = e.localStream,
                  r = e.remoteElement,
                  o = e.localElement;
                (0, b.stopStream)(t),
                  (0, b.stopStream)(n),
                  !0 !== this.options.screenShare &&
                    ((0, b.detachMediaStream)(r), (0, b.detachMediaStream)(o)),
                  (0, h.deRegister)(f.SwEvent.MediaError, null, this.id),
                  (this.peer = null),
                  (this.session.calls[this.id] = null),
                  delete this.session.calls[this.id];
              }),
              e
            );
          })();
        t.default = _;
      },
      960: function (e, t, n) {
        'use strict';
        var r,
          o =
            (this && this.__extends) ||
            ((r = function (e, t) {
              return (
                (r =
                  Object.setPrototypeOf ||
                  ({ __proto__: [] } instanceof Array &&
                    function (e, t) {
                      e.__proto__ = t;
                    }) ||
                  function (e, t) {
                    for (var n in t)
                      Object.prototype.hasOwnProperty.call(t, n) &&
                        (e[n] = t[n]);
                  }),
                r(e, t)
              );
            }),
            function (e, t) {
              if ('function' != typeof t && null !== t)
                throw new TypeError(
                  'Class extends value ' +
                    String(t) +
                    ' is not a constructor or null'
                );
              function n() {
                this.constructor = e;
              }
              r(e, t),
                (e.prototype =
                  null === t
                    ? Object.create(t)
                    : ((n.prototype = t.prototype), new n()));
            }),
          i =
            (this && this.__assign) ||
            function () {
              return (
                (i =
                  Object.assign ||
                  function (e) {
                    for (var t, n = 1, r = arguments.length; n < r; n++)
                      for (var o in (t = arguments[n]))
                        Object.prototype.hasOwnProperty.call(t, o) &&
                          (e[o] = t[o]);
                    return e;
                  }),
                i.apply(this, arguments)
              );
            },
          s =
            (this && this.__awaiter) ||
            function (e, t, n, r) {
              return new (n || (n = Promise))(function (o, i) {
                function s(e) {
                  try {
                    c(r.next(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function a(e) {
                  try {
                    c(r.throw(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function c(e) {
                  var t;
                  e.done
                    ? o(e.value)
                    : ((t = e.value),
                      t instanceof n
                        ? t
                        : new n(function (e) {
                            e(t);
                          })).then(s, a);
                }
                c((r = r.apply(e, t || [])).next());
              });
            },
          a =
            (this && this.__generator) ||
            function (e, t) {
              var n,
                r,
                o,
                i,
                s = {
                  label: 0,
                  sent: function () {
                    if (1 & o[0]) throw o[1];
                    return o[1];
                  },
                  trys: [],
                  ops: [],
                };
              return (
                (i = { next: a(0), throw: a(1), return: a(2) }),
                'function' == typeof Symbol &&
                  (i[Symbol.iterator] = function () {
                    return this;
                  }),
                i
              );
              function a(a) {
                return function (c) {
                  return (function (a) {
                    if (n)
                      throw new TypeError('Generator is already executing.');
                    for (; i && ((i = 0), a[0] && (s = 0)), s; )
                      try {
                        if (
                          ((n = 1),
                          r &&
                            (o =
                              2 & a[0]
                                ? r.return
                                : a[0]
                                ? r.throw || ((o = r.return) && o.call(r), 0)
                                : r.next) &&
                            !(o = o.call(r, a[1])).done)
                        )
                          return o;
                        switch (
                          ((r = 0), o && (a = [2 & a[0], o.value]), a[0])
                        ) {
                          case 0:
                          case 1:
                            o = a;
                            break;
                          case 4:
                            return s.label++, { value: a[1], done: !1 };
                          case 5:
                            s.label++, (r = a[1]), (a = [0]);
                            continue;
                          case 7:
                            (a = s.ops.pop()), s.trys.pop();
                            continue;
                          default:
                            if (
                              !(
                                (o =
                                  (o = s.trys).length > 0 && o[o.length - 1]) ||
                                (6 !== a[0] && 2 !== a[0])
                              )
                            ) {
                              s = 0;
                              continue;
                            }
                            if (
                              3 === a[0] &&
                              (!o || (a[1] > o[0] && a[1] < o[3]))
                            ) {
                              s.label = a[1];
                              break;
                            }
                            if (6 === a[0] && s.label < o[1]) {
                              (s.label = o[1]), (o = a);
                              break;
                            }
                            if (o && s.label < o[2]) {
                              (s.label = o[2]), s.ops.push(a);
                              break;
                            }
                            o[2] && s.ops.pop(), s.trys.pop();
                            continue;
                        }
                        a = t.call(e, s);
                      } catch (e) {
                        (a = [6, e]), (r = 0);
                      } finally {
                        n = o = 0;
                      }
                    if (5 & a[0]) throw a[1];
                    return { value: a[0] ? a[1] : void 0, done: !0 };
                  })([a, c]);
                };
              }
            },
          c =
            (this && this.__importDefault) ||
            function (e) {
              return e && e.__esModule ? e : { default: e };
            };
        Object.defineProperty(t, '__esModule', { value: !0 });
        var u = c(n(955)),
          l = c(n(945)),
          d = n(317),
          f = (function (e) {
            function t() {
              var t = (null !== e && e.apply(this, arguments)) || this;
              return (t._statsInterval = null), t;
            }
            return (
              o(t, e),
              (t.prototype.hangup = function (n, r) {
                void 0 === n && (n = {}),
                  void 0 === r && (r = !0),
                  this.screenShare instanceof t &&
                    this.screenShare.hangup(n, r),
                  e.prototype.hangup.call(this, n, r);
              }),
              (t.prototype.startScreenShare = function (e) {
                return s(this, void 0, void 0, function () {
                  var n,
                    r,
                    o,
                    s,
                    c,
                    u,
                    l,
                    f = this;
                  return a(this, function (a) {
                    switch (a.label) {
                      case 0:
                        return [4, (0, d.getDisplayMedia)({ video: !0 })];
                      case 1:
                        return (
                          (n = a.sent()).getTracks().forEach(function (e) {
                            e.addEventListener('ended', function () {
                              f.screenShare && f.screenShare.hangup();
                            });
                          }),
                          (r = this.options),
                          (o = r.remoteCallerName),
                          (s = r.remoteCallerNumber),
                          (c = r.callerName),
                          (u = r.callerNumber),
                          (l = i(
                            {
                              screenShare: !0,
                              localStream: n,
                              destinationNumber: ''.concat(
                                this.extension,
                                '-screen'
                              ),
                              remoteCallerName: o,
                              remoteCallerNumber: ''.concat(s, '-screen'),
                              callerName: ''.concat(c, ' (Screen)'),
                              callerNumber: ''.concat(u, ' (Screen)'),
                            },
                            e
                          )),
                          (this.screenShare = new t(this.session, l)),
                          this.screenShare.invite(),
                          [2, this.screenShare]
                        );
                    }
                  });
                });
              }),
              (t.prototype.stopScreenShare = function () {
                this.screenShare instanceof t && this.screenShare.hangup();
              }),
              (t.prototype.setAudioOutDevice = function (e) {
                return s(this, void 0, void 0, function () {
                  var t, n, r;
                  return a(this, function (o) {
                    return (
                      (this.options.speakerId = e),
                      (t = this.options),
                      (n = t.remoteElement),
                      (r = t.speakerId),
                      n && r ? [2, (0, d.setMediaElementSinkId)(n, r)] : [2, !1]
                    );
                  });
                });
              }),
              (t.prototype._finalize = function () {
                this._stats(!1), e.prototype._finalize.call(this);
              }),
              (t.prototype._stats = function (e) {
                var t = this;
                if ((void 0 === e && (e = !0), !1 === e))
                  return clearInterval(this._statsInterval);
                u.default.setLevel(2),
                  (this._statsInterval = window.setInterval(function () {
                    return s(t, void 0, void 0, function () {
                      var e, t, n, r;
                      return a(this, function (o) {
                        switch (o.label) {
                          case 0:
                            return [4, this.peer.instance.getStats(null)];
                          case 1:
                            return (
                              (e = o.sent()),
                              (t = ''),
                              (n = [
                                'certificate',
                                'codec',
                                'peer-connection',
                                'stream',
                                'local-candidate',
                                'remote-candidate',
                              ]),
                              (r = ['id', 'type', 'timestamp']),
                              e.forEach(function (e) {
                                n.includes(e.type) ||
                                  ((t += '\n'.concat(e.type, '\n')),
                                  Object.keys(e).forEach(function (n) {
                                    r.includes(n) ||
                                      (t += '\t'
                                        .concat(n, ': ')
                                        .concat(e[n], '\n'));
                                  }));
                              }),
                              u.default.info(t),
                              [2]
                            );
                        }
                      });
                    });
                  }, 2e3));
              }),
              t
            );
          })(l.default);
        t.default = f;
      },
      788: function (e, t, n) {
        'use strict';
        var r =
            (this && this.__assign) ||
            function () {
              return (
                (r =
                  Object.assign ||
                  function (e) {
                    for (var t, n = 1, r = arguments.length; n < r; n++)
                      for (var o in (t = arguments[n]))
                        Object.prototype.hasOwnProperty.call(t, o) &&
                          (e[o] = t[o]);
                    return e;
                  }),
                r.apply(this, arguments)
              );
            },
          o =
            (this && this.__awaiter) ||
            function (e, t, n, r) {
              return new (n || (n = Promise))(function (o, i) {
                function s(e) {
                  try {
                    c(r.next(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function a(e) {
                  try {
                    c(r.throw(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function c(e) {
                  var t;
                  e.done
                    ? o(e.value)
                    : ((t = e.value),
                      t instanceof n
                        ? t
                        : new n(function (e) {
                            e(t);
                          })).then(s, a);
                }
                c((r = r.apply(e, t || [])).next());
              });
            },
          i =
            (this && this.__generator) ||
            function (e, t) {
              var n,
                r,
                o,
                i,
                s = {
                  label: 0,
                  sent: function () {
                    if (1 & o[0]) throw o[1];
                    return o[1];
                  },
                  trys: [],
                  ops: [],
                };
              return (
                (i = { next: a(0), throw: a(1), return: a(2) }),
                'function' == typeof Symbol &&
                  (i[Symbol.iterator] = function () {
                    return this;
                  }),
                i
              );
              function a(a) {
                return function (c) {
                  return (function (a) {
                    if (n)
                      throw new TypeError('Generator is already executing.');
                    for (; i && ((i = 0), a[0] && (s = 0)), s; )
                      try {
                        if (
                          ((n = 1),
                          r &&
                            (o =
                              2 & a[0]
                                ? r.return
                                : a[0]
                                ? r.throw || ((o = r.return) && o.call(r), 0)
                                : r.next) &&
                            !(o = o.call(r, a[1])).done)
                        )
                          return o;
                        switch (
                          ((r = 0), o && (a = [2 & a[0], o.value]), a[0])
                        ) {
                          case 0:
                          case 1:
                            o = a;
                            break;
                          case 4:
                            return s.label++, { value: a[1], done: !1 };
                          case 5:
                            s.label++, (r = a[1]), (a = [0]);
                            continue;
                          case 7:
                            (a = s.ops.pop()), s.trys.pop();
                            continue;
                          default:
                            if (
                              !(
                                (o =
                                  (o = s.trys).length > 0 && o[o.length - 1]) ||
                                (6 !== a[0] && 2 !== a[0])
                              )
                            ) {
                              s = 0;
                              continue;
                            }
                            if (
                              3 === a[0] &&
                              (!o || (a[1] > o[0] && a[1] < o[3]))
                            ) {
                              s.label = a[1];
                              break;
                            }
                            if (6 === a[0] && s.label < o[1]) {
                              (s.label = o[1]), (o = a);
                              break;
                            }
                            if (o && s.label < o[2]) {
                              (s.label = o[2]), s.ops.push(a);
                              break;
                            }
                            o[2] && s.ops.pop(), s.trys.pop();
                            continue;
                        }
                        a = t.call(e, s);
                      } catch (e) {
                        (a = [6, e]), (r = 0);
                      } finally {
                        n = o = 0;
                      }
                    if (5 & a[0]) throw a[1];
                    return { value: a[0] ? a[1] : void 0, done: !0 };
                  })([a, c]);
                };
              }
            },
          s =
            (this && this.__importDefault) ||
            function (e) {
              return e && e.__esModule ? e : { default: e };
            };
        Object.defineProperty(t, '__esModule', { value: !0 });
        var a = s(n(955)),
          c = {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          },
          u = (function () {
            function e(e) {
              var t = this;
              void 0 === e && (e = {}),
                (this.params = e),
                (this.baseUrl = 'https://cantina-backend.signalwire.com'),
                (this._fetch = function (e, n) {
                  return fetch(e, n).then(function (e) {
                    return o(t, void 0, void 0, function () {
                      var t, n, r;
                      return i(this, function (o) {
                        switch (o.label) {
                          case 0:
                            return [4, e.json()];
                          case 1:
                            return (
                              (t = o.sent()),
                              e.status >= 200 && e.status < 300
                                ? [2, t]
                                : ((n =
                                    'HTTP Request failed with status '.concat(
                                      e.status
                                    )),
                                  ((r = new Error(n)).payload = t),
                                  [2, Promise.reject(r)])
                            );
                        }
                      });
                    });
                  });
                });
              var n = e.hostname,
                r = void 0 === n ? location.hostname : n;
              this.hostname = r;
            }
            return (
              (e.prototype.userLogin = function (e, t) {
                return o(this, void 0, void 0, function () {
                  var n;
                  return i(this, function (o) {
                    switch (o.label) {
                      case 0:
                        return [
                          4,
                          this._fetch(
                            ''.concat(this.baseUrl, '/login/user'),
                            r(r({}, c), {
                              body: JSON.stringify({
                                username: e,
                                password: t,
                                hostname: this.hostname,
                              }),
                            })
                          ),
                        ];
                      case 1:
                        return (
                          (n = o.sent()),
                          a.default.info('userLogin response', n),
                          [2, n]
                        );
                    }
                  });
                });
              }),
              (e.prototype.guestLogin = function (e, t, n) {
                return o(this, void 0, void 0, function () {
                  var o;
                  return i(this, function (i) {
                    switch (i.label) {
                      case 0:
                        return [
                          4,
                          this._fetch(
                            ''.concat(this.baseUrl, '/login/guest'),
                            r(r({}, c), {
                              body: JSON.stringify({
                                name: e,
                                email: t,
                                token: n,
                                hostname: this.hostname,
                              }),
                            })
                          ),
                        ];
                      case 1:
                        return (
                          (o = i.sent()),
                          a.default.info('guestLogin response', o),
                          [2, o]
                        );
                    }
                  });
                });
              }),
              (e.prototype.refresh = function () {
                return o(this, void 0, void 0, function () {
                  var e;
                  return i(this, function (t) {
                    switch (t.label) {
                      case 0:
                        return [
                          4,
                          this._fetch(
                            ''.concat(this.baseUrl, '/refresh'),
                            r(r({}, c), {
                              method: 'PUT',
                              body: JSON.stringify({ hostname: this.hostname }),
                            })
                          ),
                        ];
                      case 1:
                        return (
                          (e = t.sent()),
                          a.default.info('refresh response', e),
                          [2, e]
                        );
                    }
                  });
                });
              }),
              (e.prototype.checkInviteToken = function (e) {
                return o(this, void 0, void 0, function () {
                  var t;
                  return i(this, function (n) {
                    switch (n.label) {
                      case 0:
                        return [
                          4,
                          this._fetch(
                            ''.concat(this.baseUrl, '/check-token'),
                            r(r({}, c), {
                              body: JSON.stringify({
                                token: e,
                                hostname: this.hostname,
                              }),
                            })
                          ),
                        ];
                      case 1:
                        return (
                          (t = n.sent()),
                          a.default.info('checkInviteToken response', t),
                          [2, t]
                        );
                    }
                  });
                });
              }),
              e
            );
          })();
        t.default = u;
      },
      616: function (e, t, n) {
        'use strict';
        var r =
          (this && this.__assign) ||
          function () {
            return (
              (r =
                Object.assign ||
                function (e) {
                  for (var t, n = 1, r = arguments.length; n < r; n++)
                    for (var o in (t = arguments[n]))
                      Object.prototype.hasOwnProperty.call(t, o) &&
                        (e[o] = t[o]);
                  return e;
                }),
              r.apply(this, arguments)
            );
          };
        Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.MCULayoutEventHandler = void 0);
        var o = n(291),
          i = n(789),
          s = n(403),
          a = n(858);
        t.MCULayoutEventHandler = function (e, t) {
          var n = t.contentType,
            a = t.canvasType,
            u = t.callID,
            l = t.canvasInfo,
            d = void 0 === l ? null : l,
            f = t.currentLayerIdx,
            p = void 0 === f ? -1 : f;
          d && 'mcu-personal-canvas' !== a && delete d.memberID;
          var h = {
            type: o.NOTIFICATION_TYPE.conferenceUpdate,
            call: e.calls[u],
            canvasInfo: c(d),
            currentLayerIdx: p,
          };
          switch (n) {
            case 'layer-info':
              var v = r({ action: o.ConferenceAction.LayerInfo }, h);
              (0, s.trigger)(i.SwEvent.Notification, v, e.uuid);
              break;
            case 'layout-info':
              (v = r({ action: o.ConferenceAction.LayoutInfo }, h)),
                (0, s.trigger)(i.SwEvent.Notification, v, e.uuid);
          }
        };
        var c = function (e) {
          var t = JSON.stringify(e)
            .replace(/memberID/g, 'participantId')
            .replace(/ID"/g, 'Id"')
            .replace(/POS"/g, 'Pos"');
          return (0, a.safeParseJson)(t);
        };
      },
      24: function (e, t, n) {
        'use strict';
        var r =
            (this && this.__awaiter) ||
            function (e, t, n, r) {
              return new (n || (n = Promise))(function (o, i) {
                function s(e) {
                  try {
                    c(r.next(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function a(e) {
                  try {
                    c(r.throw(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function c(e) {
                  var t;
                  e.done
                    ? o(e.value)
                    : ((t = e.value),
                      t instanceof n
                        ? t
                        : new n(function (e) {
                            e(t);
                          })).then(s, a);
                }
                c((r = r.apply(e, t || [])).next());
              });
            },
          o =
            (this && this.__generator) ||
            function (e, t) {
              var n,
                r,
                o,
                i,
                s = {
                  label: 0,
                  sent: function () {
                    if (1 & o[0]) throw o[1];
                    return o[1];
                  },
                  trys: [],
                  ops: [],
                };
              return (
                (i = { next: a(0), throw: a(1), return: a(2) }),
                'function' == typeof Symbol &&
                  (i[Symbol.iterator] = function () {
                    return this;
                  }),
                i
              );
              function a(a) {
                return function (c) {
                  return (function (a) {
                    if (n)
                      throw new TypeError('Generator is already executing.');
                    for (; i && ((i = 0), a[0] && (s = 0)), s; )
                      try {
                        if (
                          ((n = 1),
                          r &&
                            (o =
                              2 & a[0]
                                ? r.return
                                : a[0]
                                ? r.throw || ((o = r.return) && o.call(r), 0)
                                : r.next) &&
                            !(o = o.call(r, a[1])).done)
                        )
                          return o;
                        switch (
                          ((r = 0), o && (a = [2 & a[0], o.value]), a[0])
                        ) {
                          case 0:
                          case 1:
                            o = a;
                            break;
                          case 4:
                            return s.label++, { value: a[1], done: !1 };
                          case 5:
                            s.label++, (r = a[1]), (a = [0]);
                            continue;
                          case 7:
                            (a = s.ops.pop()), s.trys.pop();
                            continue;
                          default:
                            if (
                              !(
                                (o =
                                  (o = s.trys).length > 0 && o[o.length - 1]) ||
                                (6 !== a[0] && 2 !== a[0])
                              )
                            ) {
                              s = 0;
                              continue;
                            }
                            if (
                              3 === a[0] &&
                              (!o || (a[1] > o[0] && a[1] < o[3]))
                            ) {
                              s.label = a[1];
                              break;
                            }
                            if (6 === a[0] && s.label < o[1]) {
                              (s.label = o[1]), (o = a);
                              break;
                            }
                            if (o && s.label < o[2]) {
                              (s.label = o[2]), s.ops.push(a);
                              break;
                            }
                            o[2] && s.ops.pop(), s.trys.pop();
                            continue;
                        }
                        a = t.call(e, s);
                      } catch (e) {
                        (a = [6, e]), (r = 0);
                      } finally {
                        n = o = 0;
                      }
                    if (5 & a[0]) throw a[1];
                    return { value: a[0] ? a[1] : void 0, done: !0 };
                  })([a, c]);
                };
              }
            },
          i =
            (this && this.__values) ||
            function (e) {
              var t = 'function' == typeof Symbol && Symbol.iterator,
                n = t && e[t],
                r = 0;
              if (n) return n.call(e);
              if (e && 'number' == typeof e.length)
                return {
                  next: function () {
                    return (
                      e && r >= e.length && (e = void 0),
                      { value: e && e[r++], done: !e }
                    );
                  },
                };
              throw new TypeError(
                t
                  ? 'Object is not iterable.'
                  : 'Symbol.iterator is not defined.'
              );
            },
          s =
            (this && this.__importDefault) ||
            function (e) {
              return e && e.__esModule ? e : { default: e };
            };
        Object.defineProperty(t, '__esModule', { value: !0 });
        var a = s(n(955)),
          c = n(203),
          u = n(789),
          l = n(291),
          d = n(317),
          f = n(858),
          p = n(403),
          h = n(203),
          v = n(203),
          y = (function () {
            function e(e, t) {
              (this.type = e),
                (this.options = t),
                (this.onSdpReadyTwice = null),
                (this._negotiating = !1),
                a.default.info(
                  'New Peer with type:',
                  this.type,
                  'Options:',
                  this.options
                ),
                (this._constraints = {
                  offerToReceiveAudio: !0,
                  offerToReceiveVideo: !0,
                }),
                (this._sdpReady = this._sdpReady.bind(this)),
                this._init();
            }
            return (
              (e.prototype.resetNegotiating = function () {
                this._negotiating = !1;
              }),
              Object.defineProperty(e.prototype, 'isNegotiating', {
                get: function () {
                  return this._negotiating;
                },
                enumerable: !1,
                configurable: !0,
              }),
              (e.prototype.startNegotiation = function () {
                (this._negotiating = !0),
                  this._isOffer() ? this._createOffer() : this._createAnswer();
              }),
              (e.prototype._init = function () {
                return r(this, void 0, void 0, function () {
                  var e,
                    t,
                    n,
                    r,
                    s,
                    c,
                    l,
                    f,
                    h,
                    v,
                    y,
                    b,
                    g,
                    _,
                    m = this;
                  return o(this, function (o) {
                    switch (o.label) {
                      case 0:
                        return (
                          (this.instance = (0, d.RTCPeerConnection)(
                            this._config()
                          )),
                          (this.instance.onsignalingstatechange = function (e) {
                            switch (m.instance.signalingState) {
                              case 'stable':
                                break;
                              case 'closed':
                                m.instance = null;
                                break;
                              default:
                                m._negotiating = !0;
                            }
                          }),
                          (this.instance.onnegotiationneeded = function (e) {
                            m._negotiating
                              ? a.default.debug(
                                  'Skip twice onnegotiationneeded..'
                                )
                              : m.startNegotiation();
                          }),
                          (e = this.options),
                          [
                            4,
                            this._retrieveLocalStream().catch(function (e) {
                              return (
                                (0, p.trigger)(
                                  u.SwEvent.MediaError,
                                  e,
                                  m.options.id
                                ),
                                null
                              );
                            }),
                          ]
                        );
                      case 1:
                        if (
                          ((e.localStream = o.sent()),
                          (t = this.options),
                          (n = t.localElement),
                          (r = t.localStream),
                          (s = void 0 === r ? null : r),
                          (c = t.screenShare),
                          (l = void 0 !== c && c),
                          !(0, d.streamIsValid)(s))
                        )
                          return [3, 12];
                        if ('function' != typeof this.instance.addTrack)
                          return [3, 10];
                        (f = s.getTracks()), (o.label = 2);
                      case 2:
                        o.trys.push([2, 7, 8, 9]),
                          (h = i(f)),
                          (v = h.next()),
                          (o.label = 3);
                      case 3:
                        return v.done
                          ? [3, 6]
                          : ((y = v.value), [4, this.instance.addTrack(y, s)]);
                      case 4:
                        o.sent(), (o.label = 5);
                      case 5:
                        return (v = h.next()), [3, 3];
                      case 6:
                        return [3, 9];
                      case 7:
                        return (b = o.sent()), (g = { error: b }), [3, 9];
                      case 8:
                        try {
                          v && !v.done && (_ = h.return) && _.call(h);
                        } finally {
                          if (g) throw g.error;
                        }
                        return [7];
                      case 9:
                        return [3, 11];
                      case 10:
                        this.instance.addStream(s), (o.label = 11);
                      case 11:
                        return (
                          !0 !== l &&
                            ((0, d.muteMediaElement)(n),
                            (0, d.attachMediaStream)(n, s)),
                          [3, 13]
                        );
                      case 12:
                        null === s && this.startNegotiation(), (o.label = 13);
                      case 13:
                        return [2];
                    }
                  });
                });
              }),
              (e.prototype._createOffer = function () {
                this._isOffer() &&
                  this.instance
                    .createOffer(this._constraints)
                    .then(this._setLocalDescription.bind(this))
                    .then(this._sdpReady)
                    .catch(function (e) {
                      return a.default.error('Peer _createOffer error:', e);
                    });
              }),
              (e.prototype._createAnswer = function () {
                var e = this;
                if (this._isAnswer()) {
                  var t = this.options,
                    n = t.remoteSdp,
                    r = t.useStereo ? (0, c.sdpStereoHack)(n) : n,
                    o = (0, d.sdpToJsonHack)({
                      sdp: r,
                      type: l.PeerType.Offer,
                    });
                  this.instance
                    .setRemoteDescription(o)
                    .then(function () {
                      return e.instance.createAnswer();
                    })
                    .then(this._setLocalDescription.bind(this))
                    .then(this._sdpReady)
                    .catch(function (e) {
                      return a.default.error('Peer _createAnswer error:', e);
                    });
                }
              }),
              (e.prototype._setLocalDescription = function (e) {
                var t = this.options,
                  n = t.useStereo,
                  r = t.googleMaxBitrate,
                  o = t.googleMinBitrate,
                  i = t.googleStartBitrate;
                return (
                  n && (e.sdp = (0, c.sdpStereoHack)(e.sdp)),
                  r &&
                    o &&
                    i &&
                    (e.sdp = (0, c.sdpBitrateHack)(e.sdp, r, o, i)),
                  a.default.debug(
                    'calling setLocalDescription with SDP:',
                    e.sdp
                  ),
                  this.instance.setLocalDescription(e)
                );
              }),
              (e.prototype._sdpReady = function () {
                (0, f.isFunction)(this.onSdpReadyTwice) &&
                  this.onSdpReadyTwice(this.instance.localDescription);
              }),
              (e.prototype._getSharedConstraints = function (e, t) {
                var n, r;
                void 0 === t && (t = '');
                var o =
                    null !== (n = null == e ? void 0 : e.audio) &&
                    void 0 !== n &&
                    n,
                  i = !!t && (0, v.sdpHasAudio)(t),
                  s =
                    null !== (r = null == e ? void 0 : e.video) &&
                    void 0 !== r &&
                    r,
                  a = !!t && (0, v.sdpHasVideo)(t);
                return { audio: o && i, video: s && a };
              }),
              (e.prototype._retrieveLocalStream = function () {
                return r(this, void 0, void 0, function () {
                  var e, t, n, r, i, s, a;
                  return o(this, function (o) {
                    switch (o.label) {
                      case 0:
                        return (0, d.streamIsValid)(this.options.localStream)
                          ? [2, this.options.localStream]
                          : [4, (0, c.getMediaConstraints)(this.options)];
                      case 1:
                        return (
                          (e = o.sent()),
                          (t = e),
                          this._isAnswer() &&
                            ((n = this.options),
                            (r = n.remoteSdp),
                            (i = n.useStereo),
                            (s = i ? (0, c.sdpStereoHack)(r) : r),
                            (a = (0, d.sdpToJsonHack)({
                              sdp: s,
                              type: l.PeerType.Offer,
                            })),
                            (t = this._getSharedConstraints(e, a.sdp))),
                          [2, (0, c.getUserMedia)(t)]
                        );
                    }
                  });
                });
              }),
              (e.prototype._isOffer = function () {
                return this.type === l.PeerType.Offer;
              }),
              (e.prototype._isAnswer = function () {
                return this.type === l.PeerType.Answer;
              }),
              (e.prototype._config = function () {
                var e = this.options,
                  t = e.iceServers,
                  n = void 0 === t ? [] : t,
                  r = e.iceTransportPolicy,
                  o = void 0 === r ? 'all' : r,
                  i = e.disableUdpIceServers,
                  s = void 0 !== i && i,
                  c = {
                    iceTransportPolicy: o,
                    sdpSemantics: 'unified-plan',
                    bundlePolicy: 'max-compat',
                    iceServers: (0, h.filterIceServers)(n, {
                      disableUdpIceServers: s,
                    }),
                  };
                return a.default.info('RTC config', c), c;
              }),
              (e.prototype._getSenderByKind = function (e) {
                return r(this, void 0, void 0, function () {
                  return o(this, function (t) {
                    switch (t.label) {
                      case 0:
                        return this.instance
                          ? [4, this.instance.getSenders()]
                          : [3, 2];
                      case 1:
                        return [
                          2,
                          t.sent().find(function (t) {
                            var n = t.track;
                            return n && n.kind === e;
                          }),
                        ];
                      case 2:
                        return [2];
                    }
                  });
                });
              }),
              (e.prototype.applyMediaConstraints = function (e, t) {
                return r(this, void 0, void 0, function () {
                  var n;
                  return o(this, function (r) {
                    switch (r.label) {
                      case 0:
                        return (
                          r.trys.push([0, 4, , 5]),
                          [4, this._getSenderByKind(e)]
                        );
                      case 1:
                        return (n = r.sent()) && n.track
                          ? 'live' !== n.track.readyState
                            ? [3, 3]
                            : (a.default.info(
                                'Apply '.concat(e, ' constraints'),
                                this.options.id,
                                t
                              ),
                              [4, n.track.applyConstraints(t)])
                          : [
                              2,
                              a.default.info(
                                'No sender to apply constraints',
                                e,
                                t
                              ),
                            ];
                      case 2:
                        r.sent(), (r.label = 3);
                      case 3:
                        return [3, 5];
                      case 4:
                        return (
                          r.sent(),
                          a.default.error('Error applying constraints', e, t),
                          [3, 5]
                        );
                      case 5:
                        return [2];
                    }
                  });
                });
              }),
              e
            );
          })();
        t.default = y;
      },
      232: function (e, t, n) {
        'use strict';
        var r =
            (this && this.__awaiter) ||
            function (e, t, n, r) {
              return new (n || (n = Promise))(function (o, i) {
                function s(e) {
                  try {
                    c(r.next(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function a(e) {
                  try {
                    c(r.throw(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function c(e) {
                  var t;
                  e.done
                    ? o(e.value)
                    : ((t = e.value),
                      t instanceof n
                        ? t
                        : new n(function (e) {
                            e(t);
                          })).then(s, a);
                }
                c((r = r.apply(e, t || [])).next());
              });
            },
          o =
            (this && this.__generator) ||
            function (e, t) {
              var n,
                r,
                o,
                i,
                s = {
                  label: 0,
                  sent: function () {
                    if (1 & o[0]) throw o[1];
                    return o[1];
                  },
                  trys: [],
                  ops: [],
                };
              return (
                (i = { next: a(0), throw: a(1), return: a(2) }),
                'function' == typeof Symbol &&
                  (i[Symbol.iterator] = function () {
                    return this;
                  }),
                i
              );
              function a(a) {
                return function (c) {
                  return (function (a) {
                    if (n)
                      throw new TypeError('Generator is already executing.');
                    for (; i && ((i = 0), a[0] && (s = 0)), s; )
                      try {
                        if (
                          ((n = 1),
                          r &&
                            (o =
                              2 & a[0]
                                ? r.return
                                : a[0]
                                ? r.throw || ((o = r.return) && o.call(r), 0)
                                : r.next) &&
                            !(o = o.call(r, a[1])).done)
                        )
                          return o;
                        switch (
                          ((r = 0), o && (a = [2 & a[0], o.value]), a[0])
                        ) {
                          case 0:
                          case 1:
                            o = a;
                            break;
                          case 4:
                            return s.label++, { value: a[1], done: !1 };
                          case 5:
                            s.label++, (r = a[1]), (a = [0]);
                            continue;
                          case 7:
                            (a = s.ops.pop()), s.trys.pop();
                            continue;
                          default:
                            if (
                              !(
                                (o =
                                  (o = s.trys).length > 0 && o[o.length - 1]) ||
                                (6 !== a[0] && 2 !== a[0])
                              )
                            ) {
                              s = 0;
                              continue;
                            }
                            if (
                              3 === a[0] &&
                              (!o || (a[1] > o[0] && a[1] < o[3]))
                            ) {
                              s.label = a[1];
                              break;
                            }
                            if (6 === a[0] && s.label < o[1]) {
                              (s.label = o[1]), (o = a);
                              break;
                            }
                            if (o && s.label < o[2]) {
                              (s.label = o[2]), s.ops.push(a);
                              break;
                            }
                            o[2] && s.ops.pop(), s.trys.pop();
                            continue;
                        }
                        a = t.call(e, s);
                      } catch (e) {
                        (a = [6, e]), (r = 0);
                      } finally {
                        n = o = 0;
                      }
                    if (5 & a[0]) throw a[1];
                    return { value: a[0] ? a[1] : void 0, done: !0 };
                  })([a, c]);
                };
              }
            },
          i =
            (this && this.__importDefault) ||
            function (e) {
              return e && e.__esModule ? e : { default: e };
            };
        Object.defineProperty(t, '__esModule', { value: !0 });
        var s = i(n(955)),
          a = i(n(960)),
          c = n(203),
          u = n(503),
          l = n(789),
          d = n(291),
          f = n(403),
          p = n(291),
          h = n(616),
          v = (function () {
            function e(e) {
              this.session = e;
            }
            return (
              (e.prototype._ack = function (e, t) {
                var n = new u.Result(e, t);
                this.nodeId && (n.targetNodeId = this.nodeId),
                  this.session.execute(n);
              }),
              (e.prototype.handleMessage = function (e) {
                var t = this,
                  n = this.session,
                  r = e.id,
                  o = e.method,
                  i = e.params,
                  c = i.callID,
                  u = i.eventChannel,
                  h = i.eventType,
                  v = o === d.VertoMethod.Attach;
                if ('channelPvtData' === h)
                  return this._handlePvtEvent(i.pvtData);
                if (c && n.calls.hasOwnProperty(c)) {
                  if (!v)
                    return n.calls[c].handleMessage(e), void this._ack(r, o);
                  n.calls[c].hangup({}, !1);
                }
                var y = function () {
                  var e = new a.default(n, {
                    id: c,
                    remoteSdp: i.sdp,
                    destinationNumber: i.callee_id_number,
                    remoteCallerName: i.caller_id_name,
                    remoteCallerNumber: i.caller_id_number,
                    callerName: i.callee_id_name,
                    callerNumber: i.callee_id_number,
                    attach: v,
                  });
                  return (e.nodeId = t.nodeId), e;
                };
                switch (o) {
                  case d.VertoMethod.Punt:
                    n.disconnect();
                    break;
                  case d.VertoMethod.Invite:
                    (b = y()).setState(p.State.Ringing), this._ack(r, o);
                    break;
                  case d.VertoMethod.Attach:
                    var b = y();
                    this.session.autoRecoverCalls
                      ? b.answer()
                      : b.setState(p.State.Recovering),
                      b.handleMessage(e);
                    break;
                  case d.VertoMethod.Event:
                  case 'webrtc.event':
                    if (!u)
                      return void s.default.error(
                        'Verto received an unknown event:',
                        i
                      );
                    var g = n.relayProtocol,
                      _ = u.split('.')[0];
                    n._existsSubscription(g, u)
                      ? (0, f.trigger)(g, i, u)
                      : u === n.sessionid
                      ? this._handleSessionEvent(i.eventData)
                      : n._existsSubscription(g, _)
                      ? (0, f.trigger)(g, i, _)
                      : n.calls.hasOwnProperty(u)
                      ? n.calls[u].handleMessage(e)
                      : (0, f.trigger)(l.SwEvent.Notification, i, n.uuid);
                    break;
                  case d.VertoMethod.Info:
                    (i.type = d.NOTIFICATION_TYPE.generic),
                      (0, f.trigger)(l.SwEvent.Notification, i, n.uuid);
                    break;
                  case d.VertoMethod.ClientReady:
                    (i.type = d.NOTIFICATION_TYPE.vertoClientReady),
                      (0, f.trigger)(l.SwEvent.Notification, i, n.uuid);
                    break;
                  default:
                    s.default.warn('Verto message unknown method:', e);
                }
              }),
              (e.prototype._retrieveCallId = function (e, t) {
                var n = this,
                  r = Object.keys(this.session.calls);
                if ('bootObj' !== e.action)
                  return r.find(function (e) {
                    return n.session.calls[e].channels.includes(t);
                  });
                var o = e.data.find(function (e) {
                  return r.includes(e[0]);
                });
                return o instanceof Array ? o[0] : void 0;
              }),
              (e.prototype._handlePvtEvent = function (e) {
                return r(this, void 0, void 0, function () {
                  var t,
                    n,
                    r,
                    i,
                    a,
                    u,
                    h,
                    v,
                    y,
                    b,
                    g,
                    _,
                    m,
                    w,
                    S,
                    O,
                    I,
                    C,
                    E,
                    k = this;
                  return o(this, function (o) {
                    switch (o.label) {
                      case 0:
                        switch (
                          ((t = this.session),
                          (n = t.relayProtocol),
                          (r = e.action),
                          (i = e.laChannel),
                          (a = e.laName),
                          (u = e.chatChannel),
                          (h = e.infoChannel),
                          (v = e.modChannel),
                          (y = e.conferenceMemberID),
                          (b = e.role),
                          (g = e.callID),
                          r)
                        ) {
                          case 'conference-liveArray-join':
                            return [3, 1];
                          case 'conference-liveArray-part':
                            return [3, 3];
                        }
                        return [3, 4];
                      case 1:
                        return (
                          (_ = function () {
                            t.vertoBroadcast({
                              nodeId: k.nodeId,
                              channel: i,
                              data: {
                                liveArray: {
                                  command: 'bootstrap',
                                  context: i,
                                  name: a,
                                },
                              },
                            });
                          }),
                          (m = {
                            nodeId: this.nodeId,
                            channels: [i],
                            handler: function (n) {
                              var r = n.data,
                                o = g || k._retrieveCallId(r, i);
                              if (o && t.calls.hasOwnProperty(o)) {
                                var s = t.calls[o];
                                s._addChannel(i),
                                  (s.extension = a),
                                  s
                                    .handleConferenceUpdate(r, e)
                                    .then(function (e) {
                                      'INVALID_PACKET' === e && _();
                                    });
                              }
                            },
                          }),
                          [
                            4,
                            t.vertoSubscribe(m).catch(function (e) {
                              s.default.error(
                                'liveArray subscription error:',
                                e
                              );
                            }),
                          ]
                        );
                      case 2:
                        return (
                          (w = o.sent()),
                          (0, c.checkSubscribeResponse)(w, i) && _(),
                          [3, 4]
                        );
                      case 3:
                        return (
                          (S = null),
                          i &&
                            t._existsSubscription(n, i) &&
                            ((O = t.subscriptions[n][i].callId),
                            (I = void 0 === O ? null : O),
                            (S = t.calls[I] || null),
                            null !== I &&
                              ((C = {
                                type: d.NOTIFICATION_TYPE.conferenceUpdate,
                                action: p.ConferenceAction.Leave,
                                conferenceName: a,
                                participantId: Number(y),
                                role: b,
                              }),
                              (0, f.trigger)(
                                l.SwEvent.Notification,
                                C,
                                I,
                                !1
                              ) ||
                                (0, f.trigger)(
                                  l.SwEvent.Notification,
                                  C,
                                  t.uuid
                                ),
                              null === S &&
                                (0, f.deRegister)(
                                  l.SwEvent.Notification,
                                  null,
                                  I
                                ))),
                          (E = [i, u, h, v]),
                          t
                            .vertoUnsubscribe({
                              nodeId: this.nodeId,
                              channels: E,
                            })
                            .then(function (e) {
                              var t = e.unsubscribedChannels,
                                n = void 0 === t ? [] : t;
                              S &&
                                (S.channels = S.channels.filter(function (e) {
                                  return !n.includes(e);
                                }));
                            })
                            .catch(function (e) {
                              s.default.error(
                                'liveArray unsubscribe error:',
                                e
                              );
                            }),
                          [3, 4]
                        );
                      case 4:
                        return [2];
                    }
                  });
                });
              }),
              (e.prototype._handleSessionEvent = function (e) {
                switch (e.contentType) {
                  case 'layout-info':
                  case 'layer-info':
                    (0, h.MCULayoutEventHandler)(this.session, e);
                    break;
                  case 'logo-info':
                    var t = {
                      type: d.NOTIFICATION_TYPE.conferenceUpdate,
                      action: p.ConferenceAction.LogoInfo,
                      logo: e.logoURL,
                    };
                    (0, f.trigger)(
                      l.SwEvent.Notification,
                      t,
                      this.session.uuid
                    );
                }
              }),
              e
            );
          })();
        t.default = v;
      },
      317: function (e, t, n) {
        'use strict';
        var r =
            (this && this.__createBinding) ||
            (Object.create
              ? function (e, t, n, r) {
                  void 0 === r && (r = n);
                  var o = Object.getOwnPropertyDescriptor(t, n);
                  (o &&
                    !('get' in o
                      ? !t.__esModule
                      : o.writable || o.configurable)) ||
                    (o = {
                      enumerable: !0,
                      get: function () {
                        return t[n];
                      },
                    }),
                    Object.defineProperty(e, r, o);
                }
              : function (e, t, n, r) {
                  void 0 === r && (r = n), (e[r] = t[n]);
                }),
          o =
            (this && this.__setModuleDefault) ||
            (Object.create
              ? function (e, t) {
                  Object.defineProperty(e, 'default', {
                    enumerable: !0,
                    value: t,
                  });
                }
              : function (e, t) {
                  e.default = t;
                }),
          i =
            (this && this.__importStar) ||
            function (e) {
              if (e && e.__esModule) return e;
              var t = {};
              if (null != e)
                for (var n in e)
                  'default' !== n &&
                    Object.prototype.hasOwnProperty.call(e, n) &&
                    r(t, e, n);
              return o(t, e), t;
            },
          s =
            (this && this.__awaiter) ||
            function (e, t, n, r) {
              return new (n || (n = Promise))(function (o, i) {
                function s(e) {
                  try {
                    c(r.next(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function a(e) {
                  try {
                    c(r.throw(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function c(e) {
                  var t;
                  e.done
                    ? o(e.value)
                    : ((t = e.value),
                      t instanceof n
                        ? t
                        : new n(function (e) {
                            e(t);
                          })).then(s, a);
                }
                c((r = r.apply(e, t || [])).next());
              });
            },
          a =
            (this && this.__generator) ||
            function (e, t) {
              var n,
                r,
                o,
                i,
                s = {
                  label: 0,
                  sent: function () {
                    if (1 & o[0]) throw o[1];
                    return o[1];
                  },
                  trys: [],
                  ops: [],
                };
              return (
                (i = { next: a(0), throw: a(1), return: a(2) }),
                'function' == typeof Symbol &&
                  (i[Symbol.iterator] = function () {
                    return this;
                  }),
                i
              );
              function a(a) {
                return function (c) {
                  return (function (a) {
                    if (n)
                      throw new TypeError('Generator is already executing.');
                    for (; i && ((i = 0), a[0] && (s = 0)), s; )
                      try {
                        if (
                          ((n = 1),
                          r &&
                            (o =
                              2 & a[0]
                                ? r.return
                                : a[0]
                                ? r.throw || ((o = r.return) && o.call(r), 0)
                                : r.next) &&
                            !(o = o.call(r, a[1])).done)
                        )
                          return o;
                        switch (
                          ((r = 0), o && (a = [2 & a[0], o.value]), a[0])
                        ) {
                          case 0:
                          case 1:
                            o = a;
                            break;
                          case 4:
                            return s.label++, { value: a[1], done: !1 };
                          case 5:
                            s.label++, (r = a[1]), (a = [0]);
                            continue;
                          case 7:
                            (a = s.ops.pop()), s.trys.pop();
                            continue;
                          default:
                            if (
                              !(
                                (o =
                                  (o = s.trys).length > 0 && o[o.length - 1]) ||
                                (6 !== a[0] && 2 !== a[0])
                              )
                            ) {
                              s = 0;
                              continue;
                            }
                            if (
                              3 === a[0] &&
                              (!o || (a[1] > o[0] && a[1] < o[3]))
                            ) {
                              s.label = a[1];
                              break;
                            }
                            if (6 === a[0] && s.label < o[1]) {
                              (s.label = o[1]), (o = a);
                              break;
                            }
                            if (o && s.label < o[2]) {
                              (s.label = o[2]), s.ops.push(a);
                              break;
                            }
                            o[2] && s.ops.pop(), s.trys.pop();
                            continue;
                        }
                        a = t.call(e, s);
                      } catch (e) {
                        (a = [6, e]), (r = 0);
                      } finally {
                        n = o = 0;
                      }
                    if (5 & a[0]) throw a[1];
                    return { value: a[0] ? a[1] : void 0, done: !0 };
                  })([a, c]);
                };
              }
            };
        Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.setMediaElementSinkId =
            t.toggleMuteMediaElement =
            t.unmuteMediaElement =
            t.muteMediaElement =
            t.stopStream =
            t.sdpToJsonHack =
            t.detachMediaStream =
            t.attachMediaStream =
            t.streamIsValid =
            t.getSupportedConstraints =
            t.enumerateDevices =
            t.getDisplayMedia =
            t.getUserMedia =
            t.RTCPeerConnection =
            t.WebRTCOverridesManager =
              void 0);
        var c = n(858),
          u = i(n(333)),
          l = (function () {
            function e() {}
            return (
              (e.getInstance = function () {
                return (
                  this._instance || (this._instance = new e()), this._instance
                );
              }),
              Object.defineProperty(e.prototype, 'RTCPeerConnection', {
                get: function () {
                  var e = this;
                  return function (t) {
                    var n,
                      r = (
                        null !== (n = e._RTCPeerConnection) && void 0 !== n
                          ? n
                          : u.RTCPeerConnection
                      )(t);
                    return (0, c.adaptToAsyncAPI)(r, ['addTrack', 'getSender']);
                  };
                },
                set: function (e) {
                  this._RTCPeerConnection = e;
                },
                enumerable: !1,
                configurable: !0,
              }),
              Object.defineProperty(e.prototype, 'getUserMedia', {
                get: function () {
                  var e;
                  return null !== (e = this._getUserMedia) && void 0 !== e
                    ? e
                    : u.getUserMedia;
                },
                set: function (e) {
                  this._getUserMedia = e;
                },
                enumerable: !1,
                configurable: !0,
              }),
              Object.defineProperty(e.prototype, 'getDisplayMedia', {
                get: function () {
                  var e;
                  return null !== (e = this._getDisplayMedia) && void 0 !== e
                    ? e
                    : u.getDisplayMedia;
                },
                set: function (e) {
                  this._getDisplayMedia = e;
                },
                enumerable: !1,
                configurable: !0,
              }),
              Object.defineProperty(e.prototype, 'enumerateDevices', {
                get: function () {
                  var e;
                  return null !== (e = this._enumerateDevices) && void 0 !== e
                    ? e
                    : u.enumerateDevices;
                },
                set: function (e) {
                  this._enumerateDevices = e;
                },
                enumerable: !1,
                configurable: !0,
              }),
              Object.defineProperty(e.prototype, 'getSupportedConstraints', {
                get: function () {
                  var e;
                  return null !== (e = this._getSupportedConstraints) &&
                    void 0 !== e
                    ? e
                    : u.getSupportedConstraints;
                },
                set: function (e) {
                  this._getSupportedConstraints = e;
                },
                enumerable: !1,
                configurable: !0,
              }),
              Object.defineProperty(e.prototype, 'attachMediaStream', {
                get: function () {
                  var e;
                  return null !== (e = this._attachMediaStream) && void 0 !== e
                    ? e
                    : u.attachMediaStream;
                },
                set: function (e) {
                  this._attachMediaStream = e;
                },
                enumerable: !1,
                configurable: !0,
              }),
              Object.defineProperty(e.prototype, 'streamIsValid', {
                get: function () {
                  var e;
                  return null !== (e = this._streamIsValid) && void 0 !== e
                    ? e
                    : u.streamIsValid;
                },
                set: function (e) {
                  this._streamIsValid = e;
                },
                enumerable: !1,
                configurable: !0,
              }),
              e
            );
          })();
        (t.WebRTCOverridesManager = l),
          (t.RTCPeerConnection = function (e) {
            return l.getInstance().RTCPeerConnection(e);
          }),
          (t.getUserMedia = function (e) {
            return l.getInstance().getUserMedia(e);
          }),
          (t.getDisplayMedia = function (e) {
            return l.getInstance().getDisplayMedia(e);
          }),
          (t.enumerateDevices = function () {
            return l.getInstance().enumerateDevices();
          }),
          (t.getSupportedConstraints = function () {
            return l.getInstance().getSupportedConstraints();
          }),
          (t.streamIsValid = function (e) {
            return l.getInstance().streamIsValid(e);
          }),
          (t.attachMediaStream = function (e, t) {
            return l.getInstance().attachMediaStream(e, t);
          }),
          (t.detachMediaStream = function (e) {
            return u.detachMediaStream(e);
          }),
          (t.muteMediaElement = function (e) {
            return u.muteMediaElement(e);
          }),
          (t.unmuteMediaElement = function (e) {
            return u.unmuteMediaElement(e);
          }),
          (t.toggleMuteMediaElement = function (e) {
            return u.toggleMuteMediaElement(e);
          }),
          (t.setMediaElementSinkId = function (e, t) {
            return s(void 0, void 0, void 0, function () {
              return a(this, function (n) {
                return [2, u.setMediaElementSinkId(e, t)];
              });
            });
          }),
          (t.sdpToJsonHack = function (e) {
            return u.sdpToJsonHack(e);
          }),
          (t.stopStream = function (e) {
            return u.stopStream(e);
          });
      },
      291: (e, t) => {
        'use strict';
        var n, r, o, i, s, a, c, u;
        Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.DeviceType =
            t.ConferenceAction =
            t.Role =
            t.State =
            t.DEFAULT_CALL_OPTIONS =
            t.NOTIFICATION_TYPE =
            t.VertoMethod =
            t.Direction =
            t.PeerType =
              void 0),
          (function (e) {
            (e.Offer = 'offer'), (e.Answer = 'answer');
          })(r || (t.PeerType = r = {})),
          (function (e) {
            (e.Inbound = 'inbound'), (e.Outbound = 'outbound');
          })(o || (t.Direction = o = {})),
          (function (e) {
            (e.Invite = 'verto.invite'),
              (e.Attach = 'verto.attach'),
              (e.Answer = 'verto.answer'),
              (e.Info = 'verto.info'),
              (e.Display = 'verto.display'),
              (e.Media = 'verto.media'),
              (e.Event = 'verto.event'),
              (e.Bye = 'verto.bye'),
              (e.Punt = 'verto.punt'),
              (e.Broadcast = 'verto.broadcast'),
              (e.Subscribe = 'verto.subscribe'),
              (e.Unsubscribe = 'verto.unsubscribe'),
              (e.ClientReady = 'verto.clientReady'),
              (e.Modify = 'verto.modify'),
              (e.MediaParams = 'verto.mediaParams');
          })(i || (t.VertoMethod = i = {})),
          (t.NOTIFICATION_TYPE =
            (((n = { generic: 'event' })[i.Display] = 'participantData'),
            (n[i.Attach] = 'participantData'),
            (n.conferenceUpdate = 'conferenceUpdate'),
            (n.callUpdate = 'callUpdate'),
            (n.vertoClientReady = 'vertoClientReady'),
            (n.userMediaError = 'userMediaError'),
            (n.refreshToken = 'refreshToken'),
            n)),
          (t.DEFAULT_CALL_OPTIONS = {
            destinationNumber: '',
            remoteCallerName: 'Outbound Call',
            remoteCallerNumber: '',
            callerName: '',
            callerNumber: '',
            audio: !0,
            video: !1,
            useStereo: !1,
            attach: !1,
            screenShare: !1,
            userVariables: {},
          }),
          (function (e) {
            (e[(e.New = 0)] = 'New'),
              (e[(e.Requesting = 1)] = 'Requesting'),
              (e[(e.Trying = 2)] = 'Trying'),
              (e[(e.Recovering = 3)] = 'Recovering'),
              (e[(e.Ringing = 4)] = 'Ringing'),
              (e[(e.Answering = 5)] = 'Answering'),
              (e[(e.Early = 6)] = 'Early'),
              (e[(e.Active = 7)] = 'Active'),
              (e[(e.Held = 8)] = 'Held'),
              (e[(e.Hangup = 9)] = 'Hangup'),
              (e[(e.Destroy = 10)] = 'Destroy'),
              (e[(e.Purge = 11)] = 'Purge');
          })(s || (t.State = s = {})),
          (function (e) {
            (e.Participant = 'participant'), (e.Moderator = 'moderator');
          })(a || (t.Role = a = {})),
          (function (e) {
            (e.Join = 'join'),
              (e.Leave = 'leave'),
              (e.Bootstrap = 'bootstrap'),
              (e.Add = 'add'),
              (e.Modify = 'modify'),
              (e.Delete = 'delete'),
              (e.Clear = 'clear'),
              (e.ChatMessage = 'chatMessage'),
              (e.LayerInfo = 'layerInfo'),
              (e.LogoInfo = 'logoInfo'),
              (e.LayoutInfo = 'layoutInfo'),
              (e.LayoutList = 'layoutList'),
              (e.ModCmdResponse = 'modCommandResponse');
          })(c || (t.ConferenceAction = c = {})),
          (function (e) {
            (e.Video = 'videoinput'),
              (e.AudioIn = 'audioinput'),
              (e.AudioOut = 'audiooutput');
          })(u || (t.DeviceType = u = {}));
      },
      203: function (e, t, n) {
        'use strict';
        var r =
            (this && this.__assign) ||
            function () {
              return (
                (r =
                  Object.assign ||
                  function (e) {
                    for (var t, n = 1, r = arguments.length; n < r; n++)
                      for (var o in (t = arguments[n]))
                        Object.prototype.hasOwnProperty.call(t, o) &&
                          (e[o] = t[o]);
                    return e;
                  }),
                r.apply(this, arguments)
              );
            },
          o =
            (this && this.__createBinding) ||
            (Object.create
              ? function (e, t, n, r) {
                  void 0 === r && (r = n);
                  var o = Object.getOwnPropertyDescriptor(t, n);
                  (o &&
                    !('get' in o
                      ? !t.__esModule
                      : o.writable || o.configurable)) ||
                    (o = {
                      enumerable: !0,
                      get: function () {
                        return t[n];
                      },
                    }),
                    Object.defineProperty(e, r, o);
                }
              : function (e, t, n, r) {
                  void 0 === r && (r = n), (e[r] = t[n]);
                }),
          i =
            (this && this.__setModuleDefault) ||
            (Object.create
              ? function (e, t) {
                  Object.defineProperty(e, 'default', {
                    enumerable: !0,
                    value: t,
                  });
                }
              : function (e, t) {
                  e.default = t;
                }),
          s =
            (this && this.__importStar) ||
            function (e) {
              if (e && e.__esModule) return e;
              var t = {};
              if (null != e)
                for (var n in e)
                  'default' !== n &&
                    Object.prototype.hasOwnProperty.call(e, n) &&
                    o(t, e, n);
              return i(t, e), t;
            },
          a =
            (this && this.__awaiter) ||
            function (e, t, n, r) {
              return new (n || (n = Promise))(function (o, i) {
                function s(e) {
                  try {
                    c(r.next(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function a(e) {
                  try {
                    c(r.throw(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function c(e) {
                  var t;
                  e.done
                    ? o(e.value)
                    : ((t = e.value),
                      t instanceof n
                        ? t
                        : new n(function (e) {
                            e(t);
                          })).then(s, a);
                }
                c((r = r.apply(e, t || [])).next());
              });
            },
          c =
            (this && this.__generator) ||
            function (e, t) {
              var n,
                r,
                o,
                i,
                s = {
                  label: 0,
                  sent: function () {
                    if (1 & o[0]) throw o[1];
                    return o[1];
                  },
                  trys: [],
                  ops: [],
                };
              return (
                (i = { next: a(0), throw: a(1), return: a(2) }),
                'function' == typeof Symbol &&
                  (i[Symbol.iterator] = function () {
                    return this;
                  }),
                i
              );
              function a(a) {
                return function (c) {
                  return (function (a) {
                    if (n)
                      throw new TypeError('Generator is already executing.');
                    for (; i && ((i = 0), a[0] && (s = 0)), s; )
                      try {
                        if (
                          ((n = 1),
                          r &&
                            (o =
                              2 & a[0]
                                ? r.return
                                : a[0]
                                ? r.throw || ((o = r.return) && o.call(r), 0)
                                : r.next) &&
                            !(o = o.call(r, a[1])).done)
                        )
                          return o;
                        switch (
                          ((r = 0), o && (a = [2 & a[0], o.value]), a[0])
                        ) {
                          case 0:
                          case 1:
                            o = a;
                            break;
                          case 4:
                            return s.label++, { value: a[1], done: !1 };
                          case 5:
                            s.label++, (r = a[1]), (a = [0]);
                            continue;
                          case 7:
                            (a = s.ops.pop()), s.trys.pop();
                            continue;
                          default:
                            if (
                              !(
                                (o =
                                  (o = s.trys).length > 0 && o[o.length - 1]) ||
                                (6 !== a[0] && 2 !== a[0])
                              )
                            ) {
                              s = 0;
                              continue;
                            }
                            if (
                              3 === a[0] &&
                              (!o || (a[1] > o[0] && a[1] < o[3]))
                            ) {
                              s.label = a[1];
                              break;
                            }
                            if (6 === a[0] && s.label < o[1]) {
                              (s.label = o[1]), (o = a);
                              break;
                            }
                            if (o && s.label < o[2]) {
                              (s.label = o[2]), s.ops.push(a);
                              break;
                            }
                            o[2] && s.ops.pop(), s.trys.pop();
                            continue;
                        }
                        a = t.call(e, s);
                      } catch (e) {
                        (a = [6, e]), (r = 0);
                      } finally {
                        n = o = 0;
                      }
                    if (5 & a[0]) throw a[1];
                    return { value: a[0] ? a[1] : void 0, done: !0 };
                  })([a, c]);
                };
              }
            },
          u =
            (this && this.__read) ||
            function (e, t) {
              var n = 'function' == typeof Symbol && e[Symbol.iterator];
              if (!n) return e;
              var r,
                o,
                i = n.call(e),
                s = [];
              try {
                for (; (void 0 === t || t-- > 0) && !(r = i.next()).done; )
                  s.push(r.value);
              } catch (e) {
                o = { error: e };
              } finally {
                try {
                  r && !r.done && (n = i.return) && n.call(i);
                } finally {
                  if (o) throw o.error;
                }
              }
              return s;
            },
          l =
            (this && this.__spreadArray) ||
            function (e, t, n) {
              if (n || 2 === arguments.length)
                for (var r, o = 0, i = t.length; o < i; o++)
                  (!r && o in t) ||
                    (r || (r = Array.prototype.slice.call(t, 0, o)),
                    (r[o] = t[o]));
              return e.concat(r || Array.prototype.slice.call(t));
            },
          d =
            (this && this.__importDefault) ||
            function (e) {
              return e && e.__esModule ? e : { default: e };
            };
        Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.sdpHasVideo =
            t.sdpHasAudio =
            t.filterIceServers =
            t.toggleVideoTracks =
            t.disableVideoTracks =
            t.enableVideoTracks =
            t.toggleAudioTracks =
            t.disableAudioTracks =
            t.enableAudioTracks =
            t.destructSubscribeResponse =
            t.checkSubscribeResponse =
            t.sdpBitrateHack =
            t.sdpMediaOrderHack =
            t.sdpStereoHack =
            t.checkDeviceIdConstraints =
            t.removeUnsupportedConstraints =
            t.assureDeviceId =
            t.getMediaConstraints =
            t.scanResolutions =
            t.getDevices =
            t.getUserMedia =
              void 0);
        var f = d(n(955)),
          p = s(n(317)),
          h = n(858),
          v = n(291),
          y = function (e) {
            return a(void 0, void 0, void 0, function () {
              var t, n, r;
              return c(this, function (o) {
                switch (o.label) {
                  case 0:
                    if (
                      (f.default.info('RTCService.getUserMedia', e),
                      (t = e.audio),
                      (n = e.video),
                      !t && !n)
                    )
                      return [2, null];
                    o.label = 1;
                  case 1:
                    return o.trys.push([1, 3, , 4]), [4, p.getUserMedia(e)];
                  case 2:
                    return [2, o.sent()];
                  case 3:
                    throw (
                      ((r = o.sent()),
                      f.default.error('getUserMedia error: ', r),
                      r)
                    );
                  case 4:
                    return [2];
                }
              });
            });
          };
        t.getUserMedia = y;
        var b = function (e) {
            return (
              void 0 === e && (e = null),
              {
                audio: !e || e === v.DeviceType.AudioIn,
                video: !e || e === v.DeviceType.Video,
              }
            );
          },
          g = function e(t, n) {
            return (
              void 0 === t && (t = null),
              void 0 === n && (n = !1),
              a(void 0, void 0, void 0, function () {
                var r, o, i;
                return c(this, function (s) {
                  switch (s.label) {
                    case 0:
                      return [
                        4,
                        p.enumerateDevices().catch(function (e) {
                          return [];
                        }),
                      ];
                    case 1:
                      return (
                        (r = s.sent()),
                        t &&
                          (r = r.filter(function (e) {
                            return e.kind === t;
                          })),
                        r.length &&
                        r.every(function (e) {
                          return e.deviceId && e.label;
                        })
                          ? [3, 3]
                          : [4, p.getUserMedia(b(t))]
                      );
                    case 2:
                      return (o = s.sent()), p.stopStream(o), [2, e(t)];
                    case 3:
                      return (
                        !0 === n ||
                          ((i = []),
                          (r = r.filter(function (e) {
                            var t = e.kind,
                              n = e.groupId;
                            if (!n) return !0;
                            var r = ''.concat(t, '-').concat(n);
                            return !i.includes(r) && (i.push(r), !0);
                          }))),
                        [2, r]
                      );
                  }
                });
              })
            );
          };
        t.getDevices = g;
        var _ = [
          [320, 240],
          [640, 360],
          [640, 480],
          [1280, 720],
          [1920, 1080],
        ];
        (t.scanResolutions = function (e) {
          return a(void 0, void 0, void 0, function () {
            var t, n, r, o, i, s, a;
            return c(this, function (c) {
              switch (c.label) {
                case 0:
                  return (
                    (t = []), [4, y({ video: { deviceId: { exact: e } } })]
                  );
                case 1:
                  (n = c.sent()),
                    (r = n.getVideoTracks()[0]),
                    (o = 0),
                    (c.label = 2);
                case 2:
                  return o < _.length
                    ? ((i = u(_[o], 2)),
                      (s = i[0]),
                      (a = i[1]),
                      [
                        4,
                        r
                          .applyConstraints({
                            width: { exact: s },
                            height: { exact: a },
                          })
                          .then(function () {
                            return !0;
                          })
                          .catch(function () {
                            return !1;
                          }),
                      ])
                    : [3, 5];
                case 3:
                  c.sent() &&
                    t.push({
                      resolution: ''.concat(s, 'x').concat(a),
                      width: s,
                      height: a,
                    }),
                    (c.label = 4);
                case 4:
                  return o++, [3, 2];
                case 5:
                  return p.stopStream(n), [2, t];
              }
            });
          });
        }),
          (t.getMediaConstraints = function (e) {
            return a(void 0, void 0, void 0, function () {
              var t, n, r, o, i, s, a, u, l, d;
              return c(this, function (c) {
                switch (c.label) {
                  case 0:
                    return (
                      (t = e.audio),
                      (n = void 0 === t || t),
                      (r = e.micId),
                      (o = e.micLabel),
                      (i = void 0 === o ? '' : o),
                      r
                        ? [
                            4,
                            m(r, i, v.DeviceType.AudioIn).catch(function (e) {
                              return null;
                            }),
                          ]
                        : [3, 2]
                    );
                  case 1:
                    (r = c.sent()) &&
                      ('boolean' == typeof n && (n = {}),
                      (n.deviceId = { exact: r })),
                      (c.label = 2);
                  case 2:
                    return (
                      (s = e.video),
                      (a = void 0 !== s && s),
                      (u = e.camId),
                      (l = e.camLabel),
                      (d = void 0 === l ? '' : l),
                      u
                        ? [
                            4,
                            m(u, d, v.DeviceType.Video).catch(function (e) {
                              return null;
                            }),
                          ]
                        : [3, 4]
                    );
                  case 3:
                    (u = c.sent()) &&
                      ('boolean' == typeof a && (a = {}),
                      (a.deviceId = { exact: u })),
                      (c.label = 4);
                  case 4:
                    return [2, { audio: n, video: a }];
                }
              });
            });
          });
        var m = function (e, t, n) {
          return a(void 0, void 0, void 0, function () {
            var r, o, i, s, a;
            return c(this, function (c) {
              switch (c.label) {
                case 0:
                  return [4, g(n, !0)];
                case 1:
                  for (r = c.sent(), o = 0; o < r.length; o++)
                    if (
                      ((i = r[o]),
                      (s = i.deviceId),
                      (a = i.label),
                      e === s || t === a)
                    )
                      return [2, s];
                  return [2, null];
              }
            });
          });
        };
        (t.assureDeviceId = m),
          (t.removeUnsupportedConstraints = function (e) {
            var t = p.getSupportedConstraints();
            Object.keys(e).map(function (n) {
              (t.hasOwnProperty(n) && null !== e[n] && void 0 !== e[n]) ||
                delete e[n];
            });
          }),
          (t.checkDeviceIdConstraints = function (e, t, n, r) {
            return a(void 0, void 0, void 0, function () {
              var o, i;
              return c(this, function (s) {
                switch (s.label) {
                  case 0:
                    return (
                      (o = r.deviceId),
                      (0, h.isDefined)(o) || (!e && !t)
                        ? [3, 2]
                        : [
                            4,
                            m(e, t, n).catch(function (e) {
                              return null;
                            }),
                          ]
                    );
                  case 1:
                    (i = s.sent()) && (r.deviceId = { exact: i }),
                      (s.label = 2);
                  case 2:
                    return [2, r];
                }
              });
            });
          }),
          (t.sdpStereoHack = function (e) {
            var t = '\r\n',
              n = e.split(t),
              r = n.findIndex(function (e) {
                return /^a=rtpmap/.test(e) && /opus\/48000/.test(e);
              });
            if (r < 0) return e;
            var o = (function (e) {
                var t = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+'),
                  n = e.match(t);
                return n && 2 == n.length ? n[1] : null;
              })(n[r]),
              i = new RegExp('a=fmtp:'.concat(o)),
              s = n.findIndex(function (e) {
                return i.test(e);
              });
            return (
              s >= 0
                ? /stereo=1;/.test(n[s]) ||
                  (n[s] += '; stereo=1; sprop-stereo=1')
                : (n[r] += ''
                    .concat(t, 'a=fmtp:')
                    .concat(o, ' stereo=1; sprop-stereo=1')),
              n.join(t)
            );
          });
        var w = function (e) {
            return /^m=audio/.test(e);
          },
          S = function (e) {
            return /^m=video/.test(e);
          };
        (t.sdpMediaOrderHack = function (e, t) {
          var n = '\r\n',
            r = t.split(n);
          if (r.findIndex(w) < r.findIndex(S)) return e;
          var o = e.split(n),
            i = o.findIndex(w),
            s = o.findIndex(S),
            a = o.slice(i, s),
            c = o.slice(s, o.length - 1),
            d = o.slice(0, i);
          return l(l(l(l([], u(d), !1), u(c), !1), u(a), !1), [''], !1).join(n);
        }),
          (t.checkSubscribeResponse = function (e, t) {
            if (!e) return !1;
            var n = O(e),
              r = n.subscribed,
              o = n.alreadySubscribed;
            return r.includes(t) || o.includes(t);
          });
        var O = function (e) {
          var t = {
            subscribed: [],
            alreadySubscribed: [],
            unauthorized: [],
            unsubscribed: [],
            notSubscribed: [],
          };
          return (
            Object.keys(t).forEach(function (n) {
              t[n] = e[''.concat(n, 'Channels')] || [];
            }),
            t
          );
        };
        (t.destructSubscribeResponse = O),
          (t.enableAudioTracks = function (e) {
            I(e, 'audio', !0);
          }),
          (t.disableAudioTracks = function (e) {
            I(e, 'audio', !1);
          }),
          (t.toggleAudioTracks = function (e) {
            I(e, 'audio', null);
          }),
          (t.enableVideoTracks = function (e) {
            I(e, 'video', !0);
          }),
          (t.disableVideoTracks = function (e) {
            I(e, 'video', !1);
          }),
          (t.toggleVideoTracks = function (e) {
            I(e, 'video', null);
          });
        var I = function (e, t, n) {
          if (
            (void 0 === t && (t = null),
            void 0 === n && (n = null),
            !p.streamIsValid(e))
          )
            return null;
          var r = [];
          switch (t) {
            case 'audio':
              r = e.getAudioTracks();
              break;
            case 'video':
              r = e.getVideoTracks();
              break;
            default:
              r = e.getTracks();
          }
          r.forEach(function (e) {
            switch (n) {
              case 'on':
              case !0:
                e.enabled = !0;
                break;
              case 'off':
              case !1:
                e.enabled = !1;
                break;
              default:
                e.enabled = !e.enabled;
            }
          });
        };
        (t.sdpBitrateHack = function (e, t, n, r) {
          var o = e.split('\r\n');
          return (
            o.forEach(function (e, i) {
              /^a=fmtp:\d*/.test(e)
                ? (o[i] += ';x-google-max-bitrate='
                    .concat(t, ';x-google-min-bitrate=')
                    .concat(n, ';x-google-start-bitrate=')
                    .concat(r))
                : /^a=mid:(1|video)/.test(e) && (o[i] += '\r\nb=AS:'.concat(t));
            }),
            o.join('\r\n')
          );
        }),
          (t.filterIceServers = function (e, t) {
            void 0 === t && (t = { disableUdpIceServers: !1 });
            var n = t.disableUdpIceServers,
              o = void 0 !== n && n;
            return e.map(function (e) {
              return r(r({}, e), {
                urls: o
                  ? ((t = e.urls),
                    (n = 'transport=tcp'),
                    t instanceof Array
                      ? t.filter(function (e) {
                          return e.includes(n);
                        })
                      : t.includes(n)
                      ? t
                      : '')
                  : e.urls,
              });
            });
          }),
          (t.sdpHasAudio = function (e) {
            return void 0 === e && (e = ''), /m=audio/.test(e);
          }),
          (t.sdpHasVideo = function (e) {
            return void 0 === e && (e = ''), /m=video/.test(e);
          });
      },
      605: function (e, t, n) {
        'use strict';
        var r =
            (this && this.__createBinding) ||
            (Object.create
              ? function (e, t, n, r) {
                  void 0 === r && (r = n);
                  var o = Object.getOwnPropertyDescriptor(t, n);
                  (o &&
                    !('get' in o
                      ? !t.__esModule
                      : o.writable || o.configurable)) ||
                    (o = {
                      enumerable: !0,
                      get: function () {
                        return t[n];
                      },
                    }),
                    Object.defineProperty(e, r, o);
                }
              : function (e, t, n, r) {
                  void 0 === r && (r = n), (e[r] = t[n]);
                }),
          o =
            (this && this.__exportStar) ||
            function (e, t) {
              for (var n in e)
                'default' === n ||
                  Object.prototype.hasOwnProperty.call(t, n) ||
                  r(t, e, n);
            },
          i =
            (this && this.__importDefault) ||
            function (e) {
              return e && e.__esModule ? e : { default: e };
            };
        Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.CantinaAuth = t.Verto = t.Relay = t.VERSION = void 0);
        var s = i(n(807));
        t.Relay = s.default;
        var a = i(n(860));
        t.Verto = a.default;
        var c = n(68),
          u = i(n(788));
        (t.CantinaAuth = u.default),
          (t.VERSION = '1.4.2-rc.1'),
          (0, c.setAgentName)('JavaScript SDK/'.concat(t.VERSION)),
          o(n(587), t);
      },
      807: function (e, t, n) {
        'use strict';
        var r,
          o =
            (this && this.__extends) ||
            ((r = function (e, t) {
              return (
                (r =
                  Object.setPrototypeOf ||
                  ({ __proto__: [] } instanceof Array &&
                    function (e, t) {
                      e.__proto__ = t;
                    }) ||
                  function (e, t) {
                    for (var n in t)
                      Object.prototype.hasOwnProperty.call(t, n) &&
                        (e[n] = t[n]);
                  }),
                r(e, t)
              );
            }),
            function (e, t) {
              if ('function' != typeof t && null !== t)
                throw new TypeError(
                  'Class extends value ' +
                    String(t) +
                    ' is not a constructor or null'
                );
              function n() {
                this.constructor = e;
              }
              r(e, t),
                (e.prototype =
                  null === t
                    ? Object.create(t)
                    : ((n.prototype = t.prototype), new n()));
            }),
          i =
            (this && this.__awaiter) ||
            function (e, t, n, r) {
              return new (n || (n = Promise))(function (o, i) {
                function s(e) {
                  try {
                    c(r.next(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function a(e) {
                  try {
                    c(r.throw(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function c(e) {
                  var t;
                  e.done
                    ? o(e.value)
                    : ((t = e.value),
                      t instanceof n
                        ? t
                        : new n(function (e) {
                            e(t);
                          })).then(s, a);
                }
                c((r = r.apply(e, t || [])).next());
              });
            },
          s =
            (this && this.__generator) ||
            function (e, t) {
              var n,
                r,
                o,
                i,
                s = {
                  label: 0,
                  sent: function () {
                    if (1 & o[0]) throw o[1];
                    return o[1];
                  },
                  trys: [],
                  ops: [],
                };
              return (
                (i = { next: a(0), throw: a(1), return: a(2) }),
                'function' == typeof Symbol &&
                  (i[Symbol.iterator] = function () {
                    return this;
                  }),
                i
              );
              function a(a) {
                return function (c) {
                  return (function (a) {
                    if (n)
                      throw new TypeError('Generator is already executing.');
                    for (; i && ((i = 0), a[0] && (s = 0)), s; )
                      try {
                        if (
                          ((n = 1),
                          r &&
                            (o =
                              2 & a[0]
                                ? r.return
                                : a[0]
                                ? r.throw || ((o = r.return) && o.call(r), 0)
                                : r.next) &&
                            !(o = o.call(r, a[1])).done)
                        )
                          return o;
                        switch (
                          ((r = 0), o && (a = [2 & a[0], o.value]), a[0])
                        ) {
                          case 0:
                          case 1:
                            o = a;
                            break;
                          case 4:
                            return s.label++, { value: a[1], done: !1 };
                          case 5:
                            s.label++, (r = a[1]), (a = [0]);
                            continue;
                          case 7:
                            (a = s.ops.pop()), s.trys.pop();
                            continue;
                          default:
                            if (
                              !(
                                (o =
                                  (o = s.trys).length > 0 && o[o.length - 1]) ||
                                (6 !== a[0] && 2 !== a[0])
                              )
                            ) {
                              s = 0;
                              continue;
                            }
                            if (
                              3 === a[0] &&
                              (!o || (a[1] > o[0] && a[1] < o[3]))
                            ) {
                              s.label = a[1];
                              break;
                            }
                            if (6 === a[0] && s.label < o[1]) {
                              (s.label = o[1]), (o = a);
                              break;
                            }
                            if (o && s.label < o[2]) {
                              (s.label = o[2]), s.ops.push(a);
                              break;
                            }
                            o[2] && s.ops.pop(), s.trys.pop();
                            continue;
                        }
                        a = t.call(e, s);
                      } catch (e) {
                        (a = [6, e]), (r = 0);
                      } finally {
                        n = o = 0;
                      }
                    if (5 & a[0]) throw a[1];
                    return { value: a[0] ? a[1] : void 0, done: !0 };
                  })([a, c]);
                };
              }
            },
          a =
            (this && this.__importDefault) ||
            function (e) {
              return e && e.__esModule ? e : { default: e };
            };
        Object.defineProperty(t, '__esModule', { value: !0 });
        var c = a(n(740)),
          u = n(629),
          l = a(n(10)),
          d = a(n(960)),
          f = (function (e) {
            function t() {
              return (null !== e && e.apply(this, arguments)) || this;
            }
            return (
              o(t, e),
              (t.prototype.execute = function (t) {
                var n = t;
                if (t instanceof l.default) {
                  var r = { message: t.request };
                  t.targetNodeId && (r.node_id = t.targetNodeId),
                    (n = new u.Execute({
                      protocol: this.relayProtocol,
                      method: 'message',
                      params: r,
                    }));
                }
                return e.prototype.execute.call(this, n);
              }),
              (t.prototype.newCall = function (e) {
                return i(this, void 0, void 0, function () {
                  var t, n;
                  return s(this, function (r) {
                    if (void 0 === (t = e.destinationNumber) || !t)
                      throw new TypeError('destinationNumber is required');
                    return (n = new d.default(this, e)).invite(), [2, n];
                  });
                });
              }),
              t
            );
          })(c.default);
        t.default = f;
      },
      860: function (e, t, n) {
        'use strict';
        var r,
          o =
            (this && this.__extends) ||
            ((r = function (e, t) {
              return (
                (r =
                  Object.setPrototypeOf ||
                  ({ __proto__: [] } instanceof Array &&
                    function (e, t) {
                      e.__proto__ = t;
                    }) ||
                  function (e, t) {
                    for (var n in t)
                      Object.prototype.hasOwnProperty.call(t, n) &&
                        (e[n] = t[n]);
                  }),
                r(e, t)
              );
            }),
            function (e, t) {
              if ('function' != typeof t && null !== t)
                throw new TypeError(
                  'Class extends value ' +
                    String(t) +
                    ' is not a constructor or null'
                );
              function n() {
                this.constructor = e;
              }
              r(e, t),
                (e.prototype =
                  null === t
                    ? Object.create(t)
                    : ((n.prototype = t.prototype), new n()));
            }),
          i =
            (this && this.__awaiter) ||
            function (e, t, n, r) {
              return new (n || (n = Promise))(function (o, i) {
                function s(e) {
                  try {
                    c(r.next(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function a(e) {
                  try {
                    c(r.throw(e));
                  } catch (e) {
                    i(e);
                  }
                }
                function c(e) {
                  var t;
                  e.done
                    ? o(e.value)
                    : ((t = e.value),
                      t instanceof n
                        ? t
                        : new n(function (e) {
                            e(t);
                          })).then(s, a);
                }
                c((r = r.apply(e, t || [])).next());
              });
            },
          s =
            (this && this.__generator) ||
            function (e, t) {
              var n,
                r,
                o,
                i,
                s = {
                  label: 0,
                  sent: function () {
                    if (1 & o[0]) throw o[1];
                    return o[1];
                  },
                  trys: [],
                  ops: [],
                };
              return (
                (i = { next: a(0), throw: a(1), return: a(2) }),
                'function' == typeof Symbol &&
                  (i[Symbol.iterator] = function () {
                    return this;
                  }),
                i
              );
              function a(a) {
                return function (c) {
                  return (function (a) {
                    if (n)
                      throw new TypeError('Generator is already executing.');
                    for (; i && ((i = 0), a[0] && (s = 0)), s; )
                      try {
                        if (
                          ((n = 1),
                          r &&
                            (o =
                              2 & a[0]
                                ? r.return
                                : a[0]
                                ? r.throw || ((o = r.return) && o.call(r), 0)
                                : r.next) &&
                            !(o = o.call(r, a[1])).done)
                        )
                          return o;
                        switch (
                          ((r = 0), o && (a = [2 & a[0], o.value]), a[0])
                        ) {
                          case 0:
                          case 1:
                            o = a;
                            break;
                          case 4:
                            return s.label++, { value: a[1], done: !1 };
                          case 5:
                            s.label++, (r = a[1]), (a = [0]);
                            continue;
                          case 7:
                            (a = s.ops.pop()), s.trys.pop();
                            continue;
                          default:
                            if (
                              !(
                                (o =
                                  (o = s.trys).length > 0 && o[o.length - 1]) ||
                                (6 !== a[0] && 2 !== a[0])
                              )
                            ) {
                              s = 0;
                              continue;
                            }
                            if (
                              3 === a[0] &&
                              (!o || (a[1] > o[0] && a[1] < o[3]))
                            ) {
                              s.label = a[1];
                              break;
                            }
                            if (6 === a[0] && s.label < o[1]) {
                              (s.label = o[1]), (o = a);
                              break;
                            }
                            if (o && s.label < o[2]) {
                              (s.label = o[2]), s.ops.push(a);
                              break;
                            }
                            o[2] && s.ops.pop(), s.trys.pop();
                            continue;
                        }
                        a = t.call(e, s);
                      } catch (e) {
                        (a = [6, e]), (r = 0);
                      } finally {
                        n = o = 0;
                      }
                    if (5 & a[0]) throw a[1];
                    return { value: a[0] ? a[1] : void 0, done: !0 };
                  })([a, c]);
                };
              }
            },
          a =
            (this && this.__importDefault) ||
            function (e) {
              return e && e.__esModule ? e : { default: e };
            };
        Object.defineProperty(t, '__esModule', { value: !0 }),
          (t.VERTO_PROTOCOL = void 0);
        var c = a(n(740)),
          u = n(503),
          l = a(n(960)),
          d = n(789),
          f = n(403),
          p = n(537),
          h = a(n(232));
        t.VERTO_PROTOCOL = 'verto-protocol';
        var v = (function (e) {
          function n() {
            var n = (null !== e && e.apply(this, arguments)) || this;
            return (
              (n.relayProtocol = t.VERTO_PROTOCOL),
              (n.timeoutErrorCode = -329990),
              n
            );
          }
          return (
            o(n, e),
            (n.prototype.validateOptions = function () {
              var e = this.options,
                t = e.host,
                n = e.login,
                r = e.passwd,
                o = e.password;
              return Boolean(t) && Boolean(n && (r || o));
            }),
            (n.prototype.newCall = function (e) {
              var t = e.destinationNumber;
              if (void 0 === t || !t)
                throw new Error(
                  'Verto.newCall() error: destinationNumber is required.'
                );
              var n = new l.default(this, e);
              return n.invite(), n;
            }),
            (n.prototype.broadcast = function (e) {
              return this.vertoBroadcast(e);
            }),
            (n.prototype.subscribe = function (e) {
              return this.vertoSubscribe(e);
            }),
            (n.prototype.unsubscribe = function (e) {
              return this.vertoUnsubscribe(e);
            }),
            (n.prototype._onSocketOpen = function () {
              return i(this, void 0, void 0, function () {
                var e, t, n, r, o, i, a, c;
                return s(this, function (s) {
                  switch (s.label) {
                    case 0:
                      return (
                        (this._idle = !1),
                        (e = this.options),
                        (t = e.login),
                        (n = e.password),
                        (r = e.passwd),
                        (o = e.userVariables),
                        this.sessionid
                          ? ((i = new u.Login(
                              void 0,
                              void 0,
                              this.sessionid,
                              void 0
                            )),
                            [4, this.execute(i).catch(console.error)])
                          : [3, 2]
                      );
                    case 1:
                      s.sent(), (s.label = 2);
                    case 2:
                      return (
                        (a = new u.Login(t, n || r, this.sessionid, o)),
                        [4, this.execute(a).catch(this._handleLoginError)]
                      );
                    case 3:
                      return (
                        (c = s.sent()) &&
                          ((this._autoReconnect = !0),
                          (this.sessionid = c.sessid),
                          p.localStorage.setItem(d.SESSION_ID, this.sessionid),
                          (0, f.trigger)(d.SwEvent.Ready, this, this.uuid)),
                        [2]
                      );
                  }
                });
              });
            }),
            (n.prototype._onSocketMessage = function (e) {
              new h.default(this).handleMessage(e);
            }),
            n
          );
        })(c.default);
        t.default = v;
      },
    },
    t = {};
  function n(r) {
    var o = t[r];
    if (void 0 !== o) return o.exports;
    var i = (t[r] = { exports: {} });
    return e[r].call(i.exports, i, i.exports, n), i.exports;
  }
  (n.d = (e, t) => {
    for (var r in t)
      n.o(t, r) &&
        !n.o(e, r) &&
        Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
  }),
    (n.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t)),
    (n.r = (e) => {
      'undefined' != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
        Object.defineProperty(e, '__esModule', { value: !0 });
    });
  var r = n(605);
  for (var o in r) this[o] = r[o];
  r.__esModule && Object.defineProperty(this, '__esModule', { value: !0 });
})();
