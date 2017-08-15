define(function() {

	return this.enqueue({

		name: 'modules.types',

		deps: {

			core: [ 'pure', 'instance' ],

			components: [ 'view', 'layout', 'accordion', 'modal', 'tabs', 'form', '$code-box', '$code-edit', 'drag-and-drop', 'nav-bar' ]

		}

	}, function() {

		return {

			ext: {
				main: function() {
					var el  = this.view().$el().run();
					var app = this;
					var lay = app.child('layout', app.deps('components.layout'));
					lay.grid([ 0, 2 ], [ 3, 1 ], function(elem, row, col) {
						if (col == 1) elem.classList.add('col-md-3', 'col-xs-4');
						else if (col) elem.classList.add('col-md-9', 'col-xs-8');
						return elem;
					}).bind(app.klass('Maybe').of).ap(app.$fn('append')).run(function(r) {
						var mdl = app.get('modal');

						mdl.read = mdl.view().read().run('main', { title: 'T123' });
						mdl.addButton('cancel', 'Cancel');
						mdl.addButton('delete', 'Delete', false);
						mdl.addButton('save', 'Save');
						mdl.addButton('run', 'Run');
						mdl.addButton('add', 'Add', false);
						mdl.read.attach.run(r.first().map(function(e) { return e.children.item(1); }));
						mdl.display('none');
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
						sys.klass('instance').load.of().run();
					});
					var nav = this.get('navbot');
					nav.$fn('attrs').run({ 'class': 'navbar-bottom' });
					nav.attach(this.$el('#r1'));
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
							if (evt.level < 5 && evt.target == 'dbid') {
								var node = sys.find(evt);
								this.add({ action: 'create', ref: node.identifier(), target: node.cid(), value: node });	
							}else if (evt.target == 'name') {
								this.root().get('accor').control('main').change(evt);
							}
						}else if (evt.action == 'remove' && evt.level < 4) {
							if (evt.value.get('dbid') < 0) {
								this.root().get('accor').control('main').change(evt);
							}
						}
					},
					order: function(evt) {
						if (evt.value && evt.value.drag && evt.value.drop) {
							var curr = this.root('tabs.data.main.data.%current');
							var drag = curr.get(evt.value.drag.getAttribute('data-bind-ext'));
							var drop = curr.get(evt.value.drop.getAttribute('data-bind-ext'));
							var inop = curr.get('inop');
							var vals = inop.get('nodes').filter(function(v, k, o, i) {
								return drag.cid() != v.cid();
							}).insert(parseInt(drop.cid()), drag.store()).map(function(v) {
								return v.values(true);
							});
							inop.children().clear();
							inop.parse(vals.reduce(function(r, v, i) {
								r[i+''] = v;
								return r;
							}, {}), true);
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
								if (tab == 'tab2') {
									var drag = root.get('drag');
									var home = drag.mixin({ opts: { draggable: '.draggable > .form-group' } }).run(f);
									var enbl = home.enable('.form', '.form-list');
									enbl.run();
								}
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
								this.all(evt);
								return evt.value;
							},
							all: function(evt) {
								this.node().lookup('modal.data.main.buttons').prop('map', function(v, k) {
									if (k == 'add') {
										v.$el.style.display = evt.value == 'tab2' ? 'block' : 'none';
									}else if (k == 'delete') {
										v.$el.style.display = evt.value == 'tab1' ? 'block' : 'none';
									}
								});
								return evt;
							},
							tab4: function(evt) {
								var node = this.node();
								var type = node.get('accor').item();
								if (type) node.lookup('codeb').chain(function(c) {
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
								link: function(type) {
									return (this._link || (this._link = this.node().get('data.items').link('valueMap'))).run(type);
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
									var item = sys.link('items', 'find').prop('run', path).unit();
									var type = item.get('type');
									if (!type) {
										return item;
									}else if (this.ctor.root().is(type)) {
										code = type.$code;
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
										if (!vals.argx) vals.argx = path.parts(1).quote();
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
								},
								inop: function(node) {
									var form = this.form('form2');
									var ctrl = form.control('main');
									var inop = node.children();

									form.$el('.form-list.inop').map(function(el) {
										return [].slice.call(el.children).map(function(e) {
											e.classList.add('hide');
											return e;
										});
									}).chain(function(items) {
										var count = items.length;
										inop.map(function(v, k, i) {
											if (count > i) {
												items[i].classList.remove('hide');
											}else {
												ctrl.list('inop');
											}
										});
										ctrl.init();
									});

									return node;
								}
							},
							pathref: function(evt) {
								if (evt.value) {
									this.$fn.load(evt.value);
								}
								return evt;
							},
							name: function(evt) {
								this.$fn.title(evt.value);
								return evt;
							},
							argm: function(evt) {
								if (evt.value && typeof evt.value == 'string') {
									if (!evt.value.match(/\s/) && !evt.value.match(/.*'.*/) && !evt.value.match(/^'.*'$/) && !evt.value.match(/^\{.*\}$/)) {
										sys.find(evt).set('argm', evt.value.quote());
									}
								}
								return evt;
							},
							inop: function(evt) {
								if (evt.action == 'create') {
									this.$fn.inop(evt.value);
								}
								return evt;
							},
							nodes: function(evt) {
								var form = this.$fn.form('form2');
								if (evt.action == 'remove') {
									this.$fn.inop(this.$fn.data('%current.inop'));
								}
								return evt;
							},
							add: function(evt) {
								var data = this.$fn.data('%current');
								var inst = this.$fn.inst(data.get('type'));
								var inop = data.get('inop');
								var name = '' + inop.children().length();
								inop.child(name).parse(inst.schema('inop'));
								this.$fn.inop(inop);
								return evt;
							},
							remove: function(evt) {
								if (evt.target == 'remove') {
									var data = this.$fn.data('%current');
									var inst = this.$fn.inst(data.get('type'));
									var inop = data.get('inop'), node;
									if (data.get(evt.value)) {
										data.clear(evt.value);
										node = inop.children().clear();
										inop.parse(node.keys().reduce(function(r, k, i) {
											r[i+''] = node[k];
											return r;
										}, {}), true);
									}
								}
								return evt;
							},
							make: function() {
								var data = this.$fn.data('%current');
								var inst = this.$fn.inst(data.get('type'));
								var node = inst.set(data, true);
								return inst;
							},
							save: function() {
								var inst  = this.make();
								var data  = this.$fn.data('%current');
								var modal = this.node().get('modal');
								inst.save().run(function(node) {
									if (node) data.parse(node.values(true), true);
									var save = modal.alert('success', { text: 'Data has been saved', style: false, run: '$toggle' });
									if (save.$toggle) save.$toggle.run();
								});
								return inst;
							},
							delete: function(evt) {
								var data = this.$fn.data('%current');
								data.set('dbid', Math.abs(data.get('dbid'))*-1);
								return evt;
							},
							cancel: function(evt) {
								var data = this.$fn.data('%current');
								var inst = this.$fn.inst(data.get('type'));
								var that = this;
								var path = this.$fn.data('pathref');
								var load = inst.ctor.load.of({ inid: data.get('dbid') });
								load.run(function() {
									return that.$fn.load(path);
								});
								return evt;
							},
							close: function(evt) {
								var node = this.node();
								node.get('accor').none();
								return evt;
							},
							run: function(evt) {
								var inst = this.make();
								var cont = inst.$run();
								cont.run(function(result) {
									console.log(result);
								});
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
						this.enqueue(this.atom(this.root().control('form').toggle, evt));
					},
					display: function(show) {
						var root  = this.root();
						var modal = root.get('modal');
						modal.display(show);
						var tabs  = root.get('tabs');
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
						var tabs = this.display(evt.value != '');
						var data = tabs.get('data.main.data');
						data.set('pathref', evt.value);
					},
					codeb: function(evt, hndl) {
						if (evt.value == 'tab4') {
							var root = this.root();
							var hndl = root.removeEventListener(hndl);
							var edit = root.component('codeb', 'code-box');
							return edit.once(function(cb) {
								var module = cb.module();
								var tabs   = module.get('tabs');
								cb.attach(tabs.pane('tab4').$pane);//module.$el('#r0c2'));
								module.control('tabs').toggle(evt);
							});
						}
					}
				},
				routes: {
					types: function(evt) {
						console.log(evt);
						return true;
					},
					programs: function(evt) {
						console.log(evt);
						return true;
					}
				}
			},

			init: function(deps) {

				return deps('core.pure')(function(sys) {
					return function(app) {

						var module = sys.get('components.types');
						var comps  = app.deps('components');
						var accor  = comps.accor = comps.accordion.create(app.accor.call(module));
						var navbot = app.deps('components.nav-bar').create({ name: 'navbot', parent: module });
						var modal  = comps.modal.create(app.modal.call(module));
						var tabs   = comps.tabs.create({ name: 'tabs', parent: module });
						var drag   = app.deps('components.drag-and-drop').create({ name: 'drag', parent: module });

						return [ tabs.pure(), navbot.pure(), modal.pure(), drag.pure() ].lift(function(t, n) {

							t.item({id:'tab1', path:'tab1', name: 'Init'});
							t.item({id:'tab2', path:'tab2', name: 'Extend'});
							t.item({id:'tab3', path:'tab3', name: 'Run'});
							t.item({id:'tab4', path:'tab4', name: 'Klass'});

							n.item({ id: 'types/types', name: 'Types' });
							n.item({ id: 'types/programs', name: 'Programs' });

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

			accor: function() {
				return {
					name: 'accor',
					parent: this,
					control: {
						main: {
							items: {
								base: function(type, info, key) {
									return sys.link('items', 'load').prop('run', type, info, key);
								}
							},
							run: function() {
								return this.root().get('data').parse({
									main: [
										{ path: 'types', name: 'Types' },
										{ path: 'effects', name: 'Effects' },
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
					'change:modal.button':'data.control.main.button',
					'change:drag.drop':'data.control.inst.order'
				}
			}

		};

	});

});
