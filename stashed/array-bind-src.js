


    Array.prototype.collect = function() {
        return collect(this);
    })

    (function $_collect(_collect_) {
        return function collect() {
            return _collect_(this);
        }),
    })(
        (function _$_collect(run, next, enqueue) {
            return function collect(xs) {
                return function pure(succ, fail) {
                    return enqueue(next(xs.slice(0), run(0, xs.map($const(undefined)), succ, fail)));
                }
            };
        })
    )
                        (function (collect, bind, compose, fmap, lift, fold, apply, flatmap, combine, select) {
                            Array.prototype.bind = function(f) {
                                return bind(this, f);
                            };
                            Array.prototype.at = function(index) {
                                return this.length && index < this.length ? this[index] : [];
                            };
                            Array.prototype.select = select;
                            Array.prototype.apply = apply;
                            Array.prototype.flatmap = flatmap;
                            Array.prototype.flatten = function() {
                                return this.flatmap(unit);
                            };
                        })

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
                        (function _bind_($bind) {
                            return function bind(f) {
                                return bind(this, f);
                            }
                        }),
                        (function make($func, $bind, $wrap) {
                            return function bind(x, f) {
                                return x.map($func($bind, $wrap(f)));
                            }
                        })(
                            (function func(b, f) {
                                return b(f, b(f));
                            }),
                            (function bind(f, b) {
                                return function(x) {
                                    return x instanceof Array ? x.map(b || bind(f)).fmap(unit) : f(x);
                                }
                            }),
                            (function wrap(closed) {
                                return function wrap(f) {
                                    return function(x) {
                                        return closed(f, x);
                                    }
                                }
                            })(
                                (function closed(f, x) {
                                    return function $_pure(k) {
                                        if (x instanceof Function) {
                                            return x(function(r) {
                                                k(f(r));
                                            });
                                        }else {
                                            return k(f(x));
                                        }
                                    }
                                })
                            )
                        ),
                        (function ap(f, x) {
                            return function pure(succ, fail) {
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
                                x(function (r) {
                                    _x = r;
                                    fin();
                                }, fail);
                            };
                        }),
                        (function fmap(ap, pure) {
                            return function fmap(f, x) {
                                return ap(pure(f), x);
                            };
                        }),
                        (function MakeRun(bind) {
                            return function run(x, f) {
                                return bind(f)(x);
                            };
                        })(
                            (function(f) {
                                return function run(x) {
                                    if (x instanceof Array) {
                                        return x.map(run).fmap(f);
                                    }else {
                                        return x;
                                    }
                                };
                            })
                        ),
                        (function combine(make) {
                            return function combine(f, arr) {
                                return this.bind(make(function(v, t) {
                                    return f(v, t);
                                }, arr)).collect();
                            }
                        })(
                            (function makeCombi(f, arr) {
                                return function(v) {
                                    return arr.bind(function(x) {
                                        return f(v, x);
                                    }).collect();
                                }
                            })
                        ),
                        (function fmap(c) {
                            return function fmap(x, f) {
                                return c(f, x.slice(0).collect());
                            }
                        })(
                            (function compose(f, x) {
                                return function(succ, fail) {
                                    x(function(r) {
                                        succ(f(r));
                                    });
                                }
                            })
                        ),
                        (function chain(x, f) {
                            return [ x.fmap(f) ];
                        }),
                        (function first(x, f) {
                            return x.chain(function(result) {
                                return (f || unit)(result.at(0));
                            });
                        }),
                        (function run2(succ, fail) {
                            return collect(succ || unit, fail);
                        }),
                        (function $lift($fmap) {
                            return function lift(x, f) {
                                return Array.of(fmap(function(xs) {
                                    return f.apply(undefined, xs);
                                }, x.collect()));
                            };
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
                        }),
                        (function flatmap() {
                            return [].slice.call(arguments).apply();
                        })(
                            (function make($_apply) {
                                return function flatmap(x, f) {
                                    return Array.of(x.ap($_apply(f || unit)));
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
                                return function(f) {
                                    return function $_apply(x) {
                                        if (x instanceof Array) {
                                            return flat(x, bind(f));
                                        }else {
                                            return x;
                                        }
                                    }
                                };
                            })()
                        )
                    ],