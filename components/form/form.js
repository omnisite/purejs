define(function() {

	return this.enqueue({

		name: 'form',

		deps: {

			core: [ 'pure', 'dom' ],

			templates: [ 'tmpl' ],

			components: [ 'view' ]

		}

	}, function() {

		return {

			ext: {
				initialize: function() {
					return this.control('main').init().run(function(x) {
						(x instanceof Array ? x : [ x ]).map(function(comp) {
							var at = comp.attach(comp.parent().$el('#'+comp.cid()));
							comp.render();
							return at;
						});
					});
				},
				hide: function() {
					this.$fn('display').run('none');
				}
			},
			control: {
				main: {
					lift: function() {
						return this.klass('io').of(this.root()).lift(function(form, elem) {
							var mod = form.module();
							var rel = form.relative(form.module()).append(elem.id);
							return mod.component(rel.join('.'), elem.getAttribute('data-klass')).pure();
						});
					},
					init: function() {
						return (this._init || (this._init = this.root().view().elms(this.lift(), 'div')('[data-klass]'))).run();
					},
					fields: function(data, path) {

						var form = this.root();
						var view = form.view();
						var rndr = view.parent('$fn.render');
						var attr = view.eff('attrs');
						
						if (path) view.parent('$fn.attrs').run({ 'data-bind-path' : form.state('path', path) });

						this.of(data).reduce(function(t, k) {

							var v = t.elem;
							v.id = k;

							if (v.data) {
								var d = v.data.split(':'), o, x;
								if (d.length > 1) {
									o = d.shift();
									x = sys.get('utils.fn')(sys.get(d.join('.')));
									if (x) v[o] = x.map(function(t) {
										return t.label || t.text || t.value || t;
									});
								}
							}
							if (v.tag == 'component') {
								v.path = path;
							}else if (v.tag == 'select') {
								v.empty = v.empty !== false;
							}
							return rndr.run(v.tag).run(v).map(function(elem) {
								return v.attrs ? attr.ap(elem).pure().run(v.attrs) : elem;
							});

						}, data);

						return form;
					},
					options: function(id, options) {
						var root = this.root();
						var view = root.view();
						var elem = view.parent('$fn.find').ap('#'+id);
						var html = elem.apply(view.eff('empty')).apply(view.eff('html')).pure();
						return html.run(options.map(function(o) {
							return '<option>' + o + '</option>';
						}).join('')).chain(function(elem) {
							var value = root.get(elem.closest('[data-bind-path]').getAttribute('data-bind-path'), elem.id);
							return elem.value = value;
						});
					},
					click: function(evt) {
						var view = this.root('view').closest('[data-bind-path]');
						if (view) {
							view.parent().lookup(view.get('attr.data-bind-path')).chain(function(node) {
								return node.set('btn' + evt.value, evt.eid);
							});
						}
					}
				}
			},
			events: {
				dom: {
					'click:button': 'data.control.main.click',
					'change:[data-bind-path]': 'binding',
					'click:.close': 'hide'
				},
				data: {
					'change:data.main.%':'binding'
				}
			}

		};

	});

});
