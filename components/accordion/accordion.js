define(function() {

	return this.enqueue({

		name: 'accordion',

		deps: {

			components: [ 'view' ],

			templates: [ 'tmpl' ]
		}

	}, function() {

		return {
			ext: {
				panel: function(evt) {
					return this.get('data.control.main').init(evt);
				},
				toggle: function(name, continuation) {
					return this.lookup('data.main.' + name + '.$find').map(function(io) {
						return io.runMaybe('.panel-heading');
					}).lift(function(elem, accor) {
						return elem.chain(function(e) {
							return accor.get('data.control.main').toggle(e.nextElementSibling);
						});
					}).ap(this).chain(function(load) {
						return load.run(continuation || unit);
					});
				},
				item: function(main, name) {
					return this.set('data.current.item', this.lookup('data.main.' + main).chain(function(info) {
						return info.id + '.' + name;
					}));
				}
			},
			control: {
				main: {
					init: function(evt) {
						if (evt.action == 'create') {
							var node = sys.get(evt.value.path);
							var view = this.root().view();
							evt.value.id    = node.uid();
							evt.value.$el   = (this._main || (this._main = this.root().$fn('append').ap(view.tmpl('main', { 'class' : 'panel panel-default' })))).run(evt.value);
							evt.value.$find = view.eff('find').run(evt.value.$el).toIO();
							evt.value.$add  = view.tmpl('item').map(view.eff('append').runIO(evt.value.$find.run('tbody')));
						}
					},
					panel: function(name) {
						return this.root().get('data.main', name);
					},
					load: function(name) {
						var info = this.panel(name);
						if (!info.done && (info.done = true)) {
							return this.data(name)(info).ap(info.$add);
						}
						return this.root();
					},
					data: function(name) {
						return this.items.get(name)||this.items.get('base')||unit;
					},
					change: function(evt) {
						var name = evt.ref.split('.').last();
						var info = this.panel(name);
						if (evt.action == 'remove') {
							return info.$find.toMaybe().run('[data-key="'+evt.target+'"]').chain(function(elem) {
							  return elem.parentElement.removeChild(elem);
							});
						}else if (evt.action == 'create') {
							return this.tmpl(name)(sys.find(evt.uid), evt.target).ap(info.$add).run();
						}else if (evt.action == 'update') {
							
						}
					},	
					toggle: function(elem) {
						if (elem.classList.contains('collapse')) {
							elem.classList.remove('collapse');
							return this.load(elem.getAttribute('data-path'));
						}else {
							elem.classList.add('collapse');
						}
						return this.root();
					},
					show: function(evt) {
						var trg = evt.currentTarget;
						var key = trg.getAttribute('data-key');
						var res = trg.closest("[data-path]");
						if (res) res = res.getAttribute('id') || res.getAttribute('data-id');
						if (res) res = sys.find(res);
						if (res && key) this.root().set('data.current.item', res.uid() + '.' + key);
					},
					click: function(evt) {
						var trg = evt.currentTarget.nextElementSibling;
						this.root().toggle(trg.getAttribute('data-path'));
					}
				}
			},
			tmpl: {
				attr: function() {

					return { 'class' : 'accordion panel-group' };
				},
				item: function() {
					var view = this;
					var item = view.get('item');
					if (!item) {
						item = view.set('item', view.eff('tr').ap(view.render('item')));
					}
					return item;
				}
			},
			events: {
				data: {
					'change:data.main.%': 'panel'
				},
				dom: {
					'click:.panel-heading': 'data.control.main.click',
					'click:.panel-body tr': 'data.control.main.show'
				}
			}
		};

	});

});