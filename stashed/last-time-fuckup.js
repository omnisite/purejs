        // === Module === //
            (function() {
                return {
                    parent: 'Node',
                    klass: function Module(opts) {
                        //this.$$_ctor(opts);
                        this.$super.call(this, opts);
                    },
                    ext: [
                        { name: '_children', value: 'modules' },
                        (function initialize() {
                        }),
                        (function onAttach() {
                            this.initialize();
                        }),
                        (function origin() {

                            return 'component';
                        }),
                        (function attr() {

                            return { 'class' : this.constructor.name.toLowerCase() + ' ' + this.origin() };
                        }),
                        (function view() {
                            return (this.view = $const(this.store().child({ name: 'view', dom: this.parent('view.dom') }, this.klass('view').$ctor)))();
                        }),
                        (function state(key, value) {
                            return (this._state || (this._state = this.node('state'))).acc(key, value);
                        }),
                        (function attach(selector) {
                            return this.view().parent('$fn.attach').run(this.state('attach', selector || ''));
                        }),
                        (function display(state) {
                            return this.view().parent('$fn.display').run(this.state('display', state || ''));
                        }),
                        (function update() {
                        }),
                        (function events() {
                            var comp = this, events, list = [];
                            if ((events = this.get('data.events.data'))) {
                                list.push(events.store().bind(function(method, evt) {
                                    comp.observe.apply(comp, evt.split(':').append(typeof method == 'string'
                                        ? comp.func(method) : method));
                                }));
                            }
                            if ((events = this.get('data.events.dom'))) {
                                list.push(events.store().bind(function(method, evt) {
                                    return comp.on.apply(comp, evt.split(':').append(method));
                                }));
                            }
                            if (!list.length) {
                                comp.parse();
                                comp.main();
                                comp.start();
                            }
                            return list.length ? list.fmap(function() {
                                comp.parse();
                                comp.main();
                                comp.start();
                                return comp;
                            }) : this;
                        }),
                        (function proxy(name, selector, path, value) {
                            return ((this._proxy || (this._proxy = this.node('proxy'))).get(name)
                                || (this._proxy.child(name))).set(selector.split('.').first(), { selector: selector, path: path });
                        }),
                        (function $proxy(evt, proxy) {
                            if (proxy && evt.target.matches(proxy.selector))
                                this.emit('change', proxy.path, (evt.target.value || evt.target.innerText || '').toLowerCase());
                        }),
                        (function control() {
                            return this.get([ 'data.control' ].concat([].slice.call(arguments)).join('.'));
                        }),
                        (function $fn(name) {
                            return this.get('$fn', name);
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
                                id: this.uid(), main: {}, current: {}, tmpl: { attr: $const({ 'class' : this.get('type') }) } }, true));

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
                                        this.data({ tmpl: this.extend(this.conf.data.tmpl, cdata.tmpl) });

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
                        (function make(cont) {
                            this._cont = cont.bind(this.cont(function(klass) {
                                if (this.conf.data && this.conf.data.tmpl)
                                    this.data({ tmpl: this.conf.data.tmpl });//this.extend(this.conf.data.tmpl, this.get('data.tmpl').values(true)) });
                                if (this.conf.events) this.data({ events: this.conf.events });
                                if (this.conf.data && this.conf.data.events) this.data({ events: this.conf.data.events });
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
                        (function of(opts) {
                            var args  = [].slice.apply(arguments);
                            var conf  = typeof args[0] == 'object' ? args.shift() : {};
                            var code  = conf.code = this.name.toDash();

                            var type  = this.ctor.prop('origin');
                            console.log(type, this, opts)
                            var node  = this.ctor.prop('_node');
                            if (!conf.parent) conf.parent = node;
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
                            return conf.parent && conf.parent.child ? conf.parent.child(conf, this) : node.child(conf, this);
                        })
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
                        var proto  = klass.proto(), ctor = klass.$ctor;
                        proto.conf = { opts: { js: true, css: false, tmpl: true } };
                        proto.$eff = {};
                        proto.cont = sys.get('utils.call1')(type.cont);
                        var node   = proto._node = sys.root.child('system', ctor);
                        var evts   = proto._events = node.child('events', sys.klass('Events').$ctor);
                        var lstr   = sys.klass('Listener').$ctor;
                        proto.dispatcher = proto.listener.run(node);
                        proto.done = type.done(sys.klass('Cell'));
                        proto.dom  = lstr.init('dom');
                    }
                };
            }),
