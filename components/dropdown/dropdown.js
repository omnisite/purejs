define(function() {

	return this.enqueue({

		name: 'dropdown',

		deps: {

			templates: [ 'tmpl' ],

			components: [ 'view' ]

		}

	}, function() {

		return {
			ext: {
				item: function(values) {
					return this.view().parent('$fn.render').run('item').run(values);
				},
				menu: function(values) {
					return this.constructor.create({
						name: values.id, parent: this
					}).run(this.bin(function(parent, dd) {
						dd.$fn('attrs').run({ 'class': 'dropdown-menu' });
						dd.$fn('attach').ap(parent.$fn('render').run('dropdown').run(values));
					}));
				}
			},
			control: {
				main: {
					io: function() {
						return (this._toggle || (this._toggle = this.root('view.fn.eff.toggle').run('open').nest().lift(function(toggle, $el) {
							return this.fx(function(trg) {
								return $el.map(function(elem) {
									if (elem.id == trg.closest('ul').id) {
										toggle.raf(trg);
									}
								}).run();
							});
						}).run(this.root().$el())));
					},
					toggle: function(trg) {
						if (trg.classList.contains('dropdown')) {
							this.io().run(trg);
						}
					},
					click: function(evt) {
						var trg = evt.target;
						if (trg.classList.contains('dropdown-toggle')) { 
							this.toggle(trg.closest('li'));
						}else {
							var cls = trg.closest('.dropdown.open');
							if (cls) cls.classList.remove('open');
						}
					},
					enter: function(evt) {
						var trg = evt.currentTarget;
						if (trg && !trg.matches('.dropdown.open')) {
							this.toggle(trg);
						}
					},
					leave: function(evt) {
						if (evt.target && evt.currentTarget && !evt.currentTarget.matches('.open.dropdown-submenu')) {
							var tid = evt.target.closest('ul');
							var trg = evt.target.closest('li.dropdown.open');
							if (trg && (!evt.relatedTarget || evt.relatedTarget.localName != 'a'
								|| evt.relatedTarget.closest('ul') != tid)) {
								this.io().run(trg);
							}
						}
					}
				}
			},
			tmpl: {

				tag: 'ul',

				attr: function() {

					return { 'class' : 'dropdown' };
				}

			},
			events: {
				data: {
					'change:data.main.%': 'main'
				},
				dom: {
					'click:li': 'data.control.main.click',
					'mouseover:li.dropdown': 'data.control.main.enter',
					'mouseout:ul.toggle ul.dropdown-menu li': 'data.control.main.leave'
				}
			}
		};

	});

});