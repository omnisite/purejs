    (function MakeUtils() {

        return [].slice.call(arguments);
    })(
        (function $$MAKE(Parse, Utils, Value, IO, Maybe) {

            var $Sys   = this.$context.get('sys').run();
            var $Root  = this.$store;
            var $Utils = Utils($Sys, Parse($Root.child('utils')));

            var $CTOR  = $Root.ctor.root();
            $CTOR.prop('path', $Utils.get('path'));
            var $Store = $CTOR.find('$store');
            $Store.prop('path', $Utils.get('path'));
            $Store.prop('_identifier', $Utils.get('identifier')('_ref'));

            var $Value    = $CTOR.parse(Value);
            var $Functor  = $CTOR.find('$functor');
            var $IO       = $Functor.parse(IO);
            var $Maybe    = $Functor.parse(Maybe);

            return $Utils;

        }),


    (function MakeSys() {

        return [].slice.call(arguments);
    })(
        // ====== basic functions globally accessible through sys.fn ====== //
        (function $$SYS(_) {
            return _.apply(this.$context.get('sys').run(), [].slice.call(arguments, 1));
        }),
        (function(iswrkr, define, require, is, run, bin, compose, andThen, wrap, tap, isEqual) {
            this.fn.bin     = bin;
            this.fn.wrap    = wrap;
            this.fn.tap     = tap;
            this.fn.isEqual = isEqual;
            this.fn.compose = compose;
            this.fn.andThen = andThen;
            this.log = tap(console.log.bind(console));
            this.define     = self.define = define(require);
            this.isWorker   = iswrkr;
            this.is         = is;
            return this.run = run(this, this.fn.unit);
        }),
        (function isWorker() {
            var self = this; return (self.document === undefined);
        })(),
        // ==== fake require.js define function === //
        (function(require) {
            return function define() {
                var args  = [].slice.call(arguments), test,
                    func  = args.first(),
                    klass = sys().klass('Cont'), cont, node;
                if (func.length) {
                    if (func.name == '$_store') {
                        node = require()
                        args.push(node);
                        cont = args.apply();
                        cont.ref = node.uid();
                        return cont;
                    }else {
                        args.push(unit, {}, {});
                        args.apply();
                        test = require().set('cont', args.slice(2).reduce(function(r, v, i) {
                            if (r.length) {
                                return r;
                            }else if (v.exports) {
                                r.push(v.exports);
                            }
                            return r;
                        }, []).shift());
                    }
                }else {
                    test = args.apply();
                }
                if (klass.test(test.constructor)) {
                    if (!test.ref) {
                        node = require(test);
                        return node.set('cont', test.attr('ref', node.uid()));
                    }else {
                        return test;
                    }
                }else {
                    if ((node = sys('script').get(test.name) || require(test))) {
                        cont = node.get('cont');
                        if (cont) return cont;
                        else if (test && (cont = klass.of(test))
                            && cont.attr('name', test.name))
                                cont.attr('ref', node.uid());
                        return node.set('cont', cont);
                    }
                }
                return node || cont || test;
            }
        }),
        (function require(def) {
            var path, head, tag, type, node, ref;
            if (def && def.ref) {
                return sys().find(def.ref);
            }else if (def && def.name) {
                path = def.name.split('.');
                type = path.first();
                if (path.length == 1) {
                    if (node = sys('script').get('components', path, path.last())) {
                        return node;
                    }else if (node = sys('script').get('libs', path)) {
                        return node;
                    }
                }else if (type == 'modules' || type == 'lsibs') {
                    path.append(path.last());
                }
                return sys('script').get(path);
            }else {
                head = document.getElementsByTagName('head').item(0).getElementsByTagName('script');
                tag  = head.item(head.length-1);
                ref  = tag.getAttribute('data-ref');
                return sys().find(ref);
            }
        }),
        (function is(v) {
            return v && v instanceof this.ctor.base ? true
            : (v && v.name && this.ctor.find(v.name) ? true : (v && v.base == this.ctor.base ? true : false));
        }),
        // ==== basic functions ===== //
            (function run(t, f) {
                return function $_pure(g) {
                    if (typeof g == 'string') {
                        var a = g.split('.');
                        if (a.length > 1 && a.first() == 'root' && a.shift()) g = a.join('.');
                        return (a.length == 1 ? t.root.get(g) : t.get(g)) || (a.length > 1 && t[a.first()] instanceof Function ? t[a.first()](a.slice(1).join('.')) : t[g]);
                    }else {
                        return (g || f)(t);
                    }
                }
            }),
            // === 1st arg bind ===== //
            (function bin(f) {
                return function(a) {
                    return function(b) {
                        return f(a, b);
                    }
                }
            }),
            (function compose(f) {
                return function(g) {
                    return function(a) {
                        return g(f(a));
                    }
                };
            }),
            (function andThen(g) {
                return function(f) {
                    return function(a) {
                        return g(f(a));
                    }
                };
            }),
            // === wrapped fn ======= //
            (function wrap(f) {
                return function(t) {
                    return f(t);
                }
            }),
            (function tap(f) {
                return function(x) {
                    return unit(x, f(x));
                }
            }),
            (function() {
                function objEqual(a, b) {
                    var p, t;
                    for (p in a) {
                        if (typeof b[p] === 'undefined') {
                            return false;
                        }
                        if (b[p] && !a[p]) {
                            return false;
                        }
                        t = typeof a[p];
                        if (t === 'object' && !objEqual(a[p], b[p])) {
                            return false;
                        }
                        if (t === 'function' && (typeof b[p] === 'undefined' || a[p].toString() !== b[p].toString())) {
                            return false;
                        }
                        if (a[p] !== b[p]) {
                            return false;
                        }
                    }
                    for (p in b) {
                        if (typeof a[p] === 'undefined') {
                            return false;
                        }
                    }
                    return true;
                };
                return function isEqual(a, b) {
                    if (a == null || b == null) {
                        return false;
                    }else if (a instanceof Array) {
                        return b instanceof Array && a.length == b.length ? a.reduce(function(r, v, i) {
                            return r && isEqual(v, b[i]) ? true : false;
                        }, true) : false;
                    }else if (typeof a == 'object') {
                        if (a.uid && b.uid
                            //&& (!(!a.__ || !b.__ || a.__ != b.__))
                            && (a.uid instanceof Function ? a.uid() : a.uid) === (b.uid instanceof Function ? b.uid() : b.uid)) {
                            return true;
                        }else if (a.constructor == Object) {
                            return typeof b == 'object' && b.constructor == Object ? objEqual(a, b) : false;
                        }else {
                            return false;
                        }
                    }else {
                        return a === b;
                    }
                };
            })()
    ),

    (function MakeRootTransformer() {

        return [].slice.call(arguments);
    })(
        // === TRANS === //
            (function $TRANS(CTOR, Data, Store, Linq, Context, Functor, Compose, Coyoneda, Reader, Cont, Transformer) {
                var $Linq    = $Store.parse(Linq);  
                var $Functor = $CTOR.parse(Functor);
                var $Compose = $Functor.parse(Compose);
                var $Coyo    = $Compose.parse(Coyoneda);
                var $Context = $Store.parse(Context);
                var $Reader  = $Compose.parse(Reader);
                var $Cont    = $Compose.parse(Cont);
                var $Trans   = $CTOR.parse(Transformer);

                return $Trans.initial($Reader.fromConstructor('fromStore', $Root), $Coyo);
            }),
        // === Link === //
            (function() {
                return {
                    klass: function Link(ref, name) {
                        this.$super.call(this, ref, name || 'link');
                    },
                    ext: [
                        (function cid() {
                            return this._cid;
                        }),
                        (function mode(mode) {
                            return this.get(this.set('mode', mode)) || this.child(mode);
                        }),
                        (function use(arg) {
                            var args = arg instanceof Array ? arg : [].slice.call(arguments);
                            var key  = this.set('key', typeof args[0] == 'string' ? args.shift() : 'vals');
                            return this.get(key) || this.node(key);
                        }),
                        (function pick(key) {
                            return this.use(key).ref();
                        }),
                        (function add() {
                            var args = [].slice.call(arguments);
                            var rec  = this.use(args);
                            rec.push(this.data.get(this.cid()).apply(this, args));
                            return this;
                        }),
                        (function run() {
                            var args = [].slice.call(arguments), rec;
                            if (args.length > 1 && typeof args[0] == 'string'
                                && this.has(args[0]) && this.is(this.get(args[0])))
                                    this.pick(args);
                            return this.ops.get(this.cid()).apply(this.current(), args);
                        })
                    ],
                    link: function(mode) {
                        var link = this._link || (this._link = this.$link(this));
                        return mode ? link.mode(mode) : link;
                    },
                    ops: function() {
                        this.set('mapF', function(value) {
                            var rec = this.current() || [], idx = 0, key = this._cid, val = this.initial(key);
                            while (idx < rec.length) {
                                if (rec[idx].filter(value)) break;
                            }
                            return val instanceof Function
                                ? (idx < rec.length ? val(rec[idx].map(value)) : val(value))
                                : (idx < rec.length ? rec[idx].map(val || value) : (val || value));
                        });
                        this.set('valueMap', function(value) {
                            var rec = this.current().first();
                            return this.initial(rec.map.get(value || rec.def) || rec.map.get(rec.def) || rec.def);
                        });
                        this.set('typeMap', function(value) {
                            var rec = this.current().first();
                            return rec.map.get(this.initial(value || rec.def) || this.initial(rec.def) || rec.def);
                        });
                        return this;
                    },
                    data: function() {
                        this.set('mapF', function(map, filter) {
                            return { filter: filter || $const(true), map: map || unit };
                        });
                        this.set('filterM', function(filter, map) {
                            return { filter: filter || $const(true), map: map || unit };
                        });
                        this.set('valueMap', function(map, def) {
                            var rec = this.get(this.get('key'));
                            return { map: rec.node('map').parse(map), def: def };
                        });
                        this.set('typeMap', function(map, def) {
                            var rec = this.get(this.get('key'));
                            return { map: rec.node('map').parse(map), def: def };
                        });
                        return this;
                    },
                    init: function(type, klass, sys) {
                        klass.$store.ctor.prop('$link', klass.of);
                        klass.$store.ctor.prop('link', type.link);
                        var link = klass.prop('root').child('link', klass.$ctor).store();
                        klass.prop('data', type.data.call(link.child('data')));
                        klass.prop('ops',  type.ops.call(link.child('ops')));
                    }
                };
            }),
        // === Context === //
            (function() {
                return {
                    klass: function Context(opts, ref) {
                        this.$super.call(this, opts, ref);
                    },
                    ext: [
                        (function $$init(opts, ref) {
                            //return this.parse(opts, ref);
                        }),
                        (function $values(keys, vals) {
                            return { keys: keys, vals: vals && vals instanceof Array ? vals : ((typeof vals == 'object' ? keys.map(function(k, idx) {
                                return vals[keys[idx]];
                            }) : keys.slice(0))) };
                        }),
                        (function $keys() {
                            var args = [].slice.call(arguments).flat();
                            if (args.length == 1 && typeof args[0] == 'object')
                                return this.$values(Object.keys(args.first()), args.shift());
                            else
                                return this.$values(args, args);
                        }),
                        (function reduce(a, f, r) {
                            var vals  = this.$keys(a);
                            vals.res  = r || {};
                            if (!vals.link) vals.link = this.link('valueMap');
                            return vals.keys.reduce(function(r, k, i) {
                                return f(r, r.vals[i], k, r.vals) || r;
                            }, vals);
                        }),
                        (function parse(/* data, link, store */) {
                            return this.reduce([].slice.call(arguments), function(res, val, key) {
                                if (key == 'parent') {
                                    res.link.add('children', 'parent', store);
                                }
                                return res;
                            }, this);
                        }),
                        (function valueMap(type, code, label, values) {
                            this.link(type || 'valueMap').add(code, this.codes(values));
                            this.link(type || 'valueMap').add(label,this.labels(values));
                            return this.link;
                        }),
                        (function modelMap(curr, next, value) {
                            this.valueMap('modelMap', 'current', 'next', value);
                        })
                    ],
                    $bind: (function($bind, $handler, $wrap) {
                        return function bind(k, t) {
                            if (!k['$$'+this.id] && (k['$$'+this.id] = this.kid())) {
                                return $bind(this, this.$$kont.set(k['$$'+this.id],
                                    Function.prototype.call.bind(k)), $handler(t, this));
                            }else {
                                return $bind(this, this.$$kont.get(k['$$'+this.id]), $handler(t, this));
                            }
                        }
                    })(
                        (function bind(c, k, h) {
                            return new c.constructor(function(r) {
                                return h(h(k(c, c.run(r))).run(r));
                            });
                        }),
                        (function handler(t, c) {
                            return function(result) {
                                return t.result(c, result);
                            }
                        }),
                        (function wrapper(h, k, t) {
                            return function() {
                                return h(t, this)(k.call(this, [].slice.call(arguments)));
                            }
                        })
                    ),
                    init: function(type, klass) {
                        //debugger;
                        //klass.prop('$$kont', klass.$store.node('$$cache').node('$$kont'));
                        //klass.prop('$context', klass.root().get().child('context', klass.find('Context').$ctor));
                        //klass.prop('bind', type.$bind);
                    }
                };
            }),
        // === Functor === //
            (function Functor() {
                return {
                    klass: function Functor() {
                        this.id = this.id();
                        this.$$init.apply(this, arguments);
                    },
                    ext: [
                        (function $$init(mv) {
                            this._x = mv;
                        }),
                        (function is(value) {
                            return value && value instanceof this.constructor;
                        }),
                        (function of() {
                            return this.constructor.of.apply(this.constructor, [].slice.call(arguments));
                        }),
                        (function attr(name, value) {
                            this[name] = value;
                            return this;
                        }),
                        (function map(f) {
                            return new this.constructor(this._x.map ? this._x.map(f) : f.call(this, this._x));
                        }),
                        (function join() {
                            return this._x || this.mf || this._x || this._f || this._x;
                        }),
                        (function lift(f) {
                            return this.map(function(v1) {
                                return function(v2) {
                                    return f(v1, v2);
                                }
                            });
                        }),
                        (function chain(f) {
                            return this.map(f).join();
                        }),
                        (function run(f) {
                            return this.chain(f || unit);
                        })
                    ],
                    attrs: [
                        (function of(x) {
                            return new this(x);
                        }),
                        (function pure(x) {
                            return new this(x);
                        })
                    ],
                    lock: function(lock) {
                        return function() {
                            return lock.of(this);
                        }
                    },
                    init: function(type, klass, sys) {
                        klass.prop('lock', type.lock(this.find('Value')));
                    }
                };
            }),
        // === Compose === //
            (function Compose(klass, ext, attrs) {
                return function MakeCompose() {
                    return { klass: klass, ext: ext, attrs: attrs };
                }
            })(
                (function Compose() {
                    this.$super.apply(this, arguments);
                }),
                (function() {
                    return [].slice.call(arguments);
                })(
                    (function MakeCompose(make, just, next) {
                        return make(just, next);
                    })(
                        (function make(just, next) { 
                            return function $fn(f) {
                                return function $_compose(g) {
                                    return g ? (g.name == 'unit' ? just(f) : (f.name == 'unit' ? just(g) : next(f, g))) : just(f);
                                };
                            };
                        }),
                        (function just(f) {
                            return function $_just(a) {
                                return f(a);
                            }
                        }),
                        (function next(f, g) {
                            return function $_next(a) {
                                return g(f(a));
                            };
                        })
                    ),
                    (function $$init(x) {
                        this._x = this.$$cmps(x);
                    }),
                    (function $$cmps(x) {
                        return !x && typeof x == 'undefined' ? unit : (x instanceof Function && x.length > 1 ? this.fn.curry(x) : x);
                    }),
                    (function ap(monad) {
                        return monad.map ? monad.map(this.$fn(this._x)(unit)) : this.ap(this.of(monad));
                    }),
                    (function apply(monad) {
                        return monad.ap(this);
                    }),
                    (function map(f) {
                        return new this.constructor(this.$fn(this._x)(f));
                    }),
                    (function bimap(f, g) {
                        return new this.constructor(this.$fn(this._x)(f)(g));
                    }),
                    (function run(v) {
                        return this.chain(unit)(v);
                    })
                ),
                (function() {
                    return [].slice.call(arguments);
                })(
                    (function of(x) {
                        return new this(x);
                    })
                )
            ),
        // === Coyoneda === //
            (function Coyoneda() {
                return {
                    klass: function Coyoneda(f, x) {
                        this.$super.call(this, f, x);
                    },
                    ext: [
                        (function $$init(f, x) {
                            if (f) this.mf = f;
                            else if (!this.mf) this.mf = unit;
                            if (x) this.mv = x;
                        }),
                        (function map(f) {
                            return new this.constructor(this.$fn(this.mf)(f), this.mv);
                        }),
                        (function bind(f) {
                            return new this.constructor(this.$fn(this.mf)(f), this.mv);
                        }),
                        (function chain(f, x) {
                            return this.$fn(this.mf)(f || unit)(x || this.mv);
                        }),
                        (function lift(x) {
                            return new this.constructor(this.mf, x || this.mv);
                        }),
                        (function run(f, x) {
                            return this.$fn(this.mf)(f || unit)(x || this.mv);
                        })
                    ],
                    attrs: [
                        (function of(x, f) {
                            return new this(f || unit, x);
                        }),
                        (function lift(f, x) {
                            if (!(f instanceof Function)) return this.of(f, x);
                            return new this(f || unit, x);
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
        // === Cont === //
            (function() {
                return {
                    klass: function Cont(mv, mf) {
                        this.$super.call(this, mv, mf);
                    },
                    ext: [
                        (function $$init(x, f) {
                            if (x) this.mv = this.$cast(x);
                            if (f) this.mf = f;
                        }),
                        (function mf(t) {
                            return function $_pure(f) {
                                return f(t);
                            }
                        }),
                        (function $count(curr, next, type) {
                            next[type] = curr[type]+'$';
                            next['$$path'] = type+'<<'+curr.id+curr['$$path'];
                            return next;
                        }),
                        (function $cast(v, p) {
                            if (v && this.is(v) && v.cont) {
                                return v.$cont ? v.$cont() : v.cont();
                            }else {
                                return v && v instanceof Function
                                    && (p || v.name.substr(-4) == 'cont'
                                          || v.name.substr(-4) == 'pure'
                                          || v.name == 'mf') ? v : this.constructor.val(v);
                            }
                        }),
                        (function $pure(f) {
                            return this.mf.name == this.constructor.prototype.mf.name ? f : this.$fn(this.mf)(f);
                        }),
                        (function $map(f) {
                            return function(v) {
                              return v instanceof Function 
                                && v.name.substr(-4) == 'pure'
                                  && (!f.name || f.name.substr(-4) != 'pure' || f.name != 'mf') ? v(f) : f(v);
                            }
                        }),
                        (function map(f) {
                            return this.$count(this, new this.constructor(this.mv, this.$fn(this.$pure(this.$map(f)))(this.$cast)), '$$map');
                        }),
                        (function $bind(mv, mf) {
                            return this.$count(this, new this.constructor(mv, this.$fn(mf)(this.$cast)), '$$bind');
                        }),
                        (function bind(f) {
                            return this.$bind(this.$cont(), f);
                        }),
                        (function chain(k) {
                            return this.$cont()(k || unit);
                        }),
                        (function fmap() {
                            return this.bind(this.of.bind(this));
                        }),
                        (function ap(other) {
                            return this.bind(function(result) {
                                return other.is(result) ? result.ap(other) : other.chain(result);
                            });
                        }),
                        (function apply(other) {
                            return other.ap(this);
                        }),
                        (function lift(m) {
                            return this.bind(function(result) {
                                return m.run(result);
                            });
                        }),
                        (function run(k) {
                            this['$$run']+='$';
                            return this.chain(k || unit);
                        }),
                        (function once(k) {
                            if (this['$$run']=='') return this.run(k);
                        })
                    ],
                    attrs: (function(cont, val, of, pure) {
                        return [
                            of,
                            cont,
                            (function fromCallback(cb, mf) {
                                return this.of(mf ? cont(cb, mf) : val(cb));
                            }),
                            val,
                            pure
                        ];
                    })(
                        (function cont(mv, mf) {
                            return function $_pure(continuation) {
                                return mv(function(value) {
                                    return mf(value)(continuation);
                                });
                            }
                        }),
                        (function val(v) {
                            return function $_pure(continuation) {
                                return continuation(v);
                            }
                        }),
                        (function of(x, f) {
                            return x instanceof this ? x : new this(x, f);
                        }),
                        (function pure(x, f) {
                            return this.of(x, f);
                        })
                    ),
                    cont: (function $_cont() {
                        return this._locked ? this.$value() : this.$cont();
                    }),
                    resolve: function(ctor) {
                        return function(f) {
                            return this.bind(function $res(r) {
                                return ctor.is(r) ? r.bind($res).cont() : function $_pure(k) {
                                    k(f(r));
                                }
                            });
                        }
                    },
                    $cont: function(ctor) {
                        return function() {
                            return this.next(ctor.cont(this.mv, this.mf));
                        }
                    },
                    is: function(ctor) {
                        return function(value) {
                            return value && value instanceof ctor ? true : false;
                        }
                    },
                    init: function(type, klass, sys) {
                        var proto     = klass.proto(), ctor = klass.$ctor;
                        proto.$$map   = '';
                        proto.$$bind  = '';
                        proto.$$path  = '';
                        proto.$$run   = '';
                        proto.$cast   = proto.$cast.bind(proto);
                        proto.cont    = type.cont;
                        proto.next    = unit;
                        proto.$cont   = type.$cont(ctor);
                        proto.is      = ctor.is = type.is(ctor);
                        proto.resolve = type.resolve(ctor);
                    }
                };
            }),
        // === Transformer === //
            (function() {
                return {
                    klass: function Transformer(monad) {
                        this.id = this.id();
                        this._m = monad || this._m;
                        this._r = this._r;
                    },
                    ext: [
                        (function of(monad) {
                            return new this.constructor(monad);
                        }),
                        (function test(value) {
                            if (!value) return {};
                            else if (this.ctor.root().is(value)) return { type: true };
                            return {
                                'reader' : this._r.is(value),
                                'monad'  : this._m.is(value),
                                'trans'  : this.is(value)
                            };
                        }),
                        (function ask() {
                            return this._r.ask();
                        }),
                        (function asks(fn) {
                            return this._r.asks(fn);
                        }),
                        (function unit(ctx) {
                            return this._r.unit(ctx);
                        }),
                        (function get(key) {
                            return this._r.store(key);
                        }),
                        (function store(key, value) {
                            return typeof value == 'undefined' ? (!key ? this.$context : this.$context.get(key)) : (this.$context.set(key, value));
                        }),
                        (function add(key, fn) {
                            return this.$context.get(key) || this.$context.set(key, this.of(fn || this._f));
                        }),
                        (function put(key, value, returnValue) {
                            var result;
                            if (key && typeof value == 'object') {
                                var store = this.$context.get(key) || this.$context.child(key);
                                result = store.parse(value);
                            }else if (key && typeof key == 'object') {
                                result = this.$context.parse(key);
                            }else if (key && value) {
                                result = this.$context.set(key, value);
                            }else if (key) {
                                result = this.$context.get(key) || this.$context.child(key);
                            }
                            return returnValue ? result : this;
                        }),
                        (function reader() {
                            return this._r;
                        }),
                        (function map(fn) {
                            return this.of(this._m.map(fn));
                        }),
                        (function bind(k) {
                            return this.$cont(k);
                        }),
                        (function lift(x) {
                            return this.of(this._m.of(x));
                        }),
                        (function result(ctx, res) {
                            if (!res) {
                                return this;
                            }else if (res.type) {
                                return this;
                            }else {
                                var test = this.test(res);
                                if (test.reader) return res;
                                else if (test.monad) return this;
                            }
                            return this._r.unit(res);
                        }),
                        (function $result(t, k, c) {
                            return function(r) {
                                return k.call(t._m, t.result(c || t, r));
                            }
                        }),
                        (function run(k) {
                            return this._r.bind(this.$result(this, k || unit, this._r), this);
                        })
                    ],
                    attrs: [
                        (function of(monad) {
                            return new this(monad);
                        }),
                        (function initial(reader, monad) {
                            var name = reader.name || reader._cid || reader.constructor.name;
                            var extT = this.ctor.extend(name + 'T', { _r: reader });
                            if (monad) extT.prop('_m', monad);
                            return extT.of();
                        })
                    ],
                    initial: function(reader, monad) {
                        return this.$ctor.initial(reader, monad);
                    },
                    extendCont: function() {
                        return this.klass.extend(function ContT(trans) {
                            this.$super.call(this, trans);
                        }, {
                            mv: function $_pure(k) {
                                return trans.run(trans.$kont(k));
                            },
                            mf: this.mf
                        })
                    },
                    $_cont: function(v) {
                        return function $_pure(k) {
                            return v.lift(k)
                        }
                    },
                    makeCont: function(cont) {
                        return function(k) {
                            return cont.of(this).bind(this.$kont(k));
                        }
                    },
                    makeHandler: (function $kont(w, h) {
                        return function kont(k) {
                            return w(h, k, this);
                        }
                    })(
                        (function wrapper(h, k, t) {
                            return function() {
                                return h(t, this)(k.call(this, [].slice.call(arguments)));
                            }
                        }),
                        (function handler(t, c) {
                            return function(result) {
                                return t.result(c, result);
                            }
                        })
                    ),
                    init: function(type, klass, sys) {
                        klass.constructor.prototype.initial = type.initial;
                        klass.prop('$of', klass.$ctor.of.bind(klass.$ctor));
                        klass.prop('$cont', type.makeCont(type.extendCont.call({ klass: this.find('Cont'), mf: type.$_cont })));
                        klass.prop('$kont', type.makeHandler);

                        klass.prop('$$kont', klass.$store.node('$$cache').node('$$kont'));
                        klass.prop('$context', klass.root().get().child('context', klass.find('Context').$ctor));
                    }
                };
            })
    }),

        // === Value === //
            (function() {
                return {
                    klass: function Value(x, l) {
                        this.id = this.id();
                        if (x) this.mv = x;
                        this.mv._locked = l !== false;
                    },
                    ext: [
                        (function of(v, l) {
                            return this.constructor.of(v, l);
                        }),
                        (function lock(lock) {
                            if (!this._locked && lock !== false) this._locked = true;
                            return this;
                        }),
                        (function unlock() {
                            if (this.isLocked(this.mv)) this.mv._locked = false;
                            else if (this.isLocked()) this._locked = false;
                            return this.mv;
                        }),
                        (function isLocked(v) {
                            return v ? this.__.isLocked(v) : (this._locked === true || this.__.isLocked(this.mv));
                        }),
                        (function wasLocked(v) {
                            return v ? this.__.wasLocked(v) : (this._locked === false || this.__.wasLocked(this.mv));
                        }),
                        (function holdLock(v) {
                            return this.of(v, this._locked !== false);
                        }),
                        (function releaseLock() {
                            return this.of(this.unlock(), false);
                        }),
                        (function map(f) {
                            return this.of(this.mv.map(f), false);
                        }),
                        (function bind(f) {
                            return this.mv && !this.isLocked(this.mv) ? this.unlock().bind(f) : this.of(this.mv.bind(f), false);
                        }),
                        (function resolve(f) {
                            return this.mv && !this.isLocked(this.mv) ? this.unlock().resolve(f) : this.of(this.mv.resolve(f), false);
                        }),
                        (function create(opts) {
                            return this.mv.bind(function(v) {
                                return function $_pure(k) {
                                    v.create(opts).run(k);
                                }
                            });
                        }),
                        (function run(k) {
                            return this.mv && !this.isLocked(this.mv) ? this.mv.run(k) : k(this);
                        })
                    ],
                    isLocked: function() {
                        function isLocked(x) {
                            return x && x._locked;
                        }
                        return isLocked;
                    },
                    wasLocked: function() {
                        function wasLocked(x) {
                            return x && x._locked === false;
                        }
                        return wasLocked;
                    },
                    unlock: function(isLocked) {
                        function unlock(v) {
                            if (isLocked(v) && !(v._locked = false)) return v;
                            return v;
                        }   
                        return unlock;
                    },
                    attrs: [
                        (function of(v, l) {
                            return new this(v, l);
                        })
                    ],
                    value: function(v) {
                        return function() {
                            return v.of(this instanceof v.$ctor ? this.mv : this);
                        }
                    },
                    init: function(type, klass, sys) {
                        klass.$ctor.isLocked  = type.isLocked(klass);
                        klass.$ctor.wasLocked = type.wasLocked(klass);
                        klass.$ctor.unlock    = type.unlock(klass.$ctor.isLocked);

                        this.find('Cont').prop('$value', type.value(klass));
                    }
                };
            }),
        // === IO === //
            (function IO() {
                return {
                    parent: 'Functor',
                    klass: function IO(x) {
                        this._id = this.id();
                        this.unsafePerformIO = x;
                    },
                    ext: [
                        (function fx(f) {
                            return new this.constructor(f);
                        }),
                        (function of(x) {
                            return new this.constructor(function() {
                              return x;
                            });
                        }),
                        (function pure() {
                            return this.bind(this.constructor.$pure);
                        }),
                        (function nest() {
                            return this.of(this);
                        }),
                        (function map(f) {
                            var thiz = this;
                            return this.fx(function(v) {
                              return f(thiz.unsafePerformIO(v));
                            });
                        }),
                        (function filter(f) {
                            var thiz = this;
                            return this.fx(function(v) {
                                return f(v) ? thiz.unsafePerformIO(v) : undefined;
                            });
                        }),
                        (function join() {
                            var thiz = this;
                            return this.fx(function() {
                              return thiz.unsafePerformIO().unsafePerformIO();
                            });
                        }),
                        (function bind(f) {
                            var thiz = this;
                            return this.fx(function(v) {
                              return f(thiz.unsafePerformIO()).run(v);
                            });
                        }),
                        (function run() {
                            return this.unsafePerformIO.apply(this, arguments);
                        }),
                        (function chain() {
                            return this.unsafePerformIO.apply(this, arguments);
                        }),
                        (function ap(monad) {
                            return monad && monad.map ? monad.map(this.unsafePerformIO) : this.ap(this.of(monad));
                        }),
                        (function apply(monad) {
                            return monad.ap(this);
                        }),
                        (function pipe(f) {
                            return this.fx(this.$fn(f)(this.unsafePerformIO));
                        }),
                        (function lift(f) {
                            return f ? this.map(function(v1) {
                                return function(v2) {
                                    return f.call(this, v1, v2);
                                };
                            }).pure() : this.lift(this.unsafePerformIO);
                        })
                    ],
                    attrs: (function() {
                        return [].slice.call(arguments);
                    })(
                        (function of(x) {
                            return new this(function() {
                                return x;
                            });
                        }),
                        (function pure(x) {
                            return x instanceof Function ? new this(x) : this.of(x);
                        }),
                        (function lift(f) {
                            return this.of(function(v1) {
                                return this.of(function(v2) {
                                    return f.call(this, v1, v2);
                                }).pure();
                            }).pure();
                        })
                    )
                };
            }),
        // === Maybe === //
            (function Maybe() {
                return {
                    klass: function Maybe(x, a) {
                        this.id = this.id();
                        if (x || typeof x != 'undefined')
                            this._x = !a && x instanceof Function && x.length > 1 ? this.fn.curry(x) : x;
                    },
                    ext: [
                        (function prop() {
                            var args = Array.prototype.slice.call(arguments);
                            return this.map(this.property(args.shift()).apply(undefined, args));
                        }),
                        (function get(key) {
                            return this.map(this.pget(key));
                        }),
                        (function values(recur) {
                            return this.map(this.pval(recur));
                        }),
                        (function $isNothing(v) {
                            return v === null || v === undefined || v === false;
                        }),
                        (function isNothing() {
                            return this._x === null || this._x === undefined || this._x === false;
                        }),
                        (function ifSome(mf) {
                            return this.isNothing() || !mf || !(mf instanceof Function) ? null : mf.call(this, this._x);
                        }),
                        (function filter(f) {
                            return this.map(function(v) {
                                if (f(v)) return v;
                            });
                        }),
                        (function chain(f) {
                            if (f instanceof Function) {
                                return this.ifSome(f || unit);
                            }else if (this._x instanceof Function) {
                                return this.ifSome(this.fn.pure(f));
                            }else {
                                return this.ifSome(f);
                            }
                        }),
                        (function orElse(mv) {
                            return this.isNothing() ? new this.constructor(mv instanceof Function ? mv() : mv) : this;
                        }),
                        (function map(mf) {
                            return new this.constructor(this.chain(mf), true);
                        }),
                        (function run(f) {
                            return this.chain(f || unit);
                        }),
                        (function ap(other) {
                            return this.is(other) ? this.map(function(f) {
                                return other.chain(f);
                            }) : this.of(other).map(this._x);
                        }),
                        (function apply(other) {
                            return other.ap(this);
                        }),
                        (function unit() {
                            return this._x;
                        }),
                        (function join() {
                            return this._x;
                        })
                    ],
                    attrs: [
                        (function of(x) {
                            return x && x instanceof this ? x : new this(x);
                        }),
                        (function pure(x) {
                            return new this(x, true);
                        })
                    ],
                    toIO: function($iopure) {
                        return function() {
                            return this.chain($iopure);
                        }
                    },
                    toMaybeIO: function($iof) {
                        return function() {
                            return $iof(this).lift(function(mbfn, value) {
                                return mbfn.ap(mbfn.of(value)).chain(unit);
                            });
                        }
                    },
                    toMaybe: function($maybe) {
                        return function() {
                            return this.map($maybe.of);
                        }
                    },
                    runMaybe: function($maybe) {
                        return function(v) {
                            return $maybe.of(this.run(v));
                        }
                    },
                    init: function(type, klass, sys) {
                        var root = this.$store.root, utils = root.get('utils');
                        var property = klass.prop('property', utils.get('property'));
                        klass.prop('pget', property('get'));
                        klass.prop('pval', property('values'));
                        klass.prop('curry', utils.get('curry'));
                        var IO = this.find('IO');
                        klass.prop('toIO',  type.toIO(IO.pure));
                        klass.prop('toMaybeIO', type.toMaybeIO(IO.of));
                        IO.prop('toMaybe',  type.toMaybe(klass));
                        IO.prop('runMaybe', type.runMaybe(klass));

                        this.root().base.prototype.maybe = klass.of;
                    }
                };
            })
    ),

    (function MakeDispatcher() {

        return [].slice.call(arguments);
    })(
        (function $$DISPATCHER($clean, $schedule, $main, $info, $run, $proc, $shift, $enqueue, $next) {

            var sys  = this.$context.get('sys').run();
            var proc = this.$store.child('process');
            var info = $info.call(proc);
            proc.set('clean',    $clean);
            proc.set('schedule', $schedule);
            proc.set('run',      $run);
            proc.set('shift',    $shift);
            proc.set('proc',     $proc);

            var shared = { tick: false, rafNext: 0, isWorker: sys.isWorker };
            var tick   = proc.set('nextTick', $clean('nxt', shared));

            tick.raf   = !sys.isWorker;
            tick.run   = $run(tick, $proc);

            if (sys.isWorker) {
                tick.schedule = $schedule(proc.get('native.nxt'), Function.prototype.bind.call($main, tick));
            }else {
                tick.schedule = shared.nextTick = proc.get('native.nxt')(Function.prototype.bind.call($main, tick));

                var raf    = proc.set('animFrame', $clean('raf', shared));
                raf.run    = $run(raf,  $shift);
                raf.schedule  = $schedule(proc.get('native.raf'), Function.prototype.bind.call($main, raf));
                raf.enqueue   = $enqueue(raf.store,  raf.schedule);
            }
            tick.enqueue = $enqueue(tick.store, tick.schedule);
            tick.next = this.ctor.find('Cont').prop('next', $next(tick.enqueue));

            return proc;
        }),

        // getCleanInfo //
        (function(code, shared) {
            return {
                ts: 0, ms: 0, buffer: 0, result: 0,
                count: 0, size: 0, length: 0, frameid: 0, index: 0,
                code: code, isRaf: code == 'raf',
                store: [], shared: shared
            };
        }),

        // createSchedule //
        (function(timer, fn) {
            return function() {
                return timer(fn);
            }
        }),

        // createMain //
        (function() {
            var info = this;
            info.currts = self.now();
            info.prevts = info.length ? info.lastts : info.currts;
            if (info.isRaf) {
                if (info.store.length && (info.shared.rafNext = (info.currts + 16.667)))
                    info.schedule();
                else info.shared.rafNext = 0;
                info.run();
                if (info.shared.tick && !(info.shared.tick = 0)) info.shared.nextTick();
            }else if ((info.limit = info.shared.rafNext > info.currts ? info.shared.rafNext : (info.currts + 8)) >= 8) {
                if (!info.run()) {
                    if (!info.raf) info.schedule();
                    else if (!(info.shared.tick = info.shared.rafNext)
                        && ((info.shared.rafNext - info.currts) < 8)) info.schedule();
                }
            }else if (!info.run()) {
                info.schedule();
            }
            info.suspend = false;
        }),

        // createInfo //
        (function() {
            return this.set('stats', (function() {
                var time = 0, lim = 0, len = 0, idx = 0, handle = 0;
                var info = {},
                    count   = info.count   = 0,
                    size    = info.size    = 0,
                    length  = info.length  = 0,
                    maxlen  = info.maxlen  = 0,
                    frameid = info.frameid = 10000,
                    runid   = info.runid   = frameid,
                    ts      = info.ts      = 0,
                    prev    = info.prev    = 0,
                    toggle  = 0,
                    buffer  = info.buffer = 0,
                    handle  = info.handle = 1,
                    next    = [],
                    id      = 0;
                var refs = [ frameid, time, lim, len, idx ];
                return info;
            })(
                this.node('native').parse({
                    sto: self.setTimeout,
                    cto: self.clearTimeout,
                    raf: self.requestAnimationFrame,
                    caf: self.cancelAnimationFrame,
                    siv: self.setInterval,
                    civ: self.clearInterval,
                    nxt: (function(msgchan, sim) {
                        return self.isWorker ? sim() : msgchan;
                    })(
                        (function(process_messages) {
                            var message_channel = new MessageChannel();
                            var message_state   = { queued: false, running: false };
                            function queue_dispatcher()  {
                                if (!(message_state.queued && message_state.running)) {
                                    message_state.queued = true;
                                    message_channel.port2.postMessage(0);
                                }
                            };
                            message_channel.port1.onmessage = function(_) {
                                if (!(message_state.queued = false)
                                    && (message_state.running = true) && !process_messages())
                                        message_state.running = false;//queue_dispatcher();
                                else message_state.queued = message_state.running = false;
                            };
                            return queue_dispatcher;
                        }),
                        (function() {
                            return self.setImmediate;
                        })
                    )
                })
            ));
        }),

        // createRun //
        (function(info, fn) {
            return Function.prototype.bind.call(fn, info);
        }),

        // coreProc //
        (function() {
            var info = this, store = info.store, item;
            info.length = store.length;
            info.size   = info.length;
            info.frameid++;

            while(++info.count && info.size && info.size-- && store.length) {
                if ((item = store[info.index]) && ++item.count && item.next(info)) {
                    store.splice(info.index, 1);
                }else {
                    ++info.index < store.length || (info.index = 0);
                }
                if (info.suspend || (info.limit < (info.lastts = self.now()))) break;
            };
            return (!(info.length = store.length));
        }),

        // coreShift //
        (function() {
            var info = this, store = this.store, idx = 0;
            info.length = store.length;
            info.size   = info.length;
            info.frameid++;
            while(info.length && info.length-- && ++info.count && store.length) {
                if (store[idx].next(info)) store.splice(idx, 1);
                else idx++;
            };
            return (info.lastts = self.now()) && (!(info.length = store.length));
        }),

        // enqueue //
        (function(store, run) {
            return function enqueue(item) {
                if (item && (!(store.length * store.push(item.next ? item : { count: 0, next: item })))) run();
            };
        }),

        // next //
        (function(ext, wrap, combine) {
            return function(enqueue) {
                return ext(wrap(combine, enqueue));
            }
        })(
            (function $ext($wrap) {
                return function $_next(cont) {
                    return $wrap(cont);
                };
            }),
            (function $wrap($combine, $enqueue) {
                return function($body) {
                    return function $_pure($cont) {
                      return $enqueue( $combine( $body, $cont ) );
                    }
                }
            }),
            (function $combine($body, $cont) {
                return function() {
                   $body($cont);
                   return true;
                };
            })
        )
    ),

    (function MakeThreads() {

        return [].slice.call(arguments);
    })(
        // === IMPORT / PARSE === //
            (function $$THREADS() {
                return this.store('utils.importFuncs')([].slice.call(arguments), this.store().child('threads'));
            }),
        // === VALUES === //
            (function lazyValue(v) { return (function() { return v; }); }),
            (function lazyFunction(f) { return (function() { return f(); }); }),
            (function atom(f, t) {
                return function() {
                    return f(t);
                };
            }),
            (function atomize(f) {
                return function() {
                    var args = arguments;
                    return atom(function() {
                        return f.apply(null, args);
                    });
                };
            }),
            (function bindLazy(v, f) {
                return function() {
                    return f(v())();
                };
            }),
            (function $_mapLazy($_atom) {
                return function mapLazy(f) {
                    return function(v) {
                        return $_atom(f, v);
                    }
                }
            }),
        // === INSTRUCTIONS === //
            (function pure(value)   { return { pure: true,  value: value }; }),
            (function roll(functor) { return { pure: false, value: functor }; }),
            (function $_makeThread($_pure) {
                return function makeThread(value) {
                    return function() { return $_pure(value); };
                };
            }),
            (function $_wrap($_roll) {
                return function wrap(instruction) {
                    return function() { return $_roll(instruction); };
                }
            }),
            (function makeInstruction() {
                var modeConfig = {
                  yield:  { ps9:  true  },
                  cont:   { cont: true  },
                  suspend:{ susp: true, ps9: true },
                  done:   { done: true  },
                  fork:   { us0:  true, ps1: true },
                  branch: { us9:  true  }
                };
                return function makeInstruction(mode, next) {
                  return { mode: mode, next: next, cf: modeConfig[mode] };
                };
            })(),
            (function $_instructionMap($_makeInstruction) {
                return function instructionMap(instruction, f) {
                    return $_makeInstruction(instruction.mode, instruction.next.map(f));
                }
            }),
        // === BIND AND LIFT === //
            (function $_bindThread($_bindLazy, $_instructionMap, $_wrap, $_roll) {
                return function bindThread(lazyValue, f) {
                    return $_bindLazy(lazyValue, function(free) {
                        return free.pure || !free.value
                            ? f(free.value || free)
                            : (free.kont || (free.kont = $const($_roll($_instructionMap(free.value, function(v) {
                                return bindThread(v, f);
                            })))));
                    });
                }
            }),
            (function $_lift($_bindLazy, $_makeThread) {
                return function lift(lazyValue) {
                    return $_bindLazy(lazyValue, $_makeThread);
                }
            }),
            (function $_liftFn($_makeThread) {
                return function liftFn(fn) {
                    return function(value, free, inst) {
                        return makeThread(fn(value, free, inst));
                    }
                }
            }),
            (function $_liftF($_instructionMap, $_makeThread, $_wrap) {
                return function(instruction) {
                    return $_wrap($_instructionMap(instruction, $_makeThread));
                }
            }),
            (function $_mapThread($_bindThread, $_makeThread) {
                return function mapThread(lazyValue, f) {
                    return $_bindThread(lazyValue, function(v) {
                        return $_makeThread(f(v));
                    });
                }
            }),
            (function makeBind() {
                return [].slice.call(arguments).apply();
            })(
                (function(bind, make, wrap) {
                    return function $_makeBind($_roll, $_makeInstruction, $_bindLazy, $_lazyValue, $_pure, $_mapLazy) {
                        return bind(make, wrap, {
                            roll: $_roll,
                            makeInstruction: $_makeInstruction,
                            bindLazy: $_bindLazy,
                            lazyValue: $_lazyValue,
                            pure: $_pure,
                            mapLazy: $_mapLazy
                        });
                    }
                }),
                (function bind(make, wrap, func) {
                    return function makeBind(f, x) {
                        return wrap.call(func, make(func), f, x || {});
                    }
                }),
                (function make(x) {
                    return {
                        next: function(v) {
                            return x.roll(x.makeInstruction('yield', [ this.run(v) ]));
                        },
                        bind: function(v, f) {
                            return x.roll(x.makeInstruction('yield', [ x.bindLazy($const(v), f) ]));
                        },
                        then: function(v) {
                            return this.run(v);
                        },
                        done: function(v) {
                            return x.pure(v);
                        }
                    };
                }),
                (function wrap(b, f, x) {
                    b.data = $const(x);
                    return (b.run = this.mapLazy(f.bind(b)));
                })
            ),

        // === ARR THREAD
            (function makeArr(x, f, k) {
                return function() {
                    if (x.i < x.arr.length) {
                        x.res[x.i] = f(x.arr[x.i], x.i++, x.arr);
                        if (k && x.i == x.arr.length) {
                            x.res = k(x.res);
                        }
                    }
                    return x.i < x.arr.length ? x.next : x.pure;
                }
            }),
            (function $_arrThread($_makeArr, $_makeInstruction) {
                return function arrThread(f, k, m) {
                    return function(arr) {
                        var x  = { arr: arr, i: 0, res: arr.map($const()) };
                        x.next = { pure: false, value: $_makeInstruction(m || 'yield', [ $_makeArr(x, f, k) ]) };
                        x.pure = { pure: true,  value: x.res };
                        return $const(x.next);
                    }
                }
            }),
        // === QUEUE THREAD
            (function makeQueue(x, f, k) {
                return function() {
                    if (x.arr.length) {
                        if (f(x.arr[(x.i<x.arr.length?x.i:(x.i=0))], x.item++, x.run++) && !(x.item = 0))
                            if (x.i) x.arr.splice(x.i, 1);
                            else x.arr.shift();
                        else
                            x.i++;
                        if (k && !x.arr.length) k(x);
                    }
                    return x.arr.length ? x.next : x.pure;
                }
            }),
            (function $_queueThread($_makeQueue, $_makeInstruction) {
                return function queueThread(f, k, m) {
                    return function(arr) {
                        var x  = { arr: arr, i: 0, item: 0, run: 0 };
                        x.next = { pure: false, value: $_makeInstruction(m || 'yield', [ $_makeQueue(x, f, k) ]) };
                        x.pure = { pure: true,  value: x };
                        return $const(x.next);
                    }
                }
            }),
        // === LIST THREAD
            (function makeList(x, f, k) {
                return function() {
                    if (x.arr.length) {
                        if ((x.arr = x.arr.filter(function(v, i) {
                            return !f(v);
                        })) && k && !x.arr.length) k(x);
                    }
                    return x.arr.length ? x.next : x.pure;
                }
            }),
            (function $_listThread($_makeList, $_makeInstruction) {
                return function listThread(f, k, m) {
                    return function(arr) {
                        var x  = { arr: arr.splice(0), i: 0, item: 0, run: 0 };
                        x.next = { pure: false, value: $_makeInstruction(m || 'yield', [ $_makeList(x, f, k) ]) };
                        x.pure = { pure: true,  value: x.arr.slice(0) };
                        return $const(x.next);
                    }
                }
            }),
        // === RUN, YIELD, DONE

            (function $_yyield($liftF, $_makeInstruction) {
                return function yyield() {
                  return $_liftF($_makeInstruction('yield', [null]));
                }
            }),
            (function runThreads(threads, status) {
                var free, inst, next, count = 0, index = 0;
                return function(info) {
                    if (++status.count && (status.length = threads.length) > 0) {
                        free = threads[0](info);
                        if (free && free.pure === false) {
                            if (!free.cont) {
                                threads.shift();
                                inst = free.value;
                                next = inst.next;
                                if (inst.cf.ps9) {
                                    threads.push.apply(threads, next);
                                }else if (inst.cf.us0) {
                                    threads.unshift(next[0]);
                                    threads.push.apply(threads, next.slice(1));
                                }
                            }
                            count++;
                        }else {
                            threads.shift();
                        }
                        if (inst.cf.susp && count == threads.length && (info.suspend = true))
                            count = 0;

                        if (threads.length > status.maxlen) status.maxlen = threads.length;
                    }
                    return !(status.length = threads.length);
                }
            }),
            (function addThreads(make, wrap) {
                return function $_addThreads($_runThreads) {
                    return function addThreads(threads, enqueue, name) {
                        return make(wrap, $_runThreads, threads, enqueue, {
                            name: name, count: 0, maxlen: 0
                        });
                    }
                };
            })(
                (function(wrap, make, threads, enqueue, status) {
                    return {
                        enqueue: wrap(make(threads, status), threads, enqueue),
                        status: $const(status)
                    };
                }),
                (function(run, threads, enqueue) {
                    return function() {
                        if (!(threads.length * threads.push.apply(threads, arguments))) {
                            enqueue(run);
                        }
                    }
                })
            )
    ),

    (function MakeEngineCore() {

        return [].slice.call(arguments);
    })(
        // === Engine === //
            (function $$ENGINE() {

                var root    = this.store();
                var utils   = this.store('utils');
                var ctor    = this.ctor.root();
                var threads = this.store('threads');
                var process = this.store('process');
                var items   = [].slice.call(arguments);

                return items.shift().call(items.shift().apply({
                    ctor: ctor, fn: root.get('sys.fn'),
                    get: utils.get('target')(threads)('path'),
                    utils: utils, threads: threads, process: process,
                    async: items.remove(0).append(utils, root.child('async'), process).apply(),
                    components: root.child('components'),
                    enqueue: process.get('nextTick.enqueue')
                }, items));
            }),
            (function use() {
                var cont = this.ctor.find('Cont');
                cont.prop('lazy', this.async.get('lazy'));
                cont.prop('result', this.process.get('lazy'));
                cont.prop('then', this.async.get('then'));
                return this;
            }),
            (function make() {
                return [].slice.call(arguments).reduce(function(r, v, i, o) {

                    var def = v.call(r);
                    if (def.klass && def.klass.name == 'Bind') {
                        def.ext.unshift(def.ext.remove(2).shift().call(undefined, r.utils.get('extend'),
                            { pure: true, arr: true, val: true, cont: false, other: true, done: true }));
                    }
                    if (def.parent) {
                        r.ctor.find(def.parent).parse(def);
                    }else {
                        r.ctor.parse(def);
                    }
                    return r;

                }, this);
            }),
        // === Async === //
            (function() {

                return [].slice.call(arguments);
            })(
                // === IMPORT / PARSE === //
                    (function $$ASYNC() {
                        var items = [].slice.call(arguments);
                        return function(utils, $async, process) {
                            $async.set('lazy', items.shift()(process, 'nextTick.enqueue'));
                            $async.set('then', items.shift()($async.get('lazy')));
                            utils.set('fromCallback', items.shift().call(process));
                            return utils.get('importFuncs')(items, $async);
                        }
                    }),
                    (function scheduledBindWrap() {
                        return [].slice.call(arguments).apply();
                    })(
                        (function wrapDispatcher(wrap, make, start, cont, done) {
                            return function bindDispatch(scheduler, timer) {
                                var wrapped = scheduler.set('wrapped', wrap(scheduler));
                                scheduler.set('lazy', wrapped(make(done, cont, timer)));
                                return wrapped(make(done, start, timer));
                            }
                        }),
                        (function WrapTimers(scheduler) {
                            return function $schedulerWrap(fn) {
                                return fn(scheduler);
                            }
                        }),
                        (function MakeWrap(wrapper, starter, path) {
                            return function(scheduler) {
                                return starter(scheduler.get(path), wrapper);
                            }
                        }),
                        (function StartWrap(schedule, wrapper) {
                            return function enqueue(succ) {
                                return function $_cont(result) {
                                    return schedule(wrapper(succ, result));
                                }
                            }
                        }),
                        (function ContWrap(schedule, wrapper) {
                            return function lazyR(result) {
                                return function $_pure(succ) {
                                    return schedule(wrapper(succ, result));
                                }
                            }
                        }),
                        (function $_next(succ, result) {
                            return function() { succ(result); return true; };
                        })
                    ),
                    (function monadicBindWrap() {
                        return [].slice.call(arguments).apply();
                    })(
                        (function makeBind(make, box) {
                            return function then(enqueue) {
                                return make(box, enqueue);
                            }
                        }),
                        (function make(box, enqueue) {
                            return function then(x, f) {
                                return function $_pure(succ, fail) {
                                    return x(box(f, enqueue(succ), fail), fail);
                                }
                            };
                        }),
                        (function box(f, succ, fail) {
                            return function(t) {
                                return f(t)(succ, fail);
                            };
                        })
                    ),
                    (function fromCallback(run, list, make, wrap, tick) {
                        return function $_fromCallback() {
                            return make(list(run, this.get('nextTick.enqueue')), wrap(tick));
                        }
                    })(
                        (function $run(tick, enqueue, list) {
                            return function run() {
                                if (!(list.length * list.push.apply(list, Array.prototype.slice.call(arguments))))
                                    enqueue(tick);
                                if (!arguments.length) return run;
                            };
                        }),
                        (function $list(run, enqueue) {
                            return function(tick) {
                                return function(list) {
                                    return run(tick, enqueue, list);
                                };
                            };
                        }),
                        (function $make(next, from) {
                            return function fromCallback(continuation) {
                                var arr = [];
                                return next(from(arr)(continuation))(arr);
                            };
                        }),
                        (function $wrap(fn) {
                            return function(arg1) {
                                return function(arg2) {
                                    return fn(arg1, arg2);
                                };
                            };
                        }),
                        (function $tick(arr, continuation) {
                            return function tick() {
                                if (arr.length) continuation(arr.shift());
                                return !arr.length;
                            };
                        })
                    ),
                    (function pure(t) {
                        return function $_pure(f) {
                            return f(t);
                        }
                    }),
                    (function cast(t) {
                        return t && t instanceof Function && t.name.substr(-4) == 'pure' ? t : function $_pure(f) {
                            return f(t);
                        }
                    }),
                    (function inject(f) {
                        return function $_pure(succ, fail) {
                            succ(f());
                        };
                    }),
                    (function eject(x, f) {
                        return function $_pure(succ, fail) {
                            x(function(result) {
                                succ(f(result));
                            }, fail);
                        };
                    }),
                    (function count(cnt, block) {
                        return function $_pure(succ, fail) {
                            var i = 0;
                            (function f(v) {
                                i++ < cnt ? block(i)(f, fail) : succ(v);
                            })(undefined);
                        };
                    }),
                    (function $_times($_count) {
                        return function times(cnt, block) {
                            return $_count(cnt, function() {
                                return block;
                            });
                        };
                    }),
                    (function delay(x, ms) {
                        return function $_pure(k) {
                            x(function(v) {
                                ms ? self.setTimeout(function() {
                                    k(v);
                                }, ms) : k(v);
                            });
                        };
                    }),
                // ===== AsyncAP ===== //
                    (function ap(f, x) {
                        return function $_pure(succ, fail) {
                            var _f;
                            var _x;
                            var count = 0;
                            function fin() {
                                if (++count === 2)
                                    succ(_f(_x));
                            }
                            f(function (g) {
                                _f = g;
                                fin();
                            }, fail);
                            x(function $_pure(r) {
                                _x = r;
                                fin();
                            }, fail);
                        };
                    }),
                    (function get(f) {
                        return function(r) {
                            return f(r && r instanceof Array && r.length == 1 ? r.first() : r);
                        }
                    }),
                // ===== AsyncFMAP ===== //
                    (function $_fmap($_ap, $_pure) {
                        return function fmap(xs, f) {
                            return $_ap($_pure(f), xs);
                        };
                    }),
                // === FlatMap Bind Array == //
                    (function flatmap() {
                        return [].slice.call(arguments).apply();
                    })(
                        (function make($_flat) {
                            return function flatmap(k, f) {
                                return $_flat(k, f || unit);
                            };
                        }),
                        (function() {
                            function flat(x, f) {
                                return Array.prototype.concat.apply([], x.map(f));
                            };
                            function bind(f) {
                                function bound(x) {
                                    return x instanceof Array ? flat(x, bound) : f(x);
                                };
                                return bound;
                            };
                            return function(k, f) {
                                return function(v) {
                                    return k(flat(v instanceof Array ? v : [ v ], bind(f)));
                                }
                            };
                        })()
                    ),
                    (function $combine(make) {
                        function combine(x, f, a) {
                            return x.bind(make(function(v, t, i, j) {
                                return f(v, t, i, j);
                            }, a, x.length));
                        };
                        combine['$$_scope'] = { make: make };
                        return combine;
                    })(
                        (function makeCombi(f, a, l) {
                            var i = -1;
                            return function(v) {
                                var j = 0;
                                if (i == l) i = 0;
                                return a.map(function(x) {
                                    return f(v, x, !j ? ++i : i, j++);
                                });
                            }
                        })
                    ),
                    (function select() {
                        return [].slice.call(arguments).apply();
                    })(
                        (function make($_map, $_filtered, $_select) {
                            function select(f, m) {
                                return this.chain($_select($_filtered(f || $const(true), m || $_map)));
                            };
                            select['$$_scope'] = { '$_map': $_map, '$_filtered': $_filtered, '$_select': $_select };
                            return select;
                        }),
                        (function(v) {
                            return v && v.bind ? v.bind(unit) : v;
                        }),
                        (function(f, m) {
                            function $map(v) {
                                return Array.prototype.concat.apply([], (v instanceof Array ? v : [ v ]).map(function(x) {
                                    return (x instanceof Array ? $map(x) : [ x ]).filter(f);
                                }));
                            };
                            function $wrap(x) {
                                var o = x.aid();
                                o.arr = false;
                                return x.collect(o, function(x) {
                                    return x.map(function(v) {
                                        return v instanceof Array ? $wrap(v.map(m)) : v;
                                    }).collect(o, $map);
                                });
                            };
                            function $run(x) {
                                return $wrap(x.map(m));
                            };
                            return $run;
                        }),
                        (function(f) {
                            return function $_select(x) {
                                if (x instanceof Array) {
                                    return x.map($_select).chain(f);
                                }else {
                                    return x;
                                }
                            };
                        })
                    ),
                // === XHR === //
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
                    (function(wrap, parser, loader) {
                        return function $_script($_pure) {
                            return wrap(loader, parser, $_pure);
                        }
                    })(
                        (function(loader, parser, pure) {
                            return function script(url, key) {
                                return loader(pure(parser(url, key)));
                            }
                        }),
                        (function(url, ref) {
                            if (typeof url == 'string') {
                                if (url.substr(-3, 3) != '.js') url = { url: url };
                            }else if (typeof url == 'object') {
                            }
                            if (ref) {
                                url.ref = ref;
                            }
                            if (url.url && url.url.slice(-3) != '.js') url.url += '.js';
                            url.url = url.url.replace(/\$/g, '');
                            return url;
                        }),
                        (function(url) {
                            return function $_pure(succ, fail) {
                                url(function (info) {
                                    var head = document.getElementsByTagName('head')[0];
                                    var url  = info.url;
                                    var ref  = info.ref;
                                    var ext  = url.split('.').slice(-1), script;
                                    if (ref && (script = head.querySelector('[src="' + url + '"]'))) {
                                        succ(script);
                                    }else {
                                        if (ext == 'css') {
                                            script = document.createElement("link");
                                            script.type = 'text/css';
                                            script.rel  = 'stylesheet';
                                            script.href = url;
                                        }else {
                                            script = document.createElement("script");
                                            if (ext == 'tmpl') {
                                                script.type = 'text/template';
                                            }
                                            script.src = url;
                                            script.setAttribute('data-state', 'init');
                                        }
                                        if (ref) {
                                            script.setAttribute('data-ref', ref);
                                        }
                                        script.addEventListener('load', function () {
                                            this.setAttribute('data-state', 'done');
                                            succ(this);
                                        });
                                        script.addEventListener("error", function() {
                                            this.setAttribute('data-state', 'fail');
                                            fail(this);
                                        });
                                        script.setAttribute('data-state', 'load');
                                        head.appendChild(script);
                                    }
                                }, fail);
                            };
                        })
                    ),
                    (function $_request($_newxhr, $_pure) {
                        return function request(url, options) {
                            var request;
                            if (typeof (url) === "object") request = $_pure(url);
                            else if (typeof (url) === "string") request = $_pure({ 'url' : url, 'cached' : (options === true) });
                            else request = url;
                            return function (succ, fail) {
                                request(function (_request) {
                                    var xhr = $_newxhr(), type = _request.type || 'GET';
                                    xhr.onload = function () {
                                        succ(xhr.responseText);
                                    };
                                    xhr.onerror = function (e) {
                                        e.preventDefault();
                                        fail('masync.' + type + ': ' + e.toString());
                                    };

                                    var url = _request.url;
                                    if (url.slice(0, 4) != 'http') {
                                        url = self.location.origin+self.location.pathname.replace('core/worker.js', '')+url;
                                    }
                                    xhr.open(type, url);
                                    xhr.setRequestHeader('HTTP_X_REQUESTED_WITH', 'XMLHttpRequest');
                                    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

                                    if (type == 'POST') {
                                        xhr.setRequestHeader('Content-Type', _request.contentType || 'application/json');
                                    }
                                    if (_request.auth) {
                                        xhr.setRequestHeader('Authorization', _request.auth);
                                    }
                                    if (_request.accept) {
                                        xhr.setRequestHeader('Accept', _request.accept);
                                    }else {
                                        xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
                                    }
                                    if (!_request.cached) {
                                        xhr.setRequestHeader('Pragma', 'no-cache');
                                        xhr.setRequestHeader('Cache-Control', 'no-cache');
                                        xhr.setRequestHeader('If-Modified-Since', 'Thu, 01 Jun 1970 00:00:00 GMT');
                                    }
                                    if (_request.type == 'GET' || !_request.data) return xhr.send();
                                    else return xhr.send(_request.data);
                                }, fail);
                            };
                        }
                    })
            ),
        // === Thread === //
            (function() {
                return {
                    klass: function Thread(f, t) {
                        this._id = this.id();
                        this._x  = f;
                        this._t  = t || '$enqueue';
                    },
                    ext: [
                        { name: '$fn', value: this.get },
                        { name: '$proc', value: this.process },
                        { name: '$next', value: this.enqueue },
                        { name: '$make', value: this.get('addThreads') },
                        { name: '$enqueue', value: this.get().set('enqueue', this.get('addThreads')([], this.enqueue, '$enqueue')) },
                        { name: '$anim', value: this.get().set('anim',
                            this.get('addThreads')([], this.process.get('animFrame.enqueue'), '$anim'))
                        },
                        (function map(f) {
                            return new this.constructor(this.$fn('mapThread')(this._x, f), this._t);
                        }),
                        (function bind(f, x) {
                            return new this.constructor(this.$fn('bindThread')(this._x, this.$fn('makeBind')(f, x)), this._t);
                        }),
                        (function run(f) {
                            this[this._t].enqueue(f ? this.$fn('mapThread')(this._x, f) : this._x);
                        }),
                        (function info() {
                            return this[this._t];
                        })
                    ],
                    attrs: (function() {
                        return [].slice.call(arguments).apply();
                    })(
                        (function(t, p, of, arr, que, lst, wrap, raf) {
                            var parse = p(t);
                            var bindL = t.get('bindLazy');
                            var lazyV = t.get('lazyValue');
                            return [
                                parse,
                                of(parse),
                                arr(bindL, lazyV, t.get('arrThread')),
                                que(bindL, lazyV, t.get('queueThread'), wrap),
                                lst(bindL, lazyV, t.get('listThread'), wrap),
                                raf
                            ];
                        }),
                        this,
                        (function(cmd) {
                            return function parse(v) {
                                if (v instanceof Function) {
                                    return v;
                                }else {
                                    return cmd.get('lazyValue')(v);
                                }
                            }
                        }),
                        (function(parse) {
                            return function of(v) {
                                return new this(parse(v));
                            }
                        }),
                        (function(bindLazy, lazyValue, arrThread) {
                            return function arr(a, f, k, m) {
                                return new this(bindLazy(lazyValue(a), arrThread(f, k, m)));
                            }
                        }),
                        (function(bindLazy, lazyValue, queThread, wrapThread) {
                            return function queue(a, f, k, t, m) {
                                return wrapThread(a, new this(bindLazy(lazyValue(a), queThread(f, k, m)), t));
                            }
                        }),
                        (function(bindLazy, lazyValue, listThread, wrapThread) {
                            return function list(a, f, k, t, m) {
                                return wrapThread(a, new this(bindLazy(lazyValue(a), listThread(f, k, m)), t));
                            }
                        }),
                        (function(wrap) {
                            return function(arr, thread) {
                                return wrap(wrap, arr, thread);
                            }
                        })(
                            (function(wrap, arr, thread) {
                                return {
                                    info: function() {
                                        return arr;
                                    },
                                    bind: function(f, x) {
                                        return wrap(wrap, arr, thread.bind(f, x));
                                    },
                                    push: function() {
                                        if (!(arr.length * arr.push.apply(arr, arguments))) {
                                            thread.run();
                                        }
                                        return this;
                                    },
                                    add: function() {
                                        arr.push.apply(arr, arguments);
                                        return this;
                                    },
                                    run: function(f) {
                                        thread.run(f);
                                        return this;
                                    }
                                };
                            })
                        ),
                        (function raf(a, f, k) {
                            return this.list(a, f, k, '$anim', 'suspend');
                        })
                    )
                };
            }),
        // === Bind === //
            (function() {
                return {
                    klass: function Bind(f, x, m) {
                        if (f) this._f = f;
                        if (x) this._x = x;
                        if (m) this._m = m;
                    },
                    ext: [
                        (function collect() {
                            return [].slice.call(arguments).apply();
                        })(
                            (function wrap(_$_close, $wrap, $cont, $collect, $make, $pure, $run, $set, $next) {
                                function collect(scheduler, async) {
                                    return _$_close.call({}, $wrap, $collect, $cont(
                                        $pure($next, scheduler.get('nextTick.enqueue')),
                                            $run, $set, $const(undefined), async.lazy), scheduler.parent('utils.extend'),
                                                { pure: true, arr: true, cont: false, val: true, other: true, done: true }, $make)
                                };
                                collect['$$_scope'] = [].slice.call(arguments).reduce(function(r, v) {
                                    r[v.name] = v;
                                    return r;
                                }, {});
                                return collect;
                            }),
                            (function _$_close(wrap, collect, make, extend, proc, run) {
                                this.make = make;
                                this.wrap = collect(this.make, extend, proc);
                                this.collect = wrap(this.wrap, run);
                                return this;
                            }),
                            (function _$_wrap($collect, $make) {
                                return function collect(x, p, f) {
                                    return $make($collect, x, p, f);
                                } 
                            }),
                            (function _$_cont($pure, $run, $set, $empty, $lazy) {
                                return function wrap(x, k, p, f) {
                                    return $pure(x.slice(0),
                                        $run(wrap, $set(0, x.map($empty), $lazy(k), f || unit), p));
                                }
                            }),
                            (function _$_run($run, $extend, $proc) {
                                return function run(x) {
                                    return function(k, p, f) {
                                        return $run(x, k, p ? $extend($extend({}, $proc), p) : $proc, f);
                                    }
                                };
                            }),
                            (function _$_make(m, x, p, f) {
                                return function $_pure(k) {
                                    return m(x)(k, p, f);
                                };
                            }),
                            (function pure(next, enqueue) {
                                return function(x, f) {
                                    enqueue(next(x, f));
                                }
                            }),
                            (function map(get) {
                                return function make(collect, set, proc) {
                                    return get(collect, set, proc);
                                }
                            })(
                                (function get(run, set, proc) {
                                    return function collect(x, i) {
                                        if (proc.pure && x instanceof Function && x.name == '$_pure') {
                                            return x(function(r) {
                                                collect(r, i);
                                            });
                                        }else if (proc.arr && x instanceof Array) {
                                            return x.length ? run(x, set(i), proc) : set(i)(x);
                                        }else if (proc.val) {
                                            return set(i)(x);
                                        }
                                    };
                                }),
                                (function run(set) {
                                    return function(i) {
                                        return function(r) {
                                            return set(r, i);
                                        }
                                    };
                                })
                            ),
                            (function set(c, v, k, f) {
                                return function(i) {
                                    return function(r) {
                                        v[i] = r;
                                        if (++c == v.length) {
                                            k(f(v));
                                        }
                                    }
                                }
                            }),
                            (function next(x, f) {
                                var i = 0; l = x.length;
                                return function() {
                                    if (x.length) {
                                        f(x.shift(), i++);
                                    }
                                    return !x.length;
                                }
                            })
                        ),
                        (function each(map, bind) {
                            return function each(x, f) {
                                return x.chain(bind(map(f)));
                            };
                        })(
                            (function(f) {
                                return function(x) {
                                    return x instanceof Array ? x.flatten().chain(f) : x;
                                }
                            }),
                            (function(f) {
                                return function each(x) {
                                    if (x instanceof Array) {
                                        return x.map(f);
                                    }else {
                                        return x;
                                    }
                                };
                            })
                        ),
                        // === Monadic Bind Array == //
                        (function bind() {
                            var args = [].slice.call(arguments);
                            return function(extend, proc) {
                                return args.append(extend, proc).apply();
                            }
                        })(
                            (function make(main, init, make, bind, $_map, $_make, $_bind, $_wrap, extend, proc) {
                                return bind(main($_wrap, extend, proc), init($_map, $_bind), make($_make, $_map));
                            }),
                            (function main($_wrap, $extend, $proc) {
                                function $_main(f, p) {
                                    return $_wrap(f, !p.done ? $extend(p, $proc) : p);
                                };
                                $_main['$$_scope'] = [].slice.call(arguments).reduce(function(r, v) {
                                    if (v && v.name && v instanceof Function) r[v.name] = v;
                                    return r;
                                }, {});
                                return $_main;
                            }),
                            (function init($_map, $_bind) {
                                return function $_init(w) {
                                    return $_bind(w, $_map);
                                }
                            }),
                            (function make($_bind, $_map) {
                                function $_make(f, x) {
                                    return $_map(f, x);
                                };
                                $_make['$$_scope'] = [].slice.call(arguments).reduce(function(r, v) {
                                    r[v.name] = v;
                                    return r;
                                }, {});
                                return $_make;
                            }),
                            (function(main, init, make) {
                                function bind(f, p) {
                                    p || (p = this.aid());
                                    return make(init(main(f, p)), this).aid(p);
                                };
                                bind['$$_scope'] = [].slice.call(arguments).reduce(function(r, v) {
                                    r[v.name] = v;
                                    return r;
                                }, {});
                                return bind;
                            }),
                            (function map(f, x) {
                                return x && x instanceof Array ? x.map(f(x)) : x;
                            }),
                            (function make(x, f, m) {
                                return function $_pure(k) {
                                    return k(m(f, x.slice(1)));
                                }
                            }),
                            (function bind(f, m) {
                                return function next(o) {
                                    return function bound(x, i) {
                                        return x instanceof Array ? m(next, x) : f(x, i, o);
                                    };
                                };
                            }),
                            (function $_closed(f, p) {
                                return function closed(x, i, o) {
                                    return function $_pure(k) {
                                        if (p.pure && x instanceof Function && x.name == '$_pure') {
                                            return x(function(r) {
                                                return closed(r, i, o)(k);
                                            });
                                        }else if (p.arr && x instanceof Array) {
                                            return x.length == 1 ? closed(x.shift(), i, o)(k)
                                            : (!x.length ? k(x) : x.map(closed).make(k, p));//x.bind(m(x), p).run(k));
                                        }else if (p.cont && x && x.cont instanceof Function && x.cont.name == '$_cont') {
                                            return closed(x.cont(), i, o)(k);
                                        }else if (p.val) {
                                            return k(f(x, i, o));
                                        }
                                    }
                                }
                            })
                        ),
                        (function cont() {
                            return sys().klass('Cont').of(this, function(a) {
                                return function $_pure(k) {
                                    return a.wrap(k);
                                }
                            });
                        }),
                        (function make(bind, run) {
                            return function make(b, m) {
                                return bind(run, b, m || unit);
                            }
                        })(
                            (function bind(r, b, m) {
                                return function(f, g) {
                                    return r(b(f, g, m), g);
                                }
                            }),
                            (function run(f, g) {
                                return function(v, r) {
                                    r || (r = {});
                                    return g(v).bind(f(r, v, 0)).bind(unit).chain($const(r));
                                }
                            })
                        ),
                        (function run(f) {
                            return this.make(this._f, this._m)(f, this._x);
                        })
                    ],
                    attrs: [
                        (function pure(f, g, m) {
                            return new this(f, g, m);
                        })
                    ],
                    init: (function(wrap, set, make, ext) {
                        return function(type, klass, sys) {
                            return ext(make.call(set(wrap({
                                klass: klass,
                                scheduler: sys.root.get('process'),
                                enqueue: sys.root.get('process.nextTick.enqueue'),
                                fn: sys.root.get('sys.fn'), Cont: klass.find('Cont').of,
                                aid: this.makeID('arr'),
                                utils: sys.root.get('utils').select('call', 'call1', 'call2', 'pass', 'target', 'extend'),
                                async: sys.root.get('async').select('pure', 'cast', 'make', 'select', 'get', 'next', 'combine', 'flatmap', 'fmap', 'wrap', 'then', 'lazy')
                            }))));
                        };
                    })(
                        (function(ext) {
                            ext.cont = ext.fn.andThen(ext.async.cast);
                            return ext;
                        }),
                        (function(ext) {
                            var set = ext.klass.prop('collect')(ext.scheduler, ext.async);
                            Array.prototype.collect = ext.utils.call2(set.collect);
                            Array.prototype.wrap    = ext.utils.pass(set.wrap);
                            Array.prototype.make    = ext.utils.call2(set.make);
                            Array.prototype.arrid   = ext.aid;
                            return ext;
                        }),
                        (function() {
                            Array.prototype.aid = function(aid) {
                                return aid && (this._aid = aid) ? this : (this._aid || (this._aid = { aid: this.arrid() }));
                            };
                            Array.prototype.each    = this.utils.call1(this.klass.prop('each'));
                            Array.prototype.bind    = this.klass.prop('bind');
                            Array.prototype.next    = this.utils.call2(this.async.next);
                            Array.prototype.combine = this.utils.call2(this.async.combine);
                            Array.prototype.target  = this.utils.target;
                            Array.prototype.select  = this.async.select;
                            Array.prototype.call    = function(key) {
                                return this.bind(this.target(key));
                            };
                            Array.prototype.ap = function() {
                                return this.combine(function(x, y) {
                                    return y.run(x);
                                }, [].slice.call(arguments));
                            };
                            Array.prototype.lift = function(f) {
                                return [ this.fmap(function(xs) {
                                    return f.apply(undefined, xs);
                                }) ];
                            };
                            Array.prototype.fold = function(f, r) {
                                return [ this.fmap(function(xs) {
                                    return f.apply(undefined, xs);
                                }) ];
                            };
                            Array.prototype.flatten = function() {
                                return this.flatmap(unit);
                            };
                            Array.prototype.chain = function(f) {
                                return [ this.fmap(function(r) {
                                    return f(r && r.length == 1 ? r.first() : r);
                                }) ];
                            };
                            return this;
                        }),
                        (function(ext) {
                            Array.prototype.run = function(/* k, o, f */) {
                                var args = [].slice.call(arguments), k, o, f;
                                while (args.length) {
                                    if (args.length && typeof args[0] == 'object') o = args.shift();
                                    else if (args.length && args[0] instanceof Function) {
                                        if (!k) k = args.shift(); if (!f) f = args.shift();
                                    }
                                }
                                o || (o = {}); o.aid || (o.aid = this.arrid());
                                return this.bind(f || unit, o).wrap(ext.async.get(k || unit), o);
                            };
                            Array.prototype.fmap = function(f) {
                                return ext.async.then(this.collect(), ext.cont(f));
                            };
                            Array.prototype.flatmap = function(f) {
                                return this.bind(f).chain(ext.async.flatmap(unit));
                            };
                            Array.prototype.cont = function() {
                                return ext.Cont(this.collect(), function(a) {
                                    return function $_pure(k) {
                                        return a.chain(k).wrap(unit);
                                    }
                                });
                            };
                            return ext;
                        })
                    )
                };
            }),
        // === Obj === //
            (function() {
                return {
                    klass: function Obj(x, r, p) {
                        if (!(this instanceof Obj)) return new Obj(x, r);
                        this._root   = $const(r || this);
                        this._parent = p ? $const(p) : this._root;
                        Object.assign(this, this.reduce(unit, x));
                    },
                    ext: [
                        (function of(v) {
                            return new this.constructor(v, this.root(), this);
                        }),
                        (function isBase(v) {
                            return (v || (v = this)).constructor === Function;
                        }),
                        (function map(f) {
                            return Object.keys(this).map(f);
                        }),
                        (function keys() {
                            return Object.keys(this).filter(function(v, i, o) {
                                return v.substr(0, 1) != '_';
                            });
                        }),
                        (function get(key) {
                            return this[key];
                        }),
                        (function set(key, value) {
                            return this[key] = value;
                        }),
                        (function call() {
                            var args = [].slice.call(arguments);
                            if (args.length && args.unshift('fn')) return this.path.call(this._root(), args.join('.'));
                            return this._root();
                        }),
                        (function root(path) {
                            return path ? this.path.call(this._root(), path) : this._root();
                        }),
                        (function parentt(path) {
                            return path ? this.path.call(this._parent(), path) : this._parent();
                        }),
                        (function extend(v, u) {
                            Object.assign(this, this.reduce(unit, v, u || false));
                            return this;
                        }),
                        (function update(v) {
                            Object.assign(this, this.reduce(unit, v, true));
                            return this;
                        }),
                        (function reduce(f, v, u) {
                            return this.keys.call(v).reduce(function(r, k, i, o) {
                                var x = f(v[k], k, i, o);
                                if (r[k] && r.is(r[k])) {
                                    r[k].extend(x, u);
                                }else if (u && r[k]) {
                                    // update so no overwrites
                                }else {
                                    r[k] = x instanceof Array
                                        ? x : (r.isObject(x) ? r.of(x) : x);
                                }
                                return r;
                            }, this);
                        }),
                        (function bind(b, m) {
                            return function bind(f, r) {
                                return b(f, this, m)(r || this.of({}), this, 0);
                            }
                        })(
                            (function(f, o, m) {
                                return function $bind(x, r, l) {
                                    return o.keys.call(r).bind(function(k, i, o) {
                                        var v = f(x, r[k], k, i, r, l);
                                        return v instanceof Array
                                            ? v.bind(m(f, (x[k] = {}), i, r[k], l+1, x))
                                                : (r.isObject(v) ? $bind((x[k] = r.of({})), v, l+1) : v);
                                    }).bind(unit);
                                }
                            }),
                            (function(f, x, t, j, l, o) {
                                return function(r, v, k, i) {
                                    return f(x, r, v, t, j, l, o);
                                }
                            })
                        ),
                        (function fold(b, m) {
                            return function fold(f, r) {
                                return b(f, this, m)(r || this.of({}), this, 0);
                            }
                        })(
                            (function(f, o, m) {
                                return function $fold(x, r, l) {
                                    return o.keys.call(r).map(function(k, i, o) {
                                        var v = f(x, r[k], k, i, r, l);
                                        return v instanceof Array ? v.map(m(f, (x[k] = {}), i, r[k], l+1, x))
                                            : (r.isObject(v) ? $fold((x[k] = r.of({})), v, l+1) : v);
                                    });                                    
                                }
                            }),
                            (function(f, x, t, j, l, o) {
                                return function(r, v, k, i) {
                                    return f(x, r, v, t, j, l, o);
                                }
                            })
                        ),
                        (function is(x) {
                            return x instanceof this.__;//x instanceof Array || typeof x != 'object' ? false : true;
                        }),
                        (function isObject(x) {
                            return x && typeof x == 'object' && (x.constructor == Object || x instanceof this.__) ? true : false;
                        }),
                        (function info(/* recur, opts */) {
                            var args  = [].slice.call(arguments);
                            var recur = (args.length && typeof args[0] == 'boolean' ? args.shift() :
                                        (args.length && typeof args[args.length-1] == 'boolean' ? args.pop() : false));
                            var bind  = this.bind(function(r, v, k, i, o) {
                                console.log(v, k, i);
                                return v;
                            }, args.length && typeof args[0] == 'object' ? args.shift() : null);
                            return recur ? bind.bind(unit) : bind;
                        })
                    ],
                    attrs: [
                        (function of(x, r) {
                            return x instanceof this ? x : new this(x, r);
                        }),
                        (function $of() {
                            var ctor = this;
                            return function() {
                                return ctor.of.apply(ctor, arguments);
                            }
                        })
                    ],
                    init: function(type, klass, sys) {
                        klass.prop('path', sys.root.get('utils.path'));
                    }
                };
            }),
        // === Cell === //
            (function() {
                return {
                    klass: function Cell(f) {
                        this.v = undefined, this.isDefined = false, this.queue = [];
                        if (f) this.f = f;
                        else if (!this.f) this.f = unit;
                    },
                    ext: [
                        (function get(k) {
                            if (this.isDefined) {
                                //JavaScript as an Embedded DSL 429 430 G. Kossakowski et al.
                                //k(this.v);
                                this.enqueue(this.atom(k, this.v));
                            }else {
                                this.queue.push(k);
                            }
                        }),
                        (function set(v) {
                            if (this.isDefined) {
                                throw "can’t set value twice"
                            }else {
                                this.run(this.f(v));
                            }
                        }),
                        (function atom(k, v) {
                            return function() {
                                k(v); return true;
                            }
                        }),
                        (function run(r) {
                            if (this.isDefined) {
                                throw "can’t set value twice"
                            }else {
                                this.v = r; this.isDefined = true,
                                this.queue.splice(0).bind(function(f) {
                                    f(r) //non-trivial spawn could be used here })
                                }).run();
                            }
                        })
                    ],
                    attrs: [
                        (function of(f) {
                            return new this(f);
                        })
                    ],
                    cont: function(cell) {
                        return function(v) {
                            cell.set(v);
                        }
                    },
                    init: function(type, klass, sys) {
                        var fn = sys.root.get('sys.fn');
                        klass.$ctor.map = fn.compose(fn.$const)(fn.andThen(klass.of));
                        klass.prop('enqueue', sys.root.get('process.nextTick.enqueue'));
                        klass.prop('cont', sys.root.get('utils.call')(type.cont));
                    }
                };
            }),
        // === Control === //
            (function() {
                return {
                    parent: 'Cont',
                    klass: function Control(x, f) {
                        this.$super.apply(this, arguments);
                    },
                    ext: [
                        (function $$init(x, f) {
                            if (x) this.mv = this.$cast(x);
                        }),
                        { name: 'async', value: this.async.select('count', 'times', 'inject', 'eject', 'delay') },
                        (function times(x) {
                            return new this.constructor(this.async.times(x, this.lazy(this.mv)));
                        }),
                        (function delay(ms) {
                            return new this.constructor(this.async.delay(this.mv, ms));
                        }),
                        (function parse(succ, fail) {
                            return function(result) {
                                return succ(result);
                            }
                        }),
                        (function eject(succ, fail) {
                            return new this.constructor(this.async.eject(this.mv, this.parse(succ, fail)));
                        })
                    ]
                };
            }),
        // === Signal === //
            (function() {
                return {
                    name: 'Signal',
                    klass: function Signal(ref) {
                        this._id = this.id();
                        this._listener = ref;
                        this._values   = [];
                        this._handlers = [];
                        this._thread   = this.thread();
                    },
                    ext: [
                        (function thread() {
                            return this.ctor.find('Thread').$ctor.queue(this._values, (function(handlers) {
                                return function(evt) {
                                    handlers.reduce(function(value, hndl) {
                                        if (hndl.eid < value.eid
                                          && (
                                            (value.src == 'data' && value.ref.indexOf(hndl.elem.identifier()) === 0)
                                                ||
                                            (value.src == 'dom' && value.target.closest('#'+hndl.elem.id)))) {
                                                hndl.run(value);
                                        }
                                        hndl.eid = value.eid; value.count++;
                                        return value;
                                    }, evt);
                                    return true;
                                }
                            })(this._handlers));
                        }),
                        (function make(info, handler) {
                            return {
                                uid: this._listener.uid, hid: this.hid(), opts: info.opts || {},
                                elem: info.element, eid: 0, name: info.name, run: handler, ref: info.selector
                            }
                        }),
                        (function add(info, handler) {
                            return this._handlers[this._handlers.push(this.make(info, handler))-1];
                        }),
                        (function remove(info) {
                            var idx = 0, arr = this._handlers, hnd, test;
                            while (idx < arr.length && (test = arr[idx])) {
                                if (info.ref.concat('.', info.target).indexOf(test.ref.replace('.%', '')) < 0 && ++idx) continue;
                                else if (info.ref.indexOf(test.elem.identifier()) && ++idx) continue;
                                hnd = arr.splice(idx, 1).shift(); break;
                            }
                            return hnd;
                        }),
                        (function run(value) {
                            this._thread.push(this._listener.create(value));
                        })
                    ],
                    attrs: [
                        (function of(identifier) {
                            return new this(identifier);
                        })
                    ],
                    init: function(type, klass, sys) {
                        klass.prop('hid', this.makeID(false));
                    }
                };
            }),
        // === Queue === //
            (function() {
                return {
                    name: 'Queue',
                    parent: 'Store',
                    klass: function Queue(ref, name) {
                        this.$super.call(this, ref, name);
                    },
                    ext: [
                        (function enqueue(item) {
                            item.eid = this.eid();
                            this.get(item.type).run(item);
                            return this;
                        }),
                        (function wrap() {
                            return this.enqueue.bind(this);
                        }),
                        (function create(listener) {
                            return (this._signal || (this.constructor.prototype._signal = this.ctor.find('Signal'))).of(listener);
                        }),
                        (function handler(stream) {
                            this.handlers.push(stream);
                            return this;
                        }),
                        (function make(/* type, name, id, item */) {
                            var args = [].slice.call(arguments);
                            var listener = args.pop(); listener.uid = this.uid();
                            listener.create = args.pop(); listener.reference = args.join('.');
                            return this.set(listener.name, this.create(listener));
                        })
                    ],
                    init: function(type, klass, sys) {
                        klass.prop('eid', this.makeID(false));
                    }
                };
            }),
        // === Event === //
            (function() {
                return {
                    name: 'Events',
                    parent: 'Node',
                    klass: function Events(opts) {
                        this.$super.call(this, opts || (opts = {}));

                        this.initdata();
                        this.thread = this.thread();
                    },
                    ext: [
                        (function initdata() {
                            this._lstnrs = this._lstnrs || (this._lstnrs = this.node('listeners'));
                            this._active = this._active || (this._active = this._lstnrs.set('active', []));
                        }),
                        (function thread() {
                            return this.ctor.find('Thread').$ctor.queue([], this.fn().bin(function next(handlers, value) {
                                handlers.map(function(hndl) {
                                    if (value.ref.indexOf(hndl.ref) === 0) {
                                        hndl.run(value);
                                    }
                                    value.count++;
                                });
                                return true;
                            })(this._active));
                        }),
                        (function addEventListener(/* instance, name, selector, target, opts */) {
                            var args = [].slice.call(arguments), instance = args.shift(), name = args.shift();
                            var target = args.pop(), opts = args.length && typeof args.last() == 'object' ? args.pop() : {};
                            var selector = args.length ? args.shift() : '*';
                            var hndl = typeof target == 'string' ? instance[target].bind(instance) : target;
                            var active = this._lstnrs.get('active') || this._lstnrs.set('active', []);
                            return active[active.push({
                                uid: instance.uid(),
                                ref: instance.identifier(),
                                level: instance.level(),
                                name: name, target: hndl,
                                opts: opts, run: hndl.run || hndl
                            })-1];
                        }),
                        (function removeEventListener(info) {
                            var signal = this.find(info.sid).get(info.type || 'change');
                            if (signal) return signal.remove(info);
                        }),
                        (function makeEvent(value) {
                            return {
                                src:    'data',
                                count:   value.count || 0,
                                uid:     value.source.uid(),
                                ref:     value.source.identifier(),
                                level:   value.source.level(),
                                type:    value.args.shift(),
                                target:  value.args.shift(), 
                                action:  value.args.shift(),
                                value:   value.args.pop()
                            };
                        }),
                        (function emit(source, args) {//* source, name, target, info */) {
                            if (args !== 'queue' && source && source.uid && this._active) {
                                this.thread.push(this.makeEvent({ count: 0, source: source, args: args }));
                            }
                        })
                    ],
                    attrs: [
                        (function of(opts) {
                            return new this(opts);
                        })
                    ],
                    init: function(type, klass, sys) {
                        var Root = sys.root; klass.prop('isEvents', true);
                        var Events = Root.__.prototype._events = klass.prop('_events', Root.child('events', klass.$ctor));//klass.of(type, klass));
                    }
                };
            }),
        // === Listener === //
            (function() {
                return {
                    name: 'Listener',
                    parent: 'IO',
                    klass: function Listener(x) {
                        this.$super.call(this, x);
                    },
                    ext: (function() {
                        return [].slice.call(arguments).pure(0, true);
                    })(
                        (function(items) {
                            return function() {
                                return items.first().apply(this.root.store(), items.slice(1));
                            }
                        }),
                        (function(makeQueue, mbAddEL1, mbAddEL2, mbELEMListener, addELEMENTListener,
                            mbEVTbind1, wrapDISPATCHER, mbEVTcntrTUP, eON, eOFF,
                                evtONOFF, throttle, mbEvtADD) {
                            
                            var maybe   = this.get('utils.maybe');
                            var tuple   = this.get('utils.tuple');
                            var bin     = this.get('utils.bin');
                            var fromCB  = this.get('utils.fromCallback');
                            var compose = this.get('sys.fn.compose');

                            var maybeAddEventListener = maybe(mbAddEL1)(mbAddEL2);

                            var maybeListener = maybe(mbELEMListener);

                            var maybeEventBinder = maybe(mbEVTbind1);

                            var maybeEventControl = maybe(mbEVTcntrTUP)(tuple(eON)(eOFF));

                            var maybeEventElem = maybeListener(
                                maybe(addELEMENTListener)(maybeEventControl(bin(evtONOFF))));

                            function makeEventContainerElement(element) {
                                return maybeAddEventListener(maybeEventElem(element || document.body));
                            };

                            return [
                                { name: 'makeQueue', value: makeQueue },
                                { name: 'getQueue', value: makeQueue(this.ref().child('queue', this.ctor.find('Queue').$ctor)) },
                                { name: 'addElementListener', value: addELEMENTListener },
                                { name: 'wrapDispatcher', value: wrapDISPATCHER },
                                { name: 'maybeListener', value: maybeListener },
                                { name: 'maybeAddEventListener', value: maybeAddEventListener },
                                { name: 'maybeEventElem', value: makeEventContainerElement },
                                { name: 'maybeEventControl', value: maybeEventControl },
                                { name: 'addEventListener', value: mbEvtADD },
                                { name: 'throttle', value: throttle },
                                { name: 'maybeEventBinder', value: maybeEventBinder },
                                { name: 'eventOnOffControl', value: evtONOFF },
                                { name: 'fromCallback', value: fromCB }
                            ];

                        }),
                        (function makeQueue(queue) {
                            return function(name, type) {
                                var child = queue.child(name);
                                child._type = type || name;
                                return child;
                            }
                        }),
                        (function addEL1(wrap) {
                            return function(make) {
                                return wrap(make);
                            }
                        }),
                        (function addEL2(make) {
                            return function(name, handler) {
                                return make(name, handler);
                            }
                        }),
                        (function maybeElementListener(handler) {
                            return function(elem) {
                                return handler(elem);
                            };
                        }),
                        (function addElementListener(addListener) {
                            return function(elem) {
                                return function(name, handler) {
                                    return addListener(elem, name, handler);
                                };
                            };
                        }),
                        (function createSelectorFunc(matchFunction) {
                            return function(element) {
                                return function(selector) {
                                    return matchFunction(element, selector);
                                }
                            }
                        }),
                        (function wrapDispatcher(dispatcher) {
                            return function(addListener) {
                                return function(name) {
                                    return addListener(name, dispatcher);
                                }
                            }
                        }),
                        (function tupledEventOnOffFuncs(tup) {
                            return function(continuation) {
                                return tup(continuation);
                            }
                        }),
                        (function on(elem, name, handler) {
                            elem.addEventListener(name, handler);
                            return {
                                name: name,
                                elem: elem,
                                run: handler,
                                state: 'on'
                            };
                        }),
                        (function off(elem, name, handler) {
                            elem.removeEventListener(name, handler);
                            return {
                                name: name,
                                elem: elem,
                                run: handler,
                                state: 'off'
                            };
                        }),
                        (function eventOnOffControl(on, off) {
                            return function(elem, name, handler) {
                                var state = on(elem, name, handler);
                                state.off = off;
                                return state;
                            };
                        }),
                        (function throttle(sink, ms) {
                            var stoid = 0, value, skipcount = 0;
                            if (ms) sink.throttle = ms;
                            return function(evt) {
                                value = evt;
                                if (stoid) {
                                    if (skipcount%100==0) console.log('THROTTLE', skipcount);
                                    skipcount++;
                                }else {
                                    stoid = setTimeout(function() {
                                        stoid = 0;
                                        sink.run(value);
                                    }, sink.throttle);
                                }
                            }
                        }),
                        (function add(/* element, type, name, selector, run, throttle */) {
                            var args  = [].slice.call(arguments), reference = args.shift();
                            var type  = args.shift(), name = args.shift(), node = this.run(name), run = args.pop();
                            var store = this.getQueue(type);
                            var opts  = args.length && typeof args.last() == 'object' ? args.pop() : {};
                            var selector = args.length && typeof args[0] == 'string' ? args.shift() : null;
                            var throttle = args.length && typeof args[0] == 'number' ? args.shift() : 0;
                            var element  = store.get('createElement')(reference);
                            var handler  = { type: type, name: name, element: element, selector: selector, throttle: throttle, run: run, opts: opts };
                            return node.add(handler,
                                this.ctor.sys().get('utils.$filter')(
                                    this.fromCallback, store.get('selectorFunc')(element, selector)
                                )(throttle ? this.throttle(handler, throttle) : handler.run)
                            );
                        })
                    ),
                    data: {
                        dom: [
                            (function matches(element, selector) {
                                return function(evt) {
                                    if (evt.stop) return false;

                                    var elem = evt.target;
                                    while (elem) {
                                        if (!selector || elem.matches(selector)) break;
                                        else if (elem == element) return false;
                                        else elem = elem.parentElement;
                                    }
                                    if (elem) {
                                        evt.currentTarget = elem;
                                        while (elem) {
                                            if (!element) break;
                                            else if (elem == element) break;
                                            else elem = elem.parentElement;
                                        }
                                    }
                                    return !!elem;
                                } // DOMeventHandler creates the DOM event specific *handler* proxy
                            }),   // so the main handler(s) to which the listeners will be attached
                            (function createEvent(evt) {
                                return {
                                    src: 'dom',
                                    evt: $const(evt),
                                    eid: evt.eid,
                                    sid: this.uid,
                                    type: evt.type,
                                    count: evt.count || 0,
                                    target: evt.target,
                                    currentTarget: null,
                                    value: evt.target.value || evt.target.name,
                                    relatedTarget: evt.relatedTarget,
                                    x: evt.clientX || evt.x || -1,
                                    y: evt.clientY || evt.y || -1
                                };
                            }),
                            (function createElement(element) {
                                return typeof element == 'string'
                                ? document.getElementById(element) : element;
                            })
                        ],
                        store: [
                            (function matches(element, selector) {
                                var ref = element.identifier();
                                return function(evt) {
                                    if (evt.stop) return false;
                                    if (evt && evt.target && (!selector || (evt.ref.replace(ref, '')+'.'+evt.target).substr(1).matches(selector))) {
                                        if (!element) return true;
                                        return element.pertains(evt);
                                    }
                                    return false;
                                } // DOMeventHandler creates the DOM event specific *handler* proxy
                            }),   // so the main handler(s) to which the listeners will be attached
                            (function createEvent(evt) {
                                return {
                                    src: 'data',
                                    eid: evt.eid,
                                    uid: evt.uid,
                                    sid: this.uid,
                                    ref: evt.ref,
                                    type: evt.type,
                                    count: evt.count || 0,
                                    target: evt.target,
                                    action: evt.action,
                                    value: evt.value
                                };
                            }),
                            (function createElement(element) {
                                return typeof element == 'string'
                                ? sys.get(element) : element;
                            })
                        ]
                    },
                    base: (function(init, make) {
                        return function(klass) {
                            return init(klass.$ctor.lift((klass.$ctor.base = make)));
                        }
                    })(
                        (function(make) {
                            return function init(name, type) {
                                return make.run(this.prototype.getQueue(name, type));
                            }
                        }),
                        (function(base, elem) {
                            var node, disp, name = elem._cid || elem.id;
                            if (!name || !(node = base.get(name))) {
                                node = base.child(name);
                                if (!name) name = node.cid();
                                if (!elem.id) elem.id = name;
                            }
                            var list = node.get('listener') || node.set('listener', this.maybeEventElem(elem));
                            var disp = node.get('dispatcher')
                                || node.set('dispatcher', this.wrapDispatcher(node.store().wrap()));
                            var make = node.get('createEvent')
                                || node.set('createEvent', base.parent(base._type).get('createEvent'));
                            return this.constructor.make.run(node);
                        })
                    ),
                    make: (function(node, name) {
                        return node.get(name) ||
                            node.store().make(
                                node.identifier(), name, node.get('createEvent'),
                                    node.get('dispatcher')(node.get('listener'))(name));
                    }),
                    init: function(type, klass, sys) {
                        var $ctor = klass.$ctor;
                        var root  = sys.root;
                        var lift  = $ctor.lift  = klass.parent().get('type.$ctor').lift;
                        var pure  = $ctor.$pure = klass.parent().get('type.$ctor').pure.bind($ctor);
                        var func  = $ctor.prototype;
                        var init  = $ctor.init  = type.base(klass);
                        var make  = $ctor.make  = $ctor.lift(type.make);

                        var maybe = root.get('utils.maybe');
                        var queue = root.get('queue');

                        var dom   = queue.child('dom').parse(type.data.dom);
                        var store = queue.child('store').parse(type.data.store);

                        dom.set('selectorFunc', dom.get('matches'));
                        store.set('selectorFunc', store.get('matches'));

                        //var data  = $ctor.of(func.getQueue('store')).lift($ctor.base);//.run()

                        this.find('Node').prop('listener', $ctor.init('store'));
                    }
                };
            }),
        // === Component === //
            (function() {
                return {
                    parent: 'Node',
                    klass: function Component(opts) {
                        if (!opts.parent)
                            opts.parent = this._node;

                        this.$super.call(this, opts);
                        this._started  = 1;

                        this.dispatcher = this.listener.run(this);
                        this._events = this._events.child({ name: 'events', parent: this });

                        this.node('$fn');
                        this.set('type', (opts.type || this.constructor.name).toDash());
                        this.parent().set(this.cid(), this);
                        this.parse(opts);
                        this.update(opts);
                    },
                    ext: [
                        (function initialize() {}),
                        (function onAttach() {
                            this.enqueue(this.cont(function() {
                                this.initialize();
                                return true; 
                            }));
                        }),
                        (function origin() {

                            return 'component';
                        }),
                        (function attr() {

                            return { 'class' : this.constructor.name.toLowerCase() + ' ' + this.origin() };
                        }),
                        (function view() {
                            return (this.view = $const(this.child('view', this.deps('components.view'))))();
                        }),
                        (function state(key, value) {
                            return (this._state || (this._state = this.node('state'))).acc(key, value);
                        }),
                        (function attach(selector) {
                            return this.view().parent('$fn.attach').ap(selector || this.module().$el()).run().map(this.fn().bin(function(comp, elem) {
                               comp.state('attach', elem.id || elem.className);
                               return elem;
                            })(this));
                        }),
                        (function display(state) {
                            return this.view().parent('$fn.display').ap(this.state('display', state || '')).run();
                        }),
                        (function update() {}),
                        (function events() {
                            var comp = this, events, list = [];
                            if ((events = this.get('data.events.data'))) {
                                list.push(events.store().bind(function(method, evt) {
                                    comp.observe.apply(comp, evt.split(':').append(method));
                                }));
                            }
                            if ((events = this.get('data.events.dom'))) {
                                list.push(events.store().bind(function(method, evt) {
                                    return comp.on.apply(comp, evt.split(':').append(method));
                                }));
                            }
                            if (!list.length) {
                                comp.parse();
                                comp.start();
                            }
                            return list.length ? list.fmap(function() {
                                comp.parse();
                                comp.start();
                                return comp.main() || comp;
                            }) : (this.main() || this);
                        }),
                        (function proxy(name, selector, path) {
                            return ((this._proxy || (this._proxy = this.node('proxy'))).get(name)
                                || (this._proxy.child(name))).set(selector.split('.').first(), { selector: selector, path: path });
                        }),
                        (function $proxy(evt, proxy) {
                            if (proxy && evt.target.matches(proxy.selector))
                                this.parent().emit('change', proxy.path, (evt.target.value || evt.target.innerText || '').toLowerCase());
                        }),
                        (function control() {
                            return this.get([ 'data.control' ].concat([].slice.call(arguments)).join('.'))
                                || this.klass('Obj').of(this.conf.control ? this.extend({}, this.conf.control, true) : {}, this);
                        }),
                        (function $fn(name) {
                            return this.get('$fn', name);
                        }),
                        (function $el(selector) {
                            return this.view().$el(selector);
                        }),
                        (function on(name, selector, handler) {
                            return this.view().on(name, selector, typeof handler == 'string' ? this.handler(handler) : handler);
                        }),
                        (function handler(fn) {
                            var ctx = this;
                            var ref = fn.indexOf('.') > 0 ? fn.split('.').slice(0, -1).join('.') : '';
                            return function() {
                                return ref ? ctx.get(fn).apply(ctx.get(ref), arguments) : ctx[fn].apply(ctx, arguments);
                            }
                        }),
                        (function binding(evt) {
                            if (evt.src == 'dom') {
                                if (evt.target && evt.currentTarget) {
                                    var path = evt.currentTarget.getAttribute('data-bind-path');
                                    var name = evt.target.getAttribute('data-key') || evt.target.id;
                                    return this.lookup(path).map(function(node) {
                                        return node.set(name, evt.target.value);
                                    });
                                }
                            }else if (evt.src == 'data' && this.view()) {
                                return this.view().binding(evt);
                            }
                        }),
                        (function extend(base, ext, keys) {
                            var xtnd = this.xtnd || (this.constructor.prototype.xtnd = this.sys('utils.extend'));
                            if (!base) {
                                return ext ? xtnd({}, ext) : {};
                            }else if (!ext) {
                                return xtnd({}, base);
                            }else if (keys) {
                                var result = xtnd({}, base);
                                return Object.keys(ext).reduce(function(r, k, i) {
                                    if (r[k]) r[k] = xtnd(xtnd({}, r[k]), ext[k]);
                                    else r[k] = ext[k];
                                    return r;
                                }, result);
                            }else {
                                return xtnd(xtnd({}, base), ext || {});
                            }
                        }),
                        (function parse(conf) {
                            conf || (conf = {});
                            var evts = this.get('data.events');

                            var opts = this._opts || (this._opts = this.node('opts'));
                            var data = this._data || (this._data = this.node('data').parse({
                                id: this.uid(), main: {}, current: {} }, true));

                            if (this.conf.opts) this._opts.parse(this.conf.opts);
                            if (conf.opts) this._opts.parse(conf.opts);

                            var cdata = conf.data || {};
                            if (conf.tmpl) cdata.tmpl = conf.tmpl;
                            if (conf.events) cdata.events = conf.events;
                            if (conf.control) cdata.control = conf.control;
                            if (this.conf.data || conf.data) {
                                if (!this.conf.data) this.conf.data = {};
                                if ((cdata.tmpl || this.conf.data.tmpl)
                                    && (cdata.tmpl || !data.get('tmpl')))
                                        this.data({ tmpl: this.xtnd({ attr: $const({ 'class' : this.get('type') }) }, this.extend(this.conf.data.tmpl, cdata.tmpl)) });

                                if ((this.conf.data.events || cdata.events)
                                    && (cdata.events || !data.get('events')))
                                        this.data({ events: this.extend(this.conf.data.events, cdata.events) });
                                else if ((this.conf.events || conf.events)
                                    && (conf.events || !data.get('events')))
                                        this.data({ events: this.extend(this.conf.events, conf.events) });

                                if ((this.conf.control || conf.control)
                                    && (conf.control || !data.get('control')))
                                        this._data.set('control', this.klass('Obj').of(this.extend(this.conf.control, conf.control, true), this));
                            }
                            if (!evts && this.get('data.events')) return this;
                            if ((cdata.main || (this.conf.data && this.conf.data.main))
                                && (cdata.main || !data.get('main').length()))
                                    this.data({ main: this.extend(this.conf.data.main, cdata.main) });

                            //if (this.conf.data) this._data.parse(this.conf.data, 1);
                            if (conf.data) this._data.parse(conf.data, 1);

                            return this;
                        }),
                        (function route(ext) {
                            return 'components/'+this._cid+'/'+this._cid+(ext ? ('.'+ext) : '');
                        }),
                        (function data(v1, v2) {
                            return v1 ? (typeof v1 == 'object' ? this._data.parse(v1, 2) : this._data.acc(v1, v2)) : this._data.values(true);
                        }),
                        (function opts(v1, v2) {
                            return v1 ? (typeof v1 == 'object' ? this._opts.parse(v1, 2) : this._opts.acc(v1, v2)) : this._opts.values(true);
                        }),
                        (function eff(name, value) {
                            return value ? (this.$eff[name] = value) : (name ? this.$eff[name] : this.$eff);
                        }),
                        (function make(cont) {
                            this._cont || (this._cont = cont.bind(this.cont(function(klass) {
                                if (this.conf.data && this.conf.data.tmpl)
                                    this.data({ tmpl: this.conf.data.tmpl });//this.extend(this.conf.data.tmpl, this.get('data.tmpl').values(true)) });
                                if (this.conf.events) this.data({ events: this.conf.events });
                                if (this.conf.control) this.control().update(this.conf.control);
                                if (this.conf.data && this.conf.data.events) this.data({ events: this.conf.data.events });
                                return this.events();
                            })));
                            return this;
                        }),
                        (function component(name, type) {
                            var cmps = this.deps('components');
                            var comp = cmps[name];
                            if (!comp) {
                                type || (type = name);
                                comp = cmps[name] = (cmps[type] || cmps['$'+type]).create({ name: name, parent: this });
                            }
                            return comp;
                        }),
                        (function module() {
                            var module = this.klass('Module');
                            return this.closest(module) || this.closest('components').filter(function(c) {
                                if (module.is(c)) {
                                    if (c.$el().map(function(el) {
                                        return el.offsetParent !== null;
                                    }).run()) return true;
                                }
                                return false;
                            }).first();
                        }),
                        (function run(k) {
                            var cell = this._cell;
                            if (!cell) {
                                cell = this._cell = this.cell();
                                if (this._cont) this._cont.bind(cell.cont()).run();
                                else cell.set(this);
                            }
                            cell.get(k);
                            return this;
                        }),
                        (function pure() {
                            var comp = this;
                            return function $_pure(k) {
                                comp.run(k);
                            };
                        })
                    ],
                    attrs: [
                        (function(components) {
                            return function of(opts) {
                                var args  = [].slice.apply(arguments);
                                var conf  = typeof args[0] == 'object' ? args.shift() : {};
                                var node  = this.ctor.prop('_node');//components.ref();
                                conf.type = this.name.toTypeName();
                                if (!conf.name && args.length && typeof args[0] == 'string') conf.name = args.shift();

                                if (args.length && typeof args[0] == 'object') {
                                    if (args.length == 1) {
                                        conf.opts = args.shift();
                                        if (conf.opts.data) (conf.data = conf.opts.data) && (delete conf.opts.data); 
                                    }else if (conf.data = args.shift()) {

                                    }
                                }
                                if (!conf.opts && args.length && typeof args[0] == 'object') conf.opts = args.shift();
                                if (!conf.parent) conf.parent = node;
                                //return node.child(conf, this);
                                return conf.parent.child(conf, this);
                            };
                        })(this.components)
                    ],
                    cont: function(comp, f) {
                        return function() {
                            return f.apply(comp, [].slice.call(arguments));
                        }
                    },
                    done: function(cell) {
                        return function(k) {
                            var c = cell.of();
                            c.get(k);
                            return c;
                        }
                    },
                    init: function(type, klass, sys) {
                        var proto  = klass.proto(), ctor = klass.$ctor, root = sys.root;
                        proto.conf = { opts: { js: true, css: false, tmpl: true } };
                        proto.$eff = {};
                        proto.xtnd = root.get('utils.extend');
                        proto.cont = root.get('utils.call1')(type.cont);
                        var node   = proto._node = root.child('components', ctor);
                        var evts   = proto._events = node.child('events', this.find('Events').$ctor);
                        proto.enqueue = root.get('process.nextTick.enqueue');
                        var lstr = this.find('Listener').$ctor;
                        proto.listener = lstr.init('components', 'store');
                        proto.dispatcher = proto.listener.run(node);
                        proto.done = type.done(this.find('Cell'));
                        proto.dom = lstr.init('dom');
                        //proto._dom = body.run(document.body.firstElementChild);
                    }
                };
            }),
        // === Module === //
            (function() {
                return {
                    parent: 'Component',
                    klass: function Module(opts) {
                        this.$super.call(this, opts);
                    },
                    ext: [
                        (function origin() {

                            return 'module';
                        })
                    ]
                };
            }),
        // === Deps === //
            (function() {
                return {
                    parent: 'Value',
                    klass: function Deps(x, f) {
                        this.id = this.id();
                        if (x) this.mv = x;
                        if (f) this.mf = f;
                        else if (!this.mf) this.mf = unit;
                    },
                    ext: [
                        (function apply(k) {
                            return this.mv.get(this.mf(k));
                        }),
                        (function run(k) {
                            return this.mv && !this._locked ? this.apply(k) : k(this);
                        })
                    ],
                    attrs: [
                        (function of(v) {
                            return this.cast(v);
                        })
                    ],
                    wrap: function(io) {
                        return function() {
                            return io.run.apply(io, arguments);
                        }
                    },
                    cast: function(klass, wrap) {
                        return function(v) {
                            if (v instanceof klass.$ctor) {
                                return v.unlock();
                            }else {
                                return wrap(klass.find('IO').pure(v));
                            }
                        }
                    },
                    init: function(type, klass, sys) {
                        klass.$ctor.cast = type.cast(klass.parent(), type.wrap);
                        klass.prop('cast', klass.$ctor.cast);
                    }
                };
            })
    ),

    (function MakeEffects() {
 
        return [].slice.call(arguments);
    })(
        (function $$EFFECTS(enq, run) {
            var sys = this.$context.get('sys').run();
            if (sys.isWorker) return;
            return run(enq(sys),
                this.ctor.find('Cont'),
                    sys.root.child('script').child('core').store());
        }),
        (function(sys) {
            var cont = sys.klass('Cont');
            function enqueue(deps, run) {
                return cont.of([ deps, run ], function(d) {
                    return function $_pure(k) {
                        sys.enqueue(d.shift(), d.pop(), true).run(k);
                    }
                });
            };
            sys.enqueue = enqueue;
            return sys;
        }),
        (function(sys, klass, store) {
            Array.of(
                sys.get('async.script')({ url: 'core/worker.js', ref: store.child('worker').uid() }),
                sys.get('async.script')({ url: 'core/effect.js', ref: store.child('effect').uid() }),
                sys.get('async.script')({ url: 'core/config.js', ref: store.child('config').uid() })
            ).lift(function(w, e, c) {
                store.get('effect.cont').run(function(eff) {
                    Array.of(
                        store.get('config.cont').cont(),
                        store.get('worker.cont').cont(),
                        sys.eff('sys.loader.component').run('modules/application/application').create('home')
                    ).lift(function(conf, wrkr, app) {
                        wrkr(sys, conf);
                        return app.pure();
                    }).run();
                });
            }).run();
        })
    )