                ext: function() {

                    var maybe = sys.model('func.base.maybe');
                    var tuple = sys.model('func.base.tuple');

                    var maybeAddEventListener = maybe(function(wrap) {
                        return function(make) {
                            return wrap(make);
                        }
                    })(function(make) {
                        return function(name, selector) {
                            return make(name, selector);
                        }
                    });

                    var maybeListener = maybe(function(handler) {
                        return function(elem) {
                            return function(name, selector) {
                                return handler(elem)(name)(selector);
                            }
                        };
                    });


                    var maybeHandler = maybe(function(listener) {
                        return function(element) {
                            return function(name, selector) {
                                // returns the generic system listener
                                // for a particlar category of events
                                return listener.pure(element).map(selector);
                            }
                        }
                    });


                    var maybeHandler = maybe(function(lift2) {
                        // lift2 has a core function pre-bound
                        return function(monadicType) {
                            // the monadicType basically feeds the function
                            return lift2(monadicType); // with two additial monads
                            // that it will subsequently ask for
                            // #1 binds handlers #2 is the handler
                        }
                    });

                    var liftOperator = (function(matcher, comprehension) {
                        return function(element) {
                            // feeding the result of this a selector provides a
                            // runnable operation suitable for acting as a listener
                            return matcher.of(element).bind(comprehension);
                        } // liftOperator creates listeners for a category of events
                    });   // (i.e. DOM, DataNode, UI component etc

                    var DOMeventHandler = maybe(function(matchFunction) {
                        return function(element) {
                            return function(selector) {
                                return matchFunction(element, selector);
                            }
                        }
                    })(function matches(element, selector) {
                        return function(evt) {
                            if (evt && evt.target && evt.target.matches(selector)) {
                                if (!element) return true;
                                var elem = evt.target;
                                while (elem) {
                                    if (elem == element) break;
                                    else elem = elem.parentElement;
                                }
                                return !!elem;
                            }
                            return false;
                        }
                    }); // DOMeventHandler creates the DOM event specific *handler* proxy
                        // so the main handler(s) to which the listeners will be attached

                    var DOMeventListener = maybe(function(createFunction) {
                        return function(filter) {

                        }
                    })

                    (function create(evt) {
                        if (evt.src == 'data') {
                            return {
                                src: 'data',
                                uid: evt.uid,
                                ref: evt.ref,
                                type: evt.type,
                                target: evt.target,
                                action: evt.action,
                                value: evt.value
                            };
                        }
                        return {
                            src: 'dom',
                            type: evt.type,
                            target: evt.target,
                            x: evt.clientX || evt.x,
                            y: evt.clientY || evt.y
                        };
                    });

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
                    });


                    (function binder(dispatcher) {
                        return function(addListener) {
                            return function(rootElement) {
                                return addListener(rootElement, dispatcher);
                            }
                        }
                    });

                    var maybeEventControl = maybe(function(tup) {
                        var bin = sys.get('utils.bin');
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

                    var maybeEventDOM = maybeListener(maybe(function(addListener) {
                        return function(elem) {
                            return function(name, stream) {
                                return function(handler) {
                                    return addListener(elem, name, stream(handler));
                                };
                            };
                        };
                    })(maybeEventControl(function(on, off) {
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
                    })));
                    function eventDOM(element, throttle) {
                        return maybeAddEventListener(maybeEventDOM(element || document.body));
                    };

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

                    return [
                        { name: 'maybeEventHandler', fn: maybeEventHandler },
                        { name: 'maybeListener', fn: maybeListener },
                        { name: 'maybeAddEventListener', fn: maybeAddEventListener },
                        { name: 'maybeEventDOM', fn: maybeEventDOM },
                        { name: 'maybeEventControl', fn: maybeEventControl },
                        { name: 'eventListener', fn: eventListener },
                        { name: 'eventDOM', fn: eventDOM }
                    ];