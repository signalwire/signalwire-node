/*!
 * Relay SDK for JavaScript v1.3.0 (https://signalwire.com)
 * Copyright 2018-2019 SignalWire
 * Licensed under MIT(https://github.com/signalwire/signalwire-node/blob/master/LICENSE)
 */
!(function (e, t) {
  for (var n in t) e[n] = t[n];
})(
  this,
  (function (e) {
    var t = {};
    function n(r) {
      if (t[r]) return t[r].exports;
      var o = (t[r] = { i: r, l: !1, exports: {} });
      return e[r].call(o.exports, o, o.exports, n), (o.l = !0), o.exports;
    }
    return (
      (n.m = e),
      (n.c = t),
      (n.d = function (e, t, r) {
        n.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: r });
      }),
      (n.r = function (e) {
        'undefined' != typeof Symbol &&
          Symbol.toStringTag &&
          Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
          Object.defineProperty(e, '__esModule', { value: !0 });
      }),
      (n.t = function (e, t) {
        if ((1 & t && (e = n(e)), 8 & t)) return e;
        if (4 & t && 'object' == typeof e && e && e.__esModule) return e;
        var r = Object.create(null);
        if (
          (n.r(r),
          Object.defineProperty(r, 'default', { enumerable: !0, value: e }),
          2 & t && 'string' != typeof e)
        )
          for (var o in e)
            n.d(
              r,
              o,
              function (t) {
                return e[t];
              }.bind(null, o)
            );
        return r;
      }),
      (n.n = function (e) {
        var t =
          e && e.__esModule
            ? function () {
                return e.default;
              }
            : function () {
                return e;
              };
        return n.d(t, 'a', t), t;
      }),
      (n.o = function (e, t) {
        return Object.prototype.hasOwnProperty.call(e, t);
      }),
      (n.p = ''),
      n((n.s = 19))
    );
  })([
    function (e, t, n) {
      'use strict';
      var r =
        (this && this.__importDefault) ||
        function (e) {
          return e && e.__esModule ? e : { default: e };
        };
      Object.defineProperty(t, '__esModule', { value: !0 });
      var o = r(n(21)),
        i = function () {
          return new Date().toISOString().replace('T', ' ').replace('Z', '');
        },
        s = o.default.getLogger('signalwire'),
        a = s.methodFactory;
      (s.methodFactory = function (e, t, n) {
        var r = a(e, t, n);
        return function () {
          for (var e = [i(), '-'], t = 0; t < arguments.length; t++)
            e.push(arguments[t]);
          r.apply(void 0, e);
        };
      }),
        s.setLevel(s.getLevel()),
        (t.default = s);
    },
    function (e, t, n) {
      'use strict';
      var r =
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
        o =
          (this && this.__importDefault) ||
          function (e) {
            return e && e.__esModule ? e : { default: e };
          };
      Object.defineProperty(t, '__esModule', { value: !0 });
      var i = o(n(0)),
        s = n(2);
      (t.deepCopy = function (e) {
        return JSON.parse(JSON.stringify(e));
      }),
        (t.objEmpty = function (e) {
          return 0 === Object.keys(e).length;
        }),
        (t.mutateStorageKey = function (e) {
          return '' + s.STORAGE_PREFIX + e;
        }),
        (t.mutateLiveArrayData = function (e) {
          var t = r(e, 6),
            n = t[0],
            o = t[1],
            s = t[2],
            a = t[3],
            c = t[4],
            u = t[5],
            l = {};
          try {
            l = JSON.parse(c.replace(/ID"/g, 'Id"'));
          } catch (e) {
            i.default.warn('Verto LA invalid media JSON string:', c);
          }
          return {
            participantId: Number(n),
            participantNumber: o,
            participantName: s,
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
          return 'object' == typeof document && 'getElementById' in document
            ? 'string' == typeof e
              ? document.getElementById(e) || null
              : 'function' == typeof e
              ? e()
              : e instanceof HTMLMediaElement
              ? e
              : null
            : null;
        });
      var a = /^(ws|wss):\/\//;
      (t.checkWebSocketHost = function (e) {
        return '' + (a.test(e) ? '' : 'wss://') + e;
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
            f = void 0 === l ? null : l,
            d = a.result,
            h = void 0 === d ? null : d;
          return u && '200' !== u
            ? { error: a }
            : h
            ? t.destructResponse(h, f)
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
                var o = e[String(t) + 'Async'] || e[t];
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
    function (e, t, n) {
      'use strict';
      Object.defineProperty(t, '__esModule', { value: !0 }),
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
        })(t.SwEvent || (t.SwEvent = {})),
        (function (e) {
          (e.Broadcast = 'blade.broadcast'),
            (e.Disconnect = 'blade.disconnect');
        })(t.BladeMethod || (t.BladeMethod = {}));
    },
    function (e, t, n) {
      'use strict';
      var r, o;
      Object.defineProperty(t, '__esModule', { value: !0 }),
        (function (e) {
          (e.Offer = 'offer'), (e.Answer = 'answer');
        })(t.PeerType || (t.PeerType = {})),
        (function (e) {
          (e.Inbound = 'inbound'), (e.Outbound = 'outbound');
        })(t.Direction || (t.Direction = {})),
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
            (e.Modify = 'verto.modify');
        })((o = t.VertoMethod || (t.VertoMethod = {}))),
        (t.NOTIFICATION_TYPE =
          (((r = { generic: 'event' })[o.Display] = 'participantData'),
          (r[o.Attach] = 'participantData'),
          (r.conferenceUpdate = 'conferenceUpdate'),
          (r.callUpdate = 'callUpdate'),
          (r.vertoClientReady = 'vertoClientReady'),
          (r.userMediaError = 'userMediaError'),
          (r.refreshToken = 'refreshToken'),
          r)),
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
        })(t.State || (t.State = {})),
        (function (e) {
          (e.Participant = 'participant'), (e.Moderator = 'moderator');
        })(t.Role || (t.Role = {})),
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
        })(t.ConferenceAction || (t.ConferenceAction = {})),
        (function (e) {
          (e.Video = 'videoinput'),
            (e.AudioIn = 'audioinput'),
            (e.AudioOut = 'audiooutput');
        })(t.DeviceType || (t.DeviceType = {}));
    },
    function (e, t, n) {
      'use strict';
      Object.defineProperty(t, '__esModule', { value: !0 });
      var r = n(1),
        o = {},
        i = function (e, t) {
          return (
            void 0 === t && (t = 'GLOBAL'),
            o.hasOwnProperty(e) && o[e].hasOwnProperty(t)
          );
        };
      t.isQueued = i;
      t.queueLength = function (e, t) {
        return void 0 === t && (t = 'GLOBAL'), i(e, t) ? o[e][t].length : 0;
      };
      var s = function (e, t, n) {
        void 0 === n && (n = 'GLOBAL'),
          o.hasOwnProperty(e) || (o[e] = {}),
          o[e].hasOwnProperty(n) || (o[e][n] = []),
          o[e][n].push(t);
      };
      t.register = s;
      t.registerOnce = function (e, t, n) {
        void 0 === n && (n = 'GLOBAL');
        var r = function (o) {
          a(e, r, n), t(o);
        };
        return (r.prototype.targetRef = t), s(e, r, n);
      };
      var a = function (e, t, n) {
        if ((void 0 === n && (n = 'GLOBAL'), !i(e, n))) return !1;
        if (r.isFunction(t))
          for (var s = o[e][n].length - 1; s >= 0; s--) {
            var a = o[e][n][s];
            (t === a || (a.prototype && t === a.prototype.targetRef)) &&
              o[e][n].splice(s, 1);
          }
        else o[e][n] = [];
        return (
          0 === o[e][n].length &&
            (delete o[e][n], r.objEmpty(o[e]) && delete o[e]),
          !0
        );
      };
      t.deRegister = a;
      var c = function (e, t, n, r) {
        void 0 === n && (n = 'GLOBAL'), void 0 === r && (r = !0);
        var s = r && 'GLOBAL' !== n;
        if (!i(e, n)) return s && c(e, t), !1;
        var a = o[e][n].length;
        if (!a) return s && c(e, t), !1;
        for (var u = a - 1; u >= 0; u--) o[e][n][u](t);
        return s && c(e, t), !0;
      };
      t.trigger = c;
      t.deRegisterAll = function (e) {
        delete o[e];
      };
    },
    function (e, t, n) {
      'use strict';
      var r =
        (this && this.__assign) ||
        function () {
          return (r =
            Object.assign ||
            function (e) {
              for (var t, n = 1, r = arguments.length; n < r; n++)
                for (var o in (t = arguments[n]))
                  Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
              return e;
            }).apply(this, arguments);
        };
      Object.defineProperty(t, '__esModule', { value: !0 });
      var o = n(13),
        i = (function () {
          function e() {}
          return (
            (e.prototype.buildRequest = function (e) {
              this.request = r({ jsonrpc: '2.0', id: o.v4() }, e);
            }),
            e
          );
        })();
      t.default = i;
    },
    function (e, t, n) {
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
            function a(i) {
              return function (a) {
                return (function (i) {
                  if (n) throw new TypeError('Generator is already executing.');
                  for (; s; )
                    try {
                      if (
                        ((n = 1),
                        r &&
                          (o =
                            2 & i[0]
                              ? r.return
                              : i[0]
                              ? r.throw || ((o = r.return) && o.call(r), 0)
                              : r.next) &&
                          !(o = o.call(r, i[1])).done)
                      )
                        return o;
                      switch (((r = 0), o && (i = [2 & i[0], o.value]), i[0])) {
                        case 0:
                        case 1:
                          o = i;
                          break;
                        case 4:
                          return s.label++, { value: i[1], done: !1 };
                        case 5:
                          s.label++, (r = i[1]), (i = [0]);
                          continue;
                        case 7:
                          (i = s.ops.pop()), s.trys.pop();
                          continue;
                        default:
                          if (
                            !((o = s.trys),
                            (o = o.length > 0 && o[o.length - 1]) ||
                              (6 !== i[0] && 2 !== i[0]))
                          ) {
                            s = 0;
                            continue;
                          }
                          if (
                            3 === i[0] &&
                            (!o || (i[1] > o[0] && i[1] < o[3]))
                          ) {
                            s.label = i[1];
                            break;
                          }
                          if (6 === i[0] && s.label < o[1]) {
                            (s.label = o[1]), (o = i);
                            break;
                          }
                          if (o && s.label < o[2]) {
                            (s.label = o[2]), s.ops.push(i);
                            break;
                          }
                          o[2] && s.ops.pop(), s.trys.pop();
                          continue;
                      }
                      i = t.call(e, s);
                    } catch (e) {
                      (i = [6, e]), (r = 0);
                    } finally {
                      n = o = 0;
                    }
                  if (5 & i[0]) throw i[1];
                  return { value: i[0] ? i[1] : void 0, done: !0 };
                })([i, a]);
              };
            }
          },
        i =
          (this && this.__importStar) ||
          function (e) {
            if (e && e.__esModule) return e;
            var t = {};
            if (null != e)
              for (var n in e)
                Object.hasOwnProperty.call(e, n) && (t[n] = e[n]);
            return (t.default = e), t;
          };
      Object.defineProperty(t, '__esModule', { value: !0 });
      var s = n(1),
        a = i(n(17)),
        c = (function () {
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
                        : a.RTCPeerConnection
                    )(t);
                  return s.adaptToAsyncAPI(r, ['addTrack', 'getSender']);
                };
              },
              set: function (e) {
                this._RTCPeerConnection = e;
              },
              enumerable: !0,
              configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'getUserMedia', {
              get: function () {
                var e;
                return null !== (e = this._getUserMedia) && void 0 !== e
                  ? e
                  : a.getUserMedia;
              },
              set: function (e) {
                this._getUserMedia = e;
              },
              enumerable: !0,
              configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'getDisplayMedia', {
              get: function () {
                var e;
                return null !== (e = this._getDisplayMedia) && void 0 !== e
                  ? e
                  : a.getDisplayMedia;
              },
              set: function (e) {
                this._getDisplayMedia = e;
              },
              enumerable: !0,
              configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'enumerateDevices', {
              get: function () {
                var e;
                return null !== (e = this._enumerateDevices) && void 0 !== e
                  ? e
                  : a.enumerateDevices;
              },
              set: function (e) {
                this._enumerateDevices = e;
              },
              enumerable: !0,
              configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'getSupportedConstraints', {
              get: function () {
                var e;
                return null !== (e = this._getSupportedConstraints) &&
                  void 0 !== e
                  ? e
                  : a.getSupportedConstraints;
              },
              set: function (e) {
                this._getSupportedConstraints = e;
              },
              enumerable: !0,
              configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'attachMediaStream', {
              get: function () {
                var e;
                return null !== (e = this._attachMediaStream) && void 0 !== e
                  ? e
                  : a.attachMediaStream;
              },
              set: function (e) {
                this._attachMediaStream = e;
              },
              enumerable: !0,
              configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'streamIsValid', {
              get: function () {
                var e;
                return null !== (e = this._streamIsValid) && void 0 !== e
                  ? e
                  : a.streamIsValid;
              },
              set: function (e) {
                this._streamIsValid = e;
              },
              enumerable: !0,
              configurable: !0,
            }),
            e
          );
        })();
      t.WebRTCOverridesManager = c;
      t.RTCPeerConnection = function (e) {
        return c.getInstance().RTCPeerConnection(e);
      };
      t.getUserMedia = function (e) {
        return c.getInstance().getUserMedia(e);
      };
      t.getDisplayMedia = function (e) {
        return c.getInstance().getDisplayMedia(e);
      };
      t.enumerateDevices = function () {
        return c.getInstance().enumerateDevices();
      };
      t.getSupportedConstraints = function () {
        return c.getInstance().getSupportedConstraints();
      };
      t.streamIsValid = function (e) {
        return c.getInstance().streamIsValid(e);
      };
      t.attachMediaStream = function (e, t) {
        return c.getInstance().attachMediaStream(e, t);
      };
      t.detachMediaStream = function (e) {
        return a.detachMediaStream(e);
      };
      t.muteMediaElement = function (e) {
        return a.muteMediaElement(e);
      };
      t.unmuteMediaElement = function (e) {
        return a.unmuteMediaElement(e);
      };
      t.toggleMuteMediaElement = function (e) {
        return a.toggleMuteMediaElement(e);
      };
      t.setMediaElementSinkId = function (e, t) {
        return r(void 0, void 0, void 0, function () {
          return o(this, function (n) {
            return [2, a.setMediaElementSinkId(e, t)];
          });
        });
      };
      t.sdpToJsonHack = function (e) {
        return a.sdpToJsonHack(e);
      };
      t.stopStream = function (e) {
        return a.stopStream(e);
      };
    },
    function (e, t, n) {
      'use strict';
      (function (e) {
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
              function a(i) {
                return function (a) {
                  return (function (i) {
                    if (n)
                      throw new TypeError('Generator is already executing.');
                    for (; s; )
                      try {
                        if (
                          ((n = 1),
                          r &&
                            (o =
                              2 & i[0]
                                ? r.return
                                : i[0]
                                ? r.throw || ((o = r.return) && o.call(r), 0)
                                : r.next) &&
                            !(o = o.call(r, i[1])).done)
                        )
                          return o;
                        switch (
                          ((r = 0), o && (i = [2 & i[0], o.value]), i[0])
                        ) {
                          case 0:
                          case 1:
                            o = i;
                            break;
                          case 4:
                            return s.label++, { value: i[1], done: !1 };
                          case 5:
                            s.label++, (r = i[1]), (i = [0]);
                            continue;
                          case 7:
                            (i = s.ops.pop()), s.trys.pop();
                            continue;
                          default:
                            if (
                              !((o = s.trys),
                              (o = o.length > 0 && o[o.length - 1]) ||
                                (6 !== i[0] && 2 !== i[0]))
                            ) {
                              s = 0;
                              continue;
                            }
                            if (
                              3 === i[0] &&
                              (!o || (i[1] > o[0] && i[1] < o[3]))
                            ) {
                              s.label = i[1];
                              break;
                            }
                            if (6 === i[0] && s.label < o[1]) {
                              (s.label = o[1]), (o = i);
                              break;
                            }
                            if (o && s.label < o[2]) {
                              (s.label = o[2]), s.ops.push(i);
                              break;
                            }
                            o[2] && s.ops.pop(), s.trys.pop();
                            continue;
                        }
                        i = t.call(e, s);
                      } catch (e) {
                        (i = [6, e]), (r = 0);
                      } finally {
                        n = o = 0;
                      }
                    if (5 & i[0]) throw i[1];
                    return { value: i[0] ? i[1] : void 0, done: !0 };
                  })([i, a]);
                };
              }
            };
        Object.defineProperty(t, '__esModule', { value: !0 });
        var i = n(1),
          s = function () {
            return 'undefined' == typeof window && void 0 !== e;
          },
          a = function (e, t) {
            return r(void 0, void 0, void 0, function () {
              var n;
              return o(this, function (r) {
                return s()
                  ? [2, null]
                  : ((n = window[e].getItem(i.mutateStorageKey(t))),
                    [2, i.safeParseJson(n)]);
              });
            });
          },
          c = function (e, t, n) {
            return r(void 0, void 0, void 0, function () {
              return o(this, function (r) {
                return s()
                  ? [2, null]
                  : ('object' == typeof n && (n = JSON.stringify(n)),
                    window[e].setItem(i.mutateStorageKey(t), n),
                    [2]);
              });
            });
          },
          u = function (e, t) {
            return r(void 0, void 0, void 0, function () {
              return o(this, function (n) {
                return s()
                  ? [2, null]
                  : [2, window[e].removeItem(i.mutateStorageKey(t))];
              });
            });
          };
        (t.localStorage = {
          getItem: function (e) {
            return a('localStorage', e);
          },
          setItem: function (e, t) {
            return c('localStorage', e, t);
          },
          removeItem: function (e) {
            return u('localStorage', e);
          },
        }),
          (t.sessionStorage = {
            getItem: function (e) {
              return a('sessionStorage', e);
            },
            setItem: function (e, t) {
              return c('sessionStorage', e, t);
            },
            removeItem: function (e) {
              return u('sessionStorage', e);
            },
          });
      }).call(this, n(29));
    },
    function (e, t, n) {
      'use strict';
      var r,
        o =
          (this && this.__extends) ||
          ((r = function (e, t) {
            return (r =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (e, t) {
                  e.__proto__ = t;
                }) ||
              function (e, t) {
                for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
              })(e, t);
          }),
          function (e, t) {
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
      Object.defineProperty(t, '__esModule', { value: !0 });
      var s = i(n(9)),
        a = n(32);
      t.Login = a.Login;
      var c = n(33);
      t.Result = c.Result;
      var u = n(3),
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
      var f = (function (e) {
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
      t.Answer = f;
      var d = (function (e) {
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
      t.Attach = d;
      var h = (function (e) {
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
      t.Bye = h;
      var p = (function (e) {
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
      t.Modify = p;
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
    function (e, t, n) {
      'use strict';
      var r,
        o =
          (this && this.__extends) ||
          ((r = function (e, t) {
            return (r =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (e, t) {
                  e.__proto__ = t;
                }) ||
              function (e, t) {
                for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
              })(e, t);
          }),
          function (e, t) {
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
      var a = s(n(5)),
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
    function (e, t, n) {
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
            function a(i) {
              return function (a) {
                return (function (i) {
                  if (n) throw new TypeError('Generator is already executing.');
                  for (; s; )
                    try {
                      if (
                        ((n = 1),
                        r &&
                          (o =
                            2 & i[0]
                              ? r.return
                              : i[0]
                              ? r.throw || ((o = r.return) && o.call(r), 0)
                              : r.next) &&
                          !(o = o.call(r, i[1])).done)
                      )
                        return o;
                      switch (((r = 0), o && (i = [2 & i[0], o.value]), i[0])) {
                        case 0:
                        case 1:
                          o = i;
                          break;
                        case 4:
                          return s.label++, { value: i[1], done: !1 };
                        case 5:
                          s.label++, (r = i[1]), (i = [0]);
                          continue;
                        case 7:
                          (i = s.ops.pop()), s.trys.pop();
                          continue;
                        default:
                          if (
                            !((o = s.trys),
                            (o = o.length > 0 && o[o.length - 1]) ||
                              (6 !== i[0] && 2 !== i[0]))
                          ) {
                            s = 0;
                            continue;
                          }
                          if (
                            3 === i[0] &&
                            (!o || (i[1] > o[0] && i[1] < o[3]))
                          ) {
                            s.label = i[1];
                            break;
                          }
                          if (6 === i[0] && s.label < o[1]) {
                            (s.label = o[1]), (o = i);
                            break;
                          }
                          if (o && s.label < o[2]) {
                            (s.label = o[2]), s.ops.push(i);
                            break;
                          }
                          o[2] && s.ops.pop(), s.trys.pop();
                          continue;
                      }
                      i = t.call(e, s);
                    } catch (e) {
                      (i = [6, e]), (r = 0);
                    } finally {
                      n = o = 0;
                    }
                  if (5 & i[0]) throw i[1];
                  return { value: i[0] ? i[1] : void 0, done: !0 };
                })([i, a]);
              };
            }
          },
        i =
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
        s =
          (this && this.__spread) ||
          function () {
            for (var e = [], t = 0; t < arguments.length; t++)
              e = e.concat(i(arguments[t]));
            return e;
          },
        a =
          (this && this.__importDefault) ||
          function (e) {
            return e && e.__esModule ? e : { default: e };
          },
        c =
          (this && this.__importStar) ||
          function (e) {
            if (e && e.__esModule) return e;
            var t = {};
            if (null != e)
              for (var n in e)
                Object.hasOwnProperty.call(e, n) && (t[n] = e[n]);
            return (t.default = e), t;
          };
      Object.defineProperty(t, '__esModule', { value: !0 });
      var u = a(n(0)),
        l = c(n(6)),
        f = n(1),
        d = n(3),
        h = function (e) {
          return r(void 0, void 0, void 0, function () {
            var t, n, r;
            return o(this, function (o) {
              switch (o.label) {
                case 0:
                  if (
                    (u.default.info('RTCService.getUserMedia', e),
                    (t = e.audio),
                    (n = e.video),
                    !t && !n)
                  )
                    return [2, null];
                  o.label = 1;
                case 1:
                  return o.trys.push([1, 3, , 4]), [4, l.getUserMedia(e)];
                case 2:
                  return [2, o.sent()];
                case 3:
                  throw (
                    ((r = o.sent()),
                    u.default.error('getUserMedia error: ', r),
                    r)
                  );
                case 4:
                  return [2];
              }
            });
          });
        };
      t.getUserMedia = h;
      var p = function (e) {
          return (
            void 0 === e && (e = null),
            {
              audio: !e || e === d.DeviceType.AudioIn,
              video: !e || e === d.DeviceType.Video,
            }
          );
        },
        v = function (e, t) {
          return (
            void 0 === e && (e = null),
            void 0 === t && (t = !1),
            r(void 0, void 0, void 0, function () {
              var n, r, i;
              return o(this, function (o) {
                switch (o.label) {
                  case 0:
                    return [
                      4,
                      l.enumerateDevices().catch(function (e) {
                        return [];
                      }),
                    ];
                  case 1:
                    return (
                      (n = o.sent()),
                      e &&
                        (n = n.filter(function (t) {
                          return t.kind === e;
                        })),
                      n.length &&
                      n.every(function (e) {
                        return e.deviceId && e.label;
                      })
                        ? [3, 3]
                        : [4, l.getUserMedia(p(e))]
                    );
                  case 2:
                    return (r = o.sent()), l.stopStream(r), [2, v(e)];
                  case 3:
                    return !0 === t
                      ? [2, n]
                      : ((i = []),
                        [
                          2,
                          (n = n.filter(function (e) {
                            var t = e.kind,
                              n = e.groupId;
                            if (!n) return !0;
                            var r = t + '-' + n;
                            return !i.includes(r) && (i.push(r), !0);
                          })),
                        ]);
                }
              });
            })
          );
        };
      t.getDevices = v;
      var y = [
        [320, 240],
        [640, 360],
        [640, 480],
        [1280, 720],
        [1920, 1080],
      ];
      t.scanResolutions = function (e) {
        return r(void 0, void 0, void 0, function () {
          var t, n, r, s, a, c, u;
          return o(this, function (o) {
            switch (o.label) {
              case 0:
                return (t = []), [4, h({ video: { deviceId: { exact: e } } })];
              case 1:
                (n = o.sent()),
                  (r = n.getVideoTracks()[0]),
                  (s = 0),
                  (o.label = 2);
              case 2:
                return s < y.length
                  ? ((a = i(y[s], 2)),
                    (c = a[0]),
                    (u = a[1]),
                    [
                      4,
                      r
                        .applyConstraints({
                          width: { exact: c },
                          height: { exact: u },
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
                o.sent() &&
                  t.push({ resolution: c + 'x' + u, width: c, height: u }),
                  (o.label = 4);
              case 4:
                return s++, [3, 2];
              case 5:
                return l.stopStream(n), [2, t];
            }
          });
        });
      };
      t.getMediaConstraints = function (e) {
        return r(void 0, void 0, void 0, function () {
          var t, n, r, i, s, a, c, u, l, f;
          return o(this, function (o) {
            switch (o.label) {
              case 0:
                return (
                  (t = e.audio),
                  (n = void 0 === t || t),
                  (r = e.micId),
                  (i = e.micLabel),
                  (s = void 0 === i ? '' : i),
                  r
                    ? [
                        4,
                        b(r, s, d.DeviceType.AudioIn).catch(function (e) {
                          return null;
                        }),
                      ]
                    : [3, 2]
                );
              case 1:
                (r = o.sent()) &&
                  ('boolean' == typeof n && (n = {}),
                  (n.deviceId = { exact: r })),
                  (o.label = 2);
              case 2:
                return (
                  (a = e.video),
                  (c = void 0 !== a && a),
                  (u = e.camId),
                  (l = e.camLabel),
                  (f = void 0 === l ? '' : l),
                  u
                    ? [
                        4,
                        b(u, f, d.DeviceType.Video).catch(function (e) {
                          return null;
                        }),
                      ]
                    : [3, 4]
                );
              case 3:
                (u = o.sent()) &&
                  ('boolean' == typeof c && (c = {}),
                  (c.deviceId = { exact: u })),
                  (o.label = 4);
              case 4:
                return [2, { audio: n, video: c }];
            }
          });
        });
      };
      var b = function (e, t, n) {
        return r(void 0, void 0, void 0, function () {
          var r, i, s, a, c;
          return o(this, function (o) {
            switch (o.label) {
              case 0:
                return [4, v(n, !0)];
              case 1:
                for (r = o.sent(), i = 0; i < r.length; i++)
                  if (
                    ((s = r[i]),
                    (a = s.deviceId),
                    (c = s.label),
                    e === a || t === c)
                  )
                    return [2, a];
                return [2, null];
            }
          });
        });
      };
      t.assureDeviceId = b;
      t.removeUnsupportedConstraints = function (e) {
        var t = l.getSupportedConstraints();
        Object.keys(e).map(function (n) {
          (t.hasOwnProperty(n) && null !== e[n] && void 0 !== e[n]) ||
            delete e[n];
        });
      };
      t.checkDeviceIdConstraints = function (e, t, n, i) {
        return r(void 0, void 0, void 0, function () {
          var r, s;
          return o(this, function (o) {
            switch (o.label) {
              case 0:
                return (
                  (r = i.deviceId),
                  f.isDefined(r) || (!e && !t)
                    ? [3, 2]
                    : [
                        4,
                        b(e, t, n).catch(function (e) {
                          return null;
                        }),
                      ]
                );
              case 1:
                (s = o.sent()) && (i.deviceId = { exact: s }), (o.label = 2);
              case 2:
                return [2, i];
            }
          });
        });
      };
      t.sdpStereoHack = function (e) {
        var t = e.split('\r\n'),
          n = t.findIndex(function (e) {
            return /^a=rtpmap/.test(e) && /opus\/48000/.test(e);
          });
        if (n < 0) return e;
        var r = (function (e) {
            var t = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+'),
              n = e.match(t);
            return n && 2 == n.length ? n[1] : null;
          })(t[n]),
          o = new RegExp('a=fmtp:' + r),
          i = t.findIndex(function (e) {
            return o.test(e);
          });
        return (
          i >= 0
            ? /stereo=1;/.test(t[i]) || (t[i] += '; stereo=1; sprop-stereo=1')
            : (t[n] += '\r\na=fmtp:' + r + ' stereo=1; sprop-stereo=1'),
          t.join('\r\n')
        );
      };
      var g = function (e) {
          return /^m=audio/.test(e);
        },
        _ = function (e) {
          return /^m=video/.test(e);
        };
      t.sdpMediaOrderHack = function (e, t) {
        var n = t.split('\r\n');
        if (n.findIndex(g) < n.findIndex(_)) return e;
        var r = e.split('\r\n'),
          o = r.findIndex(g),
          i = r.findIndex(_),
          a = r.slice(o, i),
          c = r.slice(i, r.length - 1),
          u = r.slice(0, o);
        return s(u, c, a, ['']).join('\r\n');
      };
      t.checkSubscribeResponse = function (e, t) {
        if (!e) return !1;
        var n = m(e),
          r = n.subscribed,
          o = n.alreadySubscribed;
        return r.includes(t) || o.includes(t);
      };
      var m = function (e) {
        var t = {
          subscribed: [],
          alreadySubscribed: [],
          unauthorized: [],
          unsubscribed: [],
          notSubscribed: [],
        };
        return (
          Object.keys(t).forEach(function (n) {
            t[n] = e[n + 'Channels'] || [];
          }),
          t
        );
      };
      t.destructSubscribeResponse = m;
      t.enableAudioTracks = function (e) {
        w(e, 'audio', !0);
      };
      t.disableAudioTracks = function (e) {
        w(e, 'audio', !1);
      };
      t.toggleAudioTracks = function (e) {
        w(e, 'audio', null);
      };
      t.enableVideoTracks = function (e) {
        w(e, 'video', !0);
      };
      t.disableVideoTracks = function (e) {
        w(e, 'video', !1);
      };
      t.toggleVideoTracks = function (e) {
        w(e, 'video', null);
      };
      var w = function (e, t, n) {
        if (
          (void 0 === t && (t = null),
          void 0 === n && (n = null),
          !l.streamIsValid(e))
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
      t.sdpBitrateHack = function (e, t, n, r) {
        var o = e.split('\r\n');
        return (
          o.forEach(function (e, i) {
            /^a=fmtp:\d*/.test(e)
              ? (o[i] +=
                  ';x-google-max-bitrate=' +
                  t +
                  ';x-google-min-bitrate=' +
                  n +
                  ';x-google-start-bitrate=' +
                  r)
              : /^a=mid:(1|video)/.test(e) && (o[i] += '\r\nb=AS:' + t);
          }),
          o.join('\r\n')
        );
      };
    },
    function (e, t, n) {
      'use strict';
      Object.defineProperty(t, '__esModule', { value: !0 });
      var r = n(15);
      t.Connect = r.Connect;
      var o = n(25);
      t.Execute = o.Execute;
      var i = n(26);
      t.Subscription = i.Subscription;
      var s = n(27);
      t.Reauthenticate = s.Reauthenticate;
      var a = n(28);
      t.Ping = a.Ping;
    },
    function (e, t, n) {
      'use strict';
      var r,
        o =
          (this && this.__extends) ||
          ((r = function (e, t) {
            return (r =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (e, t) {
                  e.__proto__ = t;
                }) ||
              function (e, t) {
                for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
              })(e, t);
          }),
          function (e, t) {
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
            return (i =
              Object.assign ||
              function (e) {
                for (var t, n = 1, r = arguments.length; n < r; n++)
                  for (var o in (t = arguments[n]))
                    Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
                return e;
              }).apply(this, arguments);
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
            function a(i) {
              return function (a) {
                return (function (i) {
                  if (n) throw new TypeError('Generator is already executing.');
                  for (; s; )
                    try {
                      if (
                        ((n = 1),
                        r &&
                          (o =
                            2 & i[0]
                              ? r.return
                              : i[0]
                              ? r.throw || ((o = r.return) && o.call(r), 0)
                              : r.next) &&
                          !(o = o.call(r, i[1])).done)
                      )
                        return o;
                      switch (((r = 0), o && (i = [2 & i[0], o.value]), i[0])) {
                        case 0:
                        case 1:
                          o = i;
                          break;
                        case 4:
                          return s.label++, { value: i[1], done: !1 };
                        case 5:
                          s.label++, (r = i[1]), (i = [0]);
                          continue;
                        case 7:
                          (i = s.ops.pop()), s.trys.pop();
                          continue;
                        default:
                          if (
                            !((o = s.trys),
                            (o = o.length > 0 && o[o.length - 1]) ||
                              (6 !== i[0] && 2 !== i[0]))
                          ) {
                            s = 0;
                            continue;
                          }
                          if (
                            3 === i[0] &&
                            (!o || (i[1] > o[0] && i[1] < o[3]))
                          ) {
                            s.label = i[1];
                            break;
                          }
                          if (6 === i[0] && s.label < o[1]) {
                            (s.label = o[1]), (o = i);
                            break;
                          }
                          if (o && s.label < o[2]) {
                            (s.label = o[2]), s.ops.push(i);
                            break;
                          }
                          o[2] && s.ops.pop(), s.trys.pop();
                          continue;
                      }
                      i = t.call(e, s);
                    } catch (e) {
                      (i = [6, e]), (r = 0);
                    } finally {
                      n = o = 0;
                    }
                  if (5 & i[0]) throw i[1];
                  return { value: i[0] ? i[1] : void 0, done: !0 };
                })([i, a]);
              };
            }
          },
        c =
          (this && this.__importDefault) ||
          function (e) {
            return e && e.__esModule ? e : { default: e };
          };
      Object.defineProperty(t, '__esModule', { value: !0 });
      var u = c(n(0)),
        l = c(n(31)),
        f = n(6),
        d = (function (e) {
          function t() {
            var t = (null !== e && e.apply(this, arguments)) || this;
            return (t._statsInterval = null), t;
          }
          return (
            o(t, e),
            (t.prototype.hangup = function (n, r) {
              void 0 === n && (n = {}),
                void 0 === r && (r = !0),
                this.screenShare instanceof t && this.screenShare.hangup(n, r),
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
                  d = this;
                return a(this, function (a) {
                  switch (a.label) {
                    case 0:
                      return [4, f.getDisplayMedia({ video: !0 })];
                    case 1:
                      return (
                        (n = a.sent()).getTracks().forEach(function (e) {
                          e.addEventListener('ended', function () {
                            d.screenShare && d.screenShare.hangup();
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
                            destinationNumber: this.extension + '-screen',
                            remoteCallerName: o,
                            remoteCallerNumber: s + '-screen',
                            callerName: c + ' (Screen)',
                            callerNumber: u + ' (Screen)',
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
                    n && r ? [2, f.setMediaElementSinkId(n, r)] : [2, !1]
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
                                ((t += '\n' + e.type + '\n'),
                                Object.keys(e).forEach(function (n) {
                                  r.includes(n) ||
                                    (t += '\t' + n + ': ' + e[n] + '\n');
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
      t.default = d;
    },
    function (e, t, n) {
      'use strict';
      n.r(t),
        n.d(t, 'v1', function () {
          return h;
        }),
        n.d(t, 'v3', function () {
          return w;
        }),
        n.d(t, 'v4', function () {
          return S;
        }),
        n.d(t, 'v5', function () {
          return k;
        });
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
      var c,
        u,
        l = function (e, t) {
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
        },
        f = 0,
        d = 0;
      var h = function (e, t, n) {
        var r = (t && n) || 0,
          o = t || [],
          s = (e = e || {}).node || c,
          a = void 0 !== e.clockseq ? e.clockseq : u;
        if (null == s || null == a) {
          var h = e.random || (e.rng || i)();
          null == s && (s = c = [1 | h[0], h[1], h[2], h[3], h[4], h[5]]),
            null == a && (a = u = 16383 & ((h[6] << 8) | h[7]));
        }
        var p = void 0 !== e.msecs ? e.msecs : new Date().getTime(),
          v = void 0 !== e.nsecs ? e.nsecs : d + 1,
          y = p - f + (v - d) / 1e4;
        if (
          (y < 0 && void 0 === e.clockseq && (a = (a + 1) & 16383),
          (y < 0 || p > f) && void 0 === e.nsecs && (v = 0),
          v >= 1e4)
        )
          throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
        (f = p), (d = v), (u = a);
        var b = (1e4 * (268435455 & (p += 122192928e5)) + v) % 4294967296;
        (o[r++] = (b >>> 24) & 255),
          (o[r++] = (b >>> 16) & 255),
          (o[r++] = (b >>> 8) & 255),
          (o[r++] = 255 & b);
        var g = ((p / 4294967296) * 1e4) & 268435455;
        (o[r++] = (g >>> 8) & 255),
          (o[r++] = 255 & g),
          (o[r++] = ((g >>> 24) & 15) | 16),
          (o[r++] = (g >>> 16) & 255),
          (o[r++] = (a >>> 8) | 128),
          (o[r++] = 255 & a);
        for (var _ = 0; _ < 6; ++_) o[r + _] = s[_];
        return t || l(o);
      };
      var p = function (e, t, n) {
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
            for (var c = 0; c < 16; ++c) o[s + c] = a[c];
          return o || l(a);
        };
        try {
          r.name = e;
        } catch (e) {}
        return (
          (r.DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'),
          (r.URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8'),
          r
        );
      };
      function v(e, t) {
        var n = (65535 & e) + (65535 & t);
        return (((e >> 16) + (t >> 16) + (n >> 16)) << 16) | (65535 & n);
      }
      function y(e, t, n, r, o, i) {
        return v(((s = v(v(t, e), v(r, i))) << (a = o)) | (s >>> (32 - a)), n);
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
      var w = p('v3', 48, function (e) {
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
            i = 32 * e.length;
          for (t = 0; t < i; t += 8)
            (n = (e[t >> 5] >>> t % 32) & 255),
              (r = parseInt(
                '0123456789abcdef'.charAt((n >>> 4) & 15) +
                  '0123456789abcdef'.charAt(15 & n),
                16
              )),
              o.push(r);
          return o;
        })(
          (function (e, t) {
            var n, r, o, i, s;
            (e[t >> 5] |= 128 << t % 32), (e[14 + (((t + 64) >>> 9) << 4)] = t);
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
                (c = b(c, u, l, a, e[n + 15], 22, 1236535329)),
                (a = g(a, c, u, l, e[n + 1], 5, -165796510)),
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
                (c = g(c, u, l, a, e[n + 12], 20, -1926607734)),
                (a = _(a, c, u, l, e[n + 5], 4, -378558)),
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
                (c = _(c, u, l, a, e[n + 2], 23, -995338651)),
                (a = m(a, c, u, l, e[n], 6, -198630844)),
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
              for (n[(e.length >> 2) - 1] = void 0, t = 0; t < n.length; t += 1)
                n[t] = 0;
              var r = 8 * e.length;
              for (t = 0; t < r; t += 8)
                n[t >> 5] |= (255 & e[t / 8]) << t % 32;
              return n;
            })(e),
            8 * e.length
          )
        );
      });
      var S = function (e, t, n) {
        var r = (t && n) || 0;
        'string' == typeof e &&
          ((t = 'binary' === e ? new Array(16) : null), (e = null));
        var o = (e = e || {}).random || (e.rng || i)();
        if (((o[6] = (15 & o[6]) | 64), (o[8] = (63 & o[8]) | 128), t))
          for (var s = 0; s < 16; ++s) t[r + s] = o[s];
        return t || l(o);
      };
      function O(e, t, n, r) {
        switch (e) {
          case 0:
            return (t & n) ^ (~t & r);
          case 1:
            return t ^ n ^ r;
          case 2:
            return (t & n) ^ (t & r) ^ (n & r);
          case 3:
            return t ^ n ^ r;
        }
      }
      function I(e, t) {
        return (e << t) | (e >>> (32 - t));
      }
      var k = p('v5', 80, function (e) {
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
          var f = n[0],
            d = n[1],
            h = n[2],
            p = n[3],
            v = n[4];
          for (l = 0; l < 80; l++) {
            var y = Math.floor(l / 20),
              b = (I(f, 5) + O(y, d, h, p) + v + t[y] + u[l]) >>> 0;
            (v = p), (p = h), (h = I(d, 30) >>> 0), (d = f), (f = b);
          }
          (n[0] = (n[0] + f) >>> 0),
            (n[1] = (n[1] + d) >>> 0),
            (n[2] = (n[2] + h) >>> 0),
            (n[3] = (n[3] + p) >>> 0),
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
    function (e, t, n) {
      'use strict';
      var r,
        o =
          (this && this.__extends) ||
          ((r = function (e, t) {
            return (r =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (e, t) {
                  e.__proto__ = t;
                }) ||
              function (e, t) {
                for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
              })(e, t);
          }),
          function (e, t) {
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
            function a(i) {
              return function (a) {
                return (function (i) {
                  if (n) throw new TypeError('Generator is already executing.');
                  for (; s; )
                    try {
                      if (
                        ((n = 1),
                        r &&
                          (o =
                            2 & i[0]
                              ? r.return
                              : i[0]
                              ? r.throw || ((o = r.return) && o.call(r), 0)
                              : r.next) &&
                          !(o = o.call(r, i[1])).done)
                      )
                        return o;
                      switch (((r = 0), o && (i = [2 & i[0], o.value]), i[0])) {
                        case 0:
                        case 1:
                          o = i;
                          break;
                        case 4:
                          return s.label++, { value: i[1], done: !1 };
                        case 5:
                          s.label++, (r = i[1]), (i = [0]);
                          continue;
                        case 7:
                          (i = s.ops.pop()), s.trys.pop();
                          continue;
                        default:
                          if (
                            !((o = s.trys),
                            (o = o.length > 0 && o[o.length - 1]) ||
                              (6 !== i[0] && 2 !== i[0]))
                          ) {
                            s = 0;
                            continue;
                          }
                          if (
                            3 === i[0] &&
                            (!o || (i[1] > o[0] && i[1] < o[3]))
                          ) {
                            s.label = i[1];
                            break;
                          }
                          if (6 === i[0] && s.label < o[1]) {
                            (s.label = o[1]), (o = i);
                            break;
                          }
                          if (o && s.label < o[2]) {
                            (s.label = o[2]), s.ops.push(i);
                            break;
                          }
                          o[2] && s.ops.pop(), s.trys.pop();
                          continue;
                      }
                      i = t.call(e, s);
                    } catch (e) {
                      (i = [6, e]), (r = 0);
                    } finally {
                      n = o = 0;
                    }
                  if (5 & i[0]) throw i[1];
                  return { value: i[0] ? i[1] : void 0, done: !0 };
                })([i, a]);
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
      var u = c(n(0)),
        l = c(n(22)),
        f = n(4),
        d = n(2),
        h = n(3),
        p = n(10),
        v = n(1),
        y = n(8),
        b = n(7),
        g = n(17),
        _ = n(6),
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
              enumerable: !0,
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
                        (t = this), [4, b.localStorage.getItem(d.SESSION_ID)]
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
                          [4, p.getUserMedia({ audio: e, video: t })]
                        );
                      case 1:
                        return (n = r.sent()), g.stopStream(n), [2, !0];
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
                          return t.calls[e].setState(h.State.Purge);
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
                  (f.registerOnce(
                    d.SwEvent.SpeedTest,
                    function (t) {
                      var r = t.upDur,
                        o = t.downDur,
                        i = o ? (8 * e) / (o / 1e3) / 1024 : 0;
                      n({
                        upDur: r,
                        downDur: o,
                        upKps: (r ? (8 * e) / (r / 1e3) / 1024 : 0).toFixed(0),
                        downKps: i.toFixed(0),
                      });
                    },
                    t.uuid
                  ),
                  !(e = Number(e)))
                )
                  return r("Invalid parameter 'bytes': " + e);
                t.executeRaw('#SPU ' + e);
                var o = e / 1024;
                e % 1024 && o++;
                for (var i = '.'.repeat(1024), s = 0; s < o; s++)
                  t.executeRaw('#SPB ' + i);
                t.executeRaw('#SPE');
              });
            }),
            (t.prototype.getDevices = function () {
              var e = this;
              return p.getDevices().catch(function (t) {
                return f.trigger(d.SwEvent.MediaError, t, e.uuid), [];
              });
            }),
            (t.prototype.getVideoDevices = function () {
              var e = this;
              return p.getDevices(h.DeviceType.Video).catch(function (t) {
                return f.trigger(d.SwEvent.MediaError, t, e.uuid), [];
              });
            }),
            (t.prototype.getAudioInDevices = function () {
              var e = this;
              return p.getDevices(h.DeviceType.AudioIn).catch(function (t) {
                return f.trigger(d.SwEvent.MediaError, t, e.uuid), [];
              });
            }),
            (t.prototype.getAudioOutDevices = function () {
              var e = this;
              return p.getDevices(h.DeviceType.AudioOut).catch(function (t) {
                return f.trigger(d.SwEvent.MediaError, t, e.uuid), [];
              });
            }),
            (t.prototype.validateDeviceId = function (e, t, n) {
              return p.assureDeviceId(e, t, n);
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
              enumerable: !0,
              configurable: !0,
            }),
            (t.prototype.getDeviceResolutions = function (e) {
              return i(this, void 0, void 0, function () {
                return s(this, function (t) {
                  switch (t.label) {
                    case 0:
                      return (
                        t.trys.push([0, 2, , 3]), [4, p.scanResolutions(e)]
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
              enumerable: !0,
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
              enumerable: !0,
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
              enumerable: !0,
              configurable: !0,
            }),
            Object.defineProperty(t.prototype, 'mediaConstraints', {
              get: function () {
                return {
                  audio: this._audioConstraints,
                  video: this._videoConstraints,
                };
              },
              enumerable: !0,
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
                        p.removeUnsupportedConstraints(r),
                        (o = this),
                        [4, p.checkDeviceIdConstraints(t, n, 'audioinput', r)]
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
                        p.removeUnsupportedConstraints(r),
                        (o = this),
                        [4, p.checkDeviceIdConstraints(t, n, 'videoinput', r)]
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
              enumerable: !0,
              configurable: !0,
            }),
            Object.defineProperty(t.prototype, 'speaker', {
              get: function () {
                return this._speaker;
              },
              set: function (e) {
                this._speaker = e;
              },
              enumerable: !0,
              configurable: !0,
            }),
            Object.defineProperty(t.prototype, 'localElement', {
              get: function () {
                return this._localElement;
              },
              set: function (e) {
                this._localElement = v.findElementByType(e);
              },
              enumerable: !0,
              configurable: !0,
            }),
            Object.defineProperty(t.prototype, 'remoteElement', {
              get: function () {
                return this._remoteElement;
              },
              set: function (e) {
                this._remoteElement = v.findElementByType(e);
              },
              enumerable: !0,
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
                  f = this;
                return s(this, function (s) {
                  switch (s.label) {
                    case 0:
                      return (r = r.filter(function (e) {
                        return e && !f._existsSubscription(f.relayProtocol, e);
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
                        (i = p.destructSubscribeResponse(n)),
                        (a = i.unauthorized),
                        (c = void 0 === a ? [] : a),
                        (u = i.subscribed),
                        (l = void 0 === u ? [] : u),
                        c.length &&
                          c.forEach(function (e) {
                            return f._removeSubscription(f.relayProtocol, e);
                          }),
                        l.forEach(function (e) {
                          return f._addSubscription(f.relayProtocol, o, e);
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
                        (o = p.destructSubscribeResponse(n)),
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
    function (e, t, n) {
      'use strict';
      var r,
        o =
          (this && this.__extends) ||
          ((r = function (e, t) {
            return (r =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (e, t) {
                  e.__proto__ = t;
                }) ||
              function (e, t) {
                for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
              })(e, t);
          }),
          function (e, t) {
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
      Object.defineProperty(t, '__esModule', { value: !0 });
      var s = i(n(5)),
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
    function (e, t, n) {
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
            function a(i) {
              return function (a) {
                return (function (i) {
                  if (n) throw new TypeError('Generator is already executing.');
                  for (; s; )
                    try {
                      if (
                        ((n = 1),
                        r &&
                          (o =
                            2 & i[0]
                              ? r.return
                              : i[0]
                              ? r.throw || ((o = r.return) && o.call(r), 0)
                              : r.next) &&
                          !(o = o.call(r, i[1])).done)
                      )
                        return o;
                      switch (((r = 0), o && (i = [2 & i[0], o.value]), i[0])) {
                        case 0:
                        case 1:
                          o = i;
                          break;
                        case 4:
                          return s.label++, { value: i[1], done: !1 };
                        case 5:
                          s.label++, (r = i[1]), (i = [0]);
                          continue;
                        case 7:
                          (i = s.ops.pop()), s.trys.pop();
                          continue;
                        default:
                          if (
                            !((o = s.trys),
                            (o = o.length > 0 && o[o.length - 1]) ||
                              (6 !== i[0] && 2 !== i[0]))
                          ) {
                            s = 0;
                            continue;
                          }
                          if (
                            3 === i[0] &&
                            (!o || (i[1] > o[0] && i[1] < o[3]))
                          ) {
                            s.label = i[1];
                            break;
                          }
                          if (6 === i[0] && s.label < o[1]) {
                            (s.label = o[1]), (o = i);
                            break;
                          }
                          if (o && s.label < o[2]) {
                            (s.label = o[2]), s.ops.push(i);
                            break;
                          }
                          o[2] && s.ops.pop(), s.trys.pop();
                          continue;
                      }
                      i = t.call(e, s);
                    } catch (e) {
                      (i = [6, e]), (r = 0);
                    } finally {
                      n = o = 0;
                    }
                  if (5 & i[0]) throw i[1];
                  return { value: i[0] ? i[1] : void 0, done: !0 };
                })([i, a]);
              };
            }
          },
        i =
          (this && this.__importDefault) ||
          function (e) {
            return e && e.__esModule ? e : { default: e };
          };
      Object.defineProperty(t, '__esModule', { value: !0 });
      var s = i(n(0)),
        a = i(n(12)),
        c = n(10),
        u = n(8),
        l = n(2),
        f = n(3),
        d = n(4),
        h = n(3),
        p = n(18),
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
                p = i.eventType,
                v = o === f.VertoMethod.Attach;
              if ('channelPvtData' === p)
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
                case f.VertoMethod.Punt:
                  n.disconnect();
                  break;
                case f.VertoMethod.Invite:
                  (b = y()).setState(h.State.Ringing), this._ack(r, o);
                  break;
                case f.VertoMethod.Attach:
                  var b = y();
                  this.session.autoRecoverCalls
                    ? b.answer()
                    : b.setState(h.State.Recovering),
                    b.handleMessage(e);
                  break;
                case f.VertoMethod.Event:
                case 'webrtc.event':
                  if (!u)
                    return void s.default.error(
                      'Verto received an unknown event:',
                      i
                    );
                  var g = n.relayProtocol,
                    _ = u.split('.')[0];
                  n._existsSubscription(g, u)
                    ? d.trigger(g, i, u)
                    : u === n.sessionid
                    ? this._handleSessionEvent(i.eventData)
                    : n._existsSubscription(g, _)
                    ? d.trigger(g, i, _)
                    : n.calls.hasOwnProperty(u)
                    ? n.calls[u].handleMessage(e)
                    : d.trigger(l.SwEvent.Notification, i, n.uuid);
                  break;
                case f.VertoMethod.Info:
                  (i.type = f.NOTIFICATION_TYPE.generic),
                    d.trigger(l.SwEvent.Notification, i, n.uuid);
                  break;
                case f.VertoMethod.ClientReady:
                  (i.type = f.NOTIFICATION_TYPE.vertoClientReady),
                    d.trigger(l.SwEvent.Notification, i, n.uuid);
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
                  p,
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
                  k,
                  C,
                  E = this;
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
                        (p = e.infoChannel),
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
                            nodeId: E.nodeId,
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
                              o = g || E._retrieveCallId(r, i);
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
                            s.default.error('liveArray subscription error:', e);
                          }),
                        ]
                      );
                    case 2:
                      return (
                        (w = o.sent()),
                        c.checkSubscribeResponse(w, i) && _(),
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
                            ((k = {
                              type: f.NOTIFICATION_TYPE.conferenceUpdate,
                              action: h.ConferenceAction.Leave,
                              conferenceName: a,
                              participantId: Number(y),
                              role: b,
                            }),
                            d.trigger(l.SwEvent.Notification, k, I, !1) ||
                              d.trigger(l.SwEvent.Notification, k, t.uuid),
                            null === S &&
                              d.deRegister(l.SwEvent.Notification, null, I))),
                        (C = [i, u, p, v]),
                        t
                          .vertoUnsubscribe({
                            nodeId: this.nodeId,
                            channels: C,
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
                            s.default.error('liveArray unsubscribe error:', e);
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
                  p.MCULayoutEventHandler(this.session, e);
                  break;
                case 'logo-info':
                  var t = {
                    type: f.NOTIFICATION_TYPE.conferenceUpdate,
                    action: h.ConferenceAction.LogoInfo,
                    logo: e.logoURL,
                  };
                  d.trigger(l.SwEvent.Notification, t, this.session.uuid);
              }
            }),
            e
          );
        })();
      t.default = v;
    },
    function (e, t, n) {
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
            function a(i) {
              return function (a) {
                return (function (i) {
                  if (n) throw new TypeError('Generator is already executing.');
                  for (; s; )
                    try {
                      if (
                        ((n = 1),
                        r &&
                          (o =
                            2 & i[0]
                              ? r.return
                              : i[0]
                              ? r.throw || ((o = r.return) && o.call(r), 0)
                              : r.next) &&
                          !(o = o.call(r, i[1])).done)
                      )
                        return o;
                      switch (((r = 0), o && (i = [2 & i[0], o.value]), i[0])) {
                        case 0:
                        case 1:
                          o = i;
                          break;
                        case 4:
                          return s.label++, { value: i[1], done: !1 };
                        case 5:
                          s.label++, (r = i[1]), (i = [0]);
                          continue;
                        case 7:
                          (i = s.ops.pop()), s.trys.pop();
                          continue;
                        default:
                          if (
                            !((o = s.trys),
                            (o = o.length > 0 && o[o.length - 1]) ||
                              (6 !== i[0] && 2 !== i[0]))
                          ) {
                            s = 0;
                            continue;
                          }
                          if (
                            3 === i[0] &&
                            (!o || (i[1] > o[0] && i[1] < o[3]))
                          ) {
                            s.label = i[1];
                            break;
                          }
                          if (6 === i[0] && s.label < o[1]) {
                            (s.label = o[1]), (o = i);
                            break;
                          }
                          if (o && s.label < o[2]) {
                            (s.label = o[2]), s.ops.push(i);
                            break;
                          }
                          o[2] && s.ops.pop(), s.trys.pop();
                          continue;
                      }
                      i = t.call(e, s);
                    } catch (e) {
                      (i = [6, e]), (r = 0);
                    } finally {
                      n = o = 0;
                    }
                  if (5 & i[0]) throw i[1];
                  return { value: i[0] ? i[1] : void 0, done: !0 };
                })([i, a]);
              };
            }
          };
      Object.defineProperty(t, '__esModule', { value: !0 });
      var i = n(1);
      t.RTCPeerConnection = function (e) {
        return new window.RTCPeerConnection(e);
      };
      t.getUserMedia = function (e) {
        return navigator.mediaDevices.getUserMedia(e);
      };
      t.getDisplayMedia = function (e) {
        return navigator.mediaDevices.getDisplayMedia(e);
      };
      t.enumerateDevices = function () {
        return navigator.mediaDevices.enumerateDevices();
      };
      t.getSupportedConstraints = function () {
        return navigator.mediaDevices.getSupportedConstraints();
      };
      var s = function (e) {
        return e && e instanceof MediaStream;
      };
      t.streamIsValid = s;
      t.attachMediaStream = function (e, t) {
        var n = i.findElementByType(e);
        null !== n &&
          (n.getAttribute('autoplay') || n.setAttribute('autoplay', 'autoplay'),
          n.getAttribute('playsinline') ||
            n.setAttribute('playsinline', 'playsinline'),
          (n.srcObject = t));
      };
      t.detachMediaStream = function (e) {
        var t = i.findElementByType(e);
        t && (t.srcObject = null);
      };
      t.muteMediaElement = function (e) {
        var t = i.findElementByType(e);
        t && (t.muted = !0);
      };
      t.unmuteMediaElement = function (e) {
        var t = i.findElementByType(e);
        t && (t.muted = !1);
      };
      t.toggleMuteMediaElement = function (e) {
        var t = i.findElementByType(e);
        t && (t.muted = !t.muted);
      };
      t.setMediaElementSinkId = function (e, t) {
        return r(void 0, void 0, void 0, function () {
          var n;
          return o(this, function (r) {
            switch (r.label) {
              case 0:
                if (null === (n = i.findElementByType(e))) return [2, !1];
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
      };
      t.sdpToJsonHack = function (e) {
        return e;
      };
      t.stopStream = function (e) {
        s(e) &&
          e.getTracks().forEach(function (e) {
            return e.stop();
          }),
          (e = null);
      };
    },
    function (e, t, n) {
      'use strict';
      var r =
        (this && this.__assign) ||
        function () {
          return (r =
            Object.assign ||
            function (e) {
              for (var t, n = 1, r = arguments.length; n < r; n++)
                for (var o in (t = arguments[n]))
                  Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
              return e;
            }).apply(this, arguments);
        };
      Object.defineProperty(t, '__esModule', { value: !0 });
      var o = n(3),
        i = n(2),
        s = n(4),
        a = n(1);
      t.MCULayoutEventHandler = function (e, t) {
        var n = t.contentType,
          a = t.canvasType,
          u = t.callID,
          l = t.canvasInfo,
          f = void 0 === l ? null : l,
          d = t.currentLayerIdx,
          h = void 0 === d ? -1 : d;
        f && 'mcu-personal-canvas' !== a && delete f.memberID;
        var p = {
          type: o.NOTIFICATION_TYPE.conferenceUpdate,
          call: e.calls[u],
          canvasInfo: c(f),
          currentLayerIdx: h,
        };
        switch (n) {
          case 'layer-info':
            var v = r({ action: o.ConferenceAction.LayerInfo }, p);
            s.trigger(i.SwEvent.Notification, v, e.uuid);
            break;
          case 'layout-info':
            v = r({ action: o.ConferenceAction.LayoutInfo }, p);
            s.trigger(i.SwEvent.Notification, v, e.uuid);
        }
      };
      var c = function (e) {
        var t = JSON.stringify(e)
          .replace(/memberID/g, 'participantId')
          .replace(/ID"/g, 'Id"')
          .replace(/POS"/g, 'Pos"');
        return a.safeParseJson(t);
      };
    },
    function (e, t, n) {
      'use strict';
      var r = function (e) {
        return e && e.__esModule ? e : { default: e };
      };
      Object.defineProperty(t, '__esModule', { value: !0 });
      var o = r(n(20));
      t.Relay = o.default;
      var i = r(n(35));
      t.Verto = i.default;
      var s = n(15),
        a = r(n(36));
      (t.CantinaAuth = a.default),
        (t.VERSION = '1.3.0'),
        s.setAgentName('JavaScript SDK/' + t.VERSION);
    },
    function (e, t, n) {
      'use strict';
      var r,
        o =
          ((r = function (e, t) {
            return (r =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (e, t) {
                  e.__proto__ = t;
                }) ||
              function (e, t) {
                for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
              })(e, t);
          }),
          function (e, t) {
            function n() {
              this.constructor = e;
            }
            r(e, t),
              (e.prototype =
                null === t
                  ? Object.create(t)
                  : ((n.prototype = t.prototype), new n()));
          }),
        i = function (e, t, n, r) {
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
        s = function (e, t) {
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
          function a(i) {
            return function (a) {
              return (function (i) {
                if (n) throw new TypeError('Generator is already executing.');
                for (; s; )
                  try {
                    if (
                      ((n = 1),
                      r &&
                        (o =
                          2 & i[0]
                            ? r.return
                            : i[0]
                            ? r.throw || ((o = r.return) && o.call(r), 0)
                            : r.next) &&
                        !(o = o.call(r, i[1])).done)
                    )
                      return o;
                    switch (((r = 0), o && (i = [2 & i[0], o.value]), i[0])) {
                      case 0:
                      case 1:
                        o = i;
                        break;
                      case 4:
                        return s.label++, { value: i[1], done: !1 };
                      case 5:
                        s.label++, (r = i[1]), (i = [0]);
                        continue;
                      case 7:
                        (i = s.ops.pop()), s.trys.pop();
                        continue;
                      default:
                        if (
                          !((o = s.trys),
                          (o = o.length > 0 && o[o.length - 1]) ||
                            (6 !== i[0] && 2 !== i[0]))
                        ) {
                          s = 0;
                          continue;
                        }
                        if (
                          3 === i[0] &&
                          (!o || (i[1] > o[0] && i[1] < o[3]))
                        ) {
                          s.label = i[1];
                          break;
                        }
                        if (6 === i[0] && s.label < o[1]) {
                          (s.label = o[1]), (o = i);
                          break;
                        }
                        if (o && s.label < o[2]) {
                          (s.label = o[2]), s.ops.push(i);
                          break;
                        }
                        o[2] && s.ops.pop(), s.trys.pop();
                        continue;
                    }
                    i = t.call(e, s);
                  } catch (e) {
                    (i = [6, e]), (r = 0);
                  } finally {
                    n = o = 0;
                  }
                if (5 & i[0]) throw i[1];
                return { value: i[0] ? i[1] : void 0, done: !0 };
              })([i, a]);
            };
          }
        },
        a = function (e) {
          return e && e.__esModule ? e : { default: e };
        };
      Object.defineProperty(t, '__esModule', { value: !0 });
      var c = a(n(14)),
        u = n(11),
        l = a(n(9)),
        f = a(n(12)),
        d = (function (e) {
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
                  if (((t = e.destinationNumber), !(void 0 === t ? null : t)))
                    throw new TypeError('destinationNumber is required');
                  return (n = new f.default(this, e)).invite(), [2, n];
                });
              });
            }),
            t
          );
        })(c.default);
      t.default = d;
    },
    function (e, t, n) {
      var r, o;
      !(function (i, s) {
        'use strict';
        void 0 ===
          (o =
            'function' ==
            typeof (r = function () {
              var e = function () {},
                t =
                  'undefined' != typeof window &&
                  void 0 !== window.navigator &&
                  /Trident\/|MSIE /.test(window.navigator.userAgent),
                n = ['trace', 'debug', 'info', 'warn', 'error'];
              function r(e, t) {
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
              function o() {
                console.log &&
                  (console.log.apply
                    ? console.log.apply(console, arguments)
                    : Function.prototype.apply.apply(console.log, [
                        console,
                        arguments,
                      ])),
                  console.trace && console.trace();
              }
              function i(n) {
                return (
                  'debug' === n && (n = 'log'),
                  'undefined' != typeof console &&
                    ('trace' === n && t
                      ? o
                      : void 0 !== console[n]
                      ? r(console, n)
                      : void 0 !== console.log
                      ? r(console, 'log')
                      : e)
                );
              }
              function s(t, r) {
                for (var o = 0; o < n.length; o++) {
                  var i = n[o];
                  this[i] = o < t ? e : this.methodFactory(i, t, r);
                }
                this.log = this.debug;
              }
              function a(e, t, n) {
                return function () {
                  'undefined' != typeof console &&
                    (s.call(this, t, n), this[e].apply(this, arguments));
                };
              }
              function c(e, t, n) {
                return i(e) || a.apply(this, arguments);
              }
              function u(e, t, r) {
                var o,
                  i = this,
                  a = 'loglevel';
                function u() {
                  var e;
                  if ('undefined' != typeof window) {
                    try {
                      e = window.localStorage[a];
                    } catch (e) {}
                    if (void 0 === e)
                      try {
                        var t = window.document.cookie,
                          n = t.indexOf(encodeURIComponent(a) + '=');
                        -1 !== n && (e = /^([^;]+)/.exec(t.slice(n))[1]);
                      } catch (e) {}
                    return void 0 === i.levels[e] && (e = void 0), e;
                  }
                }
                e && (a += ':' + e),
                  (i.name = e),
                  (i.levels = {
                    TRACE: 0,
                    DEBUG: 1,
                    INFO: 2,
                    WARN: 3,
                    ERROR: 4,
                    SILENT: 5,
                  }),
                  (i.methodFactory = r || c),
                  (i.getLevel = function () {
                    return o;
                  }),
                  (i.setLevel = function (t, r) {
                    if (
                      ('string' == typeof t &&
                        void 0 !== i.levels[t.toUpperCase()] &&
                        (t = i.levels[t.toUpperCase()]),
                      !('number' == typeof t && t >= 0 && t <= i.levels.SILENT))
                    )
                      throw 'log.setLevel() called with invalid level: ' + t;
                    if (
                      ((o = t),
                      !1 !== r &&
                        (function (e) {
                          var t = (n[e] || 'silent').toUpperCase();
                          if ('undefined' != typeof window) {
                            try {
                              return void (window.localStorage[a] = t);
                            } catch (e) {}
                            try {
                              window.document.cookie =
                                encodeURIComponent(a) + '=' + t + ';';
                            } catch (e) {}
                          }
                        })(t),
                      s.call(i, t, e),
                      'undefined' == typeof console && t < i.levels.SILENT)
                    )
                      return 'No console available for logging';
                  }),
                  (i.setDefaultLevel = function (e) {
                    u() || i.setLevel(e, !1);
                  }),
                  (i.enableAll = function (e) {
                    i.setLevel(i.levels.TRACE, e);
                  }),
                  (i.disableAll = function (e) {
                    i.setLevel(i.levels.SILENT, e);
                  });
                var l = u();
                null == l && (l = null == t ? 'WARN' : t), i.setLevel(l, !1);
              }
              var l = new u(),
                f = {};
              l.getLogger = function (e) {
                if ('string' != typeof e || '' === e)
                  throw new TypeError(
                    'You must supply a name when creating a logger.'
                  );
                var t = f[e];
                return (
                  t || (t = f[e] = new u(e, l.getLevel(), l.methodFactory)), t
                );
              };
              var d = 'undefined' != typeof window ? window.log : void 0;
              return (
                (l.noConflict = function () {
                  return (
                    'undefined' != typeof window &&
                      window.log === l &&
                      (window.log = d),
                    l
                  );
                }),
                (l.getLoggers = function () {
                  return f;
                }),
                l
              );
            })
              ? r.call(t, n, t, e)
              : r) || (e.exports = o);
      })();
    },
    function (e, t, n) {
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
            function a(i) {
              return function (a) {
                return (function (i) {
                  if (n) throw new TypeError('Generator is already executing.');
                  for (; s; )
                    try {
                      if (
                        ((n = 1),
                        r &&
                          (o =
                            2 & i[0]
                              ? r.return
                              : i[0]
                              ? r.throw || ((o = r.return) && o.call(r), 0)
                              : r.next) &&
                          !(o = o.call(r, i[1])).done)
                      )
                        return o;
                      switch (((r = 0), o && (i = [2 & i[0], o.value]), i[0])) {
                        case 0:
                        case 1:
                          o = i;
                          break;
                        case 4:
                          return s.label++, { value: i[1], done: !1 };
                        case 5:
                          s.label++, (r = i[1]), (i = [0]);
                          continue;
                        case 7:
                          (i = s.ops.pop()), s.trys.pop();
                          continue;
                        default:
                          if (
                            !((o = s.trys),
                            (o = o.length > 0 && o[o.length - 1]) ||
                              (6 !== i[0] && 2 !== i[0]))
                          ) {
                            s = 0;
                            continue;
                          }
                          if (
                            3 === i[0] &&
                            (!o || (i[1] > o[0] && i[1] < o[3]))
                          ) {
                            s.label = i[1];
                            break;
                          }
                          if (6 === i[0] && s.label < o[1]) {
                            (s.label = o[1]), (o = i);
                            break;
                          }
                          if (o && s.label < o[2]) {
                            (s.label = o[2]), s.ops.push(i);
                            break;
                          }
                          o[2] && s.ops.pop(), s.trys.pop();
                          continue;
                      }
                      i = t.call(e, s);
                    } catch (e) {
                      (i = [6, e]), (r = 0);
                    } finally {
                      n = o = 0;
                    }
                  if (5 & i[0]) throw i[1];
                  return { value: i[0] ? i[1] : void 0, done: !0 };
                })([i, a]);
              };
            }
          },
        i =
          (this && this.__importDefault) ||
          function (e) {
            return e && e.__esModule ? e : { default: e };
          };
      Object.defineProperty(t, '__esModule', { value: !0 });
      var s = n(13),
        a = i(n(0)),
        c = i(n(23)),
        u = i(n(24)),
        l = n(4),
        f = i(n(30)),
        d = n(2),
        h = n(3),
        p = n(11),
        v = n(1),
        y = n(7),
        b = (function () {
          function e(e) {
            if (
              ((this.options = e),
              (this.uuid = s.v4()),
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
              enumerable: !0,
              configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'connected', {
              get: function () {
                return this.connection && this.connection.connected;
              },
              enumerable: !0,
              configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'expired', {
              get: function () {
                return this.expiresAt && this.expiresAt <= Date.now() / 1e3;
              },
              enumerable: !0,
              configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'reconnectDelay', {
              get: function () {
                return 1e3 * v.randomInt(6, 2);
              },
              enumerable: !0,
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
                        (e = new p.Subscription({
                          command: d.ADD,
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
              e.handler;
              return r(this, void 0, void 0, function () {
                var e;
                return o(this, function (r) {
                  return (
                    (e = new p.Subscription({
                      command: d.REMOVE,
                      protocol: t,
                      channels: n,
                    })),
                    [2, this.execute(e)]
                  );
                });
              });
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
              return l.register(e, t, this.uuid), this;
            }),
            (e.prototype.off = function (e, t) {
              return l.deRegister(e, t, this.uuid), this;
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
                        (t = new p.Reauthenticate(
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
                        l.trigger(d.SwEvent.Error, c, this.uuid, !1),
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
                    this.connection || (this.connection = new c.default(this)),
                    this._attachListeners(),
                    this.connection.isAlive || this.connection.connect(),
                    [2]
                  );
                });
              });
            }),
            (e.prototype._handleLoginError = function (e) {
              l.trigger(d.SwEvent.Error, e, this.uuid);
            }),
            (e.prototype._onSocketOpen = function () {
              return r(this, void 0, void 0, function () {
                var e, t, n, r, i, s, c, f, h, v, y, b, g, _, m, w, S;
                return o(this, function (o) {
                  switch (o.label) {
                    case 0:
                      return (
                        (this._idle = !1),
                        (e = this._jwtAuth ? 'jwt_token' : 'token'),
                        (t = this.options),
                        (n = t.project),
                        (r = t.token),
                        (i = new p.Connect(
                          (((S = { project: n })[e] = r), S),
                          this.sessionid
                        )),
                        [4, this.execute(i).catch(this._handleLoginError)]
                      );
                    case 1:
                      return (s = o.sent())
                        ? ((this._autoReconnect = !0),
                          (c = s.sessionid),
                          (f = s.nodeid),
                          (h = s.master_nodeid),
                          (v = s.authorization),
                          (b = (y = void 0 === v ? {} : v).expires_at),
                          (g = void 0 === b ? null : b),
                          (_ = y.signature),
                          (m = void 0 === _ ? null : _),
                          (this.expiresAt = +g || 0),
                          (this.signature = m),
                          (w = this),
                          [4, u.default(this)])
                        : [3, 3];
                    case 2:
                      (w.relayProtocol = o.sent()),
                        this._checkTokenExpiration(),
                        (this.sessionid = c),
                        (this.nodeid = f),
                        (this.master_nodeid = h),
                        this._emptyExecuteQueues(),
                        (this._pong = null),
                        this._keepAlive(),
                        this._handleBladeConnectResponse(s),
                        l.trigger(d.SwEvent.Ready, this, this.uuid),
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
                'Socket ' + e.type + ' ' + e.message
              ),
              this.relayProtocol && l.deRegisterAll(this.relayProtocol),
              this.subscriptions))
                l.deRegisterAll(n);
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
                case d.BladeMethod.Broadcast:
                  f.default(this, n);
                  break;
                case d.BladeMethod.Disconnect:
                  this._idle = !0;
              }
            }),
            (e.prototype._removeSubscription = function (e, t) {
              this._existsSubscription(e, t) &&
                (t
                  ? (delete this.subscriptions[e][t], l.deRegister(e, null, t))
                  : (delete this.subscriptions[e], l.deRegisterAll(e)));
            }),
            (e.prototype._addSubscription = function (e, t, n) {
              void 0 === t && (t = null),
                this._existsSubscription(e, n) ||
                  (this._existsSubscription(e) || (this.subscriptions[e] = {}),
                  (this.subscriptions[e][n] = {}),
                  v.isFunction(t) && l.register(e, t, n));
            }),
            (e.prototype._existsSubscription = function (e, t) {
              return !(
                !this.subscriptions.hasOwnProperty(e) ||
                !(!t || (t && this.subscriptions[e].hasOwnProperty(t)))
              );
            }),
            (e.prototype._attachListeners = function () {
              this._detachListeners(),
                this.on(d.SwEvent.SocketOpen, this._onSocketOpen),
                this.on(d.SwEvent.SocketClose, this._onSocketCloseOrError),
                this.on(d.SwEvent.SocketError, this._onSocketCloseOrError),
                this.on(d.SwEvent.SocketMessage, this._onSocketMessage);
            }),
            (e.prototype._detachListeners = function () {
              this.off(d.SwEvent.SocketOpen, this._onSocketOpen),
                this.off(d.SwEvent.SocketClose, this._onSocketCloseOrError),
                this.off(d.SwEvent.SocketError, this._onSocketCloseOrError),
                this.off(d.SwEvent.SocketMessage, this._onSocketMessage);
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
                  l.trigger(
                    d.SwEvent.Notification,
                    { type: h.NOTIFICATION_TYPE.refreshToken, session: this },
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
                  this.execute(new p.Ping())
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
              l.register(e, t);
            }),
            (e.off = function (e) {
              l.deRegister(e);
            }),
            (e.uuid = function () {
              return s.v4();
            }),
            e
          );
        })();
      t.default = b;
    },
    function (e, t, n) {
      'use strict';
      var r =
        (this && this.__importDefault) ||
        function (e) {
          return e && e.__esModule ? e : { default: e };
        };
      Object.defineProperty(t, '__esModule', { value: !0 });
      var o = r(n(0)),
        i = n(2),
        s = n(1),
        a = n(4),
        c = n(1),
        u = 'undefined' != typeof WebSocket ? WebSocket : null;
      t.setWebSocket = function (e) {
        u = e;
      };
      var l = 0,
        f = 1,
        d = 2,
        h = 3,
        p = (function () {
          function e(e) {
            (this.session = e),
              (this._wsClient = null),
              (this._host = 'wss://relay.signalwire.com'),
              (this._timers = {}),
              (this.upDur = null),
              (this.downDur = null);
            var t = e.options.host;
            t && (this._host = s.checkWebSocketHost(t));
          }
          return (
            Object.defineProperty(e.prototype, 'connected', {
              get: function () {
                return this._wsClient && this._wsClient.readyState === f;
              },
              enumerable: !0,
              configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'connecting', {
              get: function () {
                return this._wsClient && this._wsClient.readyState === l;
              },
              enumerable: !0,
              configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'closing', {
              get: function () {
                return this._wsClient && this._wsClient.readyState === d;
              },
              enumerable: !0,
              configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'closed', {
              get: function () {
                return this._wsClient && this._wsClient.readyState === h;
              },
              enumerable: !0,
              configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'isAlive', {
              get: function () {
                return this.connecting || this.connected;
              },
              enumerable: !0,
              configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'isDead', {
              get: function () {
                return this.closing || this.closed;
              },
              enumerable: !0,
              configurable: !0,
            }),
            (e.prototype.connect = function () {
              var e = this;
              (this._wsClient = new u(this._host)),
                (this._wsClient.onopen = function (t) {
                  return a.trigger(i.SwEvent.SocketOpen, t, e.session.uuid);
                }),
                (this._wsClient.onclose = function (t) {
                  return a.trigger(i.SwEvent.SocketClose, t, e.session.uuid);
                }),
                (this._wsClient.onerror = function (t) {
                  return a.trigger(i.SwEvent.SocketError, t, e.session.uuid);
                }),
                (this._wsClient.onmessage = function (t) {
                  var n = s.safeParseJson(t.data);
                  'string' != typeof n
                    ? (e._unsetTimer(n.id),
                      o.default.debug(
                        'RECV: \n',
                        JSON.stringify(n, null, 2),
                        '\n'
                      ),
                      a.trigger(n.id, n) ||
                        a.trigger(i.SwEvent.SocketMessage, n, e.session.uuid))
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
                  a.registerOnce(n.id, function (t) {
                    var n = s.destructResponse(t),
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
                (c.isFunction(this._wsClient._beginClose)
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
                a.trigger(e, {
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
                      a.trigger(
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
      t.default = p;
    },
    function (e, t, n) {
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
            function a(i) {
              return function (a) {
                return (function (i) {
                  if (n) throw new TypeError('Generator is already executing.');
                  for (; s; )
                    try {
                      if (
                        ((n = 1),
                        r &&
                          (o =
                            2 & i[0]
                              ? r.return
                              : i[0]
                              ? r.throw || ((o = r.return) && o.call(r), 0)
                              : r.next) &&
                          !(o = o.call(r, i[1])).done)
                      )
                        return o;
                      switch (((r = 0), o && (i = [2 & i[0], o.value]), i[0])) {
                        case 0:
                        case 1:
                          o = i;
                          break;
                        case 4:
                          return s.label++, { value: i[1], done: !1 };
                        case 5:
                          s.label++, (r = i[1]), (i = [0]);
                          continue;
                        case 7:
                          (i = s.ops.pop()), s.trys.pop();
                          continue;
                        default:
                          if (
                            !((o = s.trys),
                            (o = o.length > 0 && o[o.length - 1]) ||
                              (6 !== i[0] && 2 !== i[0]))
                          ) {
                            s = 0;
                            continue;
                          }
                          if (
                            3 === i[0] &&
                            (!o || (i[1] > o[0] && i[1] < o[3]))
                          ) {
                            s.label = i[1];
                            break;
                          }
                          if (6 === i[0] && s.label < o[1]) {
                            (s.label = o[1]), (o = i);
                            break;
                          }
                          if (o && s.label < o[2]) {
                            (s.label = o[2]), s.ops.push(i);
                            break;
                          }
                          o[2] && s.ops.pop(), s.trys.pop();
                          continue;
                      }
                      i = t.call(e, s);
                    } catch (e) {
                      (i = [6, e]), (r = 0);
                    } finally {
                      n = o = 0;
                    }
                  if (5 & i[0]) throw i[1];
                  return { value: i[0] ? i[1] : void 0, done: !0 };
                })([i, a]);
              };
            }
          },
        i =
          (this && this.__importDefault) ||
          function (e) {
            return e && e.__esModule ? e : { default: e };
          };
      Object.defineProperty(t, '__esModule', { value: !0 });
      var s = i(n(0)),
        a = n(11),
        c = n(7);
      t.default = function (e) {
        return r(void 0, void 0, void 0, function () {
          var t, n, r, i, u, l, f;
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
                  (f = void 0 === l ? null : l)
                    ? [
                        4,
                        e.subscribe({
                          protocol: f,
                          channels: ['notifications'],
                        }),
                      ]
                    : [3, 7]
                );
              case 5:
                return o.sent(), [4, c.sessionStorage.setItem(n, f)];
              case 6:
                return o.sent(), [3, 8];
              case 7:
                s.default.error('Error during setup the session protocol.'),
                  (o.label = 8);
              case 8:
                return [2, f];
            }
          });
        });
      };
    },
    function (e, t, n) {
      'use strict';
      var r,
        o =
          (this && this.__extends) ||
          ((r = function (e, t) {
            return (r =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (e, t) {
                  e.__proto__ = t;
                }) ||
              function (e, t) {
                for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
              })(e, t);
          }),
          function (e, t) {
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
      Object.defineProperty(t, '__esModule', { value: !0 });
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
      })(i(n(5)).default);
      t.Execute = s;
    },
    function (e, t, n) {
      'use strict';
      var r,
        o =
          (this && this.__extends) ||
          ((r = function (e, t) {
            return (r =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (e, t) {
                  e.__proto__ = t;
                }) ||
              function (e, t) {
                for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
              })(e, t);
          }),
          function (e, t) {
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
      Object.defineProperty(t, '__esModule', { value: !0 });
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
      })(i(n(5)).default);
      t.Subscription = s;
    },
    function (e, t, n) {
      'use strict';
      var r,
        o =
          (this && this.__extends) ||
          ((r = function (e, t) {
            return (r =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (e, t) {
                  e.__proto__ = t;
                }) ||
              function (e, t) {
                for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
              })(e, t);
          }),
          function (e, t) {
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
      Object.defineProperty(t, '__esModule', { value: !0 });
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
      })(i(n(5)).default);
      t.Reauthenticate = s;
    },
    function (e, t, n) {
      'use strict';
      var r,
        o =
          (this && this.__extends) ||
          ((r = function (e, t) {
            return (r =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (e, t) {
                  e.__proto__ = t;
                }) ||
              function (e, t) {
                for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
              })(e, t);
          }),
          function (e, t) {
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
      Object.defineProperty(t, '__esModule', { value: !0 });
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
      })(i(n(5)).default);
      t.Ping = s;
    },
    function (e, t) {
      var n,
        r,
        o = (e.exports = {});
      function i() {
        throw new Error('setTimeout has not been defined');
      }
      function s() {
        throw new Error('clearTimeout has not been defined');
      }
      function a(e) {
        if (n === setTimeout) return setTimeout(e, 0);
        if ((n === i || !n) && setTimeout)
          return (n = setTimeout), setTimeout(e, 0);
        try {
          return n(e, 0);
        } catch (t) {
          try {
            return n.call(null, e, 0);
          } catch (t) {
            return n.call(this, e, 0);
          }
        }
      }
      !(function () {
        try {
          n = 'function' == typeof setTimeout ? setTimeout : i;
        } catch (e) {
          n = i;
        }
        try {
          r = 'function' == typeof clearTimeout ? clearTimeout : s;
        } catch (e) {
          r = s;
        }
      })();
      var c,
        u = [],
        l = !1,
        f = -1;
      function d() {
        l &&
          c &&
          ((l = !1), c.length ? (u = c.concat(u)) : (f = -1), u.length && h());
      }
      function h() {
        if (!l) {
          var e = a(d);
          l = !0;
          for (var t = u.length; t; ) {
            for (c = u, u = []; ++f < t; ) c && c[f].run();
            (f = -1), (t = u.length);
          }
          (c = null),
            (l = !1),
            (function (e) {
              if (r === clearTimeout) return clearTimeout(e);
              if ((r === s || !r) && clearTimeout)
                return (r = clearTimeout), clearTimeout(e);
              try {
                r(e);
              } catch (t) {
                try {
                  return r.call(null, e);
                } catch (t) {
                  return r.call(this, e);
                }
              }
            })(e);
        }
      }
      function p(e, t) {
        (this.fun = e), (this.array = t);
      }
      function v() {}
      (o.nextTick = function (e) {
        var t = new Array(arguments.length - 1);
        if (arguments.length > 1)
          for (var n = 1; n < arguments.length; n++) t[n - 1] = arguments[n];
        u.push(new p(e, t)), 1 !== u.length || l || a(h);
      }),
        (p.prototype.run = function () {
          this.fun.apply(null, this.array);
        }),
        (o.title = 'browser'),
        (o.browser = !0),
        (o.env = {}),
        (o.argv = []),
        (o.version = ''),
        (o.versions = {}),
        (o.on = v),
        (o.addListener = v),
        (o.once = v),
        (o.off = v),
        (o.removeListener = v),
        (o.removeAllListeners = v),
        (o.emit = v),
        (o.prependListener = v),
        (o.prependOnceListener = v),
        (o.listeners = function (e) {
          return [];
        }),
        (o.binding = function (e) {
          throw new Error('process.binding is not supported');
        }),
        (o.cwd = function () {
          return '/';
        }),
        (o.chdir = function (e) {
          throw new Error('process.chdir is not supported');
        }),
        (o.umask = function () {
          return 0;
        });
    },
    function (e, t, n) {
      'use strict';
      var r =
        (this && this.__importDefault) ||
        function (e) {
          return e && e.__esModule ? e : { default: e };
        };
      Object.defineProperty(t, '__esModule', { value: !0 });
      var o = r(n(0)),
        i = r(n(16));
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
            return o.default.error('Unknown notification type: ' + a);
        }
      };
    },
    function (e, t, n) {
      'use strict';
      var r =
          (this && this.__assign) ||
          function () {
            return (r =
              Object.assign ||
              function (e) {
                for (var t, n = 1, r = arguments.length; n < r; n++)
                  for (var o in (t = arguments[n]))
                    Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
                return e;
              }).apply(this, arguments);
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
            function a(i) {
              return function (a) {
                return (function (i) {
                  if (n) throw new TypeError('Generator is already executing.');
                  for (; s; )
                    try {
                      if (
                        ((n = 1),
                        r &&
                          (o =
                            2 & i[0]
                              ? r.return
                              : i[0]
                              ? r.throw || ((o = r.return) && o.call(r), 0)
                              : r.next) &&
                          !(o = o.call(r, i[1])).done)
                      )
                        return o;
                      switch (((r = 0), o && (i = [2 & i[0], o.value]), i[0])) {
                        case 0:
                        case 1:
                          o = i;
                          break;
                        case 4:
                          return s.label++, { value: i[1], done: !1 };
                        case 5:
                          s.label++, (r = i[1]), (i = [0]);
                          continue;
                        case 7:
                          (i = s.ops.pop()), s.trys.pop();
                          continue;
                        default:
                          if (
                            !((o = s.trys),
                            (o = o.length > 0 && o[o.length - 1]) ||
                              (6 !== i[0] && 2 !== i[0]))
                          ) {
                            s = 0;
                            continue;
                          }
                          if (
                            3 === i[0] &&
                            (!o || (i[1] > o[0] && i[1] < o[3]))
                          ) {
                            s.label = i[1];
                            break;
                          }
                          if (6 === i[0] && s.label < o[1]) {
                            (s.label = o[1]), (o = i);
                            break;
                          }
                          if (o && s.label < o[2]) {
                            (s.label = o[2]), s.ops.push(i);
                            break;
                          }
                          o[2] && s.ops.pop(), s.trys.pop();
                          continue;
                      }
                      i = t.call(e, s);
                    } catch (e) {
                      (i = [6, e]), (r = 0);
                    } finally {
                      n = o = 0;
                    }
                  if (5 & i[0]) throw i[1];
                  return { value: i[0] ? i[1] : void 0, done: !0 };
                })([i, a]);
              };
            }
          },
        s =
          (this && this.__importDefault) ||
          function (e) {
            return e && e.__esModule ? e : { default: e };
          };
      Object.defineProperty(t, '__esModule', { value: !0 });
      var a = n(13),
        c = s(n(0)),
        u = n(8),
        l = s(n(34)),
        f = n(2),
        d = n(3),
        h = n(4),
        p = n(10),
        v = n(1),
        y = n(6),
        b = n(18),
        g = (function () {
          function e(e, t) {
            var n = this;
            (this.session = e),
              (this.id = ''),
              (this.state = d.State[d.State.New]),
              (this.prevState = ''),
              (this.channels = []),
              (this.role = d.Role.Participant),
              (this.extension = null),
              (this._state = d.State.New),
              (this._prevState = d.State.New),
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
              f = e.mediaConstraints,
              h = f.audio,
              p = f.video;
            (this.options = Object.assign(
              {},
              d.DEFAULT_CALL_OPTIONS,
              {
                audio: h,
                video: p,
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
              enumerable: !0,
              configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'localStream', {
              get: function () {
                return this.options.localStream;
              },
              enumerable: !0,
              configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'remoteStream', {
              get: function () {
                return this.options.remoteStream;
              },
              enumerable: !0,
              configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'memberChannel', {
              get: function () {
                return 'conference-member.' + this.id;
              },
              enumerable: !0,
              configurable: !0,
            }),
            (e.prototype.invite = function () {
              (this.direction = d.Direction.Outbound),
                (this.peer = new l.default(d.PeerType.Offer, this.options)),
                this._registerPeerEvents();
            }),
            (e.prototype.answer = function (e) {
              e &&
                (null == e ? void 0 : e.iceTransportPolicy) &&
                (this.options.iceTransportPolicy =
                  null == e ? void 0 : e.iceTransportPolicy),
                (this.direction = d.Direction.Inbound),
                (this.peer = new l.default(d.PeerType.Answer, this.options)),
                this._registerPeerEvents();
            }),
            (e.prototype.hangup = function (e, t) {
              var n = this;
              void 0 === e && (e = {}),
                void 0 === t && (t = !0),
                (this.cause = e.cause || 'NORMAL_CLEARING'),
                (this.causeCode = e.causeCode || 16),
                this.setState(d.State.Hangup);
              var r = function () {
                n.peer && n.peer.instance.close(), n.setState(d.State.Destroy);
              };
              if (t) {
                var o = new u.Bye({
                  sessid: this.session.sessionid,
                  dialogParams: this.options,
                });
                this._execute(o)
                  .catch(function (e) {
                    return c.default.error('verto.bye failed!', e);
                  })
                  .then(r.bind(this));
              } else r();
            }),
            (e.prototype.transfer = function (e) {
              var t = new u.Modify({
                sessid: this.session.sessionid,
                action: 'transfer',
                destination: e,
                dialogParams: this.options,
              });
              this._execute(t);
            }),
            (e.prototype.replace = function (e) {
              var t = new u.Modify({
                sessid: this.session.sessionid,
                action: 'replace',
                replaceCallID: e,
                dialogParams: this.options,
              });
              this._execute(t);
            }),
            (e.prototype.hold = function () {
              var e = new u.Modify({
                sessid: this.session.sessionid,
                action: 'hold',
                dialogParams: this.options,
              });
              return this._execute(e)
                .then(this._handleChangeHoldStateSuccess.bind(this))
                .catch(this._handleChangeHoldStateError.bind(this));
            }),
            (e.prototype.unhold = function () {
              var e = new u.Modify({
                sessid: this.session.sessionid,
                action: 'unhold',
                dialogParams: this.options,
              });
              return this._execute(e)
                .then(this._handleChangeHoldStateSuccess.bind(this))
                .catch(this._handleChangeHoldStateError.bind(this));
            }),
            (e.prototype.toggleHold = function () {
              var e = new u.Modify({
                sessid: this.session.sessionid,
                action: 'toggleHold',
                dialogParams: this.options,
              });
              return this._execute(e)
                .then(this._handleChangeHoldStateSuccess.bind(this))
                .catch(this._handleChangeHoldStateError.bind(this));
            }),
            (e.prototype.dtmf = function (e) {
              var t = new u.Info({
                sessid: this.session.sessionid,
                dtmf: e,
                dialogParams: this.options,
              });
              this._execute(t);
            }),
            (e.prototype.message = function (e, t) {
              var n = { from: this.session.options.login, to: e, body: t },
                r = new u.Info({
                  sessid: this.session.sessionid,
                  msg: n,
                  dialogParams: this.options,
                });
              this._execute(r);
            }),
            (e.prototype.muteAudio = function () {
              p.disableAudioTracks(this.options.localStream);
            }),
            (e.prototype.unmuteAudio = function () {
              p.enableAudioTracks(this.options.localStream);
            }),
            (e.prototype.toggleAudioMute = function () {
              p.toggleAudioTracks(this.options.localStream);
            }),
            (e.prototype.setAudioInDevice = function (e) {
              return o(this, void 0, void 0, function () {
                var t, n, r, o, s;
                return i(this, function (i) {
                  switch (i.label) {
                    case 0:
                      return [4, this.peer.instance.getSenders()];
                    case 1:
                      return (
                        (t = i.sent()),
                        (n = t.find(function (e) {
                          return 'audio' === e.track.kind;
                        }))
                          ? [
                              4,
                              y.getUserMedia({
                                audio: { deviceId: { exact: e } },
                              }),
                            ]
                          : [3, 3]
                      );
                    case 2:
                      (r = i.sent()),
                        (o = r.getAudioTracks()[0]),
                        n.replaceTrack(o),
                        (this.options.micId = e),
                        (s = this.options.localStream)
                          .getAudioTracks()
                          .forEach(function (e) {
                            return e.stop();
                          }),
                        s.getVideoTracks().forEach(function (e) {
                          return r.addTrack(e);
                        }),
                        (this.options.localStream = r),
                        (i.label = 3);
                    case 3:
                      return [2];
                  }
                });
              });
            }),
            (e.prototype.muteVideo = function () {
              p.disableVideoTracks(this.options.localStream);
            }),
            (e.prototype.unmuteVideo = function () {
              p.enableVideoTracks(this.options.localStream);
            }),
            (e.prototype.toggleVideoMute = function () {
              p.toggleVideoTracks(this.options.localStream);
            }),
            (e.prototype.setVideoDevice = function (e) {
              return o(this, void 0, void 0, function () {
                var t, n, r, o, s, a, c;
                return i(this, function (i) {
                  switch (i.label) {
                    case 0:
                      return [4, this.peer.instance.getSenders()];
                    case 1:
                      return (
                        (t = i.sent()),
                        (n = t.find(function (e) {
                          return 'video' === e.track.kind;
                        }))
                          ? [
                              4,
                              y.getUserMedia({
                                video: { deviceId: { exact: e } },
                              }),
                            ]
                          : [3, 3]
                      );
                    case 2:
                      (r = i.sent()),
                        (o = r.getVideoTracks()[0]),
                        n.replaceTrack(o),
                        (s = this.options),
                        (a = s.localElement),
                        (c = s.localStream),
                        y.attachMediaStream(a, r),
                        (this.options.camId = e),
                        c.getAudioTracks().forEach(function (e) {
                          return r.addTrack(e);
                        }),
                        c.getVideoTracks().forEach(function (e) {
                          return e.stop();
                        }),
                        (this.options.localStream = r),
                        (i.label = 3);
                    case 3:
                      return [2];
                  }
                });
              });
            }),
            (e.prototype.deaf = function () {
              p.disableAudioTracks(this.options.remoteStream);
            }),
            (e.prototype.undeaf = function () {
              p.enableAudioTracks(this.options.remoteStream);
            }),
            (e.prototype.toggleDeaf = function () {
              p.toggleAudioTracks(this.options.remoteStream);
            }),
            (e.prototype.setState = function (e) {
              var t = this;
              switch (
                ((this._prevState = this._state),
                (this._state = e),
                (this.state = d.State[this._state].toLowerCase()),
                (this.prevState = d.State[this._prevState].toLowerCase()),
                c.default.info(
                  'Call ' +
                    this.id +
                    ' state change from ' +
                    this.prevState +
                    ' to ' +
                    this.state
                ),
                this._dispatchNotification({
                  type: d.NOTIFICATION_TYPE.callUpdate,
                  call: this,
                }),
                e)
              ) {
                case d.State.Purge:
                  this.hangup({ cause: 'PURGE', causeCode: '01' }, !1);
                  break;
                case d.State.Active:
                  setTimeout(function () {
                    var e = t.options,
                      n = e.remoteElement,
                      r = e.speakerId;
                    n && r && y.setMediaElementSinkId(n, r);
                  }, 0);
                  break;
                case d.State.Destroy:
                  this._finalize();
              }
            }),
            (e.prototype.handleMessage = function (e) {
              var t = e.method,
                n = e.params;
              switch (t) {
                case d.VertoMethod.Answer:
                  if (((this.gotAnswer = !0), this._state >= d.State.Active))
                    return;
                  this._state >= d.State.Early && this.setState(d.State.Active),
                    this.gotEarly || this._onRemoteSdp(n.sdp);
                  break;
                case d.VertoMethod.Media:
                  if (this._state >= d.State.Early) return;
                  (this.gotEarly = !0), this._onRemoteSdp(n.sdp);
                  break;
                case d.VertoMethod.Display:
                case d.VertoMethod.Attach:
                  var o = n.display_name,
                    i = n.display_number,
                    s = n.display_direction;
                  this.extension = i;
                  var a =
                      s === d.Direction.Inbound
                        ? d.Direction.Outbound
                        : d.Direction.Inbound,
                    c = {
                      type: d.NOTIFICATION_TYPE[t],
                      call: this,
                      displayName: o,
                      displayNumber: i,
                      displayDirection: a,
                    };
                  h.trigger(f.SwEvent.Notification, c, this.id) ||
                    h.trigger(f.SwEvent.Notification, c, this.session.uuid);
                  break;
                case d.VertoMethod.Info:
                case d.VertoMethod.Event:
                  c = r(r({}, n), {
                    type: d.NOTIFICATION_TYPE.generic,
                    call: this,
                  });
                  h.trigger(f.SwEvent.Notification, c, this.id) ||
                    h.trigger(f.SwEvent.Notification, c, this.session.uuid);
                  break;
                case d.VertoMethod.Bye:
                  this.hangup(n, !1);
              }
            }),
            (e.prototype.handleConferenceUpdate = function (e, t) {
              return o(this, void 0, void 0, function () {
                var n, o, s, a, u, l, f, h, p, y, b, g, _;
                return i(this, function (i) {
                  switch (i.label) {
                    case 0:
                      if (
                        !this._checkConferenceSerno(e.wireSerno) &&
                        e.name !== t.laName
                      )
                        return (
                          c.default.error(
                            'ConferenceUpdate invalid wireSerno or packet name:',
                            e
                          ),
                          [2, 'INVALID_PACKET']
                        );
                      switch (
                        ((n = e.action),
                        (o = e.data),
                        (s = e.hashKey),
                        (a = void 0 === s ? String(this._lastSerno) : s),
                        (u = e.arrIndex),
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
                        (f = t.infoChannel),
                        (h = t.modChannel),
                        (p = t.laName),
                        (y = t.conferenceMemberID),
                        (b = t.role),
                        this._dispatchConferenceUpdate({
                          action: d.ConferenceAction.Join,
                          conferenceName: p,
                          participantId: Number(y),
                          role: b,
                        }),
                        l ? [4, this._subscribeConferenceChat(l)] : [3, 3]
                      );
                    case 2:
                      i.sent(), (i.label = 3);
                    case 3:
                      return f ? [4, this._subscribeConferenceInfo(f)] : [3, 5];
                    case 4:
                      i.sent(), (i.label = 5);
                    case 5:
                      return h && b === d.Role.Moderator
                        ? [4, this._subscribeConferenceModerator(h)]
                        : [3, 7];
                    case 6:
                      i.sent(), (i.label = 7);
                    case 7:
                      for (_ in ((g = []), o))
                        g.push(
                          r(
                            { callId: o[_][0], index: Number(_) },
                            v.mutateLiveArrayData(o[_][1])
                          )
                        );
                      return (
                        this._dispatchConferenceUpdate({
                          action: d.ConferenceAction.Bootstrap,
                          participants: g,
                        }),
                        [3, 13]
                      );
                    case 8:
                      return (
                        this._dispatchConferenceUpdate(
                          r(
                            {
                              action: d.ConferenceAction.Add,
                              callId: a,
                              index: u,
                            },
                            v.mutateLiveArrayData(o)
                          )
                        ),
                        [3, 13]
                      );
                    case 9:
                      return (
                        this._dispatchConferenceUpdate(
                          r(
                            {
                              action: d.ConferenceAction.Modify,
                              callId: a,
                              index: u,
                            },
                            v.mutateLiveArrayData(o)
                          )
                        ),
                        [3, 13]
                      );
                    case 10:
                      return (
                        this._dispatchConferenceUpdate(
                          r(
                            {
                              action: d.ConferenceAction.Delete,
                              callId: a,
                              index: u,
                            },
                            v.mutateLiveArrayData(o)
                          )
                        ),
                        [3, 13]
                      );
                    case 11:
                      return (
                        this._dispatchConferenceUpdate({
                          action: d.ConferenceAction.Clear,
                        }),
                        [3, 13]
                      );
                    case 12:
                      return (
                        this._dispatchConferenceUpdate({
                          action: n,
                          data: o,
                          callId: a,
                          index: u,
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
                (this.session.subscriptions[t][e] = r(
                  r({}, this.session.subscriptions[t][e]),
                  { callId: this.id }
                ));
            }),
            (e.prototype._subscribeConferenceChat = function (e) {
              return o(this, void 0, void 0, function () {
                var t,
                  n,
                  r = this;
                return i(this, function (o) {
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
                              action: d.ConferenceAction.ChatMessage,
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
                            c.default.error('ConfChat subscription error:', e);
                          }),
                        ]
                      );
                    case 1:
                      return (
                        (n = o.sent()),
                        p.checkSubscribeResponse(n, e) &&
                          (this._addChannel(e),
                          Object.defineProperties(this, {
                            sendChatMessage: {
                              configurable: !0,
                              value: function (t, n) {
                                r.session.vertoBroadcast({
                                  nodeId: r.nodeId,
                                  channel: e,
                                  data: { action: 'send', message: t, type: n },
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
              return o(this, void 0, void 0, function () {
                var t,
                  n,
                  r = this;
                return i(this, function (o) {
                  switch (o.label) {
                    case 0:
                      return (
                        (t = {
                          nodeId: this.nodeId,
                          channels: [e],
                          handler: function (e) {
                            var t = e.eventData;
                            switch (t.contentType) {
                              case 'layout-info':
                                (t.callID = r.id),
                                  b.MCULayoutEventHandler(r.session, t);
                                break;
                              default:
                                c.default.error(
                                  'Conference-Info unknown contentType',
                                  e
                                );
                            }
                          },
                        }),
                        [
                          4,
                          this.session.vertoSubscribe(t).catch(function (e) {
                            c.default.error('ConfInfo subscription error:', e);
                          }),
                        ]
                      );
                    case 1:
                      return (
                        (n = o.sent()),
                        p.checkSubscribeResponse(n, e) && this._addChannel(e),
                        [2]
                      );
                  }
                });
              });
            }),
            (e.prototype._confControl = function (e, t) {
              void 0 === t && (t = {});
              var n = r(
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
              return o(this, void 0, void 0, function () {
                var t,
                  n,
                  r,
                  o,
                  s = this;
                return i(this, function (i) {
                  switch (i.label) {
                    case 0:
                      return (
                        (t = function (t, n, r) {
                          void 0 === n && (n = null),
                            void 0 === r && (r = null);
                          var o = parseInt(n) || null;
                          s._confControl(e, { command: t, id: o, value: r });
                        }),
                        (n = function () {
                          var e = s.options.video;
                          if (
                            ('boolean' == typeof e && !e) ||
                            ('object' == typeof e && v.objEmpty(e))
                          )
                            throw 'Conference ' + s.id + ' has no video!';
                        }),
                        (r = {
                          nodeId: this.nodeId,
                          channels: [e],
                          handler: function (e) {
                            var t = e.data;
                            switch (t['conf-command']) {
                              case 'list-videoLayouts':
                                if (t.responseData) {
                                  var n = JSON.stringify(
                                    t.responseData
                                  ).replace(/IDS"/g, 'Ids"');
                                  s._dispatchConferenceUpdate({
                                    action: d.ConferenceAction.LayoutList,
                                    layouts: JSON.parse(n),
                                  });
                                }
                                break;
                              default:
                                s._dispatchConferenceUpdate({
                                  action: d.ConferenceAction.ModCmdResponse,
                                  command: t['conf-command'],
                                  response: t.response,
                                });
                            }
                          },
                        }),
                        [
                          4,
                          this.session.vertoSubscribe(r).catch(function (e) {
                            c.default.error('ConfMod subscription error:', e);
                          }),
                        ]
                      );
                    case 1:
                      return (
                        (o = i.sent()),
                        p.checkSubscribeResponse(o, e) &&
                          ((this.role = d.Role.Moderator),
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
                  ? this.setState(d.State.Active)
                  : this.setState(d.State.Held),
                !0
              );
            }),
            (e.prototype._handleChangeHoldStateError = function (e) {
              return (
                c.default.error(
                  'Failed to ' + e.action + ' on call ' + this.id
                ),
                !1
              );
            }),
            (e.prototype._onRemoteSdp = function (e) {
              var t = this,
                n = p.sdpMediaOrderHack(
                  e,
                  this.peer.instance.localDescription.sdp
                );
              this.options.useStereo && (n = p.sdpStereoHack(n));
              var r = y.sdpToJsonHack({ sdp: n, type: d.PeerType.Answer });
              this.peer.instance
                .setRemoteDescription(r)
                .then(function () {
                  t.gotEarly && t.setState(d.State.Early),
                    t.gotAnswer && t.setState(d.State.Active);
                })
                .catch(function (e) {
                  c.default.error('Call setRemoteDescription Error: ', e),
                    t.hangup();
                });
            }),
            (e.prototype._requestAnotherLocalDescription = function () {
              c.default.debug('_requestAnotherLocalDescription'),
                v.isFunction(this.peer.onSdpReadyTwice)
                  ? h.trigger(
                      f.SwEvent.Error,
                      new Error('SDP without candidates for the second time!'),
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
              c.default.debug('_onIceSdp'),
                this._iceTimeout && clearTimeout(this._iceTimeout),
                (this._iceTimeout = null),
                (this._iceDone = !0);
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
                  case d.PeerType.Offer:
                    this.setState(d.State.Requesting), (o = new u.Invite(i));
                    break;
                  case d.PeerType.Answer:
                    this.setState(d.State.Answering),
                      (o =
                        !0 === this.options.attach
                          ? new u.Attach(i)
                          : new u.Answer(i));
                    break;
                  default:
                    return (
                      c.default.error(
                        this.id + ' - Unknown local SDP type:',
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
                      r === d.PeerType.Offer
                        ? t.setState(d.State.Trying)
                        : t.setState(d.State.Active);
                  })
                  .catch(function (e) {
                    c.default.error(t.id + ' - Sending ' + r + ' error:', e),
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
                      (e._iceTimeout = setTimeout(function () {
                        return e._onIceSdp(t.localDescription);
                      }, 1e3)),
                    n.candidate
                      ? c.default.info('IceCandidate:', n.candidate)
                      : e._onIceSdp(t.localDescription));
                }),
                t.addEventListener('track', function (t) {
                  e.options.remoteStream = t.streams[0];
                  var n = e.options,
                    r = n.remoteElement,
                    o = n.remoteStream;
                  !1 === n.screenShare && y.attachMediaStream(r, o);
                }),
                t.addEventListener('addstream', function (t) {
                  e.options.remoteStream = t.stream;
                });
            }),
            (e.prototype._onMediaError = function (e) {
              this._dispatchNotification({
                type: d.NOTIFICATION_TYPE.userMediaError,
                error: e,
              }),
                this.hangup({}, !1);
            }),
            (e.prototype._dispatchConferenceUpdate = function (e) {
              this._dispatchNotification(
                r({ type: d.NOTIFICATION_TYPE.conferenceUpdate, call: this }, e)
              );
            }),
            (e.prototype._dispatchNotification = function (e) {
              !0 !== this.options.screenShare &&
                (h.trigger(f.SwEvent.Notification, e, this.id, !1) ||
                  h.trigger(f.SwEvent.Notification, e, this.session.uuid));
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
              t || (this.options.id = a.v4()),
                (this.id = this.options.id),
                (n && !v.objEmpty(n)) ||
                  (this.options.userVariables =
                    this.session.options.userVariables || {}),
                r ||
                  (this.options.remoteCallerNumber =
                    this.options.destinationNumber),
                (this.session.calls[this.id] = this),
                h.register(f.SwEvent.MediaError, this._onMediaError, this.id),
                v.isFunction(o) &&
                  h.register(f.SwEvent.Notification, o.bind(this), this.id),
                this.setState(d.State.New),
                c.default.info('New Call with Options:', this.options);
            }),
            (e.prototype._finalize = function () {
              var e = this.options,
                t = e.remoteStream,
                n = e.localStream,
                r = e.remoteElement,
                o = e.localElement;
              y.stopStream(t),
                y.stopStream(n),
                !0 !== this.options.screenShare &&
                  (y.detachMediaStream(r), y.detachMediaStream(o)),
                h.deRegister(f.SwEvent.MediaError, null, this.id),
                (this.peer = null),
                (this.session.calls[this.id] = null),
                delete this.session.calls[this.id];
            }),
            e
          );
        })();
      t.default = g;
    },
    function (e, t, n) {
      'use strict';
      var r,
        o =
          (this && this.__extends) ||
          ((r = function (e, t) {
            return (r =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (e, t) {
                  e.__proto__ = t;
                }) ||
              function (e, t) {
                for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
              })(e, t);
          }),
          function (e, t) {
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
      Object.defineProperty(t, '__esModule', { value: !0 });
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
      })(i(n(9)).default);
      t.Login = s;
    },
    function (e, t, n) {
      'use strict';
      var r,
        o =
          (this && this.__extends) ||
          ((r = function (e, t) {
            return (r =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (e, t) {
                  e.__proto__ = t;
                }) ||
              function (e, t) {
                for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
              })(e, t);
          }),
          function (e, t) {
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
      Object.defineProperty(t, '__esModule', { value: !0 });
      var s = (function (e) {
        function t(t, n) {
          var r = e.call(this) || this;
          return r.buildRequest({ id: t, result: { method: n } }), r;
        }
        return o(t, e), t;
      })(i(n(9)).default);
      t.Result = s;
    },
    function (e, t, n) {
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
            function a(i) {
              return function (a) {
                return (function (i) {
                  if (n) throw new TypeError('Generator is already executing.');
                  for (; s; )
                    try {
                      if (
                        ((n = 1),
                        r &&
                          (o =
                            2 & i[0]
                              ? r.return
                              : i[0]
                              ? r.throw || ((o = r.return) && o.call(r), 0)
                              : r.next) &&
                          !(o = o.call(r, i[1])).done)
                      )
                        return o;
                      switch (((r = 0), o && (i = [2 & i[0], o.value]), i[0])) {
                        case 0:
                        case 1:
                          o = i;
                          break;
                        case 4:
                          return s.label++, { value: i[1], done: !1 };
                        case 5:
                          s.label++, (r = i[1]), (i = [0]);
                          continue;
                        case 7:
                          (i = s.ops.pop()), s.trys.pop();
                          continue;
                        default:
                          if (
                            !((o = s.trys),
                            (o = o.length > 0 && o[o.length - 1]) ||
                              (6 !== i[0] && 2 !== i[0]))
                          ) {
                            s = 0;
                            continue;
                          }
                          if (
                            3 === i[0] &&
                            (!o || (i[1] > o[0] && i[1] < o[3]))
                          ) {
                            s.label = i[1];
                            break;
                          }
                          if (6 === i[0] && s.label < o[1]) {
                            (s.label = o[1]), (o = i);
                            break;
                          }
                          if (o && s.label < o[2]) {
                            (s.label = o[2]), s.ops.push(i);
                            break;
                          }
                          o[2] && s.ops.pop(), s.trys.pop();
                          continue;
                      }
                      i = t.call(e, s);
                    } catch (e) {
                      (i = [6, e]), (r = 0);
                    } finally {
                      n = o = 0;
                    }
                  if (5 & i[0]) throw i[1];
                  return { value: i[0] ? i[1] : void 0, done: !0 };
                })([i, a]);
              };
            }
          },
        i =
          (this && this.__importDefault) ||
          function (e) {
            return e && e.__esModule ? e : { default: e };
          };
      Object.defineProperty(t, '__esModule', { value: !0 });
      var s = i(n(0)),
        a = n(10),
        c = n(2),
        u = n(3),
        l = n(6),
        f = n(1),
        d = n(4),
        h = (function () {
          function e(e, t) {
            (this.type = e),
              (this.options = t),
              (this.onSdpReadyTwice = null),
              (this._negotiating = !1),
              s.default.info(
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
                  i,
                  a,
                  u,
                  f = this;
                return o(this, function (o) {
                  switch (o.label) {
                    case 0:
                      return (
                        (this.instance = l.RTCPeerConnection(this._config())),
                        (this.instance.onsignalingstatechange = function (e) {
                          switch (f.instance.signalingState) {
                            case 'stable':
                              f._negotiating = !1;
                              break;
                            case 'closed':
                              f.instance = null;
                              break;
                            default:
                              f._negotiating = !0;
                          }
                        }),
                        (this.instance.onnegotiationneeded = function (e) {
                          f._negotiating
                            ? s.default.debug(
                                'Skip twice onnegotiationneeded..'
                              )
                            : f.startNegotiation();
                        }),
                        (e = this.options),
                        [
                          4,
                          this._retrieveLocalStream().catch(function (e) {
                            return (
                              d.trigger(c.SwEvent.MediaError, e, f.options.id),
                              null
                            );
                          }),
                        ]
                      );
                    case 1:
                      return (
                        (e.localStream = o.sent()),
                        (t = this.options),
                        (n = t.localElement),
                        (r = t.localStream),
                        (i = void 0 === r ? null : r),
                        (a = t.screenShare),
                        (u = void 0 !== a && a),
                        l.streamIsValid(i)
                          ? ('function' == typeof this.instance.addTrack
                              ? i.getTracks().forEach(function (e) {
                                  return f.instance.addTrack(e, i);
                                })
                              : this.instance.addStream(i),
                            !0 !== u &&
                              (l.muteMediaElement(n),
                              l.attachMediaStream(n, i)))
                          : null === i && this.startNegotiation(),
                        [2]
                      );
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
                    return s.default.error('Peer _createOffer error:', e);
                  });
            }),
            (e.prototype._createAnswer = function () {
              var e = this;
              if (this._isAnswer()) {
                var t = this.options,
                  n = t.remoteSdp,
                  r = t.useStereo ? a.sdpStereoHack(n) : n,
                  o = l.sdpToJsonHack({ sdp: r, type: u.PeerType.Offer });
                this.instance
                  .setRemoteDescription(o)
                  .then(function () {
                    return e.instance.createAnswer();
                  })
                  .then(this._setLocalDescription.bind(this))
                  .then(this._sdpReady)
                  .catch(function (e) {
                    return s.default.error('Peer _createAnswer error:', e);
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
                n && (e.sdp = a.sdpStereoHack(e.sdp)),
                r && o && i && (e.sdp = a.sdpBitrateHack(e.sdp, r, o, i)),
                s.default.debug('calling setLocalDescription with SDP:', e.sdp),
                this.instance.setLocalDescription(e)
              );
            }),
            (e.prototype._sdpReady = function () {
              f.isFunction(this.onSdpReadyTwice) &&
                this.onSdpReadyTwice(this.instance.localDescription);
            }),
            (e.prototype._retrieveLocalStream = function () {
              return r(this, void 0, void 0, function () {
                var e;
                return o(this, function (t) {
                  switch (t.label) {
                    case 0:
                      return l.streamIsValid(this.options.localStream)
                        ? [2, this.options.localStream]
                        : [4, a.getMediaConstraints(this.options)];
                    case 1:
                      return (e = t.sent()), [2, a.getUserMedia(e)];
                  }
                });
              });
            }),
            (e.prototype._isOffer = function () {
              return this.type === u.PeerType.Offer;
            }),
            (e.prototype._isAnswer = function () {
              return this.type === u.PeerType.Answer;
            }),
            (e.prototype._config = function () {
              var e = this.options,
                t = e.iceServers,
                n = void 0 === t ? [] : t,
                r = e.iceTransportPolicy,
                o = {
                  iceTransportPolicy: void 0 === r ? 'all' : r,
                  sdpSemantics: 'unified-plan',
                  bundlePolicy: 'max-compat',
                  iceServers: n,
                };
              return s.default.info('RTC config', o), o;
            }),
            e
          );
        })();
      t.default = h;
    },
    function (e, t, n) {
      'use strict';
      var r,
        o =
          ((r = function (e, t) {
            return (r =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (e, t) {
                  e.__proto__ = t;
                }) ||
              function (e, t) {
                for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
              })(e, t);
          }),
          function (e, t) {
            function n() {
              this.constructor = e;
            }
            r(e, t),
              (e.prototype =
                null === t
                  ? Object.create(t)
                  : ((n.prototype = t.prototype), new n()));
          }),
        i = function (e, t, n, r) {
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
        s = function (e, t) {
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
          function a(i) {
            return function (a) {
              return (function (i) {
                if (n) throw new TypeError('Generator is already executing.');
                for (; s; )
                  try {
                    if (
                      ((n = 1),
                      r &&
                        (o =
                          2 & i[0]
                            ? r.return
                            : i[0]
                            ? r.throw || ((o = r.return) && o.call(r), 0)
                            : r.next) &&
                        !(o = o.call(r, i[1])).done)
                    )
                      return o;
                    switch (((r = 0), o && (i = [2 & i[0], o.value]), i[0])) {
                      case 0:
                      case 1:
                        o = i;
                        break;
                      case 4:
                        return s.label++, { value: i[1], done: !1 };
                      case 5:
                        s.label++, (r = i[1]), (i = [0]);
                        continue;
                      case 7:
                        (i = s.ops.pop()), s.trys.pop();
                        continue;
                      default:
                        if (
                          !((o = s.trys),
                          (o = o.length > 0 && o[o.length - 1]) ||
                            (6 !== i[0] && 2 !== i[0]))
                        ) {
                          s = 0;
                          continue;
                        }
                        if (
                          3 === i[0] &&
                          (!o || (i[1] > o[0] && i[1] < o[3]))
                        ) {
                          s.label = i[1];
                          break;
                        }
                        if (6 === i[0] && s.label < o[1]) {
                          (s.label = o[1]), (o = i);
                          break;
                        }
                        if (o && s.label < o[2]) {
                          (s.label = o[2]), s.ops.push(i);
                          break;
                        }
                        o[2] && s.ops.pop(), s.trys.pop();
                        continue;
                    }
                    i = t.call(e, s);
                  } catch (e) {
                    (i = [6, e]), (r = 0);
                  } finally {
                    n = o = 0;
                  }
                if (5 & i[0]) throw i[1];
                return { value: i[0] ? i[1] : void 0, done: !0 };
              })([i, a]);
            };
          }
        },
        a = function (e) {
          return e && e.__esModule ? e : { default: e };
        };
      Object.defineProperty(t, '__esModule', { value: !0 });
      var c = a(n(14)),
        u = n(8),
        l = a(n(12)),
        f = n(2),
        d = n(4),
        h = n(7),
        p = a(n(16));
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
            if (!(void 0 === t ? null : t))
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
                        h.localStorage.setItem(f.SESSION_ID, this.sessionid),
                        d.trigger(f.SwEvent.Ready, this, this.uuid)),
                      [2]
                    );
                }
              });
            });
          }),
          (n.prototype._onSocketMessage = function (e) {
            new p.default(this).handleMessage(e);
          }),
          n
        );
      })(c.default);
      t.default = v;
    },
    function (e, t, n) {
      'use strict';
      var r =
          (this && this.__assign) ||
          function () {
            return (r =
              Object.assign ||
              function (e) {
                for (var t, n = 1, r = arguments.length; n < r; n++)
                  for (var o in (t = arguments[n]))
                    Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
                return e;
              }).apply(this, arguments);
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
            function a(i) {
              return function (a) {
                return (function (i) {
                  if (n) throw new TypeError('Generator is already executing.');
                  for (; s; )
                    try {
                      if (
                        ((n = 1),
                        r &&
                          (o =
                            2 & i[0]
                              ? r.return
                              : i[0]
                              ? r.throw || ((o = r.return) && o.call(r), 0)
                              : r.next) &&
                          !(o = o.call(r, i[1])).done)
                      )
                        return o;
                      switch (((r = 0), o && (i = [2 & i[0], o.value]), i[0])) {
                        case 0:
                        case 1:
                          o = i;
                          break;
                        case 4:
                          return s.label++, { value: i[1], done: !1 };
                        case 5:
                          s.label++, (r = i[1]), (i = [0]);
                          continue;
                        case 7:
                          (i = s.ops.pop()), s.trys.pop();
                          continue;
                        default:
                          if (
                            !((o = s.trys),
                            (o = o.length > 0 && o[o.length - 1]) ||
                              (6 !== i[0] && 2 !== i[0]))
                          ) {
                            s = 0;
                            continue;
                          }
                          if (
                            3 === i[0] &&
                            (!o || (i[1] > o[0] && i[1] < o[3]))
                          ) {
                            s.label = i[1];
                            break;
                          }
                          if (6 === i[0] && s.label < o[1]) {
                            (s.label = o[1]), (o = i);
                            break;
                          }
                          if (o && s.label < o[2]) {
                            (s.label = o[2]), s.ops.push(i);
                            break;
                          }
                          o[2] && s.ops.pop(), s.trys.pop();
                          continue;
                      }
                      i = t.call(e, s);
                    } catch (e) {
                      (i = [6, e]), (r = 0);
                    } finally {
                      n = o = 0;
                    }
                  if (5 & i[0]) throw i[1];
                  return { value: i[0] ? i[1] : void 0, done: !0 };
                })([i, a]);
              };
            }
          },
        s =
          (this && this.__importDefault) ||
          function (e) {
            return e && e.__esModule ? e : { default: e };
          };
      Object.defineProperty(t, '__esModule', { value: !0 });
      var a = s(n(0)),
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
                                  'HTTP Request failed with status ' +
                                  e.status),
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
                          this.baseUrl + '/login/user',
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
                          this.baseUrl + '/login/guest',
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
                          this.baseUrl + '/refresh',
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
                          this.baseUrl + '/check-token',
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
  ])
);
