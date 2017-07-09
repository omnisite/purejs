define(function() {
	return this.enqueue({

		name: 'system.test.dom',

		deps: {

			core: [ 'pure', 'dom' ],

			components: [ 'view' ]

		}

	}, function() {

		return {
			ext: {
				origin: function(plural) {

					return 'system';
				}
			},
			control: {

				main: {
					run: function() {

					}
				},

				test: {

					base: function() {

						var elem = sys.run().eff('dom.elements.make').init();
						var div  = elem.run('div').run();

						var getid = sys.klass('IO').pure(sys().fn.id);

						var getattrs = sys.klass('IO').pure(function(id) {
						  return { id: 'E'+id };
						});

						var makeattrs = getattrs.ap(getid).lift(function(base, ext) {
						  return sys('utils.extend')(base, ext);
						});

						var makediv = div.ap(makeattrs);

						var tmpl = sys.run().eff('io.request.script').map(function(x) {
						  return x.get('IO') || x.set('IO', x.klass('IO').of(x.store()).lift(function(node, key) {
						      return node.get(key);
						  }));
						});

						var tmplbase = tmpl.run({url:'templates/base.tmpl'});

						var html = sys.run().eff('dom.elements.html').init();

						return {

							makediv: makediv

						};

					},

					comp: function() {
						var comp = sys.klass('IO').of(sys('components')).lift(function(comps, path) {
							return comps.lookup(path);
						});

						var test = sys.run().eff('dom.calc.getSize').ap(comp.map(function(cmp) {
						 	return cmp.chain(function(c) {
								return c.$el ? c.$el().run() : null;
							});
						}));

						return {
							getCompSize: test
						};
					},

					drag: function() {
						var drag = sys.run().eff('sys.loader.component').run('components/drag-and-drop/drag-and-drop').create('drag', sys.get('components.home'));
						drag.run(function(drag) {
							var home = drag.mixin({ opts: { draggable: '.draggable tr' } }).run(sys.get('components.home'));
							var enbl = home.enable('.accordion', '.panel.panel-default');
							enbl.run();
						});
						return drag;
					},

					modal: function(name) {
						var modal = sys.run().eff('sys.loader.component').run('components/modal/modal').bind(function(x) {

							return x.create({ name: name || 'test-modal', parent: sys.get('components.home') }).pure();

						}).bind(function(mdl) {

							mdl.read = mdl.view().read().run('main', { title: 'T123' });

							mdl.addButton('close', 'Close');
							mdl.addButton('test', 'Test');

							mdl.addForm({
								method: { elem: 'dropdown',  label: 'Method',      options: [ 'Of', 'Pure', 'Lift' ] },
								arg1:   { elem: 'input',     label: 'Argument 1',  type: 'text',  placeholder: 'argument 1'  },
								arg2:   { elem: 'input',     label: 'Argument 2',  type: 'text',  placeholder: 'argument 2'  },
								run:    { elem: 'button',    label: 'Run',         type: 'button' }
							}, 'test-form');

							mdl.read.attach.run();
							mdl.toggle();
							return mdl;
						});

						return modal;
					},

					slideshow: function() {
						var show = sys.run().eff('sys.loader.component').run('components/slide-show/slide-show').bind(function(x) {

							return x.create({ name: 'slideshow', parent: sys.get('components.home') }).pure();

						}).run(function(mdl) {

							mdl.read = mdl.view().read().run('main', { title: 'T123', full: true });
							mdl.read.attach.run();
							mdl.renderBody('test-body', {});
							mdl.createControls();
							mdl.toggle();
							return mdl;
						});

						return show;
					}
				}
			}

		};

	});
});
