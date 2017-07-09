var test4 = test2.map(sys.fn.pure(function(r, v, k) {
  console.log('test4', [].slice.call(arguments));
  if (typeof v == 'string') {
    r[k] = '!'+v+'!';
  }
  return r;
}));

test4.run({ext:'bla'})({});

                var $Bind = Bind.call($CTOR.find('$compose'));
                var $Fold = Fold.call($CTOR.find('$bind'));
                $Bind.get('$fold').child('items').set('fold', $Fold);


        // === Bind  === //
            (function Bind(bind, map, make, init, wrap) {
                return function() {
                    return wrap.call(this, init(make(map, bind)));
                }
            })(
                (function bind(ret, map, run) {
                    return function(val) {
                        return function(fn) {
                            return run(val)(ret(val)(val), map(val)(fn, val));
                        }
                    }
                }),
                (function map(fn) {
                    return function(type) {
                        return fn(type);
                    }
                }),
                (function make(map, bind) {
                    return function(type, fn) {
                        return bind(fn(type.ret || type), map(fn)(type.bind || type), fn(type.run || type));
                    }
                }),
                (function init(make) {
                    return function(fn) {
                        return function(type) {
                            return make(type, fn);
                        }
                    }
                }),
                (function wrap(ctor, proto, attrs) {
                    return function(make) {
                        return this.extend(ctor, proto, attrs(make));
                    }
                })(
                    (function Bind(f) {
                        this._id = this.id();
                        this._x  = f;
                    }),
                    (function() {
                        return [].slice.call(arguments);
                    })(
                        (function map(t) {
                            if (t instanceof Function) {
                                return new this.constructor(this.$fn(this._x)(t));
                            }else {
                                return new this.constructor(this._x(t));
                            }
                        }),
                        (function ap(monad) {
                            return monad.map ? monad.map(this.$fn(this._x)(unit)) : this.$fn(this._x)(unit)(monad);
                        }),
                        (function run(v) {
                            return this.$fn(this._x)(unit)(v);
                        })
                    ),
                    (function(of) {
                        return function(make) {
                            return [ of(make) ];
                        }
                    })(
                        (function(make, curry) {
                            return function of(fn) {
                                return new this(make(fn));
                            }
                        })
                    )
                )
            ),
        // === Fold === //
            (function() {
                return this.extend(function Fold(f) {
                    this._id = this.id();
                    this._x  = f;
                }, {
                    run: function(v) {
                        return this.$fn(this._x)(this.ctor.find('maybe', 'type.$pure'))(v);
                    }
                }).$of(function $fold(t) {
                    return function(v) {
                        if (!v) return t['none'] || $const;
                        else if (v instanceof Array) return t['array'] || t['def'];
                        return t[typeof v] || t['def'] || $const;
                    }
                }).map({
                    run: {
                        def: function(items, fn) {
                            return function(target) {
                                return fn(items);
                            }
                        },
                        array: function(items, fn) {
                            return function(target) {
                                return items.reduce(fn, target);
                            }
                        },
                        object: function(items, fn) {
                            return function(target) {
                                return items.reduce(fn, target);
                            }
                        }
                    },
                    bind: {
                        def: function(fn, items) {
                            return fn(items);
                        },
                        array: function(fn, items) {
                            return function(r, k, i) {
                                return fn(r, k, i, items);
                            };
                        },
                        object: function(fn, obj) {
                            return function(r, k, i) {
                                return fn(r, obj[k], k, i, obj);
                            };
                        }
                    },
                    ret: {
                        def: function(value) {
                             return value;
                        },
                        object: function(value) {
                             return Object.keys(value);
                        }
                    }
                });
            }),
