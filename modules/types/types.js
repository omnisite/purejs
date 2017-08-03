define(function() {

	return this.enqueue({

		name: 'modules.types',

		deps: {

			core: [ 'pure', 'instance' ],

			components: [ 'view', 'layout', 'accordion', 'tabs', '$form', '$code-edit', 'modal' ]

		}

	}, function() {

		return {

			ext: {
				main: function() {
					var el  = this.view().$el().run();
					var app = this;
					var lay = app.child('layout', app.deps('components.layout'));
					lay.grid(2, 3, function(elem, row, col) {
						if (col == 1) elem.classList.add('col-md-3', 'col-xs-4');
						else if (col) elem.classList.add('col-md-9', 'col-xs-8');
						return elem;
					}).bind(app.klass('Maybe').of).ap(app.$fn('append')).run(function(r) {
						var mdl = app.get('modal');

						mdl.read = mdl.view().read().run('main', { title: 'T123' });
						mdl.addButton('cancel', 'Cancel');
						mdl.addButton('save', 'Save');
						mdl.addButton('run', 'Run');
						mdl.read.attach.run(r.first().map(function(e) { return e.children.item(1); }));
						mdl.display('block');
						mdl.proxy('click', 'button', 'modal.button');

						var tabs = app.get('tabs');
						tabs.attach(mdl.get('data.tmpl.body').run());
						app.observe(tabs, 'change', 'state.current', app.handler('data.control.main.codeb'));
						app.observe(tabs, 'change', 'data.main.tabs.%', app.handler('data.control.tabs.init'));
						app.observe(sys.get('instance'), 'change', '%.inst.%', 'data.control.inst.change');
					});
				},
				initialize: function() {
					this.control('main').accor().cont().run(function(accor) {
						sys.klass('instance').load.run();
					});
				}
			},
			control: {
				inst: {
					init: function(code) {
						var root = this.root();
						var inst = root.get('data.main.inst', code);
						if (!inst) {
							inst = root.get('data.main.inst').set(code, root.deps('core.instance').of(code));
						}
						return inst;
					},
					add: function(evt) {
						return this.root().get('accor').control('main').change(evt);
					},
					change: function(evt) {
						if (evt.action == 'create' && evt.value && evt.value.isStore) {
							if (evt.level < 4 && evt.value.get('dbid')) {
								this.add(evt);
							}
						}else if (evt.action == 'update') {
							if (evt.target == 'dbid') {
								var node = sys.find(evt);
								this.add({ action: 'create', ref: node.identifier(), target: node.cid(), value: node });	
							}else if (evt.target == 'name') {
								this.root().get('accor').control('main').change(evt);
							}
						}
					}
				},
				tabs: {
					init: function(evt, hndl) {
						if (evt.action == 'init' && evt.target < 'tab4') {
							var root = this.root();
							var tab  = evt.target;
							var form = root.component('tabs.' + tab.replace('tab', 'form'), 'form');
							form.run(function(f) {
								f.fields(root.control('tabs').fields(tab), true);
								f.attach(root.get('tabs').pane(tab).$pane);
							});
							if ((this._done || (this._done = 1)) && this._done++ == 3) root.removeEventListener(hndl);
						}
					},
					fields: function(tab) {
						return (this._fields || (this._fields = this.of(sys.get('schema.$instance').control('main').add('inst', true)).map(function(r, v, k) {
							if (!r.result[r.map[k]||'tab1']) r.result[r.map[k]||'tab1'] = {};
							r.result[r.map[k]||'tab1'][k] = v;
							return r;
						}, { result: this.of({}), map: { inop: 'tab2', method: 'tab2', argm: 'tab2', argr: 'tab3'} }).result)).get(tab);
					},
					map: function() {
						return this.root().vmap('emap.tabs', {
							$$map: function(evt) {
								return evt.value;
							},
							tab4: function(evt) {
								var node = this.node();
								var tabs = node.get('tabs');
								var type = tabs.get('data.main.data.%current.type');
								if (type) node.lookup('codee').chain(function(c) {
									return c.show(type);
								});
								return evt;
							}
						});
					},
					toggle: function(evt) {
						return this.map().run(evt);
					}
				},
				form: {
					map: function() {
						return this.root().vmap('emap.form', {
							$$map: function(evt) {
								if (evt.target == 'button') {
									return evt.value;
								}else {
									return evt.target;
								}
							},
							$fn: {
								node: function() {
									return this.root().node();
								},
								data: function(path) {
									return this.node().get('tabs.data.main.data', path);
								},
								inst: function(type) {
									return this.node().control('inst').init(type);
								},
								curr: function() {
									return this.data('%current');
								},
								form: function(name, path) {
									return this.node().get('tabs', name, path);
								},
								disp: function() {
									return (this._disp || (this._disp = this.form('form1', 'view').eff('display')));
								},
								find: function() {
									return (this._find || (this._find = this.form('form1', '$fn.find')));
								},
								show: function() {
									return (this._show || (this._show = this.disp().nest().lift(function(disp, find) {
										return this.fx(function(arg, show) {
											return find.map(function(elem) {
												return disp.run(elem.closest('.form-group'))(show ? 'block' : 'none');
											}).run(arg);
										});
									}).run(this.find())));
								},
								title: function(name) {
									var data = this.data('%current');
									return this.node().get('modal.data.main.header').set('title', data.get('inid').concat(' - ', name));
								},
								load: function(path) {
									var data = this.data(), code;
									var item = sys.find(path) || sys.get(path);
									var type = item.get('type');
									if (!type) {
										return item;
									}else if (this.ctor.root().is(type)) {
										code = type.$code;
										var inst = this.inst(code);
										var node = data.child(data.set('current', code), inst.$schema.$record);
										var vals = inst.data();
									}else if (item.type == 'Instruction') {
										code = type;
										var inst = this.inst(code);
										var node = data.child(data.set('current', code), inst.$schema.$record);
										var vals = inst.data();
									}else {
										code = type;
										var inst = this.inst(code);
										var node = data.child(data.set('current', code), inst.$schema.$record);
										var vals = item.values(true);
									}
									if (code == '$effio') {
										if (!vals.name) vals.name = path;
										if (!vals.argx) vals.argx = path.quote();
									}
									node.children().clear();
									node.clear();
									node.parse(vals, true);
									this.show().run('#argx', inst.has('x'));
									this.show().run('#argf', inst.has('f'));

									var tabs = this.node().get('tabs');
									if (tabs.tab() == 'tab4') {
										tabs.emit('change', 'state.current', 'update', 'tab4');
									}
									return item;
								}
							},
							pathref: function(evt) {
								this.$fn.load(evt.value);
								return evt;
							},
							name: function(evt) {
								this.$fn.title(evt.value);
								return evt;
							},
							inop: function(evt) {
								var form = this.$fn.form('form2');
								var ctrl = form.control('main');
								var inop = evt.value.children();
								if (evt.action == 'create') {
									form.$el('.form-list.inop').chain(function(el) {
										var count = el.childElementCount;
										var items = el.children;
										inop.map(function(v, k, i) {
											if (count > i) {
												items.item(i).classList.remove('hide');
											}else {
												ctrl.list('inop');
											}
										});
										ctrl.init();
									});
								}
								return evt;
							},
							nodes: function(evt) {
								var form = this.$fn.form('form2');
								if (evt.action == 'remove') {
									form.$el('.form-list.inop').map(function(el) {
										return [].slice.call(el.children).map(function(e) {
											e.classList.add('hide');
											return e;
										});
									});
								}
								return evt;

								var data = this.$fn.data('%current');
								evt.value.keys().map(function(k) {
									var path = [ 'nodes', k ];
									var node = evt.value[k];
									node.map(function(v, i) {
										return v.keys().map(function(a) {
											var ref = path.concat(i, a).join('.');
											data.emit('change', ref, 'update', v[a]);
										});
									});
								});
								return evt;
							},
							make: function() {
								var data = this.$fn.data('%current');
								var inst = this.$fn.inst(data.get('type'));
								var node = inst.set(data);
								return inst;
							},
							save: function() {
								var inst = this.make();
								var data = this.$fn.data('%current');
								inst.save().run(function(node) {
									if (node) data.parse(node.values(true), true);
								});
								return inst;
							},
							run: function(evt) {
								var inst = this.make();
								var result = inst.run();
								console.log(result);
								return evt;
							}
						});
					},
					toggle: function() {
						return (this.toggle = this.map().ftor());
					}
				},
				main: {
					button: function(evt) {
						return this.root().control('form').toggle(evt);
					},
					show: function() {
						var root = this.root();
						var tabs = root.get('tabs');
						if (!tabs.tab()) {
							tabs.display('block');
							tabs.tab('tab1');
						}
						return tabs;
					},
					accor: function() {
						var root  = this.root();
						var accor = root.deps('components.accor');
						return accor.once(function(a) {
							a.control('main').run();
							a.observe('change', 'data.current.item', root.handler('data.control.main.toggle'));
							root.$fn('find').map(function(elem) {
								a.attach(elem);
								a.toggle('types');
							}).run('#r0c1');
						});
					},
					toggle: function(evt) {
						var root = this.root();
						var tabs = this.show();
						var data = tabs.get('data.main.data');
						data.set('pathref', evt.value);
					},
					codeb: function(evt, hndl) {
						if (evt.value == 'tab4') {
							var root = this.root();
							var hndl = root.removeEventListener(hndl);
							var edit = root.component('codee', 'code-edit');
							return edit.once(function(cb) {
								var module = cb.module();
								var tabs   = module.get('tabs');
								cb.attach(tabs.pane('tab4').$pane);//module.$el('#r0c2'));
								module.control('tabs').toggle(evt);
							});
						}
					}
				}
			},
			init: function(deps) {

				return deps('core.pure')(function(sys) {
					return function(app) {

						var module = sys.get('components.types');
						var comps  = app.deps('components');
						var accor  = comps.accor = comps.accordion.create(app.accor.call(module));
						var modal  = comps.modal.create(app.modal.call(module));
						var tabs   = comps.tabs.create({ name: 'tabs', parent: module });
                        var items  = module.link().make('data.items.items', 'valueMap', app.items).add('items', {}, 'base');

						return [ tabs.pure(), modal.pure() ].lift(function(t) {

							t.item({id:'tab1', path:'tab1', name: 'Init'});
							t.item({id:'tab2', path:'tab2', name: 'Extend'});
							t.item({id:'tab3', path:'tab3', name: 'Run'});
							t.item({id:'tab4', path:'tab4', name: 'Klass'});

							comps.tabs = t;

							return app;

						}).cont();
					}
				})(this);
			},

			modal: function() {
				return {
					name: 'modal',
					parent: this,
					tmpl: {

						attr: function() {

							return { 'class' : 'modal inline', 'role' : 'form' };
						}
					}
				};
			},

			table: {
				name:  { 'class': 'h2', 'innerText': 'Result'  }
			},

			items: {
				base: function(info, key) {
					var node = sys.find(info.id);
					return key ? [ { name: key, key: key } ]
					: node.bind(function(v, k, i, o) {
						return { name: k, key: k };
					});
				},
				types: function(info) {
					var node = info && info.id ? sys.find(info.id) : sys.get('types');
					var iofn = sys.klass('io').pure(function(v, k) {
						if (k == 'type') {
							var type = v.$store;
							var code = type.get('type.$code');
							var parent = type.parent();
							return { id: parent.uid(), label: code, key: code, path: parent.identifier() };
						}else {
							var type = v;
							var code = type.get('type.$code');
							var parent = type.parent();
							return { id: parent.uid(), label: code, key: code, path: parent.identifier() };
						}
					});	
					return node.get('$functor').map(function(v, k) {
						return iofn.run(v, k);
					}).concat([ '$link', '$free', '$control', '$effio' ].map(function(v) {
						return iofn.run(sys.klass(v), 'type');
					}));
				},
				effects: function(info) {
					var node = sys.find(info.id);;
					return node.map(function(tval, tkey) {
						return tval.get('factory').map(function(f, k) {
							return tval.get(k).map(function(v, t) {
								return { key: [ 'eff', tkey, k, t ].join('.') };
							});
						});
					}).flatten();
				},
				instance: function(info, key) {
					if (key) {
						var node;
						if (info.value && info.value.isStore) {
							node = info.value;
							return [ { id: node.parent().uid(), name: node.get('name'), path: node.identifier(), key: key } ];
						}else if ((node = sys.find(info.uid))) {
							return [ { id: node.parent().uid(), name: info.value, path: info.ref, key: node.cid() } ];
						}
					}else {
						var node = sys.get('instance');
						return node.reduce(function(r, v, k) {
							if (v.isStore && v.has('inst')) {
								v.get('inst').map(function(v, k, n, o) {
									if (k != 'current') r.push({ id: o.uid(), name: v.get('name'), path: v.identifier(), key: k });
								});
							}
							return r;
						}, []);
					}
				}
			},

			accor: function() {
				return {
					name: 'accor',
					parent: this,
					control: {
						main: {
							link: function() {
								return (this._link || (this._link = this.root().parent('data.items').link('valueMap')));
							},
							items: {
								base: function(info, key) {
									return this.link().run('base')(info, key);
								},
								types: function(info, key) {
									return this.link().run('types')(info, key);
								},
								effects: function(info, key) {
									return this.link().run('effects')(info, key);
								},
								instance: function(info, key) {
									return this.link().run('instance')(info, key);
								}
							},
							run: function() {
								return this.root().get('data').parse({
									main: [
										{ path: 'types', name: 'Types' },
										{ path: 'effects', name: 'Effects', noid: true },
										{ path: 'instance', name: 'Instance' }
									]
								}, 1);
							}
						}
					}
				};
			},

			data: {
				main: {
					inst: {}
				}
			},

			events: {
				data: {
					'change:tabs.state.current':'data.control.tabs.toggle',
					'change:tabs.data.main.data.%':'data.control.form.fn.toggle',
					'change:modal.button':'data.control.main.button'
				}
			}

		};

	});

});
