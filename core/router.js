define(function() {

	return this.enqueue({

		name: 'core.router',

		deps: {

			core: [ 'pure', 'dom' ]

		}

	}, function() {

		return {

			init: function(deps) {
				return deps('core.pure')(function(sys) {
					return function(app) {
						return sys.klass('Node').parse(app.klass()).prop('root');
					}
				})(this);
			},

			klass: function() {
				return {
					klass: function Router(x) {
						var opts = x || {};
						this.$super(opts);
						this._events  = (opts.parent._events || opts.parent.get('events')).child({ name: 'events', parent: this });
						this._started = 1;
						this._scope   = opts.scope || [];
						this._active  = this.set('active', null);
						this._scopes  = this.node('scopes');
					},
					ext: [
						{ name: '_children', value: 'scopes' },
						(function started() {
							return this._started > 1;
						}),
						(function startup() {
							var rtr = this, result;
							if (rtr._started < 2 && (rtr.start())) {
								rtr.observe('change', 'active', rtr.run.bind(rtr));
								if (!rtr.get('active')) {
									var hash = window.location.hash.replace('#', ''),
										parts  = hash.split('/'),
										length = parts.length,
										index  = rtr._scope.length,
										rest, test;

									if (parts.length <= index) parts.push('');
									while(index < parts.length) {
										test = parts.slice(index, index+1).join('/');
										if (rtr.testIfExists(test)) {
											result = rtr.setActiveRoute(test);//parts.slice(index, index+1).join('/'));
											break;
										}else {
											parts.pop();
										}
									}
									if (parts.length < length) {
										if (index) {
											this.reload(hash.split('/').slice(0, this.getActiveRoute(true).length).join('/'));
										}else {
											rtr.navigate('');
										}
									}
								}
								return result;
							}
						}),
						(function setActiveRoute(path) {
							this.set('previous', this.get('active'));
							return this.set('active', path);
						}),
						(function getScopeRouter(name, isDefault) {
							var scopes = this._scopes || (this._scopes = this.get('scopes')) || (this._scopes = this.node('scopes'));
							var scope  = scopes.get(name);
							if (isDefault) this.setDefault(name);
							if (!scope) {
								scope = this.child({ name: name, scope: this._scope.concat([name]) });
							}
							return scope;
						}),
						(function scope() {
							return this._scope;
						}),
						(function module(arg) {
							if (!arg && typeof arg == 'undefined') return this._module;
							else if (typeof arg == 'string' && arg.toLowerCase() != arg) return this._module.get([ 'fn', arg ].join('.'));
							return this._module.get(arg);
						}),
						(function setModule(module) {

							return this._module = this.set('module', module);
						}),
						(function getActiveRoute(asArray) {
							var router = this.getActiveRouter(),
								active = router.get('active'),
								full   = router._scope.concat(active && active != '' ? [ active ] : []);
							return asArray ? full : full.join('/');
						}),
						(function getRootPath(asArray, router) {
							router || (router = this);
							return asArray ? router._scope.slice(0) : router._scope.join('/');
						}),
						(function getActiveRouter(arg) {
							var router = this.root, test = router,
								active = router.getFromHash().split('/'),//(router.get('active') || '').split('/'),
								scopes = router.get('scopes');
							if (active && scopes) {
								while ((test = scopes.get(active.shift())) && test instanceof router.constructor) {
									if (test.started() && test.testIfExists(active.length ? active.first() : '')) {
										router = test;
									}else {
										break;
									}
									if (!(scopes = router.get('scopes'))) break;
								}
							}
							return arg == 'module' ? router.module.apply(router, Array.prototype.slice.call(arguments, 1)) : (arg ? router.get(arg) : router);
						}),
						(function testIfExists(path) {
							if (typeof path != 'string') return false;

							var parts = path.split('/');
							var route = parts.pop();

							if (parts.length && parts[0] == this._cid) parts.shift();

							if (parts.length > this._scope.length) return false;
							else if (parts.length && parts.join('/') != this._scope.join('/')) return false;

							if (typeof route == 'string' && this._routes && this._routes.get(route)) {
								return true;
							}else {
								return false;
							}
						}),
						(function runIfExists(path) {
							if (this.testIfExists(path)) {
								this.setActiveRoute(path);
								return true;
							}else {
								return false;
							}
						}),
						(function run(evt) {
							if (evt.target == 'active') {
								var router  = this.getActiveRouter();
								console.log('ROUTER: handler = ', this.identifier(), ' relay = ', router.identifier());
								var active  = evt.value.split('/').pop();
								var handler = router.getRoute(active);
								if (handler && handler instanceof Function) {
									this.enqueue(handler(this.getRouteName(active), this.get('previous')));
								}
							}
						}),
						(function reload(path) {
							setTimeout(function() {
								self.location.assign(path);
							}, 200);
						}),
						(function getRoutes() {

							return this._routes || (this._routes = this.get('routes') || this.node('routes'));
						}),
						(function getRouteName(name) {
							var routes = this.getRoutes().store(), route = routes.get(name);
							return typeof route == 'string' ? route : name;
						}),
						(function getRoute(name) {

							return this.getRoutes().get(this.getRouteName(name));
						}),
						(function setRoute(name) {
							this.clearActiveRoute();
							var route = this._scope.slice(0);
							route.push(name);
							self.location.href = '#' + route.join('/');
							return this;
						}),
						(function clearActiveRoute() {
							var active = this.getActiveRouter(), depth = this._scope.length, test = active;
							while (active && active._scope && active._scope.length > depth) {
								active.val('active', null);
								if (active._scope.length && (test = active.parent()) && test instanceof Router) active = test;
								else break;
							}
							return this;
						}),
						(function getFromHash(fallback) {
							var route = self.location.hash.slice(1);
							return route && route.length ? route : fallback || '';
						}),
						(function navigate(route) {
							var alias = this.getRoutes().get(route || '');
							if (alias && typeof alias == 'string') {
								this.setRoute(alias);
							}else {
								this.setRoute(route || '');
							}
						}),
						(function moveBack(times) {
							var hist = self.history, length = Math.min(times || 1, hist.length);
							while (length && hist.back() && length--) {};
						}),
						(function moveForward(times) {
							var hist = self.history, length = Math.min(times || 1, hist.length);
							while (length && hist.forward() && length--) {};
						}),
						(function popState(end) {
							var parts = self.location.hash.slice(1).split('/');
							if (!parts.length) {
								return false;
							}else if (end && parts[parts.length-1] != end) {
								return false;
							}else {
								var loc = '#'+parts.slice(0, -1).join('/');
								self.location.replace(loc);
								this.setActiveRoute(loc.replace('#', ''));
								return true;
							}
							return false;
						}),
						(function addRoute(name, handler, info, aliasIfStringOrUseAsDefaultIfTrue) {
							var routes = this.getRoutes();
							routes.set(name, Function.prototype.bind.bind(Function.prototype.call, handler, this));
							if (info === true) this.setDefault(name);
							else if (typeof info == 'string') this.addAlias(info, name);
							else if (typeof info != 'undefined') this.addInfo(name, info);
							if (aliasIfStringOrUseAsDefaultIfTrue || typeof aliasIfStringOrUseAsDefaultIfTrue == 'string') {
								this.addAlias(aliasIfStringOrUseAsDefaultIfTrue === true ? '' : aliasIfStringOrUseAsDefaultIfTrue, name);
							}
							return this;
						}),
						(function addAlias(name, alias) {
							return this.getRoutes().set(name, alias);
						}),
						(function setDefault(name) {
							return this.getRoutes().set('', name);
						}),
						(function addInfo(name, info) {
							var node = this._info || (this._info = this.get('info')) || (this._info = this.node('info'));
							return node.set(name, info);
						})
					],
					hashchange: function(rtr) {
						return function(evt) {
							if (rtr.started()) {
								rtr.setActiveRoute(self.location.hash.slice(1));
							}
						}
					},
					init: function(type, klass, sys) {
						var lstr = this.find('Listener').$ctor;
						klass.prop('listener', lstr.init('router', 'store'));
						var root = klass.prop('root', sys.root.child('router', klass.$ctor));
						//klass.prop('dispatcher', klass.prop('listener').run(root));

						self.addEventListener('hashchange', type.hashchange(root), false);
					}
				};
			}

		};

	});

});
