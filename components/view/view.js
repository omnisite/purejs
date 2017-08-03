define(function() {

	return this.enqueue({

		name: 'view',

		deps: {

			core: [ 'pure', 'dom' ],

			scripts: [ 'doT' ]

		}

	}, function() {

		return {
			init: function(deps) {
				return deps('core.pure')(function(sys) {
					return function(def) {

						var init = def.rdr.call({
							klass: sys.klass('Reader'), $cache: sys.get().ensure('cache.view'), $eff: def.$eff
						}).of(def.reader.init);

						def.ext.reader = init.bind(def.reader.make);
						def.ext.$eff   = def.$eff;
						def.ext.doT    = def.doT(def.deps('scripts.doT'));
						return { ext: def.ext, deps: def.deps };
					}
				})(this);
			},
			deps: function(deps) {
				this.deps = deps;
				return this;
			},
			doT: function(doT) {
				return function(str, attr) {
					return doT.compile(str, attr);
				}
			},
			reader: {
				init: function(ctx) {
					return this.item(ctx);
				},
				make: function(x) {

					var attach = x.lift().ap(function(ctx, selector) {
						return ctx.attach().map(function(elem) {
							return elem.map(function(e) {
								return e.parentElement;
							}).chain(function(e) {
								ctx.view.state('attach', e.id || e.className);
								return e;
							});
						}).runIO(selector ? ctx.eff('query').run(selector) : ctx.view.module().$el());
					}).run();//.run(/*selector*/);

					var render = x.lift().ap(function(ctx, type) {
						return ctx.render().ap(ctx.view.tmpl('item', type));
					}).run();//.run(/*type e.g. 'main' */).run(/* {title:'Testttt'} */);

					return this.of(unit).lift(function(r, v) {
						return v.el.fx(function(t, a) {
							if (!r.result) r.result = r.render.run(t).run(a);
							return r;
						});
					}).run({ attach: attach, render: render });
				},
				wrap: function(init, make) {
					return { init: init, make: make };
				},
				run: function(ctx) {
					return this.init(ctx);
				}
			},
			rdr: function() {
				return this.klass.extend(function EffReader(f) {
					this.$super.call(this, f);
				}, {
					$eff: this.$eff,
                    eff: function(name, value) {
                        return value ? (this.$eff[name] = value) : (name ? this.$eff[name] : this.$eff);
                    },
                    $cache: this.$cache,
                    cache: function(type, path, value) {
                    	return (this.$cache.get(type) || this.$cache.node(type)).acc(path, value);
                    },
					item: function(view) {
						return {
							reader: this,
							konst: this.sys().fn.$const,
							eff: function(name, value) {
								return this.reader.eff(name, value);
							},
							el: view.el,
							view: view.view,
							cache: this.cache !== false && view.cache !== false ? function(key, value) {
								return (this[key] = this.konst(value))();
							} : function(key, value) {
								return value;
							},
							io: function() {
								return this.cache('io', this.reader.klass('IO').of(this));
							},
							lift: function() {
								return this.cache('lift', this.io().lift(function(ctx, fn) {
									return this.fx(function(value) {
										return fn(ctx, value);
									});
								}));
							},
							empty: function() {
								return this.cache('empty', this.eff('empty').ap(this.el));
							},
							replace: function() {
								return this.cache('replace', this.append().ap(this.empty()).pure());
							},
							render: function() {
								return this.cache('render', this.append().nest().lift(function(append, template) {
									return append.run(template);
								}));
							},
							find: function() {
								return this.cache('find', this.eff('find').run(this.el.run()).toIO());
							},
							maybe: function() {
								return this.cache('maybe', this.find().toMaybe());
							},
							attrs: function() {
								return this.cache('attrs', this.eff('attrs').ap(this.el).pure());
							},
							append: function() {
								return this.cache('append', this.eff('append').ap(this.el).pure());
							},
							attach: function() {
								return this.cache('attach', this.eff('attach').to('io').ap(this.el).run());
							},
							display: function() {
								return this.cache('display', this.eff('display').ap(this.el).pure());
							}
						};
					}
				});
			},
			$eff: sys.run(function() {
				return {
					elem: this.eff('dom.elements.create').init('maybe', 'IO'),

					attr: this.eff('dom.elements.attr').init(),

					attrs: this.eff('dom.elements.attrs').init(),

					make: this.eff('dom.elements.make'),

					div: this.eff('dom.elements.make').run('div').run(),

					button: this.eff('dom.elements.button').init(),

					html: this.eff('dom.elements.html').init(),

					query: this.eff('dom.elements.query').init(),

					find: this.eff('dom.elements.find').init(),

					children: this.eff('dom.elements.children').init(),

					attach: this.eff('dom.elements.attach').init(),

					append: this.eff('dom.elements.append').init(),

					render: this.eff('dom.elements.render').init(),

					style: this.eff('dom.elements.style').init(),

					css: this.eff('dom.elements.css').init(),

					empty: this.eff('dom.elements.empty').init(),

					display: this.eff('dom.elements.display').init(),

					recycle: this.eff('dom.elements.recycle').init(),

					tr: this.eff('dom.elements.tr').init('bind', 'Maybe', 'IO'),

					transitionEnd: this.eff('dom.easing.transitionEnd').init(),

					toggle: this.eff('dom.elements.toggle').init()
				};
			}),
			ext: {
				state: function(key, value) {
					var parent = this.parent();
					parent.state(key, value);
					return parent;
				},
				queue: function(path) {
					return this._dom.getQueue('dom').lift(function(dom, node) {
						return dom.lookup(node.nid()).chain(function(node) {
							return node.store();
						});
					}).ap(path ? this.parent().module().lookup(path) : this.parent().maybe());
				},
				update: function(opts) {
					opts || (opts = {});
					this.$super.call(this.parent('view', this), opts);

					this._tag  = this.eff('make').run(this.parent('data.tmpl.tag') || 'div').run();
					this._el   = this.parent('$fn.el', this._tag.of(this.attr()).lift(function(value, base) {
						return base.of(base.run(value));
					}).run(this._tag));

					this._body || (this.ctor.prop('_body', this.dom.run(document.body)));
					this._dom  = this.set('dom', opts.dom || this.dom.run(this._el.run()));
					this._item = this.parent('$fn').parse(this.item(this._el));
					this._elms = this.eff('children').nest().lift(function(ch, fn) {
						return this.fx(function(effect, selector) {
							return ch.run(effect)(fn.ap(selector));
						});
					}).run(this.parent('$fn.find'));

					if (this.parent().deps) this.style();
				},
				elms: function(effect, selector) {
					return this._elms.run(effect, selector);
				},
				ctx: function(el, cache) {
					return { view: this, el: el || this._el, cache: cache !== false };
				},
				read: function(el, cache) {
					return (this._read || (this._read = this.reader.run(this.ctx(el, cache))));
				},
				item: function(el) {
					return (function(view, item) {
						item.replace = view.eff('append').ap(item.empty).pure();
						item.render  = view.eff('append').ap(item.find).nest().lift(function(append, view) {
							return this.fx(function(type, selector) {
								return append.ap(selector || '*').pure().ap(view.tmpl('item', type));
							});
						}).run(view);
						return item;
					})(this, {
						el:      el,
						find:    this.eff('find').run(el.run()).toIO(),
						attrs:   this.eff('attrs').ap(el).pure(),
						append:  this.eff('append').ap(el).pure(),
						attach:  this.eff('attach').ap(el).pure().ap(this.eff('query')),
						empty:   this.eff('empty').ap(el),
						display: this.eff('display').ap(el).pure()
					});
				},

				$el: function(selector) {
					return selector ? (this._find || (this._find = this.eff('find').ap(this._el).run().toIO().toMaybe())).run(selector) : this._el;
				},

				on: function(name, selector, handler, throttle) {
					return this._dom.addEventListener(this._el.run(), 'dom', name, selector, handler, throttle);
				},

				body: function(/* name, selector, handler, throttle */) {
					return this._body.addEventListener.apply(this._body, [].slice.call(arguments).prepend(document.body, 'dom'));
				},

				elem: function(tag) {
					var store = this._tags || (this.constructor.prototype._tags = this.ctor.$store.node('tags'));
					return store.get(tag) || store.set(tag, this.eff('elem')(tag));
				},

				tag: function(tag) {
					var store = this._elems || (this.constructor.prototype._elems = this.ctor.$store.node('elems'));
					return store.get(tag) || store.set(tag, this.eff('make').run(tag).run());
				},

				attr: function() {
					return this.get('attr') || this.set('attr', sys.get('utils.extend')({ id: this.parent().nid() }, this.tmpl('attr')));
				},

				style: function(name) {
					return this.lift(function(v, t) {
						return t.bind(function(name) {
							return v.eff('style').run(v.render(name).run({}));
						}).run();
					}).ap(this.maybe().map(function(view) {
						return view.parent().deps('templates');
					}).map(function(tmpls) {
						return tmpls.bind(function(o, v, k) {
							if (v && v.isStore) {
	                            var keys = sys.get('link.idx.valueMap').run('scripts', 'style.' + k, true);
								return keys.filter(function(x) {
									return (!o[x] && (o[x] = 1)) || !o[x]++;
								});
							}else {
								return v;
							}
						}).flatten();
					}));
				},

				type: function() {
					return (this._tmpl || (this._tmpl = this.parent().deps('templates.' + this.parent('type'))));
				},

				tmpl: function(path) {
					return (this.parent('data').get('tmpl', path) || this.$tmpl(path)).apply(this, [].slice.call(arguments, 1));
				},

				$tmpl: function(name) {
					return function(attrs) {
						var view = this;
						var type = attrs && typeof attrs == 'string' ? attrs : (name || 'main');
						var item = view.get(type);
						if (!item) {
							if (attrs && typeof attrs == 'object') {
								var elem = view.eff('div');
								var html = view.eff('html').ap(elem.ap(elem.of(attrs))).pure();
							}else {
								var html = view.eff('render').ap('div').pure().toMaybe();
							}
							item = view.set(type, html.ap(view.render(type)));
						}
						return item;
					}
				},

				paths: function(path) {
					return (this._paths || (this._paths = this.node('paths'))).get(path);
				},

				evts: function() {
					if (!this._evts) {
						this._evts = this.klass('io').pure(function(attr) {
							return this.fx(function(evt) {
								var target = evt.target.split('.').pop();
								return this.fx(function(elm) {
									if (elm.getAttribute('data-bind-name') == target && (evt.elem = elm)) {
										attr.run(evt.elem)('value', evt.value);
									}else if ((evt.elem = elm.querySelector('#'+target))) {
										attr.run(evt.elem)('value', evt.value);
									}else if ((evt.elem = elm.querySelector('[data-bind-name="'+target+'"]'))) {
										attr.run(evt.elem)('value', evt.value);
									}
									return elm;
								});
							});
						}).run(this.eff('attr'));
					}
					return this._evts;
				},

				module: function() {
					return this.parent().module();
				},

				closest: function(selector) {
					return (this._closest || (this._closest = this.lift(function(view, selector) {
						return view._el.map(function(elem) {
							if (elem.matches(selector)) return view;
							var el = elem.closest(selector), st;
							if (el) st = sys.find(el.id.replace(/[^0-9]/g, ''));
							if (st) return st.view();
						}).run();
					}))).run(selector);
				},

				dbpt: function() {
					if (!this._dbpt) {
						this._dbpt = this.parent('$fn.find').toMaybe().map(function(x) {
							return x.map(function(el) {
								return Array.prototype.concat.apply([], el.querySelectorAll('[data-bind-name]'));
							}).orElse([]).unit();
						});
					}
					return this._dbpt;
				},

				bindpath: function() {
					return this.$el('[data-bind-path]').map(function(el) {
						return el.getAttribute('data-bind-path');
					});
				},

				binding: function(evt) {
					if (evt.src == 'data' && evt.action !== 'remove') {
						if (!this.is(evt.value) && typeof evt.value != 'object') {
							var rel = this.parent().lift(function(parent, path) {
								return parent.get(path).level();
							}).ap(this.bindpath()).chain(function(level) {
								return evt.level - level;
							});
							if (rel) {
								return this.evts().run(evt).ap(this.$el('[data-bind-ext="' + evt.ref.split('.').slice(-rel).join('.') + '"] [data-bind-name="' + evt.target + '"]'));
							}else {
								return this.evts().run(evt).ap(this.$el('[data-bind-name="' + evt.target + '"]'));
							}
						}
					}
				},

				click: function(evt, hndl) {
					var data = evt.currentTarget.getAttribute('data-click'), path, func;
					if (data) {
						path = data.split('.');
						func = path.pop();
						return this.parent().lookup(path).chain(function(base) {
							return base[func].call(base, evt, hndl);
						});
					}
				},

				dispatch: function(type, elem) {
					var evt = document.createEvent('HTMLEvents');
					evt.initEvent(type, true, true);
					elem.dispatchEvent(evt);
					return evt;
				},

				append: function(tag, attrs, selector) {
					return this.eff('attach').ap(this.tag('div').run(attrs)).pure().ap(this.eff('query')).run(selector);
				},

				render: function(type) {
					return this.maybe().map(function(view) {
						return view.type();
					}).map(function(t) {
						return t.get(type);
					}).lift(this.doT).ap(this.lookup('attr').orElse({})).lift(function(tmpl, data) {
						return tmpl(data && data['$key'] ? data[data['$key']] : (data || {}));
					}).toMaybeIO();
				}
			}
		};

	});

});