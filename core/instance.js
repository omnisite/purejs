define(function() {

	return this.enqueue({

		name: 'core.instance',

		deps: {

			core: [ 'pure', 'dom' ]

		}

	}, function() {

		return {

			init: function(deps) {
				return deps('core.pure')(function(sys) {
					return function(app) {
						return sys.klass('ctor').parse(app.klass());
					}
				})(this);
			},

			klass: function() {
				return {
					klass: function Instance(arg) {
						this.id  = this.ctor.$id = this.id();
						var type = typeof arg == 'string' ? this.klass(arg) : arg;
						var code = this._type = type.$code, args, vals, inst, inid;
						var node = this.$store.get(code);
						if (!node) {
							node = this.$store.child(code);
							inid = node.set('inid', this.$fn.tmpid());
							args = node.set('args', this.$fn.args(type.$ctor));
							vals = node.set('vals', args.reduce(function(r, a) {
								if (a == 'x') r.vals.push(r.type.prop('mv'));
								if (a == 'f') r.vals.push(r.type.prop('mf'));
								return r;
							}, { type: type, vals: [] }).vals);
							inst = node.child('inst');
						};
					},
					ext: [
						(function title() {
							return this.lookup('inid').orElse(this.val('inid')).lift(function(inid, name) {
								return inid + (name ? (' - ' + name) : '');
							}).ap(this.lookup('name').orElse('')).unit();
						}),
						(function lookup(key) {
							return this.$store.get(this._type, 'inst').lookup('%current'.concat('.', key));
						}),
						(function get(key) {
							return this.$store.get(this._type, 'inst', '%current', key);
						}),
						(function val(key) {
							return this.$store.get(this._type, key);
						}),
						(function set(arg) {
							var store = this.$store.get(this._type, 'inst');
							var name  = store.is(arg) ? arg.get('name') : arg.name;
							var code  = name.toTypeCode();
							var inid  = (store.is(arg) ? arg.get('inid') : arg.inid);
							if (inid == this.val('inid')) inid = arg.inid = this.$fn.inid();
							var node  = (store.get(inid) || (store.is(arg) ? arg : store.node(inid))).parse(arg);
							return store.set(store.set('current', node.cid()), node);
						}),
						(function node(vals) {
							vals || (vals = {});
							vals.type = this._type;
							vals.inid || (vals.inid = this.val('inid'));
							var node  = this.$schema.control('main').add(vals);
							if (this.has('x')) node.argx = this.arg('x') || '';
							if (this.has('f')) node.argf = this.$fn.toString(this.arg('f'));
							return node;
						}),
						(function has(k) {
							var index = this.val('args').indexOf(k);
							return index > -1 ? true : false;
						}),
						(function arg(k) {
							var idx = this.val('args').indexOf(k);
							if (idx > -1) return this.val('vals').at(idx);
						}),
						(function cast(v) {
							try {
								return eval('(' + v + ')');
							}catch(e) {
								return v;
							}
						}),
						(function fn() {
							var args = [].slice.call(arguments), result;
							var inst = args.shift();
							try {
								result = inst[args.shift()].apply(inst, args.map(this.cast));
							}catch(e) {
								console.log(e);
								result = inst;
							}
							return result;
						}),
						(function map(i, f) {
							return this.fn(i, 'map', f);
						}),
						(function bind(i, f) {
							return this.fn(i, 'bind', f);
						}),
						(function ap(i, m) {
							return this.fn(i, 'ap', m);
						}),
						(function chain() {
							var args = [].slice.call(arguments);
							return this.fn.apply(this, [ args.shift(), 'chain' ].concat(args));
						}),
						(function make() {
							var type  = this.get('type');
							var klass = this.klass(type);
							var inst  = klass[this.get('func') || 'of'].apply(klass, this.val('args').reduce(function(r, a) {
								var arg = r.inst.get('arg'+a);
								if (arg) r.vals.push(r.inst.cast(arg));
								return r;
							}, { vals: [], inst: this }).vals);

							var ext = {};
							if ((ext.method = this.get('method')) && (ext.argm = this.get('argm'))) {
								inst = this[ext.method.toLowerCase()](inst, ext.argm);
							}
							return inst;
						}),
						(function run() {
							var args = [ this.make(), 'run' ];
							var argr = this.get('argr');
							if (argr) args.push(argr);
							return this.fn.apply(this, args);
						})
					],
					schema: {
						fields: {
							inid: 	{ type: 'string',   elem: { tag: 'input',	  label: 'Name', type: 'text', placeholder: 'name'  } },
							name: 	{ type: 'string',   elem: { tag: 'input',	  label: 'Name', type: 'text', placeholder: 'name'  } },
							type:   { type: 'string',   elem: { tag: 'select',    label: 'Type', data: 'options:components.types.data.items.types', options: [] } },
							func: 	{ type: 'string',   defv: 'of', elem: { tag: 'select',    label: 'Func', options: [ 'of', 'pure', 'lift' ], empty: false } },
							argx:   { type: 'function', elem: { tag: 'component', label: 'Argument X', klass: 'code-edit', attrs: { style: { display: 'none' } } } },
							argf:   { type: 'function', elem: { tag: 'component', label: 'Argument F', klass: 'code-edit', attrs: { style: { display: 'none' } } } },
							method: { type: 'string',   elem: { tag: 'select',    label: 'Method', options: [ 'Map', 'Bind', 'Lift', 'Ap', 'Chain' ] } },
							argm:   { type: 'function', elem: { tag: 'component', label: 'Argument to Method', klass: 'code-edit' } },
							argr:   { type: 'function', elem: { tag: 'component', label: 'Argument to Run', klass: 'code-edit' } }
						}
					},
					init: function(type, klass, sys) {
						klass.prop('$fn', {
							args: sys.get('utils.getArgs'),
							toString: sys.get('utils.toString'),
                            inid: this.makeID('IN'), tmpid: this.makeID('TMP')
						});
						var store = klass.prop('$store', sys.get().child('instance'));
						var lstnr = sys.klass('Listener').$ctor;
						store.listener = lstnr.init('instance', 'store');
						store._events  = sys.get('events').child({ name: 'events', parent: store });
						var schema = klass.prop('$schema', sys.get('schema').child('$instance'));
						schema.parse(type.schema, 2);
					}
				};
			}

		};

	});

});
