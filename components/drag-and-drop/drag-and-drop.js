define(function() {

	return this.enqueue({

		name: 'drag-and-drop',

		deps: {

			core: [ 'pure', 'dom' ],

			templates: [ 'tmpl' ],

			components: [ 'view' ]

		}

	}, function() {

		return {
			ext: {
				main: function() {
					if (this.equals(this.view().parent())) {
						this.$wrap = this.$fn('render').run('main').run({});
					}else {
						this.$wrap = this.parent().$el();
					}
				},
				mixin: function(opts) {
					return this.lift(function(dd, comp) {
						return dd.constructor.create(dd.xtnd({ name: comp.cid(), parent: dd, view: comp.view() }, opts || {})).run(function(inst) {
							return { dd: dd, comp: comp, inst: inst };
						});
					});
				},
				enable: function(element, selector) {
					return this.state('enabled')
						|| this.state('enabled', this.control('main').pure().run(this.control('main').create(element, selector)));
				},
				hide: function() {
					this.$fn('display').run('none');
				}
			},
			control: {
				main: {
					create: function(element, selector) {
						return { state: 'init', element: this.toggle('drag-and-drop'), selector: this.enable(element, selector).run() };
					},
					pure: function() {
						return this.klass('io').pure(function(state) {
							return this.fx(function(enable) {
								state.element.run();
								state.selector.run();
								state.enabled = !state.enabled;
								return state;
							});
						});
					},
					enable: function(element, selector) {
						var root = this.root();
						var view = root.view();
						return view.elms(view.eff('toggle').run('draggable'), element)(selector);
					},
					toggle: function(classname) {
						var root = this.root();
						return root.view().eff('toggle').run(classname).ap(root.$el());
					},
					adjust: function(evt) {
						if (this._move) {
							this._move.throttle = this.root().opts('throttle');
						}
					},
					click: function(evt) {
						if (evt.target)
							this.root().$proxy(evt, this.root().get('proxy', evt.type, evt.target.localName));
					},
					elem: function(area, evt, selector) {
						return area.matches(selector) ? area
							: (evt.target.closest(selector) || area.querySelector(selector)); 
					},
					show: function(info) {
						//console.log(info, this._move ? this._move.state : 'no-move-no-state');
					},
					make: function(evt) {
						this.show('<begin-make>');
						var area = evt.currentTarget || evt.target;
						var root = this.root(), move, view = root.view();
						if (!this._move) {
							move = this._move = view.body('mousemove', '.drag-and-drop.dragging', this.move.bind(this), root.opts('throttle') || 50);
							move.identifier   = 'mv'+root.id();
							move.selector     = '[name="'.concat(move.identifier, '"]');
							move.draggable    = root.opts('draggable');
							move.dragging     = move.draggable.concat('.dragging');
							move.droppable    = root.opts('droppable');
							move.toggle       = this.toggle('dragging');
						}
						this._move.state = 'make';
						this.show('<end-make>');
						return this._move;
					},
					init: function(evt) {
						this.show('<begin-init>');
						if (!this._move) {
							this._move = this.make(evt);
						}
						this._move.state = 'init';
						this.show('<end-init>');
					},
					start: function(evt) {
						this.show('<begin-start>');
						if (!this._move) {
							this._move = this.init(evt);
							this._move.state = 'starting';
						}else if (this._move.state != 'init') {
							this.show('<fake-start>');
							this._move.state = 'stopped';
						}else {
							var root = this.root(), view = root.view();
							this.show('<add-move-from-start>');
							var move = this._move = view.body(this._move);
							var area = evt.currentTarget || evt.target;
							var elem = this.elem(area, evt, this._move.draggable);
							if (elem) {
								var wrap   = this.drag(elem, evt).run();
								wrap.setAttribute('name', move.identifier);
								move.state = 'starting'; this.move(evt);
								move.toggle.run();
							}
						}
						this.show('<end-start>');
					},
					move: function(evt) {
						this.show('<begin-move>');
						if (this._move) {
							var elem = document.querySelector(this._move.selector);
							if (elem) {
								this._move.state = 'moving';
								elem.style.left  = (evt.x - 10) +'px';
								elem.style.top   = (evt.y - 10) +'px';
							}
						}
						this.show('<end-move>');
					},
					cancel: function(evt) {
						if (this._move) {
							this._move.state = 'cancelled';
						}
					},
					stop: function(evt) {
						this.show('<begin-stop>');
						if (this._move) {
							this._move.state = 'stopping';
							var elem = document.querySelector(this._move.selector);
							if (!elem) elem = this.elem(evt.currentTarget || evt.target, evt, this._move.dragging);
							if (elem) {
								var root = this.root();
								var view = root.view();
								elem.classList.remove('dragging');
								elem.parentElement.removeChild(elem);
								if (this._move) this._move = view.removeEventListener(this._move);
								this._move.toggle.run();
							}
							this._move.state = 'stopped';
						}
						this.show('<end-stop>');
					},
					drag: function(elem, evt) {

						var root = this.root();
						var view = root.view();

						return root.$wrap.map(function(el) {
							 var x = document.createElement('div');
							 x.innerHTML = el.innerHTML;
							 x.firstElementChild.innerHTML = elem.outerHTML;
							 return x.firstElementChild;
						}).lift(function(w, p) {
							w.classList.add('dragging');
							p.appendChild(w);
							return w;
						}).ap(root.$el());
					},
					drop: function(evt) {
						var target = evt.target, item = $(target).find('[data-path]'), test, path;
						if (item.length) {
							try {
								path = item.attr('data-path').replace('.items', '');
								test = core(path.replace('root', 'root.system.modules.animation'));
								if (test instanceof Function) test = test('default');
								if (test) {
									if (test.class) {
										test.class('draggable'); test.class('droppable');
									}
									if (test.style && test.style instanceof Function) {
										test.style('top', evt.y + 'px');
										test.style('left', evt.x + 'px');
									}
									if (test.attach) test.attach();
								}
							}catch(e) {
								console.log(e);
							}
						}
					}
				}
			},
			tmpl: {

				attr: function() {

					return { 'class' : 'drag-and-drop dd-wrap' };
				}
			},
			opts: {
				throttle: 30,
				draggable: '.draggable',
				droppable: '.droppable'
			},
			events: {
				data: {
					'change:opts.%' : 'data.control.main.adjust'
				},
				dom: {
					'mousedown:.draggable'   : 'data.control.main.init',
					'mousedown:div.draggable': 'data.control.main.start|100',
					'click:.draggable'       : 'data.control.main.cancel',
					'mouseup:.drag-and-drop' : 'data.control.main.stop'
				}
			}

		};

	});

});
