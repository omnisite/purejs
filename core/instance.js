define(function() {

	return this.enqueue({

		name: 'core.instance',

		deps: {

			core: [ 'pure', 'dom' ]

		}

	}, function() {

		return {

			init: function(deps) {
				return deps('core.pure')(function(sys) {
					return function(app) {
						return sys.klass('ctor').parse(app.klass());
					}
				})(this);
			},

			klass: function() {
				return {
					klass: function Instance(arg) {
						this.id = this.ctor.$id = this.id();

						if (this.$store.is(arg)) {
							this.init(arg.get('type')).set(arg);
						}else {
							this.init(arg);
						}
					},
					ext: [
						(function of(arg) {
							return new this.constructor(arg);
						}),
						(function init(arg) {
							var type = typeof arg == 'string' ? this.klass(arg) : arg;
							var code = this._type = type.$code, args, vals, inst, inid;
							var node = this.$store.get(code);
							if (!node) {
								node = this.$store.child(code);
								inid = node.set('inid', this.$fn.tmpid());
								args = node.set('args', this.$fn.args(type.$ctor));
								vals = node.set('vals', args.reduce(function(r, a) {
									if (a == 'x') r.vals.push(r.type.prop('mv'));
									if (a == 'f') r.vals.push(r.type.prop('mf'));
									return r;
								}, { type: type, vals: [] }).vals);
								inst = node.child('inst');
							}
							return this;
						}),
						(function title() {
							return this.lookup('inid').orElse(this.val('inid')).lift(function(inid, name) {
								return inid + (name ? (' - ' + name) : '');
							}).ap(this.lookup('name').orElse('')).unit();
						}),
						(function lookup(key) {
							return this.$store.get(this._type, 'inst').lookup('%current'.concat('.', key));
						}),
						(function get(key) {
							return this.$store.get(this._type, 'inst', '%current', key);
						}),
						(function val(key) {
							return this.$store.get(this._type, key);
						}),
						(function set(arg) {
							return this.node(arg);
						}),
						(function node(arg) {
							var store = this.$store.get(this._type, 'inst');
							var name  = store.is(arg) ? arg.get('name') : arg.name;
							var code  = name.toTypeCode();
							var isarg = store.is(arg);
							var inid  = isarg ? arg.get('inid') : arg.inid;
							if (inid == this.val('inid')) inid = this.$fn.inid();
							var node  = store.get(inid) || store.child(inid, this.$schema.$record);
							if (!isarg) {
								arg.inid = inid;
								node.parse(arg, true);
							}else if (!node.equals(arg)) {
								arg.set('inid', inid);
								node.parse(arg.values(true), true);
							}
							if (!this.$index.get(inid)) this.$index.set(inid, node.uid());
							return store.get(store.set('current', inid));
						}),
						(function data(vals, newid) {
							vals || (vals = {});
							vals.type = this._type;
							if (newid || !vals.inid) vals.inid = this.val('inid');
							var node  = this.$schema.control('main').add('inst', vals);
							if (!node.argx && this.has('x')) node.argx = this.arg('x') || '';
							if (this.has('f')) node.argf = this.$fn.toString(node.argf || this.arg('f'));
							return node;
						}),
						(function find(inid) {
							return this.maybe().lift(function(inst, uid) {
								return inst.of(inst.$store.find(uid));
							}).ap(this.$index.lookup(inid)).chain(function(inst) {
								return inst.make();
							});
						}),
						(function has(k) {
							var index = this.val('args').indexOf(k);
							return index > -1 ? true : false;
						}),
						(function arg(k) {
							var idx = this.val('args').indexOf(k);
							if (idx > -1) return this.val('vals').at(idx);
						}),
						(function cast(v) {
							try {
								if (typeof v == 'string') {
									return eval('(' + v + ')');
								}else {
									return v;
								}
							}catch(e) {
								console.log(e);
								return v;
							}
						}),
						(function fn() {
							var args = [].slice.call(arguments), result;
							var inst = args.shift();
							try {
								result = inst[args.shift()].apply(inst, args.map(this.cast));
							}catch(e) {
								console.log(e);
								result = inst;
							}
							return result;
						}),
						(function map(i, f) {
							return this.fn(i, 'map', f);
						}),
						(function bind(i, f) {
							return this.fn(i, 'bind', f);
						}),
						(function ap(i, m) {
							if (typeof m == 'string') {
								return this.fn(i, 'ap', this.find(this.cast(m)));
							}else {
								return this.fn(i, 'ap', m);
							}
						}),
						(function chain() {
							var args = [].slice.call(arguments);
							return this.fn.apply(this, [ args.shift(), 'chain' ].concat(args));
						}),
						(function make() {
							var type  = this.get('type');
							var klass = this.klass(type);
							var inst  = klass[this.get('func') || 'of'].apply(klass, this.val('args').reduce(function(r, a) {
								var arg = r.inst.get('arg'+a);
								if (arg) r.vals.push(r.inst.cast(arg));
								return r;
							}, { vals: [], inst: this }).vals);

							var inop = this.get('inop');
							if (inop && inop.length()) {
								inst = inop.reduce(function(r, v) {
									var ext = {};
									if ((ext.method = v.get('method')) && (ext.argm = v.get('argm'))) {
										r.inst = r.self[ext.method.toLowerCase()](r.inst, ext.argm);
									}
									return r;
								}, { self: this, inst: inst }).inst;
							}
							return inst;
						}),
						(function run() {
							var args = [].slice.call(arguments);
							if (!args.length) {
								var argr = this.get('argr');
								if (argr) args.push(argr);
							}
							args.unshift(this.make(), 'run');
							return this.fn.apply(this, args);
						})
					],
					schema: {
						inst: {
							fields: {
								inid: 	{ type: 'string',   elem: { tag: 'input',	  label: 'INID', type: 'text', placeholder: 'inid'  } },
								dbid: 	{ type: 'string',   elem: { tag: 'input',	  label: 'DBID', type: 'text', placeholder: 'dbid'  } },
								name: 	{ type: 'string',   elem: { tag: 'input',	  label: 'Name', type: 'text', placeholder: 'name'  } },
								type:   { type: 'string',   elem: { tag: 'select',    label: 'Type', data: 'options:components.types.data.items.types', options: [] } },
								func: 	{ type: 'string',   defv: 'of', elem: { tag: 'select',    label: 'Func', options: [ 'of', 'pure', 'lift' ], empty: false } },
								argx:   { type: 'function', elem: { tag: 'component', label: 'Argument X', klass: 'code-edit', attrs: { style: { display: 'none' } } } },
								argf:   { type: 'function', elem: { tag: 'component', label: 'Argument F', klass: 'code-edit', attrs: { style: { display: 'none' } } } },
								// method: { type: 'string',   elem: { tag: 'select',    label: 'Method', options: [ 'Map', 'Bind', 'Lift', 'Ap', 'Chain' ] } },
								// argm:   { type: 'function', elem: { tag: 'component', label: 'Argument to Method', klass: 'code-edit' } },
								argr:   { type: 'function', elem: { tag: 'component', label: 'Argument to Run', klass: 'code-edit' } }
							},
							nodes: {
								inop:   { type: 'schema' }
							}
						},
						inop: {
							fields: {
								dbid: 	{ type: 'string',   elem: { tag: 'input',	  label: 'DBID', type: 'text', placeholder: 'dbid'  } },
								method: { type: 'string',   elem: { tag: 'select',    label: 'Method', options: [ 'Map', 'Bind', 'Lift', 'Ap', 'Chain' ] } },
								argm:   { type: 'function', elem: { tag: 'component', label: 'Argument to Method', klass: 'code-edit' } }
							}
						}
					},
					parse: function() {
						return sys.klass('io').pure(function(klass) {
							return this.fx(function(item) {
								if (item && item.data && item.data.type) {
									var data  = item.data;
									var inst  = klass.of(data.type);
									data.dbid = parseInt(item.dbid);
									data.inid = item.inid || ('DB' + (1000000 + data.dbid));
									var node  = inst.set(inst.data(data));
									return node;
								}
							});
						});
					},
					load: function() {
						return sys.klass('Cont').of(sys.get('async.request')({
							url: 'server/load-main-instance.php', parse: true
						})).ap(this).bind(function(r) {
							return r.collect();
						});
					},
					kont: function() {
                        return sys.klass('Cont').extend(
                            function SaveInstanceCont(mv, mf) {
                                this.$super(mv, mf);
                            }, {
                                mf: sys.get('async.request')
                            }, {
                                of: function(node) {
                                    return new this({
										url: 'server/save-main-instance.php',
										type: 'POST', parse: true,
										data: JSON.stringify({
											inid: node.get('inid'),
											dbid: node.get('dbid'),
											type: node.get('type'),
											data: node.values(true, true)
										})
									});
                                }
                            }
                        ).$ctor;
                    },
                    save: function(cont) {
                    	return function() {
                    		return cont.of(this.get()).lift(this.$fn.parse);
                    	}
                    },
					init: function(type, klass, sys) {
						var parse = type.parse().run(klass);
						klass.prop('$fn', {
							args: sys.get('utils.getArgs'), toString: sys.get('utils.toString'),
                            inid: this.makeID('IN'), tmpid: this.makeID('TMP'), parse: parse
						});
						var store = klass.prop('$store', sys.get().child('instance'));
						var index = klass.prop('$index', store.child('index'));
						var lstnr = sys.klass('Listener').$ctor;
						store.listener = lstnr.init('instance', 'store');
						store._events  = sys.get('events').child({ name: 'events', parent: store });
						var schema = klass.prop('$schema', sys.get('schema').child('$instance'));
						schema.parse(type.schema, 3, true);
						klass.prop('save', type.save(type.kont()));
						klass.constructor.prototype.load = type.load.call(parse);
					}
				};
			}

		};

	});

});
