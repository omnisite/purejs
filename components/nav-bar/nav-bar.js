define(function() {

	return this.enqueue({

		name: 'nav-bar',

		deps: {

			components: [ 'view', 'dropdown' ],

			templates: [ 'tmpl' ]
		}

	}, function() {

		return {
			ext: {
				main: function() {
					this.deps('components.dropdown').create({
						name: 'dd', parent: this
					}).run(this.wrap(
						this.view().item(this.view().$el()),
						this.$fn('append').ap(this.view().tmpl('main')).run({}),
						this.view().tmpl('wrap')
					));
				},
				wrap: function(nav, elem, attrs) {
					return function(dd) {
						dd.$fn('attrs').run(attrs);
						dd.$fn('attach').run(elem.unit());
						return nav;
					};
				},
				item: function(values) {
					return this.get('dd').item(values);
				},
				menu: function(values) {
					return this.get('dd').menu(values);
				}
			},
			tmpl: {

				tag: 'nav',

				attr: function() {

					return { 'class' : 'navbar navbar-inverse' };
				},

				wrap: function() {

					return { 'class' : 'nav navbar-nav toggle' };
				}

			}
		};

	});

});