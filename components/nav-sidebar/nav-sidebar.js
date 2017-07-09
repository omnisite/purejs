define(function() {

	return this.enqueue({

		name: 'nav-sidebar',

		deps: {

			parent: 'nav-bar',

			templates: [ 'tmpl' ]
		}

	}, function() {

		return {
			ext: {
				toggle: function() {
					this.$el().map(function(elem) {
						if (elem.classList.contains('open')) {
							elem.classList.remove('open');
						}else {
							elem.classList.add('open');
						}
					}).run();
				}
			},
			tmpl: {

				tag: 'div',

				attr: function() {

					return { 'class' : 'sidebar-wrapper' };
				},

				wrap: function() {

					return { 'class' : 'sidebar-nav'}
				}

			}
		};

	});

});