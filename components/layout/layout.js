define(function() {

	return this.enqueue({

		name: 'layout',

		deps: {

			core: [ 'pure', 'dom' ],

			components: [ 'view', 'grid' ]

		}

	}, function() {

		return {

			ext: [
				(function grid(x, y, f) {
					var grid = this.child('grid', this.deps('components.grid'));
					return grid.render(x, y).bind(function(elem) {
						var row = parseInt(elem.getAttribute('data-row'));
						var col = parseInt(elem.getAttribute('data-col'));

						if (!col) elem.classList.add('row');
						else elem.classList.add('col');

						return f ? f(elem, row, col) : elem;
					}).each(function(y) {

						/* Collapse the array(s) of elements into their DOM structure */
						y.splice(1).map(y.first().appendChild.bind(y.first()));
						return y;

					}).flatten();
				})
			]

		};

	});

});