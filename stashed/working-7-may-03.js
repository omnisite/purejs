// ========  ========= PURE JS ====== ========  ======== //

    (function MakeApp() {

        return [].slice.call(arguments).next(unit).call(1);
    })(

    // === ReadInitialTypes === //
    (function() {
        return [].slice.call(arguments).apply();
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
        // === CreateArgsResolver === //
        (function() {
            return [].slice.call(arguments).apply();
        })(
            (function(items) {
                return items.append(items.apply()).splice(1);
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
            }),
            (function() {

                return [].slice.call(arguments).shift().call([ Array.prototype ].concat([].slice.call(arguments)));
            })(
                (function call() {
                    return this[2].apply(this, this.slice(1));
                }),
                (function values() {
                    return this.reduce(function(r, v) {
                        r[v.name] = v;
                        return r;
                    }, this.shift());            
                }),
                (function call(idx) {
                    return this[0].apply(this[1], this.slice(2+(idx||0)));
                }),
                (function at(index) {
                    return this.length && index < this.length ? this[index] : [];
                }),
                (function next(f) {
                    return Array.prototype.concat.apply([], this.map(f));
                }),
                (function ap(item) {
                    return item && item.$ap ? item.$ap(this) : item.map(this.chain(unit));
                }),
                (function pure(idx, slice) {
                    return typeof idx != 'undefined' &&
                        idx < this.length && this[idx] instanceof Function
                            ? this[idx](slice ? this.slice(idx+1) : this) : pure(this);
                }),
                (function append() {
                    this.push.apply(this, [].slice.call(arguments));
                    return this;
                }),
                (function MakeArray($apply) {
                    return function apply(idx, recur) {
                        if (recur || idx === true) {
                            return $apply(this);
                        }else if (idx instanceof Function) {
                            return idx.apply(undefined, this.slice(0));
                        }else {
                            return this[idx||0].apply(undefined, this.slice((idx||0)+1));
                        }
                    };
                }).call(Array,
                    (function apply(bind) {
                        return function $apply(x) {
                            if (x instanceof Array) {
                                return bind($apply)(x).apply();
                            }else {
                                return x;
                            }
                        }
                    })(
                        (function bind(f) {
                            return function(x) {
                                return Array.prototype.concat.apply([], x.map(f));
                            }
                        })
                    )
                )
            )
        )
    ),

    // === Essentials === //
    (function() {

        return (self.sys = { types: {} });
    })(
        (self.rafNext = 0),
        (self.now = (function now(run) {
            return run();
        })(
            (function() {
            var perf = self.performance;
            if (perf && (perf.now || perf.webkitNow)) {
                var perfNow = perf.now ? 'now' : 'webkitNow';
                return perf[perfNow].bind(perf);
            }else { return Date.now; }
        }))),
        (self.unit = (function unit(t) {
            return t;
        })),
        (self.$const = (function $const(a) {
            return function() {
                return a;
            }
        })),
        (self.extract = (function extract(fn) {
            return fn(unit);
        })),
        (self.pure = (function $_pure(v) {
            return function(f) {
                return f(v);
            }
        }))
    ),

    // === ID === //
    (function makeID(base, prefix) {
        var counter = { base: base || 1000000, prefix: prefix || '', count: base || 1000000 };
        return function() {
            return counter.count++;
        }
    }),

    // === Named === //
    (function() {

        return [].slice.call(arguments).apply();
    })(
        (function(build, make, capture, result, wrap) {
            return wrap(build(make), capture, result);
        }),
        (function() {
            var args = [];
            var next = (function(f) { return f(args.shift()); });

            var tmpl = [ 
                pure('$$__purejs.push(pure((function Make'), next, pure('() {'),
                    pure('return function '), next, pure('() {'),
                        pure(' this.id();'),
                        pure(' this.ctor.apply(this, arguments);'),
                        pure(' this.__level__ && !(this.__level__ = 0);'),
                        pure(' this.__super__.call(this);'),
                        pure(' return this;'),
                    pure('}})()));') ];

            return function(k) {
                return k(args, next, tmpl);
            }
        })(),
        (function(args, next, tmpl) {
            return function named(name, id, ctor, level, superr) {
                args.push(name, name);
                return tmpl.filter(function(v, i) {
                    return i < 6 || (i == 7 && id) || (i == 8 && ctor) || (i == 9 && level) || (i == 10 && superr) || i > 10;
                }).map(extract).join('');
            }
        }),
        (function() {
            var val = self.$$__purejs = [];
            return function tmp(fn) {
                return fn(unit);
            }
        })(),
        (function(text) {
            var script = document.createElement('script');
            script.innerHTML = text;
            var headel = document.getElementsByTagName('head')[0];
            headel.appendChild(script);
            headel.removeChild(script);
            return $$__purejs.pop();
        }),
        (function(make, capture, result) {
            return function named() {
                return capture(result(make.apply(undefined, [].slice.call(arguments))));
            }
        })
    ),

    // === InheritProto === //
    (function inherit(klass, parent) {
        var F = (function() {});
        F.prototype = parent.prototype;
        var proto = new F(); proto.constructor = klass;
        return proto;
    }),

    // === ExtendTarget === //
    (function ext(items, target, plain) {
        return items.reduce(function(r, v) {
            var name = v.name ? v.name.replace('$_', '') : '';
            if (plain || !r || !r.set) {
                r[name] = name != v.name ? r[name]() : (r[v.name] = v);
            }else if (name != v.name) {
                r.set(name, v());
            }else {
                r.set(name, v);
            }
            return r;
        }, target);
    }),

    // === SuperCalls === //
    (function $super() {
        if (this.__level__) this.__parent__[--this.__level__].ctor.apply(this, [].slice.call(arguments));
        if (!this.__level__) this.__super__ = function(fn) { return this.__parent__[this.__parent__.length-1][fn].apply(this, [].slice.call(arguments, 1)); };
    }),

    // === Klass === //
    (function makeKlass(/* args: name, ext, defs */) {
        var args   = [].slice.call(arguments);
        var type   = typeof args[0] == 'object' ? (args[0].ext ? args.shift() : { ext: args.shift() }) : {};
        var name   = typeof args[0] == 'string' ? args.shift() : type.name;
        var attrs  = args.length && typeof args[0] == 'object' ? args.shift() : {};

        var klass  = type.klass || this.named(name, true, type.ctor, !!parent, !!parent);
        var parent = type.parent;
        klass.prototype = this.ext(type.ext || [], parent
          ? this.inherit(klass, parent)
            : { constructor: klass, ctor: type.ctor || unit }, true);
        if (type.attrs) this.ext(type.attrs, klass);
        if (!klass.prototype.id) klass.prototype.id = this.makeID();
        if (type.init) type.init.call(this, type, klass);
        return klass;
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
                utils: [
                    (function values(obj, useVal) {
                        return function(key, value, asArray) {
                            if (!key) return obj;
                            else if (typeof value === 'undefined') return obj.get(key);
                            else if (useVal !== false) return obj.val(key, value, asArray);
                            else if (asArray) return obj.push(key, value, asArray);
                            else return obj.set(key, value, asArray);
                        }
                    }),
                    (function keys(nativeKeys) {
                        return function keys(obj) {
                            if (typeof obj != 'object') return [];
                            if (nativeKeys) return nativeKeys(obj);
                            var keys = [];
                            for (var key in obj) if (_.has(obj, key)) keys.push(key);
                            if (hasEnumBug) collectNonEnumProps(obj, keys); // Ahem, IE < 9.
                            return keys;
                        };
                    })(Object.keys),
                    (function assign(obj) {
                        obj || (obj = {});
                        return function(val, key) {
                            if (key && val) obj[key] = val;
                            return obj;
                        };
                    }),
                    (function $_parse($_values) {
                        return function parse(value) {
                            var that = this;
                            try {
                                function addValue(val, key) {
                                    if (!key || (parseInt(key)+'') === key) {
                                        if (val instanceof Array && typeof val[0] == 'string') {
                                            that.add(val.slice(0, 1).shift(), val.slice(-1).shift());
                                        }else {
                                            that.add(val.name || val.id || val.constructor.name, val);
                                        }
                                    }else {
                                        that.add(key, val);
                                    }
                                }
                                $_values(value, addValue);
                            }catch(e) {
                                console.log(e);
                            }
                            return this;
                        }
                    }),
                    (function property(fn) {
                        return function() {
                          var args = Array.prototype.slice.call(arguments);
                          return function(obj) {
                            return !obj || !fn ? null :
                              (fn instanceof Function ? fn.apply(obj, args) :
                                (obj && obj[fn] && obj[fn].apply ? obj[fn].apply(obj, args) : null));
                          };
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
                    }),
                    (function y(r) {
                        return (function (f) {
                            return f(f);
                        })(function (f) {
                            return r(function (x) {
                                return f(f)(x);
                            });
                        });
                    }),
                    (function $_startWalk($_y) {
                        return function(fn, opts) {
                            return function outerWalk(node) {
                                return $_y(function(loop) {
                                    return function(value) {
                                        return fn(node, value, opts);
                                    };
                                });
                            };
                        }
                    })
                ],
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
    }),



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
    })

);
