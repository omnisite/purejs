(function() {

    return [].slice.call(arguments).pure(0, true)(self.sys || (self.sys = {}));

})(
    // === TypeWrap === //
    (function() {
        var items = [].slice.call(arguments);
        return function() {
            return items.slice(1).apply();
        }
    })(
        (function() {
            return [].slice.call(arguments).reduce(function(r, v, i) {
                //if (i == 0) r[v.name] = v(unit);
                if (v.name && r.root) r.root.set(v.name, v);
                else if (v.name) r[v.name] = v;
                else if ((v = v.call(r)) && v.name == 'Store') r.types[v.name] = r.makeKlass(v);
                else if (v.ext || v.ctor) r.types[v.name] = r.makeKlass(v);
                return r;
            }, this);
        }),
        (function $_parseArgs(getArgs, makeArgs) {
            return function parseArgs(f, r) {
                if (f.name.substr(0, 2) == '$_') {
                    return makeArgs(f, getArgs(f), r);
                }else {
                    return f;
                }
            }
        }),
        (function getArgs(func) {
            // Courtesy: https://davidwalsh.name/javascript-arguments
            var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];
            return args.split(',').map(function(arg) {
                return arg.replace(/\/\*.*\*\//, '').trim();
            }).filter(function(arg) { return arg; });
        }),
        (function makeArgs(func, args, arr) {
            return func.apply(undefined, args.map(function(a, i, r) {
                return arr[a.replace('$_', '')];
            }));
        })
    ),

    // === TypeWrap === //
    (function() {
        return [].slice.call(arguments);
    })(
        // === Cell === //
        (function() {
            return {
                name: 'Cell',
                ctor: function Cell() {
                    this.value = undefined, this.isDefined = false, this.queue = [];
                },
                ext: [
                    (function get(k) {
                        if (this.isDefined) {
                            //JavaScript as an Embedded DSL 429 430 G. Kossakowski et al.
                            k(this.value);
                        }else {
                            this.queue.push(k);
                        }
                    }),
                    (function set(v) {
                        if (this.isDefined) {
                            throw "can’t set value twice"
                        }else {
                            this.value = v, this.isDefined = true,
                            this.queue.forEach(function (f) {
                                f(v) //non-trivial spawn could be used here })
                            });
                        }
                    })
                ],
                attrs: [
                    (function of() {
                        return new this();
                    })
                ]
            };
        }),

        // === CellOps === //
        (function() {
            return {
                name: 'CellOps',
                ctor: function CellOps(x, f) {
                    if (x) this.x = x;
                    if (f) this.f = f;
                },
                ext: [
                    (function apply(k) {
                        return this.x.get(this.f(k));
                    })
                ],
                attrs: [
                    (function of() {
                        return new this();
                    })
                ]
            };
        }),

        // === Store === //
        (function() {
            return {
                name: 'Store',
                ctor: function Store(opts) {
                    this.store(opts || {});
                },
                ext: [
                    (function store(opts) {
                        this._id  = this.id();
                        this._val = [];
                        this._ids = [];
                        this._map = {};
                        this._cid = opts.name || opts.cid || opts.id;
                        if (opts.parent) this._parent = opts.parent;
                    }),
                    (function of(opts) {
                        return new this.constructor(opts);
                    }),
                    (function get(key) {
                        if (arguments.length > 1) return this.path([].slice.call(arguments));
                        else if (key && typeof key == 'string' && (this._map[key]>=0)) return this._val[this._map[key]];
                        else if (key && typeof key == 'number') return key >= 0 && key < this._val.length ? this._val[key] : undefined;
                        else if (key && key.indexOf && key.indexOf('.') > 0) return this.path(key);
                        else if (key && key instanceof Array) return key.length > 1 ? this.path(key) : this.get(key.slice(0).shift())
                        else return key ? undefined : (this._ref || this);
                    }),
                    (function set(key, value) {
                        return key && key.indexOf && key.indexOf('.') > 0 ? this.path(key, value)
                        : (this._val[(this._map[key] >= 0
                            && !this.emit('change', key, 'update', value) ? this._map[key]
                        : (
                            this._map[this.emit('change', key, 'create', value)||key] = this._ids.push(key)-1))] = value);
                    }),
                    (function add(name) {
                        return this.get(name) || this.set(name, this.of({ name: name, parent: this }));
                    }),
                    (function parent(key) {
                        return this._parent ? this._parent.get(key) : null;
                    }),
                    (function path() {
                        return [].slice.call(arguments).join('.').split('.').reduce(function(result, key) {
                            if (!key || !result) {
                                return result;
                            }else if (result instanceof Array) {
                                result = result.get(key);
                            }else if (typeof result == 'object') {
                                if (result && result._map && result._map[key] >= 0) result = result.get(key);
                                else result = result[key];
                            }
                            return result;
                        }, this);
                    }),
                    (function emit() {

                    })
                ],
                attrs: [
                    (function of(opts) {
                        opts || (opts = {});
                        if (typeof opts == 'string') {
                            return new this({ name: opts });
                        }else {
                            return new this(opts);
                        }
                    })
                ],
                data: {
                    async: [
                        // ===== $_pure ===== //
                        (self.pure),
                        // ===== AsyncAP ===== //
                        (function $_ap(f, x) {
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
                                x(function (r) {
                                    _x = r;
                                    fin();
                                }, fail);
                            };
                        }),
                        // ===== AsyncFMAP ===== //
                        (function $_fmap($_ap, $_pure) {
                            return function fmap(f, x) {
                                return $_ap($_pure(f), x);
                            };
                        }),
                        // === Monadic Bind Array == //
                        (function bind() {
                            return [].slice.call(arguments).apply();
                        })(
                            (function make(map, wrap) {
                                return function bind(f) {
                                    return this.xs.map(map(wrap(map(f))));
                                }
                            }),
                            (function map(f) {
                                function bound(x) {
                                    return x instanceof Array ? x.map(bound) : f(x);
                                };
                                return bound;
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
                        // === FlatMap Bind Array == //
                        (function flatmap() {
                            return [].slice.call(arguments).apply();
                        })(
                            (function make($_apply) {
                                return function flatmap(f) {
                                    return this.then($_apply(f || unit));
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
                    ]
                },
                init: function(type, klass) {
                    var root  = this.root = klass.of('root');
                    var sched = root.add('scheduler');
                    sched.set('dispatcher', this.dispatcher);
                    sched.set('nextTick', this.dispatcher(unit)());
                    if (type.data) {
                        if (type.data.utils) this.ext(type.data.utils, root.add('utils'));
                        if (type.data.async) this.ext(type.data.async, root.add('async'));
                    }
                    return root;
                }
            };
        }),

        // === Collect === //
        (function() {
            return {
                name: 'Collect',
                klass: function Collect(xs) {
                    this.id = this.id();
                    this.xs = xs;
                },
                ext: [
                    // ===== OF ==== //
                    (function of() {
                        return new this.constructor([].slice.call(arguments));
                    }),
                    // ===== Array Collect ===== //
                    (function $_collect($_pure, $_tick) {
                        return function collect(k) {
                            return $_tick(0, this.xs.slice(0), $_pure(0, this.xs.map($const), k));
                        }
                    })(
                        (function $_collect(c, v, k) {
                            return function(r, i) {
                                v[i] = r;
                                if (++c == v.length) {
                                    k(v);
                                }
                            }
                        }),
                        (function $_tick(i, x, f) {
                            return function() {
                                if (i < x.length) f(x[i], i++, i < x.length);
                                return !(i < x.length);
                            }
                        })
                    )
                ],
                attrs: [
                    (function $of() {
                        var ctor = this;
                        return function() {
                            return ctor.of.apply(ctor, arguments);
                        }
                    }),
                    (function of(x) {
                        return new this(x);
                    }),
                    (function pure(x) {
                        return new this(x);
                    })
                ],
                init: (function(base, ext) {
                    return function(type, klass) {
                        return ext.call({ klass: base(klass), root: this.root });
                    }
                })(
                    (function(klass) {
                        klass.prototype.base = klass.of([]);
                        return klass;
                    }),
                    (function() {
                        this.klass.prototype.async = this.root.get('utils.target')(this.root.get('async'))('get');
                        this.klass.prototype.flatmap = function(f) {
                            return Array.prototype.concat.apply([], this.map(f));
                        }
                        this.klass.prototype.push = function() {
                            return this.xs.push.apply(this.xs, [].slice.call(arguments));
                        };
                        this.klass.prototype.enqueue = function() {
                            return this.base.push(new this.constructor([].slice.call(arguments)));
                        };
                        Array.prototype.collect = this.klass.of([]);
                        Array.prototype.fmap = function(f) {
                            return ext.fmap(f, ext.collect(this));
                        };
                        Array.prototype.chain = function(f) {
                            return [ this.fmap(f) ];
                        };
                        Array.prototype.lift = function(f) {
                            return this.chain(ext.get(function(xs) {
                                return f.apply(undefined, xs);
                            }));
                        };
                        return this;
                    })
                )
            };
        }),

        // === Utils === //
        (function() {
            return {
                name: 'Utils',
                ctor: function Utils(map) {
                    this.map = map;
                },
                ext: [
                    (function pass(f) {
                        return function() {
                            return f(this.xs).apply(undefined, arguments);
                        }
                    }),
                    (function call(f) {
                        return function() {
                            return f(this);
                        }
                    })
                ]
            };
        })
    )

);
