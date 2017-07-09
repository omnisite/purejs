define(function() {
	return this.enqueue({

		name: 'modules.auth',

		deps: {

			core: [ 'pure', 'dom' ],

			components: [ 'view', 'modal' ]

		}

	}, function() {

		return {

			ext: {
				main: function() {
					this.attach('#root');
					this.component('modal', 'modal').run(function(mdl) {
						mdl.read = mdl.view().read().run('main', { title: 'Login' });
						mdl.addButton('login', 'Login');
						mdl.addForm({
							username:   { elem: 'input', label: 'Username', type: 'text',  placeholder: 'username' },
							password:   { elem: 'input', label: 'Password', type: 'password',  placeholder: 'password' }
						}, 'form');
						mdl.read.attach.run();
						mdl.toggle();
						mdl.proxy('click', 'button', 'modal.login');
						return mdl;
					});
				},
				login: function(evt) {
					sys.get('router').navigate('');
				},
				toggle: function(evt) {
					this.get('modal').toggle();
				}
			},

			events: {
				data: {
					'change:state.display':'toggle',
					'change:modal.login':'login'
				}
			}

		};

	});
});
