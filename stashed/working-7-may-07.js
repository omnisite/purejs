// ========  ========= PURE JS ====== ========  ======== //

    // === StartApp === //
    (function() {

        return [].slice.call(arguments).call(1);
    })(

    // === Utils === //
    (function() {

        return [].slice.call(arguments).shift().call([ Array.prototype ].concat([].slice.call(arguments)));
    })(
        (function call() {
            return this[2].apply(this, this.slice(1));
        }),
        (function values() {
            return this.reduce(function(r, v) {
                r[v.name] = v;
                return r;
            }, this.shift());            
        }),
        (function call(idx) {
            return this[0].apply(this[1], this.slice(2+(idx||0)));
        }),
        (function at(index) {
            return this.length && index < this.length ? this[index] : [];
        }),
        (function next(f) {
            return Array.prototype.concat.apply([], this.map(f));
        }),
        (function ap(item) {
            return item && item.$ap ? item.$ap(this) : item.map(this.chain(unit));
        }),
        (function arr($apply) {
            return function apply(idx, recur) {
                if (recur || idx === true) {
                    return $apply(this);
                }else if (idx instanceof Function) {
                    return idx.apply(undefined, this.slice(0));
                }else {
                    return this[idx||0].apply(undefined, this.slice((idx||0)+1));
                }
            };
        }).call(Array,
            (function apply(bind) {
                return function $apply(x) {
                    if (x instanceof Array) {
                        return bind($apply)(x).apply();
                    }else {
                        return x;
                    }
                }
            })(
                (function bind(f) {
                    return function(x) {
                        return Array.prototype.concat.apply([], x.map(f));
                    }
                })
            )
        )
    ),

    // === ArgumentsResolver === //
    (function() {
        return [].slice.call(arguments).reduce(function(r, v, i) {
            if (v.name == '$_parseArgs') {
                r.push(v.apply({}, r.slice(0)));
            }else if (v.name == '$_import') {
                r.push(v(r.slice(-1)));
            }else {
                r.push(v);
            }
            return r;
        }, []);
    })(
        (self.unit = (function unit(t) {
            return t;
        })),
        (self.$const = (function $const(a) {
            return function() {
                return a;
            }
        })),
        (self.extract = (function extract(fn) {
            return fn(unit);
        })),
        (self.pure = (function $_pure(v) {
            return function(f) {
                return f(v);
            }
        })),
        (function getArgs(func) {
            // Courtesy: https://davidwalsh.name/javascript-arguments
            var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];
            return args.split(',').map(function(arg) {
                return arg.replace(/\/\*.*\*\//, '').trim();
            }).filter(function(arg) { return arg; });
        }),
        (function makeArgs(func, args, arr) {
            return func.apply(undefined, args.map(function(a, i, r) {
                return arr[a.replace('$_', '')];
            }));
        }),
        (function $_parseArgs(makeArgs, getArgs) {
            return function parseArgs(f, r) {
                if (f.name.substr(0, 2) == '$_') {
                    return makeArgs(f, getArgs(f), r);
                }else {
                    return f;
                }
            }
        }),
        (function $_import($_parseArgs) {
            return function parseFn(r, v) {
                var name = v.name ? v.name.replace('$_', '') : '';
                if (plain || !r || !r.set) {
                    r[name] = name != v.name ? r[name]() : (r[v.name] = v());
                }else if (name) {
                    r.set(name, v());
                }
                return r;
            }
        }),
        (function makeKlass(/* args: name, ext, defs */) {
            var args   = [].slice.call(arguments);
            var type   = typeof args[0] == 'object' ? (args[0].ext ? args.shift() : { ext: args.shift() }) : {};
            var name   = typeof args[0] == 'string' ? args.shift() : type.name;
            var attrs  = args.length && typeof args[0] == 'object' ? args.shift() : {};

            var klass  = type.klass || this.named(name, true, type.ctor, !!parent, !!parent);
            var parent = type.parent;
            klass.prototype = this.ext(type.ext || [], parent ? this.inherit(klass, parent) : { constructor: klass, ctor: type.ctor || unit }, true);
            if (type.attrs) this.ext(type.attrs, klass);
            if (!klass.prototype.id) klass.prototype.id = this.makeID();
            if (type.init) type.init.call(this, type, klass);
            return klass;
        }),
        (function parseInitial() {
            return [].slice.call(arguments).reduce(function(r, v, i, o) {
                if (i == 0) r[v.name] = v(unit);
                else if (v.name && r.root) r.root.set(v.name, v);
                else if (v.name) r[v.name] = v;
                else if ((v = v.call(r)) && v.name == 'Store') r.types[v.name] = r.makeKlass(v);
                else if (v.ext || v.ctor) r.types[v.name] = r.makeKlass(v);
                return r;
            }, this);
        }),
        (function() {

            return [].slice.call(arguments).apply();
        })(
            (function(build, make, capture, result, wrap) {
                return wrap(build(make), capture, result);
            }),
            (function() {
                var args = [];
                var next = (function(f) { return f(args.shift()); });

                var tmpl = [ 
                    pure('$$__purejs.push(pure((function Make'), next, pure('() {'),
                        pure('return function '), next, pure('() {'),
                            pure(' this.id();'),
                            pure(' this.ctor.apply(this, arguments);'),
                            pure(' this.__level__ && !(this.__level__ = 0);'),
                            pure(' this.__super__.call(this);'),
                            pure(' return this;'),
                        pure('}})()));') ];

                return function(k) {
                    return k(args, next, tmpl);
                }
            })(),
            (function(args, next, tmpl) {
                return function named(name, id, ctor, level, superr) {
                    args.push(name, name);
                    return tmpl.filter(function(v, i) {
                        return i < 6 || (i == 7 && id) || (i == 8 && ctor) || (i == 9 && level) || (i == 10 && superr) || i > 10;
                    }).map(extract).join('');
                }
            }),
            (function() {
                var val = self.$$__purejs = [];
                return function tmp(fn) {
                    return fn(unit);
                }
            })(),
            (function(text) {
                var script = document.createElement('script');
                script.innerHTML = text;
                var headel = document.getElementsByTagName('head')[0];
                headel.appendChild(script);
                headel.removeChild(script);
                return $$__purejs.pop();
            }),
            (function(make, capture, result) {
                return function named() {
                    return capture(result(make.apply(undefined, [].slice.call(arguments))));
                }
            })
        )
    ),

    // === Dispatcher === //
    (function() {

        return [].slice.call(arguments).apply();       
    })(
        (function makeDispatcher(create_dispatcher, wrapped_dispatcher, process_messages, create_enqueue_platform, close_over) {
            return (function dispatcher(cb, timer) {
                return cb(create_dispatcher(wrapped_dispatcher, process_messages, close_over, create_enqueue_platform, timer)); });
        }),
        (function create_dispatcher(wrapped_dispatcher, process_messages, close_over, create_enqueue_platform, timer) {
            var tasks = [], status = [ 0, 0, 50, false, false, { frameid: 0, count: 0, ts: 0, limit: 0, rs: 0, handle: 0, suspend: false, length: 0, maxlen: 0 } ];
            return close_over(
                (function() { return tasks; }),
                    (function() { return status; }),
                        wrapped_dispatcher(status, process_messages(tasks, status), timer),
                            create_enqueue_platform);
        }),
        (function wrapped_dispatcher(status, process_messages, timer) {
            var TASK_RUNNING = 3, TASK_QUEUED = 4, TASK_INFO = TASK_QUEUED+1;
            if (timer) {
                function queue_dispatcher() {
                    if (!(status[TASK_QUEUED] && status[TASK_RUNNING])) {
                        status[TASK_QUEUED] = true;
                        status[TASK_INFO].handle = timer(onmessage);
                    }
                };
                function onmessage() {
                    if (!process_messages()) queue_dispatcher();
                    else status[TASK_QUEUED] = false;
                };
                return queue_dispatcher;
            }else if (typeof MessageChannel !== "undefined") {
                var message_channel = new MessageChannel();
                function queue_dispatcher()  {
                    if (!(status[TASK_QUEUED] && status[TASK_RUNNING])) {
                        status[TASK_QUEUED] = true;
                        message_channel.port2.postMessage(0);
                    }
                };
                message_channel.port1.onmessage = function(_) {
                    if (!process_messages()) queue_dispatcher();
                    else status[TASK_QUEUED] = false;
                };
                return queue_dispatcher;
            }else if (typeof setImmediate !== "undefined") {
                return function queue_dispatcher() {
                    if (!(status[TASK_QUEUED] && status[TASK_RUNNING])) {
                        status[TASK_QUEUED] = true;
                        setImmediate(process_messages);
                    }
                };
            }else {
                return function queue_dispatcher() {
                    if (!(status[TASK_QUEUED] && status[TASK_RUNNING])) {
                        status[TASK_QUEUED] = true;
                        setTimeout(process_messages, 0);
                    }
                };
            }
        }),
        (function process_messages(tasks, status) {
            var TASK_INDEX = 0, TASK_START_AT = 0, TASK_COUNTER = TASK_START_AT+1,
                TASK_BATCH_SIZE = TASK_COUNTER+1, TASK_RUNNING = TASK_BATCH_SIZE+1,
                TASK_QUEUED = TASK_RUNNING+1, TASK_INFO = TASK_QUEUED+1;

            return function() {
                var task, info  = status[TASK_INFO]; info.ps = info.ts;
                    info.limit  = ((info.ts = self.now()) < self.rafNext ? self.rafNext : info.ts+8),
                    info.length = tasks.length,info.fs = info.ts - info.ps, 
                    info.maxlen = info.length > info.maxlen ? info.length : info.maxlen,
                    info.size   = info.length, info.frameid++;

                while (tasks.length && ++info.count) {
                    task = tasks[(TASK_INDEX < tasks.length ? TASK_INDEX : (TASK_INDEX = 0))];
                    if (!task || !task.next) {
                        tasks.splice(TASK_INDEX, 1);
                    }else if (task.next(status[TASK_INFO])) {
                        tasks.splice(TASK_INDEX, 1);
                    }else {
                        ++TASK_INDEX < tasks.length || (TASK_INDEX = 0);
                    }
                    if (info.suspend || (info.limit < (info.rs = self.now()))) break;
                    else if (++status[TASK_COUNTER] >= status[TASK_BATCH_SIZE]) {
                        status[TASK_COUNTER] = 0; break;
                    }
                }
                status[TASK_RUNNING] = false; info.suspend = false;
                return !tasks.length;
            }
        }),
        (function create_enqueue_platform(tasks, status, run) {
            return function enqueue(item) {
                if ((status[0] = tasks.push(item.next ? item : { next: item })) == 1) run();
            };
        }),
        (function close_over(tasks, status, run, create_enqueuer) {
            return (function() {
                return { tasks: tasks, status: status, run: run, enqueue: create_enqueuer(tasks(), status(), run) };
            });
        })
    ),

    // === Store === //
    (function() {
        return {
            name: 'Store',
            ctor: function Store(opts) {
                this.store(opts || {});
            },
            ext: [
                (function store(opts) {
                    this._val = [];
                    this._ids = [];
                    this._map = {};
                    this._cid = opts.name || opts.cid || opts.id;
                }),
                (function of(opts) {
                    return new this.constructor(opts);
                }),
                (function get(key) {
                    if (arguments.length > 1) return this.path([].slice.call(arguments));
                    else if (key && typeof key == 'string' && (this._map[key]>=0)) return this._val[this._map[key]];
                    else if (key && typeof key == 'number') return key >= 0 && key < this._val.length ? this._val[key] : undefined;
                    else if (key && key.indexOf && key.indexOf('.') > 0) return this.path(key);
                    else if (key && key instanceof Array) return key.length > 1 ? this.path(key) : this.get(key.slice(0).shift())
                    else return key ? undefined : (this._ref || this);
                }),
                (function set(key, value) {
                    return key && key.indexOf && key.indexOf('.') > 0 ? this.path(key, value)
                    : (this._val[(this._map[key] >= 0
                        && !this.emit('change', key, 'update', value) ? this._map[key]
                    : (
                        this._map[this.emit('change', key, 'create', value)||key] = this._ids.push(key)-1))] = value);
                }),
                (function add(name) {
                    return this.get(name) || this.set(name, this.of({ name: name, parent: this }));
                }),
                (function path() {
                    return [].slice.call(arguments).join('.').split('.').reduce(function(result, key) {
                        if (!key || !result) {
                            return result;
                        }else if (result instanceof Array) {
                            result = result.get(key);
                        }else if (typeof result == 'object') {
                            if (result._map && result._val && result._map[key] >=0) result = result._val[result._map[key]];
                            else result = result[key];
                        }
                        return result;
                    }, this);
                }),
                (function emit() {

                })
            ],
            attrs: [
                (function of(opts) {
                    opts || (opts = {});
                    if (typeof opts == 'string') {
                        return new this({ name: opts });
                    }else {
                        return new this(opts);
                    }
                })
            ],
            data: {
                utils: [
                    (function values(obj, useVal) {
                        return function(key, value, asArray) {
                            if (!key) return obj;
                            else if (typeof value === 'undefined') return obj.get(key);
                            else if (useVal !== false) return obj.val(key, value, asArray);
                            else if (asArray) return obj.push(key, value, asArray);
                            else return obj.set(key, value, asArray);
                        }
                    }),
                    (function keys(nativeKeys) {
                        return function keys(obj) {
                            if (typeof obj != 'object') return [];
                            if (nativeKeys) return nativeKeys(obj);
                            var keys = [];
                            for (var key in obj) if (_.has(obj, key)) keys.push(key);
                            if (hasEnumBug) collectNonEnumProps(obj, keys); // Ahem, IE < 9.
                            return keys;
                        };
                    })(Object.keys),
                    (function assign(obj) {
                        obj || (obj = {});
                        return function(val, key) {
                            if (key && val) obj[key] = val;
                            return obj;
                        };
                    }),
                    (function $_parse($_values) {
                        return function parse(value) {
                            var that = this;
                            try {
                                function addValue(val, key) {
                                    if (!key || (parseInt(key)+'') === key) {
                                        if (val instanceof Array && typeof val[0] == 'string') {
                                            that.add(val.slice(0, 1).shift(), val.slice(-1).shift());
                                        }else {
                                            that.add(val.name || val.id || val.constructor.name, val);
                                        }
                                    }else {
                                        that.add(key, val);
                                    }
                                }
                                $_values(value, addValue);
                            }catch(e) {
                                console.log(e);
                            }
                            return this;
                        }
                    }),
                    (function y(r) {
                        return (function (f) {
                            return f(f);
                        })(function (f) {
                            return r(function (x) {
                                return f(f)(x);
                            });
                        });
                    }),
                    (function $_startWalk($_y) {
                        return function(fn, opts) {
                            return function outerWalk(node) {
                                return $_y(function(loop) {
                                    return function(value) {
                                        return fn(node, value, opts);
                                    };
                                });
                            };
                        }
                    })
                ],
                async: [
                    // ===== AsyncAP ===== //
                    (function $_ap(f, x) {
                        return function $_pure(succ, fail) {
                            var _f;
                            var _x;
                            var count = 0;
                            function fin() {
                                if (++count === 2)
                                    succ(_f(_x));
                            }
                            f(function (g) {
                                _f = g;
                                fin();
                            }, fail);
                            x(function (r) {
                                _x = r;
                                fin();
                            }, fail);
                        };
                    }),
                    // ===== AsyncFMAP ===== //
                    (function $_fmap($_ap, $_pure) {
                        return function fmap(f, x) {
                            return $_ap($_pure(f), x);
                        };
                    })
                ]
            },
            init: function(type, klass) {
                var root  = this.root = klass.of('root');
                var sched = root.add('scheduler'); 
                sched.set('dispatcher', this.dispatcher);
                sched.set('nextTick', this.dispatcher());
                var utils = root.add('utils');
                if (type.data && type.data.utils) {   
                    this.ext(type.data.utils, utils);
                }
                return root;
            }
        };
    }),

    // === Collect === //
    (function() {
        return {
            name: 'Collect',
            klass: function Collect(xs) {
                this.xs = xs;
            },
            ext: [
                // ===== OF ==== //
                (function of() {
                    return new this.constructor([].slice.call(arguments));
                }),
                // ==== Scheduled Bind ===== //
                (function scheduledBindWrap() {
                    return [].slice.call(arguments).apply().call(this.root.get('scheduler'));
                }).call(this,
                    (function wrapDispatcher(wrap, make, start, done) {
                        return function bindDispatch() {
                            var wrapped = this.set('wrapped', wrap(this));
                            return this.set('lazyK', wrapped(make(done, start, 'nextTick.enqueue')));
                        }
                    }),
                    (function WrapTimers(scheduler) {
                        return function $schedulerWrap(fn) {
                            return fn(scheduler);
                        }
                    }),
                    (function MakeWrap(wrapper, starter, path) {
                        return function(scheduler) {
                            return starter(scheduler.get(path), wrapper);
                        }
                    }),
                    (function StartWrap(schedule, wrapper) {
                        return function enqueue(succ) {
                            return function(result) {
                                return wrapper(succ, result, schedule);
                            }
                        }
                    }),
                    (function DoneWrap(succ, result, schedule) {
                        schedule(function() {
                            succ(result); return true;
                        });
                    })
                ),
                // === Monadic Bind Async == //
                (function monadicBindWrap() {
                    return [].slice.call(arguments).apply().call(this.root.get('scheduler'));
                }).call(this,
                    (function makeBind(make, box) {
                        return function bind() {
                            return make(box, this.get('lazyK'));
                        }
                    }),
                    (function make(box, enqueue) {
                        return function bind(x, f) {
                            return function $_pure(succ, fail) {
                                return box(x, f, enqueue(succ), fail);
                            }
                        };
                    }),
                    (function box(x, f, succ, fail) {
                        x(function(t) {
                            return f(t)(succ, fail);
                        }, fail);
                    })
                ),
                // === Monadic Bind Array == //
                (function bind() {
                    return [].slice.call(arguments).apply();
                })(
                    (function make(map, wrap) {
                        return function bind(f) {
                            return this.xs.map(map(wrap(map(f))));
                        }
                    }),
                    (function map(f) {
                        function bound(x) {
                            return x instanceof Array ? x.map(bound) : f(x);
                        };
                        return bound;
                    }),
                    (function wrap(closed) {
                        return function wrap(f) {
                            return function(x) {
                                return closed(f, x);
                            }
                        }
                    })(
                        (function closed(f, x) {
                            return function $_pure(k) {
                                if (x instanceof Function) {
                                    return x(function(r) {
                                        k(f(r));
                                    });
                                }else {
                                    return k(f(x));
                                }
                            }
                        })
                    )
                ),
                // === FlatMap Bind Array == //
                (function flatmap() {
                    return [].slice.call(arguments).apply();
                })(
                    (function make($_apply) {
                        return function flatmap(f) {
                            return this.chain($_apply(f || unit));
                        };
                    }),
                    (function() {
                        function flat(x, f) {
                            return Array.prototype.concat.apply([], x.map(f));
                        };
                        function bind(f) {
                            function bound(x) {
                                return x instanceof Array ? flat(x, bound) : f(x);
                            };
                            return bound;
                        };
                        return function(f) {
                            return function $_apply(x) {
                                if (x instanceof Array) {
                                    return flat(x, bind(f));
                                }else {
                                    return x;
                                }
                            }
                        };
                    })()
                )
            ],
            fn: [
                'push', 'pop', 'shift', 'unshift'
            ],
            attrs: [
                (function $of() {
                    var ctor = this;
                    return function() {
                        return ctor.of.apply(ctor, arguments);
                    }
                }),
                (function of(x) {
                    return new this(x);
                }),
                (function pure(x) {
                    return new this(x);
                })
            ],
            init: (function(base, ext) {
                return function(type, klass) {
                    return ext.call(base(klass));
                }
            })(
                (function(klass) {
                    klass.prototype.base = klass.of([]);
                    return klass;
                }),
                (function() {
                    this.prototype.push = function() {
                        return this.xs.push.apply(this.xs, [].slice.call(arguments));
                    };
                    this.prototype.collect = function() {
                        return this.base.push(new this.constructor([].slice.call(arguments)));
                    };
                    Array.prototype.collect = this.of([]);
                    Array.prototype.fmap = function(f) {
                        return ext.fmap(f, ext.collect(this));
                    };
                    Array.prototype.chain = function(f) {
                        return [ this.fmap(f) ];
                    };
                    Array.prototype.lift = function(f) {
                        return this.chain(ext.get(function(xs) {
                            return f.apply(undefined, xs);
                        }));
                    };
                    return this;
                })
            )
        };
    }),

    // === Utils === //
    (function() {
        return {
            name: 'Utils',
            ctor: function Utils(map) {
                this.map = map;
            },
            ext: [
                (function pass(f) {
                    return function() {
                        return f(this.xs).apply(undefined, arguments);
                    }
                }),
                (function call(f) {
                    return function() {
                        return f(this);
                    }
                })
            ]
        };
    }),

    // === Cell === //
    (function() {
        return {
            name: 'Cell',
            ctor: function Cell() {
                this.value = undefined, this.isDefined = false, this.queue = [];
            },
            ext: [
                (function get(k) {
                    if (this.isDefined) {
                        //JavaScript as an Embedded DSL 429 430 G. Kossakowski et al.
                        k(this.value);
                    }else {
                        this.queue.push(k);
                    }
                }),
                (function set(v) {
                    if (this.isDefined) {
                        throw "can’t set value twice"
                    }else {
                        this.value = v, this.isDefined = true,
                        this.queue.forEach(function (f) {
                            f(v) //non-trivial spawn could be used here })
                        });
                    }
                })
            ],
            attrs: [
                (function of() {
                    return new this();
                })
            ]
        };
    }),

    // === CellOps === //
    (function() {
        return {
            name: 'CellOps',
            ctor: function CellOps(x, f) {
                if (x) this.x = x;
                if (f) this.f = f;
            },
            ext: [
                (function apply(k) {
                    return this.x.get(this.f(k));
                })
            ],
            attrs: [
                (function of() {
                    return new this();
                })
            ]
        };
    })

);
