    (function App() {
        console.log('App');
        return [].slice.call(arguments).pure(0, true);
    })(
        (function app(args) {
            return function app(base) {
                var fold = args.shift();
                return args.make().bind(fold(base)).collect();
            }
        }),
        (function make(base) {
            return function(f) {
                base[f.name] = f(base);
                return base;
            }
        }),
        (function type(base) {
            return function type(name) {
                return name ? base.types.find(name) : base.types;
            }
        }),
        (function of(base) {
            return base.type('Maybe').$of();
        }),
        (function io(base) {
            return base.type('IO').$pure();
        }),
        (function choice(base) {
            return function choice() {
                return base.root.choice.runSet.apply(base.root.choice, [].slice.call(arguments));
            }
        }),
        (function extend(base) {
            return function extend() {
                var args = [].slice.call(arguments);
                var type = base.types.find(args.shift());
                return type.extend.apply(type, args);
            }
        }),
        (function get(base) {
            return function(key) {
                return base.root.get(key);
            }
        }),
        (function wrap(base) {
            return base.root.get('utils.$const')({
                base: function() {
                    return base;
                },
                type: function(name) {
                    return base.type(name);
                },
                get: function(key) {
                    return base.root.get(key);
                },
                lookup: function(key, orElse) {
                    return base.root.lookup(key, orElse);
                },
                eff: function() {
                    return base.eff.apply(base, arguments);
                },
                of: base.of,
                xhr: function(type) {
                    return base.xhr(type);
                },
                enqueue: function(def, cont) {
                    return base.enqueue(def, cont);
                }
            });
        })
    ),