			function comprehension(f_map, f_filter) {
				return function(stream) {
					if (f_filter) {
						stream = filter(stream, f_filter);
					}
					return map(stream, f_map);
				};
			};

			var maybeAddEventListener = maybe(function(wrap) {
				return function(make) {
					return wrap(make);
				}
			})(function(make) {
				return function(name, selector) {
					return make(name, selector);
				}
			});
			var maybeListener = maybe(function(addListener) {
				return function(elem) {
					return function(name, selector) {
						if (selector) {
							if (typeof selector == 'number') {
								return addListener(elem)(name, comprehension(create, matches(selector, elem))(fromCallback));
							}else {
								return addListener(elem)(name, comprehension(create, matches(selector, elem))(fromCallback));
							}
						}else {
							return addListener(elem)(name, map(fromCallback, create));
						}
					}
				};
			});

			var maybeEventControl = maybe(function(tup) {
				return function(continuation) {
					return tup(bin(continuation));
				}
			})(tuple(function on(elem, name, handler) {
				elem.addEventListener(name, handler);
				return {
					name: name,
					run: handler,
					state: 'on'
				};
			})(function off(elem, state, handler) {
				elem.removeEventListener(state.name, handler);
				return {
					name: name,
					run: handler,
					state: 'off'
				};
			}));

			var maybeEventHandler = maybeListener(function(elem) {
				return function(name, stream) {
					return function(handler) {
						return stream(handler);
					}
				}
			});
			function eventListener(element) {
				return maybeAddEventListener(maybeEventHandler(element));
			};

			function fromEvent(target, name) {
				return eventDOM(target)(name);
			};
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

			var withEnqueue = maybe(function(fn) {
				return function(enqueue) {
					return function(next) {
						return fn(next, enqueue);
					};
				};
			})(function(next, enqueue) {
				return function(list) {
					function run() {
						if (!(list.length * list.push.apply(list, Array.prototype.slice.call(arguments)))) {
							enqueue(next);
						}
						return run;
					};
					return run;
				};
			});
			var fromCallback = maybe(function(next) {
				return function(fn) {
					return fn(next);
				}
			})(withEnqueue(enqueue))(function(next) {
				return function fromCallback(continuation) {
					var arr = [];
					return next(fromTuple(continuation)(arr))(arr);
				};
			});