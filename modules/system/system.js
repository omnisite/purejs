define(function() {
	return this.enqueue({

		name: 'modules.system',

		deps: {

			core: [ 'pure' ],

			system: [ 'test.$dom', 'test.$inst', 'test.$types' ]

		}

	}, function() {

		return {

			ext: {

			}

		};

	});
});
