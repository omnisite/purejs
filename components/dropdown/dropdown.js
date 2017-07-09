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
					toggle: function(trg) {
						if (trg.classList.contains('dropdown')) {
							if (trg.classList.contains('open')) {
								trg.classList.remove('open');
							}else {
								trg.classList.add('open');
							}
						}
					},
					click: function(evt) {
						var trg = evt.target;
						if (trg.classList.contains('dropdown-toggle')) { 
							this.toggle(trg.closest('li'));
							evt.stop = true;
						}else {
							var cls = trg.closest('.dropdown.open');
							if (cls) cls.classList.remove('open');
							evt.stop = true;
						}
					},
					leave: function(evt) {
						if (evt.target && evt.currentTarget) {
							var tid = evt.target.closest('ul');
							var nid = this.call('view.fn.store.fn.nid');
							var trg = evt.target.closest('li.dropdown.open');
							if (trg && tid && tid.id.slice(1) === nid) {
								if (!evt.relatedTarget || evt.relatedTarget.localName != 'a'
									|| evt.relatedTarget.closest('ul') != tid) {
									trg.classList.remove('open');
								}
							}
						}
						evt.stop = true;
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
					'mouseout:ul.toggle ul.dropdown-menu li': 'data.control.main.leave',
					'click:li': 'data.control.main.click'
				}
			}
		};

	});

});