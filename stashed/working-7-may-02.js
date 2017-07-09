    // ========  ========= PURE JS ====== ========  ======== //

    (function MakeApp() {

        return [].slice.call(arguments).call(1);
    })(

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
        (function pure(idx, slice) {
            return typeof idx != 'undefined' &&
                idx < this.length && this[idx] instanceof Function
                    ? this[idx](slice ? this.slice(idx+1) : this) : pure(this);
        }),
        (function append() {
            this.push.apply(this, [].slice.call(arguments));
            return this;
        }),
        (function MakeArray($apply) {
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

    // === ReadInitialTypes === //
    (function() {

        return [].slice.call(arguments).apply();
    })(

        (function() {
            return [].slice.call(arguments).reduce(function(r, v, i) {
                //if (i == 0) r[v.name] = v(unit);
                if (v.name && r.root) r.root.set(v.name, v);
                else if (v.name) r[v.name] = v;
                else if ((v = v.call(r)) && v.name == 'Store') r.types[v.name] = r.makeKlass(v);
                else if (v.ext || v.ctor) r.types[v.name] = r.makeKlass(v);
                return r;
            }, this);
        }),
        // === CreateArgsResolver === //
        (function() {
            return [].slice.call(arguments).apply();
        })(
            (function $_parseArgs(getArgs, makeArgs) {
                return function parseArgs(f, r) {
                    if (f.name.substr(0, 2) == '$_') {
                        return makeArgs(f, getArgs(f), r);
                    }else {
                        return f;
                    }
                }
            }),
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

    // === Collect === //
    (function() {
        return {
            name: 'Collect',
            klass: function Collect(xs) {
                this.id = this.id();
                this.xs = xs;
            },
            ext: [
                // ===== OF ==== //
                (function of() {
                    return new this.constructor([].slice.call(arguments));
                }),
                // ===== Array Collect ===== //
                (function $_collect($_pure, $_tick) {
                    return function collect(k) {
                        return $_tick(0, this.xs.slice(0), $_pure(0, this.xs.map($const), k));
                    }
                })(
                    (function $_collect(c, v, k) {
                        return function(r, i) {
                            v[i] = r;
                            if (++c == v.length) {
                                k(v);
                            }
                        }
                    }),
                    (function $_tick(i, x, f) {
                        return function() {
                            if (i < x.length) f(x[i], i++, i < x.length);
                            return !(i < x.length);
                        }
                    })
                ),
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
                        return function then(succ) {
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
                )
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
                    return ext.call({ klass: base(klass), root: this.root });
                }
            })(
                (function(klass) {
                    klass.prototype.base = klass.of([]);
                    return klass;
                }),
                (function() {
                    this.klass.prototype.async = this.root.get('utils.target')(this.root.get('async'))('get');
                    this.klass.prototype.flatmap = function(f) {
                        return Array.prototype.concat.apply([], this.map(f));
                    }
                    this.klass.prototype.push = function() {
                        return this.xs.push.apply(this.xs, [].slice.call(arguments));
                    };
                    this.klass.prototype.enqueue = function() {
                        return this.base.push(new this.constructor([].slice.call(arguments)));
                    };
                    Array.prototype.collect = this.klass.of([]);
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
    })

);
