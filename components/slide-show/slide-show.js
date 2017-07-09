define(function() {

	return this.enqueue({

		name: 'slide-show',

		deps: {

			parent: 'modal',

			templates: [ 'tmpl' ],

			css: [ 'slide-show' ],

			scripts: [ 'holder' ]
		}

	}, function() {

		return {

			ext: {
				createControls: function() {
					return this.control('main').createControls();
				}
			},

			control: {

				main: {

					createControls: function() {
						var root = this.root();
						var view = root.view();
						var appn = view.eff('append').ap(root.get('data.tmpl.footer'));
						var tmpl = view.tmpl('control');
						var ctrl = [ { slide: 'prev', direction: 'left' }, { slide: 'next', direction: 'right' }];

						return appn.lift(function(f, a) {
							return a.map(f);
						}).run(ctrl.map(function(attrs) {
							return tmpl.run(attrs);
						}));
					},

					click2: function(evt) {
						console.log(evt);
					}
				},

				slideshow: {

					click: function(evt) {
						console.log(evt);
					}

				}

			},

			tmpl: {

				attr: function() {

					return { 'class' : 'modal modal-fullscreen force-fullscreen', 'tabindex' : '-1', 'full' : true };
				}

			},
			events: {
				data: {
					'change:proxy.click.button' : 'data.control.main.click2'
				}
			},
			proxy: {
				data: {
					'click:button': 'proxy.click.button'
				}
			}
			
		};

	});

});