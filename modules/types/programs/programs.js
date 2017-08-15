define(function() {
	return this.enqueue({

		name: 'modules.home',

		deps: {

			core: [ 'pure', 'dom' ],

			components: [ 'title' ]

		}

	}, function() {

		return {

			ext: {
				initialize: function() {
					var title = this.get('title');
					title.control('main').anim().run();
					title.proxy('click', 'ul', 'title.run');
				},
				launch: function() {
					sys.get('router').navigate('app');
				}
			},

			init: function(deps) {

				return deps('core.pure')(function(sys) {
					return function(app) {

						var module = sys.get('components.home');
						var title  = app.deps('components.title').create('title', module);

						return [ title.pure() ].lift(function(t) {

							t.render('purejs');
							t.attach();

							return app;

						}).cont();

					}
				})(this);
			},

			events: {
				data: {
					'change:title.run':'launch'
				}
			}

		};

	});
});
