// ========  ======== STAGE 2 ========  ======== //

    (function SetupDispatcher() {

        return [].slice.call(arguments).apply(0);       
    })(

        (function MakeDispatcher(create_dispatcher, wrapped_dispatcher, process_messages, create_enqueue_platform, close_over) {
            return (function dispatcher(cb, timer) { return cb(create_dispatcher(wrapped_dispatcher, process_messages, close_over, create_enqueue_platform, timer)); });
        }),
        (function create_dispatcher(wrapped_dispatcher, process_messages, close_over, create_enqueue_platform, timer) {
            var tasks = [], status = [ 0, 0, 50, false, false, { frameid: 0, count: 0, ts: 0, limit: 0, rs: 0, handle: 0, suspend: false, length: 0, maxlen: 0 } ];
            return close_over(
                (function queue() { return tasks; }),
                    (function status() { return status; }),
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
                    }
                    if (info.suspend || (info.limit < (info.rs = self.now()))) break;
                    else if (++status[TASK_COUNTER] >= status[TASK_BATCH_SIZE]) {
                        status[TASK_COUNTER] = 0; break;
                    }
                }
                status[TASK_RUNNING] = false; info.suspend = false;
                ++TASK_INDEX < tasks.length || (TASK_INDEX = 0);
                return !tasks.length;
            }
        }),
        (function create_enqueue_platform(tasks, status, run) {
            return function enqueue(item) {
                if ((status[0] = tasks.push({ next: item })) == 1) run();
            };
        }),
        (function close_over(tasks, status, run, create_enqueuer) {
            return (function() {
                return { tasks: tasks, status: status, run: run, enqueue: create_enqueuer(tasks(), status(), run) };
            });
        })
    ),

// ========  ======== STAGE 3 ========  ======== //

    (function CoreEngine() {

        return [].slice.call(arguments).pure(0, true);
    })(

        (function MakeFuncWrap(args) {
            return function makeScheduler(root) {
                return args.insert(1, root).apply();
            }
        }),

        (function MakeScheduler(root, schedulerBase, threadScheduler, wrapAsync, asyncScheduler) {

            return schedulerBase({
                'root'    : root.root,
                'threads' : threadScheduler(root),
                'async'   : asyncScheduler(root)(wrapAsync)(root.get('scheduler.dispatcher')(unit)())
            });
        }),

        (function SchedulerBase(scheduler) {
            var test = scheduler.root('sys.model');
            scheduler.root();

            Array.prototype.collect = function() {
                return this.$collect(this);
            };

            return scheduler;
        }),

        (function ThreadScheduler(root) {
            return root.pure(root.ext('path')('sys.model')('factory')(function(factory) {
                return factory.object('func.scheduler.threads');
            }));
        }),

        (function WrapAsyncFunctions(object) {
            return function(scheduler) {
                return (object.collect = object._$_collect(object.run, object.next, scheduler.enqueue));
            }
        }),

        (function AsyncScheduler(root) {
            return root.pure(root.ext('path')('sys.model')('factory')(function(factory) {
                return factory.object('func.scheduler.async');
            }));
        })
    ),

// ========  ======== STAGE 3 ========  ======== //

    (function MakeOverallScheduler(makeTimers, wrapTimers, makeWrap, startWrap, doneWrap) {
        // --- 
        return function makeOverallScheduler(root) {
            var scheduler  = root.get('scheduler');
            var NativeTms  = makeTimers(scheduler.add('native'));
            var dispatcher = scheduler.get('dispatcher');
            scheduler.ext('parse')({
                wrapped: wrapTimers(scheduler),
                nextTick: dispatcher(unit)(),
                animFrame: dispatcher(unit, NativeTms.get('raf'))()
            });
            scheduler.set('enqueue', scheduler.get('wrapped')(makeWrap(doneWrap, startWrap, 'nextTick.enqueue')));
            return scheduler;
        }
    })(
        (function MakeTimers(node) {
            return node.ext('parse')({
                sto: self.setTimeout,
                cto: self.clearTimeout,
                raf: self.requestAnimationFrame,
                caf: self.cancelAnimationFrame,
                siv: self.setInterval,
                civ: self.clearInterval,
                sim: self.setImmediate,
                cim: self.clearImmediate
            });
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
            schedule(function() { succ(result); return true; });
        })
    ),