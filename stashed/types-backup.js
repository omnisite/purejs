    (function Types() {
        console.log('Types');
        return [].slice.call(arguments).pure(0, true);
    })(
        (function Make(items) {
            return function types(base) {
                return items.shift()(items, base);
            }
        }),
        (function make(items, base) {
            var klass = base.klass;
            var root  = base.root;
            var monad = base.root.set('monad', base.root.get('types'));
            var types = monad.find('Object');
            monad.node('fn').parse(items.shift().call(root.get('utils').select('curry', 'guard', 'create')));
            return items.make().bind(function(info) {
                var def  = info.call(root);
                var opts = { name: def.name };
                var type = def.parent ? types.find(def.parent) : types;
                return type.inherit(def.name, def);
            }).fmap(function(result) {
                var maybe  = types.find('Maybe');
                var lookup = maybe.of(root);
                maybe.ext('root', lookup);
                types.find('Node').ext('maybe', maybe.$pure());
                return base;
            });
        }),
        (function fn() {
            // map :: Monad m => (a -> b) -> m a -> m b
            this.map = this.curry(function(fn, m) {
                return m.map(fn);
            });

            // chain :: Monad m => (a -> m b) -> m a -> m b
            this.chain = this.curry(function(fn, m) {
                return m.chain(fn);
            });

            // ap :: Monad m => m (a -> b) -> m a -> m b
            this.ap = this.curry(function(mf, m) { // mf, not fn, because this is a wrapped function
                return mf.ap(m);
            });

            // orElse :: Monad m => m a -> a -> m a
            this.orElse = this.curry(function(val, m) {
                return m.orElse(val);
            });

            this.lift = this.curry(function(f, m) {
                return m.lift(f);
            });

            this.lift2 = this.curry(function(f, m1, m2) {
                return m1.map(f).ap(m2);
            });

            this.lift2M = function(f, t1, t2) {
                var lift2 = this.lift2(f);
                return this.curry(function(v1, v2) {
                    return lift2(t1 ? t1(v1) : v1, t2 ? t2(v2) : (t1 ? t1(v2) : v2));
                }, this);
            };

            return this;
        }),
        (function Counter() {
            return {
                name: 'Counter',
                ctor: function(n) {
                    this.n = n;
                    this.f = this.make(n);
                },
                ext: [
                    'types', this.get('types.Object'),
                    'defs', $const({
                        add: function(n, v) {
                          return v + n;
                        },
                        next: function(v) {
                          return (!v || --v);
                        }
                    }),
                    (function make(v) {
                        var type = this.types.findOperation(v, 'next');
                        return type || (v.defs ? v.defs() : this.defs());
                    }),
                    (function next(cont, counter, free) {
                        return this.f.next(this.n, n);
                    }),
                    (function add(n) {
                        return this.f.add(this.n, n);
                    }),
                    (function set(n) {
                        return this.f.set ? this.f.set(this.n, n) : n;
                    }),
                    (function map(f) {
                        return new this.constructor(this.n.map(f || unit));
                    })
                ],
                attrs: [
                    (function of(n) {
                        return new this(n);
                    })
                ]
            };
        }),
        (function Value() {
            return {
                name: 'Value',
                ctor: function(f, n) {
                    this.f = f;
                    this.n = this.cast(n);
                    this.i = 0;
                    this._delay = 0;
                },
                ext: [
                    (function cast(n) {
                      if (n && n.choose) {
                        return n.map(unit);
                      }else if (n && this.type.is(n)) {
                        return n;
                      }else {
                        return this.type.of(n);
                      }
                    }),
                    (function next(n) {
                      this.n.add(n);
                      return this.i || (this.i = this.enqueue(this));
                    }),
                    (function push(n) {
                      this.n.push(n);
                      return this.i || (this.i = this.enqueue(this));
                    }),
                    (function add(n) {
                      this.n.set(n);
                      return this.i || (this.i = this.enqueue(this));
                    }),
                    (function run(val, free) {
                      return function(counter) {
                        return val.n.next(val.f, counter, free)();
                      };
                    }),
                    (function done(val, done) {
                      return function() {
                        val.i = 0;
                        return done;
                      }
                    }),
                    (function wrap(run, suspend, done) {
                      this.run = this.run(this, {
                        run: $const(run()), suspend: $const(suspend()), done: this.done(this, done())
                      });
                      return this;
                    }),
                    (function delay(ms) {
                        return (this._delay += ms);
                    }),
                    'free', this.get('types.Free'),
                    (function timer(t) {
                        this.enqueue = this.free[t];
                        return this;
                    }),
                    'enqueue', this.get('types.Free.runThreads')
                ]
            };
        }),
        (function Lazy() {
            return {
                name: 'Lazy',
                ctor: function(x, f) {
                    this.mv = x || 0;
                    this.mf = f || $const(unit);
                },
                ext: [
                    (function get() {
                        return this.mf(this.mv);
                    }),
                    (function set(x) {
                        return (this.mv = x);
                    }),
                    'compose', 'utils.compose', 'andThen', 'utils.andThen',
                    (function map(f) {
                        return new this.constructor(this.mv, this.compose(this.mf)(this.andThen(f)));
                    }),
                    '$value', this.get('utils.create')(
                        this.get('types').find('Value')._ctor, function(obj) {
                            return obj.get();
                        }, this.get('types.Free.liftR')
                    ),
                    (function value() {
                        return this.$value(this, this.mv);
                    }),
                    (function run() {
                        return this.$value(this, this.mv);
                    })
                ],
                attrs: [
                    (function of(x, f) {
                        return new this(x, f);
                    }),
                    (function lift(x, f) {
                        return new this(x, f);
                    }),
                    (function pure(x, f) {
                        return new this(x, f);
                    })
                ]
            };
        }),
        (function Functor() {
            return {
                name: 'Functor',
                ctor: function ctor(mv) {
                    this.mv = mv;
                },
                ext: [
                    this.get('utils.curry'),
                    (function type(item) {
                        return sys.type(item || this.constructor.name);
                    }),
                    (function is(value) {
                        return sys.type(this.constructor.name).is(value);
                    }),
                    (function lookup(item) {
                        return sys.of(sys.type(item || this.constructor.name));
                    }),
                    (function of() {
                        return this.constructor.of.apply(this.constructor, [].slice.call(arguments));
                    }),
                    (function isFunctor(value) {
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
                    this.get('utils.property'),
                    'pget', this.get('utils.property')('get'),
                    'pval', this.get('utils.property')('values'),
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
                    (function get(key) {
                        return this.map(this.pget(key));
                    }),
                    (function values(recur) {
                        return this.map(this.pval(recur));
                    }),
                    (function prop() {
                        var args = Array.prototype.slice.call(arguments);
                        return this.map(this.property(args.shift()).apply(undefined, args));
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
                    (function fn() {
                        return this.prop.apply(this, arguments);
                    }),
                    (function $fn() {
                        var ext  = this.constructor.fn(this.mv);
                        var args = Array.prototype.slice.call(arguments);
                        if (args.length) {
                          return ext.of(this.prop.apply(this, arguments).join());
                        }else {
                          return ext.of(null);
                        }
                    }),
                    (function $fn2(/* pre-value wrap */) {
                        var ext  = this.constructor.fn(this.mv);
                        var vars = Array.prototype.slice.call(arguments);
                        return function() {
                            var args = vars.concat([].slice.apply(arguments));
                            var inst = ext.of(args.length ? args.shift() : null);
                            if (args.length) {
                                return inst.fn.apply(inst, args);                
                            }else {
                                return inst;
                            }
                        }
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
                    }),
                    (function fn(objfn) {
                      return function fn(obj) {
                        var clone = this.klass.clone();
                        clone.prototype.$fn = objfn(obj);
                        clone.prototype.fn  = function() {
                            var args = Array.prototype.slice.call(arguments);
                            var prop = this.$fn(args.shift());
                            if (this.isNothing()) {
                              return this.of(args.length ? prop.apply(undefined, args) : prop);
                            }else {
                              return this.map(args.length ? prop.apply(undefined, args) : prop);
                            }
                        }
                        return clone;
                      };
                      return this;
                    })(this.get('utils.target'))
                ]
            };
        }),
        (function Compose() {
            return {
                name: 'Compose',
                parent: 'Functor',
                ctor: function(x) {
                    if (x || typeof x != 'undefined') this.mv = x instanceof Function && x.length > 1 ? this.curry(x) : x;
                },
                ext: [
                    // COMPOSE
                    '$fn', (function MakeCompose(wrap, make, just, next, prev) {
                        return make(just, next);
                    })(
                        (function wrap(compose) {
                            return function add(object) {
                                compose.call(object);
                                return object;
                            };
                        }),
                        (function make(just, next) { 
                            return function compose(f) {
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
                        }),
                        (function prev(f) {
                            return function(g) {
                                return function $_prev(a) {
                                  return f(g(a));
                                };
                            };
                        })
                    ),
                    (function map(g) {
                        return new this.constructor(this.$fn(this.mv)(g));
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
                    })(this.get('utils.pure')),
                    '$make', 'utils.cont',
                    (function ext2(ext, wrap, combine, enqueue) {
                        return ext(wrap(combine, enqueue));
                    })(
                        (function $ext($wrap) {
                            return function $cont(mv, mf) {
                                return $wrap(this.$make(mv, mf));
                            };
                        }),
                        (function $wrap($combine, $enqueue) {
                            return function($body) {
                                return function pure($cont) {
                                  return $enqueue( $combine( $body, $cont ) );
                                }
                            }
                        }),
                        (function $combine($body, $cont) {
                            return function() {
                               $body($cont);
                               return true;
                            };
                        }),
                        this.get('scheduler.nextTick.enqueue')
                    ),
                    (function $pure(f) {
                        return this.mf.name == this.constructor.prototype.mf.name ? f : this.$fn(this.mf)(f);
                    }),
                    (function cont() {
                        return this.$cont(this.mv, this.mf);
                    }),
                    (function lazy() {
                        return this.mv(this.mf);
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
                    this.get('utils.val'),
                    this.get('utils.cont'),
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
        }),
        (function Coyoneda() {
            return {
                name: 'Coyoneda',
                parent: 'Compose',
                ctor: function(f, x) {
                    if (f) this.mf = f;
                    else if (!this.mf) this.mf = unit;
                    if (x) this.mv = x;
                },
                ext: [
                    (function map(f) {
                        return new this.constructor(this.$fn(this.mf)(f), this.mv);
                    }),
                    (function chain(f, x) {
                        return this.$fn(this.mf)(f || unit)(x || this.mv);
                    }),
                    (function lift(x) {
                        return new this.constructor(this.mf, x || this.mv);
                    }),
                    (function run(x, f) {
                        return this.$fn(this.mf)(f || unit)(x || this.mv);
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
        (function List() {
            return {
                name: 'List',
                parent: 'Coyoneda',
                ctor: function(f, x) {
                    if (f) this.mf = f;
                    else if (!this.mf) this.mf = unit;
                    if (x) this.mv = x;
                },
                ext: [
                    (function $fold() {
                        return function(c, x, r) {
                          return c(x, r);
                        };
                    }),
                    (function fold(f) {
                        var mf = this.$fn(this.mf)(unit);
                        var mv = this.mv || {};
                        var tp = this.type().findOperation(mv, 'fold');
                        var it = tp && tp.fold ? tp.fold(this.$fold(), mf, f) : false;
                        return it;
                    }),
                    (function chain(f, x) {
                        var mf = this.$fn(this.mf)(unit);
                        var mv = x || this.mv || {};
                        var tp = this.type().findOperation(mv, 'map');
                        var it = tp && tp.map ? tp.map(mf, mv) : null;
                        if (it && it.done) {
                          var next = new this.constructor(unit);
                          it.done(function(result) {
                            next.mv = f(result);
                          });
                          return next;
                        }else if (f) {
                          f(mf(mv));
                          return this;
                        }
                    }),
                    (function ap(other) {
                        return this.map(function(x) {
                          return other.ap(x);
                        });
                    }),
                    (function bind(other) {
                        return this.map(function(x) {
                          return x.ap(other.map(unit));
                        });
                    }),
                    'lift', this.get('utils.curry')(function(f, a) {
                        return this.map(function(x) {
                          return x.ap(a.chain(f));
                        });
                    }),
                    (function run(f, x) {
                        var args = Array.prototype.slice.call(arguments);
                        var func = args.length && args[0] instanceof Function ? args.shift() : unit;
                        var list = args.length ? args.shift() : this.mv;
                        return this.chain(func, list);
                    })
                ],
                attrs: [
                    (function lift(x, f) {
                        return new this(f, x);
                    }),
                    (function of(f, x) {
                        return new this(f, x);
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
        (function Control() {
            return {
                name: 'Control',
                parent: 'Cont',
                ctor: function(x, f) {
                    if (x) this.mv = this.$cast(x);
                    if (f) this.mf = f;
                },
                ext: [
                    '$async', 'utils.async',
                    (function lift(f) {
                        return this.$async.get('lift')(f);
                    })
                ],
                attrs: (function($async) {
                    function arr(fn) {
                        return function next(result, value, index, array) {
                          result.push(value);
                          if (index == (array.length - 1)) {
                            return fn.apply(undefined, result);
                          }
                          return result;
                        };
                    };
                    function accum(fn) {
                        return function next(result, value, index, array) {
                            result.push(value);
                            if (index == (array.length - 1)) {
                                return fn.apply(undefined, result);
                            }
                            return result;
                        };
                    };
                    function foldl(args, fn, initial) {
                        return $async.foldl(
                            $async.pure(function(result, value, index, array) {
                                return result(value, result, index, array)||unit;
                            }),
                            initial || $async.pure(unit),
                            $async.collect(args && args instanceof Array ? args : [ args ])
                        );
                    };
                    return [
                        (function cast(value) {
                            if (value instanceof Array) {
                                var parsed = [];
                                while (value.length) {
                                    parsed.push(this.cast(value.shift()));
                                }
                                return parsed;
                            }else {
                                return this.type.is(value, 'Cont') ? value.cont() : (value instanceof Function ? value : $async.pure(value));
                            }
                        }),
                        (function foldl(/* fn, initial, args */) {
                            var args = [].slice.call(arguments),
                                fn = args.length > 1 && args[0] instanceof Function ? args.shift() : accum($async.pure),
                              init = args.length > 1 && args[0] instanceof Function ? args.shift() : unit;
                            return new this(foldl(this.cast(args), fn, this.cast(init)));
                        }),
                        (function lift(/* f, arg1, arg2... */) {
                            var args = [].slice.call(arguments),
                                func = args.shift();
                            return new this($async.lift(func).apply(undefined, this.cast(args)));
                        }),
                        (function collect(/* args */) {
                            return new this(this.cast([].slice.call(arguments)).collect());
                        }),
                        (function pure(mv) {
                            return new this(mv);
                        }),
                        (function of() {
                            var args = [].slice.call(arguments);
                            if (args.length == 1) {
                                return args[0] instanceof Array ? this.collect.apply(this, args.shift()) : this.pure(args.shift());
                            }else if (args[0] instanceof Function) {
                                return this.lift.apply(this, args);
                            }else {
                                return this.collect.apply(this, args);
                            }
                        })
                    ];
                })(this.get('utils.async').select('pure', 'collect', 'lift', 'foldl'))
            };
        }),
        (function Resource() {
            return {
                name: 'Resource',
                parent: 'Control',
                ctor: function(identifier) {
                    this.__super__.call(this, opts);
                },
                ext: [
                    (function(store) {
                        return function mf(identifier) {
                            var path = identifier.split('/');
                            var cont = store.get(path);
                            if (!cont) {
                                var node = store.ensure(path.slice(0, -1));
                                var name = path.slice(-1).pop();
                                cont = node.set(name, base.loader.of(identifier).bind(function(result) {
                                    node.set(name, base.cont.of(result));
                                    return result;
                                }));
                            }
                            return cont;
                        }
                    })(this.get().child('resources'))
                ],
                attrs: [
                    (function of(identifier) {
                        return new this(identifier);
                    })
                ]
            };
        }),
        (function Args() {
            return {
                name: 'Args',
                parent: 'Functor',
                ctor: function(b, x) {
                    this._names  = [];
                    this._done   = {};
                    this._values = {};

                    var _args = b && b instanceof Args ? b : (x && x instanceof Args ? x : false);
                    if (_args) {
                    var mv  = x && x instanceof Array ? x.slice(0) : _args.mv.slice(0);
                    this.mf = b && b instanceof Function ? b : _args.mf;
                    this.mv = [];

                    this.setup(mv);
                    this._count  = _args._count;
                    this._done   = this.$copy({}, _args._done);
                    this._values = this.$copy({}, _args._values);
                    }else {
                    if (b && b instanceof Function) this.mf = b;

                    var mv  = x ? x.slice(0) : (this.mv ? this.mv.slice(0) : []);
                    this.mv = [];

                    this.setup(mv);
                    this._count = mv.length;
                    }
                    this._resolved = 0;
                },
                ext: [
                    '$copy', 'utils.extend', '$combine', 'utils.combine',
                    (function name() {
                        return this.constructor.$$_type;
                    }),
                    (function setup(mv, target) {
                        return mv.reduce(function(r, v) {
                            if (typeof v == 'object') {
                                if (!v.hasOwnProperty('value')) v.value = undefined;
                                r._names.push(v.name);
                                r._values[v.name] = undefined;
                                r.mv.push(v);
                            }else {
                                r._names.push(v);
                                r._values[v] = undefined;
                                r.mv.push({ name: v });
                            }
                            return r;
                        }, target || this);
                    }),
                    (function put(/* arg, value */) {
                        var args  = [].slice.apply(arguments);
                        var value = args.pop();
                        var arg   = args.length ? args.shift() : this.$arg(value);
                        if (arg && !this._done[arg] && (this._done[arg] = true)) {
                            this._values[arg] = value;
                        }else if (!arg) {
                            return false;
                        }
                        return this;
                    }),
                    (function set(/* arg, value */) {
                        this.put.apply(this, arguments);
                        if (this._count && !--this._count) {
                            return this.resolve();
                        }
                        return this;
                    }),
                    (function wrap(arg, fn) {
                        var that = this;
                        return function(value) {
                            return fn(that.set(arg, value));
                        };
                    }),
                    (function get(arg) {
                        return this.wrap(arg, unit);
                    }),
                    (function add(arg) {
                        return new this.constructor(this)
                    }),
                    (function match(value) {
                        return typeof value == 'string' && this._names.indexOf(value) > -1 ? value : this.$arg(value);
                    }),
                    (function parse(value) {
                        var arg = this.match(value);
                        if (arg) this.set(arg, value);
                        return this.$arg();
                    }),
                    (function map(f) {
                        return new this.constructor(f ? this.$combine(this.mf)(f) : this.mf, this);
                    }),
                    (function chain(value) {
                        return this.wrap(this.match(value), function(args) {
                            return args._count ? args.chain(args.$arg()) : args;
                        });
                    }),
                    (function $arg(value) {
                        var i = 0, l = this._names.length, arg;
                        while (i < l) {
                            if (!this._done[this._names[i]]) {
                                arg = this.mv[i];
                                if (arg && arg.optional && this._count && this._count--) this.put(this._names[i], value);
                                else if (!value || !arg || !arg.type) break;
                                else if (arg.type instanceof Function && value instanceof arg.type) break;
                                else if (value.constructor && value.constructor === arg.type) break;
                                else if (arg.test && arg.test(value)) break;
                                else if (arg.type.is && arg.type.is(value)) break;
                            }
                            i++;
                        };
                        if (i < l) {
                            return this._names[i];
                        }
                    }),
                    (function run() {
                        var args = [].slice.apply(arguments), val, arg, res = this;
                        while(args.length) {
                            val = args.shift();
                            if (typeof val == 'string' && this._names.indexOf(val) > -1) {
                                if (args.length) res = this.set(val, args.shift());
                            }else if ((arg = this.$arg(val))) {
                                res = this.set(arg, val);
                            }
                        }
                        return res;
                    }),
                    (function next() {
                        var res = this.run.apply(this, arguments), arg;
                        if (!this._count) return res;
                        arg = this.$arg();
                        if (this._count) return this.chain(arg);
                        else if (!this._resolved) return this.resolve();
                        return this;
                    }),
                    (function atom() {
                        return this.$atomize(this.mf, this).apply(undefined, this.$args());
                    }),
                    (function $args() {
                        var vals = this._values, done = this._done, result = [];
                        this._names.forEach(function(a) {
                            if (done[a]) result.push(vals[a]);
                        });
                        return result;
                    }),
                    (function apply(fn) {
                        return fn.apply(this, this.$args());
                    }),
                    (function resolve() {
                        this._resolved += 1;
                        return this.mf.apply(this, this.$args());
                    })
                ],
                attrs: [
                    (function of(x) {
                        return new this(x);
                    })
                ]
            };
        }),
        (function Event() {
            return {
                name: 'Event',
                parent: 'IO',
                ctor: function(f) {
                    this.unsafePerformIO = f;
                },
                ext: [
                    (function selector(value) {
                        return $const(value);
                    }),
                    (function listener(evt) {
                        this.dispatch(evt);
                    }),
                    (function throttle(fn) {
                        var stoid = 0, value;
                        return function(evt) {
                            value = evt;
                            if (!stoid) {
                                stoid = setTimeout(function() {
                                    stoid = 0;
                                    fn(value);
                                }, this.throttle);
                            }
                        }
                    }),
                    (function create() {
                        var args = [].slice.call(arguments);
                        var hndl = args.pop();
                        var slct = args.length && typeof args[args.length-1] == 'string' ? args.pop() : $const(true);
                        var thrt = args.length && typeof args[args.length-1] == 'number' ? args.pop() : 0;
                        var data = {
                            id: this._id,
                            selector: this.selector(slct),
                            run: this.listener,
                            throttle: thrt,
                            dispatch: thrt ? this.throttle(hndl) : hndl
                        };
                        return data;
                    })
                ]
            };
        }),
        (function Component() {
            return {
                name: 'Component',
                parent: 'Node',
                ctor: function(opts) {
                    if (!opts.parent) opts.parent = this.type();
                    this.__super__.call(this, opts);
                    this._type = opts.type;
                    this.parse(opts);
                    this.parent().set(this.cid(), this);
                },
                ext: [
                    'conf', {
                        opts: { js: true, css: false, tmpl: true }
                    },
                    '_node', this.child('components'),
                    (function events() {
                        var comp = this, dom = sys.eff('sys.events.observer').init().run('dom', document.body);
                        if (this.conf.events) {
                            sys.get('utils.each')(this.conf.events, function(hndl, evt, keys) {
                                if (comp[hndl]) {
                                    var parts = evt.split(':');
                                    dom.add(parts.shift(), parts.pop(), comp[hndl].bind(comp));
                                }
                            });
                        }
                    }),
                    (function eff(path) {
                        var eff1 = sys.eff(path);
                        var args = [].slice.call(arguments, 1);
                        var eff2 = args.length ? eff1.init.apply(eff1, args.splice(0)) : eff1.init();
                        
                        args = [ this ];
                        return function(/* fn, arg1, arg2 */) {
                            return eff2.run.apply(eff2, [].slice.call(arguments).concat(args));
                        }
                    }),
                    (function fold(node, elem) {
                        return this.eff('js.data.eff')(function(fold, handler, comp) {

                            return comp.tmpl().map(function(template) {

                                return template.get(node.get('type') || 'item') || template.get('item');
                            }).map(function(tmpl) {

                                return handler(function(result, type, path, key, value, id, level, node) {

                                    result.push(pure(tmpl({ type: type, path: path, key: key, value: key, id: id, level: level })));

                                    return result;

                                });
                            }).map(function(fn) {
                                return function pure(k) {
                                    return fold(fn).done(function(result) {
                                        return elem.chain(function(el) {
                                            return result.flatten().bind(function(flat) {
                                                el.innerHTML = flat.join('');
                                                k(comp);
                                            }).run();
                                        });
                                    });
                                }
                            });

                        }, function(f) {
                            return function fold(i, r, v, k, o) {
                                if (v && v.isNode) {
                                    if (v.length()) {
                                        r = f(r, 'menu', o.identifier(), k, v, v._id, v.level(), o);
                                    }
                                    if (v.isType) {
                                        r = f(r, 'item', o.identifier(), k, v, o._id, o.level(), o);
                                    }
                                }else {

                                    r = f(r, 'item', o.identifier(), k, v, o._id, o.level(), o);
                                }
                                return r;
                            }
                        })(sys.eff('js.nodes.walk').init().run(node || sys.get(), []));
                    }),
                    (function parse(conf) {
                        var opts   = this._opts ? this._opts.values(true) : null;
                        this._opts = this._opts ? this._opts.clear() : this.node('opts');

                        var data   = this._data ? this._data.values(true) : null;
                        this._data = this._data ? this._data.clear() : this.node('data').parse({ id: this._id });

                        if (opts) this._opts.parse(opts);
                        if (this.conf.opts) this._opts.parse(this.conf.opts);
                        if (conf.opts) this._opts.parse(conf.opts);

                        var item = sys.type('Item').ctor();
                        if (this.conf.data) this._data.parse(this.conf.data, true, item);
                        if (conf.data) this._data.parse(conf.data, true, item);
                        if (data) this._data.parse(data, true, item);

                        return this;
                    }),
                    (function route(ext) {
                        return 'components/'+this._type+'/'+this._type+(ext ? ('.'+ext) : '');
                    }),
                    (function data(v1, v2) {
                        return v1 ? (typeof v1 == 'object' ? this._data.parse(v1) : this._data.acc(v1, v2)) : this._data.values(true);
                    }),
                    (function opts(v1, v2) {
                        return v1 ? (typeof v1 == 'object' ? this._opts.parse(v1) : this._opts.acc(v1, v2)) : this._opts.values(true);
                    }),
                    (function elem() {
                        return this._elem;
                    }),
                    (function item(name, data, fn) {
                        return this.lift(function(comp, tmpl) {
                            var render = sys.eff('dom.elements.render').init();
                            return render.run(tmpl, name, data).chain(function(item) {
                                comp.elem().run(function(elem) {
                                    return fn(comp, elem, item);
                                });
                                return comp;
                            });
                        }).ap(this.tmpl());
                    }),
                    (function load() {
                        if (this._cont) {
                            return this._cont;
                        }else if (this.opts('js')) {
                            var comp = this;
                            return (this._cont = sys.eff('io.request.script').run(this.route()).bind(function(ext) {
                                return sys.type('Cont').is(ext) ? ext.cont() : ext;
                            }).bind(function(ext) {
                                sys.get('utils.extend')(comp.constructor.prototype, ext);
                                comp.parse({});
                                comp._cont = sys.type('Cont').pure(comp);
                                comp.events();
                                return comp;
                            }));
                        }else {
                            return this.cont();
                        }
                    }),
                    (function tmpl() {
                        var comp = this;
                        if (this.opts('tmpl')) {
                            return sys.eff('dom.elements.template').run(this.route('tmpl')).bind(function(tmpl) {
                                return tmpl;
                            });
                        }
                        return sys.type('Cont').of(sys.get('utils.pure')(false));
                    }),
                    (function style() {
                        if (this.opts('css')) {
                            sys.eff('io.request.style').run(this.route('css')).run();
                        }
                        return this;
                    }),
                    (function render() {
                        return (this._elem || (this._elem = this.style().lift(function(comp, tmpl) {
                            var render = sys.eff('dom.elements.render').init();
                            return render.run(tmpl, 'main', comp.data()).chain(function(elem) {
                                elem.setAttribute('data-id', comp._id);
                                comp._elem = sys.type('Cont').pure(elem);
                                return elem;
                            });
                        }).ap(this.tmpl())));
                    }),
                    (function find(selector) {
                        return sys.eff('dom.elements.find').run(selector);
                    }),
                    (function attach(selector) {
                        return sys.eff('dom.elements.attach').run(this.find(selector));
                    }),
                    (function run(selector) {
                        return this.load().bind(function(comp) {
                            return comp.render();//.cont();
                        }).bind(this.attach(selector)).apply(this.lift(function(comp, elem) {
                            return comp.runMain(elem).cont();
                        }));
                    }),
                    (function runMain() {
                        return this.cont();
                    })
                ],
                attrs: [
                    (function of(opts) {
                        var args  = [].slice.apply(arguments);
                        var conf  = typeof args[0] == 'object' ? args.shift() : {};
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
                        return new this(conf);
                    })
                ]
            };
        }),
        (function Handler(createDefs, createHandler, createFunctor) {
            return function Handler() {
                var handler = createHandler(this.types.find('Maybe').ctor(), this);
                return createDefs.call({
                    handler: handler, functor: createFunctor(this.get('monad.Free'), handler)
                });
            }
        })(
            (function CreateDefs() {
                return {
                    name: 'Handler',
                    parent: 'Node',
                    ctor: function(opts) {
                        this.__super__.call(this, opts);

                        this.node('env');
                        this.node('dict');
                        this.node('ops');
                        this.node('req');
                        this.node('idx');
                    },
                    ext: [
                        this.functor,
                        (function addOperation(name, op) {
                            var ops  = this.get('ops');
                            var node = ops.ensure(op.type);
                            return node.set(name, op);
                        }),
                        (function getOperation() {
                            var args = Array.prototype.slice.call(arguments),
                                requests = this.get('req'), that = this, check,
                                path = args[0] && typeof args[0] == 'string' ? args.shift() : '',
                                values = args[0] && typeof args[0] == 'object' ? args.shift() : {},
                                name = values.method || values.operation, parts = [], operid = values.oid;

                            if (!path) { path = values.path ? values.path : (values.type + '.' + name); }
                            parts = path.split('.');
                            if (!values.oid) operid = this.get('idx').val(path);

                            if (operid && values.oid && (check = requests.get(values.oid)) && operid == values.oid) {
                                return that.getRequestInstance(check);
                            }else {
                                var utils = this.root.get('utils'), mixin = utils.get('mixin');
                                return this.get('ops').lookup(path).chain(function(op) {
                                    var params  = op.args ? utils.get('obj')(op.args)(args.length ? args : (values.params || values.args || [])) : (values.args || {});
                                    var request = mixin(
                                    { oid: operid || (that.id() + ''), dict: that.identifier() },
                                    op, values,
                                    { params: utils.get('values')(mixin({}, op.defaults || {}, params)) }
                                    );
                                    return sys.of(requests.set(requests.parent('idx').val(path, request.oid), request));
                                });
                            }
                        }),
                        (function runOperation() {
                            return this.putOperation(this.getOperation.apply(this, arguments));
                        }),
                        (function putOperation(request) {
                            return this.run(request);
                        }),
                        (function testOperation(name) {
                            var node = this.root.child(name).parse({
                                runAction: function() {
                                    var args1 = [].slice.call(arguments);
                                    console.log('runAction1', args1);
                                    return function() {
                                        var args2 = [].slice.call(arguments);
                                        console.log('runAction2', args2);
                                        return sys.type('Cont').of(args1.concat(args2));
                                    }
                                },
                                checkResult1: sys.type('IO').pure(function(check) {
                                    console.log('checkResult1', check);
                                    check.run(function(result) {
                                        console.log('runResult1', result);
                                    });
                                }),
                                checkResult2: sys.type('IO').pure(function(check) {
                                    console.log('checkResult2', check);
                                    check.run(function(result) {
                                        console.log('runResult2', result);
                                    });
                                })
                            });
                            this.addOperation('request', {
                                type: 'sys.handler',
                                action: 'runAction',
                                args: [ 'method', 'values' ],
                                result: {
                                    action: 'checkResult1',
                                    location: node.identifier()
                                }
                            });
                            var that = this;
                            return function() {
                                var params = [].slice.call(arguments);
                                that.runOperation('sys.handler.request', {
                                    location: node.identifier(),
                                    params: params.splice(0, 2),
                                    result: {
                                        action: params.length ? params.pop() : 'checkResult1',
                                        location: node.identifier()
                                    }
                                });
                            }
                        })
                    ]
                };
            }),
            (function CreateFreeHandler(mbee, root) {

                function runargs(task) {
                  var runnable = task.run, idx = 0, args = task.args;
                  while (runnable && idx < args.length) {
                    if (typeof args[idx] != 'undefined') {
                      runnable = runnable(task[args[idx]] || task.params[idx] || (task.defaults ? task.defaults[args[idx]] : undefined)); idx++;
                    }
                  }
                  return runnable || unit;
                };
                function wrap(runnable) {
                  if (runnable) {
                    if (runnable instanceof mbee) return runnable;
                    else if (runnable.map && runnable.run) return runnable;
                    else return mbee.of(runnable);
                  }else {
                    return mbee.of(unit);
                  }
                };
                function create(task, action) {
                  return function(target) {
                    if (task.action || task.method) {
                      task.run = target.fn ? (target.fn(action) || target.get(action)) : target[action];
                    }else if (action) {
                      root.lookup(task.node).map(function(node) {
                        task.run = node.get(action)(target);
                        return node;
                      }).orElse(function() {
                        return root.lookup(task.location).chain(function(node) {
                            task.run = node.get(action)(target);
                            return node;
                        });
                      });
                    }else if (task.monad) {
                      task.run = task.monad.of(target);
                    }else if (task.fn) {
                      task.run = task.fn(target);
                    }
                    if (task.args && task.args.length) task.run = runargs(task);
                    return task.run;
                  }
                };
                function interpret(task) {

                  if (task.instruction) {

                    return root.lookup(task.dict).map(function(dict) {
                        return dict.get(task.instruction);
                    }).map(function(instruction) {
                        return create(task, instruction.get(task.type))
                    });

                  }else if (task.action || task.method) {

                    return create(task, task.action || task.method);

                  }else if ((task.run = task.fn)) {

                    return (task.run = (task.args && task.args.length ? runargs(task) : task.run));

                  }else {

                    return create(task);

                  }
                };
                function handler(task) {
                  return wrap(

                    interpret(task)

                  ).ap(

                    task.location ? root.lookup(task.location) : (task.node ? task.node.just() : mbee.of(root))

                  );
                };
                return handler;
            }),
            (function CreateFreeFunctor(free, handler) {
                function make(sub, task) {
                    return function() {
                        return free.makeThread(sub.ap(handler(task)));
                    }
                };
                function compose(task, result) {
                    return free.bindThread(result, function(sub) {
                        return free.bindThread(free.yyield(), make(sub, task));
                    });
                };
                function bind(task) {
                    if (task.result && !task.result.run) {
                        return compose(task, free.makeThread(handler(task.result)));
                    }else if (task.fn) {
                        return free.mapThread(free.makeThread(handler(task)), function(value) {
                            return value.run(task.fn);
                        });
                    }else {
                        return free.makeThread(handler(task));
                    }
                };
                return function run(request) {
                    return free.runThreads(free.bindThread(free.makeThread(request), bind));
                };
            })
        ),
        (function Router() {
            return {
                name: 'Router',
                parent: 'Node',
                ctor: function(opts) {
                    this.__super__.call(this, opts);

                    this._started = false;
                    this._scope   = opts.scope || [];
                    this._active  = this.set('active', null);
                    this._scopes  = this.node('scopes');

                    this.init();
                },
                ext: [
                    (function init() {
                        var doc = sys.eff('sys.events.observer').init().run('doc', self);
                        var evt = doc.add('hashchange', this.listener.bind(this));
                        this._evt = evt;
                    }),
                    (function listener(evt) {
                        var loc = self.location.hash.slice(1);
                        this.handleHashChange(loc);
                    }),
                    (function testIfExists(path) {
                      if (typeof path != 'string') return false;

                      var parts = path.split('/');
                      var route = parts.pop();

                      if (parts.length && parts[0] == this._cid) parts.shift();

                      if (parts.length > this._scope.length) return false;
                      else if (parts.length && parts.join('/') != this._scope.join('/')) return false;

                      if (typeof route == 'string' && this._routes && this._routes.get(route)) {
                        return true;
                      }else {
                        return false;
                      }
                    }),
                    (function runIfExists(path) {
                      if (this.testIfExists(path)) {
                        this.set('active', path);
                        return true;
                      }else {
                        return false;
                      }
                    }),
                    'enqueue', 'scheduler.nextTick.enqueue',
                    (function run(rtr, handler, route) {
                        return function() {
                            handler.call(rtr, route);
                            return true;
                        }
                    }),
                    (function handleHashChange(path) {
                      if (typeof path == 'string') {
                        var handler = this.getRoute(path);
                        if (handler && handler instanceof Function) {
                          this.enqueue(this.run(this, handler, this.getRouteName(path)));
                        }
                      }
                    }),
                    (function getRoutes() {
                      return this._routes || (this._routes = this.get('routes') || this.node('routes'));
                    }),
                    (function getRouteName(name) {
                      var routes = this.getRoutes(), route = routes.get(name);
                      return typeof route == 'string' ? route : name;
                    }),
                    (function getRoute(name) {
                      return this.getRoutes().get(this.getRouteName(name));
                    }),
                    (function setRoute(name) {
                      this.clearActiveRoute();
                      var route = this._scope.slice(0);
                      route.push(name);
                      self.location.href = '#' + route.join('/');
                      return this;
                    }),
                    (function clearActiveRoute() {
                      var active = this.getActiveRouter(), depth = this._scope.length, test = active;
                      while (active && active._scope && active._scope.length > depth) {
                        active.val('active', null);
                        if (active._scope.length && (test = active.parent()) && test instanceof Router) active = test;
                        else break;
                      }
                      return this;
                    }),
                    (function getFromHash(fallback) {
                      var route = self.location.hash.slice(1);
                      return route && route.length ? route : fallback || '';
                    }),
                    (function navigate(route) {
                      var alias = this.getRoutes().get(route || '');
                      if (alias && typeof alias == 'string') {
                        this.setRoute(alias);
                      }else {
                        this.setRoute(route || '');
                      }
                    }),
                    (function moveBack(times) {
                      var hist = self.history, length = Math.min(times || 1, hist.length);
                      while (length && hist.back() && length--) {};
                    }),
                    (function moveForward(times) {
                      var hist = self.history, length = Math.min(times || 1, hist.length);
                      while (length && hist.forward() && length--) {};
                    }),
                    (function popState(end) {
                      var parts = self.location.hash.slice(1).split('/');
                      if (!parts.length) {
                        return false;
                      }else if (end && parts[parts.length-1] != end) {
                        return false;
                      }else {
                        var loc = '#'+parts.slice(0, -1).join('/');
                        self.location.replace(loc);
                        this.set('active', loc.replace('#', ''));
                        return true;
                      }
                      return false;
                    }),
                    (function addRoute(name, handler, info, aliasIfStringOrUseAsDefaultIfTrue) {
                      var routes = this.getRoutes();
                      routes.set(name, handler);
                      if (info === true) this.setDefault(name);
                      else if (typeof info == 'string') this.addAlias(info, name);
                      else if (typeof info != 'undefined') this.addInfo(name, info);
                      if (aliasIfStringOrUseAsDefaultIfTrue) {
                        this.addAlias(aliasIfStringOrUseAsDefaultIfTrue === true ? '' : aliasIfStringOrUseAsDefaultIfTrue, name);
                      }
                      return this;
                    }),
                    (function addAlias(name, alias) {
                      return this.getRoutes().set(name, alias);
                    }),
                    (function setDefault(name) {
                      return this.getRoutes().set('', name);
                    }),
                    (function addInfo(name, info) {
                      var node = this._info || (this._info = this.get('info')) || (this._info = this.node('info'));
                      return node.set(name, info);
                    })
                ]
            };
        }),
        (function Module() {
            return {
                name: 'Module',
                parent: 'Component',
                ctor: function(opts) {
                    this.__super__.call(this, opts);
                },
                ext: [
                    'conf', {
                        js: false, css: false
                    },
                    '_node', this.child('modules')
                ]
            };
        })
    ),