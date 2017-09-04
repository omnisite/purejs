define(function() {
	return this.enqueue({

		name: 'modules.types.programs',

		deps: {

			core: [ 'pure' ],

			components: [ 'view', 'popup-menu', 'drag-and-drop' ],

			templates: [ 'tmpl' ],

			css: [ 'programs' ]

		}

	}, function() {

		return {
			ext: {
				main: function() {
					this.deps('components.popup-menu').create({
						name: 'dd', parent: this
					}).run(this.bin(function(comp, dd) {
						comp.$fn('append').ap(comp.view().tmpl('main')).run({});
						dd.item({ id: 'map', name: 'Map' });
						dd.item({ id: 'bind', name: 'Bind' });
						dd.item({ id: 'chain', name: 'Chain' });
						dd.item({ id: 'ap', name: 'Ap' });
						dd.item({ id: 'lift', name: 'Lift' });
						dd.attach(comp.view().$el());
					}));
					this.view().css();
				},
				drag: function() {
					return sys.eff('sys.loader.component').run('components/drag-and-drop/drag-and-drop').bind(function(x) {

						return x.create({ name: 'drag-programs', parent: sys.get('components.types.programs') }).pure();

					}).run(function(drag) {
						var home = drag.mixin({ opts: { draggable: '.draggable' } }).run(sys.get('components.types.programs'));
						var enbl = home.enable('div', '.drop-wrap');
						enbl.run();

						return drag;
					});
				}
			},
			control: {
				main: {
					drop: function(evt) {
						console.log(evt);
						return evt;
					}
				}
			},
			events: {
				data: {
					'change:drag-programs.drop':'data.control.main.drop'
				}
			}
		};

	});
});
