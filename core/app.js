(function() {
    return sys.load('parse').run([].slice.call(arguments));
})(

    (function MakeDispatcher() {

        return [].slice.call(arguments);
    })(
        (function $$DISPATCHER($wrap, $clean, $schedule, $main, $info, $run, $proc, $shift, $enqueue, $next) {

            var root = this.store();
            var sys  = root.get('sys');
            var proc = root.child('process');
            var info = $info.call(proc);
            proc.set('clean',    $clean);
            proc.set('schedule', $schedule);
            proc.set('run',      $run);
            proc.set('shift',    $shift);
            proc.set('proc',     $proc);

            var shared = { tick: false, rafNext: 0, isWorker: sys.isWorker };
            var tick   = proc.set('nextTick', $clean('nxt', shared));

            tick.raf   = !sys.isWorker;
            tick.fn    = $proc;
            tick.run   = $run(tick, $wrap);

            if (sys.isWorker) {
                tick.schedule = $schedule(proc.get('native.nxt'), Function.prototype.bind.call($main, tick));
            }else {
                tick.schedule = shared.nextTick = proc.get('native.nxt')(Function.prototype.bind.call($main, tick));

                var raf    = proc.set('animFrame', $clean('raf', shared));
                raf.fn     = $shift;
                raf.run    = $run(raf, $wrap);
                raf.schedule  = $schedule(proc.get('native.raf'), Function.prototype.bind.call($main, raf));
                raf.enqueue   = $enqueue(raf.store,  raf.schedule);
            }
            tick.enqueue = $enqueue(tick.store, tick.schedule);
            tick.next = $next(tick.enqueue);
            sys.klass('Cont').prop('next', tick.next);
            return proc;
        }),

        // wrapper //
        (function() {
            try {
                return this.fn();
            }catch(e) {
                console.log(e);
                this.store.splice(this.index, 1);
                this.index = 0;
                if (this.store.length) this.schedule();
                return true;
            }
        }),

        // getCleanInfo //
        (function(code, shared) {
            return {
                ts: 0, ms: 0, buffer: 0, result: 0,
                count: 0, size: 0, length: 0, frameid: 0, index: 0,
                code: code, isRaf: code == 'raf',
                store: [], shared: shared
            };
        }),

        // createSchedule //
        (function(timer, fn) {
            return function() {
                return timer(fn);
            }
        }),

        // createMain //
        (function() {
            this.currts = self.now();
            this.prevts = this.length ? this.lastts : this.currts;
            if (this.isRaf) {
                if (this.store.length && (this.shared.rafNext = (this.currts + 16.667))) {
                    this.schedule();
                    this.run();
                }else this.shared.rafNext = 0;
                if (this.shared.tick && !(this.shared.tick = 0)) this.shared.nextTick();
            }else if ((this.limit = this.shared.rafNext > this.currts ? this.shared.rafNext : (this.currts + 8)) >= 8) {
                if (!this.run()) {
                    if (!this.raf) this.schedule();
                    else if (!(this.shared.tick = this.shared.rafNext)
                        && ((this.shared.rafNext - this.currts) < 8)) this.schedule();
                }
            }else if (!this.run()) {
                this.schedule();
            }
            this.suspend = false;
        }),

        // createInfo //
        (function() {
            return this.set('stats', (function() {
                var time = 0, lim = 0, len = 0, idx = 0, handle = 0;
                var info = {},
                    count   = info.count   = 0,
                    size    = info.size    = 0,
                    length  = info.length  = 0,
                    maxlen  = info.maxlen  = 0,
                    frameid = info.frameid = 10000,
                    runid   = info.runid   = frameid,
                    ts      = info.ts      = 0,
                    prev    = info.prev    = 0,
                    toggle  = 0,
                    buffer  = info.buffer = 0,
                    handle  = info.handle = 1,
                    next    = [],
                    id      = 0;
                var refs = [ frameid, time, lim, len, idx ];
                return info;
            })(
                this.node('native').parse({
                    sto: self.setTimeout,
                    cto: self.clearTimeout,
                    raf: self.requestAnimationFrame,
                    caf: self.cancelAnimationFrame,
                    siv: self.setInterval,
                    civ: self.clearInterval,
                    nxt: (function(msgchan, sim) {
                        return self.isWorker ? sim() : msgchan;
                    })(
                        (function(process_messages) {
                            var message_channel = new MessageChannel();
                            var message_state   = { queued: false, running: false };
                            function queue_dispatcher()  {
                                if (!(message_state.queued && message_state.running)) {
                                    message_state.queued = true;
                                    message_channel.port2.postMessage(0);
                                }
                            };
                            message_channel.port1.onmessage = function(_) {
                                if (!(message_state.queued = false)
                                    && (message_state.running = true) && !process_messages())
                                        message_state.running = false;//queue_dispatcher();
                                else message_state.queued = message_state.running = false;
                            };
                            return queue_dispatcher;
                        }),
                        (function() {
                            return self.setImmediate;
                        })
                    )
                })
            ));
        }),

        // createRun //
        (function(info, fn) {
            return Function.prototype.bind.call(fn, info);
        }),

        // coreProc //
        (function() {
            this.length = this.store.length;
            this.size   = this.length;
            this.frameid++;

            while(++this.count && this.store.length) {
                if ((this.item = this.store[this.index]) && ++this.item.count && (this.item.frameid || (this.item.frameid = this.frameid)) && this.item.next(this)) {
                    if (this.index == 0) {
                        this.store.shift();
                    }else if (this.store.length - this.index == 1) {
                        this.store.pop(); this.index = 0;
                    }else {
                        this.store.splice(this.index, 1);
                    }
                    this.index < this.size || (this.index = 0);
                }else if (++this.item.frameid < this.frameid) {
                    this.item.frameid;
                }else if (this.store.length > 1) {
                    ++this.index < this.store.length || (this.index = 0);
                }else {
                    this.index = 0;
                }
                if (this.suspend || (this.limit < (this.lastts = self.now()))) break;
            };
            return (!(this.length = this.store.length));
        }),

        // coreShift //
        (function() {
            this.index  = 0;
            this.length = this.store.length;
            this.size   = this.length;
            this.frameid++;
            while(!this.suspend && ++this.count && this.store.length) {
                if (this.store[this.index].next(this)) {
                    this.store.splice(this.index, 1);
                    this.index < this.store.length || (this.index = 0);
                }else {
                    ++this.index < this.store.length || (this.index = 0);
                }
            };
            return (this.lastts = self.now()) && (!(this.length = this.store.length));
        }),

        // enqueue //
        (function(store, run) {
            return function enqueue(item) {
                if (item && (!(store.length * store.push(item.next ? item : { count: 0, frameid: 0, next: item })))) run();
            };
        }),

        // next //
        (function(ext, wrap, combine) {
            return function(enqueue) {
                return ext(wrap, combine, enqueue);
            }
        })(
            (function $ext(wrap, combine, enqueue) {
                return function $_next(cont) {
                    return wrap(combine, enqueue, cont);
                };
            }),
            (function $wrap($combine, $enqueue, $body) {
                return function $_pure($cont) {
                  return $enqueue( $combine( $body, $cont ) );
                }
            }),
            (function $combine($body, $cont) {
                return function() {
                   $body($cont);
                   return true;
                };
            })
        )
    ),

    (function MakeAsync() {

        return [].slice.call(arguments);
    })(
        // === IMPORT / PARSE === //
            (function $$ASYNC(lazy, then, frcb) {
                var utils   = this.store('utils');
                var process = this.store('process');
                var $async  = this.store('async');

                this.klass('Cont').prop('lazy', $async.set('lazy', lazy(process, 'nextTick.enqueue')));
                $async.set('then', then($async.get('lazy')));
                utils.set('fromCallback', frcb.call(process));

                return $async;
            }),
            (function scheduledBindWrap() {
                return [].slice.call(arguments).apply();
            })(
                (function wrapDispatcher(wrap, make, start, cont, done) {
                    return function bindDispatch(scheduler, timer) {
                        var wrapped = scheduler.set('wrapped', wrap(scheduler));
                        scheduler.set('lazy', wrapped(make(done, cont, timer)));
                        return wrapped(make(done, start, timer));
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
                        return function $_cont(result) {
                            return schedule(wrapper(succ, result));
                        }
                    }
                }),
                (function ContWrap(schedule, wrapper) {
                    return function lazyR(result) {
                        return function $_pure(succ) {
                            return schedule(wrapper(succ, result));
                        }
                    }
                }),
                (function $_next(succ, result) {
                    return function() { succ(result); return true; };
                })
            ),
            (function monadicBindWrap() {
                return [].slice.call(arguments).apply();
            })(
                (function makeBind(make, box) {
                    return function then(enqueue) {
                        return make(box, enqueue);
                    }
                }),
                (function make(box, enqueue) {
                    return function then(x, f) {
                        return function $_pure(succ, fail) {
                            return x(box(f, enqueue(succ), fail), fail);
                        }
                    };
                }),
                (function box(f, succ, fail) {
                    return function(t) {
                        return f(t)(succ, fail);
                    };
                })
            ),
            (function fromCallback(run, list, make, wrap, tick) {
                return function $_fromCallback() {
                    return make(list(run, this.get('nextTick.enqueue')), wrap(tick));
                }
            })(
                (function $run(tick, enqueue, list) {
                    return function run() {
                        if (!(list.length * list.push.apply(list, Array.prototype.slice.call(arguments))))
                            enqueue(tick);
                        if (!arguments.length) return run;
                    };
                }),
                (function $list(run, enqueue) {
                    return function(tick) {
                        return function(list) {
                            return run(tick, enqueue, list);
                        };
                    };
                }),
                (function $make(next, from) {
                    return function fromCallback(continuation) {
                        var arr = [];
                        return next(from(arr)(continuation))(arr);
                    };
                }),
                (function $wrap(fn) {
                    return function(arg1) {
                        return function(arg2) {
                            return fn(arg1, arg2);
                        };
                    };
                }),
                (function $tick(arr, continuation) {
                    return function tick() {
                        if (arr.length) continuation(arr.shift());
                        return !arr.length;
                    };
                })
            )
    ),

    (function MakeTypes1() {

        return [].slice.call(arguments);
    })(
        // === IO === //
            (function IO() {
                return {
                    parent: 'Functor',
                    klass: function IO(x) {
                        this.$$init(x);
                    },
                    ext: [
                        (function $$init(x) {
                            this.id = this.id();
                            this.unsafePerformIO = x;
                        }),
                        (function fx(f) {
                            return new this.constructor(f);
                        }),
                        (function of(x) {
                            return new this.constructor(function() {
                              return x;
                            });
                        }),
                        (function pure() {
                            return this.bind(this.constructor.$pure);
                        }),
                        (function nest() {
                            return this.of(this);
                        }),
                        (function map(f) {
                            var thiz = this;
                            return this.fx(function(v) {
                              return f(thiz.unsafePerformIO(v));
                            });
                        }),
                        (function filter(f) {
                            var thiz = this;
                            return this.fx(function(v) {
                                return f(v) ? thiz.unsafePerformIO(v) : undefined;
                            });
                        }),
                        (function join() {
                            var thiz = this;
                            return this.fx(function() {
                              return thiz.unsafePerformIO().unsafePerformIO();
                            });
                        }),
                        (function bind(f) {
                            var thiz = this;
                            return this.fx(function(v) {
                              return f(thiz.unsafePerformIO()).run(v);
                            });
                        }),
                        (function run() {
                            return this.unsafePerformIO.apply(this, arguments);
                        }),
                        (function chain() {
                            return this.unsafePerformIO.apply(this, arguments);
                        }),
                        (function raf() {
                            return this.$fn.raf(Function.prototype.apply.bind(this.unsafePerformIO, this, [].slice.call(arguments)));
                        }),
                        (function runIO() {
                            var args = [].slice.call(arguments);
                            if (args.length && args[0] instanceof this.constructor) {
                                return this.unsafePerformIO(args.first().run.apply(args.shift(), args));
                            }else {
                                return this.unsafePerformIO.apply(this, args);
                            }
                        }),
                        (function ap(monad) {
                            return monad && monad.map ? monad.map(this.unsafePerformIO) : this.ap(this.of(monad));
                        }),
                        (function apply(monad) {
                            return monad.ap(this);
                        }),
                        (function pipe(f) {
                            return this.fx(this.$fn(f)(this.unsafePerformIO));
                        }),
                        (function lift(f) {
                            return f ? this.map(function(v1) {
                                return function(v2) {
                                    return f.call(this, v1, v2);
                                };
                            }).pure() : this.lift(this.unsafePerformIO);
                        })
                    ],
                    attrs: (function() {
                        return [].slice.call(arguments);
                    })(
                        (function of(x) {
                            return new this(function() {
                                return x;
                            });
                        }),
                        (function pure(x) {
                            return x instanceof Function ? new this(x) : this.of(x);
                        }),
                        (function lift(f) {
                            return this.of(function(v1) {
                                return this.of(function(v2) {
                                    return f.call(this, v1, v2);
                                }).pure();
                            }).pure();
                        })
                    ),
                    findType: function(type, name) {
                        return type.find(name);
                    },
                    wrapIO: function(io) {
                        return function() {
                            return io.run.apply(io, [].slice.call(arguments));
                        }
                    },
                    init: function(type, klass, sys) {
                        this.root().prop('$find', klass.pure(this.root).lift(type.findType));
                        klass.prop('wrapIO', sys.get('utils.call')(type.wrapIO));
                        klass.prop('$fn', {
                            compose: klass.find('Compose').prop('$fn'),
                            enqueue: sys.get('process.nextTick.enqueue'),
                            raf: sys.get('process.animFrame.enqueue')
                        });
                    }
                };
            }),
        // === Obj === //
            (function() {
                return {
                    klass: function Obj(x, r, p) {
                        if (!(this instanceof Obj)) return new Obj(x, r, p);
                        this._root   = r && r.name == '$_const' ? r : this.konst(r || this);
                        this._parent = p || this._root;
                        Object.assign(this, this.reduce(unit, x));
                    },
                    ext: [
                        (function of(x, r) {
                            if (r) {
                                return new this.constructor(x, r === true ? null : r);
                            }else {
                                return new this.constructor(x, this._root, this.konst(this));
                            }
                        }),
                        (function konst(v) {
                            return function $_const() {
                                return v;
                            }
                        }),
                        (function isBase(v) {
                            return (v || (v = this)).constructor === Function;
                        }),
                        (function map(f, r) {
                            return this.keys().reduce(function(r, k, i) {
                                if (r.arr) r.res.push(f(r.obj[k], k, i, r.obj));
                                else r.res = f(r.res, r.obj[k], k, i, r.obj);
                                return r;
                            }, { res: r || [], arr: !r || r instanceof Array, obj: this }).res;
                        }),
                        (function keys() {
                            return Object.keys(this).filter(function(v, i, o) {
                                return v.substr(0, 1) != '_';
                            });
                        }),
                        (function values() {
                            return this.keys().reduce(function(r, k, i, a) {
                                r.v.push(r.o[k]);
                                return ++i < a.length ? r : r.v;
                            }, { v: [], o: this });
                        }),
                        (function object() {
                            return this.keys().reduce(function(r, k, i, a) {
                                r.v[k] = r.o[k];
                                return ++i < a.length ? r : r.v;
                            }, { v: {}, o: this });
                        }),
                        (function get(key) {
                            return this[key];
                        }),
                        (function set(key, value) {
                            return this[key] = value;
                        }),
                        (function call() {
                            var args = [].slice.call(arguments);
                            if (args.length && args.unshift('fn')) return this.path.call(this._root(), args.join('.'));
                            return this._root();
                        }),
                        (function root(path) {
                            return path ? this.path.call(this._root(), path) : this._root();
                        }),
                        (function parentt(path) {
                            return path ? this.path.call(this._parent(), path) : this._parent();
                        }),
                        (function extend(v, u) {
                            Object.assign(this, this.reduce(unit, v, u || false));
                            return this;
                        }),
                        (function update(v) {
                            Object.assign(this, this.reduce(unit, v, true));
                            return this;
                        }),
                        (function reduce(f, v, u) {
                            return this.keys.call(v).reduce(function(r, k, i, o) {
                                var x = f(v[k], k, i, r);
                                if (r[k] && r.is(r[k])) {
                                    r[k].extend(x, u);
                                }else if (u && r[k]) {
                                    // update so no overwrites
                                }else {
                                    r[k] = x instanceof Array
                                        ? x : (r.isObject(x) ? r.of(x) : x);
                                }
                                return r;
                            }, this);
                        }),
                        (function bind(b, m) {
                            return function bind(f, r) {
                                return b(f, this, m)(r || this.of({}), this, 0);
                            }
                        })(
                            (function(f, o, m) {
                                return function $bind(x, r, l) {
                                    return o.keys.call(r).bind(function(k, i) {
                                        var v = f(x, r[k], k, i, r, l);
                                        return v instanceof Array
                                            ? v.bind(m(f, (x[k] = {}), i, r[k], l+1, x))
                                                : (o.isObject(v) ? $bind((x[k] = o.of({})), v, l+1) : v);
                                    });//.bind(unit);
                                }
                            }),
                            (function(f, x, t, j, l, o) {
                                return function(r, v, k, i) {
                                    return f(x, r, v, t, j, l, o);
                                }
                            })
                        ),
                        (function fold(b, m) {
                            return function fold(f, r) {
                                return b(f, this, m)(r || this.of({}), this, 0);
                            }
                        })(
                            (function(f, o, m) {
                                return function $fold(x, r, l) {
                                    return o.keys.call(r).map(function(k, i, o) {
                                        var v = f(x, r[k], k, i, r, l);
                                        return v instanceof Array ? v.map(m(f, (x[k] = {}), i, r[k], l+1, x))
                                            : (r.isObject(v) ? $fold((x[k] = r.of({})), v, l+1) : v);
                                    });                                    
                                }
                            }),
                            (function(f, x, t, j, l, o) {
                                return function(r, v, k, i) {
                                    return f(x, r, v, t, j, l, o);
                                }
                            })
                        ),
                        (function is(x) {
                            return x instanceof this.__;//x instanceof Array || typeof x != 'object' ? false : true;
                        }),
                        (function isObject(x) {
                            return x && typeof x == 'object' && (x.constructor == Object || x instanceof this.__) ? true : false;
                        }),
                        (function info(/* recur, opts */) {
                            var args  = [].slice.call(arguments);
                            var recur = (args.length && typeof args[0] == 'boolean' ? args.shift() :
                                        (args.length && typeof args[args.length-1] == 'boolean' ? args.pop() : false));
                            var bind  = this.bind(function(r, v, k, i, o) {
                                if (o.is(v)) {
                                    console.log([ k ].append(v.values()));
                                }else {
                                    console.log([ k, v, i ]);
                                }
                                return v;
                            }, args.length && typeof args[0] == 'object' ? args.shift() : null);
                            return bind;//recur ? bind.bind(unit) : bind;
                        })
                    ],
                    attrs: [
                        (function of(x, r) {
                            return x instanceof this ? x : new this(x, r);
                        }),
                        (function $of() {
                            var ctor = this;
                            return function() {
                                return ctor.of.apply(ctor, arguments);
                            }
                        })
                    ],
                    init: function(type, klass, sys) {
                        klass.prop('path', sys.root.get('utils.path'));
                        Object.prototype.keys  = sys.get('utils.call')(Object.keys);
                        Object.prototype.clone = sys.get('utils.update');
                    }
                };
            }),
        // === Maybe === //
            (function Maybe() {
                return {
                    parent: 'Functor',
                    klass: function Maybe(x) {
                        this.id = this.id();
                        if (x || typeof x != 'undefined') this._x = x;
                    },
                    ext: [
                        (function prop() {
                            var args = Array.prototype.slice.call(arguments);
                            return this.map(this.property(args.shift()).apply(undefined, args));
                        }),
                        (function get(key) {
                            return this.map(this.pget(key));
                        }),
                        (function values(recur) {
                            return this.map(this.pval(recur));
                        }),
                        (function $isNothing(v) {
                            return v === null || v === undefined || v === false;
                        }),
                        (function isNothing() {
                            return this._x === null || this._x === undefined || this._x === false;
                        }),
                        (function isSome() {
                            return !this.isNothing();
                        }),
                        (function ifSome(mf) {
                            return this.isNothing() || !mf || !(mf instanceof Function) ? null : mf.call(this, this._x);
                        }),
                        (function ifNone(mf) {
                            return !this.isNothing() || !mf || !(mf instanceof Function) ? null : mf.call(this, this._x);
                        }),
                        (function filter(f) {
                            return this.map(function(v) {
                                if (f(v)) return v;
                            });
                        }),
                        (function chain(f) {
                            if (f instanceof Function) {
                                return this.ifSome(f || unit);
                            }else if (this._x instanceof Function) {
                                return this.ifSome(this.fn.pure(f));
                            }else {
                                return this.ifSome(f);
                            }
                        }),
                        (function orElse(mv) {
                            return this.isNothing() ? new this.constructor(mv instanceof Function ? mv() : mv) : this;
                        }),
                        (function map(mf) {
                            return this.ctor.of(this.chain(mf));
                        }),
                        (function run(f) {
                            return this.chain(f || unit);
                        }),
                        (function ap(other) {
                            return this.is(other) ? this.map(function(x) {
                                return x instanceof Function ? (this.test(other) ? other.chain(x) : other.map(x)) : (x.ap ? x.ap(other) : other.ap(x));
                            }) : (other instanceof Function ? this.of(other).ap(this._x) : this.of(other).map(this._x));
                        }),
                        (function apply(other) {
                            return other.ap(this);
                        }),
                        (function unit() {
                            return this._x;
                        }),
                        (function join() {
                            return this._x;
                        })
                    ],
                    attrs: [
                        (function of(x) {
                            return x && x instanceof this ? x : new this(x);
                        }),
                        (function list(x) {
                            return this.of(x.map(this.ctor.of).filter(function(x) {
                                return x.isSome();
                            })).filter(function(x) {
                                return x.length;
                            });
                        }),
                        (function pure(x) {
                            return new this(x);
                        })
                    ],
                    toIO: function($iopure) {
                        return function() {
                            return this.chain($iopure);
                        }
                    },
                    toMaybeIO: function($iof) {
                        return function() {
                            return $iof(this).lift(function(mbfn, value) {
                                return mbfn.chain(function(fn) {
                                    return this.of(value).chain(fn);
                                });
                            });
                        }
                    },
                    toMaybe: function($maybe) {
                        return function() {
                            return this.map($maybe.of);
                        }
                    },
                    runMaybe: function($maybe) {
                        return function(v) {
                            return $maybe.of(this.run(v));
                        }
                    },
                    maybe: function($maybe) {
                        return function() {
                            return (this._maybe || (this._maybe = $maybe.of(this)));
                        }
                    },
                    init: function(type, klass, sys) {
                        var root = this.$store.root, utils = root.get('utils');
                        var property = klass.prop('property', utils.get('property'));
                        klass.prop('pget', property('get'));
                        klass.prop('pval', property('values'));
                        klass.prop('curry', utils.get('curry'));
                        var IO = this.find('IO');
                        klass.prop('toIO',  type.toIO(IO.pure));
                        klass.prop('toMaybeIO', type.toMaybeIO(IO.of));
                        IO.prop('toMaybe',  type.toMaybe(klass));
                        IO.prop('runMaybe', type.runMaybe(klass));
                        this.root().base.prototype.maybe = type.maybe(klass);
                    }
                };
            }),
        // === Bind === //
            (function() {
                return {
                    klass: function Bind(f, x, m) {
                        if (f) this._f = f;
                        if (x) this._x = x;
                        if (m) this._m = m;
                    },
                    ext: [
                        (function collect() {
                            return [].slice.call(arguments).apply();
                        })(
                            (function wrap(_$_const, _$_close, $wrap, $cont, $collect, $make, $pure, $run, $set, $next) {
                                function collect(scheduler, async) {
                                    return _$_close.call({}, $wrap, $collect, $cont(
                                        $pure($next, scheduler.get('nextTick.enqueue')),
                                            $run, $set, _$_const, async.lazy), scheduler.parent('utils.extend'),
                                                { pure: true, arr: true, cont: false, val: true, other: true, done: true }, $make)
                                };
                                collect['$$_scope'] = [].slice.call(arguments).reduce(function(r, v) {
                                    r[v.name] = v;
                                    return r;
                                }, {});
                                return collect;
                            }),
                            (function _$_const() {
                                return undefined;
                            }),
                            (function _$_close(wrap, collect, make, extend, proc, run) {
                                this.make = make;
                                this.wrap = collect(this.make, extend, proc);
                                this.collect = wrap(this.wrap, run);
                                return this;
                            }),
                            (function _$_wrap($collect, $make) {
                                return function collect(x, p, f) {
                                    return p || f ? $make($collect(x), p, f) : $collect(x);
                                } 
                            }),
                            (function _$_cont($pure, $run, $set, $empty, $lazy) {
                                return function wrap(x, k, p, f) {
                                    return $pure(x.slice(0),
                                        $run(wrap, p), [], $set(x.length, $lazy(k), f || unit));
                                }
                            }),
                            (function _$_run($run, $extend, $proc) {
                                return function run(x) {
                                    return function $_pure(k, p, f) {
                                        return $run(x, k, p ? (p.done ? p : $extend($extend({}, $proc), p)) : $proc, f);
                                    }
                                };
                            }),
                            (function _$_make(x, p, f) {
                                return function $_pure(k) {
                                    return x(k, p, f);
                                };
                            }),
                            (function pure(next, enqueue) {
                                return function(x, f, v, s) {
                                    enqueue(next(x, f, v, s));
                                }
                            }),
                            (function get(run, proc) {
                                return function collect(x, s) {
                                    if (proc.pure && x instanceof Function && x.name == '$_pure') {
                                        return x(function(r) { collect(r, s); });
                                    }else if (proc.arr && x instanceof Array) {
                                        return x.length ? (x.length == 1
                                            ? collect(x.shift(), s)
                                                : run(x, s, proc))
                                            : s(x);
                                    }else if (proc.val) {
                                        return s(x);
                                    }
                                };
                            }),
                            (function set(c, k, f) {
                                return function(v, i) {
                                    return function(r) {
                                        v[i] = r;
                                        if (c && !--c) {
                                            k(f(v));
                                        }
                                    }
                                }
                            }),
                            (function next(x, f, v, s) {
                                return function() {
                                    if (x.length) {
                                        f(x.shift(), s(v, v.push(undefined) - 1));
                                    }
                                    return !x.length;
                                }
                            })
                        ),
                        (function each(map, bind) {
                            return function each(x, f) {
                                return x.chain(bind(map(f)));
                            };
                        })(
                            (function(f) {
                                return function(x) {
                                    return x instanceof Array ? x.flatten().chain(f) : x;
                                }
                            }),
                            (function(f) {
                                return function each(x) {
                                    if (x instanceof Array) {
                                        return x.map(f);
                                    }else {
                                        return x;
                                    }
                                };
                            })
                        ),
                        // === Monadic Bind Array == //
                        (function bind() {
                            var args = [].slice.call(arguments);
                            return function(extend, proc) {
                                return args.append(extend, proc).apply();
                            }
                        })(
                            (function make(main, init, make, bind, $_map, $_make, $_bind, $_wrap, extend, proc) {
                                return bind(main($_wrap, extend, proc), init($_map, $_bind), make($_make, $_map));
                            }),
                            (function main($_wrap, $extend, $proc) {
                                function $_main(f, p) {
                                    return $_wrap(f, !p.done ? $extend(p, $proc) : p);
                                };
                                $_main['$$_scope'] = [].slice.call(arguments).reduce(function(r, v) {
                                    if (v && v.name && v instanceof Function) r[v.name] = v;
                                    return r;
                                }, {});
                                return $_main;
                            }),
                            (function init($_map, $_bind) {
                                return function $_init(w) {
                                    return $_bind(w, $_map);
                                }
                            }),
                            (function make($_bind, $_map) {
                                function $_make(f, x) {
                                    return $_map(f, x);
                                };
                                $_make['$$_scope'] = [].slice.call(arguments).reduce(function(r, v) {
                                    r[v.name] = v;
                                    return r;
                                }, {});
                                return $_make;
                            }),
                            (function(main, init, make) {
                                function bind(f, p) {
                                    p || (p = this.aid());
                                    return make(init(main(f, p)), this).aid(p);
                                };
                                bind['$$_scope'] = [].slice.call(arguments).reduce(function(r, v) {
                                    r[v.name] = v;
                                    return r;
                                }, {});
                                return bind;
                            }),
                            (function map(f, x) {
                                return x && x instanceof Array ? x.map(f(x)) : x;
                            }),
                            (function make(x, f, m) {
                                return function $_pure(k) {
                                    return k(m(f, x.slice(1)));
                                }
                            }),
                            (function bind(f, m) {
                                return function next(o) {
                                    return function bound(x, i) {
                                        return x instanceof Array ? m(next, x) : f(x, i, o);
                                    };
                                };
                            }),
                            (function $_closed(f, p) {
                                return function closed(x, i, o) {
                                    return function $_pure(k) {
                                        if (p.pure && x instanceof Function && x.name == '$_pure') {
                                            return x(function(r) {
                                                return closed(r, i, o)(k);
                                            });
                                        }else if (p.arr && x instanceof Array) {
                                            return x.length == 1 ? closed(x.shift(), i, o)(k)
                                            : (!x.length ? k(x) : x.map(closed).make(k, p));//x.bind(m(x), p).run(k));
                                        }else if (p.cont && x && x.cont instanceof Function && x.cont.name == '$_cont') {
                                            return closed(x.cont(), i, o)(k);
                                        }else if (p.val) {
                                            return k(f(x, i, o));
                                        }
                                    }
                                }
                            })
                        ),
                        (function cont() {
                            return sys.klass('Cont').of(this, function(a) {
                                return function $_pure(k) {
                                    return a.wrap(k);
                                }
                            });
                        }),
                        (function make(cnst, bind, run) {
                            return function make(b, m, c) {
                                return bind(run, b, m || unit, c || cnst);
                            }
                        })(
                            (function cnst(v) {
                                return function() {
                                    return v;
                                }
                            }),
                            (function bind(r, b, m, c) {
                                return function(f, g) {
                                    return r(b(f, g, m), g, c);
                                }
                            }),
                            (function run(f, g, c) {
                                return function(v, r) {
                                    r || (r = {});
                                    return g.run(v).bind(f(r, v, 0)).chain(c(r));
                                }
                            })
                        ),
                        (function run(f) {
                            return this.make(this._f, this._m)(f, this._x);
                        })
                    ],
                    attrs: [
                        (function pure(f, g, m) {
                            return new this(f, g, m);
                        })
                    ],
                    make: function(binds) {
                        return binds.set('make', function(type) {
                            return function(impl) {
                                return binds.get('data', type)(binds.get('types', type).run(

                                    typeof impl == 'string'
                                        ? binds.get('impl', type, impl).apply(undefined, [].slice.call(arguments, 1))
                                            : impl
                                ));
                            }
                        });
                    },
                    binds: function() {
                        return this.parse({
                            types: {

                                store: this.klass('Bind').pure(function(f, g, m) {

                                    // f --> effect function
                                    // g --> input adapter (optional)
                                    // m --> level change assistant (optional)
                                    return function $bind(x, r, l) {

                                        return function $fn(v, i, o) {
                                            var k = r && r.keys ? r.keys(i) : v.name;
                                            if (r && r.is && r.is(v)) return v.vals().bind($bind(l ? (x instanceof Array ? (x[x.push({})-1][k] = []) : (x[k] = {})) : x, v, l+1));
                                            else if (v instanceof Array) return v.bind($bind(l ? (x instanceof Array ? (x[x.push({})-1][k] = []) : (x[k] = {})) : x, v, l+1));
                                            else return f(x, v, k, i, r || o) || v;
                                        };

                                    };

                                }, this.ctor.$find.ap('Store').lift(function(node, value) {

                                    return node.is(value) ? value.vals() : (value instanceof Array ? value : [ value ]);

                                }), function(f, t, j, x, l) {

                                    return function(v, i, o) {
                                        return f(t, v, j, x, l);
                                    }

                                }),

                                object: this.klass('Bind').pure(function(f, g, m) {

                                    return function $bind(x, r, l) {

                                        return function $fn(k, i, o) {
                                            var v = f(x, r[k], k, i, r, l);
                                            return v instanceof Array ? v.bind(m(f, (x[k] = {}), k, v, l+1))
                                            : (typeof v == 'object' && v.constructor.name == 'Object' ? g(v).bind($bind((x[k] = {}), v, l+1)) : v);
                                        };

                                    };

                                }, this.ctor.$find.ap('Obj').lift(function(node, value) {

                                    return node.is(value) ? value.keys()
                                        : (value instanceof Array ? value
                                            : (typeof value == 'object' ? Object.keys(value) : [ value ]));

                                }), function(f, t, j, x, l) {

                                    return function(v, i, o) {
                                        return f(t, v, j, x, l);
                                    }

                                })
                            },
                            impl: {

                                store: {

                                    fold: function(f) {
                                        return function(r, v, k, i, o) {
                                            if (f) {
                                                r = f(r, v, k, i, o) || r;
                                            }else if (r instanceof Array) {
                                                if (v && v.name) {
                                                    r.push(v);
                                                }else {
                                                    r[r.push({})-1][k] = v;
                                                }
                                            }else {
                                                r[k] = v;
                                            }
                                            return v;
                                        }
                                    },

                                    filter: function(expr) {
                                        return function(r, v, k, i, o) {
                                            if ((v && typeof v == 'string' && v.like(expr))
                                              || (k && typeof k == 'string' && k.like(expr))
                                                || (o && o.isStore && o.identifier && o.identifier().like(expr))) {
                                                r[k] = v;
                                            }
                                            return v;
                                        }
                                    },

                                    info: function() {
                                        return function(r, v, k, i, o) {
                                            r[k] = v;
                                            console.log('Bind', o && o.is ? [ o.identifier(), k, v, i ] : [ v, o, i ]);
                                            return v;
                                        }
                                    }
                                },
                                object: {

                                    fold: function(f) {
                                        return function(r, v, k, i, o) {
                                            if (f) {
                                                r = f(r, v, k, i, o) || r;
                                            }else if (r instanceof Array) {
                                                if (v && v.name) {
                                                    r.push(v);
                                                }else {
                                                    r[r.push({})-1][k] = v;
                                                }
                                            }else {
                                                r[k] = v;
                                            }
                                            return v;
                                        }
                                    },

                                    info: function() {
                                        return function(r, v, k, i, o) {
                                            r[k] = v;
                                            console.log(v, k, i);
                                            return typeof v == 'string' ? ('!!' + v + '!!') : v;
                                        }
                                    }
                                }
                            },
                            data: {

                                store: function(bind) {

                                    return function(path) {

                                        return function(value) {

                                            return bind(sys.get(path).store(), value);
                                        };
                                    };
                                },
                                path: function(bind) {

                                    return function(path, value) {

                                        return bind(sys.get(path).store(), value).bind(unit);

                                    };
                                },
                                object: function(bind) {

                                    return function(obj, value) {

                                        return bind(obj, value || {});

                                    };
                                }
                            }
                        });
                    },
                    init: (function(wrap, set, make, ext) {
                        return function(type, klass, sys) {
                            return type.make(type.binds.call(sys.get().child('binds'), ext(make.call(set(wrap({
                                klass: klass,
                                scheduler: sys.get('process'),
                                enqueue: sys.get('process.nextTick.enqueue'),
                                Cont: klass.find('Cont').of,
                                functor: klass.find('Functor'),
                                maybe: klass.find('Maybe'),
                                aid: this.makeID('arr'),
                                log: sys.log,
                                utils: sys.get('utils').select('atom', 'call', 'call1', 'call2', 'andThen', 'pass', 'target', 'extend'),
                                async: sys.get('async').select('pure', 'cast', 'make', 'select', 'get', 'next', 'combine', 'flatmap', 'fmap', 'wrap', 'then', 'lazy')
                            }))))));
                        };
                    })(
                        (function(ext) {
                            ext.cont = ext.utils.andThen(ext.async.cast);
                            return ext;
                        }),
                        (function(ext) {
                            var set = ext.klass.prop('collect')(ext.scheduler, ext.async);
                            Array.prototype.__      = ext.functor.$ctor;
                            Array.prototype.maybe   = ext.utils.call(ext.maybe.fromConstructor('list'));
                            Array.prototype.collect = ext.utils.call2(set.collect);
                            Array.prototype.wrap    = ext.utils.pass(set.wrap);
                            Array.prototype.make    = ext.utils.call2(set.make);
                            Array.prototype.arrid   = ext.aid;
                            Array.prototype.info    = ext.utils.call(sys.get('utils.point.map')(ext.log));
                            return ext;
                        }),
                        (function() {
                            Array.prototype.aid = function(aid) {
                                return aid && (this._aid = aid) ? this : (this._aid || (this._aid = { aid: this.arrid() }));
                            };
                            Array.prototype.each    = this.utils.call1(this.klass.prop('each'));
                            Array.prototype.bind    = this.klass.prop('bind');
                            Array.prototype.next    = this.utils.call2(this.async.next);
                            Array.prototype.combine = this.utils.call2(this.async.combine);
                            Array.prototype.target  = this.utils.target;
                            Array.prototype.select  = this.async.select;
                            Array.prototype.dequeue = this.utils.atom(function(f) {
                                return f ? f() : null;
                            }, function(x) {
                                return x.shift();
                            });
                            Array.prototype.call    = function() {
                                return this.length ? f(this.shift()) : null;
                            };
                            Array.prototype.ap = function() {
                                var args = [].slice.call(arguments);
                                if (args.length > 1) {
                                    return this.combine(function(x, y) {
                                        return y.run(x);
                                    }, args);
                                }else {
                                    return [ function(a, x) {
                                        return a.bind(function(v, i) {
                                            return x.run(v, i);
                                        });
                                    }, this, args.shift() ].apply();
                                }
                            };
                            Array.prototype.lift = function(f) {
                                return [ this.fmap(function(xs) {
                                    return f.apply(undefined, xs);
                                }) ];
                            };
                            Array.prototype.fold = function(f, r) {
                                return [ this.fmap(function(xs) {
                                    return f.apply(undefined, xs);
                                }) ];
                            };
                            Array.prototype.flatten = function() {
                                return this.flatmap(unit);
                            };
                            Array.prototype.chain = function(f) {
                                return [ this.fmap(function(r) {
                                    return f(r && r.length == 1 ? r.first() : r);
                                }) ];
                            };
                            return this;
                        }),
                        (function(ext) {
                            Array.prototype.run = function(/* k, o, f */) {
                                var args = [].slice.call(arguments), k, o, f;
                                while (args.length) {
                                    if (typeof args[0] == 'object') o = args.shift();
                                    else if (args[0] instanceof Function) {
                                        if (!k) k = args.shift(); if (!f) f = args.shift();
                                    }else {
                                        args.shift();
                                    }
                                }
                                o || (o = {}); o.aid || (o.aid = this.arrid());
                                return (f ? this.bind(f, o) : this).wrap(ext.async.get(k || unit), o);
                            };
                            Array.prototype.fmap = function(f) {
                                return ext.async.then(this.collect(), ext.cont(f));
                            };
                            Array.prototype.flatmap = function(f) {
                                return this.bind(f).chain(ext.async.flatmap(unit));
                            };
                            Array.prototype.cont = function() {
                                return this.length == 1 && this[0] instanceof Function && this[0].name == '$_pure'
                                ? ext.Cont(this.first()) : ext.Cont(this.collect(), function(r) {
                                    return function $_pure(k) {
                                        return k(r && r.length == 1 ? r.first() : r);
                                    }
                                });
                            };
                            return ext;
                        })
                    )
                };
            }),
        // === Link === //
            (function() {
                return {
                    parent: 'Store',
                    klass: function Link(x, name) {
                        this.$super.call(this, x, name || 'link');
                    },
                    ext: [
                        (function cid() {
                            return this._cid;
                        }),
                        (function mode(mode) {
                            return this.get(this.set('mode', mode)) || this.child(mode);
                        }),
                        (function use(arg) {
                            var args = arg instanceof Array ? arg : [].slice.call(arguments);
                            var key  = this.set('key', typeof args[0] == 'string' ? args.shift() : 'vals');
                            return this.get(key) || this.node(key);
                        }),
                        (function pick(key) {
                            return this.use(key).ref();
                        }),
                        (function add() {
                            var args = [].slice.call(arguments);
                            var rec  = this.use(args);
                            rec.push(this.data.get(this.cid()).apply(this, args));
                            return this;
                        }),
                        (function make(path, type, items) {
                            var root  = this.initial();
                            var parts = path.split('.');
                            var name  = parts.pop();
                            var store = parts.length ? (root.get(parts) || root.ensure(parts)).store() : root.node(name).store();
                            if (items) store.parse(items);
                            return store.link(type);
                        }),
                        (function coyo() {
                            var args = [].slice.call(arguments);
                            var node = this.initial(args.pop());
                            node.parse(this.klass('Obj').of({
                                base: {
                                    run: function(r, k) {
                                        var v = this.root(k);
                                        if (v instanceof Function) {
                                            r = v(r);                             
                                        }else if (typeof v == 'object') {
                                            if (v.$$map && v.$$run) {
                                                r = v.$$run(r);
                                            }else if (v.$$map) {
                                                r = v.$$map(r);
                                            }else if (r.$$map) {
                                                r = r.$$map(r);
                                            }else if (v.base) {
                                                r = v.base(r);
                                            }
                                        }
                                        return r;
                                    }
                                },
                                node: this.konst(node.get('node') || node),
                                $$link: this.konst(this),
                                $$run: function(evt) {
                                    return (this[this.$$map(evt)] || unit).call(this, evt);
                                }
                            }).extend(args.shift()));
                            return this.klass('Coyoneda').of(function(base) {
                                return function(evt) {
                                    return base.run(evt);
                                }
                            }, this.add(node.cid(), args.shift() || {}, 'base', node.cid()).resolve(node.cid(), 'base'));
                        }),
                        (function run() {
                            var args = [].slice.call(arguments), rec, path, link;
                            if (typeof args[0] == 'string') {
                                if (args.length > 1 && args[0].indexOf('.') > 0) {
                                    path = args.shift().split('.');
                                    link = this.idx.get(path.slice(0, -1).join('.'));
                                    return link.run.apply(link, args.prepend(path.last()));
                                }else if (this.has(args[0]) && this.is(this.get(args[0]))) {
                                    this.pick(args);
                                }else if (this.has('idx')) {
                                    link = this.get('idx').get('valueMap');
                                    return link.run.apply(link, args);
                                }
                            }
                            return this.ops.get(this.cid()).apply(this.current(), args);
                        })
                    ],
                    link: function() {
                        var args = [].slice.call(arguments);
                        var mode = args.shift(), path, node, link, name;
                        if (args.length) {
                            path = args.shift();
                            name = path.split('.').first();
                            node = (this.get(path) && this.get(name)) || (this.ref().ensure(path).set('node', this.ref()).get(name).store());
                            if (args.length) node.parse(args.shift());
                        }else {
                            node = this;
                        }
                        link = node._link || (node._link = node.$link(node, mode));
                        return mode ? link.mode(mode) : link;
                    },
                    vmap: function(/* path, objs */) {
                        var args = [].slice.call(arguments);
                        var path = args.shift();
                        var coyo = this.get(path.concat('.coyo'));
                        if (coyo) return coyo;

                        var link = this.link('valueMap', path);
                        var name = path.split('.').last();
                        var coyo = link.coyo(args.shift() || {}, name);
                        return this.get(path).set('coyo', coyo);
                    },
                    haslink: function() {
                        return this._link;
                    },
                    ops: function() {
                        this.set('mapF', function(value) {
                            var rec = this.current() || [], idx = 0, key = this._cid, val = this.initial(key);
                            while (idx < rec.length) {
                                if (rec[idx].filter(value)) break;
                            }
                            return val instanceof Function
                                ? (idx < rec.length ? val(rec[idx].map(value)) : val(value))
                                : (idx < rec.length ? rec[idx].map(val || value) : (val || value));
                        });
                        this.set('valueMap', function(value, maponly) {
                            var rec = this.current().first();
                            var map = rec.map.get(value || rec.def) || (rec.def ? (rec.map.get(rec.def) || value || rec.def) : value) || value;
                            if (maponly) return map;
                            var ini = rec.lookup ? this.initial(rec.lookup === true ? value : value.path(rec.lookup, true)) : this.initial();
                            return map instanceof Array ? ini.select(map) : (ini.get(map) || (rec.def && ini.get(rec.def)));
                        });
                        this.set('typeMap', function(value) {
                            var rec = this.current().first();
                            return rec.map.get(this.initial(value || rec.def) || this.initial(rec.def) || rec.def);
                        });
                        return this;
                    },
                    data: function() {
                        this.set('mapF', function(map, filter) {
                            return { filter: filter || (function() { return true; }), map: map || unit };
                        });
                        this.set('filterM', function(filter, map) {
                            return { filter: filter || (function() { return true; }), map: map || unit };
                        });
                        this.set('valueMap', function(map, def, lookup) {
                            var rec = this.get(this.get('key'));
                            return { map: rec.node('map').parse(map, true), def: def, lookup: lookup || false };
                        });
                        this.set('typeMap', function(map, def, lookup) {
                            var rec = this.get(this.get('key'));
                            return { map: rec.node('map').parse(map, true), def: def, lookup: lookup || false };
                        });
                        return this;
                    },
                    idx: function() {
                        this.child('store');
                        this.child('mapF');
                        this.child('filterM');
                        this.child('valueMap');
                        this.child('typeMap');
                        this.child('other');
                        return this;
                    },
                    child: function($child, $maintype, $store) {
                        return function(name, ctor, ref) {
                            if ($maintype.test(name)) {
                                return $store.set(''+this.uid(), this.set(name, $child.call(this, name, ctor, ref)));
                                //return this.set(name, this.idx.get(name));// || this.idx.$child.call(this, name, ctor, ref);
                            }else if ($maintype.test(this._cid)) {
                                var link = this.idx.get(this._cid) || this.idx.get('other');
                                var inst = link.get(name) || link.set(name, $child.call(this, name, ctor, ref));
                                return this.set(name, inst);
                            }else {
                                return $child.call(this, name, ctor, ref);
                            }
                        }
                    },
                    $$_of: function($ctor, $idx, $store) {
                        return function $$_of(ref, name) {
                            if (ref instanceof $ctor) {
                                return $store.get(''+ref.uid()) || $store.set(''+ref.uid(), new this(ref, ref.cid()));
                            }else if (typeof ref == 'string') {
                                return this.$$_of($store.root.get(ref) || sys.get().ensure(ref).store(), name);
                            }else {
                                return new this(ref, name);
                            }
                        }
                    },
                    ask: function() {
                        return this.run.apply(this, [].slice.call(arguments).append(true));
                    },
                    attrs: [
                        (function of(ref, name) {
                            return this.$$_of(ref, name);
                        })
                    ],
                    init: function(type, klass, sys) {
                        var $store = klass.$store.ctor;
                        $store.prop('$link', klass.of);
                        $store.prop('link', type.link);
                        $store.prop('vmap', type.vmap);
                        $store.prop('haslink', type.haslink);
                        var link = klass.prop('root').child('link', klass.$ctor).store();
                        klass.prop('data', type.data.call(link.child('data')));
                        klass.prop('ops', type.ops.call(link.child('ops')));
                        var $idx = klass.prop('idx', type.idx.call(link.child('idx')));
                        var $str = $idx.get('store');
                        klass.prop('child', type.child($store.prop('child'), new RegExp(/(mapF|filterM|valueMap|typeMap|foldMap)/), $str));
                        klass.$ctor.$$_of = type.$$_of($store.$ctor, $idx, $str);

                        klass.prop('ask', sys.fn.curry(type.ask, true, 2));
                        klass.prop('resolve', sys.fn.curry(klass.prop('run'), true, 2));
                    }
                };
            }),
        // === Record === //
            (function() {
                return {
                    parent: 'Node',
                    klass: function Record(opts) {
                        this.$super(opts);
                    },
                    ext: [
                        { name: '_children', value: 'nodes' }
                    ]
                };
            }),
        // === Schema === //
            (function() {
                return {
                    parent: 'Node',
                    klass: function Schema(opts) {
                        this.$super(opts);
                        this.configure(opts);
                    },
                    ext: [

                    ],
                    conf: {
                        control: {
                            main: {
                                add: function(type, values) {
                                    var root = this.root(), node = {}, def = values === true, vals = typeof values == 'object' ? values : {};
                                    node = root.get(type).lookup('fields').chain(function(fields) {
                                        return fields.reduce(function(r, v, k, n) {
                                            if (def) {
                                                r[k] = v.values(1);
                                            }else {
                                                r[k] = vals[k] || (k == 'cid' ? root.id() : (v.get('defv') || ''));
                                            }
                                            return r;
                                        }, node);
                                    }) || node;
                                    node = root.get(type).lookup('nodes').chain(function(nodes) {
                                        return nodes.reduce(function(r, v, k, n) {
                                            if (def) {
                                                r[k] = root.control('main').add(k, true);
                                            }else {
                                                r[k] = (vals[k] || (vals[k] = [])).map(function(x) {
                                                    return root.control('main').add(k, x);
                                                });
                                            }
                                            return r;
                                        }, node);
                                    }) || node;
                                    return node;
                                }
                            }
                        }
                    },
                    type: [
                        { name: 'string',  type: String   },
                        { name: 'number',  type: Number   },
                        { name: 'array',   type: Array    },
                        { name: 'object',  type: Object   },
                        { name: 'data',    type: '$data'  },
                        { name: 'store',   type: '$store' },
                        { name: 'node',    type: '$node'  },
                        { name: 'klass',   type: '$ctor'  }
                    ],
                    field: [
                        { name: 'type',    type: 'type'   },
                        { name: 'data',    type: 'type'   },
                        { name: 'options', type: Array    },
                        { name: 'default', type: 'type'   },
                        { name: 'nodes',   type: 'node'   }
                    ],
                    node: [
                        { name: 'klass',   type: 'klass' },
                        { name: 'fields',  type: 'field' }
                    ],
                    attrs: [
                        (function of(ref, name) {
                            return new this(ref, name);
                        })
                    ],
                    parse: function(obj, parse) {
                        return function(values) {
                            return obj.of({ root: this, curr: this }).reduce(function(v, k, i, r) {
                                if (k == 'fields' || k == 'nodes') {
                                    return parse.call(r.root.child({ name: k, parent: r.curr }), v, 1, r.root.__);
                                }else {
                                    return parse.call(r.root.child({ name: k, parent: r.curr }), v, 2, r.root.__);
                                }
                            }, values);
                        }
                    },
                    init: function(type, klass, sys) {
                        var $store = klass.$store.ctor;
                        var schema = sys.root.child('schema', klass.$ctor);
                        klass.prop('$record', klass.find('Record').$ctor);
                        klass.prop('$type', schema.node('$type').parse(type.type));
                        klass.prop('$field', schema.node('$field').parse(type.field));
                        klass.prop('$node', schema.node('$node').parse(type.node));
                        klass.prop('conf', sys.get('utils.extend')(klass.prop('conf').clone(), type.conf));
                        klass.prop('parse', type.parse(sys.klass('Obj'), klass.prop('parse')));
                    }
                };
            }),
        // === Value === //
            (function() {
                return {
                    klass: function Value(x, l) {
                        this.id = this.id();
                        if (x) this.mv = x;
                        this.mv._locked = l !== false;
                    },
                    ext: [
                        (function of(v, l) {
                            return this.constructor.of(v, l);
                        }),
                        (function lock(lock) {
                            if (!this._locked && lock !== false) this._locked = true;
                            return this;
                        }),
                        (function unlock() {
                            if (this.isLocked(this.mv)) this.mv._locked = false;
                            else if (this.isLocked()) this._locked = false;
                            return this.mv;
                        }),
                        (function isLocked(v) {
                            return v ? this.__.isLocked(v) : (this._locked === true || this.__.isLocked(this.mv));
                        }),
                        (function wasLocked(v) {
                            return v ? this.__.wasLocked(v) : (this._locked === false || this.__.wasLocked(this.mv));
                        }),
                        (function holdLock(v) {
                            return this.of(v, this._locked !== false);
                        }),
                        (function releaseLock() {
                            return this.of(this.unlock(), false);
                        }),
                        (function map(f) {
                            return this.of(this.mv.map(f), false);
                        }),
                        (function bind(f) {
                            return this.mv && !this.isLocked(this.mv) ? this.unlock().bind(f) : this.of(this.mv.bind(f), false);
                        }),
                        (function resolve(f) {
                            return this.mv && !this.isLocked(this.mv) ? this.unlock().resolve(f) : this.of(this.mv.resolve(f), false);
                        }),
                        (function pure() {
                           return this.mv && !this.isLocked(this.mv) ? this.unlock().pure() : this.mv.pure(); 
                        }),
                        (function create() {
                            var args = [].slice.call(arguments);
                            return this.mv.bind(function(v) {
                                return function $_pure(k) {
                                    v.create.apply(v, args).run(k);
                                }
                            });
                        }),
                        (function run(k) {
                            return this.mv && !this.isLocked(this.mv) ? this.mv.run(k) : k(this);
                        })
                    ],
                    isLocked: function() {
                        function isLocked(x) {
                            return x && x._locked;
                        }
                        return isLocked;
                    },
                    wasLocked: function() {
                        function wasLocked(x) {
                            return x && x._locked === false;
                        }
                        return wasLocked;
                    },
                    unlock: function(isLocked) {
                        function unlock(v) {
                            if (isLocked(v) && !(v._locked = false)) return v;
                            return v;
                        }   
                        return unlock;
                    },
                    attrs: [
                        (function of(v, l) {
                            return new this(v, l);
                        })
                    ],
                    value: function(v) {
                        return function() {
                            return v.of(this instanceof v.$ctor ? this.mv : this);
                        }
                    },
                    init: function(type, klass, sys) {
                        klass.$ctor.isLocked  = type.isLocked(klass);
                        klass.$ctor.wasLocked = type.wasLocked(klass);
                        klass.$ctor.unlock    = type.unlock(klass.$ctor.isLocked);

                        this.find('Cont').prop('$value', type.value(klass));
                    }
                };
            })
    ),

    (function MakeThreads() {

        return [].slice.call(arguments);
    })(
        // === IMPORT / PARSE === //
            (function $$THREADS() {
                return this.store('utils.importFuncs')([].slice.call(arguments), this.store().child('threads'));
            }),
        // === VALUES === //
            (function lazyValue(v) { return (function() { return v; }); }),
            (function lazyFunction(f) { return (function() { return f(); }); }),
            (function atom(f, t) {
                return function() {
                    return f(t);
                };
            }),
            (function ftor(f) {
                return function(x) {
                    return f.run(x);
                };
            }),
            (function atomize(f) {
                return function() {
                    var args = arguments;
                    return atom(function() {
                        return f.apply(null, args);
                    });
                };
            }),
            (function bindLazy(v, f) {
                return function() {
                    return f(v())();
                };
            }),
            (function $_atomLazy($_bindLazy) {
                return function atomLazy(f) {
                    return function(v) {
                        return $_bindLazy(v, f);
                    };
                };
            }),
            (function $_mapLazy($_atom) {
                return function mapLazy(f) {
                    return function(v) {
                        return $_atom(f, v);
                    }
                }
            }),
        // === INSTRUCTIONS === //
            (function pure(value)   { return { pure: true,  value: value }; }),
            (function roll(functor) { return { pure: false, value: functor }; }),
            (function $_makeThread($_pure) {
                return function makeThread(value) {
                    return function() { return $_pure(value); };
                };
            }),
            (function $_wrap($_roll) {
                return function wrap(instruction) {
                    return function() { return $_roll(instruction); };
                }
            }),
            (function makeInstruction() {
                var modeConfig = {
                  yield:  { ps9:  true  },
                  cont:   { cont: true  },
                  suspend:{ susp: true, ps9: true },
                  done:   { done: true  },
                  fork:   { us0:  true, ps1: true },
                  branch: { us9:  true  }
                };
                return function makeInstruction(mode, next) {
                  return { mode: mode, next: next, cf: modeConfig[mode] };
                };
            })(),
            (function $_instructionMap($_makeInstruction) {
                return function instructionMap(instruction, f) {
                    return $_makeInstruction(instruction.mode, instruction.next.map(f));
                }
            }),
        // === BIND AND LIFT === //
            (function $_bindThread($_bindLazy, $_instructionMap, $_wrap, $_roll, $_lazyValue) {
                return function bindThread(lazyValue, f) {
                    return $_bindLazy(lazyValue, function(free) {
                        return free.cont ? (free.kont || (free.kont = $_lazyValue(free)))
                        : (free.pure || !free.value
                            ? f(free.value || free)
                            : (free.kont || (free.kont = $_lazyValue($_roll($_instructionMap(free.value, function(v) {
                                return bindThread(v, f);
                            }))))));
                    });
                }
            }),
            (function $_lift($_bindLazy, $_makeThread) {
                return function lift(lazyValue) {
                    return $_bindLazy(lazyValue, $_makeThread);
                }
            }),
            (function $_atomThread($_bindThread) {
                return function atomThread(f) {
                    return function(v) {
                        return $_bindThread(v, f);
                    };
                };
            }),
            (function $_liftFn($_makeThread) {
                return function liftFn(fn) {
                    return function(value, free, inst) {
                        return makeThread(fn(value, free, inst));
                    }
                }
            }),
            (function $_liftF($_instructionMap, $_makeThread, $_wrap) {
                return function(instruction) {
                    return $_wrap($_instructionMap(instruction, $_makeThread));
                }
            }),
            (function $_mapThread($_bindThread, $_makeThread) {
                return function mapThread(lazyValue, f) {
                    return $_bindThread(lazyValue, function(v) {
                        return $_makeThread(f(v));
                    });
                }
            }),

        // === RUN, YIELD, DONE
            (function $_yyield($liftF, $_makeInstruction) {
                return function yyield() {
                  return $_liftF($_makeInstruction('yield', [null]));
                }
            }),
            (function runThreads(threads, status) {
                var free, inst, next, count = 0, index = 0;
                return function(info) {
                    if (++status.count && (status.length = threads.length) > 0) {
                        free = threads[0](info);
                        if (free && free.pure === false) {
                            if (!free.cont) {
                                threads.shift();
                                inst = free.value;
                                next = inst.next;
                                if (inst.cf.ps9) {
                                    threads.push.apply(threads, next);
                                }else if (inst.cf.us0) {
                                    threads.unshift(next[0]);
                                    threads.push.apply(threads, next.slice(1));
                                }
                            }
                            count++;
                        }else {
                            threads.shift();
                        }
                        if (inst && inst.cf.susp && count == threads.length && (info.suspend = true))
                            count = 0;

                        if (threads.length > status.maxlen) status.maxlen = threads.length;
                    }
                    return !(status.length = threads.length);
                }
            }),
            (function addThreads(make, wrap) {
                return function $_addThreads($_runThreads, $_lazyValue) {
                    return function addThreads(threads, enqueue, name) {
                        return make(wrap, $_lazyValue, $_runThreads, threads, enqueue, {
                            name: name, count: 0, maxlen: 0
                        });
                    }
                };
            })(
                (function(wrap, lazy, make, threads, enqueue, status) {
                    return {
                        enqueue: wrap(make(threads, status), threads, enqueue),
                        status: lazy(status)
                    };
                }),
                (function(run, threads, enqueue) {
                    return function() {
                        if (!(threads.length * threads.push.apply(threads, arguments))) {
                            enqueue(run);
                        }
                    }
                })
            ),

            (function makeBind() {
                return [].slice.call(arguments).apply();
            })(
                (function(make, bind, create, cache, wrap, suspend) {
                    return function $_makeBind($_wrap, $_roll, $_atom, $_ftor, $_makeInstruction, $_bindLazy, $_lazyValue, $_pure, $_mapLazy, $_runThreads) {
                        return make(bind, create, cache, wrap, {
                            wrap: $_wrap, roll: $_roll, atom: $_atom, ftor: $_ftor,
                            makeInstruction: $_makeInstruction, suspend: suspend,
                            bindLazy: $_bindLazy, lazyValue: $_lazyValue, pure: $_pure, mapLazy: $_mapLazy
                        });
                    }
                }),
                (function make(bind, create, cache, wrap, func) {
                    return bind(cache(create(func)), wrap, func);
                }),
                (function bind(bound, wrap, func) {
                    return function makeBind(f, x, t) {
                        return wrap.call(func, bound.call(func, f), x || {}, t);
                    }
                }),
                (function ftor(ctor, ext) {
                    return function(x) {
                        return ext.call(ctor, x);
                    }
                })(
                    (function $ftor(ftor) {
                        this.ftor = ftor.of(ftor.run().bind(this));
                    }),
                    (function(x) {
                        this.prototype = {
                            constructor: this,
                            cache: function(key, value) {
                                return (this[key] = x.lazyValue(value))();
                            },
                            cont: function() {
                                return this.cache('cont', { pure: false, cont: true });
                            },
                            next: function(v) {
                                return x.roll(x.makeInstruction('yield', [ this.run(v) ]));
                            },
                            susp: function(v) {
                                return this.cache('susp', x.roll(x.makeInstruction('suspend', [ this.run(v) ])));
                            },
                            bind: function(v, f) {
                                return this.cache('bind', x.roll(x.makeInstruction('yield', [ x.atom(f, v) ])));
                            },
                            lift: function(v) {
                                return new this.constructor(this.ftor.lift(v));
                            },
                            then: function(v) {
                                return this.run(v);
                            },
                            done: function(v) {
                                return x.pure(v);
                            },
                            run: function() {
                                return (this.run = x.mapLazy(x.ftor(this.ftor)));
                            }
                        };
                        return this;
                    })
                ),
                (function cache(b) {
                    return function(ftor) {
                        var x = new b(ftor);
                        x.run();
                        return x;
                    }
                }),
                (function wrap(b, x, t) {
                    if (t) b.suspend = this.suspend(t);
                    return b;
                }),
                (function suspend(t) {
                    return function(v) {
                        return this.done(t.of(this.run(v)));
                    }
                })
            ),
        // === ARR THREAD
            (function makeArr(x, f, k) {
                return function() {
                    if (x.i < x.arr.length) {
                        x.res[x.i] = f(x.arr[x.i], x.i++, x.arr);
                        if (k && x.i == x.arr.length) {
                            x.res = k(x.res);
                        }
                    }
                    return x.i < x.arr.length ? x.next : x.pure;
                }
            }),
            (function $_arrThread($_makeArr, $_makeInstruction, $_lazyValue) {
                return function arrThread(f, k, m) {
                    return function(arr) {
                        var x  = { arr: arr, i: 0, res: arr.map($_lazyValue()) };
                        x.next = { pure: false, value: $_makeInstruction(m || 'yield', [ $_makeArr(x, f, k) ]) };
                        x.pure = { pure: true,  value: x.res };
                        return $_lazyValue(x.next);
                    }
                }
            }),
            (function arrThread(f) {
                return function(x) {
                    if (x.i < x.arr.length) {
                        x.res[x.i] = f(x.arr[x.i], x.i++, x.arr);
                        if (k && x.i == x.arr.length) {
                            x.res = k(x.res);
                        }
                    }
                    return x.i < x.arr.length ? x.next : x.pure;
                }
            }),
        // === QUEUE THREAD
            (function makeQueue(x, f, k) {
                return function() {
                    if (x.arr.length) {
                        if (f(x.arr[(x.i<x.arr.length?x.i:(x.i=0))], x.item++, x.run++) && !(x.item = 0))
                            if (x.i) x.arr.splice(x.i, 1);
                            else x.arr.shift();
                        else
                            x.i++;
                        if (k && !x.arr.length) k(x);
                    }
                    return x.arr.length ? x.cont : x.pure;
                }
            }),
            (function $_queueThread($_makeQueue, $_makeInstruction, $_lazyValue) {
                return function queueThread(f, k, m) {
                    return function(arr) {
                        var x  = { arr: arr, i: 0, item: 0, run: 0 };
                        x.next = { pure: false, value: $_makeInstruction(m || 'yield', [ $_makeQueue(x, f, k) ]) };
                        x.cont = { pure: false, cont: true };
                        x.pure = { pure: true,  value: x };
                        return $_lazyValue(x.next);
                    }
                }
            }),
            (function queueThread(x) {
                if (x.arr.length) {
                    if (f(x.arr[(x.i<x.arr.length?x.i:(x.i=0))], x.item++, x.run++) && !(x.item = 0))
                        if (x.i) x.arr.splice(x.i, 1);
                        else x.arr.shift();
                    else
                        x.i++;
                    if (k && !x.arr.length) k(x);
                }
                return x.arr.length ? x.cont : x.pure;
            }),
        // === LIST THREAD
            (function makeList(x) {
                if (x.arr.length) {
                    x.arr = x.arr.filter(x.fn);
                }
                return x.arr.length ? x.next : x.pure;
            }),
            (function $_listThread($_makeList, $_makeInstruction, $_atom, $_lazyValue) {
                return function listThread(f, m) {
                    return function(arr) {
                        var x  = { arr: arr.slice(0), fn: f };
                        x.next = { pure: false, value: $_makeInstruction(m || 'yield', [ $_atom($_makeList, x) ]) };
                        x.cont = { pure: false, cont: true };
                        x.pure = { pure: true,  value: x.arr.slice(0) };
                        return x.next;
                    }
                }
            })
    ),

    (function MakeTypes2() {

        return [].slice.call(arguments);
    })(
        // === Coyoneda === //
            (function Coyoneda() {
                return {
                    parent: 'Functor',
                    klass: function Coyoneda(f, x) {
                        this.id = this.ctor.$id = this.id();
                        this.$$init(f, x);
                    },
                    ext: [
                        (function $$init(f, x) {
                            if (f) this.mf = f;
                            else if (!this.mf) this.mf = unit;
                            if (x) this.mv = x;
                        }),
                        (function map(f) {
                            return new this.constructor(this.$fn.compose(this.mf)(f), this.mv);
                        }),
                        (function bimap(f, g) {
                            return this.of(this.$fn.compose(this.mf)(f), (g || unit)(this.mv));
                        }),
                        (function bind(x, f) {
                            return new this.constructor(f ? this.$fn.compose(this.mf)(f) : this.mf, x || this.mv);
                        }),
                        (function chain(f, x) {
                            return (f ? this.$fn.compose(this.mf)(f) : this.mf)(x || this.mv);
                        }),
                        (function lift(x) {
                            return new this.constructor(this.$fn.lift(this.mv, this.mf, x), x);
                        }),
                        (function ftor() {
                            return this.$fn.ftor(this);
                        }),
                        (function run(x) {
                            return x ? (this.mv ? (x instanceof Function ? x(this.mf(this.mv)) : this.mf(this.mv)(x)) : this.mf(x)) : (this.mv ? this.mf(this.mv) : this.mf);
                        })
                    ],
                    attrs: [
                        (function of(f, x) {
                            if (!(f instanceof Function)) return new this(function(v) {
                                return function(t) {
                                    return t ? v.lift(t).run() : v.run;
                                }
                            }, f);
                            return new this(f || unit, x);
                        }),
                        (function lift(x, f) {
                            return new this(f || unit, x);
                        }),
                        (function $of() {
                            var ctor = this;
                            return function() {
                                return ctor.of.apply(ctor, arguments);
                            }
                        })
                    ],
                    lift: function(v, f, x) {
                        return v ? f(v) : (x ? f : f());
                    },
                    init: function(type, klass, sys) {
                        klass.prop('$fn', {
                            compose: klass.find('Compose').prop('$fn'),
                            lift: type.lift, ftor: sys.get('threads.ftor')
                        });
                    }
                };
            }),
        // === Free === //
            (function() {
                return {
                    klass: function Free(f, x, t) {
                        this._id = this.ctor.$id = this.id();
                        this._x  = this.$fn.ftor.is(f) ? (x ? f.lift(x) : f) : this.$fn.ftor.of(this.$fn.makeBind(this.$fn.coyo.is(f) ? f : this.$fn.coyo.of(f), {}, this), x);
                        this._t  = t || this._t || '$enqueue';
                    },
                    ext: [
                        (function of(f, x) {
                            return this.constructor.of(f, x);
                        }),
                        (function map(f) {
                            return new this.constructor(this._x.map(this.$fn.map(f)), null, this._t);
                        }),
                        (function lift(x) {
                            return new this.constructor(this._x.lift(x).lift());
                        }),
                        (function bind(f, x) {
                            return new this.constructor(this._x.map(this.$fn.atomThread(this.$fn.makeBind(f, x || {}, this).run)), null, this._t);
                        }),
                        (function run(x, f) {
                            return this[this._t].enqueue(this._x.chain(f ? this.$fn.map(f) : null, x));
                        }),
                        (function cont(x) {
                            return this.$fn.cont.of(this.$fn.kont(new this.constructor(this._x.lift(x))));
                        }),
                        (function info() {
                            return this[this._t];
                        })
                    ],
                    $ext: function() {
                        return [
                            { name: '$fn', value: this.threads.select('atomThread', 'makeBind') },
                            { name: '$enqueue', value: this.threads.set('enqueue', this.threads.get('addThreads')([], this.enqueue, '$enqueue')) },
                            { name: '$anim', value: this.threads.set('anim',
                                this.threads.get('addThreads')([], this.process.get('animFrame.enqueue'), '$anim'))
                            }
                        ];
                    },
                    attrs: (function() {
                        return [].slice.call(arguments).apply();
                    })(
                        (function(t, ftor, coyo, c, of, arr, que, lst, wrap, raf) {
                            var cast  = c(t);
                            var bindL = t.get('bindLazy');
                            var lazyV = t.get('lazyValue');
                            return [
                                cast,
                                of(cast),
                                arr(coyo, bindL, lazyV, t.get('arrThread'), wrap),
                                que(coyo, bindL, lazyV, t.get('queueThread'), wrap),
                                lst(coyo, bindL, lazyV, t.get('listThread'), wrap),
                                raf(coyo, t.get('listThread'))
                            ];
                        }),
                        this.get('threads'),
                        this.klass('Functor'),
                        this.klass('Coyoneda'),
                        (function(cmd) {
                            return function cast(v) {
                                if (v instanceof Function) {
                                    return v;
                                }else if (v) {
                                    return cmd.get('lazyValue')(v);
                                }
                            }
                        }),
                        (function(cast) {
                            return function of(f, x) {
                                return new this(f, x);
                            }
                        }),
                        (function(coyo, bindLazy, lazyValue, arrThread, wrapThread) {
                            return function arr(a, f) {
                                return wrapThread(new this(coyo.of(arrThread(f), a)))(a);
                            }
                        }),
                        (function(coyo, bindLazy, lazyValue, queThread, wrapThread) {
                            return function queue(f) {
                                return wrapThread(new this(coyo.is(f) ? f : coyo.of(f)));
                            }
                        }),
                        (function(coyo, bindLazy, lazyValue, listThread, wrapThread) {
                            return function list(f, m) {
                                return wrapThread(new this(coyo.is(f) ? f : coyo.of(listThread(f, m))).lift());
                            }
                        }),
                        (function wrap(thread) {
                            return function(arr) {
                                var stats = { count: 0, size: 0, max: 0 };
                                return {
                                    id: thread._id,
                                    info: function() {
                                        return stats;
                                    },
                                    bind: function(f, x) {
                                        return wrap(wrap, arr, thread.bind(f, x));
                                    },
                                    push: function(args, appl) {
                                        if (++stats.count && !(arr.length * (appl === true ? arr.push.apply(arr, args) : arr.push(args)))) {
                                            stats.size = arr.length; 
                                            thread.run(arr);
                                        }else if (arr.length > stats.max) {
                                            stats.max  = arr.length;
                                        }
                                        return this;
                                    },
                                    lift: function(x) {
                                        return wrap(thread.lift(x))(arr);
                                    },
                                    add: function() {
                                        arr.push.apply(arr, arguments);
                                        return this;
                                    },
                                    run: function(f) {
                                        thread.run(arr, f);
                                        return this;
                                    }
                                };
                            }
                        }),
                        (function(coyo, listThread) {
                            return function raf(f) {
                                return new this(coyo.is(f) ? f : coyo.of(listThread(f, 'suspend')));
                            }
                        })
                    ),
                    cont: function() {
                        return this.extend(function ContF(mv, mf) {
                            this.$super(mv, mf);
                        }, {
                            mf: unit
                        })
                    },
                    kont: function(free) {
                        return function $_pure(k) {
                            free.run(k);
                        }
                    },
                    map: function(f) {
                        return this.atomThread(this.wrap(f));
                    },
                    init: function(type, klass, sys) {
                        var $st = klass.$store.root;
                        var $fn = type.$ext.call({
                            get: $st.get('utils.target'),
                            threads: $st.get('threads'),
                            process: $st.get('process'), enqueue: $st.get('process.nextTick.enqueue')
                        }).reduce(function(r, v) { r.prop(v.name, v.value); return r; }, klass).prop('$fn');
                        $fn.cast = klass.$ctor.cast;
                        $fn.coyo = klass.find('Coyoneda');
                        $fn.ftor = klass.find('Coyoneda').extend('CoyoF');
                        $fn.cont = type.cont.call(klass.find('Cont'));
                        $fn.kont = type.kont;
                        $fn.wrap = sys.get('utils.andThen')(sys.get('threads.makeThread'));
                        $fn.map  = sys.get('utils.compose')($fn.wrap)($fn.atomThread);
                    }
                };
            }),
        // === Cell === //
            (function() {
                return {
                    klass: function Cell(f) {
                        this.v = undefined, this.isDefined = false, this.queue = [];
                        if (f) this.f = f;
                        else if (!this.f) this.f = unit;
                    },
                    ext: [
                        (function get(k) {
                            if (this.isDefined) {
                                //JavaScript as an Embedded DSL 429 430 G. Kossakowski et al.
                                //k(this.v);
                                this.enqueue(this.atom(k, this.v));
                            }else {
                                this.queue.push(k);
                            }
                        }),
                        (function set(v) {
                            if (this.isDefined) {
                                throw "can’t set value twice"
                            }else {
                                this.run(this.f(v));
                            }
                        }),
                        (function atom(k, v) {
                            return function() {
                                k(v); return true;
                            }
                        }),
                        (function run(r) {
                            if (this.isDefined) {
                                throw "can’t set value twice"
                            }else {
                                this.v = r; this.isDefined = true,
                                this.queue.splice(0).bind(function(f) {
                                    f(r) //non-trivial spawn could be used here })
                                }).run();
                            }
                        })
                    ],
                    attrs: [
                        (function of(f) {
                            return new this(f);
                        })
                    ],
                    cont: function(cell) {
                        return function(v) {
                            cell.set(v);
                        }
                    },
                    kont: function(klass) {
                        return function(cell) {
                            return klass.of(function $_pure(k) {
                                cell.get(k);
                            });
                        }
                    },
                    init: function(type, klass, sys) {
                        var fn = sys.root.get('sys.fn'), utils = sys.get('utils');
                        klass.$ctor.map = utils.get('compose')(fn.$const)(utils.get('andThen')(klass.of));
                        klass.prop('enqueue', sys.get('process.nextTick.enqueue'));
                        klass.prop('cont', utils.get('call')(type.cont));
                        this.find('Node').prop('cell', klass.of);
                        klass.prop('kont', utils.get('call')(type.kont(this.find('Cont'))));
                    }
                };
            }),
        // === Control === //
            (function() {
                return {
                    parent: 'Cont',
                    klass: function Control(x, f) {
                        this.$super(x, f);
                    },
                    ext: [
                        (function $$init(x, f) {
                            if (x) this.mv = this.$$parse(x);
                        }),
                        (function $$parse(x) {
                            return x instanceof Array ? (x.length == 1 ? this.$cast(x.shift()) : this.$fn.parallel.apply(undefined, x.map(this.$cast))) : this.$cast(x);
                        }),
                        { name: 'async', value: this.get('async').select('series', 'count', 'times', 'inject', 'eject', 'delay') },
                        (function times(x) {
                            var t = parseInt(x || 0) || 0;
                            if (t > 1) {
                                return this.of(this.async.times(x, this.lazy(this.mv)));
                            }else {
                                return this;
                            }
                        }),
                        (function delay(ms) {
                            return this.of(this.async.delay(this.mv, ms));
                        }),
                        (function then() {
                            return this.of(this.async.series(this.mv, this.$$parse([].slice.call(arguments))));
                        }),
                        (function parse(succ, fail) {
                            return function(result) {
                                return succ(result);
                            }
                        }),
                        (function eject(succ, fail) {
                            return this.of(this.async.eject(this.mv, this.parse(succ, fail)));
                        })
                    ],
                    of: function(of) {
                        return function() {
                            return of.call(this, [].slice.call(arguments));
                        }
                    },
                    init: function(type, klass, sys) {
                        klass.of = type.of(klass.of);
                        klass.prop('$cast', klass.prop('$$cast').bind(klass.proto()));
                        klass.prop('$fn', {
                            array: sys.get('async.array'),
                            series: sys.get('async.series'),
                            parallel: sys.get('async.parallel'),
                            compose: klass.find('Compose').prop('$fn')
                        });
                    }
                };
            }),
        // === Signal === //
            (function() {
                return {
                    name: 'Signal',
                    klass: function Signal(ref) {
                        this._id = this.ctor.$id = this.id();
                        this._listener = ref;
                        this._values   = [];
                        this._handlers = [];
                    },
                    ext: [
                        (function make(info, handler) {
                            if (info && info.uid == this._listener.uid && info.hid) {
                                info.hid = this.$fn.hid();
                                return info;
                            }else {
                                var hndl = {
                                    uid: this._listener.uid, hid: this.$fn.hid(), opts: info.opts || {},
                                    elem: info.element, eid: 0, name: info.name, ref: info.selector,
                                    filter: info.filter, throttle: info.throttle, run: handler
                                };
                                hndl.atom = info.throttle ? handler : this.$fn.lazy(handler, hndl);
                                return hndl;
                            }
                        }),
                        (function toggle(onoff) {
                            var lstr = this._listener, state;
                            if (lstr.state == 'on' && onoff !== 'on') {
                                state = lstr.off(lstr.elem, lstr.name, lstr.run);
                                lstr.state = state.state;
                                if (!lstr.on) lstr.on = state.on;
                            }else if (onoff !== 'off') {
                                state = lstr.on(lstr.elem, lstr.name, lstr.run);
                                lstr.state = state.state;
                                if (!lstr.off) lstr.off = state.off;
                            }
                            return lstr;
                        }),
                        (function add(info, handler) {
                            if (this._listener.state == 'off') this.toggle('on');
                            var hndl = this.make(info, handler), idx;
                            if ((idx = this._handlers.indexOf(hndl)) < 0) {
                                return this._handlers[this._handlers.push(hndl)-1];
                            }else {
                                console.log('!DUPLICATE!', hndl, this);
                                return this._handlers[idx] = hndl;
                            }
                        }),
                        (function remove(info) {
                            var idx = 0, arr = this._handlers, hnd, test;
                            while (idx < arr.length && (test = arr[idx])) {
                                if (info.hid) {
                                    if (info.hid != test.hid && ++idx) continue;
                                    /* !FOUND! */
                                }else if (info.target) {
                                    if (info.ref.concat('.', info.target).indexOf(test.ref.replace('.%', '')) < 0 && ++idx) continue;
                                    else if (info.ref.indexOf(test.elem.identifier()) && ++idx) continue;
                                }else {
                                    if (info.ref != test.ref) continue;
                                }
                                hnd = arr.splice(idx, 1).shift(); break;
                            }
                            if (!this._handlers.length) this.toggle('off');
                            return hnd;
                        }),
                        (function filter(item) {
                            return function(res, hndl) {
                                item.count++;
                                if (hndl.eid < item.eid && hndl.filter(item)) {
                                    hndl.eid = item.eid; res.push(hndl.atom(item));
                                }
                                return res;
                            }
                        }),
                        (function run(value) {
                            return this._handlers.reduce(this.filter(this._listener.create(value)), []);
                        })
                    ],
                    attrs: [
                        (function of(identifier) {
                            return new this(identifier);
                        })
                    ],
                    lazy: function(f, x) {
                        return function(v) {
                            return function() {
                                return f(v, x);
                            }
                        }
                    },
                    init: function(type, klass, sys) {
                        klass.prop('$fn', {
                            hid: this.makeID(''), lazy: type.lazy
                        });
                    }
                };
            }),
        // === Queue === //
            (function() {
                return {
                    name: 'Queue',
                    parent: 'Store',
                    klass: function Queue(ref, name) {
                        this.$super.call(this, ref, name);
                        this.ctor.$id = this.uid();
                    },
                    ext: [
                        (function thread() {
                            return this.free;
                        }),
                        (function enqueue(item) {
                            item.eid = this.eid();
                            this.get(item.type).run(item).map(this.thread.push);
                            return this;
                        }),
                        (function proxy(type, item) {
                            return this.enqueue(item.clone({ type: type }));
                        }),
                        (function wrap() {
                            var type = this.parent().store();
                            this.thread = type.get('thread') || type.set('thread', type.thread());
                            return this.enqueue.bind(this);
                        }),
                        (function create(listener) {
                            return (this._signal || (this.constructor.prototype._signal = this.ctor.find('Signal'))).of(listener);
                        }),
                        (function handler(stream) {
                            this.handlers.push(stream);
                            return this;
                        }),
                        (function make(/* type, name, id, item */) {
                            var args = [].slice.call(arguments);
                            var listener = args.pop(); listener.uid = this.uid();
                            listener.create = args.pop(); listener.reference = args.join('.');
                            return this.set(listener.name, this.create(listener));
                        })
                    ],
                    free: function() {
                        return this.find('Free').$ctor.queue(this.find('Coyoneda').of(function() {
                            return function(v) {
                                v.dequeue();
                                return v.length ? this.cont() : this.done();
                            }
                        }))([]);
                    },
                    init: function(type, klass, sys) {
                        klass.prop('free', type.free.call(this).lift([]));
                        klass.prop('eid', this.makeID(false));
                    }
                };
            }),
        // === Event === //
            (function() {
                return {
                    name: 'Events',
                    parent: 'Node',
                    klass: function Events(opts) {
                        this.$super(opts || (opts = {}));
                        this.initdata();
                        this.thread = this.set('thread', this.thread());
                    },
                    ext: [
                        (function initdata() {
                            this._lstnrs = this._lstnrs || (this._lstnrs = this.node('listeners'));
                            this._active = this._active || (this._active = this._lstnrs.set('active', []));
                        }),
                        (function thread() {
                            return this.free([]).lift(this.uid());
                        }),
                        (function addEventListener(/* instance, name, selector, target, opts */) {
                            var args = [].slice.call(arguments), instance = args.shift(), lstr;
                            if (args.length == 1 && typeof args.first() == 'object') {
                            }else {
                                var name = args.shift();
                                var target = args.pop(), opts = args.length && typeof args.last() == 'object' ? args.pop() : {};
                                var selector = args.length ? args.shift() : '*';
                                var hndl = typeof target == 'string' ? instance[target].bind(instance) : target;
                                var active = this._lstnrs.get('active') || this._lstnrs.set('active', []);
                                return active[active.push({
                                    uid: instance.uid(),
                                    ref: instance.identifier(),
                                    level: instance.level(),
                                    name: name, target: hndl,
                                    opts: opts, run: hndl.run || hndl
                                })-1];
                            }
                        }),
                        (function removeEventListener(info) {
                            if (info.sid || info.uid) {
                                var signal = this.find(info.sid || info.uid).get(info.type || info.name || 'change');
                                if (signal) return signal.remove(info);
                            }else if (this._active && this._active.length) {
                                var index = 0, signal;
                                while (index < this._active.length) {
                                    if (this._active[index].name == info) signal = this._active.splice(index, 1);
                                    else index++;
                                }
                                return signal;
                            }
                        }),
                        (function makeEvent(source, args, base) {
                            var type   = args.shift();
                            var target = args.shift().split('.');
                            return {
                                src:    'data',
                                count:   0,
                                uid:     source.uid(),
                                level:   source.level(),
                                type:    type,
                                target:  target.pop(), 
                                ref:     target.unshift(source.identifier()) && target.join('.'),
                                action:  args.shift(),
                                value:   args.pop()
                            };
                        }),
                        (function emit(source, args, base) {//* source, name, target, info */) {
                            if (args !== 'queue' && source && source.uid && this._active) {
                                if (this._active.length) {
                                    this.thread.push(this.makeEvent(source, args, base));
                                }else {
                                    //console.log(this, arguments)
                                }
                            }
                        })
                    ],
                    attrs: [
                        (function of(opts) {
                            return new this(opts);
                        })
                    ],
                    free: function() {
                        return this.find('Free').$ctor.queue(this.find('Coyoneda').of(function(handlers) {
                            return function(values) {
                                var item = values.shift();
                                sys.find(handlers, true).get('listeners.active').map(function(hndl) {
                                    if (item.ref.indexOf(hndl.ref) === 0) {
                                        hndl.eid = item.eid; hndl.run(item);
                                    }
                                    item.count++;
                                });
                                return values.length ? this.cont() : this.done();
                            }
                        }));
                    },
                    init: function(type, klass, sys) {
                        klass.prop('free', type.free.call(this));
                        klass.prop('isEvents', true);

                        var root = sys.root;
                        root.child('events', klass.$ctor);
                    }
                };
            }),
        // === Listener === //
            (function() {
                return {
                    name: 'Listener',
                    parent: 'IO',
                    klass: function Listener(x) {
                        this.$$init(x);
                    },
                    ext: (function() {
                        return [].slice.call(arguments).pure(0, true);
                    })(
                        (function(items) {
                            return function() {
                                return items.first().apply(this.root.store(), items.slice(1));
                            }
                        }),
                        (function(makeQueue, mbAddEL1, mbAddEL2, mbELEMListener, addELEMENTListener,
                            mbEVTbind1, wrapDISPATCHER, mbEVTcntrTUP, eON, eOFF,
                                evtONOFF, throttle, mbEvtADD) {
                            
                            var maybe   = this.get('utils.maybe');
                            var tuple   = this.get('utils.tuple');
                            var bin     = this.get('utils.bin');
                            var fromCB  = this.get('utils.fromCallback');
                            var compose = this.get('sys.fn.compose');

                            var maybeAddEventListener = maybe(mbAddEL1)(mbAddEL2);

                            var maybeListener = maybe(mbELEMListener);

                            var maybeEventBinder = maybe(mbEVTbind1);

                            var maybeEventControl = maybe(mbEVTcntrTUP)(tuple(eON)(eOFF));

                            var maybeEventElem = maybeListener(
                                maybe(addELEMENTListener)(maybeEventControl(bin(evtONOFF))));

                            function makeEventContainerElement(element) {
                                return maybeAddEventListener(maybeEventElem(element || document.body));
                            };

                            return [
                                { name: 'makeQueue', value: makeQueue },
                                { name: 'getQueue', value: makeQueue(this.ref().child('queue', this.ctor.find('Queue').$ctor)) },
                                { name: 'addElementListener', value: addELEMENTListener },
                                { name: 'wrapDispatcher', value: wrapDISPATCHER },
                                { name: 'maybeListener', value: maybeListener },
                                { name: 'maybeAddEventListener', value: maybeAddEventListener },
                                { name: 'maybeEventElem', value: makeEventContainerElement },
                                { name: 'maybeEventControl', value: maybeEventControl },
                                { name: 'addEventListener', value: mbEvtADD },
                                { name: 'throttle', value: throttle },
                                { name: 'maybeEventBinder', value: maybeEventBinder },
                                { name: 'eventOnOffControl', value: evtONOFF },
                                { name: 'fromCallback', value: fromCB }
                            ];

                        }),
                        (function makeQueue(queue) {
                            return function(name, type) {
                                if (!name) return queue;
                                var child = queue.child(name);
                                child._type = type || name;
                                return child;
                            }
                        }),
                        (function addEL1(wrap) {
                            return function(make) {
                                return wrap(make);
                            }
                        }),
                        (function addEL2(make) {
                            return function(name, handler) {
                                return make(name, handler);
                            }
                        }),
                        (function maybeElementListener(handler) {
                            return function(elem) {
                                return handler(elem);
                            };
                        }),
                        (function addElementListener(addListener) {
                            return function(elem) {
                                return function(name, handler) {
                                    return addListener(elem, name, handler);
                                };
                            };
                        }),
                        (function createSelectorFunc(matchFunction) {
                            return function(element) {
                                return function(selector) {
                                    return matchFunction(element, selector);
                                }
                            }
                        }),
                        (function wrapDispatcher(dispatcher) {
                            return function(addListener) {
                                return function(name) {
                                    return addListener(name, dispatcher);
                                }
                            }
                        }),
                        (function tupledEventOnOffFuncs(tup) {
                            return function(continuation) {
                                return tup(continuation);
                            }
                        }),
                        (function on(elem, name, handler) {
                            elem.addEventListener(name, handler);
                            return {
                                name: name,
                                elem: elem,
                                run: handler,
                                state: 'on'
                            };
                        }),
                        (function off(elem, name, handler) {
                            elem.removeEventListener(name, handler);
                            return {
                                name: name,
                                elem: elem,
                                run: handler,
                                state: 'off'
                            };
                        }),
                        (function eventOnOffControl(on, off) {
                            function $on(elem, name, handler) {
                                var state = on(elem, name, handler);
                                state.off = $off;
                                return state;
                            };
                            function $off(elem, name, handler) {
                                var state = off(elem, name, handler);
                                state.on  = $on;
                                return state;
                            };
                            return $on;
                        }),
                        (function throttle(sink, ms) {
                            var stoid = 0, value, skipcount = 0;
                            if (ms) sink.throttle = ms;
                            return function(evt) {
                                value = evt;
                                if (stoid) {
                                    if (skipcount%100==0) console.log('THROTTLE', skipcount);
                                    skipcount++;
                                }else {
                                    stoid = setTimeout(function() {
                                        stoid = 0;
                                        sink.run(value);
                                    }, sink.throttle);
                                }
                            }
                        }),
                        (function add(/* element, type, name, selector, run, throttle */) {
                            var args    = [].slice.call(arguments), reference = args.shift(), handler;
                            var type    = args.shift(), store = this.getQueue(type), name, node, throttle, run;
                            if (args.length == 1 && typeof args.first() == 'object') {
                                handler = args.shift();
                                name    = handler.name;
                                node    = this.run(name);
                                return node.add(handler);
                            }else {
                                name     = args.shift(), node = this.run(name);
                                throttle = args.length && typeof args.last() != 'function' ? args.pop() : 0;
                                run      = args.pop();

                                var opts     = args.length && typeof args.last() == 'object' ? args.pop() : {};
                                var selector = args.length && typeof args[0] == 'string' ? args.shift() : null;
                                var element  = store.get('createElement')(reference);

                                handler  = {
                                    type: type, name: name, element: element,
                                    selector: selector, throttle: throttle, opts: opts,
                                    filter: store.get('selectorFunc')(element, selector),
                                    run: run
                                };
                                return node.add(handler, throttle ? this.throttle(handler, throttle) : run);
                            }
                        })
                    ),
                    data: {
                        dom: [
                            (function matches(element, selector) {
                                return function(evt) {
                                    if (evt.stop) return false;

                                    var elem = evt.target;
                                    while (elem) {
                                        if (!selector || elem.matches(selector)) break;
                                        else if (elem == element) return false;
                                        else elem = elem.parentElement;
                                    }
                                    if (elem) {
                                        evt.currentTarget = elem;
                                        evt.value = (elem.value || elem.name || elem.innerText || '').toLowerCase();
                                        while (elem) {
                                            if (!element) break;
                                            else if (elem == element) break;
                                            else elem = elem.parentElement;
                                        }
                                    }
                                    return !!elem;
                                } // DOMeventHandler creates the DOM event specific *handler* proxy
                            }),   // so the main handler(s) to which the listeners will be attached
                            (function createEvent(evt) {
                                return {
                                    src: 'dom',
                                    eid: evt.eid,
                                    sid: this.uid,
                                    type: evt.type,
                                    count: evt.count || 0,
                                    target: evt.target,
                                    currentTarget: null,
                                    relatedTarget: evt.relatedTarget,
                                    x: evt.clientX || evt.x || -1,
                                    y: evt.clientY || evt.y || -1
                                };
                            }),
                            (function createElement(element) {
                                return typeof element == 'string'
                                ? document.getElementById(element) : element;
                            })
                        ],
                        store: [
                            (function matches(element, selector) {
                                var ref = element.identifier();
                                var sel = selector.split('.');
                                var trg = sel[sel.length-1];
                                return function(evt) {
                                    if (evt.stop || !evt.target) return false;
                                    if (!selector || (evt.target.matches(trg) && element.lookup(sel.slice(0, -1)).chain(function(elem) {
                                        return elem.equals(evt.uid);
                                    })) || (evt.ref.replace(ref, '')+'.'+evt.target).substr(1).matches(selector)) {
                                        if (!element) return true;
                                        return element.pertains(evt);
                                    }
                                    return false;
                                } // DOMeventHandler creates the DOM event specific *handler* proxy
                            }),   // so the main handler(s) to which the listeners will be attached
                            (function createEvent(evt) {
                                return {
                                    src: 'data',
                                    eid: evt.eid,
                                    uid: evt.uid,
                                    sid: this.uid,
                                    ref: evt.ref,
                                    type: evt.type,
                                    count: evt.count || 0,
                                    level: evt.level,
                                    target: evt.target,
                                    action: evt.action,
                                    value: evt.value
                                };
                            }),
                            (function createElement(element) {
                                return typeof element == 'string'
                                ? sys.get(element) : element;
                            })
                        ]
                    },
                    base: (function(init, make) {
                        return function(klass) {
                            return init(klass.$ctor.lift((klass.$ctor.base = make)));
                        }
                    })(
                        (function(make) {
                            return function init(name, type) {
                                return make.run(this.prototype.getQueue(name, type));
                            }
                        }),
                        (function(base, elem) {
                            var node, disp, name = elem._cid || elem.id || ('v' + base.uid());
                            if (!name || !(node = base.get(name))) {
                                node = base.child(name);
                                if (!name) name = node.cid();
                                if (!elem.id) elem.id = name;
                            }
                            var type = node.get('type') || node.set('type', base._type);
                            var disp = node.get('dispatcher')
                                || node.set('dispatcher', this.wrapDispatcher(node.store().wrap())(this.maybeEventElem(elem)));
                            return this.constructor.make.run(node);
                        })
                    ),
                    make: (function(node, name) {

                        return node.get(name) ||
                            node.store().make(
                                node.identifier(), name, node.closest('queue').get(node.get('type'), 'createEvent'),
                                    node.get('dispatcher')(name));
                    }),
                    init: function(type, klass, sys) {
                        var $ctor = klass.$ctor;
                        var root  = sys.root;
                        var lift  = $ctor.lift  = klass.parent().get('type.$ctor').lift;
                        var pure  = $ctor.$pure = klass.parent().get('type.$ctor').pure.bind($ctor);
                        var func  = $ctor.prototype;
                        var init  = $ctor.init  = type.base(klass);
                        var make  = $ctor.make  = $ctor.lift(type.make);

                        var maybe = root.get('utils.maybe');
                        var queue = root.get('queue');

                        var dom   = queue.child('dom').parse(type.data.dom);
                        var store = queue.child('store').parse(type.data.store);

                        dom.set('selectorFunc', dom.get('matches'));
                        store.set('selectorFunc', store.get('matches'));
                    }
                };
            }),
        // === Component === //
            (function() {
                return {
                    parent: 'Node',
                    klass: function Component(opts) {
                        if (!opts.parent) opts.parent = this._node;
                        this.$$init(opts);
                        this._events = (opts.parent._events || opts.parent.get('events')).child({ name: 'events', parent: this });
                        this.connect();

                        if (opts.view) this.view = this.konst(this.set('view', opts.view));
                        this._started  = 1;

                        this.node('$fn');
                        this.set('type', (opts.type || this.constructor.name).toDash());
                        
                        this.parse(opts);
                        this.update(opts);
                    },
                    ext: [
                        { name: '_children', value: 'nodes' },
                        (function initialize() {}),
                        (function parse(conf) {
                            return this.configure(conf);
                        }),
                        (function onAttach(evt, hndl) {
                            this.removeEventListener(hndl);
                            this.enqueue(this.comp(function() {
                                this.initialize();
                                return true; 
                            }));
                        }),
                        (function origin(plural) {

                            return plural ? 'components' : 'component';
                        }),
                        (function attr() {

                            return { 'class' : this.constructor.name.toLowerCase() + ' ' + this.origin() };
                        }),
                        (function view() {
                            return (this.view = this.konst(this.child('view', this.deps ? this.deps('components.view') : this.klass('View').$ctor)))();
                        }),
                        (function attach(selector) {
                            return this.view().parent('$fn.attach').ap(selector ? (selector.unit ? selector.unit() : selector) : this.module().$el()).run().map(this.bin(function(comp, el) {
                                var elem = el.parentElement;
                                if (!comp.state('attach')) comp.observe('change', 'state.attach', 'onAttach');
                                comp.state('attach', elem.id || elem.className);
                                return elem;
                            }));
                        }),
                        (function display(state) {
                            return this.maybe().map(function(comp) {
                                return comp.view().parent('$fn.display').run(comp.state('display', state || ''));
                            });
                        }),
                        (function update() {}),
                        (function queue(path) {
                            return this.module().queue(path);
                        }),
                        (function $fn(name) {
                            return this.view().parent().get('$fn', name);
                        }),
                        (function $el(selector) {
                            return this.view().$el(selector);
                        }),
                        (function on(name, selector, handler, throttle) {
                            return this.view().on(name, selector, typeof handler == 'string' ? this.handler(handler) : handler, parseInt(throttle || '') || 0);
                        }),
                        (function route(ext) {
                            return 'components/'+this._cid+'/'+this._cid+(ext ? ('.'+ext) : '');
                        }),
                        (function eff(name, value) {
                            return value ? (this.$eff[name] = value) : (name ? this.$eff[name] : this.$eff);
                        }),
                        (function make(cont) {
                            this._cont || (this._cont = cont.bind(this.comp(function(klass) {
                                var loca = sys.get('assets').get(this.deps('name'))
                                        || sys.get('assets').get(this.origin(true), this.get('type'), this.get('type'));
                                if (!loca.get('js')) loca.set('js', this.cell()).set(this.constructor);

                                if (this.conf.events)  this.data({ events: this.conf.events });
                                if (this.conf.proxy)   this.data({ proxy: this.conf.proxy });
                                if (this.conf.control) this.control().update(this.conf.control);
                                if (this.conf.data  && this.conf.data.events) this.data({ events: this.conf.data.events });
                                return this.events();
                            })));
                            return this;
                        }),
                        (function component() {
                            var args = [].slice.call(arguments);
                            var ref  = args.shift().split('.');
                            var type = args.length ? args.join('.') : '';
                            var path = type ? type.split('.') : ref.split('.');
                            var name = ref.pop();
                            var prnt = ref.length ? this.ensure(ref) : this;
                            var comp = prnt.get(name);
                            if (!comp) {
                                var cmps = this.deps(path.length > 1 ? path.shift() : 'components');
                                var code = path.length ? path.join('.') : name;
                                if (cmps[code] && cmps[code].create) {
                                    comp = prnt.set(name, cmps[code].create({ name: name, parent: prnt })); 
                                }else if (cmps[code]) {
                                    comp = cmps[code];
                                }else if (cmps['$'+code]) {
                                    comp = cmps['$'+code].create({ name: name, parent: prnt });
                                }else if (cmps[code.replace('.', '.$')]) {
                                    comp = cmps[code.replace('.', '.$')].create({ name: name, parent: prnt });
                                }else if (!type) {
                                    comp = prnt.klass('Component').of({ name: name, parent: prnt });
                                }
                            }
                            return comp;
                        }),
                        (function module() {
                            if (this.cid() == 'components') return this;
                            else if (this.parent().cid() == 'components') return this.parent();

                            var module = this.klass('Module');
                            return this.closest(module) || this.closest('components').filter(function(c) {
                                if (module.is(c)) {
                                    if (c.$el().map(function(el) {
                                        return el.offsetParent !== null;
                                    }).run()) return true;
                                }
                                return false;
                            }).first();
                        }),
                        (function run(k) {
                            var cell = this._cell;
                            if (!cell) {
                                cell = this._cell = this.cell();
                            }
                            cell.get(k);
                            if (!cell.isBound) {
                                cell.isBound = true;
                                if (this._cont) this._cont.bind(cell.cont()).run();
                                else cell.set(this);
                            }
                            return this;
                        }),
                        (function cont() {
                            var cell = this._cell;
                            if (!cell) {
                                cell = this._cell = this.cell();
                            }
                            return cell.kont();
                        }),
                        (function once(k) {
                            var cell = this._cell;
                            if (!cell) return this.run(k);
                            return this;
                        }),
                        (function chain(f) {
                            return this.cont().bind(f);
                        }),
                        (function pure() {
                            var comp = this;
                            return function $_pure(k) {
                                comp.run(k);
                            };
                        })
                    ],
                    attrs: [
                        (function(components) {
                            return function of(opts) {
                                var args  = [].slice.apply(arguments);
                                var conf  = typeof args[0] == 'object' ? args.shift() : {};
                                var node  = this.ctor.prop('_node');//components.ref();
                                conf.type = this.name.toTypeName();
                                if (!conf.name && args.length && typeof args[0] == 'string') conf.name = args.shift();

                                if (args.length && typeof args[0] == 'object') {
                                    if (args.length == 1) {
                                        conf.opts = args.shift();
                                        if (conf.opts.data) (conf.data = conf.opts.data) && (delete conf.opts.data); 
                                    }else if (conf.data = args.shift()) {

                                    }
                                }
                                if (!conf.opts && args.length && typeof args[0] == 'object') conf.opts = args.shift();
                                if (!conf.parent) conf.parent = node;

                                return conf.parent.exists(conf) || conf.parent.child(conf, this);
                            };
                        })(this.components)
                    ],
                    comp: function(comp, f) {
                        return function() {
                            return f.apply(comp, [].slice.call(arguments));
                        }
                    },
                    done: function(cell) {
                        return function(k) {
                            var c = cell.of();
                            c.get(k);
                            return c;
                        }
                    },
                    init: function(type, klass, sys) {
                        var proto  = klass.proto(), ctor = klass.$ctor, root = sys.root;
                        proto.conf = { opts: { js: true, css: false, tmpl: true }, def: { main: {}, current: {} } };
                        proto.$eff = {};
                        proto.cmpt = klass.$ctor;
                        proto.comp = root.get('utils.call1')(type.comp);
                        proto.enqueue = root.get('process.nextTick.enqueue');
                        proto.raf  = root.get('process.animFrame.enqueue');
                        proto.done = type.done(this.find('Cell'));
                    }
                };
            }),
        // === Module === //
            (function() {
                return {
                    parent: 'Component',
                    klass: function Module(opts) {
                        this.$super.call(this, opts);
                    },
                    ext: [
                        (function origin(plural) {

                            return plural ? 'modules' : 'module';
                        }),
                        (function queue(path) {
                            return this.listener.getQueue(this.cid()).get(path);
                        }),
                        (function connect() {
                            var ctor = this.klass('Listener').$ctor;
                            var lstr = this.listener = ctor.init(this.cid(), 'store');
                            if (!this.dispatcher) this.dispatcher = lstr.run(this);

                            return this.maybe(this.walk('parent', function(v) {
                                return v._events;
                            })).lift(function(evts, comp) {
                                comp._events = evts._events.child({ name: 'events', parent: comp });
                                return comp;
                            }).ap(this.maybe(this));
                        }),
                        (function(display, show, make, add) {
                            return function routes(router) {
                                return add(
                                    router,
                                        make(sys.eff('sys.loader.component'),
                                            show(sys.eff('dom.elements.children').run(display('none'), '#root')('>'), this))
                                );
                            }
                        })(
                            (function(display) {
                                return function(elem) {
                                    var comp = sys.find(elem.id.slice(1));
                                    if (comp) comp = comp.ref().parent();
                                    if (comp) comp.display(display);
                                    else elem.style.display = typeof display != 'undefined' ? display : (elem.style.display != 'none' ? 'none' : '');
                                    return elem;
                                }
                            }),
                            (function(display, main) {
                                return function(show) {
                                    show.display('none');
                                    show.parent().initialize();
                                    show.attach('#root');

                                    display.run().run(function() {
                                        show.display('block').chain(function() {
                                            var root = document.body;
                                            var curr = main.state('current');
                                            if (curr) root.classList.remove(curr);
                                            root.classList.add(main.state('current', show.cid()));
                                        });
                                    });
                                }
                            }),
                            (function(loader, display) {
                                return function(current) {
                                    var mod = this.get('info', current, 'module');
                                    loader.run([ 'modules', mod, mod ].join('/'), current).run(display);
                                }
                            }),
                            (function(router, route) {
                                router.parent('config.modules').store().bind(function(v, k, i, o) {
                                    if (v.route) {
                                        router.addRoute(v.route, route, { description: v.label, module: v.name || v.route }, v.alias);
                                    }
                                }).run(function() {
                                    router.startup();
                                });
                                return router;
                            })
                        )
                    ],
                    $el: function() {
                        return document.getElementById('root');
                    },
                    init: function(type, klass, sys) {
                        var comp = this.find('Component'), root = sys.root;
                        var node = comp.prop('_node', root.child('components', klass.$ctor));
                        node.$el = node.konst(this.find('IO').pure(type.$el));
                        var disp = comp.prop('listener', node.listener);
                        var lstr = this.find('Listener').$ctor;
                        comp.prop('dom', lstr.init('dom'));
                    }
                };
            }),
        // === Deps === //
            (function() {
                return {
                    parent: 'Value',
                    klass: function Deps(x, f) {
                        this.id = this.id();
                        if (x) this.mv = x;
                        if (f) this.mf = f;
                        else if (!this.mf) this.mf = unit;
                    },
                    ext: [
                        (function apply(k) {
                            return this.mv.get(this.mf(k));
                        }),
                        (function run(k) {
                            return this.mv && !this._locked ? this.apply(k) : k(this);
                        })
                    ],
                    attrs: [
                        (function of(v) {
                            return this.cast(v);
                        })
                    ],
                    wrap: function(io) {
                        return function() {
                            return io.run.apply(io, arguments);
                        }
                    },
                    cast: function(klass, wrap) {
                        return function(v) {
                            if (v instanceof klass.$ctor) {
                                return v.unlock();
                            }else {
                                return wrap(klass.find('IO').pure(v));
                            }
                        }
                    },
                    init: function(type, klass, sys) {
                        klass.$ctor.cast = type.cast(klass.parent(), type.wrap);
                        klass.prop('cast', klass.$ctor.cast);
                    }
                };
            }),
        // === User === //
            (function() {
                return {
                    parent: 'Node',
                    klass: function User(opts) {
                        this.$super.call(this, opts);
                    },
                    ext: [
                        (function auth() {
                            var LocalStorage = sys.get('utils.localStorage'), user = this;
                            var local = LocalStorage.getItem('whpk_user'), parsed = JSON.parse(local);

                            sys.get('config').lookup('user').map(function(usr) {
                                return user.parse(usr.values());
                            });

                            if (parsed && typeof parsed == 'object') {
                                user.parse(parsed);
                                var date = new Date();
                                var test = user.set('ts_previous', user.get('ts_current'));
                                var prev = test ? new Date(test) : null;
                                var curr = new Date(user.set('ts_current',  date.toISOString()));
                                if (prev && user.set('ts_diff', (curr - (prev || curr)) / 1000) < 300) {
                                    user.set('state', 'on');
                                }else {
                                    user.set('state', 'off');
                                }
                            }else {
                                user.clear();
                                user.set('state', 'off');
                            }
                            LocalStorage.setItem('whpk_user', JSON.stringify(JSON.decycle({
                                ts_previous: user.get('ts_previous'),
                                ts_current: user.get('ts_current'),
                                ts_diff: user.get('ts_diff')
                            })).trim());

                            return true;//sys.authopt || user.assert('state', 'on');
                        })
                    ]
                };
            }),
        // === Context === //
            (function() {
                return {
                    klass: function Context(opts, ref) {
                        this.$super.call(this, opts, ref);
                    },
                    ext: [
                        (function $$init(opts, ref) {
                            //return this.parse(opts, ref);
                        }),
                        (function $values(keys, vals) {
                            return { keys: keys, vals: vals && vals instanceof Array ? vals : ((typeof vals == 'object' ? keys.map(function(k, idx) {
                                return vals[keys[idx]];
                            }) : keys.slice(0))) };
                        }),
                        (function $keys() {
                            var args = [].slice.call(arguments).flat();
                            if (args.length == 1 && typeof args[0] == 'object')
                                return this.$values(Object.keys(args.first()), args.shift());
                            else
                                return this.$values(args, args);
                        }),
                        (function reduce(a, f, r) {
                            var vals  = this.$keys(a);
                            vals.res  = r || {};
                            if (!vals.link) vals.link = this.link('valueMap');
                            return vals.keys.reduce(function(r, k, i) {
                                return f(r, r.vals[i], k, r.vals) || r;
                            }, vals);
                        }),
                        (function parse(/* data, link, store */) {
                            return this.reduce([].slice.call(arguments), function(res, val, key) {
                                if (key == 'parent') {
                                    res.link.add('children', 'parent', store);
                                }
                                return res;
                            }, this);
                        }),
                        (function valueMap(type, code, label, values) {
                            this.link(type || 'valueMap').add(code, this.codes(values));
                            this.link(type || 'valueMap').add(label,this.labels(values));
                            return this.link;
                        }),
                        (function modelMap(curr, next, value) {
                            this.valueMap('modelMap', 'current', 'next', value);
                        })
                    ]
                };
            }),
        // === Transformer === //
            (function() {
                return {
                    klass: function Transformer(monad) {
                        this.id = this.id();
                        this._m = monad || this._m;
                        this._r = this._r;
                    },
                    ext: [
                        (function of(monad) {
                            return new this.constructor(monad);
                        }),
                        (function ask() {
                            return this._r.ask();
                        }),
                        (function asks(fn) {
                            return this._r.asks(fn);
                        }),
                        (function unit(ctx) {
                            return this._r.unit(ctx);
                        }),
                        (function get(key) {
                            return this._r.store(key);
                        }),
                        (function store(key, value) {
                            return typeof value == 'undefined' ? (!key ? this.$context : this.$context.get(key)) : (this.$context.set(key, value));
                        }),
                        (function add(key, fn) {
                            return this.$context.get(key) || this.$context.set(key, this.of(fn || this._f));
                        }),
                        (function put(key, value, returnValue) {
                            var result;
                            if (key && typeof value == 'object') {
                                var store = this.$context.get(key) || this.$context.child(key);
                                result = store.parse(value);
                            }else if (key && typeof key == 'object') {
                                result = this.$context.parse(key);
                            }else if (key && value) {
                                result = this.$context.set(key, value);
                            }else if (key) {
                                result = this.$context.get(key) || this.$context.child(key);
                            }
                            return returnValue ? result : this;
                        }),
                        (function reader() {
                            return this._r;
                        }),
                        (function map(fn) {
                            return this.of(this._m.map(fn));
                        }),
                        (function bind(k) {
                            return this.$cont(k);
                        }),
                        (function lift(x) {
                            return this.of(this._m.of(x));
                        }),
                        (function test(value) {
                            if (!value) return {};
                            else if (this.ctor.root().is(value)) return { type: true };
                            return {
                                'reader' : this._r.is(value),
                                'monad'  : this._m.is(value),
                                'trans'  : this.is(value)
                            };
                        }),
                        (function result(ctx, res) {
                            if (!res) {
                                return this;
                            }else if (res.type) {
                                return this;
                            }else {
                                var test = this.test(res);
                                if (test.reader) return res;
                                else if (test.monad) return this;
                            }
                            return this._r.unit(res);
                        }),
                        (function $result(t, k, c) {
                            return function(r) {
                                return k.call(t._m, t.result(c || t, r));
                            }
                        }),
                        (function run(k) {
                            return this._r.bind(this.$result(this, k || unit, this._r), this);
                        })
                    ],
                    attrs: [
                        (function of(monad) {
                            return new this(monad);
                        }),
                        (function initial(reader, monad) {
                            var name = reader.name || reader._cid || reader.constructor.name;
                            var extT = this.ctor.extend(name + 'T', { _r: reader });
                            if (monad) extT.prop('_m', monad);
                            return extT.of();
                        })
                    ],
                    initial: function(reader, monad) {
                        return this.$ctor.initial(reader, monad);
                    },
                    extendCont: function() {
                        return this.klass.extend(function ContT(trans) {
                            this.$super.call(this, trans);
                        }, {
                            mv: function $_pure(k) {
                                return trans.run(trans.$kont(k));
                            },
                            mf: this.mf
                        })
                    },
                    $_cont: function(v) {
                        return function $_pure(k) {
                            return v.lift(k)
                        }
                    },
                    makeCont: function(cont) {
                        return function(k) {
                            return cont.of(this).bind(this.$kont(k));
                        }
                    },
                    makeHandler: (function $kont(w, h) {
                        return function kont(k) {
                            return w(h, k, this);
                        }
                    })(
                        (function wrapper(h, k, t) {
                            return function() {
                                return h(t, this)(k.call(this, [].slice.call(arguments)));
                            }
                        }),
                        (function handler(t, c) {
                            return function(result) {
                                return t.result(c, result);
                            }
                        })
                    ),
                    init: function(type, klass, sys) {
                        klass.constructor.prototype.initial = type.initial;
                        klass.prop('$of', klass.$ctor.of.bind(klass.$ctor));
                        klass.prop('$cont', type.makeCont(type.extendCont.call({ klass: this.find('Cont'), mf: type.$_cont })));
                        klass.prop('$kont', type.makeHandler);

                        klass.prop('$$kont', klass.$store.node('$$cache').node('$$kont'));
                        klass.prop('$context', klass.root().get().child('context', klass.find('Context').$ctor));

                        klass.prop('$root', klass.initial(klass.find('Reader').fromConstructor('fromStore', sys.get()), klass.find('Coyoneda')));
                    }
                };
            })
    ),

    (function MakeEffects() {
 
        return [].slice.call(arguments);
    })(
        (function $$EFFECTS(run) {
            if (!this.get('sys.isWorker')) run();
        }),
        (function() {
            define(function() {
                return this.klass('Cont').of(this, function(sys) {
                    var store = sys.get('assets.core').store();
                    var user  = sys.get().child('user', sys.klass('User').$ctor);
                    return store.get('effect.cont').bind(function() {
                        return Array.of(
                            store.get('router.cont').cont(),
                            store.get('config.cont').cont(),
                            store.get('storage.cont').cont(),
                            store.get('worker.cont').cont()
                        ).lift(function(router) {
                            var curr = router.getFromHash();
                            if (!user.auth() || curr == 'auth') {
                                router.setRoute('auth');
                            }else {
                                router.setRoute(curr);
                                if (curr && curr != 'app') {
                                    return sys.eff('sys.loader.component').run('modules/application/application', 'app').cont();
                                }
                            }
                        }).run(function() {
                            sys.get('components').routes(sys.get('router'));
                        });
                    }).cont();
                }).attr('name', 'core.app');
            });
        })
    )

);
