define(function() {

	return sys().enqueue({

		name: 'table',

		deps: {

			core: [ 'pure', 'dom' ],

			templates: [ 'tmpl' ]

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
					render: function(data) {

						var view = this.root().view();
						var tabl = view.tmpl('main');

						this.of(data.columns || data).reduce(function(v, k) {
							v.id = k;
							return tabl.render.run(v);
						}, data);

						return view.set('header', view.item(tabl.elem.toIO()));
					}
				}
			},
			tmpl: {
				main: function() {
					return this.get('tabl') || this.set('tabl', this.tmpl('make', 'column'));
				},
				make: function(type) {
					var view = this;
					var rndr = this.parent('$fn.render');
					var elem = rndr.run('table').run({ 'id': 'header', 'class': 'sticky-table-header' });
					return {
						elem: elem,
						render: view.eff('append').ap(elem.map(function(elem) {
							return elem.querySelector('tbody');
						}).toIO()).pure().ap(view.eff('tr').ap(view.render(type)))
					};
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
