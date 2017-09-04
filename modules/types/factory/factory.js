define(function() {
	return this.enqueue({

		name: 'modules.types.factory',

		deps: {

			core: [ 'pure' ],

			components: [ 'view' ]

		}

	}, function() {

		return {

			ext: {

			}

		};

	});
});
