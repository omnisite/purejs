        (function MakeNodes(Klass, DataDef, VectorDef, StoreDef, StorageDef, NodeDef, EventDef, ChoiceDef, TypeDef, ItemDef) {

            var Data     = Klass.of('Data', DataDef).run();
            var Storage  = Klass.of('Storage', StorageDef).ext('store', Data.$of()).run().of('root');
            var Store    = Data.klass.ext('storage', Storage).inherit('Store', StoreDef).run();
            var Node     = Klass.of('Node', NodeDef).ext('klass', Klass).ext('storage', Storage).run();
            var Root     = Data.prototype.root = Store.prototype.root = Klass.prototype.root = Node.prototype.root = Node.of('root');
            var Index    = Node.of('index');
            var Type     = Node.inherit('Type', TypeDef).ext('index', Index).run();
            var Item     = Node.inherit('Item', ItemDef).ext('index', Index).run();
            var Base     = Data.prototype.types = Node.prototype.types = Root.child({ ctor: Object, name: 'types' }, Type);
            var Utils    = Root.child('utils'); var Async = Utils.child('async');
            var FnType   = Base.child({ ctor: Function, name: 'Function' }, Type);
            var ObjType  = Base.child({ ctor: Object, name: 'Object' }, Type);
            var Types    = ObjType.child({ ctor: Type, name: 'Type' });
            var Nodes    = Types.child({ name: 'Node', ctor: Node });
            var DataType = ObjType.child({ ctor: Data, name: 'Data' });
            var Store    = DataType.child({ ctor: Store, name: 'Store' });
            var Vector   = DataType.child({ name: 'Vector', ctor: Klass.of('Vector', VectorDef).ext('storage', Storage).run() });
            var Nodes    = Types.child({ name: 'Node', ctor: Node });
            var Events   = Data.prototype.events = Node.prototype.events = Root.set('events', Types.child({
                name: 'Events',
                ctor: Node.inherit('Events', EventDef).ext('index', Index).ext('isEvents', true).run()
            }).of({ name: 'events', parent: Root })); Events.initdata();

            var Choice   = Node.prototype.choice = Root.child('choice', Nodes.child({ name: 'Choice', ctor: Node.inherit('Choice', ChoiceDef).ext('index', Index).run() }).ctor());
            return Root.set('base', {
                klass: Klass,
                store: Store,
                db: Storage,
                root: Root,
                node: Nodes,
                types: Base,
                item: Types.child({ name: 'Item', ctor: Item }),
                choice: Choice,
                info: (self.sys || {})
            });
        }),

        (function MakeKlass(make, named) {

            var Klass = make();
            Klass.prototype.named = named;
            return Klass;
        })(
            (function make() {
                function $Klass(opts, def) {
                    opts = opts && typeof opts == 'string' ? { name: opts } : (opts || {});
                    this._name   = opts.name;
                    this._ctor   = [];
                    this._ext    = [];
                    this._attrs  = [];
                    this._init   = [];
                    if (opts.parent) this._parent = opts.parent;
                    if (def) this.def(def);
                };
                $Klass.prototype = {
                    constructor: $Klass,
                    of: function() {
                        return new (Function.prototype.bind.apply(this, [null].concat([].slice.call(arguments))));
                    },
                    instance: function() {
                        return new (Function.prototype.bind.apply(this.get(), [null].concat([].slice.call(arguments))));
                    },
                    inherit: function(name, def) {
                        return this.constructor.of({
                            name: name, parent: this
                        }, def);
                    },
                    add: function() {
                        var args = [].slice.apply(arguments);
                        var key  = args.shift();
                        var vals = args.length > 1 ? args : args.shift();
                        var add  = this['_'+key];
                        add.push.apply(add, vals instanceof Array ? vals : [ vals ]);
                        return this;
                    },
                    get: function() {
                        return this._named || (this._named = this.named(this._name))
                    },
                    ext: function(prop, value) {
                        if (!prop && !value) return this._ext.slice(0);
                        var named = this._named;
                        if (named) this.add('ext', prop, (named.prototype[prop] = value));
                        else this.add('ext', prop, value);
                        return this;
                    },
                    ctor: function() {
                        return this._ctor.length ? this._ctor[0] : (function ctor() { this.__super__.apply(this, [].slice.call(arguments)); });
                    },
                    proto: function() {
                        return this.get().prototype;
                    },
                    def: function(def) {
                        if (def) {
                            if (def.named)  this.named = $const(def.named);
                            if (def.ctor)   this.add('ctor',  [ def.ctor ]);
                            if (def.ext)    this.add('ext',   def.ext);
                            if (def.attrs)  this.add('attrs', def.attrs);
                            if (def.init)   this.add('init', [ def.init ]);
                        } return {
                            ctor: this.ctor(), parent: this._parent,
                            ext: this._ext, attrs: this._attrs, init: this._init.length ? this._init[0] : unit
                        };
                    },
                    run: function(def, named) {
                        return this.make(this.def(def), named ? this.named(this._name) : false);
                    },
                    clone: function(def) {
                        return this.run(def, true);
                    },
                    wrap: function(def) {
                        return {
                            klass: this, ctor: this.run(def)
                        };
                    },
                    make: function(def, named) {
                        return this.$make(named || this.get(), def.parent, def.ctor, def.ext, def.attrs, def.init);
                    },
                    assign: function(target, props) {
                        var prev, root = this.root;
                        props.forEach(function(value, key) {
                            if (prev) {
                                target[prev] = typeof value == 'string' && prev.substr(0, 1) != '_' ? root.get(value) : value;
                                prev = '';
                            }else if (value instanceof Function) {
                                target[value.name || key] = value;
                            }else if (typeof value == 'string') {
                                prev = value;
                            }
                        });
                        return target;
                    },
                    $init: function(counter) {
                        return function() {
                            return (this._id = counter.cid++);
                        }
                    },
                    super: function() {
                        if (this.__level__) this.__parent__[--this.__level__].ctor.apply(this, [].slice.call(arguments));
                        if (!this.__level__) this.__super__ = function(fn) { return this.__parent__[this.__parent__.length-1][fn].apply(this, [].slice.call(arguments, 1)); };
                    },
                    $make: function(named, parent, ctor, ext, attrs, init) {
                        var proto = {};
                        if (parent) {
                            var F = function() {};
                            F.prototype = parent.proto();
                            var proto = new F();
                            proto.__parent__ = proto.__parent__.slice(0);
                            proto.__level__  = proto.__parent__.push(F.prototype);
                            proto.__super__  = this.super;
                        }else {
                            proto.__parent__ = [];
                            proto.__level__  = 0;
                            proto.id = this.$init({ cid: 10000 });
                        }
                        proto.constructor = named;
                        proto.ctor = ctor;
                        if (ext) {
                            this.assign(proto, ext);
                        }
                        named.klass = this;
                        named.inherit = (function(name, def) { return this.klass.inherit(name, def); });
                        named.prototype = proto;
                        if (attrs) {
                            this.assign(named, attrs);
                        }
                        if (!named.of) named.of = parent ? parent.get().of : this.of;
                        if (init) init(this);
                        return named;
                    }
                };
                $Klass.of = (function(name, def) { return new this(name, def); });
                return $Klass;
            }),
            (function Named(run) {
                return function named(codeOrName) {
                    var code = codeOrName.toTypeCode(), name = codeOrName.toCamel();
                    return run(function($$__purejs) {
                        var script = document.createElement('script');
                        script.innerHTML = '$$__purejs.push((function Make'+name+'() { return function '+name+'() { this.id(); this.ctor.apply(this, arguments); if (this.__level__ && !(this.__level__ = 0)) this.__super__.call(this);  }; })())';
                        var headel = document.getElementsByTagName('head')[0];
                        headel.appendChild(script);
                        headel.removeChild(script);
                        return $$__purejs.pop();//self['$$__purejs'].pop();
                    });
                }
            })(
                (function() {
                    var val = $$__purejs = [];
                    return function tmp(fn) {
                        return fn($$__purejs);
                    }
                })()
            )
        ),

        (function KlassDefData() {
            return {
                ctor: function(ref) {
                    this._ids = [];
                    this._map = {};
                    this._val = [];
                    this._idx = 0;
                    this._ref = ref || this;

                    if (this._ref && this._ref.isEvents) this.isEvents;
                },
                ext: [
                    'events', [],
                    (function init() {
                        var cmd = this.get('cmd');
                        if (cmd) {
                            cmd.each(function(path) {
                                cmd.set(path.split('.').pop(), cmd.get(path));
                            });
                        }
                    }),
                    (function ref() {
                        return this._ref;
                    }),
                    (function uid() {
                        return this._uid;
                    }),
                    (function identifier() {
                        return this._ref && this._ref.identifier ? this._ref.identifier() : '';
                    }),
                    (function isNode(value) {
                        return value && value instanceof this.constructor ? true : false;
                    }),
                    (function type(name) {
                        return this.types.find(name || this.constructor.name);
                    }),
                    (function current() {
                        return this._val[this._idx];
                    }),
                    (function length() {
                        return this._val.length;
                    }),
                    (function at(index) {
                        return index < this._val.length ? this._val[index] : null;
                    }),
                    (function keys(key) {
                        return typeof key == 'number' ? this._ids[key] : this._ids;
                    }),
                    (function index(key) {
                        return this._map[key];
                    }),
                    (function add(name) {
                        return (this.set(name, this.storage.add(this)));
                    }),
                    (function get(key) {
                        if (key && typeof key == 'string' && (this._map[key]>=0)) return this._val[this._map[key]];
                        //else if (key && typeof key == 'string' && key.substr(0, 1) == '*') return this.values(key.substr(-1, 1) == '!' ? true : (key.length - 1));
                        else if (key && typeof key == 'number') return key >= 0 && key < this._val.length ? this._val[key] : undefined;
                        else if (key && key.indexOf && key.indexOf('.') > 0) return this.path(key);
                        else if (key && key instanceof Array) return key.length > 1 ? this.path(key) : this.get(key.slice(0).shift())
                        else return key ? undefined : (this._ref || this);
                    }),
                    (function __get(key) {
                        return this.get(key);
                    }),
                    (function set(key, value) {
                        return key && key.indexOf && key.indexOf('.') > 0 ? this.path(key, value)
                        : (this._val[(this._map[key] >= 0
                            && !this.emit('change', key, 'update', value) ? this._map[key]
                        : (
                            this._map[this.emit('change', key, 'create', value)||key] = this._ids.push(key)-1))] = value);
                    }),
                    (function __set(key, value) {
                        return this.set(key, value);
                    }),
                    (function acc(key, value) {
                        return value ? this.set(key, value) : this.get(key);
                    }),
                    (function val(key, value, asArray) {
                        if (!key && typeof key != 'string') {
                            return this;
                        }else if (typeof value != 'undefined') {
                            if (this._map[key] >= 0) return this.set(key, value);
                            else return this.insert(key, val);
                        }else if (key && value && typeof value == 'undefined') {
                            return this._val[(this._map[this._ids[(this._ids.push(key)-1)]] = this._val.push(asArray ? [ value ] : value) - 1)];
                        }else {
                            return key ? this._val[this._map[key]] : this;
                        }
                    }),
                    (function emit(/* name, key, type, value */) {
                        if (this.isEvents || (this._ref && this._ref.isEvents)) {

                        }else if (this.events && this.events.emit) {
                            this.events.emit(this, [].slice.call(arguments));
                        }
                    }),
                    (function insert(id, val, asArray) {
                        var node = this,
                        curridx = node._map[id],
                        currval = node._val[curridx],
                        isArr = currval instanceof Array,
                        index = 0;
                        if (asArray && id && typeof val == 'undefined') {
                            return node._val.push(val);
                        }else if (node._map[id] >= 0) {
                            if (asArray && currval.isNode) {
                                node.emit('change', id, 'push', currval);
                                return currval.push(id, val);
                            }else if (asArray && !isArr) {
                                currval = (node._val[node._map[id]] = [ currval ]); isArr = true;
                            }
                            if (isArr) {
                                if (currval.length && (index = currval.indexOf(val)) >= 0) return index;
                                index = val instanceof Array ? currval.push.apply(currval, val) : currval.push(val);
                                node.emit('change', id, 'push', currval);//asArray ? [ val ] : val);
                                return val;
                            }
                        }else {
                            var newval = node._val[(node._map[node._ids[(node._ids.push(id)-1)]] = node._val.push(!asArray || val instanceof Array ? val : [ val ]) - 1)];
                            node.emit('change', id, 'create', asArray ? newval.slice(-1) : newval);
                            return newval;
                        }
                    }),
                    (function push(key, value, asArray) {
                        if (key && key.indexOf && key.indexOf('.') > 0) {
                            var parts = key.split('.'), node = this.path(parts, value, asArray);
                            if (typeof node == 'number') return node;
                            else return this.insert(parts.join('.'), value, asArray);
                        }else {
                            return this.insert(key, value, asArray);
                        }
                    }),
                    (function splice(key, idx, num) {
                        var index, pos = 0, prop, value, node;
                        if ((index = this._map[key]) >= 0) {
                            prop = this._val[index];
                            if (prop instanceof Array && prop.length) {
                                num || (num = typeof idx == 'undefined' ? prop.length : 1);
                                value = prop.splice(idx || 0, num);
                                this.emit('change', key, 'remove', num == 1 ? value[0] : value);
                                return value;
                            }
                        }else if ((prop = this.get(key))) {
                            var node = this.get(key.substr(0, ((pos = (key+'.').indexOf('.')))));
                            if (node) return node.splice(key.slice(pos+1), idx, num);
                        }else {
                            return this.set(key, []);
                        }
                    }),
                    (function pop(key, idx, num) {
                        return this.splice(key, idx || (this.get(key) || []).length, num || 1);
                    }),
                    (function shift(key, num) {
                        return this.splice(key, 0, num || 1);
                    }),
                    (function clear(id) {
                        var node = this;
                        if (!node || !node.length || !node.length()) {
                            return node;
                        }else if (!id) {
                            node._map = {};
                            node._ids.splice(0);
                            node._val.splice(0);
                            return node;
                        }else {
                            var idx = node._map[id],
                            val  = [].concat(node._val.splice(0)),
                            idxs = node.root.cached('utils.values')(node._map),
                            keys = node.root.cached('utils.keys')(node._map),
                            pos  = 0,
                            del  = [];

                            node._map = {};
                            node._ids.splice(0);
                            while(pos < val.length) {
                                if (id != keys[pos]) node.add(keys[pos], val[idxs[pos]]);
                                else del.push([ keys[pos], val[idxs[pos]] ]);
                                pos++;
                            }
                            return del.shift();
                        }
                    }),
                    (function pure() {
                        return (this._pure || (this._pure = (function(node) { return (function(f) { return f ? f(node) : node }); })(this)));
                    }),
                    (function path(full, quick) {
                        return function path(key, value, asArray) {
                            return quick(full, this, key, value, asArray);
                        };
                    })(
                        (function full(node) {
                            return function(path, value) {
                              var org  = path.slice(0),
                                  pos  = path.indexOf('.'), key, sub,
                                  test = node, nref = test, fn = false;
                              while(pos>0 && nref && nref.isNode) {
                                key = path.substr(0, pos);
                                if (key.substr(0, 1) == '_' && nref[key]) {
                                  key = nref[key];
                                }else if (key.substr(0, 1) == '%') {
                                  key  = key.substr(1);
                                  path = path.substr(1);
                                  if (key.substr(-1) == '%') {
                                    sub  = nref.get(key.substr(-1));
                                    key  = sub || key;
                                  }else {
                                    sub  = path.substr(0, path.indexOf('%'));
                                    path = path.substr(sub.length);
                                    key  = nref.get(sub) || key;
                                  }
                                }
                                if (key == 'root') {
                                  nref = test = node.root;
                                }else if (key == 'parent' && nref._parent) {
                                  nref = test = nref.parent();
                                }else if (key == 'fn') {
                                  fn = key;
                                }else if (fn && nref[fn] && (fn = nref.fn(fn))) {
                                  var result = fn(key);
                                  if (!result || !(result instanceof Function)) return result;
                                  else if (path.substr(-2) == '()') return result();
                                  else if (path.length > key.length) return result(path.slice(pos+1));
                                  return result;
                                }else if ((test = nref.get(key))) {
                                  if (test.isNode) nref = test;
                                }
                                path = path.slice(pos+1);
                                if (path.length) {
                                  pos = path.indexOf('.');
                                  if (nref && nref.role && nref.role('store').index(path) >= 0) break;
                                  else if (test && !test.isNode && typeof test == 'object' && (test = test[path.substr(0, pos)]) && test.isNode) {
                                    nref = test; path = path.slice(pos+1); pos = path.indexOf('.'); continue;
                                  }else if (test && test.isNode && test.get(path)) break;
                                }else {
                                  break;
                                }
                              }
                              if (fn && nref[fn] && (fn = nref.fn(fn))) {
                                if (path.substr(-2) == '()') {
                                  var result = fn(path.replace('()', ''));
                                  if (result && result instanceof Function) return result();
                                }else {
                                  return fn(path);
                                }
                              }else if (false && pos < 0 && nref && nref._cid == path && typeof value == 'undefined') {
                                return nref;
                              }else {
                                return typeof value == 'undefined' ? nref.get(path) : nref.update(path, value, node, org);
                              }
                            }
                        }),
                        (function quick(full, node, key, value, asArray) {
                            var parts = typeof key == 'string' ? key.split('.') : key.slice(0), part, test;
                            while (parts.length > 1 && (part = parts[0])) {
                              if (part == 'root' && parts.shift()) {
                                test = node.root;
                              }else if (part == 'fn' && parts.length > 1 && node[parts[1]]) {//node[!node.has(part)) {
                                return full(node)(parts.join('.'), value);
                              }else if (part == 'parent' && node._parent && parts.shift()) {
                                test = node.parent();
                              }else if (part == '*') {
                                return node.get(parts.splice(0).join(''));
                              }else {
                                test = node.get(parts.shift());
                              }
                              if (test && test.isNode) node = test;
                              else break;
                            };
                            if (parts.length > 1) return;
                            else part = parts.shift();
                            return test ? (test.isNode ? test.acc(part, value) : test[part]) : undefined;
                        })
                    ),
                    (function each(f) {
                        var i = 0, v, k = this._ids, l = k.length, r = {};
                        while (i < l) {
                            r[k[i]] = f(this.at(i), k[i], this, i); i++;
                        }
                        return r;
                    }),
                    (function map(f) {
                        var i = 0, v, k = this._ids, l = k.length, r = [];
                        while (i < l) {
                            r.push(f(this.at(i), k[i], this, i)); i++;
                        }
                        return r;
                    })
                ],
                attrs: [
                    (function of(ref) {
                        return new this(ref);
                    }),
                    (function $of() {
                        var ctor = this;
                        return function() {
                            return ctor.of.apply(ctor, arguments);
                        }
                    })
                ]
            };
        })(),

        (function KlassDefVector() {
            return {
                ctor: function(ref) {
                    this._ref   = ref;
                    this._store = this.store();

                    this.add('type');
                    this.add('data');
                    this.add('map');
                    this.add('eff');
                    this.add('cmd');

                    this.add('choice');
                },
                ext: [
                    (function type(name) {
                        return this.types.find(name || this.constructor.name);
                    }),
                    (function store() {
                        return (this._store || (this._store = this.storage.add(this)));
                    }),
                    (function keys(key) {
                        return this._store.keys(key);
                    }),
                    (function add(name) {
                        return (this._store.set(name, this.storage.add(this)));
                    }),
                    (function make(type, name) {
                        return (this._store.set(name, this.type(type).of(this.storage.add(this))));
                    }),
                    (function get(key) {
                        return (this._store.get(key));
                    }),
                    (function map(type, data) {
                        return (this._store.get(key));
                    })
                ]
            };
        })(),

        (function KlassDefStore() {
            return {
                ctor: function(ref) {
                    this.__super__.call(this, ref);
                },
                ext: [

                ]
            };
        })(),

        (function KlassDefStorage() {
            return {
                ctor: function(opts) {
                    opts || (opts = {});
                    if (opts._parent) this._parent = opts._parent;
                    this._base    = 1000000;
                    this._uid     = 1000000;
                    this._store   = this.store();
                    this._cid     = 0;
                    this._count   = 0;
                    this._values  = [];
                },
                ext: [
                    (function base(base) {
                        return { base: base, prefix: 65, uid: base, blocksize: base / 100, cid: 0, count: 0, values: [] };
                    }),
                    (function init(base) {
                        return this.make.call(this.base(base || 1000000));
                    }),
                    (function pos(nid) {
                        return [ Math.floor(nid/1000), Math.floor(nid/100), Math.floor(nid/10) ];
                    }),
                    (function val(nid) {
                        return this._values[Math.floor(nid/1000)][Math.floor((nid%1000)/100)][Math.floor((nid%100)/10)];
                    }),
                    (function locate(nid) {
                        var uid = nid - this._base;
                        var idx = 0, lvl = 0, div = 1000, val = this._values;
                        while (++idx < 4) {
                            lvl = uid < div ? 0 : ((uid - uid%div) / div);
                            uid = uid - (div * lvl); div = div / 10;
                            while (val.length <= lvl) { val.push([]); }
                            val = val[lvl];
                        }
                        return val;
                    }),
                    (function push(val, item) {
                        item._uid = this._uid - 1;
                        return val[val.push(item)-1];
                    }),
                    (function add(item) {
                        if (this._uid%10==0) this._current = null;
                        this._uid++;
                        return this.push(this._current || (this._current = this.locate(this._uid)), this.store(item));
                    }),
                    (function check(nid) {
                        return (!nid || nid < this._base || nid > this._uid) ? false : true;
                    }),
                    (function info() {
                        return { base: this._base, uid: this._uid };
                    }),
                    (function find(nid) {
                        if (!this.check(nid)) return;
                        //var val = this.locate(nid);
                        var val = this.val(nid - this._base);
                        return val[nid%10];
                    }),
                    (function first() {
                        return this._base;
                    }),
                    (function last() {
                        return this._uid;
                    })
                ],
                attrs: [
                    (function of(opts) {
                        return new this(opts);
                    })
                ]
            };
        })(),

        (function KlassDefNode() {
            return {
                ctor: function(opts) {
                    opts || (opts = {});

                    if (opts.parent) {
                        this._parent = opts.parent;
                        this._level  = this._parent._level + 1;
                        this._offset = this._parent._offset + (opts.offset || 0);
                    }else {
                        this._level  = 0;
                        this._offset = opts.offset || 0;
                    }
                    this._cache  = {};
                    this._roles  = this.roles();
                    this._index  = 0;
                    this._store  = this._roles.set('store', this.store());
                    this._cid    = '' + (opts.cid || opts.name || this._id || '');
                },
                ext: [
                    (function uid() {
                        return this.current()._uid;
                    }),
                    (function cid() {
                        return this._cid;
                    }),
                    (function current() {
                        return this._roles._val[this._index];
                    }),
                    (function cast(type) {

                    }),
                    (function role(key) {
                        return this._roles.at(this._roles.index(key || this._id));
                    }),
                    (function roles() {
                        return (this._roles || (this._roles = this.storage.add(this)));
                    }),
                    (function store() {
                        return (this._store || (this._store = this.storage.add(this)));
                    }),
                    (function cont() {
                        return (this._cont || (this._cont = sys.type('Cont').pure(this)));
                    }),
                    (function just() {
                        return sys.of(this);
                    }),
                    (function lift(fn) {
                        return (this._just || (this._just = this.just())).lift(fn);
                    }),
                    (function isNode(value) {
                        return value && value instanceof this.root.constructor;
                    }),
                    (function is(value) {
                        return value && value instanceof this.constructor;
                    }),
                    (function type(name) {
                        return this.types.find(name || this.constructor.name);
                    }),
                    (function cached(key) {
                        return (this._cache[key] || (this._cache[key] = this.root.get(key)));
                    }),
                    (function addEventListener(/* instance, name, selector, target */) {
                        // this, instance, name, selector, target
                        return this.events.addEventListener.apply(this.events, [ this ].concat([].slice.call(arguments)));
                    }),
                    (function removeEventListener(/* instance, name, selector, target */) {
                        return this.events.removeEventListener.apply(this.events, [ this ].concat([].slice.call(arguments)));
                    }),
                    (function values(recur) {
                        return this.choice.sets('values').runSet([ this, recur ]);
                    }),
                    (function level(offset) {
                        return this._level - (offset ? (offset._level || this._offset) : this._offset);
                    }),
                    (function keys(key) {
                        return this.current().keys(key);
                    }),
                    (function index(key) {
                        return this.current().index(key);
                    }),
                    (function has(key) {
                        return this.current().index(key) >= 0 ? true : false;
                    }),
                    (function vals() {
                        return this.current()._val;
                    }),
                    (function length() {
                        return this.current().length();
                    }),
                    (function get(key) {
                        return typeof key == 'undefined' ? this : this.current().get(key);
                    }),
                    (function set(key, value) {
                        return this.current().set(key, value);
                    }),
                    (function acc(key, value) {
                        return this.current().acc(key, value);
                    }),
                    (function val(key, value, asArray) {
                        return this.current().val(key, value, asArray);
                    }),
                    (function push(key, value, asArray) {
                        return this.current().push(key, value, asArray);
                    }),
                    (function splice(key, idx, num) {
                        return this.current().splice(key, idx, num);
                    }),
                    (function pop(key, idx, num) {
                        return this.current().splice(key, idx || (this.get(key) || []).length, num || 1);
                    }),
                    (function shift(key, num) {
                        return this.current().splice(key, 0, num || 1);
                    }),
                    (function clear(id) {
                        this.current().clear(id);
                        return this;
                    }),
                    (function each(f) {
                        return this.current().each(f);
                    }),
                    (function map(f) {
                        return this.current().map(f);
                    }),
                    (function exists(options) {
                        var opts = options ? (typeof options == 'string' ? { name: options } : options) : {},
                        id = opts.name = opts.name || opts.id || opts.cid,
                        exists = id ? this.get(id) : false;
                        if (exists && this.isNode(exists)) return exists;
                        return false;
                    }),
                    (function parent(key) {
                        return this._parent ? this._parent.get(key) : null;
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
                        var instance = new ctor(options);
                        return parent.set(instance._cid, instance);
                    }),
                    (function node(opts) {
                      return this.child(opts, this.root.constructor, this);
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
                                        return val && val.isNode && parts.length ? next(val) : null;
                                    }
                                };
                            }
                        })
                    ),
                    (function lookup(key, orElse) {
                        return this.maybe(
                          key ? (this.get(key)||(orElse && orElse instanceof Function ? orElse(this) : orElse)) : orElse
                        );
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
                    (function wrapper(keymap) {

                        function $wrap(value, returnValue) {
                            function wrapped(id, val) {
                                return !id && typeof id == 'undefined' ? value
                                    : (!val && keymap[id] ? keymap[id](value, val)
                                        : $wrap(value && value.isNode ? (id instanceof Function ? id(wrapped) : value.acc(id, val))
                                            : (typeof val != 'undefined' ? (value[id] = val) : value[id]), id ? false : true));
                            };
                            return value instanceof Function || returnValue
                                ? value : (value instanceof Object ? wrapped : value);
                        };
                        return function wrap(id) {
                            return $wrap(id ? this.get(id) : this);
                        };
                    })(
                        (function() {
                            function wrapOptions(value, opts) {
                                function wrapRequest(id, val) {
                                    return value.child(id).wrap();
                                };
                                return wrapRequest;
                            };
                            function propty(prop) {
                                return function(obj) {
                                    return obj[prop];
                                }
                            };
                            return {
                                'child'    : wrapOptions,
                                'values'   : propty('values'),
                                'keys'     : propty('keys'),
                                'each'     : propty('each'),
                                'find'     : propty('find'),
                                'parse'    : propty('parse'),
                                'pure'     : propty('pure'),
                                'fn'       : propty('fn'),
                                'ensure'   : propty('ensure'),
                                'length'   : propty('length'),
                                'attr'     : propty('attr')
                            };
                        })()
                    )
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
            }
        })(),

        (function KlassDefEvent() {
            return {
                ctor: function(opts) {
                    this.__super__.call(this, opts || (opts = {}));

                    if (this.events) this.initdata();

                    this._values  = [];
                    this._handler = [];
                },
                ext: [
                    (function initdata() {
                        this._lstnrs = this.events.get('listeners') || this.events.node('listeners');
                        this._change = this._lstnrs.node('change');
                        this._active = this._lstnrs.get('active') || (this._active = this._lstnrs.set('active', []));
                        this._queue  = this.get('queue') || (this._queue = this.set('queue', []));
                    }),
                    (function addEventListener(/* instance, name, selector, target */) {
                        var args = [].slice.call(arguments), instance = args.shift();
                        var name = args.shift(), target = args.pop(), selector = args.length ? args.shift() : '*';

                        var events = this._lstnrs.ensure(name, this.root.constructor);
                        var matchs = new RegExp('/(.*?)/');
                        var active = this._lstnrs.get('active') || this._lstnrs.set('active', []);
                        return active[active.push({
                            uid: instance.uid(), ref: instance.identifier(), selectstr: selector,
                            level: instance.level(),
                            name: name, selector: matchs, target: target, run: target.run || target
                        })-1];
                    }),
                    (function removeEventListener() {
                        var active = target[target.push({ uid: instance.uid(), ref: instance.identifier(), name: name, selector: selector, target: target })-1];
                        return active;
                    }),
                    (function runHandler(lstnrs, value) {
                        return lstnrs.bind(function(handler) {
                            return handler.run(value);
                        });
                    }),
                    (function initHandler(run, lstnrs) {
                        return function(value) {
                            return run(lstnrs, value).run();
                        };
                    }),
                    (function emit(source, args) {//* source, name, target, info */) {
                        if (this.push('queue', { source: source, args: args }, true)) {
                            if (sys.enqueue) this.runQueue(this.get('queue'));
                        }
                    }),
                    (function runQueue(values) {
                        return this.get('queue').splice(0).bind(function(value) {

                            return {
                                src:    'data',
                                uid:     value.source.uid(),
                                ref:     value.source.identifier(),
                                type:    value.args.shift(),
                                target:  value.args.shift(), 
                                action:  value.args.shift(),
                                value:   value.args.pop()
                            };

                        }).flatmap(this.initHandler(this.runHandler, this._active)).run(unit);
                    })
                ]
            };
        })(),

        (function KlassDefChoice() {
            return {
                ctor: function(opts) {
                    opts || (opts = {});
                    if (!opts.parent) opts.parent = this.type();
                    this.__super__.call(this, opts);
                    if (opts.picks) this.parse(opts.picks);
                },
                ext: [
                    (function init(choice, set) {
                        return choice.parseSet(set.name, set());
                    }),
                    (function cont(config) {
                        return (this._cont || (this._cont = this.lift(this.init).ap(sys.type('Cont').pure(config)).bind(function(comp) {
                            console.log('cont', comp.identifier(), arguments);
                            comp._cont = sys.type('Cont').pure(comp);
                            return comp;
                        })));
                    }),
                    (function load(sets) {
                        return function(node) {
                            return sets.map(function(v, k, a) {
                                //console.log('load', node.identifier(), arguments);
                                return node.parseSet(v.name, v());
                            });
                        }
                    }),
                    (function when(name, value) {
                        return value ? this.choice.get('when').set(name, value) : this._when.get(name);
                    }),
                    (function then(name, value) {
                        return value ? this.choice.get('then').set(name, value) : this._then.get(name);
                    }),
                    (function sets(name, value) {
                        return value ? this.choice.get('sets').set(name, value) : this._sets.get(name);
                    }),
                    (function runSet(args) {
                        var run = this._cache['run'] || (this._cache['run'] = this.createSet());
                        return run ? run.apply(undefined, args) : null;
                    }),
                    (function makeSet(name) {
                        console.log('runSet1', this.identifier(), arguments);
                        return this.lookup([ 'sets', name, ]).lift(function(set, args) {
                            console.log('runSet2', set ? set.identifier() : '<no set 2>');
                            return set.runSet(args) || set.cont().bind(function(set) {
                                console.log('runSet3', set ? set.identifier() : '<no set 3>');
                                return set.runSet(args);
                            });
                        }).ap(sys.of([].slice.call(arguments, 1)));
                    }),
                    (function createSet() {
                        //console.log('makeSet', this.identifier());
                        return this.makeRun({ $when: this._when, when: this.get('when'), $then: this._then, then: this.get('then') })(this.get('run'));
                    }),
                    (function getSet(code) {
                        return this._sets.get(code) || this._sets.child(code).parse({ when: [], then: [] });
                    }),
                    (function initSet(code, set) {
                        //console.log('initSet', code, this.identifier(), arguments);
                        var node = this.getSet(code);
                        var cont = node.cont(set);
                        return node;
                    }),
                    (function parseSet(code, fnx) {
                        //console.log('parseSet', code, this.identifier(), arguments);
                        var set = this.getSet(code), name, type, node = this;
                        fnx.map(function(v, k, a) {
                            name = v.name; type = name.substr(0, 4);
                            if (type == 'when' || type == 'then') {
                                node[type](name, v);
                                set.push(type, name, true);
                            }else {
                                set.push(name, v);
                            }
                        });
                        return set;
                    }),
                    (function makeRun(choice) {

                        var when = choice.when;
                        var then = choice.$then;

                        function pick() {
                            var l = when.length, i = 0, r;
                            while (i < l) {
                                if ((r = choice.$when.get(when[i++]).apply(then, arguments))) {
                                    break;
                                }
                            };
                            return r;
                        };
                        return function(fn) {
                            return fn(pick);
                        };
                    }),
                    (function add(predicate, action) {
                        return new this.constructor(this._mv.push([ predicate, action ]));
                    })
                ]
            };
        })(),

        (function KlassDefType() {
            return {
                ctor: function(opts) {
                    this.__super__.call(this, opts);
                    if (opts.ctor) this._ctor = opts.ctor;
                    this._defs = opts.defs || {};
                    this._ctor.type = this;
                    this.index.set(this._cid, this.uid());
                    this.ctor = $const(this._ctor);
                },
                ext: [
                    (function isType(value) {
                        return value && value instanceof this.constructor ? true : false;
                    }),
                    (function is(value, name) {
                        if (typeof name == 'string') {
                            var type = this.find(name);
                            return type && type.is(value) ? true : false;
                        }else {
                            return value && value instanceof this._ctor ? true : false;
                        }
                    }),
                    (function proto() {
                        var ctor  = this._ctor;
                        var klass = ctor ? ctor.klass : null;
                        return klass ? klass.proto() : ctor.prototype;
                    }),
                    (function isBaseType(value) {
                        if (!value) return false;
                        else if (typeof value == 'object') return (value.constructor === Object);
                        else if (value instanceof Function) return !value.klass || value === Function || value === Object;
                        return false;
                    }),
                    (function of() {
                        return this._ctor.of.apply(this._ctor, [].slice.call(arguments));
                    }),
                    (function pure() {
                        return (this._ctor.pure || this._ctor.of).apply(this._ctor, [].slice.call(arguments));
                    }),
                    (function lift() {
                        return (this._ctor.lift || this._ctor.of).apply(this._ctor, [].slice.call(arguments));
                    }),
                    (function $of() {
                        return this._ctor.of.bind(this._ctor);
                    }),
                    (function $pure() {
                        return (this._ctor.pure || this._ctor.of).bind(this._ctor);
                    }),
                    (function inherit(name, def) {
                        return this.get(name) || this.child({ name: name, ctor: this.klass.of({
                            name: name, parent: this._ctor.klass
                        }, def).run() });
                    }),
                    (function extend() {
                        var args = [].slice.call(arguments), arg, def = {}, arr;
                        if (args.length == 1 && args[0] instanceof Function && args[0].prototype) {
                            args.push(args[0].prototype);
                        }
                        while (args.length && (arg = args.shift())) {
                            if (arg instanceof Function) {
                                if (!def.ctor) {
                                    def.name = arg.name;
                                    def.ctor = arg;
                                }else {
                                    def.init = arg;
                                }
                            }else if (arg instanceof Array) {
                                arr = def.ext ? (def.attrs = []) : (def.ext = []);
                                arr.push.apply(arr, arg);
                            }else if (typeof arg == 'object') {
                                arr = def.ext ? (def.attrs = []) : (def.ext = []);
                                for (var prop in arg) {
                                    if (arg[prop].name && arg[prop].name == prop) {
                                        arr.push(arg[prop]);
                                    }else {
                                        arr.push(prop, arg[prop]);
                                    }
                                }
                            }else if (typeof arg == 'string') {
                                def.name = arg;
                            }
                        }
                        return this.child({ name: def.name, ctor: this.klass.of({
                            name: def.name, parent: this._ctor.klass
                        }, def).run() });
                    }),
                    (function add(ctor, defs) {
                        var type = this.find(ctor.name);
                        if (!type) {
                            type = this.child({ name: ctor.name, ctor: this.klass.of({
                                name: ctor.name, ctor: ctor, parent: this._ctor.klass
                            }).run(), defs: defs });
                        }else {
                            type._defs = defs;
                        }
                        return type;
                    }),
                    (function clone(defs) {
                        return this._ctor.klass.clone(defs);
                    }),
                    (function ext(prop, value) {
                        return this._ctor.klass.ext(prop, value);
                    }),
                    (function types() {
                        return (this._types || (this._types = this));
                    }),
                    (function $attr(attr, obj) {
                        return this._defs[attr] ? this._defs : (obj[attr] ? obj : null);
                    }),
                    (function $get(attr, checkProto) {
                        var defs = attr ? this.$attr(attr, checkProto ? this._ctor.prototype : {}) || {} : this._defs;
                        return attr ? defs[attr] : defs;
                    }),
                    (function fromConstructor(fn, args) {
                        return sys.get('utils.from')(this._ctor)(fn, args);
                    }),
                    (function parent(key) {
                        return this._parent && this._parent.isType ? this._parent.get(key) : null;
                    }),
                    (function makeCleanCode(codeOrName) {
                        return (codeOrName || '').toTypeCode();
                    }),
                    (function getCleanCode(value, make) {
                        if (!value && typeof value == 'undefined') return false;
                        else if (typeof value == 'string') return make === false ? value : value.toTypeCode();
                        else if (value.constructor) return value.constructor.name;
                        return value;
                    }),
                    (function findTypeCtor(item) {
                        if (item && item.isType) return item;
                        else return this.find(this.getCleanCode(item, false));
                    }),
                    (function findOperation(obj, op) {
                        var node = this.find('Node');
                        var type = node.is(obj) ? node : this.findTypeCtor(obj), test, fn;
                        if ((test = type)) {
                            while (test && !(fn = test.$get(op))) {
                                test = test.parent();
                            }
                            if (test && op) return test.$attr(op, obj);
                            test = type;
                            while (test && !(fn = test.$get(op, true))) {
                                test = test.parent();
                            }
                            return test && op ? test.$attr(op, obj) : test;
                        }
                    }),
                    (function find(name) {
                        var id = this.index.get(name);
                        if (id) {
                            return this.storage.find(id).get();
                        }
                    }),
                    (function findInstance(name, orElse) {
                        return this.root.lookup.call(this, name, orElse);
                    }),
                    (function lookup(name) {
                        var storage = this.storage;
                        return this.index.lookup(name).map(function(id) {
                            return storage.find(id);
                        }).map(function(store) {
                            return store.get();
                        });
                    })
                ],
                attrs: [
                    (function of(ctor, defs) {
                        return new this({ name: ctor.name, ctor: ctor, defs: defs });
                    })
                ]
            }
        })(),

        (function KlassDefItem() {
            return {
                ctor: function(opts) {
                    opts.cid || (opts.cid = opts.name.toLowerCase());
                    this.__super__.call(this, opts);
                    this.parse({ name: opts.name, type: opts.type || 'item', items: opts.items });
                    this.index.set(this._cid, this.uid());
                    if (!this.test(this._parent)) this._offset += this._parent._level;
                },
                ext: [
                    '_children', 'items',
                    (function test(value) {
                        return this.isNode(value) ? (this.is(value) || value.cid() == this._children) : false;
                    }),
                    (function values(recur) {
                        var vals   = this.__super__('values', recur);
                        vals.id    = this._id;
                        vals.level = this.level();
                        vals.path  = this.identifier();
                        return vals;
                    })
                ],
                attrs: [
                    (function of(name, type, items) {
                        return new this({ name: name, type: type, items: items });
                    })
                ]
            }
        })()
    ),