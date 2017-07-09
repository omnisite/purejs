define(function() {

	return sys().enqueue({

		name: 'core.module',

		deps: {

			core: [ 'pure' ],

			components: [ 'view' ]

		}

	}, function() {

		return {

			init: function(deps) {

				var module = deps.core.pure('klass')('Component').parse(this.module());
				module.prop('deps', deps.core.pure('utils.get')(deps));

				return this;

			},

			module: function() {
				return {
					klass: function Module(opts) {
						this.$super.call(this, opts);
					},
					ext: [
						{ name: '_children', value: 'modules' },
						(function addRoute() {
							if (!this._router || !this._router.addRoute) return false;
							return this._router.addRoute.apply(this._router, arguments);
						}),
						(function router(arg) {
							if (!arg && typeof arg == 'undefined') return this._router;
							else if (typeof arg == 'string' && arg.toLowerCase() != arg) return this._router.get([ 'fn', arg ].join('.'));
							return this._router.get(arg);
						}),
						(function setRouter(router) {
							this._router = this.set('router', router);
							this._router.setModule(this);
							sys.log([ 'setRouter', this.cid(), router.cid() ], 2);
							return this;
						}),
						(function CreateModuleLoader() {
							(function moduleRouter(module) {
								return module.root.observe('change', 'router', function(rt) {
									if (!module._router) {
										module.setRouter(module.get('root.router.app'));
									}else {
										module.setRouter(module._router.getScopeRouter(module._cid));
									}
									return true;
								});
							}),
							(function createModule(id, options) {
								this._modules || (this._modules = this.node('modules'));
								var opts   = options && typeof options == 'object' ? options : {};
								opts.name  = id;
								var module = this._modules.sub(opts, this.constructor);
								module._components = module.node('components');
								if (!this._router) {
									if ((this._router = this.get('root.router.app'))) {
										module.setRouter(this._router);
									}else {
										moduleRouter(module);
									}
								}else {
									module.setRouter(this._router.getActiveRouter().getScopeRouter(module._cid));
								}
								return module;
							}),
							(function loadModule(path, module) {
								return function(succ, fail) {
									require([ path ], function(fn) {
										if (fn instanceof Function) {
											fn(module).ready(function() { succ(module); });
										}else {
											module.ready(function() { succ(module); });
										}
									});
								};
							}),
							(function wrapModule(module, name, parent) {
								return function(succ, fail) {
									return loadModule([ 'modules', '/', name, '/', name, '.js' ].join(''), module)(function(result) {
										return succ(result);
									});
								}
							}),
							(function addModule(id, options) {
								var mod = this.getModule(id) || this.createModule(id, options || {});
								mod.get('loader') || mod.set('loader', wrapModule(mod, id, this));
								return mod;
							}),
							(function runLoader(succ, fail) {
								return this.get('loader')(succ || unit, fail || unit);
							}),
							(function wrapLoader(loader, succ, fail) {
								return function() {
									return loader(succ, fail);
								};
							}),
							(function loadModule(succ, fail) {
								return wrapLoader(this.get('loader'), succ, fail);
							}),
							(function getModule(path) {
								var app    = this.root.get('system.modules.application'),
									parts  = path instanceof Array ? path.slice(0) : path.split('.'),
									name   = parts[parts.length-1];
								return this.get(path) || (this._modules ? (this._modules.get(path) || this._modules.get(name)) : false);
							})
						}),
						(function CreateComponentFuncs() {
							(function getReference(id, type, info) {
								var fullref = [ info, type || id, this._cid, id || type ];
								sys.log(fullref);
								return fullref.slice(1);
							}),
							(function initComponent(id, type, props, attrs) {
								var ref = this.getReference(id, type, 'initComponent');
								return this.runAddComponent(id, type, ref, props, attrs, true);				
							}),
							(function addComponent(id, type, props, attrs) {
								var ref = this.getReference(id, type, 'addComponent');
								return this.runAddComponent(id, type, ref, props, attrs);
							}),
							(function initOwnComponent(id, type, props, attrs) {
								return this.addOwnComponent(id, type, props, attrs, true);
							}),
							(function addOwnComponent(id, type, props, attrs, lazy) {
								var ref = this.getReference(id, type, 'addOwnComponent');
								props || (props = {});
								props.module = this._cid;
								return this.runAddComponent(id, type, ref, props, attrs);
							}),
							(function runAddComponent(id, type, ref, props, attrs, lazy) {
								var comps = this._components || (this._components = this.node('components')), 
									name  = ref[ref.length-1], exist = comps.get(id);

								if (exist) return exist;
								return comps.set(name, this.mapComponent(sys.component(ref, attrs || {}, props || {}), lazy === true).fmap(function(comp) {
									if (comp instanceof Function && comp.length) {
										return comps.set(name, comp(attrs, props));
									}else {
										return comp.parent(comps).set(name, comp);
									}
								}));
							}),
							(function mapComponent(fut, lazy) {
								if (lazy) {
									return fut;
								}else {
									return fut.run();
								}
							}),
							(function getComponent(id, type) {
								var ref = this.getReference(id, type || id, 'getComponent');
								return this._components ? this._components.get(id) : undefined;
							}),
							(function setComponent(id, comp, type) {
								var referer = this.getReference(id, type || id, 'setComponent');
								var comps   = this._components || (this._components = this.node('components')),
										exists  = comps.get(id);
								if (!exists) return comps.set(id, comp);
								else if (exists._id != comp._id) debugger;
								return exists;
							})
						}),
						(function CreateStartup() {
							function start(mod) {
								mod.enqueue(function() {
									if (mod._router) mod._router.start();
									mod.complete();
									return true;
								});
								return mod;
							};
							this.prototype.run = function() {
								return start(this);
							};
							return (sys.app = this.prototype.root.get('system').addModule('application'));
						})
					],
					init: function(type, klass, sys) {
						klass.prop('root', sys.root.child('system', klass.$ctor));
					}
				};
			}

		};

	});

});
