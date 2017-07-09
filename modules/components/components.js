define(function() {

	return this.enqueue({

		name: 'modules.component',

		deps: {

			core: [ 'pure' ],

			components: [ 'view', 'layout', 'accordion', 'table', 'form', 'grid' ],

		}

	}, function() {

		return {

			ext: {
				main: function() {
					var app = this;
					var el  = this.view().$el().run();
					var lay = app.child('layout', app.deps('components.layout'));
					lay.grid(2, 3, function(elem, row, col) {
						if (col == 1) elem.classList.add('col-md-3', 'col-xs-4');
						else if (col) elem.classList.add('col-md-9', 'col-xs-8');
						return elem;
					}).bind(app.klass('Maybe').of).ap(app.view().parent('$fn.append')).run(function(r) {
						var m = r.first();
						app.deps('components.form').attach(m.map(function(e) {
							return e.children.item(0);
						}));
						app.deps('components.table').attach(m.map(function(e) {
							return e.children.item(1);
						}));
					});
				}
			},

			init: function(deps) {

				return deps('core.pure')(function(sys) {
					return function(app) {

						var module = sys.get('components.components');
						var accor  = app.deps('components.accordion').create(app.accor.call(module));
						var form   = app.deps('components.form').create({ name: 'form', parent: module });
						var table  = app.deps('components.table').create({ name: 'table', parent: module });

						return [ accor.pure(), form.pure(), table.pure() ].lift(function(a, f, t) {

							app.deps('components').accor = a;
							app.deps('components').form  = f;
							app.deps('components').table = t;

							return app;

						}).cont();
					}
				})(this);
			},

			accor: function() {
				return {
					parent: this,
					name: 'accor',
					control: {
						main: {
							data: function(name) {
								return this.items.get(name)||this.items.get('base');
							},
							items: {
								base: function(info, key) {
									var node = sys.find(info.id);;
									return key ? [ { name: key, key: key } ]
									: node.bind(function(v, k, i, o) {
										return { name: k, key: k };
									});
								},
								utils: function(info, key) {
									var node = sys.find(info.id);;
									return key ? [ { name: key, key: key } ]
									: node.bind(function(v, k, i, o) {
										return { name: k, key: k };
									}).select(function(x) {
										return x.key != 'point';
									});
								},
								effects: function(info) {
									var node = sys.find(info.id);;
									return node.map(function(tval, tkey) {
										return tval.get('factory').map(function(f, k) {
											return tval.get(k).map(function(v, t) {
												return { key: [ tkey, k, t ].join('.') };
											});
										});
									}).flatten();
								},
								types: function(info) {
									var node = sys.find(info.id);;
									return node.get('index').map(function(id) {
										return sys.find(id);
									}).bind(function(type) {
										var parent = type.parent();
										return { id: parent.uid(), key: type.get('type.$code') + '.type.fn.proto', path: parent.identifier() };
									});
								}
							},
							load: function(name) {
								var info = this.info(name);
								if (!info.done && (info.done = true)) {
									return this.data(name)(info).ap(info.$add);
								}
								return this.root();
							},
							change: function(evt) {
								var name = evt.ref.split('.').last();
								var info = this.info(name);
								if (evt.action == 'remove') {
									return info.$find.toMaybe().run('[data-key="'+evt.target+'"]').chain(function(elem) {
									  return elem.parentElement.removeChild(elem);
									});
								}else if (evt.action == 'create') {
									return this.tmpl(name)(sys.find(evt.uid), evt.target).ap(info.$add).run();
								}else if (evt.action == 'update') {
									
								}
							},
							show: function(evt) {
								var trg = evt.currentTarget;
								var key = trg.getAttribute('data-key');
								var res = trg.closest("[data-path]");
								if (res) res = res.getAttribute('id') || res.getAttribute('data-id');
								if (res) res = sys.find(res);
								if (res && key) this.root().set('data.current.item', res.uid() + '.' + key);
							},
							run: function() {
								return this.root().get('data').parse({
									main: [
										{ path: 'utils',   name: 'Utils' },

										{ path: 'effects', name: 'Effects' },

										{ path: 'types',   name: 'Types' },

										{ path: 'async',   name: 'Async' }
									]
								}, 1);
							}
						}
					}
				};
			}

		};

	});

});
