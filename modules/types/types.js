define(function() {

	return this.enqueue({

		name: 'modules.types',

		deps: {

			core: [ 'pure' ],

			components: [ 'view', 'layout', 'accordion', 'table', '$form', 'grid', '$code-edit' ]

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
						var m = r.first();
						app.deps('components.accor').attach(m.map(function(e) { return e.children.item(0); }));
						app.deps('components.form').attach(m.map(function(e) { return e.children.item(1); }));
					});
				}
			},

			init: function(deps) {

				return deps('core.pure')(function(sys) {
					return function(app) {

						var module = sys.get('components.types');
						var accor  = app.deps('components.accordion').create(app.accor.call(module));
						var form   = app.deps('components.form').create({ name: 'form', parent: module });
						var table  = app.deps('components.table').create({ name: 'table', parent: module });

						return [ accor.pure(), form.pure(), table.pure() ].lift(function(a, f, t) {

							a.control('main').run();
							a.observe('change', 'data.current.item', 'data.control.main.codeb');

							app.deps('components').accor = a;
							app.deps('components').form  = f.control('main').fields('data.main', app.fields);
							app.deps('components').table = t.control('main').render(app.table);

							return app;

						}).cont();
					}
				})(this);
			},

			fields: {
				method: { elem: 'dropdown',  label: 'Method',      options: [ 'Of', 'Pure', 'Lift' ] },
				arg1:   { elem: 'input',     label: 'Argument 1',  type: 'text',  placeholder: 'argument 1'  },
				arg2:   { elem: 'input',     label: 'Argument 2',  type: 'text',  placeholder: 'argument 2'  },
				run:  	{ elem: 'button',    label: 'Run',         type: 'button' }
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
								base: function(info, key) {
									var node = sys.find(info.id);;
									return key ? [ { name: key, key: key } ]
									: node.bind(function(v, k, i, o) {
										return { name: k, key: k };
									});
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
								return root.component('codee', 'code-edit').once(function(cb) {
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
										{ path: 'types',   name: 'Types' }
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
