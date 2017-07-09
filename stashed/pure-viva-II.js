(function MakeApp() {

    return [].slice.call(arguments, 1).unspar().apply(0, true);

})(

// ========  ======== STAGE INIT ========  ======== //

    (function ImmediateNeeds() {
        return [].slice.call(arguments);
    })(
        (function ImmediateNeeds() {

            Array.prototype.apply = function(idx) {
                return this[idx||0].apply(undefined, this.slice((idx||0)+1));
            };
            Array.prototype.at = function(index) {
                return this.length && index < this.length ? this[index] : [];
            };
            Array.prototype.bind = function(f) {
                return Array.prototype.concat.apply([], this.map(f));
            };
            Array.prototype.flatmap = function(f) {
                return Array.prototype.concat.apply([], this.map(f));
            };
            Array.prototype.flatten = function() {
                return Array.prototype.concat.apply([], this.map(unit));
            };
            Array.prototype.prepend = function() {
                this.unshift.apply(this, [].slice.call(arguments));
                return this;
            };
            Array.prototype.insert = function(position) {
                this.push.apply(this, this.splice(0, position).concat([].slice.call(arguments, 1)).concat(this.splice(0)));
                return this;
            };
            Array.prototype.replace = function(position) {
                var args = [].slice.call(arguments, 1);
                args.push.apply(args, this.splice(position).slice(args.length));
                this.push.apply(this, args);
                return this;
            };
            Array.prototype.unspar = function() {
                this.push.apply(this, this.splice(0).filter(function(x) { return !(x === null || typeof x == 'undefined'); }));
                return this;
            };
            Array.prototype.append = function() {
                this.push.apply(this, [].slice.call(arguments));
                return this;
            };

            (self.unit = (function unit(t) {
                return t;
            }));
            (self.$const = (function $const(x) {
                return function() {
                    return x;
                }
            }));
            (self.pure = (function pure(t) {
                return function(f) {
                    return f(t);
                }
            }));

            Array.prototype.pure = function(idx, slice) {
                return typeof idx != 'undefined' &&
                    idx < this.length && this[idx] instanceof Function
                        ? this[idx](slice ? this.slice(idx+1) : this) : pure(this);
            };
            Array.pure = function() {
                return pure(Array.apply(arguments));
            };
            Array.of = function() {
                return [].slice.call(arguments);
            };
        })(),

        (function MakeSelf() {
            String.prototype.matches = String.prototype.match;
            String.prototype.$_like = new RegExp("([\\.\\\\\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:\\-])", "g");
            String.prototype.like = function(search) {
                if (typeof search !== 'string' || this === null) { return false; }
                search = search.replace(this.$_like, "\\$1");
                search = search.replace(/%/g, '.*').replace(/_/g, '.');
                return RegExp('^' + search + '$', 'gi').test(this);
            };
            String.prototype.trim = function(){
                return this.replace(/^\s+|\s+$/g, "");
            };
            String.prototype.toDash = function() {
                return this.length < 2 ? this.toLowerCase() : this.replace(/([A-Z])/g, function($1, p1, pos){return (pos > 0 ? "-" : "") + $1.toLowerCase();});
            };
            String.prototype.toCamel = function(){
                return this.length < 2 ? this.toLowerCase() : this.replace(/(^[a-z]{1}|\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
            };
            String.prototype.toTypeCode = function() {
                return [ '$', this.split('$').pop().toDash() ].join('');
            };
            String.prototype.toTypeName = function() {
                return this.replace('$', '').toDash();
            };
            Array.prototype.apply = function(idx, recur) {
                return this[idx||0].apply(undefined, this.slice((idx||0)+1));
            };
            self.isMobile = (function() {
                var check = false;
                (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
                return check;
            })();
            self.isWorker = (function() {
                var self = this; return (self.document === undefined);
            })();
            self.rafNext = 0;
            self.now = (function now(run) {
                return run();
            })(
                (function() {
                var perf = self.performance;
                if (perf && (perf.now || perf.webkitNow)) {
                    var perfNow = perf.now ? 'now' : 'webkitNow';
                    return perf[perfNow].bind(perf);
                }else { return Date.now; }
            }));
        })()
    ),

// ========  ======== STAGE MAKE ========  ======== //

    (function Factory() {
        return [].slice.call(arguments);
    })(
        (function BaseModel(dataStore, sysModel, sysControl, dispatcher) {

            var root = dataStore(sysModel());

            var scheduler = root.add('scheduler');
            scheduler.set('dispatcher', dispatcher);

            return (self.sys = sysControl(root, root.get('sys.model')));
        }),

        (function RootDataStore(model) {

            var Store   = model('store');
            var Storage = model('storage'); Storage.prototype.node = Store;

            var DB      = Store.prototype.storage = new Storage('db');
            var Root    = Storage.prototype.root  = new Store('root'); Root.set('storage', DB);

            Store.prototype.root = Root.ext('target')('get');

            Root.add('types');
            Root.add('sys').set('cntrl', {});
            Root.add('sys').set('model', model);
            Root.add('utils').ext('parse')(model('func.base'));

            var Queue  = model('queue');
            var Qmain  = Root.set('queue', new Queue('main'));

            var Stream = model('stream');
            Stream.elem = Stream.prototype.elem; Stream.prototype.elements = Root.add('elements');
            var Smain  = Root.set('stream', Stream.from.call(Stream.prototype, Qmain, 'queue'));
            return Root;
        }),

        (function BaseSysModel() {
            return {
                ctor: {
        (function Functor() {
            return {
                name: 'Functor',
                ctor: function ctor(mv) {
                    this.mv = mv;
                },
                ext: [
                    (function of() {
                        return this.constructor.of.apply(this.constructor, [].slice.call(arguments));
                    }),
                    (function lookup(item) {
                        return sys.of(sys.type(item || this.constructor.name));
                    }),
                    (function is(value) {
                        return typeof value == 'undefined' ? (this.isFunctor || this.ctor instanceof Functor || this instanceof Functor) : (value.isFunctor || value instanceof Functor);
                    }),
                    (function map(f) {
                        return new this.constructor(this.mv.map ? this.mv.map(f) : f(this.mv));
                    }),
                    (function join() {
                        return this.mv;
                    }),
                    (function chain(f) {
                        return this.map(f).join();
                    })
                ],
                attrs: [
                    (function of(x) {
                        return new this(x);
                    }),
                    (function $of() {
                        var ctor = this;
                        return function() {
                            return ctor.of.apply(ctor, arguments);
                        }
                    })
                ]
            };
        }),
        (function Maybe() {
            return {
                name: 'Maybe',
                parent: 'Functor',
                ctor: function(x, a) {
                    if (x || typeof x != 'undefined')
                        this.mv = !a && x instanceof Function && x.length > 1 ? this.curry(x) : x;
                },
                ext: [
                    (function $isNothing(v) {
                        return v === null || v === undefined || v === false;
                    }),
                    (function isNothing() {
                        return this.mv === null || this.mv === undefined || this.mv === false;
                    }),
                    (function chain(mf) {
                        return this.isNothing() || !mf || !(mf instanceof Function) ? null : mf.call(this, this.mv);
                    }),
                    (function orElse(mv) {
                        return this.isNothing() ? new this.constructor(mv instanceof Function ? mv() : mv) : this;
                    }),
                    (function map(mf) {
                        return new this.constructor(this.chain(mf), true);
                    }),
                    (function run(f) {
                        if (this.mv.isFunctor && this.mv.run) {
                            return this.mv.map(sys.of).run(f);
                        }else {
                            return this.chain(f || unit);
                        }
                    }),
                    (function lift(f) {
                        return this.map(function(v1) {
                            return function(v2) {
                                return f(v1, v2);
                            }
                        });
                    }),
                    (function ap(other) {
                        return this.isFunctor(other) ? other.map(this.mv) : this.of(other).map(this.mv);
                    }),
                    (function apply(other) {
                        return other.ap(this);
                    }),
                    (function unit() {
                        return this.mv;
                    }),
                    (function join() {
                        return this.mv;
                    })
                ],
                attrs: [
                    (function of(x) {
                        return new this(x);
                    }),
                    (function pure(x) {
                        return new this(x, true);
                    }),
                    (function $of() {
                        var ctor = this;
                        return function() {
                            return ctor.of.apply(ctor, arguments);
                        }
                    })
                ]
            };
        }),
        (function IO() {
            return {
                name: 'IO',
                parent: 'Functor',
                ctor: function(f) {
                    this.unsafePerformIO = f;
                },
                ext: [
                    (function fn(f) {
                        return new this.constructor(f);
                    }),
                    (function of(x) {
                        return new this.constructor(function() {
                          return x;
                        });
                    }),
                    (function join() {
                        var thiz = this;
                        return this.fn(function() {
                          return thiz.unsafePerformIO().unsafePerformIO();
                        });
                    }),
                    (function bind(f) {
                        var thiz = this;
                        return this.fn(function(v) {
                          return f(thiz.unsafePerformIO()).run(v);
                        });
                    }),
                    (function run() {
                        return this.unsafePerformIO.apply(this, arguments);
                    }),
                    (function ap(monad) {
                        return monad.map(this.unsafePerformIO);
                    }),
                    (function map(f) {
                        var thiz = this;
                        return this.fn(function(v) {
                          return f(thiz.unsafePerformIO(v));
                        });
                    }),
                    (function lift(f) {
                        return this.map(function(v) {
                          return f(v);
                        });
                    }),
                    (function pipe(f) {
                        return this.fn(this.$fn(this.unsafePerformIO)(f));
                    }),
                    (function() {
                        function run(IO) {
                            return (function(v) { return IO.run(v); });
                        };
                        return function wrap(fn) {
                            return this.$fn(run(this))(fn || IO.of);
                        };
                    })()
                ],
                attrs: [
                    (function of(x) {
                        return new this(function() {
                          return x;
                        });
                    }),
                    (function pure(x) {
                        return x instanceof Function ? new this(x) : this.of(x);
                    })
                ]
            };
        }),
        (function Continuation() {
            return {
                name: 'Cont',
                parent: 'Compose',
                ctor: function(x, f) {
                    if (x) this.mv = this.$cast(x);
                    if (f) this.mf = f;
                },
                ext: [
                    'mf', 'utils.pure',
                    (function cast(pure) {
                        return function $cast(v, p) {
                            if (v && v.isFunctor && v.cont) {
                                return v.cont();
                            }else {
                                return v && v instanceof Function && (p || v.name == 'pure') ? v : pure(v);
                            }
                        }
                    }),
                    (function $pure(f) {
                        return this.mf.name == this.constructor.prototype.mf.name ? f : this.$fn(this.mf)(f);
                    }),
                    (function cont() {
                        return this.$cont(this.mv, this.mf);
                    }),
                    (function $map(f) {
                        return function(v) {
                          return v && v.name == 'pure' && f.name != 'pure' ? v(f) : f(v);
                        }
                    }),
                    (function map(f) {
                        return new this.constructor(this.mv, this.$fn(this.$pure(this.$map(f)))(this.$cast));
                    }),
                    (function $bind(mv, mf) {
                        return new this.constructor(mv, this.$fn(mf)(this.$cast));
                    }),
                    (function bind(f) {
                        return this.$bind(this.cont(), f);
                    }),
                    (function chain(k) {
                        return this.cont()(k || unit);
                    }),
                    (function run(k) {
                        return this.chain(k);
                    }),
                    (function fmap() {
                        return this.bind(this.of.bind(this));
                    }),
                    (function ap(other) {
                        return this.map(function(result) {
                            return other.ap(other.isFunctor(result) ? result : other.of(result));
                        });
                    }),
                    (function apply(other) {
                        return other.ap(this);
                    }),
                    (function lift(m) {
                        return this.bind(function(result) {
                            return m.run(result);
                        });
                    })
                ],
                attrs: (function(val, cont, of, $of) {
                    return [
                        of,
                        $of,
                        (function fromCallback(cb, mf) {
                            return this.of(mf ? cont(cb, mf) : val(cb));
                        })
                    ];
                })(
                    (function of(x, f) {
                        return new this(x, f);
                    }),
                    (function $of() {
                        var ctor = this;
                        return function() {
                            return ctor.of.apply(ctor, arguments);
                        }
                    })
                )
            };
        })

                    store: function Store(opts) {
                        this.store.call(this, opts || {});
                    },
                    storage: function Storage(opts) {
                        this.store.call(this, opts || {});
                    },
                    stream: function Stream(opts) {
                        this.store.call(this, opts);
                        this.handlers = [];

                        var args = [].slice.call(arguments), o, s, k, t, i, p, n, e;
                        if (args.length == 1 && typeof args[0] == 'object') {
                            o = args.shift();
                            s = o.s || o.stream;
                            k = o.k || o.handler;
                            t = o.t || o.throttle;
                            i = this.i = o.i || o.id;
                            p = this.p = o.p || o.path;
                            n = this.n = o.n || o.node;
                            e = this.e = o.e || o.elem;
                        }else {
                            s = args.shift(); k = args.shift(); t = args.shift();
                        }
                        if (s) this.mv = s;
                        else this.mv = this.stream('fromCallback');
                        this.sink = this.sink(s, k);
                        this.push = this.sink.run;
                    },
                    queue: function Queue(opts) {
                        this.store.call(this, opts || {});

                        var queue = this._queue = this.add('queue');
                        queue.set('pending', []);
                        queue.set('running', []);
                        queue.set('done',    []);

                        return queue;
                    },
                    signal: function Signal(ref) {
                        this._state = 'new';
                        this._value = null;
                        this._refer = ref;
                        this._done  = [];
                    },
                    scheduler: function Scheduler(opts) {
                        this.store.call(this, opts || {});
                    }
                },
                func: {
                    base: [
                        (function maybe(m) {
                            return function(l) {
                                return function(r) {
                                    return m(l)(r);
                                }
                            }
                        }),
                        (function tuple(a) {
                            return function(b) {
                                return function(f) {
                                    return f(a)(b);
                                }
                            }
                        }),
                        (function pure(t) {
                            return function pure(f) {
                                return f(t);
                            }
                        }),
                        (function unit(t) {
                            return t;
                        }),
                        (function getArgs(func) {
                            // Courtesy: https://davidwalsh.name/javascript-arguments
                            var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];
                            return args.split(',').map(function(arg) {
                                return arg.replace(/\/\*.*\*\//, '').trim();
                            }).filter(function(arg) { return arg; });
                        }),
                        (function prop(key) {
                            return function(obj) {
                                return !obj ? void 0 : (obj[key] instanceof Function ? obj[key]() : obj[key]);
                            };
                        }),
                        (function extract(fn) {
                            return fn(unit);
                        }),
                        (function from(obj) {
                            return function(fn, alt) {
                                var callable = alt && alt[fn] ? alt : (obj[fn] ? obj : null);
                                return function() {
                                    return callable ? callable[fn].apply(callable, arguments) : null;
                                }
                            };
                        }),
                        (function tap(f) {
                            return function tap(a) {
                                return unit(a, f(a));
                            };
                        }),
                        (function $tapToConsole($tap) {
                            var run = $tap(console.log.bind(console));
                            return function tapToConsole(x) {
                                return run(x);
                            }
                        }),
                        (function _1(f) {
                            return function(t) {
                                return f(t);
                            };
                        }),
                        (function atom(f, t) {
                            return function() {
                                return f(t);
                            };
                        }),
                        (function lazy(v) {
                            return function() {
                                return v();
                            }
                        }),
                        (function get(obj, key) {
                            return obj && obj[key]
                                ? (obj[key] instanceof Function ? obj[key]() : obj[key])
                                     : null;
                        }),
                        (function wrap(pre, post) {
                            return function wrap(f, i) {
                                return pre(f, i, post);
                            }
                        })(
                            (function(f, i, p) {
                                return function(x, n) {
                                    i.runcount++; 
                                    if (!i.maxdepth || ((i.depth - i.base) < i.maxdepth)) {
                                        i.depth++;
                                        return p(f(x), i);
                                    }else {
                                        return x.pure ? x.pure() : pure(x);
                                    }
                                }
                            }),
                            (function(r, i) {
                                i.depth--; i.mapcount+=r.length; return r;
                            })
                        )
                    ],
                    fn: [
                        (function curry(fn, bound, numArgs, countAllCalls) {
                            if (((numArgs = numArgs || fn.length) < 2)) return fn;
                            else if (!bound && this != self) bound = this;

                            var countAll = countAllCalls !== false;
                            return function f(args) {
                                return function $_curry() {
                                    var argss = [].slice.apply(arguments);
                                    if (countAll && !argss.length) argss.push(undefined);
                                    if ((args.length + argss.length) === numArgs) {
                                        return fn.apply(bound, args.concat(argss));
                                    }else {
                                        return f(args.concat(argss));
                                    }
                                }
                            }([]);
                        })
                    ],
                    core: [
                        (function objpath(name, target, value) {
                            var parts = name.split('.');
                            var curr  = target || self;

                            for (var part; parts.length && (part = parts.shift());) {
                                if (!parts.length && value !== undefined) {
                                    curr[part] = value;
                                } else if (part in curr) {
                                    curr = curr[part];
                                } else if (parts.length && value !== undefined) {
                                    curr = curr[part] = {};
                                } else {
                                    curr = null;
                                    break;
                                }
                            }
                            return curr;
                        }),
                        (function ext(extension) {
                            return function(name) {
                                return extension[name] && extension[name] instanceof Function
                                    ? extension[name](this) : extension[name];
                            }
                        }),
                        (function extend(target, source) {
                            var hasOwnProperty = Object.prototype.hasOwnProperty;
                            for (var propName in source) {
                                if (hasOwnProperty.call(source, propName)) {
                                    target[propName] = source[propName];
                                }
                            }
                            return target;
                        }),
                        (function $named(run) {
                            return function named(codeOrName) {
                                var code = codeOrName.toTypeCode(), name = codeOrName.toCamel();
                                return run(function($$__purejs) {
                                    var script = document.createElement('script');
                                    script.innerHTML = '$$__purejs.push((function Make'+name+'() { return function '+name+'() { this.id(); this.ctor.apply(this, arguments); if (this.__level__ && !(this.__level__ = 0)) this.__super__.call(this);  }; })())';
                                    var headel = document.getElementsByTagName('head')[0];
                                    headel.appendChild(script);
                                    headel.removeChild(script);
                                    return $$__purejs.pop();//self['$$__purejs'].pop();
                                });
                            }
                        })(
                            (function() {
                                var val = $$__purejs = [];
                                return function tmp(fn) {
                                    return fn($$__purejs);
                                }
                            })()
                        )
                    ],
                    ext: [
                        (function MakeAP() {
                            return [].slice.call(arguments).apply();
                        })(
                            (function $ap(tmpl, make) {
                                return function ap(spec) {
                                    return make(tmpl(spec));
                                }
                            }),
                            (function(spec) {
                                return function ap(f) {
                                    return Array.of(this.ap(spec.map(f || spec.def)));
                                };
                            }),
                            (function(spec) {
                                function map(x, f) {
                                    return Array.prototype.concat.apply([], spec.map(x, f));
                                };
                                function bind(f) {
                                    function bound(x) {
                                        return x instanceof Array ? spec.bind(x, bound) : f(x);
                                    };
                                    return bound;
                                };
                                return spec.map;
                            })
                        ),
                        (function(nativeKeys, nativeHas) {
                            return function keys(obj) {
                                if (typeof obj != 'object') return [];
                                if (obj instanceof Array) return obj.map(function(v, i) {
                                    return v && v.name ? v.name : i;
                                });
                                else if (obj.keys && obj.keys instanceof Function) return obj.keys();
                                else if (nativeKeys) return nativeKeys(obj);
                                var keys = [];
                                for (var key in obj) if (nativeHas.call(obj, key)) keys.push(key);
                                if (hasEnumBug) collectNonEnumProps(obj, keys); // Ahem, IE < 9.
                                return keys;
                            };
                        })(Object.keys, Object.hasOwnProperty),
                        (function $values($keys) {
                            return function values(obj, fn) {
                                var kys = $keys(obj),
                                vals = [], useget = obj.get && obj.get instanceof Function,
                                func = fn || unit, usekeys = obj instanceof Array ? false : true;
                                for (var i = 0; i < kys.length; i++) {
                                    vals.push(func(useget ? obj.get([kys[i]]) : (usekeys ? obj[kys[i]] : obj[i]), usekeys ? kys[i] : i));
                                };
                                return vals;
                            }
                        }),
                        (function identifier() {
                            function calcOnce(node) {
                                var path = [], parent = node;
                                while ((parent = parent._parent)) {
                                    path.unshift(parent._cid);
                                };
                                path.push(node._cid);
                                if (node._cache) return (node._cache.identifier = path.slice(node._offset));
                                return path.slice(node._offset);
                            };
                            return function identifier(asArray, reCalc) {
                                var path = this._cache && this._cache.identifier && !reCalc ? this._cache.identifier : calcOnce(this);
                                return asArray === true ? path : path.join(typeof asArray == 'string' ? asArray : '.');
                            };
                        })(),
                        (function path(full, quick) {
                            return function path(node) {
                                return function(key, value, asArray) {
                                    return quick(full, node, key, value, asArray);
                                }
                            };
                        })(
                            (function full(node) {
                                return function(path, value) {
                                  var org  = path.slice(0),
                                      pos  = path.indexOf('.'), key, sub,
                                      test = node, nref = test, fn = false;
                                  while(pos>0 && nref && node.is(nref)) {
                                    key = path.substr(0, pos);
                                    if (key.substr(0, 1) == '_' && nref[key]) {
                                      key = nref[key];
                                    }else if (key.substr(0, 1) == '%') {
                                      key  = key.substr(1);
                                      path = path.substr(1);
                                      if (key.substr(-1) == '%') {
                                        sub  = nref.get(key.substr(-1));
                                        key  = sub || key;
                                      }else {
                                        sub  = path.substr(0, path.indexOf('%'));
                                        path = path.substr(sub.length);
                                        key  = nref.get(sub) || key;
                                      }
                                    }
                                    if (key == 'root') {
                                      nref = test = node.root;
                                    }else if (key == 'parent' && nref._parent) {
                                      nref = test = nref.parent();
                                    }else if (key == 'fn') {
                                      fn = key;
                                    }else if (fn && nref[fn] && (fn = nref.fn(fn))) {
                                      var result = fn(key);
                                      if (!result || !(result instanceof Function)) return result;
                                      else if (path.substr(-2) == '()') return result();
                                      else if (path.length > key.length) return result(path.slice(pos+1));
                                      return result;
                                    }else if ((test = nref.get(key))) {
                                      if (node.is(test)) nref = test;
                                    }
                                    path = path.slice(pos+1);
                                    if (path.length) {
                                      pos = path.indexOf('.');
                                      if (nref && nref.role && nref.role('store').index(path) >= 0) break;
                                      else if (test && !node.is(test) && typeof test == 'object' && (test = test[path.substr(0, pos)]) && node.is(test)) {
                                        nref = test; path = path.slice(pos+1); pos = path.indexOf('.'); continue;
                                      }else if (test && node.is(test) && test.get(path)) break;
                                    }else {
                                      break;
                                    }
                                  }
                                  if (fn && nref[fn] && (fn = nref.fn(fn))) {
                                    if (path.substr(-2) == '()') {
                                      var result = fn(path.replace('()', ''));
                                      if (result && result instanceof Function) return result();
                                    }else {
                                      return fn(path);
                                    }
                                  }else if (false && pos < 0 && nref && nref._cid == path && typeof value == 'undefined') {
                                    return nref;
                                  }else {
                                    return typeof value == 'undefined' ? nref.get(path) : nref.update(path, value, node, org);
                                  }
                                }
                            }),
                            (function quick(full, node, key, value, asArray) {
                                var parts = typeof key == 'string' ? key.split('.') : key.slice(0), part, test;
                                while (parts.length > 1 && (part = parts[0])) {
                                  if (part == 'root' && parts.shift()) {
                                    test = node.root;
                                  }else if (part == 'fn' && parts.length > 1 && node[parts[1]]) {//node[!node.has(part)) {
                                    return full(node)(parts.join('.'), value);
                                  }else if (part == 'parent' && node._parent && parts.shift()) {
                                    test = node.parent();
                                  }else if (part == '*') {
                                    return node.get(parts.splice(0).join(''));
                                  }else {
                                    test = node.get(parts.shift());
                                  }
                                  if (test && node.is(test)) node = test;
                                  else break;
                                };
                                if (parts.length > 1) return;
                                else part = parts.shift();
                                return test ? (node.is(test) ? test.acc(part, value) : test[part]) : undefined;
                            })
                        ),
                        (function $parse($keys, $values) {
                            function run(node, data, recur, ctor) {
                                var keyss = $keys(data), valss = $values(data), value, key;
                                while (keyss.length) {
                                    value = valss.shift(), key = keyss.shift();
                                    if (recur && typeof value == 'object' && key != 'args') {
                                        if (value instanceof Array && key == node._children) {
                                            var items = node.node(key);
                                            value.map(function(v) {
                                                return items.child(v, ctor || node.constructor);
                                            });
                                        }else if (node.is(value)) {
                                            node.set(value.cid(), value);                                   
                                        }else {
                                            run(node.child(key, ctor), value, typeof recur == 'number' ? (recur - 1) : recur, ctor);
                                        }
                                    }else if (typeof key == 'number' && value instanceof Array && value.length == 2 && typeof value[0] == 'string') {
                                        node.set(value[0], value[1]);
                                    }else {
                                        node.set(key, value);
                                    }
                                }
                                return node;
                            };
                            return function parse(node) {
                                return function() {
                                    var args = [].slice.call(arguments);
                                    if (args.length < 3 && args[args.length-1] instanceof Function) {
                                        return run(node, args.shift(), false, args.pop());
                                    }else {
                                        args.unshift(node);
                                        return run.apply(undefined, args);
                                    }
                                }
                            };
                        }),
                        (function target(obj) {
                            return function(fn) {
                              return function() {
                                var args = Array.prototype.slice.call(arguments);
                                return !obj ? null : (!fn ? obj :
                                  (fn instanceof Function ? fn.apply(obj, args) :
                                    (obj && obj[fn] && obj[fn].apply ? obj[fn].apply(obj, args) : null)));
                              };
                            };
                        })
                    ],
                    klass: [
                        (function makeID() {
                            var counter = { cid: 100000 };
                            return function id() {
                                return (this._id = counter.cid++);
                            }
                        }),
                        (function is(value) {
                            return value && value instanceof this.constructor ? true : false;
                        }),
                        (function $super() {
                            if (this.__level__) this.__parent__[--this.__level__].ctor.apply(this, [].slice.call(arguments));
                            if (!this.__level__) this.__super__ = function(fn) { return this.__parent__[this.__parent__.length-1][fn].apply(this, [].slice.call(arguments, 1)); };
                        })
                    ],
                    array: [
                        (function pure(idx, slice) {
                            return typeof idx != 'undefined' &&
                                idx < this.length && this[idx] instanceof Function
                                    ? this[idx](slice ? this.slice(idx+1) : this) : pure(this);
                        }),
                        (function make() {
                            return this.length ? this.map(function(v) {
                                return v instanceof Array ? v.make() : (v.name && v.name.slice(-4) == 'pure' ? v : pure(v));
                            }) : pure(this);
                        }),
                        (function wrap(fn) {
                            return (fn || $const)(this);
                        }),
                        (function fold(f, x) {
                            function _fold(f, s, array) {
                                var i = 0;
                                while(i<array.length) {
                                    s = f(s, array[i], i++, array);
                                }
                                return s;
                            }
                            return [ pure(f), pure(x || []), this.collect() ].lift(_fold);
                        })
                    ],
                    store: [
                        (function uid() {
                            return this._id;
                        }),
                        (function cid() {
                            return this._cid || this._id;
                        }),
                        (function of(opts) {
                            return this.storage.child(this, opts);
                        }),
                        (function extract(item) {
                            return item ?
                                item.name || item.cid || item.id || item._id
                                    || (typeof item == 'string' ? item : this.id()) : this.id();
                        }),
                        (function store(opts) {
                            opts || (opts = {});
                            typeof opts == 'object' || (opts = { name: opts });

                            this._val = [];
                            this._map = {};
                            this._ids = [];
                            this._ref = opts.ref || this;
                        }),
                        (function emit() {
                            // NOOP //
                        }),
                        (function add(name) {
                            return this.set(this.extract(name), this.of(name));
                        }),
                        (function get(key) {
                            if (key && typeof key == 'string' && (this._map[key]>=0)) return this._val[this._map[key]];
                            //else if (key && typeof key == 'string' && key.substr(0, 1) == '*') return this.values(key.substr(-1, 1) == '!' ? true : (key.length - 1));
                            else if (key && typeof key == 'number') return key >= 0 && key < this._val.length ? this._val[key] : undefined;
                            else if (key && key.indexOf && key.indexOf('.') > 0) return this.ext('path')(key);
                            else if (key && key instanceof Array) return key.length > 1 ? this.ext('path')(key) : this.get(key.slice(0).shift())
                            else return key ? undefined : (this._ref || this);
                        }),
                        (function keys() {
                            return this._ids;
                        }),
                        (function __get(key) {
                            return this.get(key);
                        }),
                        (function set(key, value) {
                            return key && key.indexOf && key.indexOf('.') > 0 ? this.ext('path')(key, value)
                            : (this._val[(this._map[key] >= 0
                                && !this.emit('change', key, 'update', value) ? this._map[key]
                            : (
                                this._map[this.emit('change', key, 'create', value)||key] = this._ids.push(key)-1))] = value);
                        }),
                        (function __set(key, value) {
                            return this.set(key, value);
                        }),
                        (function acc(key, value) {
                            return value ? this.set(key, value) : this.get(key);
                        }),
                        (function val(key, value, asArray) {
                            if (!key && typeof key != 'string') {
                                return this;
                            }else if (typeof value != 'undefined') {
                                if (this._map[key] >= 0) return this.set(key, value);
                                else return this.insert(key, val);
                            }else if (key && value && typeof value == 'undefined') {
                                return this._val[(this._map[this._ids[(this._ids.push(key)-1)]] = this._val.push(asArray ? [ value ] : value) - 1)];
                            }else {
                                return key ? this._val[this._map[key]] : this;
                            }
                        }),
                        (function values(recur) {
                            var node = this;
                            return node._val.reduce(function(result, value, index) {
                                result[node._ids[index]] = recur && node.is(value)
                                    ? value.values(typeof recur == 'number' ? (recur - 1) : recur) : value;
                                return result;
                            }, {});
                        })
                    ],
                    storage: [
                        (function of(opts) {
                            return new this.constructor(opts);
                        }),
                        (function make(name) {
                            var str = this.extract(name);
                            if (this.is(name)) {
                                return this.add(name);
                            }else {
                                return this.set(str, new this.node(str));
                            }
                        }),
                        (function child(parent, name) {
                            var ref = this.make('meta');
                            ref.set('storage', this.uid());
                            ref.set('parent', parent.uid());
                            var add = this.make(name);
                            ref.set('child',  add.uid());
                            return add;
                        })
                    ],
                    push: [
                        (function insert(id, val, asArray) {
                            var node = this,
                            curridx = node._map[id],
                            currval = node._val[curridx],
                            isArr = currval instanceof Array,
                            index = 0;
                            if (asArray && id && typeof val == 'undefined') {
                                return node._val.push(val);
                            }else if (node._map[id] >= 0) {
                                if (asArray && currval.isNode) {
                                    node.emit('change', id, 'push', currval);
                                    return currval.push(id, val);
                                }else if (asArray && !isArr) {
                                    currval = (node._val[node._map[id]] = [ currval ]); isArr = true;
                                }
                                if (isArr) {
                                    if (currval.length && (index = currval.indexOf(val)) >= 0) return index;
                                    index = val instanceof Array ? currval.push.apply(currval, val) : currval.push(val);
                                    node.emit('change', id, 'push', currval);//asArray ? [ val ] : val);
                                    return val;
                                }
                            }else {
                                var newval = node._val[(node._map[node._ids[(node._ids.push(id)-1)]] = node._val.push(!asArray || val instanceof Array ? val : [ val ]) - 1)];
                                node.emit('change', id, 'create', asArray ? newval.slice(-1) : newval);
                                return newval;
                            }
                        }),
                        (function push(key, value, asArray) {
                            if (key && key.indexOf && key.indexOf('.') > 0) {
                                var parts = key.split('.'), node = this.path(parts, value, asArray);
                                if (typeof node == 'number') return node;
                                else return this.insert(parts.join('.'), value, asArray);
                            }else {
                                return this.insert(key, value, asArray);
                            }
                        }),
                        (function splice(key, idx, num) {
                            var index, pos = 0, prop, value, node;
                            if ((index = this._map[key]) >= 0) {
                                prop = this._val[index];
                                if (prop instanceof Array && prop.length) {
                                    num || (num = typeof idx == 'undefined' ? prop.length : 1);
                                    value = prop.splice(idx || 0, num);
                                    this.emit('change', key, 'remove', num == 1 ? value[0] : value);
                                    return value;
                                }
                            }else if ((prop = this.get(key))) {
                                var node = this.get(key.substr(0, ((pos = (key+'.').indexOf('.')))));
                                if (node) return node.splice(key.slice(pos+1), idx, num);
                            }else {
                                return this.set(key, []);
                            }
                        }),
                        (function pop(key, idx, num) {
                            return this.splice(key, idx || (this.get(key) || []).length, num || 1);
                        }),
                        (function shift(key, num) {
                            return this.splice(key, 0, num || 1);
                        })
                    ],
                    queue: [
                        (function schedule() {
                            
                        }),
                        (function enqueue(item) {
                            if (this._queue.push(item) == 1) {
                                this.schedule();
                            }
                            return this;
                        }),
                        (function bind(identifier) {
                            var sig = this.signal(identifier);
                            return sig;
                        }),
                        (function signal(identifier) {
                            var sig = this.make(identifier);
                            // store sig registration
                            return sig;
                        })
                    ],
                    signal: [
                        (function handle(value, state) {
                            if (this._state == 'resolved') {
                                // now what??
                            }else {
                                this._state = 'resolved';
                                this._value = value;
                                this._done.run();
                            }
                        }),
                        (function resolve(value) {
                            return this.handle('resolved', value);
                        }),
                        (function cancel(message) {
                            return this.handle('cancelled', message);
                        }),
                        (function error(e) {
                            return this.handle('error', e);
                        })
                    ],
                    scheduler: {
                        async: [
                            (function _$_collect(run, next, enqueue) {
                                return (Array.prototype.$collect = function(xs) {
                                    return function pure(succ, fail) {
                                        return enqueue(next(xs, run(0, xs.map($const(undefined)), succ, fail)));
                                    }
                                });
                            }),
                            (function run(count, values, succ, fail) {
                                return function(x, i) {
                                    x(function(result) {
                                        values[i] = result;
                                        count++;
                                        if (count == values.length) {
                                            succ(values);
                                        }
                                    }, fail);
                                }
                            }),
                            (function next(x, f) {
                                var i = 0;
                                return function() {
                                    if (x.length) {
                                        f(x.shift(), i++);
                                    }
                                    return !x.length;
                                }
                            })
                        ],
                        threads: [
                            (function $makeRun() {
                                var totCount = 0, runCount = 0;

                                function run(threads, timeLimit, info) {  
                                    var thread, free, instruction, next, frameTime = 0,
                                    start = info.ts, again = threads && threads.length,
                                    currCount = 0; runCount++;

                                    while (again && ++totCount) {

                                        (again = ((
                                            (
                                                (thread = threads.shift())
                                                    && (free = thread.run ? thread.run(currCount) : thread(currCount))
                                                    && (!free.pure)
                                                    && (instruction = free.value)
                                                    && (next = instruction.next)
                                                )

                                                && (((instruction.cf.ps9)
                                                    && (threads.push.apply(threads, next)))
                                                    || ((instruction.cf.us0 && instruction.cf.ps1)
                                                    && (threads.unshift(next[0]))
                                                    && (threads.push.apply(threads, next.slice(1))))
                                                    || ((instruction.cf.us9)
                                                    && (threads.unshift.apply(threads, next)))
                                                    )
                                                ) || true)

                                            && ((frameTime = ((info.rs = self.now()) - start)) < timeLimit)
                                            && !(info.suspend = instruction.cf.susp)
                                            && threads.length
                                            && ++currCount
                                        );
                                    }
                                    return threads.length;
                                }
                                return run;
                            })(),
                            (function makeTimer(scheduler, wrapper, runner) {

                                return function(nextTick, timeOut, topLvlLst, pendingLst) {
                                    var node = scheduler.get(nextTick);
                                    return (node.runThreads = wrapper(
                                        runner,
                                            typeof nextTick == 'string' ? node.enqueue : nextTick,
                                            timeOut ? (typeof timeOut == 'string' ? scheduler.get(timeOut) : timeOut) : false,
                                                topLvlLst || (topLvlLst = []),
                                                    pendingLst || (pendingLst = [])
                                        )
                                    );
                                }
                            })
                        ]
                    },
                    functor: [
                        (function lazyValue(value) { return (function() { return value; }); }),

                        (function lazyFunction(fn) { return (function() { return fn(); }); }),

                        (function bindLazy(value, f) {
                            return function() {
                                return f(value())();
                            };
                        }),
                        (function $makeThread(pure) {
                            return function makeThread(value) {
                                return function() { return pure(value); };
                            };
                        })
                    ],
                    stream: [

                        (function from() {
                            var args = [].slice.call(arguments);
                            var type = args[args.unshift('fromEvent')*0];
                            var node = this.elem.apply(this, args); args.shift();
                            var elem = args.shift();
                            var name = args[0];
                            var list = node.get(type);
                            var path = node.cid();
                            return node.get('stream') || node.set('stream', new this.constructor({
                                s: list, p: path, n: node, e: ''+this.id(elem), i: type
                            }));
                        }),
                        (function sink(s, k) {
                            var sink;
                            if (s && k) sink = s((this.k = k));
                            else if (s) sink = s((this.k = this.run.bind(this)));
                            return sink instanceof Function ? { run: sink } : sink;
                        }),
                        (function run(value) {
                            return this.handlers.slice(0).bind(function(handler) {
                                handler.run(value);
                            });
                        }),
                        (function id(elem) {
                            if (!elem) return '';
                            else if (typeof elem == 'string') return elem;
                            else if (typeof elem == 'number') return ''+elem;
                            else if (!elem.id || elem.id instanceof Function) return ''+(elem._id || '');
                            return ''+(elem.id|| '');
                        }),
                        (function elem(/* type, elem, name */) {
                            var args = [].slice.call(arguments), type = args.shift();
                            var elem = args[0], name = args[1], id = this.id(elem), node, item;
                            if (!id || !(node = this.elements.get(id)) || !(node = node.get(name)) || !(node.get(type))) {
                                id || (id = ''+this.elements.id());
                                node = this.elements.add({ name: id, id: id }).add(name);
                                item = this.stream(type);
                                if (!this.id(elem)) elem.id = id;
                                node.set(this.extract(type), args.length ? item.apply(undefined, args) : item(elem));
                            }
                            return node;
                        }),
                        (function stream(type) {
                            return pure;
                        }),
                        (function type(args) {
                            return 'event';
                        }),
                        (function add(/* element, selector, handler, throttle */) {
                            var args     = [].slice.call(arguments);
                            var element  = args.shift();
                            var throttle = args.length && typeof args[args.length-1] == 'number' ? args.pop() : 0;
                            var handler  = args.pop();
                            var name     = args[args.unshift(this.i)*0];
                            var node     = this.elem(element, name);
                            var list     = node.get('eventListener');
                            var stream   = new this.constructor({
                                s: list.apply(undefined, args), e: this.$elemid(element), k: handler, i: this.i, n: this.n, p: args.join('.')
                            });
                            this.handlers.push(stream.handler(throttle));
                            return stream;
                        }),
                        (function map(stream, f) {
                            return function(continuation) {
                                stream(function(value) {
                                    continuation(f(value));
                                });
                            };
                        }),
                        (function filter(stream, f) {
                            return function(continuation) {
                                stream(function(value) {
                                    if (f(value)) {
                                        continuation(value);
                                    }
                                });
                            };
                        })
                    ]
                },
                model: {
                    store: [
                        'get', 'set', '__get', '__set', 'acc', 'val'
                    ],
                    parents: {
                        storage: 'store', queue: 'store',
                        scheduler: 'storage', stream: 'store'
                    },
                    array: {
                        proto: [
                            'fmap', 'collect', 'bind',    'chain',   'run',
                            'lift', 'select',  'first',   'combine', 'at',
                            'fold', 'apply',   'flatmap', 'flatten'
                        ],
                        factory: [

                        ]
                    }
                },
                types: {

                },
                factory: {
                    update: function(func, newFunc) {
                        var cur = this.model.find('func', 'ext');
                        var idx = cur.indexOf(func);
                        if (idx >= 0) cur.replace(idx, newFunc);
                        return newFunc;
                    },
                    load: function(func) {
                        var getArgs = this.model.find('func', 'base', 'getArgs');
                        var rawName = func.name;

                        // we need to call the function the number of trailing dollar signs times
                        var count = rawName.length - rawName.replace('$', '').length, index = 0;
                        var argss = [], times = 0, newName = '', newFunc = func, newArgs = [];
                        while (count && count--) {
                            if((argss = getArgs(func)) && (times  = argss.length)) {
                                newArgs = [];
                                while (argss.length) {
                                    if (argss[0].substr(0, 1) != '$')
                                        { argss.shift(); continue; }

                                    newName = argss[0].slice(1);
                                    if ((newFunc = this.model.find('func', 'ext', newName))) {
                                        newArgs.push(newFunc);
                                    }else if ((newFunc = this.model.find('core', 'ext', newName))) {
                                        newArgs.push(newFunc);
                                    }else if ((newFunc = this.model.find('func', 'base', newName))) {
                                        newArgs.push(newFunc);
                                    }
                                    argss.shift();
                                }
                            }
                            func = this.update(func, func.apply(undefined, newArgs));
                            index++;
                        }
                        return func;
                    },
                    get: function(name) {
                        return this.func.base[0](this)(name);
                    },
                    set: function(item) {
                        if(item && item.name && item.name.substr(0, 1) == '$') {
                            item = this.load(item);
                        }
                        return item;
                    },
                    ext: function(proto, items) {
                        var model = this.model;
                        return items.reduce(function(prto, fn) {
                            var item = model.factory.set(fn);
                            prto[item.name] = item;
                            return prto;
                        }, proto);
                    },
                    object: function(path) {
                        var model = this.model || this;
                        var items = model.find(path);
                        var objct = model.factory.ext({}, items);
                        return objct;
                    },
                    inherit: function(name, parent) {
                        var model = this.model || this;
                        var ctor  = model.find('ctor', name);
                        var klass = model.find('func', 'core', 'named')(name);

                        if (parent) {
                            var F = function() {};
                            F.prototype = parent.prototype;
                            var proto = new F();
                            proto.__parent__ = proto.__parent__.slice(0);
                            proto.__level__  = proto.__parent__.push(F.prototype);
                            proto.__super__  = model.find('func.klass.$super');
                        }else {
                            var proto = {
                                __parent__: [], __level__: 0,
                            }
                        }
                        proto = this.ext(proto, model.find('func', name), model);
                        if (!proto.id)    proto.id    = model.find('func', 'klass', 'makeID')();
                        if (!proto.is)    proto.is    = model.find('func', 'klass', 'is');
                        if (!proto.pure)  proto.pure  = model.find('func', 'base', 'pure');
                        if (!proto.ext)   proto.ext   = model.find('func', 'core', 'ext')(this.ext({}, model.find('func', 'ext'), model));
                        if (!proto.utils) proto.utils = model.find('func', 'core', 'ext')(this.ext({}, model.find('func', 'base'), model));
                        if (proto.from && !klass.from) klass.from = proto.from;
                        proto.constructor = klass; proto.ctor = ctor;
                        klass.prototype = proto;
                        return klass;
                    },
                    make: function(model, name) {
                        var fact   = model.factory; fact.model = model;

                        var exist  = model.find('types', 'ctor', name);
                        if (exist && exist.name && exist.name.toLowerCase() == name) return exist;

                        var superr = model.find('model.parents.storage');
                        var parent = model.find('types', 'ctor', superr);
                        var klass  = this.inherit(name, parent);

                        var path = model.find('func.core.objpath');
                        var type = path('types.ctor.'+name, model, klass);

                        return klass;
                    }
                },
                find: function() {
                    var args = [].slice.call(arguments).join('.').split('.');
                    var item = this, next, index = 0;
                    while (args.length) {
                        if (item instanceof Array) {
                            index = 0;
                            while (index < item.length) {
                                if (item[index].name == args[0]) {
                                    item = item[index]; break;
                                }else if (++index == item.length) {
                                    item = null;
                                    break;
                                }
                            }
                        }else if (typeof item == 'object') {
                            if ((next = item[args[0]])) {
                                item = next;
                            }else {
                                item = null;
                                break;
                            }
                        }else {
                            item = null;
                            break;
                        }
                        args.shift();
                    };
                    return item;
                },
                call: function(factory) {
                    return function(cb) {
                        return cb(factory);
                    }
                },
                make: function(model) {
                    return function(name) {
                        if (name == 'model') {
                            return model.call(model);
                        }else if (name == 'factory') {
                            return model.call(model.factory);
                        }else if (name && name.indexOf('.') > 0) {
                            return model.find.apply(model, name.split('.'));
                        }else if (model.ctor[name]) {
                            return model.factory.make(model, name);
                        }else if (model[name]) {
                            return model.factory[name]
                        }
                    }
                },
                wrap: function() {
                    return this.func.base[0](this.make)(this);
                }
            }.wrap();
        }),

        (function MakeSysControl(root, model) {
            var sys   = root.sys = {};
            sys.get   = root.root;
            sys.model = model;
            return sys;
        }),

        (function SetupDispatcher() {
            return [].slice.call(arguments).apply();       
        })(

            (function MakeDispatcher(create_dispatcher, wrapped_dispatcher, process_messages, create_enqueue_platform, close_over) {
                return (function dispatcher(cb, timer) { return cb(create_dispatcher(wrapped_dispatcher, process_messages, close_over, create_enqueue_platform, timer)); });
            }),
            (function create_dispatcher(wrapped_dispatcher, process_messages, close_over, create_enqueue_platform, timer) {
                var tasks = [], status = [ 0, 0, 50, false, false, { frameid: 0, count: 0, ts: 0, limit: 0, rs: 0, handle: 0, suspend: false, length: 0, maxlen: 0 } ];
                return close_over(
                    (function queue() { return tasks; }),
                        (function status() { return status; }),
                            wrapped_dispatcher(status, process_messages(tasks, status), timer),
                                create_enqueue_platform);
            }),
            (function wrapped_dispatcher(status, process_messages, timer) {
                var TASK_RUNNING = 3, TASK_QUEUED = 4, TASK_INFO = TASK_QUEUED+1;
                if (timer) {
                    function queue_dispatcher() {
                        if (!(status[TASK_QUEUED] && status[TASK_RUNNING])) {
                            status[TASK_QUEUED] = true;
                            status[TASK_INFO].handle = timer(onmessage);
                        }
                    };
                    function onmessage() {
                        if (!process_messages()) queue_dispatcher();
                        else status[TASK_QUEUED] = false;
                    };
                    return queue_dispatcher;
                }else if (typeof MessageChannel !== "undefined") {
                    var message_channel = new MessageChannel();
                    function queue_dispatcher()  {
                        if (!(status[TASK_QUEUED] && status[TASK_RUNNING])) {
                            status[TASK_QUEUED] = true;
                            message_channel.port2.postMessage(0);
                        }
                    };
                    message_channel.port1.onmessage = function(_) {
                        if (!process_messages()) queue_dispatcher();
                        else status[TASK_QUEUED] = false;
                    };
                    return queue_dispatcher;
                }else if (typeof setImmediate !== "undefined") {
                    return function queue_dispatcher() {
                        if (!(status[TASK_QUEUED] && status[TASK_RUNNING])) {
                            status[TASK_QUEUED] = true;
                            setImmediate(process_messages);
                        }
                    };
                }else {
                    return function queue_dispatcher() {
                        if (!(status[TASK_QUEUED] && status[TASK_RUNNING])) {
                            status[TASK_QUEUED] = true;
                            setTimeout(process_messages, 0);
                        }
                    };
                }
            }),
            (function process_messages(tasks, status) {
                var TASK_INDEX = 0, TASK_START_AT = 0, TASK_COUNTER = TASK_START_AT+1,
                    TASK_BATCH_SIZE = TASK_COUNTER+1, TASK_RUNNING = TASK_BATCH_SIZE+1,
                    TASK_QUEUED = TASK_RUNNING+1, TASK_INFO = TASK_QUEUED+1;

                return function() {
                    var task, info  = status[TASK_INFO]; info.ps = info.ts;
                        info.limit  = ((info.ts = self.now()) < self.rafNext ? self.rafNext : info.ts+8),
                        info.length = tasks.length,info.fs = info.ts - info.ps, 
                        info.maxlen = info.length > info.maxlen ? info.length : info.maxlen,
                        info.size   = info.length, info.frameid++;

                    while (tasks.length && ++info.count) {
                        task = tasks[(TASK_INDEX < tasks.length ? TASK_INDEX : (TASK_INDEX = 0))];
                        if (!task || !task.next) {
                            tasks.splice(TASK_INDEX, 1);
                        }else if (task.next(status[TASK_INFO])) {
                            tasks.splice(TASK_INDEX, 1);
                        }
                        if (info.suspend || (info.limit < (info.rs = self.now()))) break;
                        else if (++status[TASK_COUNTER] >= status[TASK_BATCH_SIZE]) {
                            status[TASK_COUNTER] = 0; break;
                        }
                    }
                    status[TASK_RUNNING] = false; info.suspend = false;
                    ++TASK_INDEX < tasks.length || (TASK_INDEX = 0);
                    return !tasks.length;
                }
            }),
            (function create_enqueue_platform(tasks, status, run) {
                return function enqueue(item) {
                    if ((status[0] = tasks.push({ next: item })) == 1) run();
                };
            }),
            (function close_over(tasks, status, run, create_enqueuer) {
                return (function() {
                    return { tasks: tasks, status: status, run: run, enqueue: create_enqueuer(tasks(), status(), run) };
                });
            })
        )
    ),

// ========  ======== STAGE LINK ========  ======== //

    (function LinkArray() {
        return [].slice.call(arguments);
    })(
        (function MakeContext(makeClosure, sys) {

            return makeClosure(
                sys.root('sys.model')('factory')(function(factory) {
                    return factory.ext(sys, factory.model.find('func.array'));
                })
            );
        }),
        (function MakeClosure(o) {

            Array.prototype.fmap = function(f) {
                return o.fmap(f, o.async(this.slice(0)));
            };
            Array.prototype.collect = function() {
                return o.async(this);
            };
            Array.prototype.bind = function(f) {
                return o.bind(this, f);
            };
            Array.prototype.chain = function(f) {
                return [ this.fmap(f) ];
            };
            Array.prototype.run = function(succ, fail) {
                return o.async(this)(succ || unit, fail);
            };
            Array.prototype.at = function(index) {
                return this.length && index < this.length ? this[index] : [];
            };
            Array.prototype.first = function(f) {
                return this.chain(function(result) {
                    return (f || unit)(result.at(0));
                });
            };
            Array.prototype.ap = function(f) {
                return o.run(this, f);
            };
            Array.prototype.o = function(f) {
                return o;
            };
            Array.prototype.combine = o.combine;
            Array.prototype.select = o.select;
            Array.prototype.lift = o.lift;
            Array.prototype.fold = o.fold;
            Array.prototype.apply = o.apply;
            Array.prototype.flatmap = function(f) {
                return o.flatmap(this, f);
            };
            Array.prototype.flatten = function() {
                return this.flatmap(unit);
            };

            return o;
        })
    ),

// ========  ======== STAGE RUN ========  ======== //

    (function XHR() {
        return [].slice.call(arguments);
    })(

        (function XHRUtility(wrap, newxhr, init, create, run, andThen) {

            return function makeXHR(utils) {
                return utils.set('xhr', utils.get('target')(
                    wrap(
                        utils.get('pure'), utils.get('pure'),
                        init(run(create(newxhr), andThen), utils.get('pure'))
                )));
            }
        }),
        (function wrap(pure, _pure_, request) {
            function loadScript(url) {
                url = _pure_(url);
                return function (succ, fail) {
                    url(function (_url) {
                        var ext = _url.split('.').slice(-1);
                        if (ext == 'css') {
                            var script = document.createElement("link");
                            script.type = 'text/css';
                            script.rel  = 'stylesheet';
                            script.href = _url;
                        }else {
                            var script = document.createElement("script");
                            if (ext == 'tmpl') {
                                script.type = 'text/template';
                            }
                            script.src = _url;
                        }
                        script.addEventListener("load", function () {
                            succ(script);
                        });
                        script.addEventListener("error", fail);
                        var head = document.getElementsByTagName('head')[0];
                        head.appendChild(script);
                    }, fail);
                };
            };
            function getImage(url) {
                url = _pure_(url);
                return function (succ, fail) {
                    url(function (_url) {
                        var img = new Image();
                        img.src = url;
                        img.addEventListener("load", function () {
                            succ(img);
                        });
                        img.addEventListener("error", fail);
                    }, fail);
                };
            };
            return {
                loadScript: loadScript,
                getImage: getImage,
                request: request
            };
        }),
        (function newxhr() {
            var _xhr = false;
            if (this.XMLHttpRequest) { // Mozilla, Safari, ...
                _xhr = new XMLHttpRequest();
            }else if ( this.ActiveXObject ) { // IE
                try {
                    _xhr = new ActiveXObject("Msxml2.XMLHTTP");
                }catch (e) {
                    try {
                        _xhr = new ActiveXObject("Microsoft.XMLHTTP");
                    }catch (e) {}
                }
            }
            return _xhr;
        }),
        (function initRequest(make, pure) {
            return function request(url, options) {
                var request;
                if (typeof (url) === "object") request = pure(url);
                else if (typeof (url) === "string") request = pure({ 'url' : url, 'cached' : (options === true) });
                else request = url;
                return make(request);
            };
        }),
        (function createRequest(newxhr) {
            return function create(request) {
                var xhr = newxhr(), type = request.type = request.type || 'GET';
                xhr.open(type, request.url, true);
                if (type != 'GET') {
                    xhr.setRequestHeader('Content-Type', request.contentType || 'application/json');
                }
                if (!request.noheaders) {
                    if (request.url.indexOf('.tmpl') > 0) {
                        console.log(request);
                        request.url = request.url.replace('.tmpl', '.txt');
                    }else if (request.withCredentials) {
                        xhr.withCredentials = true;
                        xhr.setRequestHeader('Access-Control-Request-Method', type);
                    }else if (!request.cached) {
                        xhr.setRequestHeader('Pragma', 'no-cache');
                        xhr.setRequestHeader('Cache-Control', 'no-cache');
                        xhr.setRequestHeader('If-Modified-Since', 'Thu, 01 Jun 1970 00:00:00 GMT');

                        xhr.setRequestHeader('HTTP_X_REQUESTED_WITH', 'XMLHttpRequest');
                        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                    }
                    if (request.contentType) {
                        xhr.setRequestHeader('Content-Type', request.contentType);
                    }
                    if (request.accept) {
                        xhr.setRequestHeader('Accept', request.accept);
                    }else {
                        xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
                    }
                }else {
                    if (request.accept) {
                        xhr.setRequestHeader('Accept', request.accept);
                    }
                }
                if (request.auth) {
                    xhr.withCredentials = request.withCredentials !== false;
                    xhr.setRequestHeader('Authorization', request.auth);
                }
                return xhr;
            }
        }),
        (function runRequest(create, then) {
            return function wrap(request) {
                return function(succ, fail) {
                    request(function(_request) {
                        var xhr = then(_request, create(_request), succ, fail);
                        if (_request.type == 'GET') {
                            return xhr.send();
                        }else {
                            if (_request.data) {
                                return xhr.send(typeof _request.data == 'object' ? JSON.stringify(_request.data) : _request.data);
                            }else {
                                return xhr.send(); 
                            }
                        }
                    }, fail);
                }
            };
        }),
        (function andThen(request, xhr, succ, fail) {
            xhr.onload = function () {
                if (request.parse) {
                    try {
                        var ctype = xhr.getResponseHeader('Content-Type');
                        if (ctype && ctype.indexOf && ctype.indexOf('json') > -1) {
                            succ(JSON.parse(xhr.responseText));
                        }else {
                            succ(xhr.responseText);    
                        }
                    }catch (e) {
                        fail(e);
                    }
                }else {
                    succ(xhr.responseText);
                }
            };
            xhr.onerror = function (e) {
                e.preventDefault();
                (fail || unit)('masync.' + type + ': ' + e.toString());
            };
            return xhr;
        })
    )

// ========  ======== FINISH  ========  ======== //

);
