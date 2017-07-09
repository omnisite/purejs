define(function() {

	return this.enqueue({

		name: 'modal',

		deps: {

			core: [ 'pure' ],

			components: [ 'view', '$form' ],

			templates: [ 'tmpl' ]

		}

	}, function(deps) {

		return {

			ext: {
				main: function() {
					var view = this.view();
					var find = view.parent('$fn.find');
					var back = this.$bd || (this.ctor.prop('$bd', this.backdrop()));

					this.set('data.tmpl.header', find.ap('.modal-header'));
					this.set('data.tmpl.body',   find.ap('.modal-body'));
					this.set('data.tmpl.footer', find.ap('.modal-footer'));
				},
				backdrop: function() {
					return this.view().append('div', {'class':'modal-backdrop fade'}, 'body')
					.toIO().nest().lift(function(el, fn) {
					 	return el.of({ $el: el, toggle: el.ctor.lift(fn(el.pure().run(), document.body, el.fx(function(arr) {
							return arr.map(function(id, idx) {
								var elem = document.getElementById(id);
								elem.style.zIndex = 1050+idx;
								elem.firstChild.style.paddingTop = (idx * 40)+'px';
								elem.firstChild.style.paddingLeft = (idx * 40)+'px';
								return elem;
							});
						}))) });
					}).ap(function(bdrp, body, mdls) {
						var transitionEnd = sys.run().eff('dom.easing.transitionEnd').init();
						var reqAnimFrame  = sys.get('process.animFrame.enqueue');
						var modalsOpen    = [];
						return function(elem, action) {
							if (elem.classList.contains('show') && action !== 'show') {
								var idx = modalsOpen.indexOf(elem.id);
								if (idx >= 0) modalsOpen.splice(idx, 1);
								if (modalsOpen.length) {
									mdls.run(modalsOpen);
								}else {
									transitionEnd.run(bdrp, function() {
										bdrp.style.top = '100%';
									});
									body.classList.remove('modal-open');
									bdrp.classList.remove('in');
								}
								reqAnimFrame(function() {
									elem.classList.remove('show');
									return true;
								});
							}else if (action !== 'hide') {
								bdrp.removeAttribute('style');
								body.classList.add('modal-open');
								reqAnimFrame(function() {
									bdrp.classList.add('in');
									elem.classList.add('show');
									if (modalsOpen.indexOf(elem.id)<0) modalsOpen.push(elem.id);
									mdls.run(modalsOpen);
									return true;
								});
							}
						}
					}).run();
				},
				toggle: function(action) {
					return (this._toggle || (this._toggle = this.$bd.lift(function(bd, elem) {
						return bd.toggle.run(elem);
					}).ap(this.$el()).run())).run(action);
				},
				initial: function() {
					return this.$fn('render').run('main').run({});
				},
				content: function(values, type) {
					return this.$fn('render').run(type || message).run(values);
				},
				addForm: function(fields, name) {
					return this.control('main').createForm(name || 'form', fields);
				},
				addButton: function(value, text, style) {
					return this.control('main').createButton(value, text, style);
				},
				removeButton: function(name) {
					return this.get('data.main.buttons').clear(name);
				},
				renderBody: function(name, attrs) {
					return this.control('main').createBody(name, attrs);
				},
				hide: function() {
					return this.toggle('hide');
				},
				show: function() {
					return this.toggle('show');
				}
			},
			control: {
				main: {
					click: function(evt) {
						if (evt.value == 'close') this.root().hide();
						if ((evt.currentTarget || (evt.currentTarget = evt.target)))
							this.root().$proxy(evt, this.root().get('proxy', evt.type, evt.currentTarget.localName));
					},
					initButton: function(value, text, style) {
						return { value: value, text: text || value, style: style || '' };
					},
					makeButton: function(values) {
						return this.root('data.main.buttons').set(values.value, values);
					},
					createButton: function(value, text, style) {
						return this.makeButton(this.initButton(value, text, style));
					},
					createForm: function(name, fields) {
						return this.root().component(name, 'form').run(function(f) {
							f.control('main').fields('data.main', fields);
							f.attach(f.parent('data.tmpl.body'));
							return f;
						});
					},
					createBody: function(name, attrs) {
						var root = this.root();
						var view = root.view();
						var appn = view.eff('append').ap(root.get('data.tmpl.body'));

						return appn.lift(function(f, m) {
							return f(m);
						}).run(view.tmpl(name).run(attrs || {}));
					}
				},
				data: {
					header: function(evt) {
						console.log(evt);
					},
					content: function(evt) {
						console.log(evt);
					},
					button: function(evt) {
						var root = this.root();
						var view = root.view();

						if (evt.action == 'create') {
							var make = this._btn || (this._btn = view.eff('append').ap(root.get('data.tmpl.footer')).pure().ap(view.eff('button').toMaybe()));
							return make.run(evt.value).chain(function(result) {
								return root.xtnd(evt.value, result);
							});
						}else if (evt.action == 'remove') {
							var btn = evt.value;
							if (btn.$el) btn.$el.parentElement.removeChild(btn.$el);
							return btn;
						}
					},
					footer: function(evt) {

					}
				}
			},

			tmpl: {

				attr: function() {

					return { 'class' : 'modal no-scroll', 'role' : 'dialog' };
				}

			},

			data: {

				main: {

					header: {},

					content: {},

					footer: {},

					buttons: {}

				}

			},
			events: {
				dom: {
					'click:button': 'data.control.main.click',
					'click:.close': 'hide'
				},
				data: {
					'change:data.main.%'         : 'binding',
					'change:data.main.header.%'  : 'data.control.data.header',
					'change:data.main.footer.%'  : 'data.control.data.footer',
					'change:data.main.buttons.%' : 'data.control.data.button',
				}
			}

		};

	});

});

