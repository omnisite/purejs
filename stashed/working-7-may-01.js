(function() {

    return [].slice.call(arguments).apply();

})(

    // === ArrayExt === //
    (function() {
        debugger;
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

    // === ID === //
    (function makeID(base, prefix) {
        var counter = { base: base || 1000000, prefix: prefix || '', count: base || 1000000 };
        return function() {
            return counter.count++;
        }
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
