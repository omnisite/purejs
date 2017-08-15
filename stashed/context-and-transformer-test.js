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
                    ]
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
                        (function test(value) {
                            if (!value) return {};
                            else if (this.ctor.root().is(value)) return { type: true };
                            return {
                                'reader' : this._r.is(value),
                                'monad'  : this._m.is(value),
                                'trans'  : this.is(value)
                            };
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

                        klass.prop('$root', klass.initial(klass.find('Reader').fromConstructor('fromStore', sys.get()), klass.find('Coyoneda')));
                    }
                };
            })