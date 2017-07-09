define(function() {

	return this.enqueue({

		name: 'core.config',

		deps: {

			core: [ 'pure' ],

			config: [ 'config.json' ]

		}

	}, function() {

		return {

			init: function(deps) {
				return deps('core.pure')(function(sys) {
					return function(conf) {
						var node = sys.get().node('config');
						var json = conf.deps('config.config-json');
						node.parse(json, 1);
						return node;
					}
				})(this);
			}

		};

	});

});
