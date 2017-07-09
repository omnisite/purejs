define(function() {
	return this.enqueue({

		name: 'modules.application',

		deps: {

			core: [ 'pure', 'dom' ],

			components: [ 'view', 'nav-bar', 'layout', 'accordion', 'grid', '$code-box' ]

		}

	}, function() {

		return {

			ext: {
				main: function() {
					var el  = this.view().$el().run();
					var app = this;
					app.deps('components.nav').attach(document.body);
					var lay = app.child('layout', app.deps('components.layout'));
					lay.grid(2, 3, function(elem, row, col) {
						if (col == 1) elem.classList.add('col-md-3', 'col-xs-4');
						else if (col) elem.classList.add('col-md-9', 'col-xs-8');
						return elem;
					}).bind(app.klass('Maybe').of).ap(app.$fn('append')).run(function(r) {
						var m = r.first();
						var c = m.chain(function(e) { return e.children.item(0); });
						app.deps('components.accor').attach(c);
					});
				}
			},

			init: function(deps) {

				return deps('core.pure')(function(sys) {
					return function(app) {

						var module = sys.get('components.home');
						var navbr  = app.deps('components.nav-bar').create('navbar');
						var accor  = app.deps('components.accordion').create(app.accor.call(module));

						return [ navbr.pure(), accor.pure() ].lift(function(n, a) {

							n.item({ id: 'home', name: 'Home' });
							n.item({ id: 'find', name: 'Find' });
							n.menu({ id: 'options', name: 'Options' }).run(function(opts) {
								opts.item({ id: 'animation', name: 'Animation' });
								opts.item({ id: 'effects',   name: 'Effects'   });
								n.item({ id: 'components', name: 'Components' });
								n.item({ id: 'types', name: 'Types' });
							});

							a.control('main').run();
							a.observe('change', 'data.current.item', 'data.control.main.codeb');

							app.deps('components').nav   = n;
							app.deps('components').accor = a;

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
							codeb: function(evt) {
								var root = this.root().parent();
								var hndl = root.removeEventListener(evt);
								return root.component('codeb', 'code-box').once(function(cb) {
									var module = cb.module();
									var accor  = module.get('accor');
									cb.attach(module.$el('#r0c2'));
									module.observe(accor, 'change', 'data.current.item', cb.show.bind(cb));
									cb.show(evt);
								}, true);
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
