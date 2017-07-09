(function MakeApp(make, store, dispatcher, make) {

	var root = make(store);
	root.add('scheduler').from();

	sys.nextTick   = sys.dispatcher(unit);

	return (self.sys = sys);

})(

	(function MakeSys() {
		return function(store) {
			return store.of({});
		}
	})(

		(function MakeSelf() {
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
			self.isMobile = (function isMobile() {
				var check = false;
				(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
				return check;
			})();
			self.isWorker = (function isWorker() {
				var self = this; return (self.document === undefined);
			})();
			self.rafNext = 0;
			self.now = (function now(run) {
				return run();
			})((function() {
				var perf = self.performance;
				if (perf && (perf.now || perf.webkitNow)) {
					var perfNow = perf.now ? 'now' : 'webkitNow';
					return perf[perfNow].bind(perf);
				}else { return Date.now; }
			}));
			self.$const = (function $const(a) {
				return function() {
					return a;
				}
			});
			self.unit = (function unit(x) {
				return x;
			});
			self.pure = (function pure(t) {
				return (function pure(f) {
				return f(t);
				});
			});
			self.call = (function call(f) {
				return function(t) {
					return f(t);
				}
			});
			(self.apply = (function apply(f) {
				return function() {
					return f.apply(undefined, arguments);
				}
			}));
		})(),

		(function MakeArray() {
			function $apply(x) {
				if (x instanceof Array) {
					return x.bind($apply).apply();
				}else {
					return x;
				}
			};
			this.prototype.apply = function(idx, recur) {
				if (recur || idx === true) {
					return this.bind($apply);
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
		}).call(Array),

		(function MakeArray(pure) {
			this.prototype.pure = function(idx, slice) {
				return typeof idx != 'undefined' &&
					idx < this.length && this[idx] instanceof Function
						? this[idx](slice ? this.slice(idx+1) : this) : pure(this);
			};
			this.prototype.wrap = function(fn) {
				return (fn || $const)(this);
			};
			this.pure = function() {
				return pure([].slice.call(arguments));
			};
			return this;
		}).call(Array,
			(self.pure = (function pure(t) {
				return (function pure(f) {
				return f(t);
				});
			}))
		),

		(function MakeFlatten() {
			function bind(f) {
				return function(x) {
					return x instanceof Array ? x.bind(bind(f)) : f(x);
				}
			};
			this.prototype.flatmap = function(f) {
				return this.bind(bind(f));
			};
			this.prototype.flatten = function() {
				return this.bind(bind(unit));
			};
			return this;
		}).call(Array),

		(function MakeArray() {
			this.prototype.bind = function(f) {
				return Array.prototype.concat.apply([], this.map(f));
			};
			this.prototype.fold = function(f, r) {
				this.forEach(function(v, i, a) {
					return (r = f(r, v, i, a));
				});
				return r;
			};
			this.prototype.make = function() {
				this.push.apply(this, [].slice.call(arguments));
				return this;
			};
			return this;
		}).call(Array)
	),

	(function MakeStore(ctor, ext, attrs, of) {
		return of(attrs.call(ext.call(ctor())));
	})(
		(function MakeCtor() {
			return function Store(ref) {
				this._ids = [];
				this._map = {};
				this._val = [];
				this._ref = ref;
			}
		}),
		(function MakeExt() {
			this.prototype.of = function(ref) {
				return new this.constructor(ref || this);
			};
			this.prototype.get = function(key) {
				return typeof key == 'undefined' ? this : this._val[this._map[key]];
			};
			this.prototype.set = function(key, value) {
				return (this._val[(this._map[key] = (this._ids.push(key) - 1))] = value);
			};
			this.prototype.child = function(name, ref) {
				return this.set(name, this.of(ref));
			};
			this.prototype.map = function(f) {
				return this._val.map(f);
			};
			return this;
		}),
		(function MakeAttrs() {
			function node(store) {
				return {
					of: function(ref) {
						return store.of(ref);
					},
					get: function(key) {
						return store.get(key);
					},
					set: function(key, value) {
						return store.set(key, value);
					},
					put: function(value) {
						return store.set(value.name, value);
					},
					map: function(f) {
						return function(k) {
							return store.map(f);
						}
					},
					make: function(items) {
						return items.map(store.put);
					}
				};
			};
			this.node = function(opts) {
				return node(this.of(opts));
			};
			return this;
		}),
		(function MakeOf(Store) {
			function store(opts) {
				return new Store(opts);
			};
			Store.of = function(opts, base) {
				return base ? store(opts) : new this(opts);
			};
			return Store;
		})
	),

	(function MakeScheduler() {
		return [].slice.call(arguments);
	})(
		(function MakeDispatcher(create_dispatcher, wrapped_dispatcher, process_messages, create_enqueue_platform, close_over) {
			return (function(cb, timer) { return cb(create_dispatcher(wrapped_dispatcher, process_messages, close_over, create_enqueue_platform, timer)); });
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
			return [ tasks, status, run, create_enqueuer(tasks(), status(), run) ];
		})
		// (function close_over(tasks, status, run, create_enqueuer) {
		// 	return (function() {
		// 		return { tasks: tasks, status: status, run: run, enqueue: create_enqueuer(tasks(), status(), run) };
		// 	});
		// })
	),

	(function MakeTypes() {
		return [].slice.call(arguments).pure(0, true);
	})(
		(function make(items) {
			return function(store) {
				items.map(store.put);
				return store;
			}
		}),
		(function property(prop) {
			return function(obj) {
				return obj[prop];
			}
		}),
		(function target(obj) {
			return function(prop) {
				return obj[prop];
			}
		}),
		(function bin(f) {
			return function(x) {
				return function(y) {
					return f(x, y);
				}
			}
		}),
		(function compose(f) {
			return function(g) {
				return function(a) {
					return g(f(a));
				}
			}
		}),
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
		(function maybe(mv, mf) {
			return (typeof mv === 'undefined' || mv === null) && (mf && mf instanceof Function) ? mf(mv) : null;
		})
	)

);
