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
                            if (this._parent._events && this._parent._events._id != this._events._id)
                                this._events = this._parent._events;

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
                        (function lift(f) {
                            return this.bind(function(comp, result) {

                            });
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
                        })(this.ctor.sys().fn.isEqual),
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
                        (function parse() {
                            return this._store.parse.apply(this, arguments);
                        }),
                        (function info(recur) {
                            return this._store.info(recur);
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
                                if (ctor) this.children().store().child(options.name, ctor);
                                instance = this.of(options, this.constructor);
                            }
                            return this.emit('change', instance._cid, 'create', instance) || instance;
                        }),
                        (function exists(options, ctor) {
                            //var location = ctor && ctor.prototype ? ctor.prototype._children : '';
                            var opts = options ? (typeof options == 'string' ? { name: options } : options) : {},
                            id = opts.name = opts.name || opts.id || opts.cid,
                            //exists = id ? (location ? this.get(location + '.' + id) : this.get(id)) : false;
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
                    // === VALUES ETC === //
                        (function values(recur) {
                            return this._store.values(recur);
                        }),
                        (function clear(id) {
                            return this._store.clear(id);
                        }),
                        (function keys(index) {
                            return this._store.keys(index);
                        }),
                        (function vals() {
                            return this._store.vals();
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
                        klass.prop('identifier', sys.get('utils.identifier')('_parent'));
                        klass.prop('test', store.is.bind(store));
                        klass.prop('isStore', true);
                        klass.prop('maybe', this.find('Maybe').of);
                        klass.prop('func', klass.fn = sys.get('utils.func'));
                        klass.prop('bind', sys.get('utils.pass')(sys.get('utils.bind')));
                        klass.prop('cell', this.find('Cell').of);
                        var root  = sys.root  = this.set('root', klass.of('root'));
                        var ext   = root.set('ext', root.store().child({ name:'ext', parent:root }));
                        var proto = klass.prototype;
                        root.set('buffer', klass.prop('buffer', []));
                        store.map(function $fn(v,k,o,i) {
                            var node = o.ref().child({ name: k });
                            return k == 'ttypes' ? v.map($fn) : node;
                        });
                        sys.get = root.get('utils.get')(root);
                    }
                };
            }),
