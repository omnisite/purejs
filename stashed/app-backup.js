// ========  ========= PURE JS ====== ========  ======== //

    (function MakeApp() {

        var args = [].slice.call(arguments, 1).unspar();
        return args.flatten().apply();
    })(

// ======  ====== USEFUL AND/OR ESSENTIAL ======  ====== //

    (function ImmediateNeeds() {

        return [].slice.call(arguments);
    })(
        (function ImmediateNeeds() {

            Array.prototype.at = function(index) {
                return this.length && index < this.length ? this[index] : [];
            };
            Array.prototype.bind = function(f) {
                return Array.prototype.concat.apply([], this.map(f));
            };
            Array.prototype.flatmap = function(f) {
                return Array.prototype.concat.apply([], this.map(f));
            };
            Array.prototype.flatten = function() {
                return Array.prototype.concat.apply([], this.map(unit));
            };
            Array.prototype.prepend = function() {
                this.unshift.apply(this, [].slice.call(arguments));
                return this;
            };
            Array.prototype.insert = function(position) {
                this.push.apply(this, this.splice(0, position).concat([].slice.call(arguments, 1)).concat(this.splice(0)));
                return this;
            };
            Array.prototype.replace = function(position) {
                var args = [].slice.call(arguments, 1);
                args.push.apply(args, this.splice(position).slice(args.length));
                this.push.apply(this, args);
                return this;
            };
            Array.prototype.unspar = function() {
                this.push.apply(this, this.splice(0).filter(function(x) { return !(x === null || typeof x == 'undefined'); }));
                return this;
            };
            Array.prototype.append = function() {
                this.push.apply(this, [].slice.call(arguments));
                return this;
            };

            (self.unit = (function unit(t) {
                return t;
            }));
            (self.$const = (function $const(x) {
                return function() {
                    return x;
                }
            }));
            (self.pure = (function pure(t) {
                if (t && t.name == '$_pure') return t;
                return function $_pure(f) {
                    return f(t);
                }
            }));
            Array.prototype.pure = function(idx, slice) {
                return typeof idx != 'undefined' &&
                    idx < this.length && this[idx] instanceof Function
                        ? this[idx](slice ? this.slice(idx+1) : this) : pure(this);
            };
            Array.pure = function() {
                return pure(Array.apply(arguments));
            };
            Array.of = function() {
                return [].slice.call(arguments);
            };
        })(),
        (function MakeSelf() {
            String.prototype.$_like = new RegExp("([\\.\\\\\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:\\-])", "g");
            String.prototype.matches = String.prototype.like = function(search) {
                if (typeof search !== 'string' || this === null) { return false; }
                search = search.replace(this.$_like, "\\$1");
                search = search.replace(/%/g, '.*').replace(/_/g, '.');
                return RegExp('^' + search + '$', 'gi').test(this);
            };
            String.prototype.trim = function(){
                return this.replace(/^\s+|\s+$/g, "");
            };
            String.prototype.toDash = function() {
                return this.length < 2 ? this.toLowerCase() : this.replace(/([A-Z])/g, function($1, p1, pos){return (pos > 0 ? "-" : "") + $1.toLowerCase();});
            };
            String.prototype.toCamel = function(){
                return this.length < 2 ? this.toLowerCase() : this.replace(/(^[a-z]{1}|\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
            };
            String.prototype.toTypeCode = function() {
                return [ '$', this.split('$').pop().toDash() ].join('');
            };
            String.prototype.toTypeName = function() {
                return this.replace('$', '').toDash();
            };
            self.isMobile = (function() {
                var check = false;
                (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
                return check;
            })();
            self.isWorker = (function() {
                var self = this; return (self.document === undefined);
            })();
            self.rafNext = 0;
            self.now = (function now(run) {
                return run();
            })(
                (function() {
                var perf = self.performance;
                if (perf && (perf.now || perf.webkitNow)) {
                    var perfNow = perf.now ? 'now' : 'webkitNow';
                    return perf[perfNow].bind(perf);
                }else { return Date.now; }
            }));
        })(),
        (function MakeArray($apply) {
            this.prototype.apply = function(idx, recur) {
                if (recur || idx === true) {
                    return $apply(this);
                }else if (idx instanceof Function) {
                    return idx.apply(undefined, this.slice(0));
                }else {
                    return this[idx||0].apply(undefined, this.slice((idx||0)+1));
                }
            };
            this.prototype.of = function() {
                return this[0](this.slice(1));
            };
            return (this.of = function() {
                return [].slice.call(arguments);
            });
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

// ======  ====== ROOT DATA NODE AND SYS ======  ====== //

    (function Factory() {

        return [].slice.call(arguments);
    })(
        (function BaseModel(dataStore, dispatcher, makeSys, types, arrayext, launchApp, makeXHR, makeEffects, makeHandler) {

            return makeHandler(makeEffects(makeXHR(launchApp(self.sys = dataStore(dispatcher, types, arrayext, makeSys)))));
        }),

        (function RootDataStore(dispatcher, continuation, arrayext, makeSys) {

            var sys = {};
            sys.dispatcher = dispatcher;
            sys.nextTick   = dispatcher(unit)();

            return makeSys(continuation(sys), sys, arrayext);
        }),

        (function SetupDispatcher() {

            return [].slice.call(arguments).apply();       
        })(
            (function MakeDispatcher(create_dispatcher, wrapped_dispatcher, process_messages, create_enqueue_platform, close_over) {
                return (function dispatcher(cb, timer) { return cb(create_dispatcher(wrapped_dispatcher, process_messages, close_over, create_enqueue_platform, timer)); });
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

        (function WrapRootAndSys() {

            return [].slice.call(arguments).apply();
        })(
            (function wrapper(storeDispatcher, wrapDispatcher, makeBind, makeArray, makeSys) {
                return function wrapAndMakeSys(root, sys, arrayext) {
                    return makeSys.call({}, storeDispatcher(root, sys, wrapDispatcher, makeBind, makeArray, arrayext));
                }
            }),
            (function storeDispatcher(root, sys, wrap, bind, make, ext) {
                var scheduler = root.get('scheduler');
                scheduler.set('dispatcher', sys.dispatcher);
                scheduler.set('nextTick', sys.nextTick);
                sys.nextTick.result = wrap(scheduler);
                sys.nextTick.bind = bind(sys.nextTick.result);
                make(ext(sys.nextTick));
                return root;
            }),
            (function wrapDispatcher(wrap, make, start, done) {
                return function(scheduler) {
                    var wrapped = scheduler.set('wrapped', wrap(scheduler));
                    return wrapped(make(done, start, 'nextTick.enqueue'));
                }
            })(
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
            (function makeBind(make, box) {
                return function bind(enqueue) {
                    return make(box, enqueue);
                }
            })(
                (function bind(ffx, ffy) {
                    // Monad //
                    return function bind(x, f) {
                        return function $_pure(succ, fail) {
                            return ffx(x, f, ffy(succ), fail);
                        }
                    };
                }),
                (function box(x, f, succ, fail) {
                    x(function (t) {
                        return f(t)(succ, fail);
                    }, fail);
                })
            ),
            (function makeArray(ext) {
                Array.prototype.collect = function() {
                    return ext.collect(this);
                };
                Array.prototype.ap = function(f, g, h) {
                    return ext.ap(f, g, h, this);
                };
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
                Array.prototype.fold = function(f, r) {
                    var result = r || [];
                    return this.bind(function(value) {
                        f(result, value);
                        return value;
                    }).chain(function() {
                        return result;
                    });
                };
                Array.prototype.first = function(f) {
                    return this.chain(function(result) {
                        return ext.get(f || unit)(result.at(0));
                    });
                };
                Array.prototype.last = function(f) {
                    return this.chain(function(result) {
                        return ext.get(f || unit)(result.at(result.length - 1));
                    });
                };
                Array.prototype.select = ext.select;
                Array.prototype.combine = ext.combine;
                Array.prototype.flatmap = ext.flatmap;
                Array.prototype.flatten = ext.flatmap;
                Array.prototype.bind = ext.bind;
                Array.prototype.run = function(succ, fail) {
                    return ext.collect(this)(succ || unit, fail);
                };
                Array.prototype.tap = function(f) {
                    return this.bind(ext.tap(f));
                };
                Array.prototype.log = function(succ, fail) {
                    return this.flatmap(ext.tap(console.log.bind(console))).run();
                };
                Array.prototype.next = ext.next;
            }),
            (function makeSys(make) {
                return function(root) {
                    return make.call(this, root, root.get('model.pure')(unit));
                }
            })(
                (function makeSys(root, model) {
                    this.get = function() {
                        return root.get([].slice.call(arguments).join('.'));
                    };
                    this.type = function(name) {
                        var type = model.types.get(name);
                        if (type && type.isType && !type.done && !type.pending && (type.pending = true)) return model.make(name);
                        else return type.klass;
                    };
                    this.inherit = function(/* name, parent, ext */) {
                        var args = [].slice.call(arguments), name, type = {};
                        if (args.length == 1) return model.make(args.shift());
                        else if (args.length > 1 && typeof args[0] == 'string') {
                            name = args.shift();
                        }
                        if (typeof args[args.length-1] == 'object') {
                            type = args.pop(); if (name) type.name = name;
                        }
                        if (args.length && typeof args[0] == 'string') type.parent = args.shift();
                        return model.make(type);
                    };
                    this.collect = function() {
                        return [].slice.call(arguments);
                    };
                    this.find = function(value) {
                        return root.find(value);
                    };
                    return this;
                })
            )
        )
    ),

// =======  ======= TYPE / KLASS SYSTEM =======  ====== //

    (function Types() {

        return [].slice.call(arguments).pure(0);
    })(
     // === Type-Klass === //
            (function(items) {
                return function(sys) {
                    var result = items.insert(2, sys).slice(1).apply();
                    if (result && result.type && result.type.init) {
                        return result.model.init(result.type, result, sys);
                    }
                    return result;
                }
            }),
            (function(sys) {
                var args = [].slice.call(arguments, 1);
                return args.at(0).call(sys, args.slice(1).reduce(function(r, x) {
                    var item = x && x instanceof Function ? x.call(sys) : x;
                    item.isType  = true;
                    r[item.name] = item;
                    return r;
                }, (sys.types = {})));
            }),
            (function() {

                return [].slice.call(arguments).pure(0, true);
            })(
                (function make(items) {
                    return function(types) {
                        return items.reduce(items.at(0), { model: {}, type: types.Store, types: types });
                    }
                }),
                (function makeKlass(r, v, i, a) {
                    var name = v.name.replace('$_', '');

                    if (v.name == '$_parseArgs') {
                        r.model['parseArgs'] = v(r.model.makeArgs, r.model.getArgs);
                    }else if (v.name.substr(0, 2) == '$_') {
                        r.model[name] = r.model.parseArgs(v, r.model);
                    }else {
                        r.model[name] = v;
                    }

                    if (name == 'named') {
                        r.type.klass = r.model[name](r.type.name);
                    }else if (v.name == 'inherit') {
                        r.proto = r.model[name](r.type);
                    }

                    return r;
                }),
                (function extend(target, source) {
                    var hasOwnProperty = Object.prototype.hasOwnProperty;
                    for (var propName in source) {
                        if (hasOwnProperty.call(source, propName)) {
                            target[propName] = source[propName];
                        }
                    }
                    return target;
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
                (function lift(fn, base) {
                    return (base || this).map(function(v1) {
                        return function(v2) {
                            return fn(v1, v2);
                        }
                    });
                }),
                (function lift2(fn, base) {
                    return function(monad1, monad2) {
                        return new base(monad1.bind(function(val1) {
                            return monad2.bind(function(val2) {
                                return fn(val1, val2);
                            });
                        }));
                    };
                }),
                (function $_makeID($_extend) {
                    return function makeID(options) {
                        var counter = $_extend({ cid: 1000000 }, options || {});
                        return function id() {
                            return (this._id = counter.cid++);
                        }
                    }
                }),
                (function is(value) {
                    return value && 
                        (value instanceof this.constructor || value instanceof this.__
                            || (value.deriving && value.deriving.indexOf(this.constructor) >= 0)) ? true : false;
                }),
                (function $super() {
                    if (this.__level__) this.__parent__[--this.__level__].ctor.apply(this, [].slice.call(arguments));
                    if (!this.__level__) this.__super__ = function(fn) { return this.__parent__[this.__parent__.length-1][fn].apply(this, [].slice.call(arguments, 1)); };
                }),
                (function $named(run) {
                    return function named(codeOrName) {
                        var code = codeOrName.toTypeCode(), name = codeOrName.toCamel();
                        return run(function($$__purejs) {
                            var script = document.createElement('script');
                            script.innerHTML = '$$__purejs.push(pure((function Make'+name+'() { return function '+name+'() { this.id(); this.ctor.apply(this, arguments); if (this.__level__ && !(this.__level__ = 0)) this.__super__.call(this); return this; }; })()))';
                            var headel = document.getElementsByTagName('head')[0];
                            headel.appendChild(script);
                            headel.removeChild(script);
                            return $$__purejs.pop()(unit);//self['$$__purejs'].pop();
                        });
                    }
                })(
                    (function() {
                        var val = $$__purejs = [];
                        return function tmp(fn) {
                            return fn($$__purejs);
                        }
                    })()
                ),
                (function ext(proto, items, names) {
                    if (!(items instanceof Array) && typeof items == 'object' && !names) {
                        return this.ext(proto, this.values(items), this.keys(items));
                    }

                    var model = this, nms = names && names instanceof Array ? names.slice(0) : [];
                    return (!items || !items.reduce ? (items = []) : items).reduce(function(prto, fn, idx) {
                        var name, item;

                        if (typeof fn == 'object') {
                            name = fn.name; item = fn.fn || fn;
                        }else {
                            item = fn;
                            name = item.name;
                        }
                        if ((name || (name = item.name))) {
                            if (name.substr(0, 2) == '$_') {
                                prto[name.replace('$_', '')] = model.parseArgs(item, prto);
                            }else {
                                prto[name] = item;
                            }
                        }else if (nms.length && idx < nms.length) {
                            prto[nms[idx]] = item;
                        }
                        return prto;
                    }, proto);
                }),
                (function $inherit() {
                    var type = {};
                    var args = [].slice.call(arguments), name, parent, ext, ctor;
                    if (typeof args[0] == 'string') name = args.shift();
                    else if (typeof args[0] == 'object') type = args.shift();
                    if (typeof args[0] == 'string') parent = args.shift();
                    if (args.length && typeof args[0] == 'object')  type = args.shift();
                    return { name: name || type.name, ctor: ctor || parent.ctor, parent: parent || type.parent, ext: ext || type.ext };
                }),
                (function ctor() {
                    if (this.__level__) this.__super__.apply(this, [].slice.call(arguments));
                }),
                (function proto(parent) {
                    if (parent) {
                        var F = function() {};
                        F.prototype = parent.prototype;
                        var proto = new F();
                        proto.__parent__ = proto.__parent__.slice(0);
                        proto.__level__  = proto.__parent__.push(F.prototype);
                        proto.__super__  = this.$super;
                    }else {
                        var proto = {
                            __parent__: [], __level__: 0, __model__: this,
                        }
                    }
                    return proto;
                }),
                (function init(type, klass) {
                    if (!type.done && (type.done = true)) {
                        return type.init(this, type, klass);
                    }
                    return type;
                }),
                (function of(x) {
                    return new this(x);
                }),
                (function loadext(ext) {
                    return ext instanceof Function ? ext.call(this) : ext;
                }),
                (function call(f) {
                    return function() {
                        return f(this);
                    }
                }),
                (function inherit(type, parent) {
                    var klass  = type.klass || this.named(type.name);
                    klass.parent = parent || type.parent;

                    var proto  = this.ext(this.proto(klass.parent), this.loadext(type.ext), type.names);
                    var attrs  = this.ext(klass, type.attrs || []);

                    if (type.deriving) proto.deriving = type.deriving; 
                    if (!proto.pure) proto.pure = this.call(pure);
                    if (proto.from && !klass.from) klass.from = proto.from;
                    if (!klass.of) klass.of = type.of || (type.parent && type.parent.of ? type.parent.of : this.of);

                    proto.constructor = klass; proto.ctor = type.ctor;
                    klass.prototype = proto;
                    if (!klass.prototype.__) klass.prototype.__ = klass;
                    if (!klass.prototype.is) klass.prototype.is = this.is;
                    if (!klass.prototype.id) klass.prototype.id = this.makeID();
                    return klass;
                }),
                (function makeKlass(type) {
                    var superr = type.super;
                    var parent = superr ? this.find('ctor', type.ctor) : null;
                    return this.inherit(type, parent);
                }),
                (function curry(fn, bound, numArgs, countAllCalls) {
                    if (((numArgs = numArgs || fn.length) < 2)) return fn;
                    else if (!bound && this != self) bound = this;

                    var countAll = countAllCalls !== false;
                    return function f(args) {
                        return function $_curry() {
                            var argss = [].slice.apply(arguments);
                            if (countAll && !argss.length) argss.push(undefined);
                            if ((args.length + argss.length) === numArgs) {
                                return fn.apply(bound, args.concat(argss));
                            }else {
                                return f(args.concat(argss));
                            }
                        }
                    }([]);
                }),
                (function(nativeKeys, nativeHas) {
                    return function keys(obj) {
                        if (typeof obj != 'object') return [];
                        if (obj instanceof Array) return obj.map(function(v, i) {
                            return v && v.name ? v.name : i;
                        });
                        else if (obj.constructor == Object) return nativeKeys(obj);
                        else if (obj.keys && obj.keys instanceof Function) return obj.keys();
                        else if (nativeKeys) return nativeKeys(obj);
                        var keys = [];
                        for (var key in obj) if (nativeHas.call(obj, key)) keys.push(key);
                        if (hasEnumBug) collectNonEnumProps(obj, keys); // Ahem, IE < 9.
                        return keys;
                    };
                })(Object.keys, Object.hasOwnProperty),
                (function $_values($_keys) {
                    return function values(obj, fn) {
                        var kys = $_keys(obj),
                        vals = [], useget = obj.get && obj.get instanceof Function,
                        func = fn || unit, usekeys = obj instanceof Array ? false : true;
                        for (var i = 0; i < kys.length; i++) {
                            vals.push(func(useget ? obj.get([kys[i]]) : (usekeys ? obj[kys[i]] : obj[i]), usekeys ? kys[i] : i));
                        };
                        return vals;
                    }
                }),
                (function $_length($_keys) {
                    return function length(item) {
                        return item.length ?
                            (item.length instanceof Function ? item.length() : item.length)
                                : (typeof item == 'object' ? $_keys(item) : 0);
                    }
                }),
                (function $_object($_length, $_keys, $_values) {
                    return function obj(map, base) {
                        return function(values) {
                            var result = base || {}, keys;
                            if (!values && !this.document) values = this;
                            if (!values && map instanceof Array) {
                                values = $_values(map); keys = $_keys(map);
                            }else {
                                keys = map || $_keys(values);
                            }
                            for (var i = 0, len = $_length(keys); i < len; i++) {
                                if (!keys[i] && !values) continue;
                                else if (values) result[keys[i]] = values[i];
                                else result[keys[i][0]] = keys[i][1];
                            }
                            return result;
                        };
                    };
                }),
                (function $_parse($_keys, $_values) {
                    function run(node, data, recur, ctor) {
                        var keyss = $_keys(data), valss = $_values(data), value, key;
                        while (keyss.length) {
                            value = valss.shift(), key = keyss.shift();
                            if (recur && typeof value == 'object' && key != 'args') {
                                if (value instanceof Array && key == node._children) {
                                    var items = node.node(key);
                                    value.map(function(v) {
                                        return items.child(v, ctor || node.constructor);
                                    });
                                }else if (node.is(value)) {
                                    node.set(value.cid(), value);                                   
                                }else {
                                    run(node.child(key, ctor), value, typeof recur == 'number' ? (recur - 1) : recur, ctor);
                                }
                            }else if (typeof key == 'number' && value instanceof Array && value.length == 2 && typeof value[0] == 'string') {
                                node.set(value[0], value[1]);
                            }else {
                                node.set(key, value);
                            }
                        }
                        return node;
                    };
                    return function() {
                        var args = [].slice.call(arguments);
                        if (args.length < 3 && args[args.length-1] instanceof Function) {
                            return run(this, args.shift(), false, args.pop());
                        }else {
                            args.unshift(this);
                            return run.apply(undefined, args);
                        }
                    };
                }),
                (function objPath(name, target, value) {
                    var parts = name.split('.');
                    var curr  = target || self;
                    for (var part; parts.length && (part = parts.shift());) {
                        if (!parts.length && value !== undefined) {
                            curr[part] = value;
                        } else if (part in curr) {
                            curr = curr[part];
                        } else if (parts.length && value !== undefined) {
                            curr = curr[part] = {};
                        } else {
                            curr = null;
                            break;
                        }
                    }
                    return curr;
                }),
                (function $_assign($_objPath) {
                    return function assign(obj) {
                        obj || (obj = {});
                        return function(val, key) {
                            if (val == '*' && key == '*') return obj;
                            else if (key && val) objPath(key, obj, val);
                            else if (val) obj = val;
                            return obj;
                        };
                    }
                }),
                (function $_select($_assign, $_keys) {
                    return function select(obj) {
                        return function select() {
                            var test  = Array.prototype.slice.call(arguments),
                            args  = test.length == 1 && test[0] instanceof Array ? test.shift() : test,
                            cont  = args.length && args[args.length-1] instanceof Function || args[args.length-1] === true ? args.pop() : false,
                            keyss = args.length == 0 ? keys(obj) : args.slice(0),
                            base  = args.length && typeof args[0] == 'object' && args[0].constructor == Object ? args.shift() : {},
                            coll  = cont ? [] : assign(base);
                            keyss.forEach(function(arg) {
                                var item = arg.split(' as ');
                                var path = item.shift();
                                var key  = item.length ? item : path.split('.'), part;
                                while (key.length && (part = key[key.length-1].substr(0, 1))) {
                                if (part == '*' || part == '!') key.pop();
                                else break;
                                }
                                if (key[0] == 'root' && key.shift()) path = key.slice(1).join('.');
                                if (cont) coll.push(obj.get ? obj.get(path) : obj[path]);
                                    else coll(obj.get ? obj.get(path) : obj[path], key.join('.'));
                            });
                            return cont ? (cont === true ? coll : cont.apply(undefined, coll)) : coll();
                        }
                    }
                }),
                (function ctor() {
                    return this.__super__.apply(this, [].slice.call(arguments));
                }),
                (function type(/* variable args */) {
                    var args = [].slice.call(arguments), name, type;
                    if (args.length && typeof args[0] == 'object') {
                        type = args.shift(); name = type.name;
                    }else {
                        name = args.shift();
                        type = this.types.get(name) || { name: name };
                    }
                    if (!type.super) {
                        if ((type.super = type.parent || this.types.get('parents', name))) {
                            type.parent = this.types.get('ctor', type.super)
                                || this.make(type.super);
                        }
                    }
                    if (!type.ctor)   type.ctor = this.types.get('ctor', name) || this.ctor;
                    if (!type.ext)    type.ext  = this.types.get('ext', name);
                    if (this.types.get('attrs', name)) type.attrs = this.types.get('attrs', name);
                    if (!type.klass)  type.klass = this.named(name);
                    if (type.klass && type.klass.prototype && !type.klass.prototype.ctor)
                        type.klass.prototype.ctor = type.ctor || this.ctor;

                    if (type.deriving) {
                        var model = this;
                        type.deriving = type.deriving.map(function(deriv) {
                            return model.types.get('ctor', deriv)
                                    || model.make(deriv)
                        });
                    }
                    return type;
                }),
                (function walk(klass) {
                    return function(fn) {
                        var test   = klass.prototype,
                            parent = klass.prototype.__parent__,
                            level  = klass.prototype.__level__;
                        while (test && level--) {
                            if (test.constructor[fn]) break;
                            else test = parent[level];
                        }
                        return test ? test.constructor[fn] : null;
                    }
                }),
                (function property(fn) {
                    return function() {
                      var args = Array.prototype.slice.call(arguments);
                      return function(obj) {
                        return !obj || !fn ? null :
                          (fn instanceof Function ? fn.apply(obj, args) :
                            (obj && obj[fn] && obj[fn].apply ? obj[fn].apply(obj, args) : null));
                      };
                    };
                }),
                (function target(obj) {
                    return function(fn) {
                      return function() {
                        var args = Array.prototype.slice.call(arguments);
                        return !obj ? null : (!fn ? obj :
                          (fn instanceof Function ? fn.apply(obj, args) :
                            (obj && obj[fn] && obj[fn].apply ? obj[fn].apply(obj, args) : null)));
                      };
                    };
                }),
                (function extender(model, parent) {
                    return function() {
                        var args = [].slice.call(arguments);
                        if (args[0] instanceof Function) {
                            var type = {
                                name: args[0].name, klass: args.shift(),
                                ext: typeof args[0] == 'object' ? args.shift() : [],
                            };
                        }else {
                            var type = {
                                name: args.shift()
                            };
                        }
                        type.super  = parent ? parent.name : 'Inst';
                        if (parent.klass) type.parent = parent.klass;
                        else if (parent instanceof Function) type.parent = parent;
                        else type.parent = parent.name || parent;

                        return model.make(type);
                    }
                }),
                (function is(ctor) {
                  return function(instance) {
                    return instance && instance instanceof ctor ? true : false;
                  }
                }),
                (function make(args) {
                    var model = this, name = typeof args == 'string' ? args : args.name;
                    var types = sys.get('types');
                    var exist = types.get('ctor', name);
                    if (exist && exist.name && exist.name == name) return exist;

                    var type  = this.type(args);
                    var klass = this.inherit(type);
                    var ctor  = this.types.get('ctor').set(name, klass);

                    var walk  = this.walk(klass);
                    if (!klass.of)   klass.of   = walk('of') || klass.prototype.of;
                    if (!klass.pure) klass.pure = walk('pure');
                    if (type.init && !type.done) type.init.call(this, type, klass);
                    if (!klass.is)   klass.is   = walk('is') || this.is(klass);
                    if (!klass.inherit) klass.inherit = this.inherit;
                    if (!klass.extend)  klass.extend  = this.extender(this, type);
                    return klass;
                })
            ),
     // === Store === //
            (function() {
                return {
                    name: 'Store',
                    ctor: function Store(opts) {
                        this.store.call(this, opts || {});
                    },
                    ext: [
                        (function store(opts) {
                            opts || (opts = {});
                            typeof opts == 'object' || (opts = { name: opts });
                            this._opts  = { enabled: {}, disabled: {} };
                            this._cid   = '' + (opts.name || opts.id || opts.cid || this._id);
                            this._val   = [];
                            this._val._store = this;
                            this._map   = {};
                            this._ids   = [];
                            this._cache = {};

                            if (opts.parent) {
                                this._parent = opts.parent;
                                this._level  = (this._parent._level  || (this._parent._level  = 0)) + 1;
                                this._offset = (this._parent._offset || (this._parent._offset = 0)) + (opts.offset || 0);
                            }else {
                                this._level  = 0;
                                this._offset = opts.offset || 0;
                            }
                        }),
                        (function extend(ctor, ext, attrs) {
                            return this.constructor.extend(ctor, ext, attrs);
                        }),
                        (function uid() {
                            return this._id;
                        }),
                        (function nid() {
                            return ''+this._id;
                        }),
                        (function cid() {
                            return ''+(this._cid || this._id);
                        }),
                        (function isNode(value) {
                            return value && value instanceof this.__ ? true : false;
                        }),
                        (function parent(key) {
                            return this._parent ? this._parent.get(key) : null;
                        }),
                        (function ensure(path, ctor) {
                            var node = this, next = node, item, index = 0,
                            parts = path instanceof Array ? path.slice(0) : path.split('.');
                            while(index < parts.length && (item = parts[index++])) {
                                if (false && item == node._cid) continue;
                                else if (!(next = node.get(item)))
                                next = ((ctor && ctor === true) || (!ctor && node._children)) ? node.node(item) : node.child(item, ctor);
                                node = next;
                            }
                            return node;
                        }),
                        (function walk(run) {
                            return function walk(key, callback) {
                                var parts = typeof key == 'string' ? key.split('.') : key.slice(0);
                                return run(parts, callback)(this);
                            }
                        })(
                            (function walk(parts, callback) {
                                return function next(node) {
                                    var key = parts.shift();
                                    var val = node.get(key);
                                    if (val) {
                                        if (callback(val, key, node)) {
                                            return val;
                                        }else {
                                            return val && node.is(val) && parts.length ? next(val) : null;
                                        }
                                    };
                                }
                            })
                        ),
                        (function lookup(key, orElse) {
                            return this.maybe(
                              key ? (this.get(key)||(orElse && orElse instanceof Function ? orElse(this) : orElse)) : orElse
                            );
                        }),
                        (function identifier() {
                            function calcOnce(node) {
                                var path = [], parent = node;
                                while ((parent = parent._parent)) {
                                    path.unshift(parent._cid);
                                };
                                path.push(node._cid);
                                if (node._cache) return (node._cache.identifier = path.slice(node._offset));
                                return path.slice(node._offset);
                            };
                            return function identifier(asArray, reCalc) {
                                var path = this._cache && this._cache.identifier && !reCalc ? this._cache.identifier : calcOnce(this);
                                return asArray === true ? path : path.join(typeof asArray == 'string' ? asArray : '.');
                            };
                        })(),
                        (function of(opts, ctor) {
                            return this.storage.child(this, opts, ctor);
                        }),
                        (function extract(item) {
                            return item ? (item.name || item._cid || item._id || item._uid
                                    || (typeof item == 'string' ? item
                                        : (item.id instanceof Function ? item.id() : this.id()))) : this.id();
                        }),
                        (function emit() {
                            // NOOP //
                        }),
                        (function exists(options) {
                            var opts = options ? (typeof options == 'string' ? { name: options } : options) : {},
                            id = opts.name = opts.name || opts.id || opts.cid,
                            exists = id ? this.get(id) : false;
                            if (exists && this.is(exists)) return exists;
                            return false;
                        }),
                        (function add(name, ctor) {
                            var id = this.extract(name);
                            return this.get(id) || this.set(id, this.of(name));
                        }),
                        (function child(name) {
                            var id = this.extract(name);
                            return this.get(id) || this.set(id, this.of(name));
                        }),
                        (function instance(opts, ctor, parent) {
                            ctor || (ctor = this.constructor);
                            var options = typeof opts == 'object' ? opts : { name: opts, parent: parent };
                            options.parent || (options.parent = this);
                            return new ctor(options);
                        }),
                        (function child(opts, ctor, parent) {
                            parent || (parent = this);
                            var exists = parent.exists(opts);
                            if (exists) return exists;
                            ctor || (ctor = this.constructor);
                            var options  = typeof opts == 'object' ? opts : { name: opts, parent: parent };
                            options.parent || (options.parent = this);
                            var instance = this.of(options, ctor);
                            return parent.set(instance._cid, instance);
                        }),
                        (function node(opts) {
                          return this.child(opts, this.__, this);
                        }),
                        (function length() {
                            return this._val.length;
                        }),
                        (function at(index) {
                            return index < this._val.length ? this._val[index] : null;
                        }),
                        (function closest(key) {
                            var node = this;
                            while (node) {
                                if (key instanceof Function && key(node)) break;
                                else if (node.is(key)) break;
                                else node = node.parent();
                            }
                            return node;
                        }),
                        (function pertains(value) {
                            if (!value) {
                                return false;
                            }else if (this.is(value)) {
                                return this.equals(value.closest(this));
                            }else if (value) {
                                return this.pertains(this.find(value));
                            }else {
                                return false;
                            }
                        }),
                        (function equals(value) {
                            return value && this.is(value) && this.uid() === value.uid() ? true : false;
                        }),
                        (function find(value) {
                            if (this.is(value)) {
                                return this.storage.index(this.storage.meta(value.nid()).cid());
                            }else if (typeof value == 'string' || (typeof value == 'number' && (value = ''+value))) {
                                return this.storage.index(value) || this.storage.index(this.storage.meta(value).cid());
                            }else if (typeof value == 'object') {
                                return this.storage.index(''+(value.uid || value._cid || value._uid || value._id));
                            }
                        }),
                        (function get(key) {
                            if (arguments.length > 1) return this.path([].slice.call(arguments));
                            else if (key && typeof key == 'string' && (this._map[key]>=0)) return this._val[this._map[key]];
                            //else if (key && typeof key == 'string' && key.substr(0, 1) == '*') return this.values(key.substr(-1, 1) == '!' ? true : (key.length - 1));
                            else if (key && typeof key == 'number') return key >= 0 && key < this._val.length ? this._val[key] : undefined;
                            else if (key && key.indexOf && key.indexOf('.') > 0) return this.path(key);
                            else if (key && key instanceof Array) return key.length > 1 ? this.path(key) : this.get(key.slice(0).shift())
                            else return key ? undefined : (this._ref || this);
                        }),
                        (function keys(index) {
                            return typeof index == 'number' ? this._ids[index] : this._ids;
                        }),
                        (function vals() {
                            return this._val;
                        }),
                        (function __get(key) {
                            return this.get(key);
                        }),
                        (function set(key, value) {
                            return key && key.indexOf && key.indexOf('.') > 0 ? this.path(key, value)
                            : (this._val[(this._map[key] >= 0
                                && !this.emit('change', key, 'update', value) ? this._map[key]
                            : (
                                this._map[this.emit('change', key, 'create', value)||key] = this._ids.push(key)-1))] = value);
                        }),
                        (function __set(key, value) {
                            return this.set(key, value);
                        }),
                        (function acc(key, value) {
                            return value ? this.set(key, value) : this.get(key);
                        }),
                        (function val(key, value, asArray) {
                            if (!key && typeof key != 'string') {
                                return this;
                            }else if (typeof value != 'undefined') {
                                if (this._map[key] >= 0) return this.set(key, value);
                                else return this.insert(key, val);
                            }else if (key && value && typeof value == 'undefined') {
                                return this._val[(this._map[this._ids[(this._ids.push(key)-1)]] = this._val.push(asArray ? [ value ] : value) - 1)];
                            }else {
                                return key ? this._val[this._map[key]] : this;
                            }
                        }),
                        (function enabled(option, flag) {
                            if (typeof flag != 'undefined') this._opts.enabled[option] = flag;
                            return this._opts.enabled && this._opts.enabled[option] ? true : false;
                        }),
                        (function disabled(option, flag) {
                            if (typeof flag != 'undefined') this._opts.disabled[option] = flag;
                            return this._opts.disabled && this._opts.disabled[option] ? true : false;
                        }),
                        (function emit(/* name, key, type, value */) {
                            if (this.isEvents || (this._ref && this._ref.isEvents)) {

                            }else if (this.disabled('events')) {

                            }else if (this.events && this.events.emit) {
                                this.events.emit(this, [].slice.call(arguments));
                            }
                        }),
                        (function level(offset) {
                            return this._level - (offset ? (offset._level || this._offset) : this._offset);
                        }),
                        (function insert(id, val, asArray) {
                            var node = this,
                            curridx = node._map[id],
                            currval = node._val[curridx],
                            isArr = currval instanceof Array,
                            index = 0;
                            if (asArray && id && typeof val == 'undefined') {
                                return node._val.push(val);
                            }else if (node._map[id] >= 0) {
                                if (asArray && currval.isNode) {
                                    node.emit('change', id, 'push', currval);
                                    return currval.push(id, val);
                                }else if (asArray && !isArr) {
                                    currval = (node._val[node._map[id]] = [ currval ]); isArr = true;
                                }
                                if (isArr) {
                                    if (currval.length && (index = currval.indexOf(val)) >= 0) return index;
                                    index = val instanceof Array ? currval.push.apply(currval, val) : currval.push(val);
                                    node.emit('change', id, 'push', currval);//asArray ? [ val ] : val);
                                    return index;
                                }
                            }else {
                                var newval = node._val[(node._map[node._ids[(node._ids.push(id)-1)]] = node._val.push(!asArray || val instanceof Array ? val : [ val ]) - 1)];
                                node.emit('change', id, 'create', asArray ? newval.slice(-1) : newval);
                                return newval;
                            }
                        }),
                        (function push(key, value, asArray) {
                            if (key && key.indexOf && key.indexOf('.') > 0) {
                                var parts = key.split('.'), node = this.path(parts, value, asArray);
                                if (typeof node == 'number') return node;
                                else return this.insert(parts.join('.'), value, asArray);
                            }else {
                                return this.insert(key, value, asArray);
                            }
                        }),
                        (function splice(key, idx, num) {
                            var index, pos = 0, prop, value, node;
                            if ((index = this._map[key]) >= 0) {
                                prop = this._val[index];
                                if (prop instanceof Array && prop.length) {
                                    num || (num = typeof idx == 'undefined' ? prop.length : 1);
                                    value = prop.splice(idx || 0, num);
                                    this.emit('change', key, 'remove', num == 1 ? value[0] : value);
                                    return value;
                                }
                            }else if ((prop = this.get(key))) {
                                var node = this.get(key.substr(0, ((pos = (key+'.').indexOf('.')))));
                                if (node) return node.splice(key.slice(pos+1), idx, num);
                            }else {
                                return this.set(key, []);
                            }
                        }),
                        (function pop(key, idx, num) {
                            return this.splice(key, idx || (this.get(key) || []).length, num || 1);
                        }),
                        (function shift(key, num) {
                            return this.splice(key, 0, num || 1);
                        }),
                        (function values(recur) {
                            var node = this;
                            return node._val.reduce(function(result, value, index) {
                                result[node._ids[index]] = recur && node.is(value)
                                    ? value.values(typeof recur == 'number' ? (recur - 1) : recur) : value;
                                return result;
                            }, {});
                        }),
                        (function fn(key) {
                            var node;
                            if (key && key.indexOf && key.indexOf('.')>0) {
                                node = this.get(key.split('.').slice(0, -1));
                            }else {
                                node = this;
                            }
                            return node[key] && node[key] instanceof Function
                                && (node.constructor.prototype[key] instanceof Function)
                                    ? node[key].bind(node) : null;
                        }),
                        (function bind(f) {
                            return Array.of(this).bind(function(s) {
                                return s._val || [];
                            }).bind(function(v, i, o) {
                                var s = o._store;
                                f(v, s ? s.keys(i) : v.name, i, s || o);
                                return s && s.is(v) ? v.bind(f).collect() : v;
                            });
                        }),
                        (function info() {
                            return sys.get().bind(function(x, k, i, o) {
                              console.log([ o && o.isNode ? o.identifier() : '', k, x, i ]);
                              return x._val || [];
                            }).bind(unit);
                        }),
                        (function path(full, quick) {
                            return function path(key, value, asArray) {
                                return quick(full, this, key, value, asArray);
                            };
                        })(
                            (function full(node) {
                                return function(path, value) {
                                  var org  = path.slice(0),
                                      pos  = path.indexOf('.'), key, sub,
                                      test = node, nref = test, fn = false;
                                  while(pos>0 && nref && node.is(nref)) {
                                    key = path.substr(0, pos);
                                    if (key.substr(0, 1) == '_' && nref[key]) {
                                      key = nref[key];
                                    }else if (key.substr(0, 1) == '%') {
                                      key  = key.substr(1);
                                      path = path.substr(1);
                                      if (key.substr(-1) == '%') {
                                        sub  = nref.get(key.substr(-1));
                                        key  = sub || key;
                                      }else {
                                        sub  = path.substr(0, path.indexOf('%'));
                                        path = path.substr(sub.length);
                                        key  = nref.get(sub) || key;
                                      }
                                    }
                                    if (key == 'root') {
                                      nref = test = node.root;
                                    }else if (key == 'parent' && nref._parent) {
                                      nref = test = nref.parent();
                                    }else if (key == 'fn') {
                                      fn = key;
                                    }else if (fn && nref[fn] && (fn = nref.fn(fn))) {
                                      var result = fn(key);
                                      if (!result || !(result instanceof Function)) return result;
                                      else if (path.substr(-2) == '()') return result();
                                      else if (path.length > key.length) return result(path.slice(pos+1));
                                      return result;
                                    }else if ((test = nref.get(key))) {
                                      if (node.is(test)) nref = test;
                                    }
                                    path = path.slice(pos+1);
                                    if (path.length) {
                                      pos = path.indexOf('.');
                                      if (nref && nref.role && nref.role('store').index(path) >= 0) break;
                                      else if (test && !node.is(test) && typeof test == 'object' && (test = test[path.substr(0, pos)]) && node.is(test)) {
                                        nref = test; path = path.slice(pos+1); pos = path.indexOf('.'); continue;
                                      }else if (test && node.is(test) && test.get(path)) break;
                                    }else {
                                      break;
                                    }
                                  }
                                  if (fn && nref[fn] && (fn = nref.fn(fn))) {
                                    if (path.substr(-2) == '()') {
                                      var result = fn(path.replace('()', ''));
                                      if (result && result instanceof Function) return result();
                                    }else {
                                      return fn(path);
                                    }
                                  }else if (false && pos < 0 && nref && nref._cid == path && typeof value == 'undefined') {
                                    return nref;
                                  }else {
                                    return typeof value == 'undefined' ? nref.get(path) : nref.update(path, value, node, org);
                                  }
                                }
                            }),
                            (function quick(full, node, key, value, asArray) {
                                var parts = typeof key == 'string' ? key.split('.') : key.slice(0), part, test;
                                while (parts.length > 1 && (part = parts[0])) {
                                  if (part == 'root' && parts.shift()) {
                                    test = node.root;
                                  }else if (part == 'fn' && parts.length > 1 && node[parts[1]]) {//node[!node.has(part)) {
                                    return full(node)(parts.join('.'), value);
                                  }else if (part == 'parent' && node._parent && parts.shift()) {
                                    test = node.parent();
                                  }else if (part == '*') {
                                    return node.get(parts.splice(0).join(''));
                                  }else if ((parseInt(part)+'') === part) {
                                    test = node.at(parseInt(parts.shift()));
                                  }else {
                                    test = node.get(parts.shift());
                                  }
                                  if (test && node.is(test)) node = test;
                                  else break;
                                };
                                if (parts.length > 1) return;
                                else part = parts.shift();
                                return test ? (node.is(test) ? test.acc(part, value) : test[part]) : undefined;
                            })
                        ),
                        (function meta(key) {
                            var meta = this.storage.meta(this.nid());
                            return key ? meta.get(key) : meta;
                        }),
                        (function index(key) {
                            var idx = this.storage.index(this.meta().nid());
                            return key ? idx.get(key) : idx;
                        }),
                        (function addEventListener(/* instance, name, selector, target */) {
                            // this, instance, name, selector, target
                            return this.events.addEventListener.apply(this.events, [ this ].concat([].slice.call(arguments)));
                        }),
                        (function removeEventListener(/* instance, name, selector, target */) {
                            return this.events.removeEventListener.apply(this.events, [ this ].concat([].slice.call(arguments)));
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
                    init: function(model, type, sys) {
                        var store = type.klass;
                        var index = store.prototype.index  = model.inherit(sys.types.Index, store);
                        store.prototype.parse  = model.parse;
                        store.prototype.select = model.select;
                        var storage  = model.inherit(sys.types.Storage, store);   
                        storage.prototype.node = store;
                        storage.prototype.makeID = index.prototype.makeID = model.makeID;
                        store.extend = model.extender(model, type);
                        var root     = store.prototype.root = storage.prototype.root = new store('root');                 
                        store.prototype.storage = new storage('storage');

                        var types = model.types = root.child('types').parse(sys.types);
                        var ctor  = types.child('ctor').set(store.name, store);

                        var mdl = root.child('model');
                        mdl.set('make', model.target(model)('make'));
                        mdl.set('pure', pure(model));

                        var select = [ 'lift', 'lift2', 'call', 'curry', 'values', 'keys', 'assign', 'property', 'target', 'select', 'object', 'extend', 'length' ];
                        var utils  = root.child('utils');
                        utils.set('pure', pure); utils.set('$const', $const);
                        utils.parse(model.keys(model).reduce(function(result, key, index) {
                            if (select.indexOf(key) >= 0) result[key] = model[key];
                            return result;
                        }, {}));
                        root.child('scheduler');
                        root.child('components');
                        root.child('stream');
                        return (sys.root = root);
                    }
                };
            })(),
     // === Index === //
            (function() {
                return {
                    name: 'Index',
                    parent: 'Store',
                    ctor: function Index(opts) {
                        this.store(opts); opts || (opts = {});
                        this._unqid = this.initUniqueID(1000000);
                        this._uid   = this._unqid.uid;
                        this._ref   = [];
                        this._val   = this._ref[(this._ref.push(this.locate(this._uid))-1)];
                        this.add(typeof opts == 'string' ? opts
                            : (''+(opts.name || opts._cid || opts._uid
                                || opts._id || (opts && opts.parent ? opts.parent.name : ''))));
                        if (opts.parent) this._parent = opts.parent;
                        return this;
                    },
                    deriving: [ 'Store' ],
                    ext: [
                        (function initUniqueID(base) {
                            var counter  = { uid: base, cid: base, count: 0, pos: [ 0, 0, 0 ] };
                            counter.next = this.makeID(counter);
                            counter.base = this.base = base;
                            return counter;
                        }),
                        (function base(base) {
                            return { base: base, prefix: 65, uid: base, blocksize: base / 100, cid: 0, count: 0, values: [] };
                        }),
                        (function init(base) {
                            return this.make.call(this.base(base || 1000000));
                        }),
                        (function pos(nid) {
                            return [ Math.floor(nid/1000), Math.floor(nid/100), Math.floor(nid/10) ];
                        }),
                        (function val(nid) {
                            return this._val[Math.floor(nid/1000)][Math.floor((nid%1000)/100)][Math.floor((nid%100)/10)];
                        }),
                        (function locate(nid) {
                            var uid = nid - this.base;
                            var idx = 0, lvl = 0, div = 1000, val = this._ref;
                            while (++idx < 4) {
                                lvl = uid < div ? 0 : ((uid - uid%div) / div);
                                uid = uid - (div * lvl); div = div / 10;
                                while (val.length <= lvl) { val.push([]); }
                                val = val[lvl];
                            }
                            return this._ref[(this._ref.push(this._val = val)-1)];
                        }),
                        (function push(val, item) {
                            item._uid = this._uid - 1;
                            return val[val.push(item)-1];
                        }),
                        (function add(item) {
                            if (this._uid%10==0) this._val = null;
                            this._uid++;
                            return this.push(this._val || (this._val = this.locate(this._uid)), item);
                        }),
                        (function make(opts, ctor) {
                            var str = this.extract(opts);
                            if (this.is(opts)) {
                                return this.add(opts);
                            }else if (ctor) {
                                return this.add(new ctor(opts));
                            }else {
                                return this.add(new this.node(opts));
                            }
                        }),
                        (function check(nid) {
                            return (!nid || nid < this._base || nid > this._uid) ? false : true;
                        }),
                        (function info() {
                            return { base: this._base, uid: this._uid };
                        }),
                        (function find(nid) {
                            if (!this.check(nid)) return;
                            //var val = this.locate(nid);
                            var val = this._val(nid - this._base);
                            return val[nid%10];
                        }),
                        (function first() {
                            return this._base;
                        }),
                        (function last() {
                            return this._uid;
                        })
                    ],
                    attrs: [
                        (function of(parent) {
                            return new this({ parent: parent });
                        })
                    ]
                };
            })(),
     // === Storage === //
            (function() {
                return {
                    name: 'Storage',
                    parent: 'Store',
                    ctor: function Storage(opts) {
                        this.store(opts);
                        this._index = this.set('index', this.index.of({ name: 'index', parent: this }));
                        this._meta  = this.set('meta',  this.of({ name: 'meta',  parent: this }));
                        return this;
                    },
                    deriving: [ 'Store' ],
                    ext: [
                        (function add(item) {
                            return this.push(this.create(item));
                        }),
                        (function create() {
                            return (this._store || (this._store = this._index.push(this.push(this))));
                        }),
                        (function of(opts) {
                            return this._index.make(new this.node(opts));
                        }),
                        (function meta(name, ctor) {
                            return this._meta.get(name)
                                || this._meta.set(name, this.create(name, ctor));
                        }),
                        (function create(name, ctor) {
                            var node = this.of({ name: name, parent: this._meta }, ctor);
                            node.set('parent', node.nid());
                            node.set('children', this.of({ name: 'children', parent: node }));
                            return node;
                        }),
                        (function child(parent, opts, ctor) {
                            var name = this.extract(opts)
                            var ref  = this.meta(name);
                            var add  = ref.get('children').set(name, ref.nid());

                            return ref.set(opts, parent.instance(opts, ctor));
                        })
                    ]
                };
            })(),
     // === Functor === //
            (function() {
                return {
                    name: 'Functor',
                    ctor: function ctor(mv) {
                        this.mv = mv;
                    },
                    ext: [
                        (function of() {
                            return this.constructor.of.apply(this.constructor, [].slice.call(arguments));
                        }),
                        (function lookup(item) {
                            return sys.of(sys.type(item || this.constructor.name));
                        }),
                        (function is(value) {
                            return typeof value == 'undefined' ? (this.constructor instanceof this.__ || this instanceof Functor) : (value instanceof this.__);
                        }),
                        (function map(f) {
                            return new this.constructor(this.mv.map ? this.mv.map(f) : f(this.mv));
                        }),
                        (function join() {
                            return this.mv;
                        }),
                        (function chain(f) {
                            return this.map(f).join();
                        })
                    ],
                    attrs: [
                        (function of(x) {
                            return new this(x);
                        }),
                        (function $of() {
                            var ctor = this;
                            return function() {
                                return ctor.of.apply(ctor, arguments);
                            }
                        }),
                        (function pure(x) {
                            return new this(x);
                        })
                    ]
                };
            })(),
     // === Compose === //
            (function() {
                return {
                    name: 'Compose',
                    parent: 'Functor',
                    ctor: function(x) {
                        if (x || typeof x != 'undefined') this.mv = x instanceof Function && x.length > 1 ? this.curry(x) : x;
                    },
                    ext: [
                        // COMPOSE
                        (function MakeCompose(wrap, make, just, next, prev) {
                            return make(just, next);
                        })(
                            (function wrap(compose) {
                                return function add(object) {
                                    compose.call(object);
                                    return object;
                                };
                            }),
                            (function make(just, next) { 
                                return function $fn(f) {
                                    return function $_compose(g) {
                                        return g ? (g.name == 'unit' ? just(f) : (f.name == 'unit' ? just(g) : next(f, g))) : just(f);
                                    };
                                };
                            }),
                            (function just(f) {
                                return function $_just(a) {
                                    return f(a);
                                }
                            }),
                            (function next(f, g) {
                                return function $_next(a) {
                                    return g(f(a));
                                };
                            }),
                            (function prev(f) {
                                return function(g) {
                                    return function $_prev(a) {
                                      return f(g(a));
                                    };
                                };
                            })
                        ),
                        (function map(g) {
                            return new this.constructor(this.$fn(this.mv)(g));
                        })
                    ],
                    attrs: [
                        (function of(x) {
                            return new this(x);
                        }),
                        (function $of() {
                            var ctor = this;
                            return function() {
                                return ctor.of.apply(ctor, arguments);
                            }
                        })
                    ]
                };
            })(),
     // === Maybe === //
            (function() {
                return {
                    name: 'Maybe',
                    parent: 'Functor',
                    ctor: function(x, a) {
                        if (x || typeof x != 'undefined')
                            this.mv = !a && x instanceof Function && x.length > 1 ? this.curry(x) : x;
                    },
                    ext: [
                        (function get(key) {
                            return this.map(this.property('get')(key));
                        }),
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
                            return this.mv === null || this.mv === undefined || this.mv === false;
                        }),
                        (function chain(mf) {
                            return this.isNothing() || !mf || !(mf instanceof Function) ? null : mf.call(this, this.mv);
                        }),
                        (function orElse(mv) {
                            return this.isNothing() ? new this.constructor(mv instanceof Function ? mv() : mv) : this;
                        }),
                        (function map(mf) {
                            return new this.constructor(this.chain(mf), true);
                        }),
                        (function run(f) {
                            if (this.mv.is() && this.mv.run) {
                                return this.mv.map(sys.of).run(f);
                            }else {
                                return this.chain(f || unit);
                            }
                        }),
                        (function ap(other) {
                            return this.is(other) ? other.map(this.mv) : this.of(other).map(this.mv);
                        }),
                        (function apply(other) {
                            return other.ap(this);
                        }),
                        (function unit() {
                            return this.mv;
                        }),
                        (function join() {
                            return this.mv;
                        }),
                        (function fn() {
                            return this.prop.apply(this, arguments);
                        }),
                        (function $fn() {
                            var ext  = this.constructor.fn(this.mv);
                            var args = Array.prototype.slice.call(arguments);
                            if (args.length) {
                              return ext.of(this.prop.apply(this, arguments).join());
                            }else {
                              return ext.of(null);
                            }
                        }),
                        (function $fn2(/* pre-value wrap */) {
                            var ext  = this.constructor.fn(this.mv);
                            var vars = Array.prototype.slice.call(arguments);
                            return function() {
                                var args = vars.concat([].slice.apply(arguments));
                                var inst = ext.of(args.length ? args.shift() : null);
                                if (args.length) {
                                    return inst.fn.apply(inst, args);                
                                }else {
                                    return inst;
                                }
                            }
                        })
                    ],
                    attrs: [
                        (function of(x) {
                            return new this(x);
                        }),
                        (function pure(x) {
                            return new this(x, true);
                        }),
                        (function $of() {
                            var ctor = this;
                            return function() {
                                return ctor.of.apply(ctor, arguments);
                            }
                        }),
                        (function fn(objfn) {
                          return function fn(obj) {
                            var model = this.prototype.__model__;
                            var clone = model.inherit(model.type({ name: this.name+'123', ext: [], parent: 'Maybe' }));
                            clone.prototype.$fn = objfn(obj);
                            clone.prototype.fn  = function() {
                                var args = Array.prototype.slice.call(arguments);
                                var prop = this.$fn(args.shift());
                                if (this.isNothing()) {
                                  return this.of(args.length ? prop.apply(undefined, args) : prop);
                                }else {
                                  return this.map(args.length ? prop.apply(undefined, args) : prop);
                                }
                            }
                            return clone;
                          };
                          return this;
                        })
                    ],
                    init: function(type, klass) {
                        klass.fn = klass.fn(this.target);
                        sys.of = sys.type('Store').prototype.maybe = klass.$of();
                        var model = sys.get('model.pure')(unit);
                        var property = klass.prototype.property = model.property;
                        klass.prototype.pget = property('get');
                        klass.prototype.pval = property('values');
                        klass.prototype.curry = model.curry;
                        return type;
                    }
                };
            })(),
     // === IO === //
            (function() {
                return {
                    name: 'IO',
                    parent: 'Functor',
                    ctor: function(f) {
                        this.unsafePerformIO = f;
                    },
                    ext: [
                        (function fn(f) {
                            return new this.constructor(f);
                        }),
                        (function of(x) {
                            return new this.constructor(function() {
                              return x;
                            });
                        }),
                        (function join() {
                            var thiz = this;
                            return this.fn(function() {
                              return thiz.unsafePerformIO().unsafePerformIO();
                            });
                        }),
                        (function bind(f) {
                            var thiz = this;
                            return this.fn(function(v) {
                              return f(thiz.unsafePerformIO()).run(v);
                            });
                        }),
                        (function run() {
                            return this.unsafePerformIO.apply(this, arguments);
                        }),
                        (function ap(monad) {
                            return monad.map(this.unsafePerformIO);
                        }),
                        (function map(f) {
                            var thiz = this;
                            return this.fn(function(v) {
                              return f(thiz.unsafePerformIO())(v);
                            });
                        }),
                        (function lift(f) {
                            return this.map(function(v) {
                              return f(v);
                            });
                        }),
                        (function pipe(f) {
                            return this.fn(this.$fn(this.unsafePerformIO)(f));
                        }),
                        (function() {
                            function run(IO) {
                                return (function(v) { return IO.run(v); });
                            };
                            return function wrap(fn) {
                                return this.$fn(run(this))(fn || IO.of);
                            };
                        })()
                    ],
                    attrs: [
                        (function of(x) {
                            return new this(function() {
                              return x;
                            });
                        }),
                        (function pure(x) {
                            return x instanceof Function ? new this(x) : this.of(x);
                        })
                    ]
                };
            })(),
     // === ContM === //
            (function() {
                return {
                    name: 'Cont',
                    parent: 'Compose',
                    ctor: function(x, f) {
                        if (x) this.mv = this.$cast(x);
                        if (f) this.mf = f;
                    },
                    ext: [
                        (function mf(t) {
                            return function pure(f) {
                                return f(t);
                            }
                        }),
                        (function $cast(v, p) {
                            if (v && v.isFunctor && v.cont) {
                                return v.cont();
                            }else {
                                return v && v instanceof Function && (p || v.name.substr(-4) == 'cont' || v.name.substr(-4) == 'pure' || v.name == 'mf') ? v : pure(v);
                            }
                        }),
                        (function $pure(f) {
                            return this.mf.name == this.constructor.prototype.mf.name ? f : this.$fn(this.mf)(f);
                        }),
                        (function cont() {
                            return this.__model__.walk(this.constructor)('cont')(this.mv, this.mf);
                            //return this.constructor.cont(this.mv, this.mf);
                        }),
                        (function $map(f) {
                            return function(v) {
                              return v && v.name == 'pure' && f.name != 'pure' && f.name != 'mf' ? v(f) : f(v);
                            }
                        }),
                        (function map(f) {
                            return new this.constructor(this.mv, this.$fn(this.$pure(this.$map(f)))(this.$cast));
                        }),
                        (function $bind(mv, mf) {
                            return new this.constructor(mv, this.$fn(mf)(this.$cast));
                        }),
                        (function bind(f) {
                            return this.$bind(this.cont(), f);
                        }),
                        (function chain(k) {
                            return this.cont()(k || unit);
                        }),
                        (function run(k) {
                            return this.chain(k);
                        }),
                        (function fmap() {
                            return this.bind(this.of.bind(this));
                        }),
                        (function ap(other) {
                            return this.map(function(result) {
                                return other.ap(other.is(result) ? result : other.of(result));
                            });
                        }),
                        (function apply(other) {
                            return other.ap(this);
                        }),
                        (function lift(m) {
                            return this.bind(function(result) {
                                return m.run(result);
                            });
                        })
                    ],
                    attrs: (function(cont, val, of, $of, is) {
                        return [
                            of,
                            $of,
                            cont,
                            is,
                            (function fromCallback(cb, mf) {
                                return this.of(mf ? cont(cb, mf) : val(cb));
                            })
                        ];
                    })(
                        (function cont(mv, mf) {
                            return function $cont(continuation) {
                                return mv(function(value) {
                                    return mf(value)(continuation);
                                })
                            }
                        }),
                        (function val(value) {
                            return function $cont(continuation) {
                                return continuation(value);
                            }
                        }),
                        (function of(x, f) {
                            return x instanceof this ? x : new this(x, f);
                        }),
                        (function $of() {
                            var ctor = this;
                            return function() {
                                return ctor.of.apply(ctor, arguments);
                            }
                        }),
                        (function is(value) {
                            return value && (value.name == '$cont' || value.name == '$_pure' || value.name == 'pure') ? true : false;
                        })
                    )
                };
            })(),
     // === Signal === //
            (function() {
                return {
                    name: 'Signal',
                    ctor: function Signal(ref) {
                        this._listener = ref;
                        this._handlers = [];
                    },
                    ext: [
                        (function make(info, handler) {
                            return {
                                sid: this.id(), run: handler, info: info
                            }
                        }),
                        (function get(key) {
                            return this._listener.parent(key);
                        }),
                        (function add(info, handler) {
                            return this._handlers[this._handlers.push(this.make(info, handler))-1];
                        }),
                        (function fold(f) {
                            return this._handlers.fold(f);
                        }),
                        (function run(value) {
                            this._handlers.slice(0).bind(function(hndl) {
                                return hndl.run(value);
                            }).run();
                        })
                    ],
                    attrs: [
                        (function of(identifier) {
                            return new this(identifier);
                        })
                    ]
                };
            })(),
     // === Queue === //
            (function() {
                return {
                    name: 'Queue',
                    parent: 'Store',
                    ctor: function Queue(opts) {
                        this.store.call(this, opts || {});
                        this.disabled('events', true);
                    },
                    ext: [
                        (function schedule() {
                            return (this.schedule = sys.get('scheduler.nextTick.enqueue'))(this);
                        }),
                        (function enqueue(item) {
                            if (this.push('queue', item) == 1) {
                                this.schedule(this);
                            }
                            return this;
                        }),
                        (function next() {
                            if (this.queue.length) {
                                this.get(this.queue[0].type).run(this.queue.shift());
                            }
                            return !this.queue.length;
                        }),
                        (function handler() {
                            this.queue = this.set('queue', []);
                            return this.enqueue.bind(this);
                        }),
                        (function create(listener) {
                            return (this._signal || (this.constructor.prototype._signal = sys.type('Signal'))).of(listener);
                        }),
                        (function add(stream) {
                            this.handlers.push(stream);
                            return this;
                        }),
                        (function make(/* type, name, id, item */) {
                            var args = [].slice.call(arguments);
                            var listener = args.pop(); listener.reference = args.join('.');
                            return this.set(listener.name, this.create(listener));
                        })
                    ]
                };
            })(),
     // === Helper === //
            (function() {
                return {
                    name: 'Helper',
                    parent: 'IO',
                    ctor: function(x) {
                        this.__super__.call(this, x);
                    },
                    ext: [
                        (function maybe(m) {
                            return function(l) {
                                return function(r) {
                                    return m(l)(r);
                                }
                            }
                        }),
                        (function tuple(a) {
                            return function(b) {
                                return function(f) {
                                    return f(a)(b);
                                }
                            }
                        }),
                        (function bin(f) {
                            return function(x) {
                                return function(y) {
                                    return f(x, y);
                                }
                            }
                        }),
                        (function $map(stream, f) {
                            return function(continuation) {
                                return stream(function(value) {
                                    continuation(f(value));
                                });
                            };
                        }),
                        (function $filter(stream, f) {
                            return function(continuation) {
                                return stream(function(value) {
                                    if (f(value)) {
                                        continuation(value);
                                    }
                                });
                            };
                        }),
                        (function $_comprehension($_$map, $_$filter) {
                            return function comprehension(f_map, f_filter) {
                                return function(stream) {
                                    if (f_filter) {
                                        stream = $_$filter(stream, f_filter);
                                    }
                                    return $_$map(stream, f_map);
                                };
                            };
                        }),
                        (function lazyValue(v) { return (function() { return v; }); }),
                        (function lazyFunction(f) { return (function() { return f(); }); }),
                        (function atom(f, t) {
                            return function() {
                                return f(t);
                            };
                        }),
                        (function $_mapLazy($_atom) {
                            return function mapLazy(f) {
                                return function(v) {
                                    return $_atom(f, v);
                                }
                            }
                        }),
                        (function bindLazy(v, f) {
                            return function() {
                                return f(v())();
                            };
                        }),
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
                        (function $_instructionMap($_makeInstruction) {
                            return function instructionMap(instruction, f) {
                                return $_makeInstruction(instruction.mode, instruction.next.map(f));
                            }
                        }),
                        (function $_bindThread($_bindLazy, $_instructionMap, $_wrap) {
                            return function bindThread(lazyValue, f) {
                                return $_bindLazy(lazyValue, function(free) {
                                    return free.pure
                                        ? f(free.value)
                                        : $_wrap($_instructionMap(free.value, function(v) {
                                            return bindThread(v, f);
                                        }));
                                });
                            }
                        }),
                        (function $_lift($_bindLazy, $_makeThread) {
                            return function lift(lazyValue) {
                                return $_bindLazy(lazyValue, $_makeThread);
                            }
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
                        (function $_yyield($liftF, $_makeInstruction) {
                            return function yyield() {
                              return $_liftF($_makeInstruction('yield', [null]));
                            }
                        }),
                        (function $_atom($_bindThread, $_lift, $_yyield, $_makeThread) {
                            return function atom(lazyValue) {
                                return $_bindThread($_lift(lazyValue), function(v) {
                                      return $_bindThread($_yyield(), function() {
                                          return $_makeThread(v);
                                      });
                                });
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
                        (function runThreads(threads) {
                            return function() {
                                if (threads.length > 0) {
                                    var thread = threads.shift();
                                    var freeValue = thread();

                                    if (!freeValue.pure) {
                                        var instruction = freeValue.value;
                                        var next = instruction.next;
                                        if (instruction.mode == 'yield') {
                                            threads.push.apply(threads, next);
                                        }else if (instruction.mode == 'fork') {
                                            threads.unshift(next[0]);
                                            threads.push.apply(threads, next.slice(1));
                                        }
                                    }
                                }
                                return !threads.length;
                            }
                        }),
                        (function addThreads() {
                            var threads = [], run = this.runThreads(threads), enqueue = sys.get('scheduler.nextTick.enqueue');
                            return {
                                push: function() {
                                    if (threads.push.apply(threads, arguments) == 1) {
                                        enqueue(run);
                                    }
                                    return this;
                                }
                            };
                        }),
                        (function $_delay($_atom) {
                            return function delay(v, m) {
                                var t = typeof (m) === "number" ? pure(m) : m;
                                return function $_pure(succ, fail) {
                                    t(function(ms) {
                                        console.log('START', v);
                                        self.setTimeout($_atom(succ, v), ms);
                                    }, fail);
                                };
                            }
                        })
                    ]
                };
            })(),
     // === Event === //
            (function() {
                return {
                    name: 'Events',
                    parent: 'Store',
                    ctor: function(opts) {
                        this.__super__.call(this, opts || (opts = {}));

                        if (this.events) this.initdata();

                        this._values  = [];
                        this._handler = [];
                    },
                    ext: [
                        (function initdata() {
                            this._queue  = this._queue  || (this._queue  = this.set('queue', []));
                            this._lstnrs = this._lstnrs || (this._lstnrs = this.events.node('listeners'));
                            this._change = this._change || (this._change = this._lstnrs.node('change'));
                            this._active = this._active || (this._active = this._lstnrs.set('active', []));
                        }),
                        (function addEventListener(/* instance, name, selector, target */) {
                            var args = [].slice.call(arguments), instance = args.shift();
                            var name = args.shift(), target = args.pop(), selector = args.length ? args.shift() : '*';

                            var events = this._lstnrs.ensure(name, this.__);
                            var matchs = new RegExp('/(.*?)/');
                            var active = this._lstnrs.get('active') || this._lstnrs.set('active', []);
                            return active[active.push({
                                uid: instance.uid(), ref: instance.identifier(), selectstr: selector,
                                level: instance.level(),
                                name: name, selector: matchs, target: target, run: target.run || target
                            })-1];
                        }),
                        (function removeEventListener() {
                            var active = target[target.push({ uid: instance.uid(), ref: instance.identifier(), name: name, selector: selector, target: target })-1];
                            return active;
                        }),
                        (function runHandler(lstnrs, value) {
                            return lstnrs.bind(function(handler) {
                                return handler.run(value);
                            });
                        }),
                        (function initHandler(run, lstnrs) {
                            return function(value) {
                                return run(lstnrs, value).run();
                            };
                        }),
                        (function emit(source, args) {//* source, name, target, info */) {
                            if (args !== 'queue' && source && source.uid && this._active && this.push('queue', { source: source, args: args }, true)) {
                                this.runQueue(this.get('queue'));
                            }
                        }),
                        (function runQueue(values) {
                            return this.get('queue').splice(0).bind(function(value) {

                                return {
                                    src:    'data',
                                    uid:     value.source.uid(),
                                    ref:     value.source.identifier(),
                                    type:    value.args.shift(),
                                    target:  value.args.shift(), 
                                    action:  value.args.shift(),
                                    value:   value.args.pop()
                                };

                            }).flatmap(this.initHandler(this.runHandler, this._active)).run(unit);
                        })
                    ],
                    attrs: [
                        (function of(opts) {
                            return new this(opts);
                        })
                    ],
                    init: function(type, klass) {
                        var Store  = sys.type('Store'), Root = sys.get(); klass.prototype.isEvents = true;
                        var Events = Store.prototype.events  = klass.prototype.events = Root.set('events', klass.of(type, klass));
                        Events.initdata();
                        return Events;
                    }
                };
            })(),
     // === Listener === //
            (function() {
                return {
                    name: 'Listener',
                    parent: 'Helper',
                    ctor: function(x) {
                        this.__super__.call(this, x);
                    },
                    ext: (function() {
                        var args = [].slice.call(arguments);
                        return function() {
                            return args[0].apply(this, args.slice(1));
                        }
                    })(

                        (function(mbAddEL1, mbAddEL2, mbELEMListener, addELEMENTListener, liftOperator,
                            mbEVTbind1, wrapDISPATCHER, mbEVTcntrTUP, eON, eOFF,
                                makeDISPATCHER, makeCOMPREHENSION, evtONOFF, throttle, mbEvtADD, fromCallback) {
                            
                            var maybe = this.types.get('Helper').klass.prototype.maybe;
                            var tuple = this.types.get('Helper').klass.prototype.tuple;
                            var bin   = this.types.get('Helper').klass.prototype.bin;

                            var maybeAddEventListener = maybe(mbAddEL1)(mbAddEL2);

                            var maybeListener = maybe(mbELEMListener);

                            var maybeEventBinder = maybe(mbEVTbind1);

                            var maybeEventControl = maybe(mbEVTcntrTUP)(tuple(eON)(eOFF));

                            var maybeEventHandler = maybeListener(function(elem) {
                                return function(stream) {
                                    return function(handler) {
                                        return stream(handler);
                                    }
                                }
                            });

                            function eventListener(element) {
                                return maybeAddEventListener(maybeEventHandler(element));
                            };

                            return [
                                { name: 'mainQueue', fn: sys.get().child('queue', sys.type('Queue')) },
                                { name: 'addElementListener', fn: addELEMENTListener },
                                { name: 'wrapDispatcher', fn: wrapDISPATCHER },
                                { name: 'maybeListener', fn: maybeListener },
                                { name: 'maybeAddEventListener', fn: maybeAddEventListener },
                                { name: 'maybeEventControl', fn: maybeEventControl },
                                { name: 'eventListener', fn: eventListener },
                                { name: 'addEventListener', fn: mbEvtADD },
                                { name: 'makeDispatcher', fn: makeDISPATCHER },
                                { name: 'makeComprehension', fn: makeCOMPREHENSION },
                                { name: 'throttle', fn: throttle },
                                { name: 'maybeEventBinder', fn: maybeEventBinder },
                                { name: 'liftOperator', fn: liftOperator },
                                { name: 'eventOnOffControl', fn: evtONOFF },
                                { name: 'fromCallback', fn: fromCallback(maybe, sys.get('scheduler.nextTick.enqueue')) }
                            ];

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
                        (function liftOperator(matcher, comprehension) {
                            return function(element) {
                                // feeding the result of this a selector provides a
                                // runnable operation suitable for acting as a listener
                                return matcher.of(element).bind(comprehension);
                            } // liftOperator creates listeners for a category of events
                        }), // (i.e. DOM, DataNode, UI component etc
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
                                run: handler,
                                state: 'on'
                            };
                        }),

                        (function off(elem, state, handler) {
                            elem.removeEventListener(state.name, handler);
                            return {
                                name: name,
                                run: handler,
                                state: 'off'
                            };
                        }),

                        (function maybeListener(addFunction) {
                            return function(elem) {
                                return function(name, handler) {
                                    return addFunction(elem, name, handler);
                                };
                            };
                        }),

                        (function makeComprehension(elem) {
                            return function(stream) {
                                return function(handler) {
                                    return stream(handler);
                                }
                            }
                        }),

                        (function eventOnOffControl(on, off) {
                            return function(elem, name, handler) {
                                var base = { name: name, throttle: 0, on: on, off: off };
                                function $on() {
                                    var state = on(elem, name, handler);
                                    state.throttle = base.throttle;
                                    state.off = $off;
                                    return state;
                                };
                                function $off() {
                                    var state = on(elem, name, handler);
                                    state.throttle = base.throttle;
                                    state.on = $on;
                                    return state;
                                };
                                return $on();
                            };
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

                        (function add(/* type, name, element, selector, run, throttle */) {
                            var args = [].slice.call(arguments), type = args.shift(), name = args.shift();
                            var node = this.mainQueue.get(type, '0', name) || this.run(name);
                            var element  = args.shift(), run = args.pop();
                            var selector = args.length && typeof args[0] == 'string' ? args.shift() : null;
                            var throttle = args.length && typeof args[0] == 'number' ? args.shift() : 0;
                            var handler  = { type: type, name: name, selector: selector, throttle: throttle, run: run };
                            return node.add(handler,
                                this.comprehension(
                                    this.mainQueue.get(type, 'createEvent'),
                                    this.mainQueue.get(type, 'makeSelectorFunc')(this.mainQueue.get(type, 'createSelector')(element))(selector)
                                )(this.fromCallback)(throttle ? this.throttle(handler, throttle) : handler.run)
                            );
                        }),

                        (function fromCallback(make, wrap1, wrap2) {
                            return function(maybe, enqueue) {
                                return make(maybe, enqueue, wrap1, wrap2);
                            }
                        })(
                            (function(maybe, enqueue, wrap1, wrap2) {

                                var fromTuple = maybe(function(fn) {
                                    return function(arg1) {
                                        return function(arg2) {
                                            return fn(arg1, arg2);
                                        };
                                    };
                                })(maybe(function(fn) {
                                    return function(mb) {
                                        return function(arg1, arg2) {
                                            return fn(mb, arg1, arg2);
                                        };
                                    };
                                })(wrap1)(wrap2));

                                return maybe(function(next) {
                                    return function(continuation) {
                                        var arr = [];
                                        return next(fromTuple(arr)(continuation))(arr);
                                    };
                                })(maybe(function(fn) {
                                    return function(enqueue) {
                                        return function(next) {
                                            return fn(next, enqueue);
                                        };
                                    };
                                })(function(next, enqueue) {
                                    return function(list) {
                                        function run() {
                                            if (!list.length) enqueue(next);
                                            list.push.apply(list, Array.prototype.slice.call(arguments));
                                            if (!arguments.length) return run;
                                        };
                                        return run;
                                    };
                                })(enqueue));
                            }),
                            (function(fn, arg1, arg2) {
                                return function() {
                                    return fn(arg1, arg2);
                                };
                            }),
                            (function(arr, continuation) {
                                if (arr.length) continuation(arr.shift());
                                return !arr.length;
                            })
                        )
                    ),
                    attrs: [
                        (function init(type) {
                            var ctor = this;
                            var func = this.prototype;
                            var base = func.mainQueue.get(type) || func.mainQueue.child(type);
                            return function(elem) {
                                var node, disp, name = (elem.nid ? elem.nid() : null) || elem.id || elem._cid;
                                if (!name || !(node = base.get(name))) {
                                    node = base.child(name);
                                    if (!name) name = node.nid();
                                    if (!elem.id) elem.id = name;
                                }
                                var list = node.get('listener') || node.set('listener', base.get('maybeEventElem')(elem));
                                var disp = node.get('dispatcher')
                                    || node.set('dispatcher', func.wrapDispatcher(node));

                                return sys.get('utils.lift')(function(node, name) {
                                    var handler = node.get(name)
                                        || node.make(node.identifier(), name, node.get('dispatcher')(node.get('listener'))(name));
                                    return handler;
                                }, ctor.pure(node));
                            }
                        })
                    ],
                    data: {
                        dom: [
                            (function matches(element, selector) {
                                return function(evt) {
                                    if (evt && evt.target && (!selector || evt.target.matches(selector))) {
                                        if (!element) return true;
                                        var elem = evt.target;
                                        while (elem) {
                                            if (elem == element) break;
                                            else elem = elem.parentElement;
                                        }
                                        return !!elem;
                                    }
                                    return false;
                                } // DOMeventHandler creates the DOM event specific *handler* proxy
                            }),   // so the main handler(s) to which the listeners will be attached
                            (function createEvent(evt) {
                                return {
                                    src: 'dom',
                                    type: evt.type,
                                    target: evt.target,
                                    x: evt.clientX || evt.x,
                                    y: evt.clientY || evt.y
                                };
                            }),
                            (function createSelector(element) {
                                return typeof element == 'string' ? document.getElementById(element) : element;
                            })
                        ],
                        store: [
                            (function matches(element, selector) {
                                return function(evt) {
                                    if (evt && evt.target && (!selector || evt.target.matches(selector))) {
                                        if (!element) return true;
                                        return element.pertains(evt);
                                    }
                                    return false;
                                } // DOMeventHandler creates the DOM event specific *handler* proxy
                            }),   // so the main handler(s) to which the listeners will be attached
                            (function createEvent(evt) {
                                return {
                                    src: 'data',
                                    uid: evt.uid,
                                    ref: evt.ref,
                                    type: evt.type,
                                    target: evt.target,
                                    action: evt.action,
                                    value: evt.value
                                };
                            }),
                            (function createSelector(element) {
                                return typeof element == 'string' ? sys.get(element) : element;
                            })
                        ]
                    },
                    init: function(type, klass) {

                        var main  = sys.get('queue');
                        var list  = sys.type('Listener');
                        var func  = list.prototype;

                        var maybeEventElem = func.maybeListener(
                            func.maybe(func.addElementListener)(func.maybeEventControl(func.bin(func.eventOnOffControl))));

                        function makeEventContainerElement(element, throttle) {
                            return func.maybeAddEventListener(maybeEventElem(element || document.body));
                        };

                        var dom   = func.mainQueue.child('dom').parse(type.data.dom);
                        var store = func.mainQueue.child('store').parse(type.data.store);

                        dom.set('maybeEventElem', makeEventContainerElement);
                        store.set('maybeEventElem', makeEventContainerElement);

                        dom.set('makeSelectorFunc', func.maybe(func.maybeEventBinder)(dom.get('matches')));
                        store.set('makeSelectorFunc', func.maybe(func.maybeEventBinder)(store.get('matches')));

                        dom   = list.init('dom')(document.body);
                        store = list.init('store')(sys.get());

                        var list  = sys.type('Listener').init('dom')(document.body);
                        var node  = sys.type('Listener').init('store')(sys.get());

                        return main;
                    }
                };
            })
    ),

// =======  ======= ARRAY MONADIC BIND =======  ======= //

    (function MakeBind() {

        return [].slice.call(arguments).apply();
    })(
        (function wrap(collect, combine, fmap, tap, get, bind, next, flatmap, select, ap) {
            return function(nextTick) {
                return {
                    result:     nextTick.result,
                    collect:    collect(nextTick.enqueue),
                    chain:      nextTick.bind,
                    combine:    combine,
                    tap:        tap,
                    get:        get,
                    fmap:       fmap,
                    bind:       bind,
                    next:       next,
                    flatmap:    flatmap,
                    ap:         ap,
                    select:     select
                };
            }
        }),
        (function collect() {
            return [].slice.call(arguments).apply();
        })(
            (function wrap(collect, pure, run, set, next) {
                return function(enqueue) {
                    return collect(pure(next, enqueue), run, set);
                }
            }),
            (function _$_collect(pure, run, set) {
                return function collect(x) {
                    return function $_pure(succ, fail) {
                        return pure(x.slice(0), run(collect, set(0, x.map($const(undefined)), succ, fail)));
                    }
                };
            }),
            (function pure(next, enqueue) {
                return function(x, f) {
                    return enqueue(next(x, f));
                }
            }),
            (function map(get, run) {
                return function make(collect, set) {
                    return get(collect, run(set));
                }
            })(
                (function get(run, set) {
                    return function(x, i) {
                        if (x instanceof Function && x.name == '$_pure') {
                            return x(set(i), i);
                        }else if (x instanceof Array) {
                            return x.length ? run(x)(set(i)) : set(i)(x);
                        }else {
                            return set(i)(x);
                        }
                    };
                }),
                (function run(set) {
                    return function(i) {
                        return function(r) {
                            return set(r, i);
                        }
                    };
                })
            ),
            (function set(count, values, succ, fail) {
                return function(r, i) {
                    values[i] = r;
                    count++;
                    if (count == values.length) {
                        return succ(values);
                    }
                }
            }),
            (function next(x, f) {
                var i = 0;
                return function() {
                    if (x.length) {
                        f(x.shift(), i++);
                    }
                    return !x.length;
                }
            })
        ),
        (function combine(make) {
            return function combine(f, arr) {
                return this.bind(make(function(v, t, i, j) {
                    return f(v, t, i, j);
                }, arr));
            }
        })(
            (function makeCombi(f, arr) {
                var i = -1;
                return function(v) {
                    var j = 0;
                    return arr.bind(function(x) {
                        return f(v, x, !j ? ++i : i, j++);
                    });
                }
            })
        ),
        (function fmap(f, x) {
            return function $_pure(succ, fail) {
                x(function(r) {
                    succ(f(r));
                });
            }
        }),
        (function tap(f) {
            return function(x) {
                return unit(x, f(x));
            }
        }),
        (function get(f) {
            return function(r) {
                return f(r && r instanceof Array && r.length == 1 ? r.shift() : r);
            }
        }),
        (function bind() {
            return [].slice.call(arguments).apply();
        })(
            (function make(run, wrap) {
                return function bind(f) {
                    return this.map(run(wrap(f), this));
                }
            }),
            (function bind(f, o) {
                function bound(x, i) {
                    return x instanceof Array ? x.map(bind(f, x)) : f(x, i, o);
                };
                return bound;
            }),
            (function wrap(closed) {
                return function wrap(f) {
                    return function(x, i, o) {
                        return closed(f, x, i, o);
                    }
                }
            })(
                (function closed(f, x, i, o) {
                    return function $_pure(k) {
                        if (x instanceof Function && x.name == '$_pure') {
                            return x(function(r) {
                                return closed(f, r, i, o)(k);
                            }, i);
                        }else if (x instanceof Array) {
                            return x.length ? x.bind(f).collect()(k) : k(x);
                        }else {
                            return k(f(x, i, o));
                        }
                    }
                })
            )
        ),
        (function next() {
            return [].slice.call(arguments).apply();
        })(
            (function make($bind, $map) {
                return function next(x) {
                    return this.chain($map($bind, x));
                }
            }),
            (function bind(x, r) {
                return x.fmap(function(v) {
                    return Array.prototype.concat.apply(r, v);
                });
            }),
            (function map(b, o) {
                return function(x) {
                    return x instanceof Array ? b(o, x) : x;
                }
            })
        ),
        (function flatmap() {
            return [].slice.call(arguments).apply();
        })(
            (function make($map, $bind) {
                return function flatmap(f) {
                    return $map([], $bind(f || unit, this), this);
                };
            }),
            (function $map(a, f, x) {
                return x.bind(function(v, i, o) {
                    return v instanceof Array ? a.push.apply(a, v) : a.push(v);
                }).chain(function() {
                    return f(a);
                });
            }),
            (function $bind(map) {
                function bind(f, o) {
                    function bound(x, i) {
                        return x instanceof Array ? map(x, bind(f, x)) : f(x, i, o);
                    };
                    return bound;
                };
                return bind;
            })(
                (function(x, f) {
                    return Array.prototype.concat.apply([], x.map(f));
                })
            )
        ),
        (function select() {
            return [].slice.call(arguments).apply();
        })(
            (function make($_select) {
                return function select(f) {
                    return Array.of(this.ap($_select(f || $const(true))));
                };
            }),
            (function() {
                function filtered(x, f) {
                    return Array.prototype.concat.apply([], x.filter(f));
                };
                function bind(f) {
                    function bound(x) {
                        return x instanceof Array ? filtered(x, bound) : f(x);
                    };
                    return bound;
                };
                return function(f) {
                    return function $_select(x) {
                        if (x instanceof Array) {
                            return filtered(x, bind(f));
                        }else {
                            return x;
                        }
                    }
                };
            })()
        ),
        (function ap($wrap, $bind, $cond, $map, $ap) {
            return function ap(m, g, h, x) {
                return $wrap($ap, m || $map, g || $cond, h || $bind, x);
            };
        })(
            (function $wrap(a, m, g, h, x) {
                return function(f) {
                    return x.bind(a(f, m, g, h));
                }
            }),
            (function $bind(f, o) {
                return function(x, i) {
                    return f(x, i, o);
                }
            }),
            (function $cond(x) {
                return x instanceof Array;
            }),
            (function $map(x, f) {
                return x.map(f);
            }),
            (function $ap($run, $map, $cond, $bind) {
                return function ap(v, i, o) {
                    if ($cond(v, i, o)) { // If condition
                        return $map(v, $bind(ap, v)); // Map values recursively
                    }else {
                        return $run(v, i, o); // Map a single value
                    }
                };
            })
        )
    ),

// =======  ====== INITIALIZE SUBSYSTEMS ======  ====== //

    (function LaunchApp() {

        return [].slice.call(arguments).apply();
    })(
        (function BaseModel(initEvents, makeCore) {
            return function(sys) {

                initEvents(sys);
                makeCore(sys);

                return (self.sys = sys);
            }
        }),
        (function InitEvents(sys) {

            var evts = sys.type('Events');
            var list = sys.type('Listener');
            return sys;
        }),
        (function MakeSysCore(sys) {
            var core = sys.get().child('sys');
            core.parse({ inventory: {}, request: {}, delivery: {} }, true);
            core.child('queue', sys.type('Queue'));
            return core;
        })
    ),

// ========  ======== ASYNC FACILITY ========  ======== //

    (function XHR() {

        return [].slice.call(arguments).pure(0, true);
    })(

        (function XHRwrap(args) {
            return function(sys) {
                return args.insert(1, sys).apply();
            }
        }),
        (function XHRUtility(sys, wrap, newxhr, init, create, run, andThen) {
            var utils = sys.get('utils');
            sys.xhr = utils.set('xhr', utils.get('target')(
                wrap(
                    utils.get('pure'), utils.get('pure'),
                    init(run(create(newxhr), andThen), utils.get('pure'))
            )));
            return sys;
        }),
        (function wrap(pure, _pure_, request) {
            function loadScript(url) {
                url = _pure_(url);
                return function (succ, fail) {
                    url(function (_url) {
                        var ext = _url.split('.').slice(-1);
                        if (ext == 'css') {
                            var script = document.createElement("link");
                            script.type = 'text/css';
                            script.rel  = 'stylesheet';
                            script.href = _url;
                        }else {
                            var script = document.createElement("script");
                            if (ext == 'tmpl') {
                                script.type = 'text/template';
                            }
                            script.src = _url;
                        }
                        script.addEventListener("load", function () {
                            succ(script);
                        });
                        script.addEventListener("error", fail);
                        var head = document.getElementsByTagName('head')[0];
                        head.appendChild(script);
                    }, fail);
                };
            };
            function getImage(url) {
                url = _pure_(url);
                return function (succ, fail) {
                    url(function (_url) {
                        var img = new Image();
                        img.src = url;
                        img.addEventListener("load", function () {
                            succ(img);
                        });
                        img.addEventListener("error", fail);
                    }, fail);
                };
            };
            return {
                loadScript: loadScript,
                getImage: getImage,
                request: request
            };
        }),
        (function newxhr() {
            var _xhr = false;
            if (this.XMLHttpRequest) { // Mozilla, Safari, ...
                _xhr = new XMLHttpRequest();
            }else if ( this.ActiveXObject ) { // IE
                try {
                    _xhr = new ActiveXObject("Msxml2.XMLHTTP");
                }catch (e) {
                    try {
                        _xhr = new ActiveXObject("Microsoft.XMLHTTP");
                    }catch (e) {}
                }
            }
            return _xhr;
        }),
        (function initRequest(make, pure) {
            return function request(url, options) {
                var request;
                if (typeof (url) === "object") request = pure(url);
                else if (typeof (url) === "string") request = pure({ 'url' : url, 'cached' : (options === true) });
                else request = url;
                return make(request);
            };
        }),
        (function createRequest(newxhr) {
            return function create(request) {
                var xhr = newxhr(), type = request.type = request.type || 'GET';
                xhr.open(type, request.url, true);
                if (type != 'GET') {
                    xhr.setRequestHeader('Content-Type', request.contentType || 'application/json');
                }
                if (!request.noheaders) {
                    if (request.url.indexOf('.tmpl') > 0) {

                    }else if (request.withCredentials) {
                        xhr.withCredentials = true;
                        xhr.setRequestHeader('Access-Control-Request-Method', type);
                    }else if (!request.cached) {
                        xhr.setRequestHeader('Pragma', 'no-cache');
                        xhr.setRequestHeader('Cache-Control', 'no-cache');
                        xhr.setRequestHeader('If-Modified-Since', 'Thu, 01 Jun 1970 00:00:00 GMT');

                        xhr.setRequestHeader('HTTP_X_REQUESTED_WITH', 'XMLHttpRequest');
                        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                    }
                    if (request.contentType) {
                        xhr.setRequestHeader('Content-Type', request.contentType);
                    }
                    if (request.accept) {
                        xhr.setRequestHeader('Accept', request.accept);
                    }else {
                        xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
                    }
                }else {
                    if (request.accept) {
                        xhr.setRequestHeader('Accept', request.accept);
                    }
                }
                if (request.auth) {
                    xhr.withCredentials = request.withCredentials !== false;
                    xhr.setRequestHeader('Authorization', request.auth);
                }
                return xhr;
            }
        }),
        (function runRequest(create, then) {
            return function wrap(request) {
                return function(succ, fail) {
                    request(function(_request) {
                        var xhr = then(_request, create(_request), succ, fail);
                        if (_request.type == 'GET') {
                            return xhr.send();
                        }else {
                            if (_request.data) {
                                return xhr.send(typeof _request.data == 'object' ? JSON.stringify(_request.data) : _request.data);
                            }else {
                                return xhr.send(); 
                            }
                        }
                    }, fail);
                }
            };
        }),
        (function andThen(request, xhr, succ, fail) {
            xhr.onload = function () {
                if (request.parse) {
                    try {
                        var ctype = xhr.getResponseHeader('Content-Type');
                        if (ctype && ctype.indexOf && ctype.indexOf('json') > -1) {
                            succ(JSON.parse(xhr.responseText));
                        }else {
                            succ(xhr.responseText);    
                        }
                    }catch (e) {
                        fail(e);
                    }
                }else {
                    succ(xhr.responseText);
                }
            };
            xhr.onerror = function (e) {
                e.preventDefault();
                (fail || unit)('masync.' + type + ': ' + e.toString());
            };
            return xhr;
        })
    ),

// ========  ====== CATALOGUED EFFECTS ======  ======== //

    (function Effects() {
 
        return [].slice.call(arguments).pure(0, true);
    })(
 
        (function WrapSetup(items) {

            return function effects(sys) {
                items.push(sys);
                return items.apply(true);
            };
        }),
 
        (function Setup(env, defs, sys) {
            var eff  = env(sys.get(), sys).parseDefs(defs(unit));
            sys.eff = eff.getOperation('js.nodes.fn').run(eff)('getOperation');
            return (self.sys = sys);
        }),
 
        [ (function CreateSetup(createInstruction, createHandler, createFn, createEnv, createEffects) {
            return function(env, sys) {
                return env.set('effects', createEnv.call(
                    createInstruction.call(
                        createFn(sys.get('types'), sys.get('monad')).call(createHandler.call(env))
                    )
                ).of({ name: 'effects', parent: env }));
            }
        }),

        (function CreateInstruction() {

            function Instruction(handler, instruction) {
                this._handler     = handler;
                this._instruction = instruction;
                this._cache       = {};
            };
            Instruction.prototype.constructor = Instruction;
            Instruction.prototype.init = function(method, result, type) {
                var i = this._instruction;
                var t = type || i.type || result || i.node.parent('type');
                var a = [ method || i.method, t, i.action, result || i.result || t ];
                var p = a.join('.');
                return this._cache[p] || !a.unshift(i.node) || (this._cache[p] = this._handler.init.apply(this._handler, a));
            };
            Instruction.prototype.show = function() {
                return this._instruction;
            };
            Instruction.prototype.map = function() {
                var args = Array.prototype.slice.call(arguments);
                var func = args.shift();
                var inst = this.init.apply(this, args);
                return inst.map ? inst.map(func) : func(inst);          
            };
            Instruction.prototype.ap = function() {
                var args  = Array.prototype.slice.call(arguments);
                var monad = args.shift();
                var inst  = this.init.apply(this, args);
                return inst.ap ? inst.ap(monad) : monad.lift(inst);   
            };
            Instruction.prototype.lift = function() {
                var args = Array.prototype.slice.call(arguments);
                args.unshift('lift');
                return this.init.apply(this, args);
            };
            Instruction.prototype.run = function() {
                var args = Array.prototype.slice.call(arguments);
                var inst = this.init();
                if (inst && inst.run) {
                    return args.length > 1 ? inst.run.apply(inst, args) : (args.length ? inst.run(args.shift()) : inst.run());
                }else if (inst && inst instanceof Function) {
                    return args.length > 1 ? inst.apply(undefined, args) : (args.length ? inst(args.shift()) : inst());
                }
                return inst;
            };
            this.prototype.isInstruction = function(value) {
                return value && value instanceof Instruction ? true : false;
            };
            this.prototype.create = function(instruction) {
                return new Instruction(this, instruction);
            };
            return this;
        }),

        (function CreateHandler() {
            function Handler(env) {
                if (env) this.env = env;
            };
            Handler.prototype.constructor = Handler;
            Handler.prototype.env = Handler.env = this;
            Handler.prototype.types = Handler.types = this.types;
            Handler.prototype.just = Handler.just = sys.type('Maybe').$of();
            Handler.prototype.init = function(node, method, type, action, result) {
                return this.just(this.fn[method]).map(function(runInit) {
                    return runInit(type, node.get(action), result);
                }).unit();
            };
            Handler.prototype.fn = 
            Handler.of = function(env) {
                return new Handler(env);
            };
            return Handler;
        }),

        [ (function CreateFn(wrap, create, fn) {
            return function(types) {
                return wrap(fn(create(types, sys.type('Maybe')), {}));
            }
        }),
        (function CreateWrap(fn) {
            return function() {
                this.prototype.fn = fn;
                var fnx = this.just(fn).$fn();
                this.prototype.fnx = function(prop) {
                    return function() {
                        return fnx.fn.apply(fnx, [ prop ].concat([].slice.apply(arguments)));
                    }
                }
                return this;
            }
        }),
        (function CreateLookup(types, maybe) {
            return function(type) {
                return types.lookup(type).chain(function(item) {
                    return item && item.isType ? (item.klass || sys.type(item.name)) : (item && item.klass ? item.klass : maybe.of(item));
                });
            }
        }),
        (function fn(get, base) {
            function just(type, value) {
                return type.isFunctor ? type.of(value) : get(type).pure(value);
            };
            function cast(type) {
                var ctor = type.isFunctor ? type : get(type);
                return function(value) {
                    return value && (value.isFunctor || ctor.is(value)) ? value : ctor.pure(value);
                }
            };
            function apply(monad, type) {
                return function $_apply(value) {
                    return monad.ap(just(type, value));
                }
            };
            function bind(monad) {
                return function $_bind(type) {
                    return apply(monad, type);
                }
            };
            function lift(fn) {
                return function $_lift(value) {
                    return fn(value);
                }
            };
            function pure(monad) {
                return function $_pure(value) {
                    return monad.run(value);
                }
            };
            function embed(monad, type) {
                return function $_embed(value) {
                    return monad.chain(function(instance) {
                        return just(type, instance.of(value));
                    });
                }
            };
            function of(run, type) {
                return function $_of(value) {
                    return type(run(value));
                }
            };
            function utils(monad, args) {
                return function $_utils() {
                    return function $_fn() {
                        var args = [].slice.apply(arguments);
                        var prop = args.shift();
                        return monad.$fn(value);
                    }
                }
            };
            return {
                just: function(type, value, result) {
                    return just(type, value);
                },
                args: function(type, value, result) {
                    return 
                },
                typed: function(type, value, result) {
                    return just(type, bind(just(type, value)));
                },
                cast: function(type, value, result) {
                    return just(type, of(pure(just(type, value)), cast(result || type)));
                },
                embed: function(type, value, result) {
                    return embed(just(type, value), result);
                },
                utils: function(type, value, result) {
                    return utils(just(type, value))
                },
                bind: function(type, value, result) {
                    return just(type, bind(just(type, value))(result || type));
                },
                lift: function(type, value, result) {
                    return just(type, lift(base.lift2M(value, cast(result || 'Maybe'))));
                },
                pure: function(type, value, result) {
                    return pure(just(type, value));
                },
                maybe: function(type, value, result) {
                    return apply(just(type, value), result || 'Maybe');
                }
            };
        }) ],
        (function CreateEnv() {
            return sys.inherit('Env', 'Store', {
                name: 'Env',
                parent: 'Store',
                ctor: function(opts) {
                    this.__super__.call(this, opts);
                    this.handler = this.Handler.of(this);
                },
                ext: [
                    this,
                    (function isInstruction(value) {
                        return this.handler.isInstruction(value);
                    }),
                    (function getHandler(prop) {
                        return this.handler.fnx(prop);
                    }),
                    (function extractDef(def) {
                        return def && def instanceof Function ? def() : def;
                    }),
                    (function parseDefs(defs) {
                        var def;
                        while (defs.length && (eff = this.extractDef(defs.shift()))) {
                            this.addOperation(eff.path, eff);
                        };
                        return this;
                    }),
                    (function runDefs(env, defs, kont) {
                        return defs.stream(function(def) {
                            return (eff = env.extractDef(def))
                                && env.addOperation(eff.path, eff);
                        }, function() {
                            return kont(env);
                        });
                    }),
                    (function addOperation(path, op) {
                        var node = this.ensure(path, true);
                        node.parse(op, true);
                        return node;
                    }),
                    (function runOperation(path) {
                        return this.getOperation(path);
                    }),
                    (function getNode(location) {
                        return this.walk(location, function(value, key, node) {
                            return node.lookup('factory').chain(function(factory) {
                                return factory.get(key) ? node.isNode(value) : false;
                            });
                        });
                    }),
                    (function getFactory() {
                        var args = [].slice.apply(arguments);
                        var node = args.length && args[0].isNode ? args.shift() : this.getNode(args.shift());
                        return node.parent('factory').lookup(node.cid()).orElse(node.parent('factory.defaults'));
                    }),
                    (function getAction(location) {
                        return this.handler(location);
                    }),
                    (function eachOperation(location, init) {
                        var node = location && location.isNode ? location : this.getNode(location), base = this;
                        var path = node.identifier(true).slice(this.level(node));
                        var data = node.each(function(v, k, n) {
                            return base.getOperation(path.concat(k).join('.'), init);
                        });
                        return this.handler.just(data);
                    }),
                    (function cacheOperation(location, init) {
                        var node  = this.getNode(location);
                        var parts = (location instanceof Array ? location : location.split('.')).slice(node.level(this));
                        if (!parts.length) {
                            return this.eachOperation(node, init);
                        }else {
                            var path    = parts.join('.');
                            var action  = parts.shift();
                            var factory = this.getFactory(node);
                            var options = factory.get(action).values().orElse({}).unit();
                            if (options.args) {
                                node.set(action, node.get(action).call(sys, this.root.select(options.args)));
                            }
                            var method  = parts.length ? parts.shift() : (options.method || node.parent('method') || 'just');
                            var result  = parts.length ? parts.shift() : options[method];
                            return this.initOperation(this.handler.create({
                                node:    node,
                                path:    location,
                                action:  action,
                                options: options,
                                method:  method,
                                result:  result
                            }), init || false);
                        }
                    }),
                    (function initOperation(location, init) {
                        if (!location || init === false) return location;
                        if (typeof location == 'string') return this.getOperation(location, true);
                        else if (this.isInstruction(location)) return location.init();
                        return location;
                    }),
                    (function getOperation(location, init) {
                        if (location.indexOf('.') < 0) location = 'sys.eff.' + location;
                        return this._cache[location] || (this._cache[location] = this.cacheOperation(location, init));
                    }),
                    (function pureOperation(type, method, action) {
                        return monad.Cont.pure({
                            handler: this.handler,
                            type:    type,
                            method:  method,
                            action:  action
                        }, function(op) {
                            return op.handler.init(op.type, op.method, op.action);
                        });
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
                ]
            });
        }) ],
        (function CreateEffects() {
            // target - environment operations - list of instructions
            return [].slice.call(arguments).pure();
        })(
            // sys.eff
            (function() {
                return {
                    type: 'IO',
                    path: 'sys',
                    eff: [
                        (function parse(base) {
                            return function parse(defs) {
                                return base.effects.parseDefs(defs);
                            }
                        })
                    ],
                    factory: {
                        eff: {
                            defaults: {
                                method: 'bind',
                                just: 'Maybe',
                                bind: 'Maybe'
                            },
                            parse: {
                                args: [ 'root.effects' ],
                                method: 'just',
                                just: 'Maybe'
                            }
                        }
                    }
                };
            }),
            // sys.events
            (function() {
                return {
                    type: 'IO',
                    path: 'sys',
                    events: [
                        (function makeObs(create, wrap, source, observable) {
                            return function observer() {
                                return wrap(observable.call({
                                    source: create.call(this, source),
                                    store: this.get().child('observers')
                                }));
                            }
                        })(
                            (function $Create(source) {
                                return {
                                    doc: source(function(target, name, handler) {
                                        target.addEventListener(name, handler, false);
                                    }, function(target, name, handler) {
                                        target.removeEventListener(name, handler);
                                    }, this.type('Event')),
                                    dom: source(function(target, name, handler) {
                                        target.addEventListener(name, handler);
                                    }, function(target, name, handler) {
                                        target.removeEventListener(name, handler);
                                    }, this.type('Event').extend(function EventDOM(f) {
                                        this.__super__.call(this, f);
                                    }, [
                                        (function selector(selector) {
                                            return function(elem) {
                                                return elem.matches(selector);
                                            }
                                        }),
                                        (function listener(evt) {
                                            var elem = evt.target;
                                            if (elem.nodeType == Node.ELEMENT_NODE) {
                                              while (elem) {
                                                if (this.selector(elem)) break;
                                                else elem = elem.parentElement;
                                              }
                                              if (elem) {
                                                //evt.stopImmediatePropagation();
                                                this.dispatch(evt, elem);
                                              }
                                            }
                                        }),
                                        (function create() {
                                            var args = [].slice.call(arguments);
                                            var hndl = args.pop();
                                            var data = {
                                                id: this._id,
                                                selector: args.length ? this.selector(args.pop()) : $const(true),
                                                run: this.listener,
                                                dispatch: hndl
                                            };
                                            return data;
                                        })
                                    ]))
                                };
                            }),
                            (function $Wrap(observable) {
                                return function observer(type, target) {
                                    return observable.of(type, target);
                                }
                            }),
                            (function $Source(wrap) {
                                return function(on, off, make) {
                                    return function(target) {
                                        return wrap(target, on, off, make);
                                    }
                                }
                            })(
                                (function(target, on, off, make) {
                                    return function(name, handler) {
                                        on(target, name, handler);
                                        return {
                                            state: 1,
                                            toggle: function() {
                                                if (this.state && !(this.state = 0)) off(target, name, handler);
                                                else if ((this.state = 1)) on(target, name, handler);
                                                return this;
                                            },
                                            make: make.pure(handler)
                                        };
                                    }
                                })
                            ),
                            (function $Observable() {
                                function Observable(type, target) {
                                    this._id       = this.id();
                                    this._type     = type;
                                    this._target   = target;
                                    this._source   = this.source[type](target);
                                    this._node     = this.store.get(type) || this.store.child(type);
                                    this._node.set('target', target);
                                    this._node.set('instance', this);
                                };
                                Observable.prototype = {
                                    constructor: Observable,
                                    source: this.source,
                                    store: this.store,
                                    evtid: 100000,
                                    id: function() {
                                        return this.constructor.prototype.evtid++;
                                    },
                                    make: (function(run, handler) {
                                        return function(list) {
                                            return run(list, handler);
                                        }
                                    })(
                                        (function(list, handler) {
                                            return function(item) {
                                                return list.map(handler(item));
                                            }
                                        }),
                                        (function(item) {
                                            return function(handler) {
                                                return handler.run(item);
                                            }
                                        })
                                    ),
                                    toggle: function(handlers, handler) {
                                        return function() {
                                            var idx = handlers.indexOf(handler);
                                            if (idx >= 0) handlers.splice(idx, 1);
                                            else handlers.push(handler);
                                            return handler;
                                        }
                                    },
                                    add: function() {
                                        var args = [].slice.call(arguments);
                                        var name = args.shift();
                                        var node = this.on(name);
                                        var list = node.get('handlers');
                                        var make = node.get('make');
                                        var hndl = make.create.apply(make, args);
                                        hndl.toggle = this.toggle(list, list[list.push(hndl)-1]);
                                        return hndl;
                                    },
                                    on: function(name) {
                                        return this._node.get(name) || this.create(this._node.child(name).parse({ handlers: [] }), name);
                                    },
                                    create: function(node, name) {
                                        return node.parse(this._source(name, this.make(node.get('handlers'))));
                                    }
                                };
                                Observable.store = this.store;
                                Observable.of = function(type, target) {
                                    var node = this.store.walk(type, function(value, key, node) {
                                        return value.get('target') == target;
                                    });
                                    return node ? node.get('instance') : new this(type, target);
                                };
                                return Observable;
                            })
                        )
                    ],
                    factory: {
                        events: {
                            defaults: {
                                method: 'just',
                                just: 'IO',
                                bind: 'IO'
                            },
                            observer: {
                                args: [],
                            }
                        }
                    }
                };
            }),
            // js.data
            (function() {
                return {
                    type: 'IO',
                    path: 'js',
                    data: [
                        function just(v) {
                            return v;
                        },
                        function $const(v) {
                            return function() {
                                return v;
                            }
                        },
                        function func(f) {
                            return function(x) {
                                return f(x);
                            }
                        },
                        function pure(v) {
                            return function(f) {
                                return f(v);
                            }
                        },
                        function lift(f) {
                            return function(v1, v2) {
                                return f(v1, v2);
                            }
                        },
                        function eff(f, g, c) {
                            return function(r) {
                                return f(r, g, c);
                            }
                        },
                        function apply(f, c) {
                            return function() {
                                return f.apply(c, arguments);
                            }
                        },
                        function thread(f) {
                            return function(v) {
                                return function() {
                                    return f(v())();
                                }
                            }
                        },
                        function extract(fy) {
                            return function(fx) {
                                return fx(fy);
                            }
                        },
                        (function(fstchr, delim, wrap) {
                            return function toString(base) {
                                return wrap(fstchr, delim, base.each, base.keys, this.type('Object'));
                            }
                        })(
                            new RegExp(/[^\s]/),
                            String.fromCharCode(10),
                            (function wrap(fstchr, delim, each, keys, type) {
                                return function toString(value, recur) {
                                    if (!value) {
                                        return pure('');
                                    }else if (value instanceof Function) {
                                        var lines  = value.toString().split(delim);
                                        var last   = lines[lines.length-1];
                                        var indent = last.indexOf('}');
                                        var length = lines.length-1;
                                        return lines.bind(unit).fold(function(r, v, i, a) {
                                            if (v && typeof v == 'string' && v != '') {
                                                r.lines.push(v.slice(Math.min(v.search(fstchr), r.indent)));
                                            }
                                            return i == length ? r.lines.join(delim) : r;
                                        }, { indent: indent, lines: [] }).collect();
                                    }else if (recur === false || !value.constructor || type.isBaseType(value.constructor)) {
                                        return pure(value);
                                    }else if (value.constructor && value.constructor.prototype && value.constructor.name != 'Object') {
                                        var lines = [];
                                        var name  = value.constructor.name;
                                        lines.push(toString(value.constructor));
                                        each(keys(value.constructor.prototype), function(key) {
                                            var text = toString(value[key], false);
                                            if (text) lines.push(name + '.prototype.' + key + ' = ' + text + ';');
                                        });
                                        return pure(lines.length ? lines.join(delim) : null);
                                    }
                                }
                            })
                        )
                    ],
                    factory: {
                        data: {
                            defaults: {
                                method: 'bind',
                                just: 'Maybe',
                                bind: 'Maybe'
                            },
                            just: {
                                method: 'maybe',
                                maybe: 'Maybe'
                            },
                            toString: {
                                args: [ 'utils.each as each', 'utils.keys as keys' ]
                            }
                        }
                    }
                };
            }),
            // js.nodes
            (function() {
                return {
                    type: 'IO',
                    path: 'js',
                    nodes: [
                        function lookup(node) {
                            return function(key) {
                                return node.lookup(key);
                            }
                        },
                        function fn(node) {
                            return function() {
                                var args = Array.prototype.slice.call(arguments);
                                if (args.length == 1) {
                                    return node.fn(args.shift());
                                }else {
                                    return node.root.get('utils.obj')(args)(args.map(function(name) {
                                        return node.fn(name);
                                    }));
                                }
                            }
                        },
                        function fold(base) {
                            var list = this.type('List');
                            return function(value) {
                                return list.lift(value).fold(folder);
                            };
                        },
                        function walk(base) {

                            var list = this.type('List');

                            /* functor instance, result accumulator, value, key, object */
                            function fold(i, r, v, k, o) {
                                var l, idt = o && o.identifier instanceof Function ? o.identifier() : '-';
                                if (v && v.isNode) {
                                    l = [ o.identifier(), k, v, [] ];
                                    r.push(l);
                                    console.log(l);
                                            i(v, l[3]);
                                }else if (idt != '-') {
                                    console.log(r[r.push([ o.identifier(), k, v ]) - 1]);
                                }else if (r instanceof Array) {
                                    l = [ k, v ];
                                    console.log(r[r.push(l) - 1]);
                                    if (v && v instanceof o.constructor) {
                                        i(v, l[l.push([])-1]);
                                    }
                                }else {
                                    if (v && v instanceof o.constructor) {
                                        r[k] = { value: v, items: {} };
                                        i(v, r[k].items);
                                    }else {
                                        r[k] = v;
                                    }
                                    console.log({ key: k, value: r[k] });
                                }
                                return r;
                            }
                            return base.curry(function(value, result, folder) {
                                return list.lift(value).fold(folder || fold)(value, result || []);
                            });
                        }
                    ],
                    factory: {
                        nodes: {
                            defaults: {
                                method: 'just',
                                just: 'IO',
                                bind: 'Cont'
                            },
                            fold: {
                                args: [ 'root.List as list' ]
                            },
                            walk: {
                                args: [ 'root', 'utils.curry as curry' ]
                            }
                        }
                    }
                };
            }),
            // io.request
            (function() {
                return {
                    type: 'IO',
                    path: 'io',
                    request: [
                        (function make(node) {
                            return function(request) {
                                return function $_pure(continuation) {
                                    sys.xhr('request')(request)(function(result) {
                                        return continuation(sys.of(result));
                                    });
                                }
                            }
                        }),
                        (function script(loader, make, wrap) {
                            return function script(base) {
                                return wrap({
                                    cont: this.type('Cont'),
                                    loader: loader.call(this),
                                    store: this.get().child('script')
                                });
                            }
                        })(
                            (function loader() {
                                return this.type('Cont').extend(
                                    function LoadComp(mv, mf) {
                                        this.__super__.call(this, mv, mf);
                                    }, {
                                        mf: function(loc) {
                                            return function pure(continuation) {
                                                require([ loc ], function(x) {
                                                    return continuation(x);
                                                });
                                            }
                                        }
                                    }
                                );
                            }),
                            (function make(name, continuation) {
                                var url  = [ 'components', name, name ];
                                var path = url.join('.');
                                var node = this.store.get(path);
                                if (node && node.length()) {
                                    return this.cont.of(node.just());
                                }
                                node = this.store.ensure(path);
                                return this.load.of(url.join('/')).bind(this.wrap(node, continuation));
                            }),
                            (function wrap(base) {
                                return function script(location) {
                                    var path = location.split('/');
                                    var cont = base.store.get(path);
                                    if (!cont) {
                                        var node = base.store.ensure(path.slice(0, -1));
                                        var name = path.slice(-1).pop();
                                        cont = node.set(name, base.loader.of(location).bind(function(result) {
                                            return node.set(name, base.cont.is(result) ? result : base.cont.of(result)).cont();
                                        }).bind(function(result) {
                                            return node.set(name, base.cont.is(result) ? result : base.cont.of(result)).cont();
                                        }));
                                    }
                                    return cont;
                                }
                            })
                        ),
                        (function style(src) {
                            var fullsrc = src.split('.'); fullsrc.push('css');
                            var fileref = document.createElement('link');
                            fileref.setAttribute('rel', 'stylesheet');
                            fileref.setAttribute('type', 'text/css');
                            fileref.setAttribute('href', fullsrc.slice(0, 2).join('.'));
                            document.getElementsByTagName("head")[0].appendChild(fileref);
                            return fileref;
                        }),
                        (function timeout(base) {
                            return base.curry(function(fn, ms) {
                                return function(value) {
                                    return ms ? self.setTimeout(function() {
                                        fn(value);
                                    }, ms) : fn(value);
                                };
                            });
                        })
                    ],
                    factory: {
                        request: {
                            defaults: {
                                method: 'just',
                                just: 'IO',
                                bind: 'Cont'
                            },
                            make: {
                                args: [ 'root.xhr', 'root' ],
                                method: 'bind',
                                bind: 'Cont'
                            },
                            script: {
                                args: [ 'root' ]
                            },
                            style: {
                                method: 'bind',
                                bind: 'Cont'
                            },
                            timeout: {
                                args: [ 'root.utils.curry as curry' ]
                            }
                        }
                    }
                };
            }),
            // js.types
            (function() {
                return {
                    type: 'IO',
                    path: 'js',
                    types: [
                        (function make(ext, wrap) {
                            return function make() {
                                return wrap(ext.call(this));
                            }
                        })(
                            (function ext() {
                                return this.type('Args').extend(function MakeArgs() {
                                    this.__super__.apply(this, arguments);
                                }, {
                                    mf: function(parent, ext, ctor) {
                                        return this.lookup(parent).map(function(type) {
                                            return type.extend(ctor, ext);
                                        });
                                    },
                                    mv: [ 'parent', 'ext', 'ctor' ]
                                }, {
                                    suffix: 'jtm',
                                    label: 'js.types.make'
                                });
                            }),
                            (function wrap(args) {
                                return function make(parent) {
                                    return args.of().run(parent);
                                }
                            })
                        ),
                        (function guard(wrap) {
                            return function guard() {
                                return wrap(this.root.get('monad.fn').values());
                            }
                        })(
                            (function wrap(fn) {
                                return function guard(g) {
                                    return fn.map(fn.guard(g));
                                }
                            })
                        ),
                        (function utils(make) {
                            return function utils() {
                                return make(sys.eff('js.types.guard').init());
                            }
                        })(
                            (function make(guard) {
                                return {
                                    fn: function(f) {
                                        return guard.run(f);
                                    },
                                    log: function(threshold, info, interval) {
                                        var countdown  = threshold - 1;
                                        var cntbetween = interval || (Math.ceil(threshold / (threshold / 100)));
                                        return guard.run(function(val) {
                                            if (++val[1] > countdown) {
                                                console.log(info, val);
                                                return true;
                                            }else if (!(val[1]%cntbetween)) {
                                                console.log(info, val);
                                            }
                                        });
                                    },
                                    monad: function(m) {
                                        return guard.run(function(val) {
                                            return m.run(val);
                                        });
                                    },
                                    step: function(f, from, to, step) {
                                        var t = Math.abs(to - from), s = step || 1, d = Math.floor(t / s);
                                        return guard.run(function(val) {
                                            val[1] = val[0] == d ? to : (from + (val[0] * s));
                                            f(val);
                                            return ++val[0] > d;
                                        });
                                    },
                                    animate: function(f) {
                                        return guard.run(function(val) {
                                            val.elapsed = (val.ts = parseInt(self.now())) - val.tstart - val.delay;
                                            if (val.elapsed) {
                                                val.fraction = val.elapsed / val.duration;
                                                if (val.fraction > 1) {
                                                    val.fraction = 1;
                                                    val.done     = val.last;
                                                    val.last     = true;
                                                    val.value    = val.to;
                                                }else {
                                                    val.value    = parseInt((val.from + (val.fraction * val.diff))*100)/100;
                                                }
                                                f(val);
                                            }
                                            return val.done;
                                        });
                                    }
                                };
                            })
                        ),
                        (function main(wrap, args, make, create) {
                            return function queue(base) {
                                base.$type = this.type('Object');
                                return wrap(args(base, make(
                                    create(base.effects),
                                        sys.of(sys.eff('js.types.utils').init().run()
                                    )
                                )));
                            }
                        })(
                            (function wrap(args) {
                                return function queue() {
                                    var arg = [].slice.call(arguments);
                                    var run = args.of();
                                    return run.next.apply(run, arg);
                                };
                            }),
                            (function args(base, queue) {
                                return base.$type.find('Args').extend(function LazyQueueArgs() {
                                    this.__super__.apply(this, arguments);
                                }, {
                                    mf: queue,
                                    mv: [ { name: 'type', type: base.$type, optional: true }, { name: 'value', type: Array, optional: true } ]
                                }, {
                                    suffix: 'que',
                                    label: 'js.types.queue'
                                });
                            }),
                            (function make(monad, utils) {
                                return (function queue(type, value) {
                                    return monad.chain(function(instance) {
                                        var t = instance.findTypeCtor(type || 'Lazy');
                                        var q = t.of(instance.of(value || []));
                                        var m = utils.$fn2(q);
                                        return m;
                                    });
                                });
                            }),
                            (function create() {
                                return sys.eff('js.types.make').run('Counter').run({
                                    prefix: 'QU',
                                    defs: function() {
                                        return this;
                                    },
                                    def: function() {
                                        return [];
                                    },
                                    set: function(n) {
                                        return n && n instanceof Array ? (this.n = n.slice(0)) : this.n;
                                    },
                                    push: function(v) {
                                        return this.n.push(v);
                                    },
                                    add: function(n) {
                                        if (!n || !n.length) return this.n;
                                        for (var i = n.length - 1; i >= 0; i--) {
                                            if (n[i].delay) n[i].delay = (this._delay+=n[i].delay);
                                            this.n.push(n[i]);
                                        };
                                        if (this._delay) console.log('ADD', this._delay);
                                        return this.n.length;
                                    },
                                    info: function(info) {
                                        //console.log({ size: this._size, length: this.n.length, index: this._index, info: info });
                                    },
                                    choose: function(free, choice, log) {
                                        if (log !== false) this.info(choice);
                                        return free.choose ? free.choose(choice) : free[choice];
                                    },
                                    remove: function(item) {
                                        if (!this._delay || !item || !item.delay) return item;
                                        this._delay -= this._delay > item.delay ? item.delay : this._delay;
                                        if (!this._delay) console.log('REMOVE', this._delay);
                                        return item;
                                    },
                                    next: function(cont, counter, free) {
                                        if (counter || (this._size = this.n.length)) {
                                            if (this._index < this.n.length && (cont(this.n[this._index]) ? this.remove(this.n.splice(this._index, 1).pop()) : ++this._index)) {
                                                return this.choose(free, 'run', false);
                                            }else {
                                             this._index = 0;
                                             return this.choose(free, 'suspend');
                                            }
                                        }
                                        return this.choose(free, 'done');
                                    }
                                }, function Queue(n) {
                                    this.__super__.call(this, n);

                                    this._size  = 0;
                                    this._index = 0;
                                    this._count = 0;
                                    this._delay = 0;
                                });
                            })
                        ),
                        (function collect(wrap, make, init, run, store) {
                            return function collect(base) {
                                return wrap(init(make(base, run())), store(base));
                            }
                        })(
                            (function $_wrap_collect(init, store) {
                                return function $_wrap_collect(path, parent) {
                                    var parts = path.split('.');
                                    var name  = parts.pop();
                                    return store.value(name) || store.add(name, init(path, parent));
                                }
                            }),
                            (function $_make_collect(base, run) {
                                base.type = base.monad.$type;
                                base.args = base.monad.get('Args');
                                base.make = base.args.$create('MakeArgsType', {
                                    mf: run,
                                    mv: [ 'parent', 'name', 'ext', 'attrs' ]
                                }, base.args);
                                return base;
                            }),
                            (function $_init_collect(base) {
                                return function init(parent) {
                                    return base.make.of().run(base.type.$ctor(parent));
                                };
                            }),
                            (function $_run_collect() {
                                return function run(parent, ctor, ext, attrs) {
                                    return parent.$create(ctor, ext, attrs);
                                };
                            }),
                            (function $store_collect(base) {
                                return base.ensure('sys.$runtime.$types').$index();
                            })
                        )
                    ],
                    factory: {
                        types: {
                            defaults: {
                                method: 'just',
                                just: 'IO',
                                bind: 'Cont'
                            },
                            make: {
                                args: [ 'root' ],
                                method: 'just',
                                bind: 'IO'
                            },
                            queue: {
                                args: [ 'root.effects', 'root' ],
                                method: 'just',
                                just: 'Maybe'
                            },
                            collect: {
                                args: [ 'root' ],
                                method: 'just',
                                just: 'Args'
                            },
                            guard: {
                                args: [ 'root' ]
                            }
                        }
                    }
                };
            }),
            // sys.component
            (function() {
                return {
                    type: 'IO',
                    path: 'sys',
                    component: [
                        (function(make, wrap) {
                            return function load(base) {
                                return wrap(make.call(this, base));
                            }
                        })(
                            (function make() {
                                return {
                                    store: this.root,
                                    cont: this.type('Cont'),
                                    load: this.type('Cont').extend(
                                        function LoadComp(mv, mf) {
                                            this.__super__.call(this, mv, mf);
                                        }, {
                                            mf: function(loc) {
                                                return function(continuation) {
                                                    require([ loc ], continuation);
                                                }
                                            }
                                        }
                                    ),
                                    wrap: function(node, continuation) {
                                        return function(klass) {
                                            return continuation(node, klass);
                                        }
                                    },
                                    make: function make(name, continuation) {
                                        var url  = [ 'components', name, name ];
                                        var path = url.join('.');
                                        var node = this.store.get(path);
                                        if (node && node.length()) {
                                            return this.cont.of(node.just());
                                        }else {
                                            node = this.store.ensure(path);
                                            return this.load.of(url.join('/')).bind(this.wrap(node, continuation));
                                        }
                                    },
                                    test: function(code, value) {
                                        return value ? this.cont.of(value) : this.store.$named;
                                    }
                                };
                            }),
                            (function wrap() {
                                return function load(name) {
                                    return sys.type('Component').inherit(name);
                                }
                            })
                        )
                    ],
                    module: [
                        (function load(name) {
                            return sys.type('Module').inherit(name);
                        })
                    ],
                    factory: {
                        component: {
                            defaults: {
                                method: 'just',
                                just: 'IO',
                                lift: 'Maybe',
                                bind: 'Cont'
                            },
                            load: {
                                args: [ 'root' ]
                            }
                        },
                        module: {
                            defaults: {
                                method: 'just',
                                just: 'IO',
                                lift: 'Maybe',
                                bind: 'Cont'
                            }
                        }
                    }
                };
            })
        )
    ),

// =======  ====== SYSTEM HANDLER SETUP ======  ======= //

    (function CentralSysHandlers() {

        return [].slice.call(arguments).apply();
    })(
        (function HandlerWrap(createHandler, createFunctor, createChannel, createEffRequest, createControl) {
            return function(sys) {

                var handler  = createHandler(sys.type('Maybe'), sys.get());

                var listener = sys.type('Listener');

                var free     = listener.pure(sys.get('utils.call')(pure)).map(function(trg) {
                    return trg;
                }).run(sys.get('utils.target'));

                var functor  = createFunctor(free, handler);

                var channel  = createChannel(functor, free);

                var request  = createEffRequest(sys.type('Maybe'), sys.get());

                var control  = createControl(sys.get(), request, sys.type('Maybe'), sys.get('queue'), functor);

                sys.handler  = {

                    handler: handler, functor: functor, free: free,
                    channel: channel, request: request, control: control

                };

                return sys;

            }
        }),

        (function CreateFreeHandler(mbee, root) {

            function runargs(task) {
              var runnable = task.run, idx = 0, args = task.args;
              while (runnable && idx < args.length) {
                if (typeof args[idx] != 'undefined') {
                  runnable = runnable(task[args[idx]] || task.params[idx] || (task.defaults ? task.defaults[args[idx]] : undefined)); idx++;
                }
              }
              return runnable || unit;
            };
            function wrap(runnable) {
              if (runnable) {
                if (runnable instanceof mbee) return runnable;
                else if (runnable.map && runnable.run) return runnable;
                else return mbee.of(runnable);
              }else {
                return mbee.of(unit);
              }
            };
            function create(task, action) {
              return function(target) {
                if (task.action || task.method) {
                  task.run = target.fn ? (target.fn(action) || target.get(action)) : target[action];
                }else if (action) {
                  root.lookup(task.node).map(function(node) {
                    task.run = node.get(action)(target);
                    return node;
                  }).orElse(function() {
                    return root.lookup(task.location).chain(function(node) {
                        task.run = node.get(action)(target);
                        return node;
                    });
                  });
                }else if (task.monad) {
                  task.run = task.monad.of(target);
                }else if (task.fn) {
                  task.run = task.fn(target);
                }
                if (task.args && task.args.length) task.run = runargs(task);
                return task.run;
              }
            };
            function interpret(task) {

              if (task.instruction) {

                return root.lookup(task.dict).map(function(dict) {
                    return dict.get(task.instruction);
                }).map(function(instruction) {
                    return create(task, instruction.get(task.type))
                });

              }else if (task.action || task.method) {

                return create(task, task.action || task.method);

              }else if ((task.run = task.fn)) {

                return (task.run = (task.args && task.args.length ? runargs(task) : task.run));

              }else {

                return create(task);

              }
            };
            function handler(task) {
              return wrap(

                interpret(task)

              ).ap(

                task.location ? root.lookup(task.location) : (task.node ? task.node.just() : mbee.of(root))

              );
            };
            return handler;
        }),

        (function CreateFreeFunctor(free, handler) {
            function make(sub, task) {
                return function() {
                    return free('makeThread')(sub.ap(handler(task)));
                }
            };
            function compose(task, result) {
                return free('bindThread')(result, function(sub) {
                    return free('bindThread')(free('yyield')(), make(sub, task));
                });
            };
            function bind(request) {
                return request.chain(function(task) {
                    if (task.result && !task.result.run) {
                        return compose(task, free('makeThread')(handler(task.result)));
                    }else if (task.fn) {
                        return free('mapThread')(free('makeThread')(handler(task)), function(value) {
                            return value.run(task.fn);
                        });
                    }else {
                        return free('makeThread')(handler(task));
                    }
                });
            };
            return function run(request) {
                return free('bindThread')(free('makeThread')(request), bind);
            };
        }),

        (function CreateFreeChanLink(takeWrap, linkWrap) {
            return function(FreeF, free) {
                return linkWrap(takeWrap(FreeF, free));
            }
        })(
            (function takeFromChannel(FreeF, free) {
                return function take(ch, val) {
                    return val.chain(function(task) {
                        return FreeF.of(task).run(function(thread) {
                            free.runThread(thread);
                            ch.take(take);
                            return thread;
                        });
                    });
                }
            }),
            (function linkToChannel(take) {
                return function linkToChannel(mvar) {
                    mvar.take(take);
                    return mvar;
                };
            })
        ),

        (function CreateEffRequest(Maybe, Root) {
            var EffRequest = Maybe.extend(function EffRequest() {
                Maybe.apply(this, arguments);
            }, {
                oid: function(oid) {
                    return this.run(function(info) {
                        return oid ? (oid == info.oid) : info.oid;
                    });
                },
                configure: function(values) {
                    var utils = this.utils, that = this;
                    return this.map(function(op) {
                        var params  = op.args ? utils.obj(op.args)(args.length ? args : (values.params || values.args || [])) : (values.args || {});
                        var request = utils.mixin(
                        { oid: that.getSubID() + '' },
                        op, values,
                        { params: utils.val(utils.mixin({}, op.defaults || {}, params)) }
                        );
                        return 
                    });
                },
                interpret: function() {
                    return this.map(function(task) {

                    });
                }
            });
            EffRequest.utils = EffRequest.prototype.utils = Root.get('utils').select('obj', 'mixin', 'values');
            EffRequest.of = function(operation) {
                return new this(operation);
            };
            return EffRequest;
        }),

        (function CreateControl(Root, EffRequest, Maybe, Queue, FreeF) {
            return Root.extend(function GridControl(opts) {
                Root.constructor.call(this, opts);

                this.node('env');
                this.node('dict');
                this.node('ops');
                this.node('req');
                this.node('idx');
                debugger;
                this.cont = FreeF(sys.handler.free('fromCallback'));
                this.set('queue', Queue.of([], this.cont));
            }, {
                addControl: function(name, parent) {
                    var control = this.child({ name: name, parent: parent || this });
                    return control;
                },
                addTask: function(task) {
                    var nodes = this.node('nodes');
                    return nodes.lookup(task.oid).orElse(function() {
                        return nodes.push(task.oid, { task: task, loc: [] });
                    });
                },
                runTask: function(task) {
                    task || (task = {});
                    this.node('nodes').lookup(task.oid).chain(function(ts) {
                        debugger;
                        return ts;
                    });
                },
                addOperation: function(name, op) {
                    var ops  = this.get('ops');
                    var node = ops.ensure(op.type);
                    return node.val(name, op);
                },
                getOperation: function() {
                    var args = Array.prototype.slice.call(arguments),
                    requests = this.get('req'), that = this, check,
                        path = args[0] && typeof args[0] == 'string' ? args.shift() : '',
                      values = args[0] && typeof args[0] == 'object' ? args.shift() : {},
                        name = values.method || values.operation, parts = [], operid = values.oid;

                    if (!path) { path = values.path ? values.path : (values.type + '.' + name); }
                    parts = path.split('.');
                    if (!values.oid) operid = this.get('idx').val(path);

                    if (operid && values.oid && (check = requests.get(values.oid)) && operid == values.oid) {
                      return that.getRequestInstance(check);
                    }else {
                      var utils = sys.get('utils');
                      return this.get('ops').lookup(path).chain(function(op) {
                        var params  = op.args ? utils.get('obj')(op.args)(args.length ? args : (values.params || values.args || [])) : (values.args || {});
                        var request = utils.get('extend')(
                          { oid: operid || (that.id() + ''), dict: that.identifier() },
                          op, values,
                          { params: utils.get('values')(utils.get('extend')({}, op.defaults || {}, params)) }
                        );
                        return EffRequest.of(requests.set(requests.parent('idx').val(path, request.oid), request));
                      });
                    }
                },
                runOperation: function() {
                    return this.putOperation(this.getOperation.apply(this, arguments));
                },
                putOperation: function(request) {
                    //return this.get('queue').enqueue(request);
                    return 
                },
                forkOperation: function(main, fn) {
                    return main.run(function(result) {
                      return fn(result);
                    });
                },
                addHandler: function(data) {
                    return this.get('dict').parse(data, true);
                },
                testOperation: function(args) {
                    console.log([ 'testOperation', args ]);
                },
                testHandler: function(result) {
                    console.log([ 'testHandler', result ]);
                }
            });
        })

    )

);
