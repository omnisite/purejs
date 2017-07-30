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

	}, function() {

		return {
			init: function(deps) {
				return deps('core.pure')(function(sys) {
					return function(comp) {
						return comp.klass;
					}
				})(this);
			},
			klass: {
				ext: {
					highlight: function() {

					},
					render: function(val) {
						var cf = this.control('main').init();
						cf.update(val || '');
					}
				},
				control: {
					main: {
						init: function() {
							return (this._cf || (this._cf = this.root().$el().lift(function(el, rt) {
								var flsk = rt.deps('helpers.codeflask').make(el, { language: 'javascript', lineNumbers: true });
								var name = el.parentElement.id, path;
								var prnt = rt.view().closest('[data-bind-path]').parent();
								prnt.$el().map(function(el) {
									var path = el.getAttribute('data-bind-path');
									rt.observe(prnt, 'change', path.concat('.', name), 'data.control.main.change');
								}).run();
								flsk.textarea.setAttribute('data-bind-name', name);
								return flsk;
							}).run(this.root())));
						},
						change: function(evt) {
							this.init().update(evt.value);
						}
					}
				}
			}
		};

	});

});