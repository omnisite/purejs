(function() {
    // ==== pure(1, true) applys: [0].apply(undefined, [].slice(1)) ======= //
    [].slice.call(arguments, 0, 2).append([].slice.call(arguments, 2)).pure(1, true);
})(

    (function MakeSys() {
        // ====== set up sys with basic funcs and TypeKlass factory  ====== //
        return [].slice.call(arguments).apply();
    })(
        // ====== basic functions globally accessible through sys.fn ====== //
        (function pure(sys, make, unit, $const, bin, extract, wrap, tap, isEqual, pure, create) {
            sys.fn.unit    = self.unit    = unit;
            sys.fn.$const  = self.$const  = $const;
            sys.fn.extract = self.extract = extract;
            sys.fn.bin     = bin;
            sys.fn.wrap    = wrap;
            sys.fn.tap     = tap;
            sys.fn.pure    = pure;
            sys.fn.isEqual = isEqual;
            sys.type = bin(make)(sys);
            sys.wrap = create;
            sys.log  = tap(console.log.bind(console));
            return sys;
        }),
        // === set up sys --> globally accessible gateway to purejs === //
        (function sys(now) {
            return { now: now, fn: (Array.prototype.fn = {}) };
        })(
            (self.now = (function now(run) {
                return run();
            })(
                (function() {
                var perf = self.performance;
                if (perf && (perf.now || perf.webkitNow)) {
                    var perfNow = perf.now ? 'now' : 'webkitNow';
                    return perf[perfNow].bind(perf);
                }else { return Date.now; }
            })))
        ),
        // === map over the types with 'sys' curried === //
        (function make(sys, type) {
            if (typeof type == 'string') {
                var t = sys.Type.def(type), r;
                if (t && (r = t.get('type'))) return r.make();
                else if (t && (r = t.get('def')) && r.klass && r.done) r = t.klass;
                else if (r && !r.pending && (r.pending = true)) r = sys.make(r);
                else if (t) r = sys.make(t);
                return r.make();
            }else {
                var t = type instanceof Function ? type.call(sys) : type;
                var n = t.name || (t.name = (t.klass ? t.klass.name : t.constructor.name));
                return sys.def(t);
            }
        }),
        // ==== basic functions ===== //

            // ==== identity ======== //
            (function unit(t) {
                return t;
            }),
            // ==== constant ======== //
            (function $const(a) {
                return function() {
                    return a;
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
            // === val from pure ==== //
            (function extract(fn) {
                return fn(unit);
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
                    if (a instanceof Array) {
                        return b instanceof Array && a.length == b.length ? a.reduce(function(r, v, i) {
                            return r && isEqual(v, b[i]) ? true : false;
                        }, true) : false;
                    }else if (typeof a == 'object' && a.constructor == Object) {
                        return typeof b == 'object' && b.constructor == Object ? objEqual(a, b) : false;
                    }else {
                        return a === b;
                    }
                };
            })(),
        // ===== expose pure to array and pass it on ==== // 
        (function(pure) {
            this.pure = function() {
                return pure(Array.apply(arguments));
            };
            this.of = function() {
                return [].slice.call(arguments);
            };
            return pure;
        }).call(Array,
            // ===== wraps the array in pure ==== //
            (function MakePure($pure) {
                this.prototype.pure = function(idx, remove) {
                    return typeof idx != 'undefined' &&
                        idx < this.length && this[idx] instanceof Function
                            ? (remove ? this.remove(idx).at(0)(this) : this[idx](this)) : $pure(this);
                };
                return $pure;
            }).call(Array,
                (function(t) {
                    return function $_pure(f) {
                        return f(t);
                    }
                })
            ),
            // ===== calls fn over array: [ fn.apply(undefined, arg1, arg.., arg...) ] ==== //
            (function MakeApply($apply) {
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
            ),
            // ===== more functional array ====== //
            (function MakeArray() {
                String.prototype.$_like = new RegExp("([\\.\\\\\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:\\-])", "g");
                String.prototype.matches = String.prototype.like = function(search) {
                    if (typeof search !== 'string' || this === null) { return false; }
                    search = search.replace(this.$_like, "\\$1");
                    search = search.replace(/%/g, '.*').replace(/_/g, '.');
                    return RegExp('^' + search + '$', 'gi').test(this);
                };
                String.prototype.toCamel = function(){
                    return this.length < 3 ? this.toLowerCase() : this.replace(/(^[a-z]{1}|\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
                };
                String.prototype.toDash = function() {
                    return this.length < 2 ? this.toLowerCase() : this.replace(/([A-Z])/g, function($1, p1, pos){return (pos > 0 ? "-" : "") + $1.toLowerCase();});
                };
                String.prototype.toTypeCode = function() {
                    return [ '$', this.split('$').pop().toDash() ].join('');
                };
                String.prototype.toTypeName = function() {
                    return this.replace(/-/g, '').replace('$', '').substr(0, 1).toUpperCase() + this.slice(1);
                };
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
                this.prototype.first = function() {
                    return this.length ? this.at(0) : [];
                };
                this.prototype.last = function() {
                    return this.length ? this.at(this.length - 1) : [];
                };
                this.prototype.bimap = function(f, i) {
                    return typeof i == 'undefined' ? this.map(f) : this.slice(0, 1).concat(this.slice(i).map(this.fn.bin(f)(this.first())));
                };
                this.prototype.until = function(index) {
                    return this.length ? this.splice(0, index) : [];
                };
                this.prototype.remove = function(index, howmany) {
                    return this.length ? this.splice(index, howmany || 1) : [];
                };
                this.prototype.flat = this.prototype.flatten = function() {
                    return Array.prototype.concat.apply([], this);
                };
                this.prototype.prepend = function() {
                    return (0*this.unshift.apply(this, [].slice.call(arguments).flat())) || this;
                };
                this.prototype.append = function() {
                    return (0*this.push.apply(this, [].slice.call(arguments).flat())) || this;
                };  
                this.prototype.replace = function(f, i) {
                    return this.splice(index, 1, this.at(i));
                };
            }).call(Array)
        ),

        // ===== wrap sys and expose as self.sys ===== //
        (function(make) {
            return function() {
                return make.call({}, this);
            }
        })(
            (function(sys) {
                this.get = function() {
                    var args = [].slice.call(arguments);
                    return sys.root.get(args.length ? args.join('.') : undefined);
                };
                this.dump = function(recur) {
                    return sys.root.store().info(recur).run();
                };
                this.type = function(name, attr) {
                    if (!name) return sys.types['Type'];
                    var type = sys.type(name), result;
                    if (type && type.isType && !type.done && !type.pending && (type.pending = true)) result = sys.make(name);
                    else if (attr) return result = sys.make(name).get(attr);
                    else return type.klass;
                };
                this.klass = function(name) {
                    return this.type(name, 'klass');
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
                    return sys.root.find(value);
                };
                this.eff = function() {
                    return sys.eff.apply(sys.eff, arguments);
                };
                this.enqueue = function(deps, run) {
                    return (this.enqueue = sys.eff('sys.loader.enqueue').init().unsafePerformIO)(deps, run);
                };
                this.of = function(v) {
                    return sys.of(v);
                };
                this.is = function(v) {
                    return v && v instanceof sys.base ? true : (v && v.name && this.get('types', v.name) ? true : (v && v.base == sys.base ? true : false));
                };
                this.unwrap = function() {
                    return sys;
                };
                this.stats = function() {
                    return sys.scheduler.nextTick.status().last();
                };
                this.component = function(name) {
                    return sys.eff('sys.loader.component').run(name);
                };
                this.log = sys.log;
                this.lookup = Function.prototype.call.bind(sys.root.lookup, sys.root);
                this.fn = sys.fn;
                return this;
            })
        )
    ),

    (function MakeKlass() {
        // ====== create Type --> TypeKlass constructor ====== //
        return [].slice.call(arguments).apply();
    })(
        (function run(make, store, base, wrap, expose, init) {
            return function(i) {
                return init(i, expose(wrap, base(store, make(i), i)));
            }
        }),
        (function make(i) {
            return i.slice(0, 1).append(i.remove(1).first()).bimap(function(sys, type) {
                var t = type instanceof Function ? type.call(sys) : type;
                var n = t.name || (t.name = (t.klass ? t.klass.name : t.constructor.name));
                if (t.name == 'Type') {
                    t.prototype.id = t.prototype.makeID();
                    sys.Type = t;
                }else {
                    t = new sys.Type(t);
                    t = t.make();
                }
                return t;
            }, 1);
        }),
        (function store(type, data, sys) {
            var klass = this.get('klass');
            klass.prototype.data = data.root(type.make(klass));
            var root = sys.root  = klass.prototype.root = this.set('root', unit(klass.of()));
            var choi = root.child('choice');
            if (type.data) {
                if (type.data.utils) this.ext(type.data.utils, root.add('utils'));
                if (type.data.async) this.ext(type.data.async, root.add('async'));
                if (type.data.point) root.get('utils').set('point', type.data.point.call({ curry: root.get('utils.curry') }));
                if (type.data.xhr)   type.data.xhr(sys, root.get('utils'), sys.fn.pure);
            }
            klass.prototype.fn     = root.get('utils.func');
            klass.prototype.select = root.get('utils.pass')(root.get('utils.select'));
            klass.prototype.bin    = root.get('utils.pass')(root.get('utils.bind'));
            klass.prototype.parse  = root.get('utils.parse');
            return root;
        }),
        (function base(init, make, next) {
            var sys   = make.first();
            var data  = make.at(2);
            var store = make.last();
            var root  = init.call(store, store.get(), data.get(), make.first());
            var node  = make.at(1).store = root.child('types');
            sys.fn.pure(node.child('Data'))(function(d) { d.set('def', data.get()); d.set('type', data); });
            sys.fn.pure(node.child('Store'))(function(d) { d.set('def', store.get()); d.set('type', store); });
            return next.slice(0, 1).append(next.remove(1).first()).bimap(function(sys, item) {
                return sys.make(sys.type(item)).make();
            }, 1);
        }),
        (function wrap(cell) {
            return function(k) {
                return cell.get(k);
            };
        }),
        (function expose(wrap, make) {
            var sys  = self.sys = make.first().wrap();
            var cell = make.last().get('klass').of();
            sys.run  = wrap(cell);
            return function() {
                cell.set(sys);
            }
        }),
        (function init(i, r) {
            return [ i.lift(function(sys, base, lazy, eff) {
                return [ base.bind(function(item) {
                    var t = sys.type(item);
                    return sys.type(t.name);                    
                }), lazy.bind(function(item) {
                    return sys.type(item);
                }) ].chain(function() {
                    return eff(sys);
                });
            }), function $_pure(f) {
                // Mozilla, Opera and webkit nightlies currently support this event
                if (document.readyState !== "loading") {
                    f();
                }else if ( document.addEventListener ) {
                    // Use the handy event callback
                    document.addEventListener( "DOMContentLoaded", function(){
                        document.removeEventListener( "DOMContentLoaded", arguments.callee, false );
                        f();
                    }, false );
                }else if ( document.attachEvent ) {
                    // ensure firing before onload,
                    // maybe late but safe also for iframes
                    document.attachEvent("onreadystatechange", function() {
                        if ( document.readyState === "complete" ) {
                            document.detachEvent( "onreadystatechange", arguments.callee );
                            f();
                        }
                    });
                }
            } ].run(r);
        })
    ),

    (function MakeCoreTypes() {

        // Klass Types:

            // 1. Type Constructors
            //    - produce instance constructors
            //    - deliver inheritance facilities
            // 2. Instance Constructors
            //    - hassle free prototypes
            //    - proxy to their type constructor

        // Base Types:

            // Type   --> Factory Klass of Type Constructors
            // IO     --> Top level base klass prototype
            // Thread --> Timer, scheduler and tick engine
            // Cell   --> Lazy Value wrap that queues until ready
            // Array  --> Monadic bind, flatmap, iterable
            // Object --> Runs Array over its keys, implements Cell
            // Store  --> Key/Value store, nestable and functional

        // Functional Types:

            // Functor, Compose, Maybe, Continuation
            // Coyoneda, List, Fold, Free
            // Queue, Signal, Event, Listener

        // Organizational Types

            // Application, Module, Component
            // Router, Resource, Effect, Operation

        // Global Utilities

        // Collectors, Function Stores and the global "sys" scope
        return [].slice.call(arguments);
    })(
        // === Type === //
            (function() {
                return [].slice.call(arguments).apply();
            })(
                (function(ctor, make, proto, named) {
                    return function() {
                        return make.call(this, named.call(proto.call({ sys: this.fn.$const(this), fn: this.fn, ctor: ctor })));
                    }
                }),
                (function Type(def) {
                    this.init(def);
                }),
                (function(Type) {
                    Type.def   = this.def = function(def) {
                        if (!def) {
                            return Type.store;
                        }else if (typeof def == 'object') {
                            return Type.store.get(def.name || (def.name = def.klass.name), 'def') || Type.store.child(def.name).set('def', def);
                        }else {
                            return Type.store.get(def) || Type.store.child(def);
                        }
                    };
                    Type.base  = Type.prototype.base = this.base = unit(function Base() {});
                    Type.of    = Type.prototype.find = this.make = function(def, prop) {
                        var type;
                        if (typeof def == 'string') {
                            type = Type.def(def).get('type') || Type.store.get(def).set('type', new Type(Type.store.get(def).get('def')));
                        }else {
                            type = Type.def(def.name).get('type') || Type.store.get(def.name).set('type', new Type(def));
                        }
                        return prop && type ? (!type.get('done') ? type.make() : type).get(prop) : type;
                    };
                    return Type;
                }),
                (function() {
                    this.ctor.prototype = {
                        constructor: this.ctor,
                        of: (function(def) {
                            return this.constructor.of(def);
                        }),
                        sys: this.sys,
                        init: this.fn.pure({
                            get: function(def) {
                                return function(attr) {
                                    return attr && attr != 'def' ? (attr == 'type' ? this : def[attr]) : def;
                                }
                            },
                            set: function(def) {
                                return function(attr, value) {
                                    return def[attr] = value;
                                }
                            },
                            map: function(def, type) {
                                return function(f) {
                                    return def.map ? def.map(f) : f(def, type);
                                }
                            },
                            klass: function(def) {
                                return function() {
                                    if (!def.klass && !def.ctor) def.ctor = this.ctor;
                                    if (!def.klass) def.klass = this.named(def.name, def.id, def.ctor, !def.ctor && def.parent, !def.ctor && def.parent);
                                    if (!def.kid) def.kid = this.id();
                                    if (!def.super && def.parent) {
                                        def.parent = this.find((def.super = def.parent)).make();
                                        if (!def.parent.get('ctor')) {//def.parent.get('proto').ctor) {
                                            //def.parent.get('proto').ctor = this.ctor;//def.parent.get('klass');
                                        }
                                    }
                            
                                    if (!def.proto) def.proto = this.inherit(def, def.parent ? (def.parent.isType ? def.parent.klass : def.parent.get('klass')) : null);
                                    if (def.id === true && !def.proto.id) def.proto.id = this.makeID();
                                    if (!def.klass.extend) def.klass.extend = this.extender(this.sys(), def);
                                    if (!def.klass.test) def.klass.test = this.test(def.klass);
                                    return this;
                                }
                            },
                            make: function(def, type) {
                                return function() {
                                    return this.get('done') ? this : this.attrs(this.klass().map(function(d, t) {
                                        if (d.ext instanceof Function) d.ext = d.ext.call(t.sys());
                                        else if (!d.ext) d.ext = [];
                                        var klass = d.klass, ext = d.ext instanceof Array ? d.ext : Object.keys(d.ext);
                                        klass.prototype = ext.reduce(function(p, v) {
                                            if (typeof v == 'string') {
                                                p[v] = d.ext[v];
                                            }else {
                                                p[v.name] = v.fn || v;
                                            }
                                            return p;
                                        }, d.proto || { constructor: klass });
                                        if (d.attrs) (d.attrs instanceof Array ? d.attrs : Object.keys(d.attrs)).reduce(function(c, v) {
                                            if (v.name) {
                                                c[v.name] = v;
                                            }else {
                                                c[v] = d.attrs[v];
                                            }
                                            return c;
                                        }, klass);
                                        return t;
                                    }));
                                }
                            },
                            of: function(def) {
                                return function() {
                                    var klass = def.done ? def.klass : this.make().klass;
                                    return klass.of.apply(klass, arguments);
                                }
                            }
                        })(function(init) {
                            return function(def) {
                                this.tid   = this.id();
                                this.get   = init.get(def);
                                this.set   = init.set(def);
                                this.map   = init.map(def, this);
                                this.klass = init.klass(def);
                                this.make  = init.make(def);
                            };
                        }),
                        attrs: (function(of, $of) {
                            return function(instance) {
                                var type  = instance.get();
                                var klass = type.klass;
                                var walk  = type.klass.walk || (type.klass.walk = this.walk(klass));
                                if (!klass.of)   klass.of   = walk('of')  || klass.prototype.of;
                                if (!klass.pure) klass.pure = walk('pure');
                                if (!klass.$of)  klass.$of  = walk('$of') || $const((type.klass.$of = $of.call(type.klass)));
                                if (!type.done && type.init) type.init.call(this, type, type.klass, this.sys());
                                if (!type.of) type.of = type.klass.$of();
                                type.pending = false; type.done = true; type.isType = true;
                                return instance;
                            }
                        })(
                            (function of(x) {
                                return new this(x);
                            }),
                            (function $of() {
                                var ctor = this;
                                return function() {
                                    return ctor.of.apply(ctor, arguments);
                                }
                            })
                        ),
                        inherit: (function(type, parent) {
                            if (parent) {
                                var F = function() {};
                                F.prototype = parent.prototype;
                                var proto = new F();
                                proto.constructor = type.klass;
                                proto.__parent__  = proto.__parent__.slice(0);
                                proto.__level__   = proto.__parent__.push(F.prototype);
                                proto.__super__   = this.$super;
                            }else {
                                var F = function() {};
                                F.prototype = this.base.prototype;
                                var proto = new F();
                                proto.constructor = type.klass;
                                proto.__parent__  = []; proto.__level__ = 0;
                                proto.constructor = type.klass; proto.__ = type.klass;
                            }
                            if (type.ctor) proto.ctor = type.ctor;
                            return proto;
                        }),
                        parse: (function() {
                            return [].slice.call(arguments).apply();
                        })(
                            (function $_parseArgs(getArgs, makeArgs) {
                                return function parseArgs(f, r, i) {
                                    if (f.name.substr(0, 2) == '$_') {
                                        return makeArgs(f, getArgs(f), r, i);
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
                            (function makeArgs(func, args, source, isStore) {
                                return func.apply(undefined, args.map(function(a, i, r) {
                                    return isStore ? source.get(a.replace('$_', '')) : source[a.replace('$_', '')];
                                }));
                            })
                        ),
                        ext: (function(items, target, values) {
                            if (!(items instanceof Array) && typeof items == 'object') return this.ext(Object.keys(items), target, items);
                            var isStore   = target.constructor.name === 'Store' && target.set && target.get ? true : false;
                            var parseArgs = this.parse;
                            return items.reduce(function(r, v) {
                                var func = values ? values[v] : (v.fn ? v.fn : v);
                                var name = values ? v : v.name;
                                var val  = name.substr(0, 2) == '$_' ? parseArgs(func, r, isStore) : func;
                                if (isStore) {
                                    r.set(name.replace('$_', ''), val);
                                }else {
                                    r[name.replace('$_', '')] = val;
                                }
                                return r;
                            }, target);
                        }),
                        makeID: (function() {
                            var counter = { cid: 100000 };
                            return function id() {
                                return counter.cid++;
                            }
                        }),
                        $super: (function() {
                            if (this.__level__ && this.__level__--) {
                                if (this.__parent__[this.__level__].ctor)
                                    this.__parent__[this.__level__].ctor.apply(this, [].slice.call(arguments));
                                else this.__parent__[this.__level__].constructor.apply(this, [].slice.call(arguments));
                            }
                            //if (!this.__level__) this.__super__ = function(fn) { return this.__parent__[this.__parent__.length-1][fn].apply(this, [].slice.call(arguments, 1)); };
                        }),
                        test: (function(klass) {
                            return function(ctor) {
                                if (ctor === klass) return true;
                                var p = ctor.prototype.__parent__;
                                var i = p.length;
                                while (i && i--) {
                                    if (p[i].constructor === klass) return true;
                                }
                                return false;
                            }
                        }),
                        walk: (function(klass) {
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
                        ctor: (function() {
                            this.__super__.apply(this, arguments);
                        }),
                        extender: (function(sys, parent) {
                            return function() {
                                var args = [].slice.call(arguments);
                                if (args[0] instanceof Function) {
                                    var type = {}, name = args[0].name;
                                    if (name == 'ctor') type.ctor = args.shift();
                                    else if (name && name != 'ctor') type.name = name;
                                    if (args[0] instanceof Function) type.klass = args.shift();
                                    type.ext = typeof args[0] == 'object' ? args.shift() : [];
                                }else if (typeof args[0] == 'object') {
                                    var type = args.shift();
                                }else {
                                    var type = {
                                        name: args.shift(), ext: []
                                    };
                                }
                                if (args.length) type.attrs = args.shift();
                                type.parent = parent ? parent.name : 'Inst';
                                return sys.make(type);
                            }
                        })
                    };
                    return this.ctor;
                }),
                (function() {
                    return [].slice.call(arguments).apply();
                })(
                    (function(build, make, capture, result, wrap) {
                        return function() {
                            this.prototype.named = wrap(build(make), capture, result);
                            return this;
                        }
                    }),
                    (function(pure) {
                        var args = [];
                        var next = (function(f) { return f(args.shift()); });

                        var tmpl = [ 
                            pure('$const((function Make'), next, pure('() {'),
                                pure('return function '), next, pure('() {'),
                                    pure(' this.id();'),
                                    pure(' this.ctor.apply(this, arguments);'),
                                    pure(' this.__level__ && !(this.__level__ = 0);'),
                                    pure(' this.__super__.apply(this, arguments);'),
                                    pure(' return this;'),
                                pure('}})());') ];

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
                        return function tmp(fn) {
                            return fn();
                        }
                    })(),
                    (function(text) {
                        try {
                            return eval(text);
                        }catch(e) {

                        }
                    }),
                    (function(make, capture, result) {
                        return function named() {
                            return capture(result(make.apply(undefined, [].slice.call(arguments))));
                        }
                    })
                )
            ),
        // === Data === //
            (function() {
                return {
                    klass: function Data() {
                        this._base = this._uid = this.root.base;
                        this._id   = this._uid;
                        this._ref  = this.root.val;
                    },
                    ext: [
                        (function root() {
                            return { name: 'root', base: 1000000, val: [] };
                        })(),
                        (function make() {
                            return this.constructor.add(this);
                        }),
                        (function $locate(nid) {
                            var uid = nid - this._base;
                            var idx = 0, lvl = 0, div = 1000, val = this._ref;
                            while (++idx < 4) {
                                lvl = uid < div ? 0 : ((uid - uid%div) / div);
                                uid = uid - (div * lvl); div = div / 10;
                                while (val.length <= lvl) { val.push([]); }
                                val = val[lvl];
                            }
                            return val;
                        }),
                        (function locate(nid) {
                            return (this._val = this.$locate(nid));
                        }),
                        (function check(nid) {
                            return (!nid || nid < this._base || nid > this._uid) ? false : true;
                        }),
                        (function find(nid, full) {
                            if (!this.check(nid)) return;
                            var val = this.$locate(nid);
                            return full ? val[nid%10] : val[nid%10][1];
                        }),
                        (function push(val, item) {
                            return val[(val.push([ [], item ])-1)][0];
                        }),
                        (function add(item) {
                            if (this._uid%10==0) this._val = null;
                            item._uid = this._uid++;
                            return this.push(this._val || (this._val = this.locate(this._uid)), item);
                        })
                    ],
                    attrs: [
                        (function of() {
                            return new this();
                        }),
                        (function add(root) {
                            return function(store) {
                                return root.add(store);
                            };
                        }),
                        (function data(type, klass) {
                            return function(fn) {
                                return fn(type.set('root', klass.of()), klass.add);
                            }
                        })
                    ],
                    init: function(type, klass, sys) {
                        this.set('root', klass.data(this, klass));
                    }
                };
            }),
        // === Store === //
            (function() {
                return {
                    klass: function Store(ref) {
                        this._val = this.data(this);
                        this._ids = [];
                        this._map = {};
                        if (ref) this._ref = (this.is(ref.parent) ? ref.parent : (this.is(ref) ? ref : ref));
                    },
                    ext: [
                        (function cid() {
                            return this._ref.cid();
                        }),
                        (function of(ref, ctor) {
                            return ctor ? new ctor(ref) : new this.constructor(ref);
                        }),
                        (function is(value) {
                            return value && value instanceof this.__;
                        }),
                        (function index(key) {
                            return this._map[key];
                        }),
                        (function keys(index) {
                            return typeof index == 'number' ? this._ids[index] : this._ids;
                        }),
                        (function vals() {
                            return this._val;
                        }),
                        (function get(key) {
                            if (!key && typeof key == 'undefined') return this._ref;
                            else if (key && typeof key == 'string' && key.indexOf('.')>=0) return this.path(key);
                            else return key ? this._val[this._map[key]] : this._ref;
                        }),
                        (function apply(fn, ctx) { // args
                            if (typeof fn == 'string') {
                                var target = this.get(fn);
                                var args   = Array.prototype.slice.call(arguments, 1);
                                if (target instanceof Function) return target.apply(ctx || this, args);
                            }else if (fn instanceof Function) {
                                var args   = Array.prototype.slice.call(arguments, 1);
                                return fn.apply(ctx || this, args);
                            }
                        }),
                        (function parent(key) {
                            return key ? this._ref.get(key) : this._ref;
                        }),
                        (function at(index) {
                            return this._val.length && index < this._val.length ? this._val[index] : null;
                        }),
                        (function set(key, value) {
                            return (this._val[(this._map[key] >= 0 ? this._map[key] : (this._map[key] = (this._ids.push(key)-1)))] = value);
                        }),
                        (function add(name, ref) {
                            return this.set(name, this.is(ref) ? ref : this.constructor.of(ref || this));
                        }),
                        (function child(name, ctor, ref) {
                            var opts = typeof name == 'object' ? name : {};
                            if (typeof name == 'string') opts.name = name;
                            else if (name && name.name) opts.name = name.name;
                            return this.set(opts.name, this.of(this, ctor));
                        }),
                        (function ref(value) {
                            return value ? (this._ref = value) : this._ref;
                        }),
                        (function length() {
                            return this._val.length;
                        }),
                        (function path(key, value) {
                            return !key ? this : key.split('.').reduce(function(result, key, idx, keys) {
                                if (!key || !result) {
                                    return result;
                                }else if (!idx && result instanceof Function) {
                                    result = null;
                                }else if (value && (idx == keys.length - 1)) {
                                    result = result.set ? result.set(key, value) : (result[key] = value);
                                }else if (idx && keys[idx-1] == 'fn' && result instanceof Function) {
                                    result = result[key] || result(key);
                                }else if (key == 'fn' && !result.get(key)) {
                                    result = result.fn();
                                }else if (result instanceof Array) {
                                    result = result.get(key);
                                }else if (typeof result == 'object') {
                                    if (result && result.get) result = result.get(key) || result[key];
                                    else result = result[key];
                                }
                                return result;
                            }, this);
                        }),
                        (function clear(id) {
                            var node = this, vals;
                            if (!node || !node.length || !node.length()) {
                                return node;
                            }else if (!id) {
                                vals = node.values();
                                node._map = {};
                                node._ids.splice(0);
                                node._val.splice(0);
                                return vals;
                            }else {
                                var idx = node._map[id],
                                val  = [].concat(node._val.splice(0)),
                                idxs = sys.get('utils.values')(node._map),
                                keys = sys.get('utils.keys')(node._map),
                                pos  = 0,
                                del  = [];

                                node._map = {};
                                node._ids.splice(0);
                                while(pos < val.length) {
                                    if (id != keys[pos]) node.add(keys[pos], val[idxs[pos]]);
                                    else del.push([ keys[pos], val[idxs[pos]] ]);
                                    pos++;
                                }
                                return del.reduce(function(r, v, i) {
                                    r[v.shift()] = v.pop().values();
                                    return r;
                                }, {});
                            }
                        }),
                        (function lookup(key, orElse) {
                            return this.maybe(
                              key ? (this.get(key)||(orElse && orElse instanceof Function ? orElse(this) : orElse)) : orElse
                            );
                        }),
                        (function values(recur) {
                            var node = this;
                            return node._val.reduce(function(result, value, index) {
                                result[node._ids[index]] = recur && node.is(value)
                                    ? value.values(typeof recur == 'number' ? (recur - 1) : recur) : value;
                                return result;
                            }, {});
                        }),
                        (function convert() {
                            return this.parse.apply(this, [].slice.call(arguments));
                        }),
                        (function map(f) {
                            var arr = [], store = this;
                            this._val.forEach(function(v, i) {
                                arr.push(f(v,store._ids[i],store,i));
                            });
                            return arr;
                        }),
                        (function $bind(b) {
                            return function bind(f, r) {
                                return this._val.bind(b(f, r || {}, this));
                            }
                        })(
                            (function bind(f, x, s) {
                                return function $fn(v, i, o) {
                                    var k = s && s.keys ? s.keys(i) : v.name;
                                    if (s && s.is && s.is(v) && v._val.length) return v._val.bind(bind(f, (x[k] = {}), v));
                                    else if (v instanceof Array && v.length) return v.bind($fn);
                                    return (x[k] = f(v, k, i, s && s._ref ? s.ref() : o) || v);
                                };
                            })
                        ),
                        (function find(value) {
                            return this.db.find(typeof value == 'object' ? (value._uid || value._id || value.uid) : value);
                        }),
                        (function info(recur) {
                            var count = 0, bind = this.bind(function(x, k, i, o) {
                                console.log(o && o.is ? [ o.identifier(), k, x, i, o.uid(), o.store().is(x) ? 'store' : 'value', count ] : [ x, o, i, count ]);
                                count++;
                                return x;
                            });
                            return recur ? bind.bind(unit) : bind;
                        })
                    ],
                    attrs: [
                        (function of(ref) {
                            return new this(ref);
                        })
                    ],
                    data: {
                        utils: [
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
                            (function create(c, f, g) {
                                return function(x, y) {
                                    return g(new c(f(x || this), y));
                                };
                            }),
                            (function lift(fn, base) {
                                return (base || this).map(function(v1) {
                                    return function(v2) {
                                        return fn(v1, v2);
                                    }
                                });
                            }),
                            (function(wrap, lift) {
                                return function $_lift2($_curry) {
                                    return lift(wrap, $_curry);
                                }
                            })(
                                (function wrap(fn, base) {
                                    return function(monad1, monad2) {
                                        return base.pure(monad1.bind(function(val1) {
                                            return monad2.bind(function(val2) {
                                                return fn(val1, val2);
                                            });
                                        }));
                                    };
                                }),
                                (function lift2(wrap, curry) {
                                    return function lift2(fn, base) {
                                        return curry(wrap(fn, base));
                                    }
                                })
                            ),
                            // === 1st arg bind ===== //
                            (function bind(a) {
                                return function(f) {
                                    return function(b) {
                                        return f(a, b);
                                    }
                                }
                            }),
                            (function(main, wrap, make) {
                                return main(wrap(make));
                            })(
                                (function($fn) {
                                    return function func(key) {
                                        return key ? $fn(this)(key) : $fn(this);
                                    }
                                }),
                                (function($fn) {
                                    return function(node) {
                                        return function(key) {
                                            return $fn(node, key);
                                        }
                                    }
                                }),
                                (function(node, key) {
                                    if (key && key.indexOf && key.indexOf('.')>0) {
                                        node = node.get(key.split('.').slice(0, -1));
                                    }else {
                                        node = node;
                                    }
                                    return node[key] && node[key] instanceof Function
                                        && (node.constructor.prototype[key] instanceof Function)
                                            ? node[key].bind(node) : node.get('$fn', key);
                                })
                            ),
                            (function extend(target, source) {
                                var hasOwnProperty = Object.prototype.hasOwnProperty;
                                for (var propName in source) {
                                    if (hasOwnProperty.call(source, propName)) {
                                        target[propName] = source[propName];
                                    }
                                }
                                return target;
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
                                        stream = $_$map(stream, f_map);
                                        if (f_filter) {
                                            stream = $_$filter(stream, f_filter);
                                        }
                                        return stream;
                                    };
                                };
                            }),
                            (function(nativeKeys, nativeHas) {
                                return function keys(obj) {
                                    if (typeof obj != 'object') return [];
                                    if (obj instanceof Array) return obj.map(function(v, i) {
                                        return v && v.name ? v.name : i;
                                    });
                                    else if (obj instanceof Object || obj.constructor == Object) return nativeKeys(obj);
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
                                        if (typeof value == 'object' && key != 'args') {
                                            if (value instanceof Array && key == node._children) {
                                                var items = node.node(key);
                                                value.map(function(v) {
                                                    return items.child(v, ctor || node.constructor);
                                                });
                                            }else if (node.is(value)) {
                                                node.set(value.cid(), value);                                   
                                            }else if (value.constructor != Object && sys.is(value)) {
                                                node.set(key, value);
                                            }else if (recur) {
                                                run(node.child(key.toLowerCase(), ctor), value, typeof recur == 'number' ? (recur - 1) : recur, ctor);
                                            }else {
                                                node.set(key.toLowerCase(), value);
                                            }
                                        }else if (typeof key == 'number' && value instanceof Array && value.length == 2 && typeof value[0] == 'string') {
                                            node.set(value[0], value[1]);
                                        }else {
                                            node.set(key, value, false);
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
                            (function isBaseType(value) {
                                if (!value || sys.is(value)) return false;
                                else if (typeof value == 'object') return (value.constructor === Object);
                                else if (value instanceof Function) return !value.klass || value === Function || value === Object;
                                return false;
                            }),
                            (function(fstchr, delim, wrap) {
                                return function $_toString($_each, $_keys, $_isBaseType) {
                                    return wrap(fstchr, delim, $_each, $_keys, $_isBaseType);
                                }
                            })(
                                new RegExp(/[^\s]/),
                                String.fromCharCode(10),
                                (function wrap(fstchr, delim, each, keys, isBaseType) {
                                    return function toString(value, recur) {
                                        if (!value) {
                                            return '';
                                        }else if (value instanceof Function) {
                                            var lines  = value.toString().split(delim);
                                            var last   = lines[lines.length-1];
                                            var indent = last.indexOf('}');
                                            var length = lines.length-1;
                                            return lines.reduce(function(r, v, i, a) {
                                                if (v && typeof v == 'string' && v != '') {
                                                    r.lines.push(v.slice(Math.min(v.search(fstchr), r.indent)));
                                                }
                                                return i == length ? r.lines : r;
                                            }, { indent: indent, lines: [] }).join(delim);
                                        }else if (recur === false || !value.constructor || isBaseType(value.constructor)) {
                                            return value;
                                        }else if (value.constructor && value.constructor.prototype && value.constructor.name != 'Object') {
                                            var lines = [];
                                            var name  = value.constructor.name;
                                            lines.push(toString(value.constructor));
                                            each(keys(value.constructor.prototype), function(key) {
                                                var text = toString(value[key], false);
                                                if (text) lines.push(name + '.prototype.' + key + ' = ' + text + ';');
                                            });
                                            return lines.length ? lines.join(delim) : null;
                                        }
                                    }
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
                                    return f(r && r instanceof Array && r.length == 1 ? r.shift() : r);
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
                            (function combine(make) {
                                return function combine(x, f, a) {
                                    return x.bind(make(function(v, t, i, j) {
                                        return f(v, t, i, j);
                                    }, a, x.length));
                                }
                            })(
                                (function makeCombi(f, a, l) {
                                    var i = -1;
                                    return function(v) {
                                        var j = 0;
                                        if (i == l) i = 0;
                                        return a.bind(function(x) {
                                            return f(v, x, !j ? ++i : i, j++);
                                        });
                                    }
                                })
                            ),
                            (function select() {
                                return [].slice.call(arguments).apply();
                            })(
                                (function make($_bind, $_filtered, $_select) {
                                    return function select(f) {
                                        return this.chain($_select($_filtered(f || $const(true), $_bind)));
                                    };
                                }),
                                (function(t) {
                                    return function $_pure(k) {
                                        t.run(k);
                                    }
                                }),
                                (function(f, b) {
                                    return function(x) {
                                        return b(x.bind(unit).chain(function(v) {
                                            return Array.prototype.concat.apply([], v.filter(function(t) {
                                                return t instanceof Array ? true : f(t);
                                            }));
                                        }));
                                    }
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
                            )
                        ],
                        point: (function() {
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
                        xhr:
                            (function XHR() {

                                return [].slice.call(arguments).pure(0, true);
                            })(
                                (function XHRwrap(args) {
                                    return function(sys, utils, pure) {
                                        return args.insert(1, sys, utils, pure).apply();
                                    }
                                }),
                                (function XHRUtility(sys, utils, pure, wrap, newxhr, init, create, run, andThen) {
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
                    make: function(klass) {
                        return function(root, data) {
                            return function(store) {
                                return (klass.prototype.data = data(unit(klass.prototype.db = root)))(store);
                            }
                        }
                    }
                };
            })
    ),

    (function MakeBaseTypes() {

        return [].slice.call(arguments);
    })(
        // === Scheduler === //
            (function() {
                return {
                    parent: 'Store',
                    klass: function Scheduler(opts) {
                        this.__super__.call(this, opts);
                    },
                    ext: [
                        (function enqueue(item) {
                            this.nextTick.enqueue(item);
                        })
                    ],
                    make: (function(dispatcher, sto, raf, wrap) {
                        return wrap(
                            dispatcher(unit),
                            function(cb, ms) {
                                return dispatcher(unit, sto(cb, ms))();
                            },
                            function(cb) {
                                return dispatcher(unit, raf(cb))();
                            }
                        );
                    })(
                        (function() {
                            return [].slice.call(arguments).apply();
                        })(
                            (function MakeDispatcher(create_dispatcher, wrapped_dispatcher, process_messages, create_enqueue_platform, close_over) {
                                return (function dispatcher(cb, timer) { return cb(create_dispatcher(wrapped_dispatcher, process_messages, close_over, create_enqueue_platform, timer)); });
                            }),
                            (function create_dispatcher(wrapped_dispatcher, process_messages, close_over, create_enqueue_platform, timer) {
                                var tasks = [], status = [ 0, 0, 50, false, false, { frameid: 0, count: 0, ts: 0, limit: 0, rs: 0, fs: 0, tfs: 0, mfs: 0, handle: 0, suspend: false, length: 0, maxlen: 0 } ];
                                return close_over(
                                    (function() { return tasks; }),
                                        (function() { return status; }),
                                            wrapped_dispatcher(status, process_messages(tasks, status), timer),
                                                create_enqueue_platform);
                            }),
                            (function wrapped_dispatcher(generic, msgchan, setimm, sto) {
                                return function(status, process, timer) {

                                    var TASK_RUNNING = 3, TASK_QUEUED = 4, TASK_INFO = TASK_QUEUED+1;
                                    if (timer) {
                                        return generic(status, TASK_QUEUED, TASK_RUNNING, TASK_INFO, timer, process);
                                    }else if (typeof MessageChannel !== "undefined") {
                                        return msgchan(status, TASK_QUEUED, TASK_RUNNING, process);
                                    }else if (typeof setImmediate !== "undefined") {
                                        return setimm(status, TASK_QUEUED, TASK_RUNNING, process);
                                    }else {
                                        return sto(status, TASK_QUEUED, TASK_RUNNING, process);
                                    }
                                }
                            })(
                                //timer argument based
                                (function(status, TASK_QUEUED, TASK_RUNNING, TASK_INFO, timer, process_messages) {
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
                                }),
                                // MessageChannel
                                (function(status, TASK_QUEUED, TASK_RUNNING, process_messages) {
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
                                }),
                                // setImmediate
                                (function(status, TASK_QUEUED, TASK_RUNNING, process_messages) {
                                    return function queue_dispatcher() {
                                        if (!(status[TASK_QUEUED] && status[TASK_RUNNING])) {
                                            status[TASK_QUEUED] = true;
                                            setImmediate(process_messages);
                                        }
                                    };
                                }),
                                (function(status, TASK_QUEUED, TASK_RUNNING, process_messages) {
                                    return function queue_dispatcher() {
                                        if (!(status[TASK_QUEUED] && status[TASK_RUNNING])) {
                                            status[TASK_QUEUED] = true;
                                            setTimeout(process_messages, 0);
                                        }
                                    };
                                })
                            ),
                            (function process_messages(tasks, status) {
                                var TASK_INDEX = 0, TASK_START_AT = 0, TASK_COUNTER = TASK_START_AT+1,
                                    TASK_BATCH_SIZE = TASK_COUNTER+1, TASK_RUNNING = TASK_BATCH_SIZE+1,
                                    TASK_QUEUED = TASK_RUNNING+1, TASK_INFO = TASK_QUEUED+1;

                                return function() {
                                    var task, info  = status[TASK_INFO]; info.ps = info.ts;
                                        info.limit  = ((info.ts = parseInt(self.now()*1000)) < self.rafNext ? self.rafNext : info.ts+8000)/1000, 
                                        info.maxlen = info.length > info.maxlen ? info.length : info.maxlen,
                                        info.size   = info.length, info.frameid++;
                                    if (info.length && (info.fs = info.ts - info.ps) && (info.tfs += info.fs) && (info.mfs < info.fs)) info.mfs = info.fs;
                                    while (tasks.length && ++info.count) {
                                        task = tasks[(TASK_INDEX < tasks.length ? TASK_INDEX : (TASK_INDEX = 0))];
                                        if (!task || !task.next) {
                                            tasks.splice(TASK_INDEX, 1);
                                        }else if (task.next(status[TASK_INFO])) {
                                            tasks.splice(TASK_INDEX, 1);
                                        }else {
                                            ++TASK_INDEX < tasks.length || (TASK_INDEX = 0);
                                        }
                                        if (info.suspend || (info.limit < self.now())) break;
                                    }
                                    info.rs = parseInt(self.now()*1000);
                                    status[TASK_RUNNING] = false; info.suspend = false;
                                    return !(info.length = tasks.length);
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
                        ),
                        (function(ms) {
                            return function(fn) {
                                return self.setTimeout(fn, ms);
                            }
                        }),
                        (function() {
                            return function(fn) {
                                return self.requestAnimationFrame(fn);
                            }
                        }),
                        (function(make, sto, raf, process) {
                            return function() {
                                return (self.process = { make: make, sto: sto, raf: raf });
                            }
                        })
                    ),
                    from: (function fromCallback(run, list, make, wrap, tick) {
                        return function $_fromCallback() {
                            return make(list(run, this.root.get('nextTick.enqueue')), wrap(tick));
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
                    // ==== Scheduled Bind ===== //
                    enqueue: (function scheduledBindWrap() {
                        return [].slice.call(arguments).apply();
                    })(
                        (function wrapDispatcher(wrap, make, start, cont, done) {
                            return function bindDispatch(scheduler, timer) {
                                var wrapped = this.set('wrapped', wrap(scheduler));
                                this.set('lazyR', wrapped(make(done, cont, timer)));
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
                                return function $_cont(result) {
                                    return wrapper(succ, result, schedule);
                                }
                            }
                        }),
                        (function ContWrap(schedule, wrapper) {
                            return function lazyR(result) {
                                return function $_pure(succ) {
                                    return wrapper(succ, result, schedule);
                                }
                            }
                        }),
                        (function $_next(succ, result, schedule) {
                            schedule(function() {
                                succ(result); return true;
                            });
                        })
                    ),
                    // === Monadic Bind Async == //
                    then: (function monadicBindWrap() {
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
                    init: function(type, klass, sys) {
                        var scheduler  = sys.scheduler = this.set('root', this.find('Store').get('root').child('scheduler', klass));
                        var dispatcher = scheduler.set('dispatcher', type.make());
                        var nextTick   = klass.prototype.nextTick = scheduler.set('nextTick', dispatcher.make());
                        dispatcher.nextTick = nextTick.enqueue;
                        klass.prototype.makeTimer = dispatcher.sto;
                        klass.prototype.makeAnimFrame = dispatcher.raf;
                        sys.root.get('async').set('then', type.then((nextTick.lazy = type.enqueue.call(sys.root.get('async'), sys.scheduler, 'nextTick.enqueue'))));
                        sys.root.get('utils').set('fromCallback', type.from());
                    }
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
                            (function wrap($collect, $pure, $run, $set, $next) {
                                return function collect(scheduler) {
                                    return $collect($pure($next, scheduler.nextTick.enqueue), $run, $set, scheduler.nextTick.lazy);
                                }
                            }),
                            (function _$_collect(pure, run, set, lazy) {
                                return function collect(x) {
                                    return function $_pure(k) {
                                        return pure(x.slice(0), run(collect, set(0, x.map($const(undefined)), lazy(k))));
                                    }
                                };
                            }),
                            (function pure(next, enqueue) {
                                return function(x, f) {
                                    enqueue(next(x, f));
                                }
                            }),
                            (function map(get, run) {
                                return function make(collect, set) {
                                    return get(collect, run(set));
                                }
                            })(
                                (function get(run, set) {
                                    return function(x, i) {
                                        if (x instanceof Function && x.name == '$_pure') {
                                            return x(set(i), i);
                                        }else if (x instanceof Array) {
                                            return x.length ? run(x)(set(i)) : set(i)(x);
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
                            (function set(c, v, k) {
                                return function(r, i) {
                                    v[i] = r;
                                    if (++c == v.length) {
                                        k(v);
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
                            return [].slice.call(arguments).apply();
                        })(
                            (function make(main, init, make, bind) {
                                return function($_map, $_make, $_bind, $_wrap) {
                                    return bind(main($_wrap), init($_map, $_bind), make($_make, $_map));
                                }
                            })(
                                (function main($_wrap) {
                                    return function(f) {
                                        return $_wrap(f);
                                    }
                                }),
                                (function init($_map, $_bind) {
                                    return function(w) {
                                        return $_bind(w, $_map);
                                    }
                                }),
                                (function make($_make, $_map) {
                                    return function(f, x, m) {
                                        if (!m) return $_map(f, x);
                                        return x.prepend($_make(x, f, $_map));
                                    }
                                }),
                                (function(main, init, make) {
                                    return function bind(f, m) {
                                        return make(init(main(f)), this, m);
                                    }
                                })
                            ),
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
                                        return x instanceof Array ? m(next, x) : f(next, x, i, o);
                                    };
                                };
                            }),
                            (function wrap(closed) {
                                return function wrap(f) {
                                    return function(m, x, i, o) {
                                        return closed(m, f, x, i, o);
                                    }
                                }
                            })(
                                (function closed(m, f, x, i, o) {
                                    return function $_pure(k) {
                                        if (x instanceof Function && x.name == '$_pure') {
                                            return x(function(r) {
                                                return closed(m, f, r, i, o)(k);
                                            }, i);
                                        }else if (x instanceof Array) {
                                            return x.length ? x.bind(m(x)).run(k) : k(x);
                                        }else {
                                            return k(f(x, i, o));
                                        }
                                    }
                                })
                            )
                        ),
                        (function cont() {
                            return sys.klass('Cont').of(this, function(a) {
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
                    init: (function(wrap, make, ext) {
                        return function(type, klass, sys) {
                            return ext(make.call(wrap({
                                klass: klass,
                                scheduler: sys.scheduler,
                                enqueue: sys.scheduler.nextTick.enqueue,
                                utils: sys.root.get('utils').select('andThen', 'call', 'call1', 'call2', 'target'),
                                async: sys.root.get('async').select('pure', 'make', 'select', 'get', 'next', 'combine', 'flatmap', 'fmap', 'wrap', 'then', 'lazyR', 'lazyK')
                            })));
                        };
                    })(
                        (function(ext) {
                            ext.cont = ext.utils.andThen(ext.async.pure);
                            return ext;
                        }),
                        (function() {
                            Array.prototype.collect = this.utils.call(this.klass.prototype.collect(this.scheduler));
                            Array.prototype.each    = this.utils.call1(this.klass.prototype.each);
                            Array.prototype.bind    = this.klass.prototype.bind;
                            Array.prototype.cont    = this.klass.prototype.cont;
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
                            Array.prototype.wrap = function(k) {
                                return this.collect()(k);
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
                            Array.prototype.flatten = function() {
                                return this.flatmap(unit);
                            };
                            Array.prototype.chain = function(f) {
                                return [ this.fmap(function(r) {
                                    return f(r && r.length == 1 ? r.shift() : r);
                                }) ];
                            };
                            return this;
                        }),
                        (function(ext) {
                            Array.prototype.run = function(k, f) {
                                return this.bind(f || unit).wrap(ext.async.get(k || unit));
                            };
                            Array.prototype.fmap = function(f) {
                                return ext.async.then(this.collect(), ext.cont(f));
                            };
                            Array.prototype.flatmap = function(f) {
                                return this.bind(f).chain(ext.async.flatmap(unit));
                            };
                            Array.prototype.cont = function() {
                                return sys.klass('Cont').of(this.collect(), function(a) {
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
        // === Cell === //
            (function() {
                return {
                    name: 'Cell',
                    klass: function Cell() {
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
                                this.queue.splice(0).bind(function(f) {
                                    f(v) //non-trivial spawn could be used here })
                                }).run();
                            }
                        })
                    ],
                    attrs: [
                        (function of() {
                            return new this();
                        })
                    ],
                    cont: function(cell) {
                        return function(v) {
                            cell.set(v);
                        }
                    },
                    init: function(type, klass, sys) {
                        klass.prototype.cont = sys.root.get('utils.call')(type.cont);
                    }
                };
            })
    ),

    (function MakeSysTypes() {

        return [].slice.call(arguments);
    })(
        // === Functor === //
            (function Functor() {
                return {
                    name: 'Functor',
                    id: true,
                    klass: function Functor(mv) {
                        this.id = this.id();
                        this.mv = mv;
                    },
                    ext: [
                        (function of() {
                            return this.constructor.of.apply(this.constructor, [].slice.call(arguments));
                        }),
                        (function parent(prop) {
                            var parent = this.__parent__[this.__parent__.length-1]; return prop ? parent[prop] : parent;
                        }),
                        (function lookup(item) {
                            return sys.of(sys.type(item || this.constructor.name));
                        }),
                        (function is(value) {
                            return typeof value == 'undefined' ? this.constructor instanceof this.__ : value instanceof this.__;
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
                        }),
                        (function run(f) {
                            return this.chain(f || unit);
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
                    init: function(type, klass, sys) {
                        klass.prototype.fn = sys.fn;
                        klass.prototype.schedule = sys.scheduler.get('nextTick.enqueue');
                    }
                };
            }),
        // === Compose === //
            (function Compose() {
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
                        }),
                        (function run(v) {
                            return this.chain(unit)(v);
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
            (function Maybe() {
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
                        (function bind(mf) {
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
                        (function fn(key) {
                            var node;
                            if (key && key.indexOf && key.indexOf('.')>0) {
                                node = this.path(key.split('.').slice(0, -1));
                            }else {
                                node = this;
                            }
                            return node[key] && node[key] instanceof Function
                                && (node.constructor.prototype[key] instanceof Function)
                                ? node[key].bind(node) : null;
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
                            var clone = this.extend(function MaybeFn(mv) {
                                this.__super__.call(this, mv);
                            }).make();
                            var klass = clone.get('klass');
                            klass.prototype.$fn = objfn(obj);
                            klass.prototype.fn  = function() {
                                var args = Array.prototype.slice.call(arguments);
                                var prop = this.$fn(args.shift());
                                if (this.isNothing()) {
                                  return this.of(args.length ? prop.apply(undefined, args) : prop);
                                }else {
                                  return this.map(args.length ? prop.apply(undefined, args) : prop);
                                }
                            }
                            return klass;
                          };
                          return this;
                        })
                    ],
                    init: function(type, klass, sys) {
                        klass.fn = klass.fn(sys.root.get('utils.target'));
                        sys.of = this.find('Store').get('klass').prototype.maybe = klass.$of();
                        var property = klass.prototype.property = sys.root.get('utils.property');
                        klass.prototype.pget  = property('get');
                        klass.prototype.pval  = property('values');
                        klass.prototype.curry = sys.root.get('utils.curry');
                    }
                };
            }),
        // === IO === //
            (function $IO() {
                return {
                    id: true,
                    klass: (function IO(f) {
                        this._id = this.id();
                        this.unsafePerformIO = f;
                    }),
                    ext: [
                        (function fn(f) {
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
                        (function wrap() {
                            return this.of(this);
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
                        (function chain() {
                            return this.unsafePerformIO.apply(this, arguments);
                        }),
                        (function ap(monad) {
                            return monad.map ? monad.map(this.unsafePerformIO) : this.ap(this.of(monad));
                        }),
                        (function apply(monad) {
                            return monad.ap(this);
                        }),
                        (function map(f) {
                            var thiz = this;
                            return this.fn(function(v) {
                              return f(thiz.unsafePerformIO(v));
                            });
                        }),
                        (function pipe(f) {
                            return this.fn(this.$fn(f)(this.unsafePerformIO));
                        }),
                        (function lift(f) {
                            return this.map(function(v1) {
                                return function(v2) {
                                    return f(v1, v2);
                                };
                            }).pure();
                        }),
                        (function() {
                            function run(IO) {
                                return (function(v) { return IO.run(v); });
                            };
                            return function then(fn) {
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
                        }),
                        (function lift(f) {
                            return this.of(function(v1) {
                                return this.of(function(v2) {
                                    return f.call(this, v1, v2);
                                }).pure();
                            }).pure();
                        })
                    ],
                    impl: [
                        (function MakeType(defs) {
                            var ctor = defs.shift();
                            ctor.prototype = defs.reduce(function(proto, def) {
                                proto[func.name] = func;
                                return proto;
                            }, { constructor: ctor });
                            return ctor;
                        })
                    ],
                    init: function(type, klass, sys) {
                        klass.$pure = klass.pure.bind(klass);
                        this.find('Maybe', 'proto').toIO = function() {
                            return this.chain(klass.$pure);
                        }
                    }
                };
            }),
        // === Node === //
            (function Node() {
                return {
                    name: 'Node',
                    id: true,
                    klass: function Node(opts) {
                        this.init(opts || {});
                    },
                    ext: [
                        (function init(opts) {
                            this._id      = this.id();
                            this._cid     = opts.name || opts.cid || opts.id;
                            this._cache   = {};
                            this._buffer  = [];
                            this._started = 2;
                            this.start();

                            if (opts.parent && this.is(opts.parent)) {
                                this._parent = opts.parent;

                                var store = this._parent.get(this._cid);
                                if (store && this.test(store)) {
                                    this._store = store;
                                    this._store.ref(this);
                                }else {
                                    this._store = this._parent._store.add(this._cid, this);
                                }
                                if (this._parent._events) this._events = this._parent._events;
                                this._level  = (this._parent._level  || (this._parent._level  = 0)) + 1;
                                this._offset = (this._parent._offset || (this._parent._offset = 0)) + (opts.offset || 0);
                            }else {
                                this._store  = this._store;
                                this._store.ref(this);
                                this._level  = 0;
                                this._offset = opts.offset || 0;
                            }
                        }),
                        (function store() {
                            return this._store;
                        }),
                        (function is(value) {
                            return value && value instanceof this.__;
                        }),
                        (function uid() {
                            return this._store._uid;
                        }),
                        (function cid() {
                            return this._cid;
                        }),
                        (function ref(value) {
                            return value && value._ref && value._ref instanceof this.__ ? value._ref : value;
                        }),
                        (function($get) {
                            return function get() {
                                return this.ref($get(this, [].slice.call(arguments).join('.')));
                            }
                        })(
                            (function get(node, key) {
                                if (!key && typeof key == 'undefined') return node._store;
                                else if (key && typeof key == 'string' && (node.has(key))) return node._store.get(key);
                                else if (key && typeof key == 'number') return node._store.at(key);
                                else if (key && key.indexOf && key.indexOf('.') > 0) return node._store.path(key);
                                else if (key && key instanceof Array) return key.length > 1 ? node._store.path(key) : (key.length ? node.get(key.slice(0).shift()) : node);
                                else return key ? undefined : (node._ref || node);
                            })
                        ),
                        (function set(key, value, path) {
                            return key && path !== false && key.indexOf && key.indexOf('.') > 0
                            ? (this._store.path(key) ? (sys.fn.isEqual(this._store.path(key), value) ? value
                                : (this.emit('change', key, 'update', value) || this._store.path(key, value)))
                                    : (this.emit('change', key, 'create', value) || this._store.path(key, value)))
                            : (this.has(key) ? (sys.fn.isEqual(this._store.get(key), value) ? value
                                : (this.emit('change', key, 'update', value) || this._store.set(key, value)))
                            : (this.emit('change', key, 'create', value) || this._store.set(key, value)));
                        }),
                        (function acc(key, value) {
                            return value ? this.set(key, value) : this.get(key);
                        }),
                        (function has(key) {
                            return (this._store.index(key) >= 0);
                        }),
                        (function addEventListener(/* instance, name, selector, target */) {
                            return this._events.addEventListener.apply(this._events, [ this ].concat([].slice.call(arguments)));
                        }),
                        (function removeEventListener(/* instance, name, selector, target */) {
                            return this._events.removeEventListener.apply(this._events, [ this ].concat([].slice.call(arguments)));
                        }),
                        (function observe(/* name, selector, handler */) {
                            if (this.dispatcher) 
                            return this.dispatcher.addEventListener.apply(this.dispatcher, [ this, 'store' ].concat([].slice.call(arguments)));
                        }),
                        (function pipe(source, args) {
                            if (this._started > 1) {
                                this._events.emit(source, args);
                            }else {
                                this._buffer.push([ source, args ]);
                            }
                        }),
                        (function start() {
                            if (!this._started && (++this._started)) {
                                sys.log([ '!START!', this.identifier() ]);
                            }else if (this._started == 1 && ++this._started) {
                                while (this._buffer.length) {
                                    this._events.emit(this._buffer[0][0], this._buffer[0][1]);
                                    this._buffer.shift();
                                }                                
                            }
                        }),
                        (function emit(name, path, type, value) {
                            if (this.isEvents || (this._parent && this._parent.isEvents)) {
                            }else if (!this.dispatcher){
                            }else if (this._events && this._events.emit) {
                                var parts = path.split('.'), key = parts.pop();
                                this.pipe(parts.length ? this.get(parts.join('.')) : this, [ name, key, type, value ]);
                            }
                        }),
                        (function of(opts, ctor) {
                            return ctor ? new ctor(opts) : new this.constructor(opts);
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
                        (function lookup(key, orElse) {
                            return this.maybe(
                              key ? (this.get(key)||(orElse && orElse instanceof Function ? orElse(this) : orElse)) : orElse
                            );
                        }),
                        (function map(f) {
                            return this._store.map(f);
                        }),
                        (function parse() {
                            return this._store.parse.apply(this, arguments);
                        }),
                        (function info(recur) {
                            return this._store.info(recur);
                        }),
                        (function level(offset) {
                            return this._level - (offset ? (offset._level || this._offset) : this._offset);
                        }),
                        (function child(opts, ctor, parent) {
                            parent || (parent = this);
                            var exists = this.exists(opts), instance;
                            if (exists && this.is(exists)) return exists;
                            var options  = typeof opts == 'object' ? opts : { name: opts, parent: parent };
                            options.parent || (options.parent = this);
                            if (ctor && this.__.test(ctor)) {
                                instance = this.of(options, ctor);
                            }else {
                                if (ctor) this.store().child(options.name, ctor);
                                instance = this.of(options, this.constructor);
                            }
                            return this.emit('change', instance._cid, 'create', instance) || instance;
                        }),
                        (function exists(options) {
                            var opts = options ? (typeof options == 'string' ? { name: options } : options) : {},
                            id = opts.name = opts.name || opts.id || opts.cid,
                            exists = id ? this.get(id) : false;
                            return exists;
                        }),
                        (function instance(opts, ctor, parent) {
                            ctor || (ctor = this.constructor);
                            var options = typeof opts == 'object' ? opts : { name: opts, parent: parent };
                            options.parent || (options.parent = this);
                            return new ctor(options);
                        }),
                        (function node(opts) {
                            return this.child(opts, this.__);
                        }),
                        (function values(recur) {
                            return this._store.values(recur);
                        }),
                        (function clear(id) {
                            return this._store.clear(id);
                        }),
                        (function add(name) {
                            return this.get(name) || this.of({ name: name, parent: this });
                        }),
                        (function keys(index) {
                            return this._store.keys(index);
                        }),
                        (function vals() {
                            return this._store.vals();
                        }),
                        (function parent(key, value) {
                            return this._parent ? this._parent.acc(key, value) : null;
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
                            return this.store().find(value);
                        }),
                        (function pertains(value) {
                            if (!value) {
                                return false;
                            }else if (this.is(value)) {
                                return this.closest(value);
                            }else if (value) {
                                if (value.uid === this.uid()) return true;
                                else return this.maybe(this.ref(this.find(value))).chain(this.bind(function(n, v) {
                                    return v && v.pertains ? v.pertains(n) : false;
                                }));
                            }else {
                                return false;
                            }
                        }),
                        (function walk(run) {
                            return function walk(key, callback) {
                                var parts = typeof key == 'string' ? key.split('.') : key.slice(0);
                                return run(parts, callback)(this.store());
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
                        (function combine(f, a) {
                            return sys.get('async.combine')(this.store(), f, a);
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
                        }),
                        (function childOf(parent) {
                            return typeof parent == 'string' ? sys.lookup(parent) : sys.of(parent).map(function(p) {
                                return Function.prototype.apply.bind(p.child, p);
                            }).lift(function(make, args) {
                                return make(args);
                            });
                        })
                    ],
                    init: function(type, klass, sys) {
                        var store = klass.prototype._store = sys.def('Store.def.root');
                        klass.prototype.test  = store.is.bind(store);
                        klass.prototype.maybe = this.find('Maybe', 'of');
                        klass.prototype.fn    = klass.fn = sys.root.get('utils.func');
                        klass.prototype.bind  = sys.root.get('utils.pass')(sys.root.get('utils.bind'));
                        klass.prototype.cell  = this.find('Cell', 'of');
                        var root  = sys.root  = this.set('root', klass.of('root'));
                        var ext   = root.set('ext', root.store().child({ name:'ext', parent:root }));
                        var proto = klass.prototype;
                        store.map(function $fn(v,k,o,i) {
                            var node = o.ref().child({ name: k });
                            return k == 'types' ? v.map($fn) : node;
                        });
                        sys.Type.store = root.get('types');
                    }
                };
            })
    ),

    (function MakeLazyTypes() {

        return [].slice.call(arguments);
    })(
        // === CellOps === //
            (function CellOps() {
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
                    init: function(type, klass, sys) {
                        klass.prototype.make = sys.make('Cell', 'of');
                        klass.pure = sys.root.get('async.pure');
                        klass.wrap = sys.root.get('utils._1');
                    }
                };
            }),
        // === Obj === //
            (function Obj() {
                return {
                    klass: function Obj(x) {
                        if (!(this instanceof Obj)) return new Obj(x);
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
                        (function bind(b, m) {
                            return function bind(f, r) {
                                return b(f, this, m)(r || {}, this, 0);
                            }
                        })(
                            (function(f, o, m) {
                                return function $bind(x, r, l) {
                                    return o.keys.call(r).bind(function(k, i, o) {
                                        var v = f(x, r[k], k, i, r, l);
                                        return v instanceof Array ? v.bind(m(f, (x[k] = {}), i, v, l+1)) : (typeof v == 'object' ? $bind((x[k] = {}), v, l+1) : v);
                                    }).bind(unit);
                                }
                            }),
                            (function(f, x, t, j, l) {
                                return function(r, v, k, i, o) {
                                    return f(x, r, v, t, j, l);
                                }
                            })
                        ),
                        (function is(x) {
                            return x instanceof Array || typeof x != 'object' ? false : true;
                        }),
                        (function info(recur) {
                            var bind = this.bind(function(r, v, k, i, o) {
                                console.log(v, k, i);
                                return v;
                            });
                            return recur ? bind.bind(unit) : bind;
                        })
                    ],
                    attrs: [
                        function of(x) {
                            return new this(x);
                        },
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
            (function Cont() {
                return {
                    name: 'Cont',
                    parent: 'Compose',
                    ctor: function ctor(x, f) {
                        this.id = this.id();
                        if (x) this.mv = this.$cast(x);
                        if (f) this.mf = f;
                    },
                    ext: [
                        (function mf(t) {
                            return function $_pure(f) {
                                return f(t);
                            }
                        }),
                        (function $cast(v, p) {
                            if (v && this.is(v) && v.cont) {
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
                            return new this.constructor(this.then(mv, this.fn.pure), this.$fn(mf)(this.$cast));
                        }),
                        (function bind(f) {
                            return this.$bind(this.cont(), f);
                        }),
                        (function chain(k) {
                            return this.cont()(k || unit);
                        }),
                        (function fmap() {
                            return this.bind(this.of.bind(this));
                        }),
                        (function ap(other) {
                            return this.map(function(result) {
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
                        (function make(c, s) {
                            return function $_pure(k) {
                                return s(function() {
                                    c(k); return true;
                                });
                            }
                        }),
                        (function wrap() {
                            return this.make(this.cont(), this.schedule);
                        }),
                        (function run(k) {
                            return this.make(this.cont(), this.schedule)(k || unit);
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
                                });
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
                    init: function(type, klass, sys) {
                        klass.prototype.$cast = klass.prototype.$cast.bind(klass.prototype);
                        klass.prototype.cont  = function() {
                            return klass.cont(this.mv, this.mf);
                        }
                        klass.prototype.is = klass.is = function(value) {
                            return value && value instanceof klass ? true : false;
                        }
                        klass.prototype.lazy = sys.root.get('async.lazyK');
                        klass.prototype.result = sys.root.get('async.lazyR');
                        klass.prototype.then = sys.root.get('async.then');
                    },
                    impl: [
                        (function callcc(f,cc) { 
                          f(function(x,k) { cc(x) },cc)
                        })
                    ]
                };
            }),
        // === Signal === //
            (function Signal() {
                return {
                    name: 'Signal',
                    id: true,
                    ctor: function ctor(ref) {
                        this._id = this.id();
                        this._listener = ref;
                        this._values   = [];
                        this._handlers = this.bind(this._values);
                        this._kont     = this._handlers.cont();
                    },
                    ext: [
                        (function vals() {
                            return sys.get('utils.bin')(function(values, handler) {
                                var i = 0, v;
                                while (i < values.length) {
                                    if (handler.eid < (v = values[i]).eid) {
                                        handler.run(v); handler.eid = v.eid; v.count++;
                                    } i++;
                                }
                                return i < values.length;
                            })(this._values);
                        }),
                        (function bind(values) {
                            return [].bind(this.vals(), true);
                        }),
                        (function make(info, handler) {
                            return {
                                sid: this.id(), eid: 0, run: handler, info: info
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
                            var vals = this._values;
                            vals.push(value);
                            return this._kont.run(function(v) {
                                vals.splice(0, v[0].length);
                            });
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
            (function Queue() {
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
                            item.eid = this.eid();
                            if (!(this._queue.length * this._queue.push(item))) {
                                this.schedule(this.next);
                            }
                            return this;
                        }),
                        (function next() {
                            if (this._queue.length) {
                                this.get(this._queue[0].type).run(this._queue.shift());
                            }
                            return !this._queue.length;
                        }),
                        (function wrap() {
                            this._queue = this.set('queue', []);
                            return this.enqueue.bind(this);
                        }),
                        (function create(listener) {
                            return (this._signal || (this.constructor.prototype._signal = sys.klass('Signal'))).of(listener);
                        }),
                        (function handler(stream) {
                            this.handlers.push(stream);
                            return this;
                        }),
                        (function make(/* type, name, id, item */) {
                            var args = [].slice.call(arguments);
                            var listener = args.pop(); listener.reference = args.join('.');
                            return this.set(listener.name, this.create(listener));
                        })
                    ],
                    init: function(type, klass, sys) {
                        klass.prototype.eid = this.makeID();
                    }
                };
            }),
        // === Event === //
            (function Event() {
                return {
                    name: 'Events',
                    parent: 'Node',
                    ctor: function ctor(opts) {
                        this.__super__.call(this, opts || (opts = {}));

                        this.initdata();
                        this._values  = [];
                        this._handler = [];
                    },
                    ext: [
                        (function initdata() {
                            this._lstnrs = this._lstnrs || (this._lstnrs = this.node('listeners'));
                            this._change = this._change || (this._change = this._lstnrs.node('change'));
                            this._active = this._active || (this._active = this._lstnrs.set('active', []));
                            this._queue  = this._queue  || (this._queue  = this.set('queue', this.initQueue([])));
                        }),
                        (function initQueue(queue) {
                            return queue.bind(function(value) {
                                return {
                                    src:    'data',
                                    eid:     value.eid,
                                    count:   value.count,
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
                            var hndl = typeof target == 'string' ? instance[target].bind(instance) : target;
                            var active = this._lstnrs.get('active') || this._lstnrs.set('active', []);
                            return active[active.push({
                                uid: instance.uid(), ref: instance.identifier(),
                                level: instance.level(),
                                name: name, target: hndl,
                                run: hndl.run || hndl
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
                                if (this._queue.push({ count: 0, source: source, args: args })) {
                                    this.runQueue();
                                }
                            }
                        }),
                        (function runQueue() {
                            return this.initQueue(this._queue.splice(0)).run();
                        })
                    ],
                    attrs: [
                        (function of(opts) {
                            return new this(opts);
                        })
                    ],
                    init: function(type, klass, sys) {
                        var Root = sys.root; klass.prototype.isEvents = true;
                        var Events = Root.__.prototype._events = klass.prototype._events = Root.child('events', klass);//klass.of(type, klass));
                    }
                };
            }),
        // === Listener === //
            (function Listener() {
                return {
                    name: 'Listener',
                    parent: 'IO',
                    ctor: function ctor(x) {
                        this.__super__.call(this, x);
                    },
                    ext: (function() {
                        return [].slice.call(arguments).pure(0, true);
                    })(
                        (function(items) {
                            return function() {
                                return items.first().apply(this, items.slice(1));
                            }
                        }),
                        (function(getQueue, mbAddEL1, mbAddEL2, mbELEMListener, addELEMENTListener,
                            mbEVTbind1, wrapDISPATCHER, mbEVTcntrTUP, eON, eOFF,
                                evtONOFF, throttle, mbEvtADD) {
                            
                            var maybe   = this.root.get('utils.maybe');
                            var tuple   = this.root.get('utils.tuple');
                            var bin     = this.root.get('utils.bin');
                            var fromCB  = this.root.get('utils.fromCallback');
                            var compose = this.root.get('utils.compose');

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
                                { name: 'getQueue', fn: getQueue(this.root.child('queue', this.type('Queue').get('klass'))) },
                                { name: 'addElementListener', fn: addELEMENTListener },
                                { name: 'wrapDispatcher', fn: wrapDISPATCHER },
                                { name: 'maybeListener', fn: maybeListener },
                                { name: 'maybeAddEventListener', fn: maybeAddEventListener },
                                { name: 'maybeEventElem', fn: makeEventContainerElement },
                                { name: 'maybeEventControl', fn: maybeEventControl },
                                { name: 'addEventListener', fn: mbEvtADD },
                                { name: 'throttle', fn: throttle },
                                { name: 'maybeEventBinder', fn: maybeEventBinder },
                                { name: 'eventOnOffControl', fn: evtONOFF },
                                { name: 'fromCallback', fn: fromCB }
                            ];

                        }),

                        (function getQueue(queue) {
                            return function(type) {
                                return queue.child(type);
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
                            var store    = this.getQueue(type);
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
                            return this.lift(function(base, elem) {
                                var node, disp, name = elem._cid || elem.id;
                                if (!name || !(node = base.get(name))) {
                                    node = base.child(name);
                                    if (!name) name = node.cid();
                                    if (!elem.id) elem.id = name;
                                }
                                var list = node.get('listener') || node.set('listener', this.maybeEventElem(elem));
                                var disp = node.get('dispatcher')
                                    || node.set('dispatcher', this.wrapDispatcher(node.store().wrap()));

                                return this.constructor.lift(function(node, name) {
                                    return node.get(name)
                                        || node.store().make(node.identifier(), name, node.get('dispatcher')(node.get('listener'))(name));
                                }).run(node);
                            }).run(this.prototype.getQueue(type));
                        })
                    ],
                    data: {
                        dom: [
                            (function matches(element, selector) {
                                return function(evt) {
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
                                    type: evt.type,
                                    target: evt.target,
                                    currentTarget: null,
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
                                var ref = element.identifier();
                                return function(evt) {
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
                    init: function(type, klass, sys) {
                        var lift  = klass.lift  = klass.walk('lift');
                        var pure  = klass.$pure = klass.pure.bind(klass);
                        var func  = klass.prototype;
                        var maybe = sys.root.get('utils.maybe');
                        var bin   = sys.root.get('utils.bin');
                        var queue = sys.root.get('queue');

                        var dom   = queue.child('dom').parse(type.data.dom);
                        var store = queue.child('store').parse(type.data.store);

                        dom.set('makeSelectorFunc', maybe(func.maybeEventBinder)(dom.get('matches')));
                        store.set('makeSelectorFunc', maybe(func.maybeEventBinder)(store.get('matches')));

                        this.find('Node').get('klass').prototype.dispatcher = klass.init('store').run(sys.root);
                    }
                };
            }),
        // === Location === //
            (function Location() {
                return {
                    name: 'Location',
                    parent: 'Node',
                    id: true,
                    klass: function Location(opts) {
                        this.__super__.call(this, opts);
                    },
                    ext: [
                        (function addLocation() {

                        })
                    ],
                    init: function(type, klass, sys) {
                        var cel = klass.prototype.cell = this.find('CellOps', 'of');
                        var loc = klass.prototype.__.prototype.loc = this.set('root', sys.root.child('location', klass));
                    }
                };
            }),
        // === Component === //
            (function Component() {
                return {
                    name: 'Component',
                    parent: 'Node',
                    klass: function Component(opts) {
                        if (!opts.parent) opts.parent = this._node;
                        this.__super__.call(this, opts);
                        this._started = 1;
                        this.change();
                        this.node('$fn');
                        this.set('type', (opts.type || this.constructor.name).toDash());
                        this.parent().set(this.cid(), this);
                        this.parse(opts);
                    },
                    ext: [
                        (function view() {
                            return (this.view = $const(this.child('view', this.deps('components.view'))));
                        }),
                        (function events() {
                            var comp = this, events, list = [];
                            if ((events = this.get('data.events.data'))) {
                                list.push(events.store().bind(function(method, evt) {
                                    comp.observe.apply(comp, evt.split(':').append(typeof method == 'string' ? comp.fn(method) : method));
                                }));
                            }
                            if ((events = this.get('data.events.dom'))) {
                                list.push(events.store().bind(function(method, evt) {
                                    return comp.on.apply(comp, evt.split(':').append(method));
                                }));
                            }
                            if (!list.length) {
                                comp.ctor();
                                comp.parse()
                            }
                            return list.length ? list.fmap(function() {
                                comp.ctor();
                                comp.parse()
                                return comp;
                            }) : this;
                        }),
                        (function on(name, selector, handler) {
                            return this.view().on(name, selector, typeof handler == 'string' ? this[handler].bind(this) : handler);
                        }),
                        (function parse(conf) {
                            conf || (conf = {});
                            var evts = this.get('data.events');

                            if (!this._opts) this._opts = this.node('opts');
                            if (!this._data) this._data = this.node('data').parse({ id: this.uid(), current: {}, tmpl: { main: $const({ 'class' : this.get('type') }) } }, true);

                            if (this.conf.opts) this._opts.parse(this.conf.opts);
                            if (conf.opts) this._opts.parse(conf.opts);

                            if (this.conf.data) {
                                if (this.conf.data.tmpl) this.data({tmpl:this.conf.data.tmpl});

                                if (this.conf.data.events) this.data({events:this.conf.data.events});
                                else if (this.conf.events) this.data({events:this.conf.events});
                            }

                            if (!evts && this.get('data.events')) return this;
                            if (this.conf.data) this._data.parse(this.conf.data, 1);
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
                            return value ? (this.$eff[name] = value) : this.$eff[name];
                        }),
                        (function change(evt) {
                            this.observe('change', 'data.%', function(evt) {
                                console.log(evt);
                            });
                        }),
                        (function make(cont) {
                            this._cont = cont.bind(this.cont(function(klass) {
                                if (this.conf.data && this.conf.data.tmpl) this.data({ tmpl: this.conf.data.tmpl });
                                if (this.conf.events) this.data({ events: this.conf.events });
                                if (this.conf.data.events) this.data({ events: this.conf.data.events });
                                return this.events();
                            }));
                            return this;
                        }),
                        (function run(k) {
                            var cell = this._cell;
                            if (!cell) {
                                cell = this._cell = this.cell();
                                this._cont.run(cell.cont());
                            }
                            return cell.get(k);
                        }),
                        (function pure() {
                            var comp = this;
                            return function $_pure(k) {
                                comp.run(k);
                            };
                        })
                    ],
                    attrs: [
                        (function of(opts) {
                            var args  = [].slice.apply(arguments);
                            var conf  = typeof args[0] == 'object' ? args.shift() : {};
                            var code  = conf.code = this.name.toDash();
                            var node  = sys.get('components');//.child(code);
                            conf.type = this.name.toCamel();
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
                    cont: function(comp, f) {
                        return function() {
                            return f.apply(comp, [].slice.call(arguments));
                        }
                    },
                    init: function(type, klass) {
                        klass.prototype.conf  = { opts: { js: true, css: false, tmpl: true } };
                        klass.prototype.$eff  = {};
                        klass.prototype.cont  = sys.get('utils.call1')(type.cont);
                        var node = klass.prototype._node = sys.get().child('components', klass);
                        klass.prototype._events = node.child('events', sys.klass('Events'));//klass.of(type, klass));
                        klass.prototype.dispatcher = sys.klass('Listener').init('components').run(node);
                        klass.prototype.dom = sys.klass('Listener').init('dom');
                    }
                };
            }),
        // === Coyoneda === //
            (function Coyoneda() {
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
            (function List() {
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
                    init: function(type, klass, sys) {
                        klass.prototype.type = sys.type;
                    }
                };
            })
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
            return eff.runDefs(eff, defs(unit)).chain(function(result) {
                sys.eff = eff.getOperation('js.nodes.fn').chain(function(op) {
                    return op.run(eff)('runOperation');
                });
            });
        }),
 
        [(function CreateSetup(createInstruction, createHandler, createFn, createEnv, createEffects) {
            return function(root, sys) {
                return root.child('effects', createEnv.call({
                    sys: sys,
                    handler: createInstruction.call(
                        createFn(sys).call(createHandler.call(sys))
                    )
                }));
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
            Handler.prototype.env  = Handler.env  = this.root;
            Handler.prototype.just = Handler.just = this.make('Maybe').get('klass').$of();
            Handler.prototype.init = function(node, method, type, action, result) {
                return this.just(this.fn[method]).map(function(runInit) {
                    return runInit(type, node.get(action), result);
                }).unit();
            };
            Handler.of = function(env) {
                return new Handler(env);
            };
            return Handler;
        }),

        [(function CreateFn(wrap, create, fn) {
            return function(sys) {
                return wrap(fn(create(sys, sys.type('Maybe').get('klass')), sys.root.get('utils.point')));
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

        (function CreateLookup(sys, maybe) {
            return function(type) {
                return maybe.of(sys.type(type)).chain(function(item) {
                    if (!item) return maybe.of(item);
                    return item.isType ? (item.klass || sys.make(item.name)) : (item.get ? item.get('klass') : maybe.of(item));
                });
            }
        }),

        (function fn(get, base) {
            function just(type, value) {
                return type.is && type.of ? type.of(value) : get(type).pure(value);
            };
            function cast(type) {
                var ctor = type.is ? type : get(type);
                return function(value) {
                    return value && value instanceof ctor ? value : ctor.pure(value);
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
        })],

        (function CreateEnv() {
            return this.sys.type('Node').get('klass').extend({
                name: 'Env',
                parent: 'Node',
                ctor: function(opts) {
                    this.__super__.call(this, opts);
                    this._handler = this.Handler.of(this);
                },
                ext: [
                    this.handler,
                    (function isInstruction(value) {
                        return this._handler.isInstruction(value);
                    }),
                    (function getHandler(prop) {
                        return this._handler.fnx(prop);
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
                        var node = this.ensure(path);
                        node.parse(op, true);
                        return this;
                    }),
                    (function runOperation(path) {
                        return this.getOperation(path).chain(unit);
                    }),
                    (function getNode(location) {
                        var loc = this.maybe(this.walk(location, function(value, key, node) {
                            return node.lookup('factory').chain(function(factory) {
                                return factory.get(key) ? node.is(value) : false;
                            });
                        }));
                        if (loc && loc.unit && (loc = loc.unit()) && loc.ref) return loc.ref();
                        else return loc;
                    }),
                    (function getFactory() {
                        var args = [].slice.apply(arguments);
                        var node = args.length && this.is(args[0]) ? args.shift() : this.getNode(args.shift());
                        return node.parent('factory').lookup(node.cid()).orElse(node.parent('factory.defaults'));
                    }),
                    (function getAction(location) {
                        return this._handler(location);
                    }),
                    (function eachOperation(location, init) {
                        var node = location && this.is(location) ? location : this.getNode(location), base = this;
                        var path = node.identifier(true).slice(this.level(node));
                        var data = node.map(function(v, k, n) {
                            return base.getOperation(path.concat(k).join('.'), init);
                        });
                        return this._handler.just(data);
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
                                var options = factory.get(action).values(true).orElse({}).unit();
                                if (options.args) {
                                    node.set(action, node.get(action).call(sys, sys.get().store().select(options.args)));
                                }
                                var method  = parts.length ? parts.shift() : (options.method || node.get('method') || 'just');
                                var result  = parts.length ? parts.shift() : options[method];
                                return env.initOperation(env._handler.create({
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
                            handler: this._handler,
                            type:    type,
                            method:  method,
                            action:  action
                        }, function(op) {
                            return op._handler.init(op.type, op.method, op.action);
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
            }).make().get('klass');
        })],

        (function CreateEffects() {
            // target - environment operations - list of instructions
            return [].slice.call(arguments).map(function(x) {
                return x;
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
                                return base.effects.ref().parseDefs(defs instanceof Array ? defs : [ defs ]);
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
                                args: [ 'effects' ],
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
                        (function(make) {
                            return function lookup(node) {
                                return make(typeof node == 'string' ? sys.get(node) : node);
                            }
                        })(
                            (function make(node) {
                                return function(key) {
                                    return node.lookup(key);
                                }
                            })
                        ),
                        (function fn(node) {
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
                        })
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
                        (function script() {
                            return [].slice.call(arguments).apply();
                        })(
                            (function(engine, handler, request, loader, wrap, set, extend, tmpl, cont) {
                                return function script() {
                                    return cont(wrap(handler({
                                        components: 'extend',
                                        templates: 'tmpl'
                                    }, engine({
                                        components: 'loader',
                                        modules: 'loader',
                                        models: 'loader',
                                        templates: 'request',
                                        libs: 'loader',
                                        core: 'loader'
                                    }, {
                                        cont: this.klass('Cont'),
                                        cell: this.klass('Cell'),
                                        set: set, extend: extend, unit: $const(unit), tmpl: tmpl,
                                        request: request.call(this).make().get('klass'),
                                        loader: loader.call(this).make().get('klass'),
                                        store: this.get().child('script')
                                    }))));
                                }
                            }),
                            (function engine(map, vals) {
                                vals.engine = function(type) {
                                    return vals[map[type]||'loader']
                                };
                                return vals;
                            }),
                            (function handler(map, vals) {
                                vals.handler = function(type) {
                                    return vals[map[type]||'unit']
                                };
                                return vals;
                            }),
                            (function request() {
                                return this.klass('Cont').extend(
                                    function RequestCont(mv, mf) {
                                        this.__super__.call(this, mv, mf);
                                        this.mf = this.mf.bind(this);
                                    }, {
                                        mf: this.get('utils.xhr')('request')
                                    }
                                ).make();
                            }),
                            (function loader() {
                                return this.klass('Cont').extend(
                                    function ComponentCont(mv, mf) {
                                        this.__super__.call(this, mv, mf);
                                        this.mf = this.mf.bind(this);
                                    }, {
                                        mf: function mf(loc) {
                                            return function $_pure(k) {
                                                if (loc == 'pure') k(sys);
                                                else require([ loc ], function(v) {
                                                    k(v);
                                                });
                                            };
                                        }
                                    }
                                ).make();
                            }),
                            (function wrap(base) {
                                return function script(location) {
                                    var full = location.split('.');
                                    var path = full.first().split('/');
                                    var ext  = (full.length > 1 || full.push('js')) && full.last();
                                    var type = ext == 'tmpl' ? 'templates' : path.first();
                                    var cell = base.store.get(path.join('.'), ext);
                                    if (!cell) {
                                        var store = base.store.ensure(path, true);
                                        cell = store.set(ext, base.cell.of());
                                        base.engine(type).of(location).run(base.set(base.cont, cell, base.handler(type)(store)));
                                    }
                                    return cell;
                                }
                            }),
                            (function set(cont, cell, map) {
                                return function $set(result) {
                                    if (cont.is(result)) {
                                        result.run($set);
                                    }else {
                                        cell.set(map(result));
                                    }
                                }
                            }),
                            (function extend(store) {
                                var path = store.identifier(true);
                                var name = path.last().toCamel();
                                var comp = sys.get('types', name, 'type') || sys.klass('Component').extend(name).make();
                                var xtnd = sys.get('utils.extend');
                                return function(result) {
                                    var proto = comp.get('proto');
                                    if (result.ext) {
                                        result.ext.deps = sys.get().store().path.bind(result.deps());
                                        comp.ext(result.ext, proto);
                                    }
                                    if (result.events) {
                                        proto.conf = xtnd({}, proto.conf);
                                        proto.conf.events = xtnd(xtnd({}, proto.conf.events || {}), result.events);
                                    }
                                    if (result.data) {
                                        proto.conf.data = xtnd(xtnd({}, proto.conf.data || {}), result.data);
                                    }
                                    if (result.tmpl) {
                                        xtnd(proto.conf.data || (proto.conf.data = {}), { tmpl: result.tmpl });
                                    }
                                    return comp.get('klass');
                                };
                            }),
                            (function tmpl(store) {
                                return function(template) {
                                    var elem = document.createElement('div');
                                    elem.innerHTML = template;
                                    var list = elem.children;
                                    var node = store.child('data');
                                    for (var i = 0; i < list.length; i++) {
                                        node.set(list[i].id, list[i].innerHTML.trim());
                                    };
                                    return node;
                                }
                            }),
                            (function cont(make) {
                                return function script(location) {
                                    return sys.klass('Cont').of(location).bind(function(loc) {
                                        return function $_pure(k) {
                                            return make(loc).get(k);
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
                            script: {
                                args: [ 'utils.xhr as xhr' ]
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
                        (function makeEnqueue(makeWrap, makeOf, makeBind, makeSetRes, makeResult) {
                            return function enqueue() {
                                return makeWrap(makeOf({
                                    scripts: sys.eff('io.request.script').init(),
                                    components: sys.eff('sys.loader.component').init(),
                                    modules: sys.eff('sys.loader.component').init(),
                                    models: sys.eff('io.request.script').init(),
                                    styles: sys.eff('io.request.style').init(),
                                    templates: sys.eff('io.request.script').init()
                                }, sys.klass('Obj'), makeBind, makeSetRes, makeResult));
                            }
                        })(
                            (function makeWrap(of, set, res) {
                                return function enqueue(def, run) {
                                    return of(def, run, {}).cont();
                                }
                            }),
                            (function makeOf(eff, obj, bind, set, wrap) {
                                return function(def, run, res) {
                                    return obj.of(def).bind(bind(eff, set, res)).chain(wrap(run, res));
                                }
                            }),
                            (function makeBind(eff, set, r) {
                                return function(x, v, k, i, o, l) {
                                    if (l > 1) {
                                        return v;
                                    }else if (k == 'name') {
                                        r[k] = v;
                                    }else if (k == 'components' || k == 'modules' || k == 'models') {
                                        var res = r[k] = {};
                                        return v.map(function(def, type) {
                                            var args = def instanceof Array ? def : [ def ];
                                            var name = args.shift(), opts = args.length ? args.shift() : { js: true };
                                            var path = k + '/' + (name.indexOf('/') > 0 ? name : (name + '/' + name));
                                            return res[name] = eff[k].run(path).bind(set(res, name)).cont();
                                        });
                                    }else if (k == 'core' || k == 'helpers') {
                                        var res = r[k] = {};
                                        return v.map(function(name) {
                                            return name == 'pure' ? sys.fn.pure((res[name] = sys))
                                                : eff.scripts.run(k + '/' + name).bind(set(res, name)).cont();
                                        });
                                    }else if (k == 'scripts' || k == 'styles' || k == 'templates') {
                                        var res = r[k] = {};
                                        return v.map(function(name) {
                                            var path = name.split('/');
                                            if (k == 'templates') {
                                                if (name == 'tmpl' && r.name && (name = r.name)) path = [ 'components', name, name ];
                                                else if (path.length < 2) path.unshift('templates');
                                                path.push(path.pop()+'.tmpl');
                                            }else {
                                                if (path.length < 2) path.unshift('libs');
                                                if (path.length < 3) path.push(name);
                                            }
                                            return eff[k].run(path.join('/')).bind(set(res, name)).cont();
                                        });
                                    }
                                    return v;
                                };
                            }),
                            (function makeSetRes(res, name) {
                                return function(result) {
                                    return res[name] = result;
                                }
                            }),
                            (function makeResult(run, deps) {
                                return function() {
                                    var res  = run(deps);
                                    res.deps = $const(deps);
                                    if (res.init) {
                                        return res.init();
                                    }
                                    return res;
                                }
                            })
                        ),
                        (function component(ref) {
                            var path = ref.split('/');
                            var name = path.last();
                            var type = name.toCamel();
                            var comp = sys.get('types', type, 'type') || sys.klass('Component').extend(type).make();
                            var cont = sys.eff('io.request.script').run(path.length == 3 ? ref : [ 'components', name, name ].join('/'));

                            var make = comp.get('klass').create = function(opts) {
                                return comp.get('klass').of(opts).make(cont);
                            };

                            if (path.length > 1) {
                                return type == 'xAccordion' ? cont.of(comp, function(cmp) {
                                    return function $_pure(k) {
                                        cmp.get('klass').create('main').run(k);
                                    }
                                }) : cont;
                            }else {
                                return make;
                            }
                        }),
                        (function module(name) {
                            return sys.eff('io.request.script').run([ 'modules', name, name ].join('/'));
                        }),
                        (function model(name) {
                            return sys.eff('io.request.script').run([ 'models', name, name ].join('/'));
                        })
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
