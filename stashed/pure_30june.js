(function() {
    // ==== pure(1, true) applys: [0].apply(undefined, [].slice(1)) ======= //
    return (self.sys = [].slice.call(arguments).apply().store('sys').run);
})(

    (function MakeApp(_) {
        return _.apply(undefined, [].slice.call(arguments, 1));
    })(
        (function run(init, parse) {
            return function(sys, root) {
                return parse.apply(init(sys, root), [].slice.call(arguments, 2));
            }
        }),
        (function init(sys, base) {
            var trans = base.shift().apply(sys, base);
            var root  = trans.store().root;
            sys.klass = trans.ctor.find.bind(trans.ctor);
            sys.find  = root.find.bind(root);
            trans.store('sys', trans.unit(root.set('sys', sys)));
            return trans;
        }),
        (function parse() {
            return this.lift([].slice.call(arguments)).run(function(root) {
                this.run(function(items) {
                    items.reduce(function(r, v) {
                        v.shift().apply(r, v);
                        return r;
                    }, root);
                });
                return root;
            }).run(this);
        })
    ),

    (function MakePure() {
        // ===== expose pure to array and pass it on ==== //
        return [].slice.call(arguments).shift();
    })(
        (function core(s, u, c, e, r, n, p) {
            return { fn: s.call({}, self.unit = u, self.$const = c, self.extract = e, p, r, n) };
        })(
            (function sys(u, c, e, p, r, n) {
                this.unit    = u;
                this.$const  = c;
                this.extract = e;
                this.pure    = p;
                this.curry   = r;
                this.now     = n;
                return this;
            }),
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
            (function extract(fn) {
                return fn(unit);
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
            (self.now = (function(run) {
                return run();
            })(
                (function() {
                var perf = self.performance;
                if (perf && (perf.now || perf.webkitNow)) {
                    var perfNow = perf.now ? 'now' : 'webkitNow';
                    return perf[perfNow].bind(perf);
                }else { return Date.now; }
            }))),
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
                    String.prototype.isLowerCase = function(from, to) {
                        return typeof from == 'number' ? this.substr(from, to || (this.length - from - 1)).isLowerCase() : (this.toLowerCase() == this);
                    };
                    String.prototype.isUpperCase = function(from, to) {
                        return typeof from == 'number' ? this.substr(from, to || (this.length - from - 1)).isUpperCase() : (this.toUpperCase() == this);
                    };
                    String.prototype.toCamel = function(){
                        return this.length < 3 ? this.toLowerCase() : this.replace(/\$/g, '').replace(/(^[a-z]{1}|\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
                    };
                    String.prototype.toDash = function() {
                        return this.length < 2 ? this.toLowerCase() : this.replace(/([A-Z])/g, function($1, p1, pos){return (pos > 0 ? "-" : "") + $1.toLowerCase();});
                    };
                    String.prototype.toTypeCode = function() {
                        return [ '$', this.toLowerCase().split('$').pop().toDash() ].join('');
                    };
                    String.prototype.toTypeName = function() {
                        return this.replace(/-/g, '').replace('$', '').substr(0, 1).toUpperCase() + this.slice(1);
                    };
                    String.prototype.toRegular = function() {
                        return this.length ? this.toTypeCode().replace('$', '') : '';
                    };
                    String.prototype.toKey = function() {
                        return this.length ? this.substr(0, 1).toLowerCase().concat(this.slice(1)) : this;
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
                    this.prototype.obj = function() {
                        var values = [].slice.call(arguments).flat();
                        return this.reduce(function(r, v, i) {
                            if (!v) return r;
                            else if (values.length) r[v] = values[i];
                            else if (v.name) r[v.name] = v;
                            return r;
                        }, {});
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
                    this.range = function(m, n) {
                        return Array.apply(null, Array(n - m + 1))
                        .map(function (n, x) {
                            return m + x;
                        });
                    };
                }).call(Array)
            )
        )
    ),

    (function MakeRootTransformer() {

        return [].slice.call(arguments);
    })(
        // === INIT === //
            (function(CTOR, Data, Store, Linq, Context, Functor, Compose, Coyoneda, Reader, Cont, Transformer) {

                var $Base    = CTOR.shift().apply(this, CTOR);
                var $CTOR    = new $Base($Base);
                var $Data    = $CTOR.parse(Data);
                var $Store   = $CTOR.parse(Store);

                $Data.add();
                $Store.add();

                var $Types   = $CTOR.$store;
                var $Root    = $Types.root;
                $Types.set('type', $CTOR);
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
        // === CTOR === //
            (function CTOR() {
                return [].slice.call(arguments);
            })(
                (function(ctor, proto, make, named, base) {
                    base.prototype.sys = this.fn.$const(this);
                    return named.call(make.call(proto.call({ ctor: ctor, base: base })));
                }),
                (function $CTOR(ctor, attrs, parent) {
                    this.ctor(ctor, attrs, parent);
                }),
                (function() {
                    this.ctor.prototype = {
                        constructor: this.ctor,
                        of: function(ctor, attrs, parent) {
                            return new this(ctor, attrs, parent);
                        },
                        is: function(value) {
                            if (this.__) return value && value instanceof this.__;
                            else if (this.$ctor && this.$ctor.__) return value && value instanceof this.$ctor.__;
                            else if (this.$ctor) return value && value instanceof this.$ctor;
                        },
                        base: this.base,
                        sys: this.base.prototype.sys,
                        ctor: function(ctor, attrs, parent) {
                            this.$ctor = ctor;
                            this.$code = this.constructor.name.toLowerCase();
                            this.prop('id', this.makeID(ctor.name.replace('$', '').substr(0, 2).toUpperCase()));
                            this.init(ctor, attrs, parent);
                        },
                        init: function(ctor, attrs, parent) {
                            if (this instanceof ctor) {
                                ctor.prototype._level = 0;
                                ctor.prototype.root = $const(this);
                                ctor.prototype.tid = this.makeID(100000);
                            }else {
                                if (parent) this._parent = parent.$code;
                                this.constructor.prototype._level = parent ? (parent._level + 1) : 0;
                                ctor.ctor = ctor.prototype.ctor = this.add();
                            }
                            if (!ctor.prototype.$super) ctor.prototype.$super = this.$super;
                            if (attrs && attrs instanceof Function) {
                                ctor.prototype.ctor = attrs;
                            }else if (typeof attrs == 'object') {
                                this.mixin(attrs, ctor);
                            }
                            if (!ctor.of) ctor.of = parent ? parent.$ctor.of : this.of;
                            this.of = this.$ctor.$of = ctor.of.bind(ctor);
                            if (ctor.pure) this.pure = ctor.$pure = ctor.pure.bind(ctor);
                            else this.pure = ctor.$pure = this.of;
                            if (ctor.lift) this.lift = ctor.$lift = ctor.lift.bind(ctor);
                            if (!ctor.prototype.to) ctor.prototype.to = this.to;
                            if (!ctor.prototype.is) ctor.prototype.is = this.is;
                        },
                        parent: function(name) {
                            var type = name ? this.find(name) : this;
                            var prnt = this.find(type._parent);
                            var args = [].slice.call(arguments, 1);
                            return prnt ? (args.length ? prnt.get(args.join('.')) : prnt) : null;
                        },
                        add: function() {
                            var parent = this.parent();
                            if (parent && parent.$store) this.$store = parent.$store.child(this.$code);
                            if (this.$store) this.$index.set(this.$code, this.$store.set('type', this).$store.uid());
                            return this;
                        },
                        mixin: function(items, target, values) {
                            if (!(items instanceof Array && typeof items == 'object'))
                                return this.mixin(Object.keys(items), target, items)

                            return items.reduce(function(r, v) {
                                if (values && values[v]) {
                                    r[v] = typeof values[v] == 'object' && values[v].value ? values[v].value : values[v];
                                }else {
                                    r[v.name] = typeof v == 'object' && v.value ? v.value : v;
                                }
                                return r;
                            }, target);
                        },
                        create: function(/* name, ctor */) {
                            var args = [].slice.call(arguments);
                            var ctor = args[0] instanceof Function ? args.shift() : (args.length > 1 ? args.pop() : null);
                            var name = typeof args[0] == 'string' ? args.shift() : (ctor ? ctor.name : this.$ctor.name);
                            var child = this.named(name);
                            child.prototype = { constructor: child, ctor: ctor };
                            return this.extend(child);
                        },
                        inherit: function(ctor, parent) {
                            var F = function() {};
                            F.prototype = parent.prototype;
                            var proto = new F(), keys = Object.keys(ctor.prototype);
                            if (keys.length && ctor.prototype.constructor == ctor) {
                                ctor.prototype = keys.reduce(function(r, k, i, o) {
                                    r[k] = ctor.prototype[k];
                                    return r;
                                }, proto);
                            }else {
                                proto.constructor = ctor;
                                ctor.prototype = proto;
                            }
                            return ctor;
                        },
                        make: function(ctor, proto) {
                            if (proto && proto instanceof Function) {
                                return proto.call(ctor, this.sys);
                            }else if (proto && typeof proto == 'object') {
                                this.mixin(proto, ctor.prototype);
                                ctor.prototype.constructor = ctor;
                            }
                            return ctor;
                        },
                        child: function(ctor, proto, attrs) {
                            var klass = this.inherit(this.named(('$'+ctor.name).replace('$$', '$'), true, true), this.constructor);
                            var $ctor = ctor instanceof Function ? ctor : this.named(ctor.name.toTypeName(), false, false, true);
                            klass.$ctor = this.make(this.$code != '$ctor' ? this.inherit($ctor, this.$ctor) : this.inherit($ctor, this.base), proto);
                            return klass;
                        },
                        extend: function(ctor, proto, attrs) {
                            var child  = ctor instanceof Function ? ctor : (typeof ctor == 'string' ? { name: ctor } : 'Child');
                            var exists = this.$store ? this.$store.get(child.name.toTypeCode()) : null;
                            if (exists) return exists.get('type');
                            var klass  = this.child(child, proto, attrs);
                            if (!klass.$ctor.prototype.__) klass.$ctor.prototype.__ = klass.$ctor;
                            if (!klass.$ctor.prototype.kid) klass.$ctor.prototype.kid = this.kid;
                            return new klass(klass.$ctor, attrs, this);
                        },
                        parse: function(def) {
                            var type  = def instanceof Function ? def.call(this) : def;
                            var ctor  = type.klass || type.ctor;
                            var proto = type.ext instanceof Function ? type.ext.call(this.sys()) : type.ext;
                            var attrs = type.attrs;
                            var klass = this.extend(ctor, proto, attrs);
                            if (type.init) type.init.call(this, type, klass, this.sys());
                            return klass;
                        },
                        $super: function() {
                            var level = this.__level__ || 0, parent = this.ctor;
                            if (level++ < this.ctor._level) {
                                while (level--) {
                                    parent = parent.parent();
                                }
                                this.__level__ = this.ctor._level - parent._level;
                                if (parent._level) {
                                    parent.$ctor.apply(this, arguments);
                                }
                            }
                        },
                        find: function() {
                            var args = [].slice.call(arguments).join('.').split('.');
                            var name = args.shift().toTypeCode();
                            var path = args.length ? args.join('.') : '';
                            if (name == '$ctor') {
                                var res = this.root();
                                if (path) res = res.$store.get(path);
                            }else {
                                var uid = this.$index.get(name);
                                var res = uid ? this.$index.find(uid, true) : null;
                                if (res) res = res.get(path || 'type');
                            }
                            return res;
                        },
                        get: function(prop) {
                            return this.$store.get(prop);
                        },
                        set: function(prop, value) {
                            return this.$store.set(prop, value);
                        },
                        proto: function(name) {
                            var $ctor = name ? this.find(name, 'type.$ctor') : this.$ctor;//this.get('type.$ctor');
                            if ($ctor) return $ctor.prototype;
                        },
                        ext: function(ext) {
                            return this.mixin(ext, this.$ctor.prototype);
                        },
                        prop: function(name, value) {
                            return value ? (this.$ctor.prototype[name] = value) : this.$ctor.prototype[name];
                        },
                        fromConstructor: function() {
                            var args = [].slice.call(arguments);
                            return args.length > 1 ? this.$ctor[args.shift()].apply(this.$ctor, args) : this.$ctor[args.shift()].call(this.$ctor);
                        },
                        item: function(name) {
                            var args = [].slice.call(arguments).join('.').split('.');
                            if (args.length < 2 && args[0]) return this.get('items', args.first()) || this.find(args.first(), 'items.' + args.first().toRegular());
                            else if (args.length < 3 && args.insert(1, 'items')) return this.find(args.join('.'));
                            else if (args.length) return this.find(args.shift()).item(args.join('.'));
                        },
                        type: function(name, fn) {
                            var type = this.get(name);
                            return type ? (fn ? type[fn] : type) : unit;
                        },
                        test: function(ctor) {
                            if (!ctor) return false;
                            else if (!ctor.prototype) return this.test(ctor.constructor);
                            return ctor.prototype && ctor.prototype.__ === this.$ctor.prototype.__ ? true : false;
                        },
                        ap: function(x) {
                            return x.map ? x.map(this.bind(function(comp, fn) {
                                return fn(comp);
                            })) : (x instanceof Function ? this.maybe(this).lift(x) : this.maybe(x).lift(this.bind(function(c, x, f) {
                                return f(x, c);
                            })));
                        },
                        to: function(type, fn) {
                            return this.map(this.sys().klass(type).pure);
                        }
                    };
                    return this.ctor;
                }),
                (function(set, makeWithPrefix, makeWithoutPrefix) {
                    return set(function(prefix, start) {
                        return prefix === false ? makeWithoutPrefix({ start: start || 1000000, id: start || 1000000 })
                            : makeWithPrefix({ prefix: prefix, start: start || 1000000, id: start || 1000000 });
                    });
                })(
                    (function set(makeID) {
                        return function() {
                            this.prototype.makeID = makeID;
                            this.prototype.id = makeID('CT');
                            this.prototype.kid = makeID('', 100000);
                            return this;
                        }
                    }),
                    (function MakeID(counter) {
                        return function() {
                            return (counter.prefix + counter.id++);
                        }
                    }),
                    (function MakeID(counter) {
                        return function() {
                            return counter.id++;
                        }
                    })
                ),
                (function() {

                    return [].slice.call(arguments).apply();
                })(
                    (function(build, make, result, wrap) {
                        return function() {
                            this.prototype.named = wrap(build(make), result);
                            return this;
                        }
                    }),
                    (function(pure) {
                        var args = [];
                        var next = (function(f) { return f(args.shift()); });

                        var tmpl = [ 
                            pure('(function Make'), next, pure('() {'),
                                pure('return function '), next, pure('() {'),
                                    pure(' this._id = this.id();'),
                                    pure(' this.ctor.apply(this, arguments);'),
                                    pure(' this.$super.apply(this, arguments);'),// this.__level__ && !(this.__level__ = 0);'),
                                    pure(''),//this.__super__.apply(this, arguments);'),
                                    pure(''),//return this;'),
                                pure('}})();') ];

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
                    (function(text) {
                        try {
                            return eval(text);
                        }catch(e) {

                        }
                    }),
                    (function(make, result) {
                        return function named() {
                            return result(make.apply(undefined, [].slice.call(arguments)));
                        }
                    })
                ),
                (function() {
                    this.prototype = {
                        constructor: this,
                        klass: function(name) {
                            return this.ctor.find(name);
                        }
                    };
                    return this;
                }).call((function Base() {}))
            ),
        // === Data === //
            (function() {
                return {
                    klass: function Data() {
                        this._base  = this._uid = this.root.base;
                        this._id    = this._uid;
                        this._ref   = this.root.val;
                        this._cache = {};
                    },
                    ext: [
                        (function root() {
                            return { name: 'root', base: 1000000, val: [] };
                        })(),
                        (function $locate(nid, loc) {
                            var uid = nid - this._base;
                            var idx = 0, lvl = 0, div = 1000, val = this._ref;
                            while (val && ++idx < 4) {
                                lvl = uid < div ? 0 : ((uid - uid%div) / div);
                                uid = uid - (div * lvl); div = div / 10;
                                while (val.length <= lvl) { val.push([]); }
                                if (loc) loc.push(lvl);
                                val = val[lvl];
                            }
                            return loc || val;
                        }),
                        (function $load(loc) {
                            return this._ref[loc[0]][loc[1]][loc[2]];
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
                            return val ? (full ? val[nid%10] : val[nid%10][1]) : null;
                        }),
                        (function cached(nid, full) {
                            if (!this.check(nid)) return;
                            var val = this.$load(this._cache[nid] || (this._cache[nid] = this.$locate(nid, [])));
                            return val ? (full ? val[nid%10] : val[nid%10][1]) : null; 
                        }),
                        (function retrieve(nid, cached) {
                            return cached ? this.cached(nid) : this.find(nid);
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
                        })
                    ],
                    add: function(root) {
                        return function(store) {
                            return root.add(store);
                        };
                    },
                    data: function(type, klass, add) {
                        return function(fn) {
                            return fn((klass.constructor.prototype.$store = new klass.$ctor()), add);
                        }
                    },
                    init: function(type, klass, sys) {
                        this.$data = type.data(this, klass, type.add);
                    }
                };
            }),
        // === Store === //
            (function() {
                return {
                    klass: function Store(ref, name) {
                        this._val = this.$data(this);
                        this._cid = name || 'root';
                        this._ids = [];
                        this._map = {};
                        if (ref) this._ref = this.is(ref.parent) ? ref.parent : ref;
                    },
                    ext: [
                        (function cid() {
                            return this._ref ? this._ref.cid() : this._cid;
                        }),
                        (function uid() {
                            return this._uid;
                        }),
                        (function nid() {
                            return ''+this._uid;
                        }),
                        (function of(ref, ctor, name) {
                            return ctor ? new ctor(ref, name) : new this.constructor(ref, name);
                        }),
                        (function is(value) {
                            return value && value instanceof this.__;
                        }),
                        (function identifier(asArray, recalc) {
                            return this._ref ? this._ref.identifier(asArray, recalc) : this._identifier(asArray, recalc);
                        }),
                        (function store() {
                            return this;
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
                            else return typeof key == 'string' ? this._val[this._map[key]] : this._ref;
                        }),
                        (function initial(key) {
                            var ref = this._ref;
                            while (ref && ref instanceof this.constructor) {
                                ref = ref._ref;
                            }
                            return key ? ref.get(key) : ref;
                        }),
                        (function current() {
                            return this.get(this.get('key')||'vals');
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
                        (function has(key) {
                            return this.index(key) >= 0 ? true : false;
                        }),
                        (function set(key, value) {
                            return (this._val[(this._map[key] >= 0 ? this._map[key] : (this._map[key] = (this._ids.push(key)-1)))] = value);
                        }),
                        (function push(key, value) {
                            return arguments.length > 1 ? ((this.get(key) || this.set(key, [])).push(value)) : this.push('vals', key);
                        }),
                        (function add(name, ref) {
                            return this.set(name, this.is(ref) ? ref : this.constructor.of(ref || this, name));
                        }),
                        (function child(name, ctor, ref) {
                            var opts = typeof name == 'object' ? name : {};
                            if (typeof name == 'string') opts.name = name;
                            else if (name && name.name) opts.name = name.name;
                            return this.get(opts.name) || this.set(opts.name, this.of(this, ctor, name));
                        }),
                        (function node(name, ref) {
                            return this.child(name, this.__, ref);
                        }),
                        (function ref(value) {
                            return value ? (this._ref = value) : this._ref;
                        }),
                        (function length() {
                            return this._val.length;
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
                                idxs = sys().get('utils.values')(node._map),
                                keys = sys().get('utils.keys')(node._map),
                                val  = [].concat(node._val.splice(0)),
                                pos  = 0,
                                del  = [],
                                tmp;

                                node._map = {};
                                node._ids.splice(0);
                                while(pos < val.length) {
                                    if (id != keys[pos]) {
                                        tmp = val[idxs[pos]];
                                        if (tmp.isStore) node.add(keys[pos], tmp);
                                        else node.set(keys[pos], tmp);
                                    }else {
                                        del.push([ keys[pos], val[idxs[pos]] ]);
                                    }
                                    pos++;
                                }
                                return del.reduce(function(r, v, i) {
                                    r[v[0]] = v[1].isStore ? v[1].values() : v[1];

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
                                arr.push(f(v,store._ids[i],i,store));
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
                        (function find(value, cached) {
                            return value ? this.db.retrieve(typeof value == 'object' ? (value._uid || value._id || value.uid) : value, cached) : null;
                        }),
                        (function info(/* recur, msg, opts */) {
                            var args  = [].slice.call(arguments);
                            var recur = (args.length && typeof args[0] == 'boolean' ? args.shift() :
                                        (args.length && typeof args[args.length-1] == 'boolean' ? args.pop() : false));
                            var msg   = (args.length && typeof args[0] == 'string' ? args.shift() : '');
                            var opts  = (args.length && typeof args[0] == 'object' ? args.shift() : null);
                            var count = 0, bind = this.bind(function(x, k, i, o) {
                                var info = msg ? [ msg ] : [];
                                if (o && o.is) {
                                    info.push(o.identifier(), k, x, i, o.uid(), o.store().is(x) ? 'store' : 'value', count);
                                }else {
                                    info.push(x, o, i, count);
                                }
                                console.log(info);
                                count++;
                                return x;
                            }, opts);
                            return recur ? bind.bind(unit, opts) : bind;
                        }),
                        (function $filter(filter, accum, wrap) {
                            return wrap(filter, accum);
                        })(
                            (function accum(r, f) {
                                return function(v, k, i, o) {
                                    return f(r, v, k, i, o);
                                }
                            }),
                            (function bind(filter, accum, recur) {
                                var count = 0;
                                return function(item) {
                                    var bind = item.bind(function(v, k, i, o) {
                                        if (filter(v && v[k] ? v[k] : v, k, i, o, count++)) {
                                            accum(v && v[k] ? v[k] : v, k, i, o);
                                        }
                                        return v;
                                    });
                                    return recur ? bind.bind(unit) : bind;
                                }
                            }),
                            (function wrap($accum, $bind) {
                                return function filter(f_filter, f_accum, result, recur) {
                                    return function(item) {
                                        return $bind(f_filter, $accum(result, f_accum), recur)(item).chain($const(result));
                                    }
                                }
                            })
                        ),
                        (function object(k) {
                            return { '$$': true, value: this.get(k), key: k, index: this.index(k), ref: this.identifier(), object: this };
                        }),
                        (function search(expr, recur) {
                            return this.vals().select(function(x) {
                                if (!x) return false;
                                else if ((typeof x == 'string' && x.like(expr))
                                  || (x.key && typeof x.key == 'string' && x.key.like(expr))
                                    || (x.ref && typeof x.ref == 'string' && (x.ref.like(expr) || x.ref.concat('.', x.key).like(expr)))) {
                                    return true;
                                }
                            }, function(x) {
                                var o = x && x['$$'] ? x.value : x;
                                return o && o.vals && o.length() ? (recur ? o.map(function(v, k, i, o) {
                                    return o.object(k);
                                }) : o.parent().object(o.cid())) : x; 
                            });
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
                        )
                    ],
                    attrs: [
                        (function of(ref, name) {
                            return new this(ref, name);
                        })
                    ],
                    make: function(klass) {
                        return function(root, data) {
                            return function(store) {
                                return (klass.$ctor.prototype.$data = data(unit(klass.$ctor.prototype.db = root)))(store);
                            }
                        }
                    },
                    init: function(type, klass, sys) {
                        klass.$ctor.prototype.isStore = true;
                        klass.$ctor.prototype.$data = this.$data(type.make(klass));
                        sys.root  = klass.$ctor.prototype.root = unit(new klass.$ctor());
                        var store = this.constructor.prototype.$store = sys.root.child('types');
                        var index = this.constructor.prototype.$index = store.child('index');
                    }
                };
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
        // === Reader === //
            (function() {
                return {
                    klass: function Reader(f) {
                        this.$super.call(this, f);
                    },
                    ext: [
                        (function $$init(f) {
                            this._f = f;
                        }),
                        (function $$meta(curr, next, type, value) {
                            curr.$context.parse({ curr: curr, next: next, type: type, value: value });
                            return next;
                        }),
                        (function of(f) {
                            return this.$$meta(this, new this.constructor(f || unit), 'of');
                        }),
                        (function ask() {
                            return this.of(unit);
                        }),
                        (function asks(fn) {
                            return this.of(fn);
                        }),
                        (function unit(ctx) {
                            return this.of($const(ctx));
                        }),
                        (function store(key, value) {
                            return typeof value == 'undefined' ? (!key ? this.$store : this.$store.get(key)) : (this.$store.set(key, value));
                        }),
                        (function map(f) {
                            return this.of(this.$fn(this._f)(f));
                        }),
                        (function run(ctx) {
                            return this._f(ctx);
                        })
                    ],
                    attrs: [
                        (function of(f) {
                            return new this(f);
                        }),
                        (function pure(x) {
                            return x instanceof Function ? new this(x) : this.$pure(x);
                        }),
                        (function fromStore(store) {
                            var name = store.cid().toCamel().concat('R');
                            var extR = this.ctor.extend(name, { $store: store });
                            return extR.of(unit);
                        })
                    ],
                    bind: function(ctx, k, h) {
                        return new ctx.constructor(function(r) {
                            return Function.prototype.call.bind(h(k))(ctx, ctx.run(r)).run(r);
                        }.bind(ctx));
                    },
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
                    init: function(type, klass, sys) {
                        klass.$ctor.$pure = type.$pure;
                        klass.prop('$$kont', klass.$store.node('$$cache').node('$$kont'));
                        klass.prop('$context', klass.root().get().child('context', klass.find('Context').$ctor));
                        klass.prop('bind', type.$bind);
                    }
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
    ),

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
        // === Parse === //
            (function() {

                return [].slice.call(arguments).flat().apply();
            })(
                // === Create parse & import combined === //
                    (function(parseArgs, getArgs, makeArgs, importFuncs) {
                        return function(utils) {
                            utils.set('parseArgs', parseArgs);
                            utils.set('getArgs', getArgs);
                            utils.set('makeArgs', makeArgs);
                            utils.set('importFuncs', importFuncs.bind(utils));
                            return utils;
                        }
                    }),
                // === Find $_ values === //
                    (function() {
                        var args = [].slice.call(arguments);
                        return args.slice(1).prepend(args.apply());
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
                // === Determine $_ args === //
                    (function importFuncs(items, target, values) {
                        if (!(items instanceof Array) && typeof items == 'object') return importFuncs(Object.keys(items), target, items);
                        var isStore   = target.constructor.name === 'Store' && target.set && target.get ? true : false;
                        var parseArgs = this.get('parseArgs');
                        return items.reduce(function(r, v) {
                            var func = values ? values[v] : (v.fn ? v.fn : v);
                            var name = values ? (v.name || v) : v.name;
                            var val  = name.substr(0, 2) == '$_' ? parseArgs(func, r, isStore) : func;
                            if (isStore) {
                                r.set(name.replace('$_', ''), val);
                            }else {
                                r[name.replace('$_', '')] = val;
                            }
                            return r;
                        }, target);
                    })
            ),
        // === Utils === //
            (function() {

                return [].slice.call(arguments).pure(0, true);
            })(
                // === import / parse === //
                    (function(items) {
                        return function(sys, utils) {
                            utils.set('curry', sys.fn.curry);
                            utils.set('point', items.shift().call({ curry: sys.fn.curry }));
                            utils.set('get', items.shift()(utils.get('importFuncs')(items, utils).get('path')));
                            utils.ctor.mixin([
                                { name: 'fn',     value: utils.get('func')   },
                                { name: 'select', value: utils.get('pass')(utils.get('select')) },
                                { name: 'bin',    value: utils.get('bin')    },
                                { name: 'parse',  value: utils.get('parse')  }
                            ], utils.constructor.prototype);

                            return utils;
                        }
                    }),
                    (function() {
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
                    (function get(make) {
                        return function(path) {
                            return function(obj) {
                                return make.bind({ fn: path.bind(obj) });
                            }
                        }
                    })(
                        (function() {
                            var args = [].slice.call(arguments);
                            return this.fn(args.length ? args.join('.') : undefined);
                        })
                    ),
                // === call and pass === //
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
                    (function apply(f) {
                        return function() {
                            return f.apply(this, arguments);
                        }
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
                    (function bind(a) {
                        return function(f) {
                            return function(b) {
                                return f(a, b);
                            }
                        }
                    }),
                // === ext/prop/tar/_1/maybe/tup etc etc === //
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
                    (function path(key, value) {
                        return !key ? this : key.split('.').reduce(function(result, key, idx, keys) {
                            if (!key || !result) {
                                return result;
                            }else if (!idx && result instanceof Function) {
                                result = null;
                            }else if (value && (idx == keys.length - 1)) {
                                result = result.set ? result.set(key, value) : (result[key] = value);
                            }else if (idx && keys[idx-1] == 'fn' && result[key] instanceof Function) {
                                result = result[key]();
                            }else if (key == 'fn' && result[keys[idx+1]] instanceof Function) {
                                result = result;
                            }else if (result.isStore) {
                                result = result.get(key);
                            }else if (result instanceof Array) {
                                result = result.get(key);
                            }else if (typeof result == 'object') {
                                if (result && result.get) result = result.get(key) || result[key] || result[key.replace('-', '.')];
                                else result = result[key] || result[key.replace('-', '.')];
                            }
                            return result;
                        }, this);
                    }),
                // === objPath, isBaseType, toString === //
                    (function identifier(key) {
                        function calcOnce(node) {
                            var path = [], parent = node;
                            while ((parent = parent[key])) {
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
                    (function isBaseType(value) {
                        if (!value || sys().is(value)) return false;
                        else if (typeof value == 'object') return (value.constructor === Object);
                        else if (value instanceof Function) return !value.klass || value === Function || value === Object;
                        return false;
                    }),
                    (function clone(o) {
                        if (o && typeof o == 'object' && o.constructor == Object) {
                            var r = {}; for (var key in o) {
                                if (o.hasOwnProperty(key)) {
                                    r[key] = clone(o[key]);
                                }
                            }
                            return r;
                        }else if (o && o instanceof Array) {
                            return o.map && o.map(function(v) { return clone(v); });
                        }
                        return o;
                    }),
                // === $map, $filter, $comprehension
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
                // === keys, values, object, assign, select etc etc === //
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
                            vals = [], usekeys = obj instanceof Array ? false : true,
                            useget = usekeys && obj.get && obj.get instanceof Function,
                            func = fn || unit;
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

                // === parse, select, each === //
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
                                    }else if (value.constructor != Object && value instanceof sys().ctor.base) {
                                        node.set(key.toKey(), value);
                                    }else if (recur) {
                                        run(node.child(key.toKey(), ctor), value, typeof recur == 'number' ? (recur - 1) : recur, ctor);
                                    }else {
                                        node.set(key.toKey(), value);
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
                            var name, path;
                            if (key && key.indexOf && key.indexOf('.')>0) {
                                path = key.split('.');
                                name = path.pop();
                                node = node.get(path);
                            }else {
                                name = key;
                            }
                            return node[name] && node[name] instanceof Function
                                && (!node.isStore || node.constructor.prototype[name] instanceof Function)
                                    ? node[name].bind(node) : null;
                        })
                    ),
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
                                    var name   = value.name;
                                    if (value['$$_scope']) each(keys(value['$$_scope']), function(key) {
                                        var text = toString(value['$$_scope'][key]);
                                        if (text) lines.push(name + '.$$_scope.' + key + ' = ' + text);
                                    });
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
                                    var ctor  = value.constructor;
                                    var name  = ctor.name;
                                    lines.push(toString(ctor));
                                    if (ctor.of) lines.push(name + '.of = ' + toString(ctor.of));
                                    if (ctor.pure) lines.push(name + '.pure = ' + toString(ctor.pure));
                                    each(keys(value.constructor.prototype), function(key) {
                                        var text = toString(value[key], false);
                                        if (text) lines.push(name + '.prototype.' + key + ' = ' + text + ';');
                                    });
                                    return lines.length ? lines.join(delim) : null;
                                }
                            }
                        })
                    )
            ),
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

                return [].slice.call(arguments).pure(0, true);
            })(
                // === IMPORT / PARSE === //
                    (function(items) {
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
        // === Node === //
            (function() {
                return {
                    klass: function Node(opts) {
                        this._id       = this.id();
                        this._cid      = this.extractID(opts);
                        this._cache    = {};
                        this._started  = 2;
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
                            if (this._parent._events && this._parent._events._id != this._events._id) {
                                this._events = this._parent._events;
                            }
                            if (this._parent.dispatcher && (!this.dispatcher || this._parent.dispatcher._id != this.dispatcher._id)) {
                                this.dispatcher = this._parent.dispatcher;
                            }

                            this._level  = (this._parent._level  || (this._parent._level  = 0)) + 1;
                            this._offset = (this._parent._offset || (this._parent._offset = 0)) + (opts.offset || 0);
                        }else {
                            this._store  = this._store;
                            this._store.ref(this);
                            this._level  = 0;
                            this._offset = opts.offset || 0;
                        }
                    },
                    ext: [
                        (function children() {
                            return this.get(this.ctor.prop('_children')) || this.node(this.ctor.prop('_children'));
                        }),
                        (function extractID(opts) {
                            return (typeof opts == 'string' || opts == 'number') ? opts
                                : (opts.name ? opts.name : (opts._id || opts._cid
                                    || (!(opts.id instanceof Function ? opts.id
                                : (!(opts.cid instanceof Function ? opts.cid : ''))))));
                        }),
                    // === BASE === //
                        (function main() {
                            return this;
                        }),
                        (function store() {
                            return this._store;
                        }),
                        (function of(opts, ctor) {
                            return ctor ? new ctor(opts) : new this.constructor(opts);
                        }),
                        (function is(value) {
                            return value && value instanceof this.__;
                        }),
                        (function uid() {
                            return this._store._uid;
                        }),
                        (function nid() {
                            return ''+this._store._uid;
                        }),
                        (function cid() {
                            return this._cid;
                        }),
                        (function ref(value) {
                            return value && value._ref && value._ref instanceof this.__ ? value._ref : value;
                        }),
                        (function fn() {
                            return this._store.root.get('sys.fn');
                        }),
                        (function lift(f) {
                            return this.bind(function(comp, result) {

                            });
                        }),
                        (function($args, $get) {
                            return function get() {
                                return this.ref($get(this, $args([].slice.call(arguments))));
                            }
                        })(
                            (function args(x) {
                                return x && x instanceof Array && x.length
                                    ? x.flat().join('.') : undefined;
                            }),
                            (function get(node, key) {
                                if (!key && typeof key == 'undefined') return node._store;
                                else if (key && typeof key == 'string' && (node.has(key))) return node._store.get(key);
                                else if (key && typeof key == 'number') return node._store.at(key);
                                else if (key && key.indexOf && key.indexOf('.') > 0) return node._store.path(key);
                                else if (key && key instanceof Array) return key.length > 1 ? node._store.path(key) : (key.length ? node.get(key.slice(0).shift()) : node);
                                else return key ? undefined : (node._ref || node);
                            })
                        ),
                        (function(isEqual) {
                            return function set(key, value, path) {
                                return key && path !== false && key.indexOf && key.indexOf('.') > 0
                                ? (this._store.path(key) ? (isEqual(this._store.path(key), value) ? value
                                    : (this.emit('change', key, 'update', value) || this._store.path(key, value)))
                                        : (this.emit('change', key, 'create', value) || this._store.path(key, value)))
                                : (this.has(key) ? (isEqual(this._store.get(key), value) ? value
                                    : (this.emit('change', key, 'update', value) || this._store.set(key, value)))
                                : (this.emit('change', key, 'create', value) || this._store.set(key, value)));
                            };
                        })(this.fn.isEqual),
                        (function acc(key, value) {
                            return value ? this.set(key, value) : this.get(key);
                        }),
                        (function remove(key) {
                            return this.has(key)
                                ? (this.emit('change', key, 'remove', this.get(key))
                                    || this.clear(key)) : null;
                        }),
                        (function has(key) {
                            return (this._store.index(key) >= 0);
                        }),
                    // === EVENTS === //
                        (function addEventListener(/* instance, name, selector, target */) {
                            return this._events.addEventListener.apply(this._events, [ this ].concat([].slice.call(arguments)));
                        }),
                        (function removeEventListener(info) {
                            return this._events.removeEventListener.call(this._events, info);
                        }),
                        (function observe(/* [ [ instance ], name, selector, handler ] */) {
                            if (this.dispatcher) {
                                var args = [].slice.call(arguments);
                                var inst = typeof args[0] != 'string' ? args.shift() : this;
                                var hndl = args.pop();
                                args.push(typeof hndl == 'string' ? inst.func(hndl) : hndl);
                                return this.dispatcher.addEventListener.apply(this.dispatcher, [ inst, 'store' ].concat(args));
                            }
                        }),
                        (function once() {
                            var args = [].slice.call(arguments);
                            return this.observe.apply(this, args.slice(0, -1).append({ once: true }, args.pop()));
                        }),
                        (function pipe(source, args) {
                            if (this._started > 1) {
                                this._events.emit(source, args);
                            }else {
                                this.buffer.push([ source, args ]);
                            }
                        }),
                        (function start() {
                            if (!this._started && (++this._started)) {
                                sys().log([ '!START!', this.identifier() ]);
                            }else if (this._started == 1 && ++this._started) {
                                while (this.buffer.length) {
                                    this._events.emit(this.buffer[0][0], this.buffer[0][1]);
                                    this.buffer.shift();
                                }
                            }
                            return (this._started == 2);
                        }),
                        (function emit(name, path, type, value) {
                            if (this.isEvents || (this._parent && this._parent.isEvents)) {
                            }else if (this._events && this._events.emit) {
                                var parts = path.split('.'), key = parts.pop();
                                this.pipe(parts.length ? this.get(parts.join('.')) : this, [ name, key, type, value ]);
                            }
                        }),
                    // === NODE === //
                        (function lookup(key, orElse) {
                            return this.maybe(
                              key ? (this.get(key)||(orElse && orElse instanceof Function ? orElse(this) : orElse)) : orElse
                            );
                        }),
                        (function map(f) {
                            return this._store.map(f);
                        }),
                        (function filter(f) {
                            return this._store.vals().filter(f);
                        }),
                        (function parse() {
                            return this._store.parse.apply(this, arguments);
                        }),
                        (function info(/* recur, opts */) {
                            return this._store.info.apply(this._store, arguments);
                        }),
                        (function level(offset) {
                            return this._level - (offset ? (offset._level || this._offset) : this._offset);
                        }),
                    // === CHILD ETC === //
                        (function parent(key, value) {
                            return this._parent ? this._parent.acc(key, value) : null;
                        }),
                        (function add(name) {
                            return this.get(name) || this.of({ name: name, parent: this });
                        }),
                        (function child(opts, ctor, parent) {
                            parent || (parent = this);
                            var exists = this.exists(opts, ctor), instance;
                            if (exists && this.is(exists)) return exists;
                            var options  = typeof opts == 'object' ? opts : { name: opts, parent: parent };
                            options.parent || (options.parent = this);
                            if (ctor && this.ctor.test(ctor)) {
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
                            if (exists && this.is(exists)) return exists;
                            return false;
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
                    // === VALUES ETC === //
                        (function values(recur) {
                            return this._store.values(recur);
                        }),
                        (function clear(id) {
                            return id
                            ? (this.has(id) ? (this.emit('change', id, 'remove', this.get(id)) || this._store.clear(id)) : null)
                            : (this.parent().emit('change', this.cid(), 'remove', this) || this._store.clear());
                        }),
                        (function keys(index) {
                            return this._store.keys(index);
                        }),
                        (function vals() {
                            return this._store.vals();
                        }),
                        (function length() {
                            return this._store.length();
                        }),
                        (function select() {
                            return this._store.select.apply(this._store, arguments);
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
                    // === FIND ETC === //
                        (function equals(value) {
                            if (!value) return false;
                            else if (typeof value == 'string') {
                                if (value.isLowerCase()) return this.cid() === value;
                                else if (value.replace(/[^0-9]/g, '') == value) return this.uid() === parseInt(value); 
                                else return this.cid() === value;
                            }
                            return this.is(value) && this.uid() === value.uid() ? true : false;
                        }),
                        (function closest(key) {
                            var node = this;
                            var type = this.ctor.root().is(key);
                            while (node) {
                                if (type && key.is(node)) break;
                                else if (type) node = node.parent();
                                else if (key instanceof Function && key(node)) break;
                                else if (key && key.is instanceof Function && key.is(node)) break;
                                else if (key && key.test instanceof Function && key.test(node)) break;
                                else if (node.equals(key)) break;
                                else node = node.parent();
                            }
                            return node;
                        }),
                        (function link() {
                            return this.store().link.apply(this.store(), [].slice.call(arguments));
                        }),
                        (function find(value, cached) {
                            return this.store().find(value, cached);
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
                            return sys().get('async.combine')(this.store(), f, a);
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
                            return typeof parent == 'string' ? sys().lookup(parent) : sys().of(parent).map(function(p) {
                                return Function.prototype.apply.bind(p.child, p);
                            }).lift(function(make, args) {
                                return make(args);
                            });
                        })
                    ],
                    init: function(type, klass, sys) {
                        var store = klass.prop('_store', sys.root);
                        klass.prop('identifier', store.get('utils.identifier')('_parent'));
                        klass.prop('test', store.is.bind(store));
                        klass.prop('isStore', true);
                        klass.prop('maybe', this.find('Maybe').of);
                        klass.prop('func', klass.fn = store.get('utils.func'));
                        klass.prop('bind', store.get('utils.pass')(store.get('utils.bind')));
                        klass.prop('cell', this.find('Cell').of);

                        var root = sys.root = klass.of('root');
                        var ctor = sys.ctor = this;
                        var ext  = root.set('ext', root.store().child({ name:'ext', parent:root }));
                        store.map(function $fn(v,k,i,o) {
                            return typeof v != 'object' || v.constructor != Object ? o.ref().child({ name: k }) : v;
                        });
                        root.set('buffer', klass.prop('buffer', []));
                        sys.get = root.get('utils.get')(root);
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

);
