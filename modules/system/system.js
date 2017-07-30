define(function() {
	return this.enqueue({

		name: 'modules.system',

		deps: {

			core: [ 'pure' ],

			system: [ 'test.$dom', 'test.$types', 'test.$inst' ]

		}

	}, function() {

		return {

			ext: {
				origin: function(plural) {

					return 'system';
				}
			}

		};

	});
});
