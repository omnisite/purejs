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
					return this.control('main').init();
				},
				fields: function() {
					var args = [].slice.call(arguments);
					var data = args.shift();
					var make = args.length && args.last() === true ? args.pop() : false;
					var ctrl = this.control('main');
					if (args.length) this.bindpath(args.shift());
					this.data({ fields: data }, 1).get('fields');
					if (make) ctrl.fields();
					return this;
				},
				bindpath: function(path) {
					return this.view().parent('$fn.attrs').run({ 'data-bind-path' : this.state('path', path) });
				},
				hide: function() {
					this.$fn('display').run('none');
					return this;
				}
			},
			control: {
				main: {
					lift: function() {
						return this.klass('io').of(this.root()).lift(function(form, elem) {
							var mod = form.module();
							var ext = elem.closest('[data-bind-ext]');
							var rel = form.relative(form.module());
							if (ext) rel.push(ext.getAttribute('data-bind-ext'));
							if (elem.id) rel.push(elem.id);
							var kls = elem.getAttribute('data-klass'); elem.removeAttribute('data-klass');
							var cmp = mod.component(rel.join('.'), kls).bind(function(cmp) {
								cmp.attach(cmp.set('data.attachto', elem));
								return cmp;
							});
							return cmp.pure();
						});
					},
					init: function() {
						return (this._init || (this._init = this.root().view().elms(this.lift(), 'div')('[data-klass]'))).run().run(function(x) {
							(x instanceof Array ? x : [ x ]).map(function(comp) {
								comp.initialize();
								return comp.get('data.attachto');
							});
						});
					},
					form: function(rndr, attr, flds, path) {
						return flds.map(function $fn(t, k) {

							var v = t.elem;
							if (v) {
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
							}else if (t.type == 'schema') {
								return rndr.run('list').run({ path: k }).map(function(elem) {
									elem.classList.add(k);
									return elem;
								});
							}
						});
					},
					rndr: function() {
						return (this._rndr || (this._rndr = this.root().get('view').parent('$fn.render').nest().lift(function(rndr, find) {
							return this.fx(function(tmpl) {
								return rndr.run(tmpl, find);
							});
						})));
					},
					list: function(path) {
						var form = this.root();
						var view = form.view();
						var elem = view.parent('$fn.render').run('group', '[data-bind-ext="' + path + '"]').run({}).map(function(e) {
							var prnt  = e.parentElement;
							var path  = prnt.getAttribute('data-bind-ext');
							var count = prnt.childElementCount - 1;
							e.setAttribute('data-bind-ext', [ path, count ].join('.'));
							if (!count) e.classList.add('top');
							return e;
						});
						var rndr = this.rndr().run(elem.toIO());
						var attr = view.eff('attrs');
						return this.form(rndr, attr, form.get('data.fields', path, 'fields'), form.state('path'));						
					},
					fields: function() {
						var form = this.root();
						var view = form.view();
						var rndr = view.parent('$fn.render');
						var attr = view.eff('attrs');
						return this.form(rndr, attr, form.get('data.fields'), form.state('path'));
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
						var view = this.root().view().closest('[data-bind-path]');
						if (view) {
							var elem = evt.target;
							var ext  = elem.closest('[data-bind-ext]');
							if (ext) ext = ext.getAttribute('data-bind-ext');
							view.parent().lookup(view.get('attr.data-bind-path')).chain(function(node) {
								return node.emit('change', 'button.' + evt.value, 'update', ext);
							});
						}
					}
				}
			},
			events: {
				dom: {
					'click:button': 'data.control.main.click',
					'change:[data-bind-path]': 'binding'
				},
				data: {
					'change:data.main.%':'binding'
				}
			}

		};

	});

});
