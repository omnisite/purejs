define(function() {
	return this.enqueue({

		name: 'modules.application',

		deps: {

			core: [ 'pure', 'dom', 'instance' ],

			components: [ 'view', 'nav-bar', 'layout', 'accordion', 'grid', '$code-box' ]

		}

	}, function() {

		return {

			ext: {
				main: function() {
					var app = this, el = this.view().$el().run();
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
				},
				play: function() {
					sys.get('router').navigate('');
				},
				info: function() {
					var show;
					if ((show = sys.get('components.slideshow'))) {
						show.toggle();
					}else {
						sys.eff('sys.loader.component').run('components/slide-show/slide-show').bind(function(x) {

							return x.create({ name: 'slideshow' }).pure();

						}).run(function(mdl) {
						  
							mdl.read = mdl.view().read().run('main', { title: 'PureJS Info', full: true });
							mdl.read.attach.run();
							mdl.create();
							mdl.createTest();
							mdl.toggle();
							return mdl;
						});
					}
				},
				test: function(comp) {
					return sys.eff('sys.loader.module').run('system', 'system').bind(function(mod) {
						var item = mod.component(comp, 'system.test', comp);
						return item.pure ? item.pure() : item;
					}).bind(function(test) {
						return test.control('test');
					});
				}
			},
			control: {
				main: {
					codeb: function(evt) {
						var root = this.root();
						var hndl = root.removeEventListener(evt);
						return root.component('codeb', 'code-box').once(function(cb) {
							var module = cb.module();
							var accor  = module.get('accor');
							cb.attach(module.$el('#r0c2'));
							var handlr = module.handler('data.control.main.show');
							var obsrvr = module.observe(accor, 'change', 'data.current.item', handlr);
							handlr(evt);
						}, true);
					},
					show: function(evt) {
						this.root().get('codeb').show(evt);
					}
				}
			},
			init: function(deps) {

				return deps('core.pure')(function(sys) {
					return function(app) {

						var comps  = sys.get('components');
						comps.initialize = app.navbar;

						var module = comps.get('app');
						var navbr  = app.deps('components.nav-bar').create('navbar');
						var accor  = app.deps('components.accordion').create(app.accor.call(module));

						return [ navbr.pure(), accor.pure() ].lift(function(n, a) {

							n.item({ id: 'app', name: 'Home' });
							n.item({ id: 'find', name: 'Find' });
							n.menu({ id: 'options', name: 'Options' }).run(function(opts) {
								opts.item({ id: 'animation', name: 'Animation' });
								opts.item({ id: 'effects',   name: 'Effects'   });
								n.item({ id: 'types', name: 'Types' });
								n.item({ id: 'play', glyph: 'glyphicon-play-circle', 'class': 'pull-right', href: 'Javascript:' });
								n.on('click', '[data-id="play"]', module.play.bind(module));
								n.item({ id: 'info', glyph: 'glyphicon-info-sign', 'class': 'pull-right', href: 'Javascript:' });
								n.on('click', '[data-id="info"]', module.info.bind(module));
							});

							a.control('main').run();
							module.observe(a, 'change', 'data.current.item', 'data.control.main.codeb');

							app.deps('components').nav   = n;
							app.deps('components').accor = a;

							return app;

						}).cont();
					}
				})(this);
			},

			navbar: function() {
				this.get('navbar').attach(document.body);
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
