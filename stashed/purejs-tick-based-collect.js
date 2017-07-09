(function(def, tick, make, parse, collect, types, pure, sys, eff) {
    sys.enqueue(parse(tick, collect.pure(0, true)(tick), types, sys.threads, sys, eff));
    return def((self.sys = make(sys)));
})(
    (function def(sys) {
        define(function() {
            return function $_pure(f) {
                return f(sys.type('Cont').of(sys));
            }
        });
    }),
    (function tick(t, s) {
        return t(s);
    })(
        (function tick(safe) {
            return function tick(i, x, f) {
                return function tick() {
                    return i < x.length ? safe(f(x[i], i++, i < x.length))(tick) : true;
                };
            };
        }),
        (function safe(v) {
            return v && v instanceof Function ? v : unit;
        })
    ),
    (function makeSys(make) {
        return function(sys) {
            return make.call({}, sys);
        }
    })(
        (function makeSys(sys) {
            this.get = function() {
                return sys.root.get([].slice.call(arguments).join('.'));
            };
            this.type = function(name) {
                var type = sys.types[name];
                if (type && type.isType && !type.done && !type.pending && (type.pending = true)) return sys.make(type);
                else return type.klass;
            };
            this.inherit = function(/* name, parent, ext */) {
                var args = [].slice.call(arguments), name, type = {};
                if (args.length == 1) return sys.make(args.shift());
                else if (args.length > 1 && typeof args[0] == 'string') {
                    name = args.shift();
                }
                if (typeof args[args.length-1] == 'object') {
                    type = args.pop(); if (!type.ext) type = { ext: type }; if (name) type.name = name;
                }
                if (args.length && typeof args[0] == 'string') type.parent = args.shift();
                return sys.make(type);
            };
            this.collect = function() {
                return [].slice.call(arguments);
            };
            this.find = function(value) {
                return root.find(value);
            };
            this.xhr = function(key) {
                return sys.xhr(key);
            };
            this.eff = function(key) {
                return sys.eff(key);
            };
            this.cont = function(key) {
                return key ? this.get(key).cont() : (sys.cont || (sys.cont = $const(this.type('Cont').of(this))))();
            };
            this.enqueue = function(deps, run) {
                return (this.enqueue = sys.eff('sys.loader.enqueue').init().unsafePerformIO)(deps, run);
            };
            this.component = function(deps, run) {
                return this.get('script.components', deps.name).set(deps.name, this.enqueue(deps, run));
            };
            return this;
        })
    ),
    (function parse(tick, collect, types, threads, sys, eff) {
        return collect(types)(function(r) {
            Array.prototype.collect = sys.root.get('async').set('collect', sys.root.get('utils.call')(collect));
            Array.prototype.tick = sys.root.get('async').set('tick', tick);
            Array.prototype.make = sys.root.get('utils.call')(r.pop()().$of());
            sys.root.events.initdata();
            eff(sys);
            return (function(tick) {
                return tick;
            });
        }, threads.runLazy(function(type) {
            type.isType = true; type.name || (type.name  = type.klass && type.klass.name);
            sys.types[type.name] = type;
            return $const(sys.make(type));
        }));
    }),
    (function() {
        return [].slice.call(arguments);
    })(
        (function make(items) {
            return function(tick) {
                items.push(tick);
                return items.apply();
            }
        }),
        (function collect($_map, $_next, $_k, $_collect, $_unit, $_const, $_tick) {
            return function collect(xs) {
                return function $_pure(k, s) {
                    return $_tick(0, xs,
                        $_map($_next(s || $_unit),
                            $_collect(s || $_unit, $_unit, 0, xs.map($_const()),
                                $_k(k))));
                }
            }
        }),
        (function $_map(get, run, next) {
            return function make(collect, set) {
                return get(collect, run(set));
            }
        })(
            (function get(collect, set) {
                return function(x, i) {
                    if (x instanceof Function && x.name == '$_pure') {
                        return x(set(i), i);
                    }else if (x instanceof Array) {
                        return x.length ? collect(x, set(i)) : set(i)(x);
                    }else {
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
        (function $_next(s) {
            return function(x, k) {
                return x.next(k, s);
            }
        }),
        (function $_k(k) {
            function $t(r) {
                return r instanceof Function ? r : $const(r);
            }
            return function(v) {
                return (function(tick) {
                    return $t(k(v))(tick);
                });
            }
        }),
        (function $_collect(f, u, c, v, k) {
            return function(r, i) {
                v[i] = f(r);
                if (++c == v.length) {
                    return k(v);
                }
                return u;
            }
        }),
        (function $_unit(t) {
            return t;
        }),
        (function $_const(a) {
            return function() {
                return a;
            }
        })
    ),
    (function types() {
        return [].slice.call(arguments);
    })(
    // === Object === //
        (function() {
            return {
                klass: function Obj(x) {
                    if (!(this instanceof Obj)) return new Obj(x);
                    this.id();
                    Object.assign(this, this.reduce(unit, x));
                },
                ext: [
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
                    (function reduce(f, v) {
                        return this.keys.call(v).reduce(function(r, k, i, o) {
                            var x = f(v[k], k, i, o);
                            r[k] = x instanceof Array ? x : (typeof x == 'object' ? new r.constructor(x) : x);
                            return r;
                        }, this);
                    }),
                    (function bind(b) {
                        return function bind(f) {
                            return b(f, this)(this);
                        }
                    })(
                        (function(f, o) {
                            return function $bind(r) {
                                return o.keys.call(r).bind(function(k, i, o) {
                                    var x = f(r[k], k, i, r);
                                    return typeof x == 'object' ? $bind(x) : x;
                                }).bind(unit);
                            }
                        })
                    ),
                    (function is(x) {
                        return x instanceof Array || typeof x != 'object' ? false : true;
                    }),
                    (function fold(f, r) {
                        return this.bind(function(v, k, i, r) {
                            var x;
                            if (parseInt(k) === i) {
                                x = v;
                            }else {
                                x = f(r, v, k, i, r);
                                r[k] = v && x && r.is(v) ? v : v;
                                return x;
                            }
                        });//.bind(unit);
                    }),
                    (function info(recur) {
                        var bind = this.bind(function(v, k, i, o) {
                            console.log(v, k, i);
                            return v;
                        });
                        return recur ? bind.bind(unit) : bind;
                    })
                ],
                attrs: [
                    function of(x) {
                        return new this(x);
                    }
                ]
            };
        }),
    // === Store === //
        (function() {
            return {
                name: 'Store',
                ctor: function ctor(opts) {
                    this.store(opts || {});
                },
                ext: [
                    (function store(opts) {
                        this._id    = this.id();
                        this._val   = [];
                        this._val._store = this;
                        this._ids   = [];
                        this._map   = {};
                        this._cid   = opts.name || opts.cid || opts.id;
                        this._cache = {};
                        if (opts.parent) {
                            this._parent = opts.parent;
                            this._level  = (this._parent._level  || (this._parent._level  = 0)) + 1;
                            this._offset = (this._parent._offset || (this._parent._offset = 0)) + (opts.offset || 0);
                        }else {
                            this._level  = 0;
                            this._offset = opts.offset || 0;
                        }
                    }),
                    (function of(opts, ctor) {
                        return ctor ? new ctor(opts) : new this.constructor(opts);
                    }),
                    (function is(value) {
                        return value && value instanceof this.__;
                    }),
                    (function uid() {
                        return this._id;
                    }),
                    (function cid() {
                        return this._cid;
                    }),
                    (function equals(value) {
                        return value && this.is(value) && this.uid() === value.uid() ? true : false;
                    }),
                    (function closest(key) {
                        var node = this;
                        while (node) {
                            if (key instanceof Function && key(node)) break;
                            else if (node.equals(key)) break;
                            else node = node.parent();
                        }
                        return node;
                    }),
                    (function find(value) {
                        return sys.get(value.ref.split('.').slice(1).join('.'));
                    }),
                    (function pertains(value) {
                        if (!value) {
                            return false;
                        }else if (this.is(value)) {
                            return this.equals(this.closest(value));
                        }else if (value) {
                            if (value.uid === this.uid()) return true;
                            else return this.pertains(this.find(value));
                        }else {
                            return false;
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
                    (function get(key) {
                        if (key && typeof key == 'string' && (this._map[key]>=0)) return this._val[this._map[key]];
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
                    (function exists(options) {
                        var opts = options ? (typeof options == 'string' ? { name: options } : options) : {},
                        id = opts.name = opts.name || opts.id || opts.cid,
                        exists = id ? this.get(id) : false;
                        if (exists && this.is(exists)) return exists;
                        return false;
                    }),
                    (function instance(opts, ctor, parent) {
                        ctor || (ctor = this.constructor);
                        var options = typeof opts == 'object' ? opts : { name: opts, parent: parent };
                        options.parent || (options.parent = this);
                        return new ctor(options);
                    }),
                    (function child(opts, ctor, parent) {
                        parent || (parent = this);
                        var exists = parent.exists(opts);
                        if (exists) return exists;
                        ctor || (ctor = this.constructor);
                        var options  = typeof opts == 'object' ? opts : { name: opts, parent: parent };
                        options.parent || (options.parent = this);
                        var instance = this.of(options, ctor);
                        return parent.set(instance._cid, instance);
                    }),
                    (function node(opts) {
                        return this.child(opts, this.__);
                    }),
                    (function keys(index) {
                        return typeof index == 'number' ? this._ids[index] : this._ids;
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
                    (function emit(/* name, key, type, value */) {
                        if (this.isEvents || (this._parent && this._parent.isEvents)) {

                        //}else if (this.disabled('events')) {

                        }else if (this.events && this.events.emit) {
                            this.events.emit(this, [].slice.call(arguments));
                        }
                    }),
                    (function level(offset) {
                        return this._level - (offset ? (offset._level || this._offset) : this._offset);
                    }),
                    (function ensure(path, ctor) {
                        var node = this, next = node, item, index = 0,
                        parts = path instanceof Array ? path.slice(0) : path.split('.');
                        while(index < parts.length && (item = parts[index++])) {
                            if (false && item == node._cid) continue;
                            else if (!(next = node.get(item)))
                            next = ((ctor && ctor === true) || (!ctor && node._children)) ? node.node(item) : node.child(item, ctor);
                            node = next;
                        }
                        return node;
                    }),
                    (function fn(key) {
                        var node;
                        if (key && key.indexOf && key.indexOf('.')>0) {
                            node = this.get(key.split('.').slice(0, -1));
                        }else {
                            node = this;
                        }
                        return node[key] && node[key] instanceof Function
                            && (node.constructor.prototype[key] instanceof Function)
                                ? node[key].bind(node) : null;
                    }),
                    (function values(recur) {
                        var node = this;
                        return node._val.reduce(function(result, value, index) {
                            result[node._ids[index]] = recur && node.is(value)
                                ? value.values(typeof recur == 'number' ? (recur - 1) : recur) : value;
                            return result;
                        }, {});
                    }),
                    (function map(f) {
                        var arr = [], store = this;
                        this._val.forEach(function(v, i) {
                            arr.push(f(v,store._ids[i],store,i));
                        });
                        return arr;
                    }),
                    (function lookup(key, orElse) {
                        return this.maybe(
                          key ? (this.get(key)||(orElse && orElse instanceof Function ? orElse(this) : orElse)) : orElse
                        );
                    }),
                    (function walk(run) {
                        return function walk(key, callback) {
                            var parts = typeof key == 'string' ? key.split('.') : key.slice(0);
                            return run(parts, callback)(this);
                        }
                    })(
                        (function walk(parts, callback) {
                            return function next(node) {
                                var key = parts.shift();
                                var val = node.get(key);
                                if (val) {
                                    if (callback(val, key, node)) {
                                        return val;
                                    }else {
                                        return val && node.is(val) && parts.length ? next(val) : null;
                                    }
                                };
                            }
                        })
                    ),
                    (function addEventListener(/* instance, name, selector, target */) {
                        // this, instance, name, selector, target
                        return this.events.addEventListener.apply(this.events, [ this ].concat([].slice.call(arguments)));
                    }),
                    (function removeEventListener(/* instance, name, selector, target */) {
                        return this.events.removeEventListener.apply(this.events, [ this ].concat([].slice.call(arguments)));
                    }),
                    (function observe(/* name, selector, handler */) {
                        return this.dispatcher.addEventListener.apply(this.dispatcher, [ this, 'store' ].concat([].slice.call(arguments)));
                    }),
                    (function bind(f) {
                        return this._val.bind(function $fn(v, i, o) {
                            var s = o._store;
                            var r = f(v, s ? s.keys(i) : v.name, i, s || o);
                            //if (s && s.is(r)) return r.bind($fn);
                            var a = s && s.is(r) ? r._val : (r instanceof Array ? r : false);
                            if (a && a.length) return a.bind($fn);
                            return r || v;
                        });
                    }),
                    (function info(recur) {
                        var count = 0, bind = this.bind(function(x, k, i, o) {
                            console.log(o && o.is ? [ o.identifier(), k, x, i, count ] : [ x, o, i, count ]);
                            count++;
                            return x;
                        });
                        return recur ? bind.bind(unit) : bind;
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
                        (function call(f) {
                            return function() {
                                return f(this);
                            }
                        }),
                        (function call1(f) {
                            return function(x) {
                                return f(this, x);
                            }
                        }),
                        (function call2(f) {
                            return function(x, y) {
                                return f(this, x, y);
                            }
                        }),
                        (function pass(f) {
                            return function() {
                                return f(this).apply(undefined, arguments);
                            }
                        }),
                        (function lift(fn, base) {
                            return (base || this).map(function(v1) {
                                return function(v2) {
                                    return fn(v1, v2);
                                }
                            });
                        }),
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
                        (function _1(f) {
                            return function(t) {
                                return f(t);
                            };
                        }),
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
                        (function bin(f) {
                            return function(x) {
                                return function(y) {
                                    return f(x, y);
                                }
                            }
                        }),
                        (function $map(stream, f) {
                            return function(continuation) {
                                return stream(function(value) {
                                    continuation(f(value));
                                });
                            };
                        }),
                        (function $filter(stream, f) {
                            return function(continuation) {
                                return stream(function(value) {
                                    if (f(value)) {
                                        continuation(value);
                                    }
                                });
                            };
                        }),
                        (function $_comprehension($_$map, $_$filter) {
                            return function comprehension(f_map, f_filter) {
                                return function(stream) {
                                    if (f_filter) {
                                        stream = $_$filter(stream, f_filter);
                                    }
                                    return $_$map(stream, f_map);
                                };
                            };
                        }),
                        (function(nativeKeys, nativeHas) {
                            return function keys(obj) {
                                if (typeof obj != 'object') return [];
                                if (obj instanceof Array) return obj.map(function(v, i) {
                                    return v && v.name ? v.name : i;
                                });
                                else if (obj.constructor == Object) return nativeKeys(obj);
                                else if (obj.keys && obj.keys instanceof Function) return obj.keys();
                                else if (nativeKeys) return nativeKeys(obj);
                                var keys = [];
                                for (var key in obj) if (nativeHas.call(obj, key)) keys.push(key);
                                if (hasEnumBug) collectNonEnumProps(obj, keys); // Ahem, IE < 9.
                                return keys;
                            };
                        })(Object.keys, Object.hasOwnProperty),
                        (function $_values($_keys) {
                            return function values(obj, fn) {
                                var kys = $_keys(obj),
                                vals = [], useget = obj.get && obj.get instanceof Function,
                                func = fn || unit, usekeys = obj instanceof Array ? false : true;
                                for (var i = 0; i < kys.length; i++) {
                                    vals.push(func(useget ? obj.get([kys[i]]) : (usekeys ? obj[kys[i]] : obj[i]), usekeys ? kys[i] : i));
                                };
                                return vals;
                            }
                        }),
                        (function $_length($_keys) {
                            return function length(item) {
                                return item.length ?
                                    (item.length instanceof Function ? item.length() : item.length)
                                        : (typeof item == 'object' ? $_keys(item) : 0);
                            }
                        }),
                        (function $_object($_length, $_keys, $_values) {
                            return function obj(map, base) {
                                return function(values) {
                                    var result = base || {}, keys;
                                    if (!values && !this.document) values = this;
                                    if (!values && map instanceof Array) {
                                        values = $_values(map); keys = $_keys(map);
                                    }else {
                                        keys = map || $_keys(values);
                                    }
                                    for (var i = 0, len = $_length(keys); i < len; i++) {
                                        if (!keys[i] && !values) continue;
                                        else if (values) result[keys[i]] = values[i];
                                        else result[keys[i][0]] = keys[i][1];
                                    }
                                    return result;
                                };
                            };
                        }),
                        (function $_parse($_keys, $_values) {
                            function run(node, data, recur, ctor) {
                                var keyss = $_keys(data), valss = $_values(data), value, key;
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
                            return function() {
                                var args = [].slice.call(arguments);
                                if (args.length < 3 && args[args.length-1] instanceof Function) {
                                    return run(this, args.shift(), false, args.pop());
                                }else {
                                    args.unshift(this);
                                    return run.apply(undefined, args);
                                }
                            };
                        }),
                        (function $_each($_keys, $_values) {
                            return function each(x, f) {
                                var isarr = x instanceof Array;
                                var keyss = isarr ? x.slice(0) : (typeof x == 'object' ? Object.keys(x) : [ x ]), i = 0;
                                while (i < keyss.length) {
                                    f(isarr ? keyss[i] : x[keyss[i]], isarr ? i : keyss[i], keyss);
                                    i++;
                                }
                            }
                        }),
                        (function objPath(name, target, value) {
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
                        (function $_assign($_objPath) {
                            return function assign(obj) {
                                obj || (obj = {});
                                return function(val, key) {
                                    if (val == '*' && key == '*') return obj;
                                    else if (key && val) $_objPath(key, obj, val);
                                    else if (val) obj = val;
                                    return obj;
                                };
                            }
                        }),
                        (function $_select($_assign, $_keys) {
                            return function select(obj) {
                                return function select() {
                                    var test  = Array.prototype.slice.call(arguments),
                                    args  = test.length == 1 && test[0] instanceof Array ? test.shift() : test,
                                    cont  = args.length && args[args.length-1] instanceof Function || args[args.length-1] === true ? args.pop() : false,
                                    keyss = args.length == 0 ? $_keys(obj) : args.slice(0),
                                    base  = args.length && typeof args[0] == 'object' && args[0].constructor == Object ? args.shift() : {},
                                    coll  = cont ? [] : $_assign(base);
                                    keyss.forEach(function(arg) {
                                        var item = arg.split(' as ');
                                        var path = item.shift();
                                        var key  = item.length ? item : path.split('.'), part;
                                        while (key.length && (part = key[key.length-1].substr(0, 1))) {
                                        if (part == '*' || part == '!') key.pop();
                                        else break;
                                        }
                                        if (key[0] == 'root' && key.shift()) path = key.slice(1).join('.');
                                        if (cont) coll.push(obj.get ? obj.get(path) : obj[path]);
                                            else coll(obj.get ? obj.get(path) : obj[path], key.join('.'));
                                    });
                                    return cont ? (cont === true ? coll : cont.apply(undefined, coll)) : coll();
                                }
                            }
                        }),
                        (function fromCallback(run, list, make, wrap, tick) {
                            return function $_fromCallback() {
                                return make(list(run, sys.get('scheduler.nextTick.enqueue')), wrap(tick));
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
                                    return arr.length ? tick : true;
                                };
                            })
                        )
                    ],
                    async: [
                        (function pure(t) {
                            return function $_pure(f) {
                                return f(t);
                            }
                        }),
                        // ===== AsyncAP ===== //
                        (function ap(f, x) {
                            return function $_pure(succ, fail) {
                                var _f;
                                var _x;
                                var count = 0;
                                function fin() {
                                    if (++count === 2)
                                        return succ(_f(_x));
                                }
                                f(function (g) {
                                    _f = g;
                                    fin();
                                }, fail);
                                return x(function $_pure(r) {
                                    _x = r;
                                    return fin();
                                }, fail);
                            };
                        }),
                        (function get(f) {
                            return function(r) {
                                return f(r && r instanceof Array && r.length == 1 ? r.shift() : r);
                            }
                        }),
                        (function wrap(f, m) {
                            return function(x, i, o) {
                                return f(o)(x, i)(m);
                            }
                        }),
                        // ===== AsyncFMAP ===== //
                        (function $_fmap($_ap, $_pure) {
                            return function fmap(xs, f) {
                                return $_ap($_pure(f), xs);
                            };
                        }),
                        (function next(x, k, s) {
                            return function(tick) {
                                return x.collect()(function(v) {
                                    return function() {
                                        return k(v)(tick);
                                    }
                                }, s);
                            }
                        }),
                        // === Monadic Bind Array == //
                        (function bind() {
                            return [].slice.call(arguments).apply();
                        })(
                            (function make($_map, $_bind, $_wrap) {
                                // return function bind(f, m) {
                                //     return $_wrap($_bind($_wrap(f), m || $_map));
                                // }
                                return function bind(f, x) {
                                    return x && x instanceof Array ? x.map($_bind($_wrap(f), $_map)(x)) : $_bind($_wrap(f), x || $_map);
                                }
                            }),
                            (function map(x, f) {
                                return x.map(f);
                            }),
                            (function bind(f, m) {
                                return function next(o) {
                                    return function bound(x, i) {
                                        return x instanceof Array ? m(x, next(x)) : f(x, i, o);
                                    };
                                };
                            }),
                            (function wrap(closed) {
                                return function wrap(f) {
                                    return function(x, i, o) {
                                        return closed(f, x, i, o);
                                    }
                                }
                            })(
                                (function closed(f, x, i, o) {
                                    return function $_pure(k) {
                                        if (x instanceof Function && x.name == '$_pure') {
                                            return x(function(r) {
                                                return closed(f, r, i, o)(k);
                                            }, i);
                                        }else if (x instanceof Array) {
                                            return x.length ? x.bind(f).next(k) : k(x);
                                        }else {
                                            return k(f(x, i, o));
                                        }
                                    }
                                })
                            )
                        ),
                        /*(function bind() {
                            return [].slice.call(arguments).apply();
                        })(
                            (function make(map, run, wrap) {
                                return function bind(f, x) {
                                    return x && x instanceof Array ? x.map(run(wrap(f), map)(x)) : run(wrap(f), x || map);
                                }
                            }),
                            (function map(x, f) {
                                return x.map(f);
                            }),
                            (function bind(f, m) {
                                return function next(o) {
                                    return function bound(x, i) {
                                        return x instanceof Array ? m(x, next(x)) : f(x, i, o);
                                    };
                                };
                            }),
                            // (function bind(f, o) {
                            //     function bound(x, i) {
                            //         return x instanceof Array ? x.map(bind(f, x)) : f(x, i, o);
                            //     };
                            //     return bound;
                            // }),
                            (function wrap(closed) {
                                return function wrap(f) {
                                    return function(x, i, o) {
                                        return closed(f, x, i, o);
                                    }
                                }
                            })(
                                (function closed(f, x, i, o) {
                                    return function $_pure(k) {
                                        if (x instanceof Function) {
                                            return x(function(r) {
                                                return k(f(r, i, o));
                                            });
                                        }else if (x instanceof Array) {
                                            return x.length ? x.bind(f).next(k) : k(x);
                                        }else {
                                            return k(f(x, i, o));
                                        }
                                    }
                                })
                            )
                        ),*/
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
                                        return k(flat(v, bind(f)));
                                    }
                                };
                            })()
                        ),
                        // ==== Scheduled Bind ===== //
                        (function scheduledBindWrap() {
                            return [].slice.call(arguments).apply();
                        })(
                            (function wrapDispatcher(wrap, make, start, done) {
                                return function bindDispatch(scheduler, timer) {
                                    var wrapped = this.set('wrapped', wrap(scheduler));
                                    return this.set('lazyK', wrapped(make(done, start, timer)));
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
                                    return function(result) {
                                        return wrapper(succ, result, schedule);
                                    }
                                }
                            }),
                            (function DoneWrap(succ, result, schedule) {
                                schedule(function() {
                                    succ(result); return true;
                                });
                            })
                        ),
                        // === Monadic Bind Async == //
                        (function monadicBindWrap() {
                            return [].slice.call(arguments).apply();
                        })(
                            (function makeBind(make, box) {
                                return function then() {
                                    return make(box, this.get('lazyK'));
                                }
                            }),
                            (function make(box, enqueue) {
                                return function bind(x, f) {
                                    return function $_pure(succ, fail) {
                                        return box(x, f, enqueue(succ), fail);
                                    }
                                };
                            }),
                            (function box(x, f, succ, fail) {
                                x(function(t) {
                                    return f(t)(succ, fail);
                                }, fail);
                            })
                        ),
                        (function combine(make) {
                            return function combine(x, f, a) {
                                return x.bind(make(function(v, t, i, j) {
                                    return f(v, t, i, j);
                                }, a));
                            }
                        })(
                            (function makeCombi(f, a) {
                                var i = -1;
                                return function(v) {
                                    var j = 0;
                                    return a.bind(function(x) {
                                        return f(v, x, !j ? ++i : i, j++);
                                    });
                                }
                            })
                        )
                    ],
                    xhr:
                        (function XHR() {

                            return [].slice.call(arguments).pure(0, true);
                        })(

                            (function XHRwrap(args) {
                                return function(sys) {
                                    return args.insert(1, sys).apply();
                                }
                            }),
                            (function XHRUtility(sys, wrap, newxhr, init, create, run, andThen) {
                                var utils = sys.get('utils');
                                var pure  = sys.get('async.pure');
                                sys.xhr = utils.set('xhr', utils.get('target')(
                                    wrap(
                                        pure, pure,
                                        init(run(create(newxhr), andThen), pure)
                                )));
                                return sys;
                            }),
                            (function wrap(pure, _pure_, request) {
                                function loadScript(url) {
                                    url = _pure_(url);
                                    return function $_pure(succ, fail) {
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
                                    return function $_pure(succ, fail) {
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
                                    return function $_pure(succ, fail) {
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
                },
                init: function(type, klass) {
                    var root   = this.sys.root = klass.of('root');
                    var sched  = root.child('scheduler');
                    sched.set('dispatcher', this.sys.dispatcher);
                    sched.set('nextTick', this.sys.nextTick);
                    var choice = root.child('choice');
                    if (type.data) {
                        if (type.data.utils) this.ext(type.data.utils, root.add('utils'));
                        if (type.data.async) this.ext(type.data.async, root.add('async'));
                        if (type.data.xhr)   type.data.xhr(sys);
                    }
                    root.__.prototype.select = root.get('utils.pass')(root.get('utils.select'));
                    root.__.prototype.parse  = root.get('utils.parse');
                    return root;
                }
            };
        }),
    // === Cell === //
        (function() {
            return {
                name: 'Cell',
                ctor: function ctor() {
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
                            this.queue.run($const(unit), function (f) {
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
                ctor: function ctor(f) {
                    this.x = this.make();
                    this.f = f || unit;
                },
                ext: [
                    (function cell() {
                        return this.x;
                    }),
                    (function apply(k) {
                        return this.x.get(this.f(k));
                    }),
                    (function pure() {
                        return this.__.pure(this);
                    }),
                    (function wrap() {
                        return this.__.wrap(function(p) {
                            return p(function(cell) {
                                return {
                                    ap: function(k) {
                                        return cell.apply(k);
                                    },
                                    set: function(v) {
                                        return cell.x.set(v);
                                    },
                                    get: function(f) {
                                        return cell.x.get(f);
                                    }
                                }
                            });
                        })(this.pure());
                    })
                ],
                attrs: [
                    (function of(x, f) {
                        return new this(x, f);
                    })
                ],
                init: function(type, klass) {
                    klass.prototype.make = sys.type('Cell').$of();
                    klass.pure = sys.get('async.pure');
                    klass.wrap = sys.get('utils._1');
                }
            };
        }),
    // === Functor === //
        (function() {
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
                        return typeof value == 'undefined' ? (this.constructor instanceof this.__ || this instanceof Functor) : (value instanceof this.__);
                    }),
                    (function map(f) {
                        return new this.constructor(this.mv.map ? this.mv.map(f) : f.call(this, this.mv));
                    }),
                    (function join() {
                        return this.mv;
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
                    }),
                    (function pure(x) {
                        return new this(x);
                    })
                ],
                init: function(type, klass) {
                    klass.prototype.fn = sys.get('async').select('pure');
                    klass.prototype.schedule = sys.get('scheduler.nextTick.enqueue');
                }
            };
        }),
    // === Compose === //
        (function() {
            return {
                name: 'Compose',
                parent: 'Functor',
                ctor: function ctor(x) {
                    if (x || typeof x != 'undefined') this.mv = x instanceof Function && x.length > 1 ? this.curry(x) : x;
                },
                ext: [
                    // COMPOSE
                    (function MakeCompose(wrap, make, just, next, prev) {
                        return make(just, next);
                    })(
                        (function wrap(compose) {
                            return function add(object) {
                                compose.call(object);
                                return object;
                            };
                        }),
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
    // === Maybe === //
        (function() {
            return {
                name: 'Maybe',
                parent: 'Functor',
                ctor: function ctor(x, a) {
                    if (x || typeof x != 'undefined')
                        this.mv = !a && x instanceof Function && x.length > 1 ? this.curry(x) : x;
                },
                ext: [
                    (function get(key) {
                        return this.map(this.property('get')(key));
                    }),
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
                        if (this.is(this.mv) && this.mv.run) {
                            return this.mv.map(sys.of).run(f);
                        }else {
                            return this.chain(f || unit);
                        }
                    }),
                    (function ap(other) {
                        return this.is(other) ? other.map(this.mv) : this.of(other).map(this.mv);
                    }),
                    (function apply(other) {
                        return other.ap(this);
                    }),
                    (function unit() {
                        return this.mv;
                    }),
                    (function join() {
                        return this.mv;
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
                        var model = this.prototype.__model__;
                        var clone = sys.inherit({ name: this.name+'123', ext: [], parent: 'Maybe' });
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
                    })
                ],
                init: function(type, klass) {
                    klass.fn = klass.fn(sys.get('utils.target'));
                    sys.of = sys.type('Store').prototype.maybe = klass.$of();
                    var property = klass.prototype.property = sys.get('utils.property');
                    klass.prototype.pget  = property('get');
                    klass.prototype.pval  = property('values');
                    klass.prototype.curry = sys.get('utils.curry');
                    return type;
                }
            };
        }),
    // === IO === //
        (function() {
            return {
                name: 'IO',
                parent: 'Compose',
                ctor: function ctor(f) {
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
                          return f(thiz.unsafePerformIO())(v);
                        });
                    }),
                    (function pipe(f) {
                        return this.fn(this.$fn(f)(this.unsafePerformIO));
                    }),
                    (function lift(f) {
                        return this.map(function(v) {
                          return f(v);
                        });
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
    // === ContM === //
        (function() {
            return {
                name: 'Cont',
                parent: 'Compose',
                ctor: function ctor(x, f) {
                    if (x) this.mv = this.$cast(x);
                    if (f) this.mf = f;
                },
                ext: [
                    (function mf(t) {
                        return function pure(f) {
                            return f(t);
                        }
                    }),
                    (function $cast(v, p) {
                        if (v && v.isFunctor && v.cont) {
                            return v.cont();
                        }else {
                            return v && v instanceof Function
                                && (p || v.name.substr(-4) == 'cont'
                                      || v.name.substr(-4) == 'pure'
                                      || v.name == 'mf') ? v : this.fn.pure(v);
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
                            return other.ap(other.is(result) ? result : other.of(result));
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
                    (function unwind(k, s) {
                        var t = this.chain(k);
                        if (t && s) {
                            while (t) {
                              if (t instanceof Function) t = t();
                              else break;
                            }
                        }else if (t) {
                            this.enqueue(t);
                        }
                        return t;
                    }),
                    (function enqueue(k) {
                        return this.schedule(this.run(k));
                    })
                ],
                attrs: (function(cont, val, of, $of) {
                    return [
                        of,
                        $of,
                        cont,
                        (function fromCallback(cb, mf) {
                            return this.of(mf ? cont(cb, mf) : val(cb));
                        })
                    ];
                })(
                    (function cont(mv, mf) {
                        return function $_pure(continuation) {
                            return mv(function(value) {
                                return mf(value)(continuation);
                            })
                        }
                    }),
                    (function val(value) {
                        return function $cont(continuation) {
                            return continuation(value);
                        }
                    }),
                    (function of(x, f) {
                        return x instanceof this ? x : new this(x, f);
                    }),
                    (function $of() {
                        var ctor = this;
                        return function() {
                            return ctor.of.apply(ctor, arguments);
                        }
                    })
                ),
                init: function(type, klass) {
                    klass.prototype.$cast = klass.prototype.$cast.bind(klass.prototype);
                    klass.prototype.cont  = function() {
                        return klass.cont(this.mv, this.mf.bind(this));
                    }
                    klass.prototype.is = klass.is = function(value) {
                        return value && value instanceof klass ? true : false;
                    }
                }
            };
        }),
    // === Signal === //
        (function() {
            return {
                name: 'Signal',
                ctor: function ctor(ref) {
                    this._listener = ref;
                    this._values   = [];
                    this._handlers = this.bind(this._values);
                },
                ext: [
                    (function bind(values) {
                        return [].make().bind(function(hndl, idx, all) {
                            hndl.run(++idx == all.length ? values.shift() : values[0]);
                        });
                    }),
                    (function make(info, handler) {
                        return {
                            sid: this.id(), run: handler, info: info
                        }
                    }),
                    (function get(key) {
                        return this._listener.parent(key);
                    }),
                    (function add(info, handler) {
                        return this._handlers[this._handlers.push(this.make(info, handler))-1];
                    }),
                    (function fold(f) {
                        return this._handlers.fold(f);
                    }),
                    (function run(value) {
                        this._values.push(value);
                        return this._handlers.run(false);
                    })
                ],
                attrs: [
                    (function of(identifier) {
                        return new this(identifier);
                    })
                ]
            };
        }),
    // === Queue === //
        (function() {
            return {
                name: 'Queue',
                parent: 'Store',
                ctor: function ctor(opts) {
                    this.__super__.call(this, opts || {});
                    this.next = this.next.bind(this);
                },
                ext: [
                    (function schedule() {
                        return (this.schedule = sys.get('scheduler.nextTick.enqueue'))(this.next);
                    }),
                    (function enqueue(item) {
                        if (!(this._queue.length * this._queue.push(item))) {
                            this.schedule(this.next);
                        }
                        return this;
                    }),
                    (function next() {
                        if (this._queue.length) {
                            this.get(this._queue[0].type).run(this._queue.shift());
                        }
                        return this._queue.length ? this.next : true;
                    }),
                    (function wrap() {
                        this._queue = this.set('queue', []);
                        return this.enqueue.bind(this);
                    }),
                    (function create(listener) {
                        return (this._signal || (this.constructor.prototype._signal = sys.type('Signal'))).of(listener);
                    }),
                    (function add(stream) {
                        this.handlers.push(stream);
                        return this;
                    }),
                    (function make(/* type, name, id, item */) {
                        var args = [].slice.call(arguments);
                        var listener = args.pop(); listener.reference = args.join('.');
                        return this.set(listener.name, this.create(listener));
                    })
                ]
            };
        }),
    // === Event === //
        (function() {
            return {
                name: 'Events',
                parent: 'Store',
                ctor: function ctor(opts) {
                    this.__super__.call(this, opts || (opts = {}));

                    if (this.events) this.initdata();

                    this._values  = [];
                    this._handler = [];
                },
                ext: [
                    (function initdata() {
                        this._lstnrs = this._lstnrs || (this._lstnrs = this.events.node('listeners'));
                        this._change = this._change || (this._change = this._lstnrs.node('change'));
                        this._active = this._active || (this._active = this._lstnrs.set('active', []));
                        this._queue  = this._queue  || (this._queue  = this.set('queue', this.initQueue([])));
                    }),
                    (function initQueue(queue) {
                        return queue.make().bind(function(value) {
                            return {
                                src:    'data',
                                uid:     value.source.uid(),
                                ref:     value.source.identifier(),
                                type:    value.args.shift(),
                                target:  value.args.shift(), 
                                action:  value.args.shift(),
                                value:   value.args.pop()
                            };
                        }).bind(this.initHandler(this._active));
                    }),
                    (function addEventListener(/* instance, name, selector, target */) {
                        var args = [].slice.call(arguments), instance = args.shift();
                        var name = args.shift(), target = args.pop(), selector = args.length ? args.shift() : '*';

                        var events = this._lstnrs.ensure(name, this.__);
                        var matchs = new RegExp('/(.*?)/');
                        var active = this._lstnrs.get('active') || this._lstnrs.set('active', []);
                        return active[active.push({
                            uid: instance.uid(), ref: instance.identifier(),
                            selectstr: selector, level: instance.level(),
                            name: name, selector: matchs, target: target,
                            run: target.run || target
                        })-1];
                    }),
                    (function removeEventListener() {
                        var active = target[target.push({
                            uid: instance.uid(), ref: instance.identifier(),
                            name: name, selector: selector, target: target })-1];
                        return active;
                    }),
                    (function initHandler(lstnrs) {
                        return function(value) {
                            return lstnrs.bind(function(handler) {
                                return handler.run(value);
                            }).run();
                        };
                    }),
                    (function emit(source, args) {//* source, name, target, info */) {
                        if (args !== 'queue' && source && source.uid && this._active) {
                            if (this._queue.push({ source: source, args: args })) {
                                this.runQueue();
                            }
                        }
                    }),
                    (function runQueue() {
                        return this._queue.run();
                    })
                ],
                attrs: [
                    (function of(opts) {
                        return new this(opts);
                    })
                ],
                init: function(type, klass) {
                    var Store  = sys.type('Store'), Root = sys.get(); klass.prototype.isEvents = true;
                    var Events = Store.prototype.events  = klass.prototype.events = Root.child('events', klass);//klass.of(type, klass));
                    return Events;
                }
            };
        }),
    // === Listener === //
        (function() {
            return {
                name: 'Listener',
                parent: 'IO',
                ctor: function ctor(x) {
                    this.__super__.call(this, x);
                },
                ext: (function() {
                    var args = [].slice.call(arguments);
                    return function() {
                        return args[0].apply(this, args.slice(1));
                    }
                })(

                    (function(mbAddEL1, mbAddEL2, mbELEMListener, addELEMENTListener,
                        mbEVTbind1, wrapDISPATCHER, mbEVTcntrTUP, eON, eOFF,
                            evtONOFF, throttle, mbEvtADD) {
                        
                        var maybe  = this.root.get('utils.maybe');
                        var tuple  = this.root.get('utils.tuple');
                        var bin    = this.root.get('utils.bin');
                        var fromCB = this.root.get('utils.fromCallback');

                        var maybeAddEventListener = maybe(mbAddEL1)(mbAddEL2);

                        var maybeListener = maybe(mbELEMListener);

                        var maybeEventBinder = maybe(mbEVTbind1);

                        var maybeEventControl = maybe(mbEVTcntrTUP)(tuple(eON)(eOFF));

                        return [
                            { name: 'mainQueue', fn: this.root.child('queue', this.make(this.types['Queue'])) },
                            { name: 'addElementListener', fn: addELEMENTListener },
                            { name: 'wrapDispatcher', fn: wrapDISPATCHER },
                            { name: 'maybeListener', fn: maybeListener },
                            { name: 'maybeAddEventListener', fn: maybeAddEventListener },
                            { name: 'maybeEventControl', fn: maybeEventControl },
                            { name: 'addEventListener', fn: mbEvtADD },
                            { name: 'throttle', fn: throttle },
                            { name: 'maybeEventBinder', fn: maybeEventBinder },
                            { name: 'eventOnOffControl', fn: evtONOFF },
                            { name: 'fromCallback', fn: fromCB }
                        ];

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
                            run: handler,
                            state: 'on'
                        };
                    }),

                    (function off(elem, state, handler) {
                        elem.removeEventListener(state.name, handler);
                        return {
                            name: name,
                            run: handler,
                            state: 'off'
                        };
                    }),

                    (function eventOnOffControl(on, off) {
                        return function(elem, name, handler) {
                            var base = { name: name, throttle: 0, on: on, off: off };
                            function $on() {
                                var state = on(elem, name, handler);
                                state.throttle = base.throttle;
                                state.off = $off;
                                return state;
                            };
                            function $off() {
                                var state = on(elem, name, handler);
                                state.throttle = base.throttle;
                                state.on = $on;
                                return state;
                            };
                            return $on();
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
                        var args = [].slice.call(arguments), element = args.shift();
                        var type = args.shift(), name = args.shift(), node = this.run(name), run = args.pop();
                        var selector = args.length && typeof args[0] == 'string' ? args.shift() : null;
                        var throttle = args.length && typeof args[0] == 'number' ? args.shift() : 0;
                        var handler  = { type: type, name: name, selector: selector, throttle: throttle, run: run };
                        var store    = this.mainQueue.get(type);
                        return node.add(handler,
                            sys.get('utils.comprehension')(
                                store.get('createEvent'),
                                store.get('makeSelectorFunc')(store.get('createSelector')(element))(selector)
                            )(this.fromCallback)(throttle ? this.throttle(handler, throttle) : handler.run)
                        );
                    })
                ),
                attrs: [
                    (function init(type) {
                        var ctor = this;
                        var func = this.prototype;
                        var base = func.mainQueue.get(type) || func.mainQueue.child(type);
                        return function(elem) {
                            var node, disp, name = elem._cid;
                            if (!name || !(node = base.get(name))) {
                                node = base.child(name);
                                if (!name) name = node.nid();
                                if (!elem.id) elem.id = name;
                            }
                            var list = node.get('listener') || node.set('listener', base.get('maybeEventElem')(elem));
                            var disp = node.get('dispatcher')
                                || node.set('dispatcher', func.wrapDispatcher(node.wrap()));

                            return sys.get('utils.lift')(function(node, name) {
                                return node.get(name)
                                    || node.make(node.identifier(), name, node.get('dispatcher')(node.get('listener'))(name));
                            }, ctor.pure(node));
                        }
                    })
                ],
                data: {
                    dom: [
                        (function matches(element, selector) {
                            return function(evt) {
                                if (evt && evt.target && (!selector || evt.target.matches(selector))) {
                                    if (!element) return true;
                                    var elem = evt.target;
                                    while (elem) {
                                        if (elem == element) break;
                                        else elem = elem.parentElement;
                                    }
                                    return !!elem;
                                }
                                return false;
                            } // DOMeventHandler creates the DOM event specific *handler* proxy
                        }),   // so the main handler(s) to which the listeners will be attached
                        (function createEvent(evt) {
                            return {
                                src: 'dom',
                                type: evt.type,
                                target: evt.target,
                                x: evt.clientX || evt.x,
                                y: evt.clientY || evt.y
                            };
                        }),
                        (function createSelector(element) {
                            return typeof element == 'string'
                            ? document.getElementById(element) : element;
                        })
                    ],
                    store: [
                        (function matches(element, selector) {
                            return function(evt) {
                                if (evt && evt.target && (!selector || evt.target.matches(selector))) {
                                    if (!element) return true;
                                    return element.pertains(evt);
                                }
                                return false;
                            } // DOMeventHandler creates the DOM event specific *handler* proxy
                        }),   // so the main handler(s) to which the listeners will be attached
                        (function createEvent(evt) {
                            return {
                                src: 'data',
                                uid: evt.uid,
                                ref: evt.ref,
                                type: evt.type,
                                target: evt.target,
                                action: evt.action,
                                value: evt.value
                            };
                        }),
                        (function createSelector(element) {
                            return typeof element == 'string'
                            ? sys.get(element) : element;
                        })
                    ]
                },
                init: function(type, klass) {

                    var main  = sys.get('queue');
                    var func  = klass.prototype;
                    var maybe = sys.get('utils.maybe');
                    var bin   = sys.get('utils.bin');

                    var maybeEventElem = func.maybeListener(
                        maybe(func.addElementListener)(func.maybeEventControl(bin(func.eventOnOffControl))));

                    function makeEventContainerElement(element) {
                        return func.maybeAddEventListener(maybeEventElem(element || document.body));
                    };

                    var dom   = func.mainQueue.child('dom').parse(type.data.dom);
                    var store = func.mainQueue.child('store').parse(type.data.store);

                    dom.set('maybeEventElem', makeEventContainerElement);
                    store.set('maybeEventElem', makeEventContainerElement);

                    dom.set('makeSelectorFunc', maybe(func.maybeEventBinder)(dom.get('matches')));
                    store.set('makeSelectorFunc', maybe(func.maybeEventBinder)(store.get('matches')));

                    sys.type('Store').prototype.dispatcher = klass.init('store')(sys.get());

                    return main;
                }
            };
        }),
    // === Component === //
        (function() {
            return {
                name: 'Component',
                parent: 'Store',
                ctor: function(opts) {
                    if (!opts.parent) opts.parent = this._node;
                    this.__super__.call(this, opts);
                    this.parse(opts);
                    this.parent().set(this.cid(), this);
                },
                ext: [
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
                    (function parse(conf) {
                        var opts   = this._opts ? this._opts.values(true) : null;
                        this._opts = this._opts ? this._opts.clear() : this.node('opts');

                        var data   = this._data ? this._data.values(true) : null;
                        this._data = this._data ? this._data.clear() : this.node('data').parse({ id: this._uid });

                        if (opts) this._opts.parse(opts);
                        if (this.conf.opts) this._opts.parse(this.conf.opts);
                        if (conf.opts) this._opts.parse(conf.opts);

                        if (this.conf.data) this._data.parse(this.conf.data, true);
                        if (conf.data) this._data.parse(conf.data, true);
                        if (data) this._data.parse(data, true);

                        return this;
                    }),
                    (function route(ext) {
                        return 'components/'+this._cid+'/'+this._cid+(ext ? ('.'+ext) : '');
                    }),
                    (function data(v1, v2) {
                        return v1 ? (typeof v1 == 'object' ? this._data.parse(v1) : this._data.acc(v1, v2)) : this._data.values(true);
                    }),
                    (function opts(v1, v2) {
                        return v1 ? (typeof v1 == 'object' ? this._opts.parse(v1) : this._opts.acc(v1, v2)) : this._opts.values(true);
                    })
                ],
                attrs: [
                    (function of(opts) {
                        var args  = [].slice.apply(arguments);
                        var conf  = typeof args[0] == 'object' ? args.shift() : {};
                        var node  = this.prototype.node;
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
                        return node.child(conf, this);
                    })
                ],
                init: function(type, klass) {
                    klass.prototype.conf = { opts: { js: true, css: false, tmpl: true } };
                    klass.prototype.node = sys.get().child('components');
                }
            };
        }),
    // === Coyoneda === //
        (function() {
            return {
                name: 'Coyoneda',
                parent: 'Compose',
                klass: function Coyoneda(f, x) {
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
                    (function of(x, f) {
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
    // === List === //
        (function() {
            return {
                name: 'List',
                parent: 'Coyoneda',
                klass: function List(f, x) {
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
                ],
                init: function(type, klass) {
                    klass.prototype.type = sys.type;
                }
            };
        }),
    // === Collect === //
        (function() {
            return {
                name: 'Collect',
                klass: function Collect(x, f) {
                    this.id();
                    this.i = 0;
                    this.x = x;
                    this.f = f;
                    this.next = this.next.bind(this);
                },
                ext: [
                    // ===== OF ==== //
                    (function of(x, f) {
                        return new this.constructor(x, f);
                    }),
                    (function next() {
                        if (!this.x[this.i] || (this.x[this.i] = this.x[this.i](function(f) {
                            return f(unit);
                        })) === true) {
                            this.x.splice(this.i, 1);
                        }else {
                            this.i = ++this.i < this.x.length ? this.i : 0;
                        }
                        return this.x.length ? this.next : true;
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
                init: (function(base, arr, ext) {
                    return function(type, klass) {
                        return ext.call(base.call(arr({
                            scheduler: sys.get('scheduler'),
                            enqueue: sys.get('scheduler.nextTick.enqueue'),
                            utils: sys.get('utils').select('call', 'call2'),
                            async: sys.get('async').select('next', 'combine', 'flatmap', 'bind', 'fmap', 'wrap')
                        }), klass));
                    }
                })(
                    (function(klass) {
                        klass.prototype.scheduler = this.scheduler;
                        klass.prototype.enqueue = this.enqueue;
                        klass.prototype.async = this.async;
                        klass.prototype.base = klass.of([]);
                        return klass;
                    }),
                    (function(ext) {
                        Array.prototype.wrap = function(k, f) {
                            return this.collect()(k, f);
                        };
                        Array.prototype.run = function(k, f) {
                            return ext.enqueue(this.wrap(k || $const(unit), f));
                        };
                        Array.prototype.enqueue = function(k) {
                            return ext.enqueue(this.tick(0, this, function(k) {
                                return $const(k(unit));
                            }));
                        };
                        Array.prototype.fmap = function(f) {
                            return ext.async.fmap(this.collect(), f);
                        };
                        Array.prototype.bind = function(f) {
                            return ext.async.bind(f, this)
                        };
                        Array.prototype.next = ext.utils.call2(ext.async.next);
                        Array.prototype.combine = ext.utils.call2(ext.async.combine);
                        Array.prototype.flatmap = function(f) {
                            return this.bind(f).chain(ext.async.flatmap(unit));
                        };
                        Array.prototype.flatten = function() {
                            return this.flatmap(unit);
                        };
                        Array.prototype.chain = function(f) {
                            return [ this.fmap(function(r) {
                                return f(r && r.length == 1 ? r.shift() : r);
                            }) ];
                        };
                        Array.prototype.lift = function(f) {
                            return this.chain(function(xs) {
                                return f.apply(undefined, xs);
                            });
                        };
                        Array.prototype.fold = function(f, r) {
                            return this.chain(function(xs) {
                                return f.apply(undefined, xs);
                            });
                        };
                        Array.prototype.cont = function() {
                            return sys.type('Cont').of(this, function(a) {
                                return function $_pure(k) {
                                    return a.wrap(k);
                                }
                            });
                        };
                        return ext;
                    }),
                    (function() {
                        this.prototype.push = function() {
                            return this.x.push.apply(this.x, [].slice.call(arguments));
                        };
                        this.prototype.bind = function(f, m) {
                            //return this.of(this.x, this.get('bind')(this.f ? this.get('wrap')(this.f, f) : f, m));
                            return this.of(this.x, this.get('bind')(this.f ? this.get('wrap')(this.f, f) : f));
                        };
                        this.prototype.flatmap = function(f) {
                            return this.of(this.x.flatmap(f));
                        };
                        this.prototype.flatten = function() {
                            return this.of(this.x.flatten());
                        };
                        this.prototype.chain = function(f) {
                            return this.of(this.x.chain(f));
                        };
                        this.prototype.get = function(key) {
                            return this.async[key];
                        };
                        this.prototype.make = function(x) {
                            return x.tick(0, x, this.f ? this.f(x) : sys.get('utils.property')('cont')());
                        };
                        this.prototype.run = function() {
                            var args = [].slice.call(arguments),
                                c = args.shift(),
                                k = c || $const(unit), f = args.length && args[args.length-1] === true ? args.pop() : null,
                                s = args.length ? args.shift() : null;
                            if (!(this.base.x.length * this.base.push(this.make(c === false ? this.x.slice(0) : this.x.splice(0))))) {
                                //.wrap(f ? this.get('flatmap')(k) : k, s)
                                this.enqueue(this.base.next);
                            }
                        };
                    })
                )
            };
        })
    ),
    (function pure(unit, $const, extract, pure) {
        self.unit    = unit;
        self.$const  = $const;
        self.extract = extract;
        return pure;
    })(
        (function unit(t) {
            return t;
        }),
        (function $const(a) {
            return function() {
                return a;
            }
        }),
        (function extract(fn) {
            return fn(unit);
        }),
        (function(pure) {
            this.prototype.insert = function(position) {
                this.push.apply(this, this.splice(0, position).concat([].slice.call(arguments, 1)).concat(this.splice(0)));
                return this;
            };
            this.prototype.of = function() {
                return this[0](this.slice(1));
            };
            this.prototype.at = function(index) {
                return this.length && index < this.length ? this[index] : [];
            };
            this.pure = function() {
                return pure(Array.apply(arguments));
            };
            this.of = function() {
                return [].slice.call(arguments);
            };
            return pure;
        }).call(Array,
            (function MakeApply($pure) {
                this.prototype.pure = function(idx, slice) {
                    return typeof idx != 'undefined' &&
                        idx < this.length && this[idx] instanceof Function
                            ? this[idx](slice ? this.slice(idx+1) : this) : $pure(this);
                };
                return $pure;
            }).call(Array,
                (function $_pure(t) {
                    return function(f) {
                        return f(t);
                    }
                })
            ),
            (function MakeArray($apply) {
                this.prototype.apply = function(idx, recur) {
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
    ),
    (function sys() {
        return [].slice.call(arguments).apply();
    })(
        (function(sys, make, dispatcher) {
            sys.make       = make(sys);
            sys.dispatcher = dispatcher;
            sys.nextTick   = dispatcher(unit)();
            sys.enqueue    = sys.nextTick.enqueue;

            require.config({
                paths: {
                    pure: 'pure.js'
                }
            });
            return sys;
        }),
        (function(now, threads) {
            return { now: (self.now = now), threads: threads, types: {}, queue: [] };
        })(
            (function now(run) {
                return run();
            })(
                (function() {
                var perf = self.performance;
                if (perf && (perf.now || perf.webkitNow)) {
                    var perfNow = perf.now ? 'now' : 'webkitNow';
                    return perf[perfNow].bind(perf);
                }else { return Date.now; }
            })),
            (function threads() {
                return [].slice.call(arguments).apply();
            })(
                (function(lazy, lazyF, atom, call, bindLazy, $_mapLazy) {
                    return { lazy: lazy, lazyF: lazyF, atom: atom, call: call, bindLazy: bindLazy, mapLazy: $_mapLazy(atom), runLazy: $_mapLazy(call) };
                }),
                (function lazy(v) { return (function() { return v; }); }),
                (function lazyF(f) { return (function() { return f(); }); }),
                (function atom(f, t) {
                    return function() {
                        return f(t);
                    };
                }),
                (function call(f, t) {
                    return f(t());
                }),
                (function bindLazy(v, f) {
                    return function() {
                        return f(v())();
                    };
                }),
                (function $_mapLazy(make, map) {
                    return function(atom) {
                        return make(map, atom);
                    }
                })(
                    (function make(map, atom) {
                        return function mapLazy(f, a) {
                            return map(f, a || atom)
                        };
                    }),
                    (function map(f, a) {
                        return function(v) {
                            return a(f, v);
                        }
                    })
                )
            ),
            (function str() {
                String.prototype.$_like = new RegExp("([\\.\\\\\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:\\-])", "g");
                String.prototype.matches = String.prototype.like = function(search) {
                    if (typeof search !== 'string' || this === null) { return false; }
                    search = search.replace(this.$_like, "\\$1");
                    search = search.replace(/%/g, '.*').replace(/_/g, '.');
                    return RegExp('^' + search + '$', 'gi').test(this);
                };
                String.prototype.toDash = function() {
                    return this.length < 2 ? this.toLowerCase() : this.replace(/([A-Z])/g, function($1, p1, pos){return (pos > 0 ? "-" : "") + $1.toLowerCase();});
                };
                String.prototype.toCamel = function(){
                    return this.length < 2 ? this.toLowerCase() : this.replace(/(^[a-z]{1}|\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
                };
                String.prototype.toTypeName = function() {
                    return this.replace('$', '').toDash();
                };
            })()
        ),
        (function(wrap, $of, inherit, ext, makeID, $super, walk, extender, make, parse, named) {
            return wrap({ $of: $of, inherit: inherit, ext: ext, makeID: makeID, $super: $super, walk: walk, extender: extender, make: make, parse: parse, named: named });
        })(
            (function wrap(x) {
                return function(sys) {
                    x.sys = sys;
                    return function(type) {
                        return x.make(type);
                    };
                };
            }),
            (function $of() {
                var ctor = this;
                return function() {
                    return ctor.of.apply(ctor, arguments);
                }
            }),
            (function inherit(klass, parent) {
                if (parent) {
                    var F = function() {};
                    F.prototype = parent.prototype;
                    var proto = new F();
                    proto.constructor = klass
                    proto.__parent__  = proto.__parent__.slice(0);
                    proto.__level__   = proto.__parent__.push(F.prototype);
                    proto.__super__   = this.$super;
                }else {
                    var proto = {
                        __parent__: [], __level__: 0, constructor: klass
                    }
                }
                return proto;
            }),
            (function ext(items, target) {
                var isStore   = target.constructor.name === 'Store' && target.set && target.get;
                var parseArgs = this.parse;
                return items.reduce(function(r, v) {
                    var func = v.fn ? v.fn : v;
                    var val  = v.name.substr(0, 2) == '$_' ? parseArgs(func, r) : func;
                    var name = v.name.replace('$_', '');
                    if (isStore) {
                        r.set(name, val);
                    }else {
                        r[name] = val;
                    }
                    return r;
                }, target);
            }),
            (function makeID() {
                var counter = { cid: 100000 };
                return function id() {
                    return (this._id = counter.cid++);
                }
            }),
            (function $super() {
                if (this.__level__) this.__parent__[--this.__level__].ctor.apply(this, [].slice.call(arguments));
                if (!this.__level__) this.__super__ = function(fn) { return this.__parent__[this.__parent__.length-1][fn].apply(this, [].slice.call(arguments, 1)); };
            }),
            (function walk(klass) {
                return function(fn) {
                    var test   = klass.prototype,
                        parent = klass.prototype.__parent__,
                        level  = klass.prototype.__level__;
                    while (test && level--) {
                        if (test.constructor[fn]) break;
                        else test = parent[level];
                    }
                    return test ? test.constructor[fn] : null;
                }
            }),
            (function extender(model, parent) {
                return function() {
                    var args = [].slice.call(arguments);
                    if (args[0] instanceof Function) {
                        var type = {
                            name: args[0].name, ctor: args.shift(),
                            ext: typeof args[0] == 'object' ? args.shift() : [],
                        };
                    }else {
                        var type = {
                            name: args.shift(), ext: []
                        };
                    }
                    type.super = parent ? parent.name : 'Inst';
                    if (parent.klass) type.parent = parent.klass;
                    else if (parent instanceof Function) type.parent = parent;
                    else type.parent = parent.name || parent;

                    return model.sys.make(type);
                }
            }),
            (function makeKlass(/* args: name, ext, defs */) {
                var args   = [].slice.call(arguments);
                var type   = typeof args[0] == 'object' ? (args[0].ext ? args.shift() : { ext: args.shift() }) : {};
                if (type.klass && type.done) return type.klass;

                if (!type.super) {
                    if ((type.super = type.parent)) {
                        type.parent = this.make(this.sys.types[type.super]);
                    }
                }
                var ext = type.ext instanceof Function ? type.ext.call(this.sys) : type.ext;
                if (!(ext instanceof Array)) ext = sys.get('utils.values')(ext);
                if (type.ctor) ext.push(type.ctor);

                var name   = typeof args[0] == 'string' ? args.shift() : type.name;
                var attrs  = args.length && typeof args[0] == 'object' ? args.shift() : {};
                var parent = type.parent;
                var klass  = type.klass || this.named(name, true, type.ctor, !type.ctor && parent, !type.ctor && parent);
                klass.prototype = this.ext(ext || [], this.inherit(klass, parent));
                if (type.attrs) this.ext(type.attrs, klass);
                if (!klass.prototype.id) klass.prototype.id = this.makeID();
                if (!klass.$of) klass.$of = this.$of;
                if (!klass.of && parent) klass.of = this.walk(klass)('of');
                if (!klass.pure && parent) klass.pure = this.walk(klass)('pure');
                if (!klass.inherit) klass.inherit = this.inherit;
                if (!klass.extend) klass.extend = this.extender(this, type);
                if (!klass.prototype.isBase && !klass.prototype.__) klass.prototype.__ = klass;
                if (type.init) type.init.call(this, type, klass);
                type.done = true;
                return (type.klass = klass);
            }),
            (function parseArgs() {
                return [].slice.call(arguments).apply();
            })(
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
                (function makeArgs(func, args, source) {
                    return func.apply(undefined, args.map(function(a, i, r) {
                        if (source.get && source.set) {
                            return source.get(a.replace('$_', ''));
                        }else {
                            return source[a.replace('$_', '')];
                        }
                    }));
                })
            ),
            (function() {
                return [].slice.call(arguments).apply();
            })(
                (function(build, make, capture, result, wrap) {
                    return wrap(build(make), capture, result);
                }),
                (function(pure) {
                    var args = [];
                    var next = (function(f) { return f(args.shift()); });

                    var tmpl = [ 
                        pure('$$__purejs.push($const((function Make'), next, pure('() {'),
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
                })(function(t) { return function(f) { return f(t); }}),
                (function(args, next, tmpl) {
                    return function named(name, id, ctor, level, superr) {
                        args.push(name, name);
                        return tmpl.filter(function(v, i) {
                            return i < 6 || (i == 6 && id) || (i == 7 && ctor) || (i == 8 && level) || (i == 9 && superr) || i > 9;
                        }).map(extract).join('');
                    }
                }),
                (function() {
                    var val = self.$$__purejs = [];
                    return function tmp(fn) {
                        return fn();
                    }
                })(),
                (function(text) {
                    try {
                        eval(text);
                    }catch(e) {

                    }
                    return $$__purejs.pop();
                }),
                (function(make, capture, result) {
                    return function named() {
                        return capture(result(make.apply(undefined, [].slice.call(arguments))));
                    }
                })
            )
        ),
        (function SetupDispatcher() {
            return [].slice.call(arguments).apply();       
        })(

            (function MakeDispatcher(create_dispatcher, wrapped_dispatcher, process_messages, create_enqueue_platform, close_over) {
                return (function dispatcher(cb, timer) { return cb(create_dispatcher(wrapped_dispatcher, process_messages, close_over, create_enqueue_platform, timer)); });
            }),
            (function create_dispatcher(wrapped_dispatcher, process_messages, close_over, create_enqueue_platform, timer) {
                var tasks = [], status = [ 0, 0, 50, false, false, { frameid: 0, count: 0, ts: 0, limit: 0, rs: 0, handle: 0, suspend: false, length: 0, maxlen: 0 } ];
                return close_over(
                    (function() { return tasks; }),
                        (function() { return status; }),
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
                        info.length = tasks.length, info.fs = info.ts - info.ps, 
                        info.maxlen = info.length > info.maxlen ? info.length : info.maxlen,
                        info.size   = info.length, info.frameid++;

                    while (tasks.length && ++info.count) {
                        task = tasks[(TASK_INDEX < tasks.length ? TASK_INDEX : (TASK_INDEX = 0))];
                        if (!task || !task.next || task.next === true || !(task.next instanceof Function)) {
                            tasks.splice(TASK_INDEX, 1);
                        }else if ((task.next = task.next(status[TASK_INFO])) === true) {
                            tasks.splice(TASK_INDEX, 1);
                        }
                        if (info.suspend || (info.limit < (info.rs = self.now()))) break;
                    }
                    status[TASK_RUNNING] = false; info.suspend = false;
                    ++TASK_INDEX < tasks.length || (TASK_INDEX = 0);
                    return !tasks.length;
                }
            }),
            (function create_enqueue_platform(tasks, status, run) {
                return function enqueue(item) {
                    if (item && (status[0] = tasks.push(item.next ? item : { next: item })) == 1) run();
                };
            }),
            (function close_over(tasks, status, run, create_enqueuer) {
                return (function() {
                    return { tasks: tasks, status: status, run: run, enqueue: create_enqueuer(tasks(), status(), run) };
                });
            })
        )
    ),
    (function Effects() {
 
        return [].slice.call(arguments).pure(0, true);
    })(
 
        (function WrapSetup(items) {
            return function effects(sys) {
                items.push(sys);
                return items.apply(true);
            };
        }),
 
        (function Setup(env, defs, sys) {
            var eff  = env(sys.root, sys);
            var test = eff.runDefs(eff, defs(unit)).chain(function(result) {
                sys.eff = eff.getOperation('js.nodes.fn').chain(function(op) {
                    return op.run(eff)('runOperation');
                });
            }).run();
            return sys;
        }),
 
        [ (function CreateSetup(createInstruction, createHandler, createFn, createEnv, createEffects) {
            return function(root, sys) {
                return root.child('effects', createEnv.call(
                    createInstruction.call(
                        createFn(sys.types).call(createHandler.call(root))
                    )
                ));
            }
        }),

        (function CreateInstruction() {

            function Instruction(handler, instruction) {
                this._handler     = handler;
                this._instruction = instruction;
                this._cache       = {};
            };
            Instruction.prototype.constructor = Instruction;
            Instruction.prototype.init = function(method, result, type) {
                var i = this._instruction;
                var t = type || i.type || result || i.node.parent('type');
                var a = [ method || i.method, t, i.action, result || i.result || t ];
                var p = a.join('.');
                return this._cache[p] || !a.unshift(i.node) || (this._cache[p] = this._handler.init.apply(this._handler, a));
            };
            Instruction.prototype.show = function() {
                return this._instruction;
            };
            Instruction.prototype.map = function() {
                var args = Array.prototype.slice.call(arguments);
                var func = args.shift();
                var inst = this.init.apply(this, args);
                return inst.map ? inst.map(func) : func(inst);          
            };
            Instruction.prototype.ap = function() {
                var args  = Array.prototype.slice.call(arguments);
                var monad = args.shift();
                var inst  = this.init.apply(this, args);
                return inst.ap ? inst.ap(monad) : monad.lift(inst);   
            };
            Instruction.prototype.lift = function() {
                var args = Array.prototype.slice.call(arguments);
                args.unshift('lift');
                return this.init.apply(this, args);
            };
            Instruction.prototype.run = function() {
                var args = Array.prototype.slice.call(arguments);
                var inst = this.init();
                if (inst && inst.run) {
                    return args.length > 1 ? inst.run.apply(inst, args) : (args.length ? inst.run(args.shift()) : inst.run());
                }else if (inst && inst instanceof Function) {
                    return args.length > 1 ? inst.apply(undefined, args) : (args.length ? inst(args.shift()) : inst());
                }
                return inst;
            };
            this.prototype.isInstruction = function(value) {
                return value && value instanceof Instruction ? true : false;
            };
            this.prototype.create = function(instruction) {
                return new Instruction(this, instruction);
            };
            return this;
        }),

        (function CreateHandler() {
            function Handler(env) {
                if (env) this.env = env;
            };
            Handler.prototype.constructor = Handler;
            Handler.prototype.env = Handler.env = this;
            Handler.prototype.just = Handler.just = sys.type('Maybe').$of();
            Handler.prototype.init = function(node, method, type, action, result) {
                return this.just(this.fn[method]).map(function(runInit) {
                    return runInit(type, node.get(action), result);
                }).unit();
            };
            Handler.prototype.fn = 
            Handler.of = function(env) {
                return new Handler(env);
            };
            return Handler;
        }),

        [ (function CreateFn(wrap, create, fn) {
            return function(types) {
                return wrap(fn(create(types, sys.type('Maybe')), {}));
            }
        }),
        (function CreateWrap(fn) {
            return function() {
                this.prototype.fn = fn;
                var fnx = this.just(fn).$fn();
                this.prototype.fnx = function(prop) {
                    return function() {
                        return fnx.fn.apply(fnx, [ prop ].concat([].slice.apply(arguments)));
                    }
                }
                return this;
            }
        }),
        (function CreateLookup(types, maybe) {
            return function(type) {
                return maybe.of(types[type]).chain(function(item) {
                    return item && item.isType ? (item.klass || sys.make(item.name)) : (item && item.klass ? item.klass : maybe.of(item));
                });
            }
        }),
        (function fn(get, base) {
            function just(type, value) {
                return type.isFunctor ? type.of(value) : get(type).pure(value);
            };
            function cast(type) {
                var ctor = type.isFunctor ? type : get(type);
                return function(value) {
                    return value && (value.isFunctor || ctor.is(value)) ? value : ctor.pure(value);
                }
            };
            function apply(monad, type) {
                return function $_apply(value) {
                    return monad.ap(just(type, value));
                }
            };
            function bind(monad) {
                return function $_bind(type) {
                    return apply(monad, type);
                }
            };
            function lift(fn) {
                return function $_lift(value) {
                    return fn(value);
                }
            };
            function pure(monad) {
                return function $_pure(value) {
                    return monad.run(value);
                }
            };
            function embed(monad, type) {
                return function $_embed(value) {
                    return monad.chain(function(instance) {
                        return just(type, instance.of(value));
                    });
                }
            };
            function of(run, type) {
                return function $_of(value) {
                    return type(run(value));
                }
            };
            function utils(monad, args) {
                return function $_utils() {
                    return function $_fn() {
                        var args = [].slice.apply(arguments);
                        var prop = args.shift();
                        return monad.$fn(value);
                    }
                }
            };
            return {
                just: function(type, value, result) {
                    return just(type, value);
                },
                args: function(type, value, result) {
                    return 
                },
                typed: function(type, value, result) {
                    return just(type, bind(just(type, value)));
                },
                cast: function(type, value, result) {
                    return just(type, of(pure(just(type, value)), cast(result || type)));
                },
                embed: function(type, value, result) {
                    return embed(just(type, value), result);
                },
                utils: function(type, value, result) {
                    return utils(just(type, value))
                },
                bind: function(type, value, result) {
                    return just(type, bind(just(type, value))(result || type));
                },
                lift: function(type, value, result) {
                    return just(type, lift(base.lift2M(value, cast(result || 'Maybe'))));
                },
                pure: function(type, value, result) {
                    return pure(just(type, value));
                },
                maybe: function(type, value, result) {
                    return apply(just(type, value), result || 'Maybe');
                }
            };
        }) ],
        (function CreateEnv() {
            return sys.inherit('Env', 'Store', {
                name: 'Env',
                parent: 'Store',
                ctor: function(opts) {
                    this.__super__.call(this, opts);
                    this.handler = this.Handler.of(this);
                },
                ext: [
                    this,
                    (function isInstruction(value) {
                        return this.handler.isInstruction(value);
                    }),
                    (function getHandler(prop) {
                        return this.handler.fnx(prop);
                    }),
                    (function extractDef(def) {
                        return def && def instanceof Function ? def(unit) : def;
                    }),
                    (function parseDefs(defs) {
                        var def, eff;
                        while (defs.length && (eff = this.extractDef(defs.shift()))) {
                            this.addOperation(eff.path, eff);
                        };
                        return this;
                    }),
                    (function runDefs(env, defs) {
                        return defs.bind(this.extractDef).bind(function(eff) {
                            return env.addOperation(eff.path, eff);
                        });
                    }),
                    (function addOperation(path, op) {
                        var node = this.ensure(path, true);
                        node.parse(op, true);
                        return this;
                    }),
                    (function runOperation(path) {
                        return this.getOperation(path).chain(unit);
                    }),
                    (function getNode(location) {
                        return this.maybe(this.walk(location, function(value, key, node) {
                            return node.lookup('factory').chain(function(factory) {
                                return factory.get(key) ? node.is(value) : false;
                            });
                        }));
                    }),
                    (function getFactory() {
                        var args = [].slice.apply(arguments);
                        var node = args.length && this.is(args[0]) ? args.shift() : this.getNode(args.shift());
                        return node.parent('factory').lookup(node.cid()).orElse(node.parent('factory.defaults'));
                    }),
                    (function getAction(location) {
                        return this.handler(location);
                    }),
                    (function eachOperation(location, init) {
                        var node = location && this.is(location) ? location : this.getNode(location), base = this;
                        var path = node.identifier(true).slice(this.level(node));
                        var data = node.each(function(v, k, n) {
                            return base.getOperation(path.concat(k).join('.'), init);
                        });
                        return this.handler.just(data);
                    }),
                    (function cacheOperation(location, init) {
                        return this.maybe(this).lift(function(env, node) {
                            var parts = (location instanceof Array ? location : location.split('.')).slice(node.level(env));
                            if (!parts.length) {
                                return env.eachOperation(node, init);
                            }else {
                                var path    = parts.join('.');
                                var action  = parts.shift();
                                var factory = env.getFactory(node);
                                var options = factory.get(action).values().orElse({}).unit();
                                if (options.args) {
                                    node.set(action, node.get(action).call(sys, sys.get().select(options.args)));
                                }
                                var method  = parts.length ? parts.shift() : (options.method || node.parent('method') || 'just');
                                var result  = parts.length ? parts.shift() : options[method];
                                return env.initOperation(env.handler.create({
                                    node:    node,
                                    path:    location,
                                    action:  action,
                                    options: options,
                                    method:  method,
                                    result:  result
                                }), init || false);
                            }
                        }).ap(this.getNode(location));
                    }),
                    (function initOperation(location, init) {
                        if (!location || init === false) return location;
                        if (typeof location == 'string') return this.getOperation(location, true);
                        else if (this.isInstruction(location)) return location.init();
                        return location;
                    }),
                    (function makeOperation(location, init) {
                        return (this._cache[location] = this.cacheOperation(location, init));
                    }),
                    (function getOperation(location, init) {
                        if (location.indexOf('.') < 0) location = 'sys.eff.' + location;
                        return this._cache[location] || this.makeOperation(location, init);
                    }),
                    (function pureOperation(type, method, action) {
                        return monad.Cont.pure({
                            handler: this.handler,
                            type:    type,
                            method:  method,
                            action:  action
                        }, function(op) {
                            return op.handler.init(op.type, op.method, op.action);
                        });
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
                ]
            });
        }) ],
        (function CreateEffects() {
            // target - environment operations - list of instructions
            return [].slice.call(arguments).map(function(x) {
                return x;//(function(f) { return f(x); });
            }).pure();
        })(
            // sys.eff
            (function() {
                return {
                    type: 'IO',
                    path: 'sys',
                    eff: [
                        (function parse(base) {
                            return function parse(defs) {
                                return base.effects.parseDefs(defs);
                            }
                        })
                    ],
                    factory: {
                        eff: {
                            defaults: {
                                method: 'bind',
                                just: 'Maybe',
                                bind: 'Maybe'
                            },
                            parse: {
                                args: [ 'root.effects' ],
                                method: 'just',
                                just: 'Maybe'
                            }
                        }
                    }
                };
            }),
            // js.nodes
            (function() {
                return {
                    type: 'IO',
                    path: 'js',
                    nodes: [
                        function lookup(node) {
                            return function(key) {
                                return node.lookup(key);
                            }
                        },
                        function fn(node) {
                            return function() {
                                var args = Array.prototype.slice.call(arguments);
                                if (args.length == 1) {
                                    return node.fn(args.shift());
                                }else {
                                    return node.root.get('utils.obj')(args)(args.map(function(name) {
                                        return node.fn(name);
                                    }));
                                }
                            }
                        }
                    ],
                    factory: {
                        nodes: {
                            defaults: {
                                method: 'just',
                                just: 'IO',
                                bind: 'Cont'
                            }
                        }
                    }
                };
            }),
            // io.request
            (function() {
                return {
                    type: 'IO',
                    path: 'io',
                    request: [
                        (function make(fn) {
                            return function make(request) {
                                return fn.xhr('request')(request);
                            };
                        }),
                        (function script(loader, make, wrap, cont) {
                            return function script(base) {
                                return cont(wrap({
                                    cont: this.type('Cont'),
                                    loader: loader.call(this),
                                    store: this.get().child('script')
                                }));
                            }
                        })(
                            (function loader() {
                                return this.type('Cont').extend(
                                    function LoadComp(mv, mf) {
                                        this.__super__.call(this, mv, mf);
                                        this.mf = this.mf.bind(this);
                                    }, {
                                        mf: function(loc) {
                                            return loc == 'pure'
                                                ? sys.get('async.pure')(sys) : 
                                            (function $_pure(k) {
                                                return sys.get('utils.xhr')('loadScript')(loc)(function(s) {
                                                    var node = sys.get('script');
                                                    return node.get(loc.replace('.js', '').split('/').join('.')).enqueue(k);
                                                });
                                            })
                                        }
                                    }
                                );
                            }),
                            (function make(name, continuation) {
                                var url  = [ 'components', name, name ];
                                var path = url.join('.');
                                var node = this.store.get(path);
                                if (node && node.length()) {
                                    return this.cont.of(node.just());
                                }
                                node = this.store.ensure(path);
                                return this.load.of(url.join('/')).bind(this.wrap(node, continuation));
                            }),
                            (function wrap(base) {
                                return function script(location) {
                                    var path = location.replace('.js', '').split('/');
                                    var cont = base.store.get(path.join('.'));
                                    if (!cont) {
                                        var node = base.store.ensure(path.slice(0, -1));
                                        var name = path.slice(-1).pop();
                                        cont = node.set(name, base.loader.of(location).bind(function(result) {
                                            return node.set(name, base.cont.is(result) ? result : base.cont.of(result)).cont();
                                        }).bind(function(result) {
                                            return node.set(name, base.cont.is(result) ? result : base.cont.of(result)).cont();
                                        }));
                                    }
                                    return cont;
                                }
                            }),
                            (function cont(make) {
                                return function script(location) {
                                    return sys.type('Cont').of(location).bind(function(loc) {
                                        return function $_pure(k) {
                                            make(loc).run(k);
                                            return unit;
                                        }
                                    });
                                }
                            })
                        ),
                        (function style(src) {
                            var fullsrc = src.split('.'); fullsrc.push('css');
                            var fileref = document.createElement('link');
                            fileref.setAttribute('rel', 'stylesheet');
                            fileref.setAttribute('type', 'text/css');
                            fileref.setAttribute('href', fullsrc.slice(0, 2).join('.'));
                            document.getElementsByTagName("head")[0].appendChild(fileref);
                            return fileref;
                        }),
                        (function timeout(base) {
                            return base.curry(function(fn, ms) {
                                return function(value) {
                                    return ms ? self.setTimeout(function() {
                                        fn(value);
                                    }, ms) : fn(value);
                                };
                            });
                        })
                    ],
                    factory: {
                        request: {
                            defaults: {
                                method: 'just',
                                just: 'IO',
                                bind: 'Cont'
                            },
                            make: {
                                args: [ 'utils.xhr as xhr' ],
                                method: 'bind',
                                bind: 'Cont'
                            },
                            script: {
                                args: [ 'root' ]
                            },
                            style: {
                                method: 'bind',
                                bind: 'Cont'
                            },
                            timeout: {
                                args: [ 'root.utils.curry as curry' ]
                            }
                        }
                    }
                };
            }),
            // sys.loader
            (function() {
                return {
                    type: 'IO',
                    path: 'sys',
                    loader: [
                        (function makeEnqueue(makeWrap, makeChoice) {
                            return function enqueue() {
                                return makeWrap(makeChoice.call(sys.get('choice').child('loader'), {
                                    scripts: sys.eff('io.request.script').init(),
                                    components: sys.eff('io.request.script').init(),
                                    styles: sys.eff('io.request.style').init(),
                                    templates: sys.eff('io.request.script').init(),
                                    each: sys.get('utils.each'),
                                    cont: sys.get('utils.property')('cont')
                                }), sys.type('Obj'));
                            }
                        })(
                            (function makeWrap(choice, obj) {
                                return function enqueue(def, run) {
                                    var r = { r: {}, l: [] };
                                    return obj.of(def).bind(function(v, k, i, o) {
                                        var i = 0, done, u = unit;
                                        while (i < choice.length) {
                                            if ((done = choice[i++](u, r, v, k, i, o))) {
                                                break;
                                            }
                                        }
                                        console.log(done, v);
                                        return done || v;
                                    }).bind(function(load) {
                                        return run(load);
                                    }).cont();
                                }
                            }),
                            (function makeChoice(eff) {
                                return [
                                    function whenDepsStart(i, r, v, k, o) {
                                        if (k == 'deps') return v;
                                    },
                                    function whenCoreStart(i, r, v, k, o) {
                                        if (k == 'core' || k == 'helpers') {
                                            var res = r[k] = {};
                                            return v.map(function(name) {
                                                return name == 'pure' ? sys.get('async.pure')(sys)
                                                    : eff.scripts.run(k + '/' + name).bind(function(result) {
                                                        return res[name] = result;
                                                    }).cont();
                                            });
                                        }
                                    },
                                    function whenComponents(i, r, v, k, o) {
                                        if (k == 'components') {
                                            var res = r[k] = {};
                                            return v.map(function(def, type) {
                                                var args = def instanceof Array ? def : [ def ];
                                                var name = args.shift(), opts = args.length ? args.shift() : { js: true };
                                                var path = 'components/' + name + '/' + name;
                                                return res[name] = eff[k].run(path + '.js').bind(function() {
                                                    //return tp.of(name, opts);
                                                    var test = res;
                                                    return sys.get('script').get(path);
                                                }).cont();
                                            });
                                        }
                                    },
                                    function whenScriptsOrStyles(i, r, v, k, o) {
                                        if (k == 'scripts' || k == 'styles' || k == 'templates') {
                                            var res = r[k] = {};
                                            return v.map(function(name) {
                                                var path = name.split('/');
                                                if (k == 'templates') {
                                                    if (path.length < 2) path.unshift('templates');
                                                    path.push(path.pop()+'.tmpl');
                                                }else {
                                                    if (path.length < 2) path.unshift('libs');
                                                    if (path.length < 3) path.push(name);
                                                    path.push(path.pop()+'.js');
                                                }
                                                return eff[k].run(path.join('/')).bind(function(result) {
                                                    return res[name] = self[name] || result;
                                                }).cont();
                                            });
                                        }
                                    }
                                ];
                            })
                        )
                    ],
                    factory: {
                        loader: {
                            defaults: {
                                method: 'just',
                                just: 'IO',
                                lift: 'Maybe',
                                bind: 'Cont'
                            },
                            enqueue: {
                                args: []
                            }
                        }
                    }
                };
            })
        )
    )
);
