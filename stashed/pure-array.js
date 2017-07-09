(function MakeApp(init, link, make, run) {

    return run(make(link.apply()));
})(

// ========  ======== STAGE INIT ========  ======== //

    (function ImmediateNeeds() {

        return [].slice.call(arguments);
    })(
        (function ImmediateNeeds() {
            (self.unit = (function unit(t) {
                return t;
            }));
            (self.$const = (function $const(x) {
                return function() {
                    return x;
                }
            }));
            (self.pure = (function pure(t) {
                return function pure(f) {
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
            String.prototype.matches = String.prototype.match;
            String.prototype.$_like = new RegExp("([\\.\\\\\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:\\-])", "g");
            String.prototype.like = function(search) {
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
            Array.prototype.prepend = function() {
                this.unshift.apply(this, [].slice.call(arguments));
                return this;
            };
            Array.prototype.append = function() {
                var items = [].slice.call(arguments);
                this.push.apply(this, items.length == 1 && items[0] instanceof Array ? items.shift() : items);
                return this;
            };
            Array.prototype.insert = function(position) {
                this.push.apply(this, this.splice(0, position).concat([].slice.call(arguments, 1)).concat(this.splice(0)));
                return this;
            };
            Array.prototype.call = function(fn) {
                return Array.prototype[fn].apply(this.slice(1), this.slice(0, 1).concat([].slice.call(arguments, 1)));
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

// ========  ======== STAGE ARRAY ========  ======== //

    (function MakeArray() {

        return [].slice.call(arguments);
    })(
        (function MakeLink(dispatcher, makeCollect, makeRoot, makeClosure) {
            return makeClosure(makeRoot(makeCollect(dispatcher.nextTick.enqueue)));
        }),
        (function SetupDispatcher() {
            return [].slice.call(arguments).apply();
        })(
            (function init_dispatcher() {
                var dispatcher = [].slice.call(arguments).apply();
                return {
                    dispatcher: dispatcher,
                    nextTick: dispatcher(unit)()
                };
            }),
            (function run_dispatcher(create_dispatcher, wrapped_dispatcher, process_messages, create_enqueue_platform, close_over) {
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
                        }
                        if (info.suspend || (info.limit < (info.rs = self.now()))) break;
                        else if (++status[TASK_COUNTER] >= status[TASK_BATCH_SIZE]) {
                            status[TASK_COUNTER] = 0; break;
                        }
                    }
                    status[TASK_RUNNING] = false; info.suspend = false;
                    //++TASK_INDEX < tasks.length || (TASK_INDEX = 0);
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
        (function MakeCollect() {
            return [].slice.call(arguments).apply();
        })(
            (function make(link, make, wrap, call, run, next) {
                return function collect(enqueue) {
                    return link(make(wrap, call, run, next, enqueue));
                }
            }),
            (function link(collect) {
                Array.prototype.collect = function() {
                    return collect(this);
                };
                return collect;
            }),
            (function _$_collect(wrap, call, run, next, enqueue) {
                var cnt = { pid: 10000, tot: 0, inc: 0, enq: 0 };
                return function collect(xs) {
                    var ts = { cpid: cnt.pid++, ppid: 0, inc: cnt.inc++, done: 0 };
                    return function $_pure(succ, fail) {
                        ts.ppid = cnt.pid; cnt.enq++;
                        return enqueue(call(wrap(ts, xs), next, run, succ, fail));
                    }
                };
            }),
            (function wrap(ts, xs) {
                return [ xs, xs.map($const(undefined)), ts ];
            }),
            (function call(wrap, next, run, succ, fail) {
                return next(wrap, run(wrap, 0, succ, fail));
            }),
            (function run(values, count, succ, fail) {
                values[2].state = 'run'; console.log(values[2]);
                return function(x, i) {
                    function set(result) {
                        values[1][i] = result;
                        count++;
                        if (count == values[1].length) {
                            values[2].state = 'done';
                            values[2].done++;
                            console.log(values[2]);
                            succ(values[1]);
                        }
                    };
                    if (x instanceof Function && x.name == '$_pure') {
                        x(set);
                    }else if (x instanceof Array) {
                        x.run(set);
                    }else {
                        set(x);
                    }
                };
            }),
            (function next(x, f) {
                var i = 0;
                return function(info) {
                    if (i < x[0].length) {
                        f(x[0][i], i++);
                    }
                    return i >= x[0].length;
                }
            })
        ),
        (function MakeRoot() {
            return [].slice.call(arguments).pure(0, true);
        })(
            (function init(items) {
                return function root(collect) {
                    return items.insert(2, collect).apply(0, true);
                }
            }),
            (function root() {
                return [].slice.call(arguments).call('reduce', [].node('arr'));
            }),
            (function parse(r, f) {
                if (f.name.substr(0, 2) == '$_') {
                    r.set(f.name.substr(2), r.get('makeArgs')(f, r.get('getArgs')(f), r));
                }else {
                    r.set(f.name, f);
                }
                return r;
            }),
            (function node() {
                this.prototype.emit = function() {

                };
                this.prototype.parent = function(key) {
                    return this._parent ? this._parent.get(key) : null;
                };
                this.prototype.get = function(key) {
                    if (arguments.length > 1) return this.path.apply(this, arguments);
                    else if (key && typeof key == 'string' && (this._map[key]>=0)) return this._val[this._map[key]];
                    //else if (key && typeof key == 'string' && key.substr(0, 1) == '*') return this.values(key.substr(-1, 1) == '!' ? true : (key.length - 1));
                    else if (key && typeof key == 'number') return key >= 0 && key < this._val.length ? this._val[key] : undefined;
                    else if (key && key.indexOf && key.indexOf('.') > 0) return this.path.apply(this, arguments);
                    else if (key && key instanceof Array) return key.length > 1 ? this.path.apply(this, arguments) : this.get(key.slice(0).shift())
                    else return key ? undefined : (this._ref || this);
                };
                this.prototype.keys = function() {
                    return this._ids;
                };
                this.prototype.set = function(key, value) {
                    return key && key.indexOf && key.indexOf('.') > 0 ? this.ext('path')(key, value)
                    : (this._val[(this._map[key] >= 0
                        && !this.emit('change', key, 'update', value) ? this._map[key]
                    : (
                        this._map[this.emit('change', key, 'create', value)||key] = this._ids.push(key)-1))] = value);
                };
                this.prototype.add = function() {
                    var args = [].slice.call(arguments);
                    var vals = args[args.length-1] instanceof Array ? args.pop() : [];
                    var name = args.length && typeof args[0] == 'string' ? args.shift() : (vals._cid || vals.name);
                    return this.get(name) || this.set(name, vals.node({ name: name, parent: this }));
                };
                this.prototype.path = function path() {
                    return [].slice.call(arguments).join('.').split('.').reduce(function(result, key) {
                        if (!key || !result) {
                            return result;
                        }else if (result instanceof Array) {
                            result = result.get(key);
                        }else if (typeof result == 'object') {
                            result = result[key];
                        }
                        return result;
                    }, this);
                };
                return (this.prototype.node = function node(options) {
                    var opts = options ? (typeof options == 'string' ? { name: options } : options) : {};

                    this._val    = this._val || this;
                    this._map    = this._map || {};
                    this._ids    = this._ids || [];

                    this._cid    = this._cid || (opts.cid || opts.name || this._id || '');
                    this._cache  = this._cache || {};

                    if (opts.parent) {
                        this._parent = opts.parent;
                        this._level  = (this._parent._level  || (this._parent._level  = 0)) + 1;
                        this._offset = (this._parent._offset || (this._parent._offset = 0)) + (opts.offset || 0);
                    }else {
                        this._level  = 0;
                        this._offset = opts.offset || 0;
                    }
                    return this;
                });
            }).call(Array),
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
            (function getArgs(func) {
                // Courtesy: https://davidwalsh.name/javascript-arguments
                var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];
                return args.split(',').map(function(arg) {
                    return arg.replace(/\/\*.*\*\//, '').trim();
                }).filter(function(arg) { return arg; });
            }),
            (function makeArgs(func, args, arr) {
                return func.apply(undefined, args.map(function(a, i, r) {
                    return arr.get(a.replace('$_', ''));
                }));
            }),
            (function $_parse(makeArgs, getArgs) {
                return function parse(r, f) {
                    if (f.name.substr(0, 2) == '$_') {
                        r.set(f.name.substr(2), makeArgs(f, getArgs(f), r));
                    }else {
                        r.set(f.name, f);
                    }
                    return r;
                }
            }),
            (function $_make(parse) {
                return function(opts) {
                    var options = typeof opts == 'object' ? opts : { name: opts };
                    options.parent || (options.parent = this);
                    return this.reduce(parse, this.node(options));
                }
            }),
            (function replace(position) {
                var args = [].slice.call(arguments, 1);
                args.push.apply(args, this.splice(position).slice(args.length));
                this.push.apply(this, args);
                return this;
            }),
            (function unspar() {
                this.push.apply(this, this.splice(0).filter(function(x) { return !(x === null || typeof x == 'undefined'); }));
                return this;
            }),
            (function ap(f, x) {
                return function pure(succ, fail) {
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
            (function $_fmap($_ap) {
                return function fmap(f, x) {
                    return $_ap(pure(f), x);
                };
            }),
            (function fmap(f, x) {
                return function $_pure(succ, fail) {
                    x(function(r) {
                        succ(f(r));
                    });
                }
            }),
            (function $_lift($_fmap, $_collect) {
                return function lift(f) {
                    return Array.of($_fmap(function(xs) {
                        return f.apply(undefined, xs && xs.length == 1 ? xs.shift() : xs);
                    }, $_collect(this)));
                };
            }),
            (function fold(f, x, c) {
                function _fold(f, s, array) {
                    var i = 0;
                    while(i<array.length) {
                        s = f(s, array[i], i++, array);
                    }
                    return s;
                }
                return [ pure(f), pure(x || []), c ? this.shift() : this.collect() ].lift(_fold);
            }),
            (function bind($map, $run, $bind, $wrap) {
                return function bind(f) {
                    return this.map($bind(f, $run, $map, $wrap)(this));
                };
            })(
                (function $map(f, a) {
                    function bound(x) {
                        return x instanceof Array ? x.map($map(f, x)) : f(x, a);
                    };
                    return bound;
                }),
                (function $run(f, r) {
                    return function run(x, i, o) {
                        if (x instanceof Array) {
                            return x.map(r(x));
                        }else {
                            return f(x, i, o);
                        }
                    };
                }),
                (function $bind(f, r, m, w) {
                    return function $map(o) {
                        return r(function(x) {
                            return w(m(f, o), x);
                        }, $map);
                    };
                }),
                (function $wrap(f, x) {
                    return function $_pure(k) {
                        if (x instanceof Function && x.name == '$_pure') {
                            return x(function(r) {
                                k(f(r));
                            });
                        }else {
                            return k(f(x));
                        }
                    }
                })
            ),
            (function combine(make) {
                return function combine(f, arr, index) {
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
            (function flatmap() {
                return [].slice.call(arguments).apply();
            })(
                (function make($_apply) {
                    return function flatmap(f) {
                        return this.chain($_apply(f || unit, this));
                    };
                }),
                (function() {
                    function flat(x, f) {
                        return Array.prototype.concat.apply([], x.map(f));
                    };
                    function bind(f, o) {
                        function bound(x, i) {
                            return x instanceof Array ? flat(x, bind(f, x)) : f(x, i, o);
                        };
                        return bound;
                    };
                    return function(f, o) {
                        return function $_apply(x, i) {
                            if (x instanceof Array) {
                                return flat(x, bind($_apply, x));
                            }else {
                                return f(x, i, o);
                            }
                        }
                    };
                })()
            ),
            (function ap($test, $map, $ap) {
                return function ap(f, g, h, t) {
                    return this.map($ap(f, g || $test, h || $map, t || unit));
                };
            })(
                (function(x) {
                    return x instanceof Array;
                }),
                (function(x, r, f) {
                    return x.map(r).fmap(f);
                }),
                (function(f, g, h, t) {
                    return function ap(v, k, o, i) {
                        if (g(v, k, o)) { // If condition
                            return h(v, ap, f); // Map values recursively
                        }else {
                            return t(v, k, o, i); // Map a single value
                        }
                    };
                })
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
            )
        ),
        (function MakeClosure(root) {
            Array.prototype.$ap = function(fn) {
                return root.get(fn).apply(undefined, [].slice.call(arguments, 1))(this);
            };
            Array.prototype.make = root.get('make');
            Array.prototype.ap = root.get('ap');
            Array.prototype.bind = root.get('bind');
            Array.prototype.fmap = function(f) {
                return root.get('fmap')(f, this.collect());
            };
            Array.prototype.chain = function(f) {
                return [ this.fmap(f) ];
            };
            Array.prototype.at = function(index) {
                return this.length && index < this.length ? this[index] : [];
            };
            Array.prototype.first = function(f) {
                return this.chain(function(result) {
                    return (f || unit)(result.at(0));
                });
            };
            Array.prototype.index = function(f) {
                var i = 0, j = 0, l = this.length;
                return this.bind(function(value, store) {
                    return (f || unit)(value, i < l ? i++ : (i = 0), (j < l || (j = 0) ? (!i && ++i ? ++j : j) : j), store);
                });
            };
            Array.prototype.identifier = root.get('identifier');
            Array.prototype.lift = root.get('lift');
            Array.prototype.fold = root.get('fold');
            Array.prototype.combine = root.get('combine');
            Array.prototype.flatmap = root.get('flatmap');
            Array.prototype.flatten = root.get('flatmap');
            Array.prototype.select = root.get('select');
            Array.prototype.run = function(succ, fail) {
                return this.collect()(succ || unit, fail);
            };
            Array.prototype.log = function(succ, fail) {
                return this.flatten().bind(console.log.bind(console)).run();
            };
            return root;
        })
    ),

// ========  ======== STAGE SYS ========  ======== //

    (function MakeSys() {

        return [].slice.call(arguments).apply();
    })(
        (function wrap(init, make) {
            return function(arr) {
                return (self.sys = init.call({}, arr, make));
            }
        }),
        (function init(arr, make) {
            var root = [].node('root');
            root.set('arr', arr);
            this.of  = Array.of;
            return make.call(this, root);
        }),
        (function make(root) {
            this.get = function(key) {
                return root.get(key);
            };
            this.type = function(name) {
                return root.get('model.types', name);
            };
            this.run = function(key, fn) {
                return Array.of(root.get(key)).map(function(item) {
                    return fn.call({ root: root, model: item.parent() }, item);
                });
            };
            return this;
        })
    ),

// ========  ======== STAGE NODE ========  ======== //

    (function MakeNode() {

        return [].slice.call(arguments).apply(0, true);
    })(
        (function wrap(make, model, store, storage) {
            return function(sys) {
                return make(model(), store(), storage(), sys, sys.get());
            }
        }),
        (function make(model, store, storage, sys, root) {
            return model('model')(function(mdl) {

                // var vals = mdl.func.get('values')(mdl).node({ name: 'model', parent: root });
                // return root.add('model').append(vals).bind(function(item, parent) {
                //     if (item instanceof Array) {
                //         return parent.add()
                //     }else if (typeof item == 'object') {
                //         return 
                //     }
                // });

                return pure(root.add('model', mdl.func.get('cast')(mdl, 'model', root)));


                // var imp = mdl.func.get('import');
                // return imp(root, 'model', mdl);

            })(function(mdl) {
                return sys.of(
                    mdl.get('types').add('store', mdl.get('func.cast')(store, 'store', mdl)),
                    mdl.get('types').add('storage', mdl.get('func.cast')(storage, 'storage', mdl))
                ).lift(function($store, $storage) {

                    return sys.run('model.klass', function(klass) {

                        return sys.of(
                            klass.get('make').call(this, 'store'),
                            klass.get('make').call(this, 'storage')
                        );

                    }).lift(function($store, $storage) {

                        var Storage = $store.prototype.storage = new $storage({ name: 'storage' });
                        $storage.prototype.node = $store;
                        return (sys.root = Storage.add({ name: 'root', val: root }));

                    }).run(function(x) {
                        x.run(unit)
                        console.log(x);
                    });
                }).run(function(x) {
                    x.run(unit)
                    console.log(x);
                });
            });
        }),
        (function BaseSysModel() {
            return {
                func: [
                    (function maybe(m) {
                        return function(l) {
                            return function(r) {
                                return m(l)(r);
                            }
                        }
                    }),
                    (function call(ctx) {
                        return function(f) {
                            return f(ctx);
                        }
                    }),
                    (function(nativeKeys, nativeHas) {
                        return function keys(obj) {
                            if (typeof obj != 'object') return [];
                            if (obj instanceof Array) return obj.map(function(v, i) {
                                return v && v.name ? v.name : i;
                            });
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
                    (function $_cast($_keys, $_values) {
                        return function cast(value, name, parent) {
                            if (value instanceof Array) {
                                return value.make({ name: name, parent: parent });
                            }else if (typeof value == 'object') {
                                return $_keys(value).reduce(function(result, key, index) {
                                    result.set(key, cast(result[index], key, result));
                                    return result;
                                }, $_values(value).node({ name: name, parent: parent }));
                            }else {
                                return value;
                            }
                        }
                    }),
                    (function runlevel(keys, vals, $$_import) {
                        return keys.flatmap(function(k, ks) {
                            var item = vals[ks];
                            if (item instanceof Array) {
                                return $$_import(vals, k, item);
                            }else if (typeof item == 'object') {
                                return $$_import(vals, k, item);
                            }else {
                                console.log(item);
                                return item;
                            }
                        });
                    }),
                    (function $_node($_values) {
                        return function(value, opts) {
                            return value && value instanceof Array ? value.node(opts) : $_values(value).node(opts);
                        }
                    }),
                    (function $_import($_keys, $_values, $_runlevel, $_node) {
                        return function $$_import(parent, name, value) {
                            return $_runlevel(
                                $_keys(value),
                                parent.set(name, $_node(value, { name: name, parent: parent })),
                                $$_import
                            );
                        }
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
                    (function target(obj) {
                        return function(fn) {
                          return function() {
                            var args = Array.prototype.slice.call(arguments);
                            return !obj ? null : (!fn ? obj :
                              (fn instanceof Function ? fn.apply(obj, args) :
                                (obj && obj[fn] && obj[fn].apply ? obj[fn].apply(obj, args) : null)));
                          };
                        };
                    })
                ].make('func'),
                core: [
                    (function objpath(name, target, value) {
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
                    (function ext(extension) {
                        return function(name) {
                            return extension[name] && extension[name] instanceof Function
                                ? extension[name](this) : extension[name];
                        }
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
                    (function $named(run) {
                        return function named(codeOrName) {
                            var code = codeOrName.toTypeCode(), name = codeOrName.toCamel();
                            return run(function($$__purejs) {
                                var script = document.createElement('script');
                                script.innerHTML = '$$__purejs.push(pure((function Make'+name+'() { return function '+name+'() { this.id(); this.ctor.apply(this, arguments); if (this.__level__ && !(this.__level__ = 0)) this.__super__.call(this);  }; })()))';
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
                    )
                ],
                klass: [
                    (function makeID() {
                        var counter = { cid: 100000 };
                        return function id() {
                            return (this._id = counter.cid++);
                        }
                    }),
                    (function is(value) {
                        return value && 
                            (value instanceof this.constructor
                                || (value.deriving && value.deriving.indexOf(this.constructor) >= 0)) ? true : false;
                    }),
                    (function $super() {
                        if (this.__level__) this.__parent__[--this.__level__].ctor.apply(this, [].slice.call(arguments));
                        if (!this.__level__) this.__super__ = function(fn) { return this.__parent__[this.__parent__.length-1][fn].apply(this, [].slice.call(arguments, 1)); };
                    }),
                    (function ext(model, proto, items, names) {
                        var nms = names && names instanceof Array ? names.slice(0) : [];
                        return items.reduce(function(prto, fn, idx) {
                            var name, item;

                            if (typeof fn == 'object') {
                                name = fn.name; item = fn;
                            }else {
                                item = fn;
                                name = item.name;
                            }
                            if ((name || (name = item.name))) {
                                prto[name] = item;
                            }else if (nms.length && idx < nms.length) {
                                prto[nms[idx]] = item;
                            }else if ((item = model.factory.unwrap(item))) {
                                prto[item.name] = item;
                            }
                            return prto;
                        }, proto);
                    }),
                    (function inherit(type, model) {
                        var klass  = type.get('klass'), superr = type.get('super');
                        var parent = superr ? model.get('types.ctor', superr) : null;
                        if (parent) {
                            var F = function() {};
                            F.prototype = parent.prototype;
                            var proto = new F(); klass.parent = type.parent;
                            proto.__parent__ = proto.__parent__.slice(0);
                            proto.__level__  = proto.__parent__.push(F.prototype);
                            proto.__super__  = model.get('klass.$super');
                        }else {
                            var proto = {
                                __parent__: [], __level__: 0,
                            }
                        }
                        var ext = model.get('klass.ext');
                        proto = ext(model, proto, type.get('ext')); ext(model, klass, type.get('attrs') || []);
                        if (type.get('deriving')) proto.deriving = type.get('deriving'); 
                        if (!proto.pure)   proto.pure  = pure;
                        //if (!proto.ext)    proto.ext   = model.find('func', 'core', 'ext')(this.ext({}, this.func(type.name), model));

                        if (proto.from && !klass.from) klass.from = proto.from;
                        if (!klass.of) klass.of = type.get('of') || model.get('klass.of');
                        proto.constructor = klass; proto.ctor = type.get('ctor');
                        klass.prototype = proto;
                        if (!klass.prototype.is) klass.prototype.is = model.get('klass.is');
                        if (!klass.prototype.id) klass.prototype.id = model.get('klass.makeID')();
                        return klass;
                    }),
                    (function unwrap(item, names) {
                        var name = names && typeof names == 'string' ? names : item.name;
                        if (item instanceof Function) {
                            if (!name) name = item.name;
                            if (name && name.substr(0, 2) == '$_' || name == 'ext') {
                                data = item.call({});
                                if (data) {
                                    if (!data.name) data.name = name;
                                    else (data.name = name);
                                    return data;
                                }
                            }
                            return item;
                        }else if (item instanceof Array) {
                            return item;
                        }
                        return item;
                    }),
                    (function type(name, model) {
                        var type = model.get('types', name) || { name: name };
                        if (!type.get('ctor'))   type.set('ctor', model.get('ctor', name));
                        if (!type.get('ext'))    type.get('ext',  model.get('func', name));
                        if (model.get('attrs').get(name)) type.set('attrs', model.get('attrs', name));
                        if (!type.get('klass'))  type.set('klass', model.get('core.named')(name));
                        if (!type.get('super')) {
                            if ((type.set('super', type.get('parent') || model.get('model.parents', name)))) {
                                type.parent = model.get('types.ctor', type.super)
                                    || model.get('klass.make')(model, type.super);
                            }
                        }
                        if (false && !type.deriving) {
                            type.deriving = (model.get('model', 'deriving', name) || []).map(function(deriv) {
                                return model.find('types', 'ctor', deriv)
                                        || model.factory.make(model, deriv)
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
                    (function $_make($_inherit, $_type, $_walk) {
                        return function make(name) {
                            var model = this.model;
                            var exist = model.get('types.ctor').get(name);
                            if (exist && exist.name && exist.name.toLowerCase() == name) return exist;

                            var klass = $_inherit($_type(name, model), model);
                            var type  = model.get('types.ctor').set(name, klass);

                            var walk  = $_walk(klass);
                            if (!klass.of)   klass.of   = walk('of') || klass.prototype.of;
                            if (!klass.pure) klass.pure = walk('pure');
                            return klass;
                        }
                    })
                ],
                types: { ctor: {} },
                attrs: {},
                wrap: function() {
                    return this.func[0](function(model) {
                        return function(name) {
                            if (name == 'model') {
                                return model.func[1](model);
                            }
                        }
                    })(this);
                }
            }.wrap();
        }),
        (function() {
            return {
                name: 'store',
                ctor: function ctor(opts) {
                    this.store.call(this, opts);
                },
                ext: [
                    (function store(opts) {
                        opts || (opts = {});
                        typeof opts == 'object' || (opts = { name: opts });

                        if (opts.val && opts.val._cid) {
                            this._val = opts.val || [];
                            this._map = opts.val._map || {};
                            this._ids = opts.val._ids || [];
                            this._val._obj = this;
                        }else {
                            this._val = [];
                            this._map = {};
                            this._ids = [];                            
                        }
                        this._ref = this.is(opts.ref) ? opts.ref : (this.is(opts) ? opts : this);
                    }),
                    (function uid() {
                        return this._id;
                    }),
                    (function cid() {
                        return this._cid || this._id;
                    }),
                    (function of(opts) {
                        return (this.storage || (this.constructor.prototype.storage = this)).add(this, opts);
                    }),
                    (function extract(item) {
                        return item ?
                            item.name || item._cid || item._id || item.id
                                || (typeof item == 'string' ? item : this.id()) : this.id();
                    }),
                    (function emit() {
                        // NOOP //
                    }),
                    (function add(name) {
                        var id = this.extract(name);
                        return this.get(id) || this.set(id, this.of(name)._val);
                    }),
                    (function child(name) {
                        var id = this.extract(name);
                        return this.get(id) || this.set(id, this.of(name));
                    }),
                    (function get(key) {
                        if (key && typeof key == 'string' && (this._map[key]>=0)) return this._val[this._map[key]];
                        //else if (key && typeof key == 'string' && key.substr(0, 1) == '*') return this.values(key.substr(-1, 1) == '!' ? true : (key.length - 1));
                        else if (key && typeof key == 'number') return key >= 0 && key < this._val.length ? this._val[key] : undefined;
                        else if (key && key.indexOf && key.indexOf('.') > 0) return this.ext('path')(key);
                        else if (key && key instanceof Array) return key.length > 1 ? this.ext('path')(key) : this.get(key.slice(0).shift())
                        else return key ? undefined : (this._ref || this);
                    }),
                    (function keys() {
                        return this._ids;
                    }),
                    (function vals() {
                        return this._val;
                    }),
                    (function __get(key) {
                        return this.get(key);
                    }),
                    (function set(key, value) {
                        return key && key.indexOf && key.indexOf('.') > 0 ? this.ext('path')(key, value)
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
                    (function values(recur) {
                        var node = this;
                        return node._val.reduce(function(result, value, index) {
                            result[node._ids[index]] = recur && node.is(value)
                                ? value.values(typeof recur == 'number' ? (recur - 1) : recur) : value;
                            return result;
                        }, {});
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
                ]
            };
        }),
        (function() {
            return {
                name: 'storage',
                parent: 'store',
                ctor: function ctor(opts) {
                    this._val = opts.val || [];
                    this._map = opts.map || {};
                    this._ids = opts.ids || [];
                    this._ref = this.is(opts.ref) ? opts.ref : (this.is(opts) ? opts : this);
                },
                ext: [
                    (function store() {
                        return (this._store || (this._store = this.add(this)));
                    }),
                    (function of(opts) {
                        return new this.node(opts);
                    }),
                    (function make(name) {
                        var str = this.extract(name);
                        if (this.is(name)) {
                            return this.add(name);
                        }else {
                            return this.set(str, new this.node(str));
                        }
                    }),
                    (function child(parent, name) {
                        var ref = this.make('meta');
                        ref.set('storage', this.uid());
                        ref.set('parent', parent.uid());
                        var add = this.make(name);
                        ref.set('child',  add.uid());
                        return add;
                    })
                ]
            };
        })
    )

);
    