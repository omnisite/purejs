define(function() {

	return this.enqueue({

		name: 'code-edit',

		deps: {

			parent: 'code-box',

			core: [ 'pure', 'dom' ],

			components: [ 'view' ],

			helpers: [ 'codeflask' ],

			templates: [ 'tmpl' ]

		}

	}, function(deps) {

		return {
			ext: {
				highlight: function() {

				},
				render: function(val) {
					var el = this.$el().run();
					var cf = this.deps('helpers.codeflask').make(el, { language: 'javascript', lineNumbers: true });
					cf.update(val);
				}
			}
		};

	});

});