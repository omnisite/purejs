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
				hide: function() {
					this.$fn('display').run('none');
				}
			},
			control: {
				main: {
					fields: function(path, data) {

						var form = this.root();
						var view = form.view();
						var bind = view.parent('$fn.attrs').run({ 'data-bind-path' : path });
						var rndr = view.parent('$fn.render');

						this.of(data).reduce(function(v, k) {

							v.id = k;
							if (v.data) {
								var d = v.data.split(':'), o;
								if (d.length > 1) {
									o = d.shift();
									v[o] = sys.get(d.join('.'));
								}
							}
							return rndr.run(v.elem).run(v);

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
						if ((evt.currentTarget || (evt.currentTarget = evt.target)))
							this.root().$proxy(evt, this.root().get('proxy', evt.type, evt.currentTarget.localName));
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
