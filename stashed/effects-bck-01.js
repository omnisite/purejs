(function(effects) {

    define(function(store) {

        return store.set('cont', effects(sys()).cont());

    });

})(

    (function Effects() {
 
        return [].slice.call(arguments).pure(0, true);
    })(
        // === Environment Setup === //
            (function WrapSetup(items) {
                return function effects(sys) {
                    items.push(sys);
                    return items.apply(true);
                };
            }),
     
            (function Setup(env, defs, sys) {
                var eff = env(sys.root, sys);
                return eff.runDefs(eff, defs(unit)).chain(function(result) {
                    sys.eff = eff.getOperation('js.nodes.fn').chain(function(op) {
                        return op.run(eff)('runOperation');
                    });
                    sys.enqueue = sys.eff('sys.loader.enqueue').init().unsafePerformIO;
                    return sys;
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
                Handler.prototype.just = Handler.just = this.klass('maybe').pure;
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
                    return wrap(fn(create(sys, sys.klass('maybe')), sys.root.get('utils.point')));
                }
            }),

            (function CreateWrap(fn) {
                return function() {
                    this.prototype.fn = fn;
                    return this;
                }
            }),

            (function CreateLookup(sys, maybe) {
                return function(type) {
                    return maybe.of(sys.klass(type)).chain(function(item) {
                        return item ? item.$ctor : item;
                    });
                }
            }),

            (function fn(get, base) {
                function cast(type) {
                    var ctor = type.is ? type : get(type);
                    return function(value) {
                        return value && value instanceof ctor ? value : ctor.pure(value);
                    }
                };
                function just(type, value) {
                    return type.is && type.of ? type.of(value) : get(type).pure(value);
                };
                function apply(monad, type) {
                    return function $_apply(value) {
                        return monad.ap(cast(type)(value));
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
                return this.sys.klass('node').parse({
                    klass: function Env(opts) {
                        this.$super.call(this, opts);
                        this._handler = this.Handler.of(this);
                        this._cache   = {};
                    },
                    ext: [
                        this.handler,
                        (function isInstruction(value) {
                            return this._handler.isInstruction(value);
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
                                        node.set(action, node.get(action).call(sys(), sys().get().store().select(options.args)));
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
                }).$ctor;
            })],
        // === Initial effects === //
            (function CreateEffects() {
                // target - environment operations - list of instructions
                return [].slice.call(arguments).map(function(x) {
                    return x;
                }).pure();
            })(
        // === sys.eff === //
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
        // === dom.calc === //
                (function() {
                    return {
                        type: 'IO',
                        path: 'dom',
                        calc: [
                            (function getSize(element) {
                                return [ element.clientWidth, element.clientHeight ];
                            }),
                            (function viewport() {
                                return sys().eff('dom.calc.getSize').run(document.body);
                            })
                        ],
                        factory: {
                            calc: {

                            }
                        }
                    };
                }),
        // === dom.elements === //
                (function() {
                    return {
                        type: 'IO',
                        path: 'dom',
                        elements: [
                            (function create(tag) {
                                return document.createElement(tag);
                            }),
                            (function extract(input) {
                                return [ input ].map(function(x) {
                                return (typeof x == 'number' && (x = (''+x))) || typeof x == 'string' ? document.getElementById(x.replace('#', '')) : x;
                                }).shift();
                            }),
                            (function match(selector) {
                                return function(elem) {
                                    return elem && elem.matches(selector) ? true : false;
                                }
                            }),
                            (function attrs(make, assign) {
                                return function attrs() {
                                    return this.fn.curry(make(this.klass('Obj'), assign));
                                }
                            })(
                                (function($object, $assign) {
                                    return function attrs(elem, object) {
                                        $object.of(object).fold($assign, {
                                            elem: elem, attrs: attrs
                                        });
                                        return elem;
                                    };
                                }),
                                (function $assign(r, v, k, i, o) {
                                    if (k == '$key') {
                                        r.attrs(r.elem[v], o[v]);
                                    }else if (o['$key'] && o['$key'] == k) {
                                        return k;
                                    }else if (v instanceof Array) {

                                    }else if (typeof v == 'object') {
                                        r.attrs(r.elem[k], v);
                                    }else if (k == 'innerText' || k == 'innerHTML') {
                                        r.elem[k] = v;
                                    }else if (r.elem.setAttribute) {
                                        r.elem.setAttribute(k, v);
                                    }else {
                                        r.elem[k] = v;
                                    }
                                    return v;
                                })
                            ),
                            (function query(selector) {
                                if (!selector) {
                                    return [];
                                }else if (selector instanceof Element) {
                                    return selector;
                                }else if (selector.slice && selector.slice(0, 1) == '#') {
                                    return document.getElementById(selector.slice(1)) || document.querySelector(selector);
                                }else {
                                    return Array.prototype.slice.call(document.querySelectorAll(selector) || []);
                                }
                            }),
                            (function find(base) {
                                return base.curry(function(elem, selector) {
                                    return elem.querySelector(selector);
                                });
                            }),
                            (function display(elem) {
                                return function(display) {
                                    elem.style.display = typeof display != 'undefined' ? display : (elem.style.display != 'none' ? 'none' : '');
                                    return elem;
                                }
                            }),
                            (function attach(elem) {
                                return function(parent) {
                                    if (elem.getAttribute('data-pos') == 'pre') {
                                        if (parent.firstChild) {
                                            parent.insertBefore(elem, parent.firstChild);
                                        }else {
                                            parent.append(elem);
                                        }
                                    }else {
                                        parent.append(elem);
                                    }
                                    return elem;
                                }
                            }),
                            (function append(parent) {
                                return function(elem) {
                                    return elem.map(function(el) {
                                        parent.append(el);
                                        return el;
                                    });
                                }
                            })
                        ],
                        factory: {
                            elements: {
                                create: {
                                    method: 'bind',
                                    bind: 'Cont'
                                },
                                attrs: {
                                    args: [],
                                    method: 'lift',
                                    lift: 'Maybe'
                                },
                                query: {
                                    method: 'bind',
                                    bind: 'Maybe'
                                },
                                find: {
                                    args: [ 'utils.curry as curry' ],
                                    method: 'bind',
                                    bind: 'Maybe'
                                },
                                attach: {
                                    method: 'lift',
                                    just: 'IO',
                                    bind: 'Cont',
                                    lift: 'Maybe'
                                }
                            }
                        }
                    };
                }),                
        // === js.nodes === //
                (function() {
                    return {
                        type: 'IO',
                        path: 'js',
                        nodes: [
                            (function lookup(make) {
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
                                        return node.func(args.shift());
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
        // === io.request === //
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
                                            modules: 'extend',
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
                                            request: request.call(this).$ctor,
                                            loader: loader.call(this).$ctor,
                                            store: this.root.child('script')
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
                                            this.$super.call(this, mv, mf);
                                            this.mf = this.mf.bind(this);
                                        }, {
                                            mf: function(loc) {
                                                return sys('async.request')(loc);
                                            }
                                        }
                                    );
                                }),
                                (function loader() {
                                    return this.klass('Cont').extend(
                                        function ComponentCont(mv, mf) {
                                            this.$super.call(this, mv, mf);
                                            this.mf = this.mf.bind(this);
                                        }, {
                                            mf: function mf(tag) {
                                                return function $_pure(k) {
                                                    k(sys().find(tag.getAttribute('data-ref')).get('cont'));
                                                };
                                            }
                                        }, {
                                            of: function(loc) {
                                                if (loc == 'pure') {
                                                    return this.prototype._.of(sys);
                                                }else {
                                                    return new this(sys('async.script')(loc));
                                                }
                                            }
                                        }
                                    );
                                }),
                                (function wrap(base) {
                                    return function script(info) {
                                        var location = typeof info == 'object' ? info.url : info;
                                        var full = location.replace('.json', '/json').split('.');
                                        var path = full.first().split('/');
                                        var ext  = (full.length > 1 || full.push('js')) && full.last();
                                        var type = ext == 'tmpl' ? 'templates' : path.first();
                                        var node = info.ref ? base.store.find(info.ref) : base.store.ensure(path.slice(0, 2).join('.'));
                                        var cell = node ? node.get(ext) : undefined;
                                        if (!cell) {
                                            cell = node.set(ext, base.cell.of());
                                            base.engine(type).of({
                                                url: location,
                                                ref: node.uid()
                                            }).run(base.set(
                                                base.cont.$ctor,
                                                cell,
                                                base.handler(type)(node)
                                            ));
                                        };
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
                                    var base = 'Component';
                                    var comp = sys().klass(name) || sys().klass(base).extend(name);
                                    var xtnd = sys().get('utils.extend');
                                    return function(result) {
                                        var proto = comp.proto();

                                        if (!result.ext)  result.ext = {};
                                        if (!result.tmpl) result.tmpl = {};

                                        if (result.parent) {
                                            comp.inherit(comp.$ctor, result.parent);
                                        }
                                        if (result.ext) {
                                            if (result.ext instanceof Array) {
                                                result.ext.push({ name: 'deps', value: sys().get('utils.get')(result.deps()) });
                                            }else if (result.deps) {
                                                result.ext.deps = sys().get('utils.get')(result.deps());
                                            }
                                            comp.ext(result.ext);
                                        }
                                        proto.conf = xtnd({}, proto.conf);
                                        if (result.events) {
                                            proto.conf.events  = xtnd(xtnd({}, proto.conf.events  || {}), result.events);
                                        }
                                        if (result.control) {
                                            proto.conf.control = xtnd(xtnd({}, proto.conf.control || {}), result.control);
                                        }
                                        if (result.data) {
                                            proto.conf.data    = xtnd(xtnd({}, proto.conf.data    || {}), result.data);
                                        }
                                        if (result.tmpl) {
                                            xtnd(proto.conf.data || (proto.conf.data = {}), { tmpl: result.tmpl });
                                        }

                                        return comp.$ctor;
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
                                        return sys().klass('Cont').of(location).bind(function(loc) {
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
                                    args: []
                                },
                                style: {
                                    method: 'bind',
                                    bind: 'Cont'
                                },
                                timeout: {
                                    args: [ 'utils.curry as curry' ]
                                }
                            }
                        }
                    };
                }),
        // === sys.loader === //
                (function() {
                    return {
                        type: 'IO',
                        path: 'sys',
                        loader: [
                            (function makeDetector(run) {
                                return function detect(def) {
                                    return run(def);
                                }
                            })(
                                (function detect(def) {
                                    var script = Array.prototype.concat.apply([],
                                    document.getElementsByTagName('head').item(0).getElementsByTagName('script')).filter(function(s) {
                                        return s.src.indexOf(def.name.replace(/\./g, '/')) >= 0;
                                    }).first();
                                    return script ? sys().find(script.getAttribute('data-ref')) : sys('script', def.name);
                                })
                            ),
                            (function makeEnqueue(makeWrap, makeOf, makeBind, makeSetRes, makeResult) {
                                return function enqueue() {
                                    return makeWrap(makeOf({
                                        scripts: this.eff('io.request.script').init(),
                                        components: this.eff('sys.loader.component').init(),
                                        modules: this.eff('sys.loader.component').init(),
                                        models: this.eff('io.request.script').init(),
                                        styles: this.eff('io.request.style').init(),
                                        templates: this.eff('io.request.script').init()
                                    }, this.klass('Obj'), makeBind, makeSetRes, makeResult), this.eff('sys.loader.detect').init());
                                }
                            })(
                                (function makeWrap(of, detect) {
                                    return function enqueue(def, run) {
                                        var store = detect.run(def, run);
                                        var cont  = store ? store.get('cont') : null;
                                        if (!cont) {
                                            cont = store.set('cont', of(def, run, {}).cont(true));
                                            cont.name = def.name;
                                            cont.ref  = store.uid();
                                        }
                                        return cont;
                                    };
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
                                        }else if (k == 'parent' || k == 'components' || k == 'modules' || k == 'models') {
                                            var val = v instanceof Array ? v : [ v ];
                                            var loc = k == 'parent' ? 'components' : k;
                                            var res = k == 'parent' ? r : (r[k] = {});
                                            return val.map(function(def, type) {
                                                var args = def instanceof Array ? def : [ def ];
                                                var name = args.shift(), opts = args.length ? args.shift() : { js: true };
                                                var path = loc + '/' + (name.indexOf('/') > 0 ? name : (name + '/' + name));
                                                var attr = k == 'parent' ? k : name;
                                                return res[attr] = eff[loc].run(path).bind(set(res, attr)).cont();
                                            });
                                        }else if (k == 'core' || k == 'helpers' || k == 'config') {
                                            var res = r[k] = {};
                                            return v.map(function(name) {
                                                return name == 'pure' ? sys().fn.pure((res[name] = sys))
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
                                (function(make) {
                                    var all = self.allResults = {};
                                    return function(res, name) {
                                        return make(all, res, name);
                                    }
                                })(
                                    (function makeSetRes(all, res, name) {
                                        return function(result) {
                                            all[name] || (all[name] = []);
                                            all[name].push(result);
                                            return res[name] = result;
                                        }
                                    })
                                ),
                                (function makeResult(run, deps) {
                                    return function() {
                                        var res  = run(deps);
                                        if (deps.parent) res.parent = deps.parent;
                                        res.deps = $const(deps);
                                        if (res.init) {
                                            return res.init(deps);
                                        }
                                        return res;
                                    }
                                })
                            ),
                            (function(make, wrap) {
                                return function component(ref) {
                                    return make(ref, wrap);
                                }
                            })(
                                (function(ref, wrap) {
                                    return sys(function(sys) {
                                        var path = ref.split('/');
                                        var name = path.last();
                                        var type = name.toCamel();
                                        var base = 'Component';
                                        var comp = sys.klass(type) || sys.klass(base).extend(type);
                                        var loca = path.length == 3 ? ref : [ base == 'Component' ? 'components' : 'modules', name, name ].join('/');
                                        var node = sys.get('script').get(path) || sys.get('script').ensure(path);
                                        var cont = sys.eff('io.request.script').run({ url: loca, ref: node.uid() });
                                        var make = cont.create || (cont.create = comp.$ctor.create || (comp.$ctor.create = wrap(comp, cont)));
                                        return path.length > 1 ? cont : make;
                                    });
                                }),
                                (function(comp, cont) {
                                    return function(opts) {
                                        return comp.$ctor.of(opts).make(cont);
                                    }
                                })
                            ),
                            (function module(name) {
                                return sys().eff('io.request.script').run([ 'modules', name, name ].join('/'));
                            }),
                            (function model(name) {
                                return sys().eff('io.request.script').run([ 'models', name, name ].join('/'));
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
    ))

);