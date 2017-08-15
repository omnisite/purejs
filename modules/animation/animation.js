define(function() {

	return this.enqueue({

		name: 'modules.animation',

		deps: {

			core: [ 'pure', 'dom' ],

			components: [ 'view', 'grid', '$form' ],

			css: [ 'animation' ]

		}

	}, function() {

		return {
			init: function(deps) {

				return deps('core.pure')(function(sys) {
					return function(app) {

						var module = sys.get('components.animation');
						var grid   = app.deps('components.grid').create({ name: 'grid', parent: module });
						var form   = app.deps('components.form').create({ name: 'form', parent: module });

						return [ grid.pure(), form.pure() ].lift(function(g, f, b) {

							app.deps('components').grid = g;
							app.deps('components').form = f.fields(app.fields, 'data.main', true);

							return app;

						}).cont();
					}
				})(this);
			},
			ext: {
				main: function() {
					var el = this.view().$el().run();
					this.deps('components.grid').attach(el);
					this.deps('components.form').attach(el);
					this.display('none');
					this.attach('#root');
				},
				animate: function() {
					return this.get('data.control.main').animate().run();
				},
				initialize: function() {
					var form = this.deps('components.form');
					this.get('data.control.main').animate(form.get('data.main').parse({
						ms: 600, st: 20, rpt: 1, rows: 2, cols: 4, easing: 'swing'
					}).values()).run(function(anim) {
						form.get('data.main').parse(form.get('data.main').clear());
						form.proxy('click', 'button', 'form.run');
						return anim;
					});
				}
			},
			control: {
				main: {
					animate: function() {
						var form = this.call('deps.components.form');
						var grid = this.call('deps.components.grid');
						var opts = form.get('data.main').values();
						var data = this.root('data');
						var ctrl = this;
						if (opts) {
							return ctrl.run(opts).bind(function(a) {
								return data.set('anim', a).run();
							}).cont();
						}else {
							return data.get('anim');
						}
					},
					run: function(o) {
						var opts = o && typeof o == 'object' ? o : { ms: 500, st: 20, rpt: 1 };
						var xtnd = sys.get('utils.extend');
						var list = [];
						var anim = { base: sys.eff('dom.elements.animate').run().run({
							duration: parseInt(opts.ms)||500,
							toggle: false, easing: opts.easing||'swing'
						}), list: list };
						var base = anim.base;

						list.push({ prop: 'opacity', from: 0, to: 1, duration: '90%' });
						list.push({ prop: 'opacity', from: 1, to: 0, delay: 120, init: false });
						list.push({ prop: 'backgroundColor', from: 100, to: 255, fn: { tmpl: 'rgb(10,%,100)', dec: 1 } });

						var grid = this.call('deps.components.grid');
						var vals = grid.vals(o.rows, o.cols, 30);
						return grid.elems(vals.rows, vals.cols, true).bind(function(elem) {
							var row = parseInt(elem.getAttribute('data-row'));
							var col = parseInt(elem.getAttribute('data-col'));

							elem.style.height = vals.cellHeight+'px'; elem.style.width=vals.cellWidth+'px';

							if (row != vals.row && (vals.row = row)) vals.delay = row*2;
							else if (col) vals.delay++;

							return list.map(function(val) {
								var res = xtnd({ elem: elem }, val);
								if (res.prop == 'backgroundColor' && row%2) {
									res.fn = { tmpl: 'rgb(%,10,100)' };
								}
								return xtnd(res, { delay: ((res.delay||0)+(vals.delay*(parseInt(opts.st)||20)))+'%' });
							});
						}).flatten().chain(function(result) {
							return sys.klass('Control').of(base(result)).times(opts.rpt).lift(function(anim, kont) {
								return anim(kont);
							});
						});
					}
				}
			},
			fields: {
				ms:     { type: 'number', elem: { tag: 'input',  label: 'Duration', type: 'text',  placeholder: 'duration' } },
				st:     { type: 'number', elem: { tag: 'input',  label: 'Stagger',  type: 'text',  placeholder: 'stagger'  } },
				rpt:    { type: 'number', elem: { tag: 'input',  label: 'Repeat',   type: 'text',  placeholder: 'repeat'   } },
				rows:   { type: 'number', elem: { tag: 'input',  label: 'Rows',     type: 'text',  placeholder: 'rows'     } },
				cols:   { type: 'number', elem: { tag: 'input',  label: 'Columns',  type: 'text',  placeholder: 'cols'     } },
				easing: { type: 'string', elem: { tag: 'select', label: 'Easing',   data: 'options:effects.dom.calc.bezier.fn.keys', options: [ '', 'linear', 'swing' ] } },
				run:    { type: 'action', elem: { tag: 'button', label: 'Run',      type: 'button' } }
			},
			events: {
				data: {
					'change:form.run':'animate'
				}
			}

		};

	});

});
