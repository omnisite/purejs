        /*(function flatmap() {
            return [].slice.call(arguments).apply();
        })(
            (function make($map, $bind) {
                return function flatmap(f) {
                    return $map([], $bind(f || unit, this), this);
                };
            }),
            (function $map(a, f, x) {
                return x.bind(function(v, i, o) {
                    return v instanceof Array ? a.push.apply(a, v) : a.push(v);
                }).chain(function() {
                    return f(a);
                });
            }),
            (function $bind(map) {
                function bind(f, o) {
                    function bound(x, i) {
                        return x instanceof Array ? map(x, bind(f, x)) : f(x, i, o);
                    };
                    return bound;
                };
                return bind;
            })(
                (function(x, f) {
                    return Array.prototype.concat.apply([], x.map(f));
                })
            )
        ),*/

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
                            return function fmap(f) {
                                return c(f, this.slice(0).collect());
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