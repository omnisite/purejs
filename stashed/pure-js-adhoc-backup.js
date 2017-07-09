    (function Setup(utils, scheduler, threads, xhr) {
        console.log('Setup');
        return function setup(base) {
            threads(base.root, scheduler(utils(base)));
            base.xhr = xhr(base.root.get('utils'));
            return pure(base);
        }
    })(
        (function Utils(parseFn, parseFnDeps, baseFn, wrap) {
            return function(base) {
                var root  = base.root;
                var utils = parseFn(baseFn(), root.child('utils'));

                utils.set('parseFn', parseFn);
                utils.set('parseFnDeps', parseFnDeps(utils.get('getArgs'), utils.get('prop'))).call(undefined, wrap(), utils);

                self.unit    = utils.get('unit');
                self.$const  = utils.get('$const');

                var klass = base.node;
                klass.ext('parse', utils.get('parse'));
                klass.ext('select', utils.set('$select', utils.get('pass')(utils.get('select'))));

                var store = base.store;
                store.ext('values', utils.get('values'));

                return base;
            }
        })(
            (function parseFn(args, node) {
                node || (node = this);
                var item, type = args instanceof Array ? 'A' : 'O';
                var keys = type == 'A' ? args.slice(0) : Object.keys(args);
                while (keys.length && (item = keys.shift())) {
                    if (type == 'O') node.set(item, args[item]);
                    else node.set(item.name, item);
                };
                return node;
            }),
            (function parseFnDeps(getArgs, prop) {
                return function parseFnDeps(funcs, node) {
                    node || (node = this); var func;
                    while (funcs.length && (func = funcs.shift())) {
                        func = func.apply(undefined, getArgs(func).map(function(arg) {
                          return node.get(arg) || prop(arg);
                        }));
                        node.set(func.name, func);
                    }
                    return node;
                }
            }),
            (function baseFn() {
                return [].slice.call(arguments).pure(0);
            })(
                self.$const,
                self.unit,
                self.pure,
                (function getArgs(func) {
                  // Courtesy: https://davidwalsh.name/javascript-arguments

                  // First match everything inside the function argument parens.
                  var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];
                 
                  // Split the arguments string into an array comma delimited.
                  return args.split(',').map(function(arg) {
                    // Ensure no inline comments are parsed and trim the whitespace.
                    return arg.replace(/\/\*.*\*\//, '').trim();
                  }).filter(function(arg) {
                    // Ensure no undefined values are added.
                    return arg;
                  });
                }),

                (function MakeArray() {
                    this.prototype.apply = function(idx, recur) {
                        return this[idx||0].apply(undefined, this.slice((idx||0)+1));
                    };
                    return (this.of = function array() {
                        return [].slice.call(arguments);
                    });
                }).call(Array),

                (function MakeAp(test, map, ap) {
                    Array.prototype.ap = function(f, g, h, t) {
                        return ap(f, g || test, h || map, t || unit)(this);
                    };
                    return function arrayAp(f, g, h, t) {
                        return function() {
                            return [].slice.call(arguments).ap(f, g, h, t);
                        }
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

                (function prop(key) {
                  return function(obj) {
                    return !obj ? void 0 : (obj[key] instanceof Function ? obj[key]() : obj[key]);
                  };
                }),

                (function extract(fn) {
                  return fn(unit);
                }),

                (function _1(f) {
                  return function(t) {
                    return f(t);
                  };
                }),

                (function atom(f, t) {
                  return function() {
                    return f(t);
                  };
                }),

                (function lazy(v) {
                    return function() {
                        return v();
                    }
                }),

                (function get(obj, key) {
                  return obj && obj[key]
                    ? (obj[key] instanceof Function ? obj[key]() : obj[key])
                      : null;
                }),

                (function wrap(pre, post) {
                    return function wrap(f, i) {
                        return pre(f, i, post);
                    }
                })(
                    (function(f, i, p) {
                        return function(x, n) {
                            i.runcount++; 
                            if (!i.maxdepth || ((i.depth - i.base) < i.maxdepth)) {
                                i.depth++;
                                return p(f(x), i);
                            }else {
                                return x.pure ? x.pure() : pure(x);
                            }
                        }
                    }),
                    (function(r, i) {
                        i.depth--; i.mapcount+=r.length; return r;
                    })
                ),

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
                        return !obj || !fn ? null :
                          (fn instanceof Function ? fn.apply(obj, args) :
                            (obj && obj[fn] && obj[fn].apply ? obj[fn].apply(obj, args) : null));
                      };
                    };
                }),

                (function role(proto) {
                    return function(instance) {
                      return function() {
                        var args = [].slice.call(arguments);
                        return !proto || !args.length ? null : (proto[args.shift()]||unit).apply(instance, args);
                      };
                    };
                }),

                (function(nativeKeys, nativeHas) {
                  return function keys(obj) {
                    if (typeof obj != 'object') return [];
                    else if (obj instanceof Array) return obj.map(function(v, i) {
                      return v && v.name ? v.name : i;
                    });
                    else if (nativeKeys) return nativeKeys(obj);
                    var keys = [];
                    for (var key in obj) if (nativeHas.call(obj, key)) keys.push(key);
                    if (hasEnumBug) collectNonEnumProps(obj, keys); // Ahem, IE < 9.
                    return keys;
                  };
                })(Object.keys, Object.hasOwnProperty),

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

                (function call(f) {
                    return function() {
                        return f(this);
                    }
                }),

                (function apply(f, c) {
                    return function() {
                        return f.apply(c, arguments);
                    }
                }),

                (function pass(f) {
                    return function() {
                        return f(this).apply(undefined, arguments);
                    }
                }),

                (function guard(fn) {
                    return function(val) {
                        return fn(val);
                    }
                }),

                (function create(c, f, g) {
                    return function(x, y) {
                        return g(new c(f(x || this), y));
                    };
                }),

                (function combine(f) {
                  return function(g) {
                    return function() {
                      return g(f.apply(undefined, arguments));
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

                (function andThen(f) {
                    return function(g) {
                        return function(a) {
                            return f(g(a));
                        }
                    }
                }),

                (function extend(dest, source, copyFunc) {
                  var name, s, i, empty = {}, copyFn = copyFunc && copyFunc instanceof Function ? copyFunc : false;
                  for(name in source){
                      s = source[name];
                      if (copyFunc === false && s instanceof Function) continue;
                      if(((dest._NAMEDMAP && (name in dest)) || ((!dest._NAMEDMAP && !(name in dest)) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))))) {
                          dest[name] = copyFn ? copyFn(s) : s;
                      }
                  }
                  return dest;
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

                (function atomize(f, ctx) {
                    return function() {
                        var args = [].slice.apply(arguments);
                        return function() {
                            return f.apply(ctx || undefined, args.concat.apply(args, arguments));
                        };
                    };
                }),

                (function arrayMap(fmap, filter) {
                    return function $arrayMap(arr) {
                        var l = arr.length, v;
                        var result = [];
                        for (var i = 0; i < l; i++) {
                            v = fmap(arr[i]);
                            if (!filter || filter(v)) result.push(v);
                        }
                        return result;
                    };
                }),

                (function arrayApply(fs) {
                    return function $arrayApply(xs) {
                        var result = [];
                        var n = 0, fsi;
                        for (var i = 0, l = fs.length; i < l; i++) {
                            var fsi = fs[i] && fs[i] instanceof Function ? fs[i] : unit;
                            for (var j = 0, k = xs.length; j < k; j++) {
                                result[n++] = fsi(xs[j]);
                            }
                        }
                        return result;
                    };
                }),

                (function pipe(f, g) {
                    return function $pipe(succ, fail) {
                        return f(function(value) {
                            return g(value)(succ, fail);
                        }, fail);
                    };
                }),

                (function cont(mv, mf) {
                    return function pure(continuation) {
                        return mv(function(value) {
                            return mf(value)(continuation);
                        });
                    };
                }),

                (function val(mv) {
                    return function pure(continuation) {
                        return mv(function(value) {
                            return continuation(value);
                        });
                    };
                }),

                (function from(obj) {
                    return function(fn, alt) {
                        var callable = alt && alt[fn] ? alt : (obj[fn] ? obj : null);
                        return function() {
                            return callable ? callable[fn].apply(callable, arguments) : null;
                        }
                    };
                }),

                (function tap(f) {
                    return function (a) {
                        return unit(a, f(a));
                    };
                })
            ),
            (function wrapFn() {
                return [].slice.call(arguments).pure(0, true);
            })(
                (function(x) {
                    return (function() { return x; });
                }),
                (function createLength(length, keys) {
                  var len, getLen = length;
                  return function length(item) {
                    return typeof (len = getLen(item)) != 'undefined' ? len
                      : (typeof item == 'object' ? getLen(keys(item)) : 0);
                  }
                }),
                (function createValues(keys, unit) {
                  return function values(obj, f) {
                    var isarr = obj instanceof Array,
                         kys  = !isarr && obj.keys ? obj.keys() : keys(obj),
                        vals  = [],
                        func  = f || unit;
                    for (var i = 0; i < kys.length; i++) {
                      vals.push(func(isarr ? obj[i] : (obj.get ? obj.get(kys[i]) : obj[kys[i]]), kys[i]));
                    };
                    return vals;
                  };
                }),
                (function createObj(length, keys) {
                  return function obj(map, base) {
                    return function(values) {
                      var result = base || {};
                      if (!values && !this.document) values = this;
                      if (!values && map instanceof Array
                        && map[0] && !map[0][1]) map = [ map ];
                      else if (!map) map = keys(values);

                      for (var i = 0, len = length(map); i < len; i++) {
                        if (!map[i] && !values) continue;
                        else if (values) result[map[i]] = values[i];
                        else result[map[i][0]] = map[i][1];
                      }
                      return result;
                    };
                  };
                }),
                (function createEach(keys, values) {
                  return function each(x, f) {
                    var isarr = x instanceof Array;
                    var keyss = isarr ? x.slice(0) : (typeof x == 'object' ? Object.keys(x) : [ x ]), i = 0;
                    while (i < keyss.length) {
                      f(isarr ? keyss[i] : x[keyss[i]], isarr ? i : keyss[i], keyss);
                      i++;
                    }
                  }
                }),
                (function tapToConsole(tap) {
                    var run = tap(console.log.bind(console));
                    return function tapToConsole(x) {
                        return run(x);
                    }
                }),
                (function createOrderProps(each) {
                  return function orderProps(o, fields) {
                    var result = [];
                    each(fields, function(field) {
                        if (o[field] !== undefined) {
                            result.push({
                                name: field,
                                value: o[field]
                            });
                        }
                    });
                    return result;
                  }
                }),
                (function createAssign(objPath) {
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
                (function createWrapType(role) {
                    return function type(name) {
                        return function(instance) {
                            return role(sys.type(name))
                        }
                    }
                }),
                (function createMixin(extend) {
                    return function mixin(base) {
                        base || (base = {});
                        var i = arguments.length, ii = 1;
                        while(--i) { extend(base, arguments[ii++]); };
                        return base;
                    };
                }),
                (function createInfo(extend) {
                    return function info(defs, opts) {
                        return extend(defs, opts);
                    };
                }),
                (function createMap(tap, info, wrap) {
                    return function map(fn, opts) {
                        return wrap(function(x) {
                            return x.map(fn);
                        }, info({ runcount: 0, mapcount: 0, depth: 0, base: 0 }, opts || {}));
                    }
                }),
                (function createTarget(ctor, ext) {
                  return function target(objPath) {
                    return ext(ctor(objPath));
                  }
                })(
                    (function(objPath, extend) {
                        function Target() {};
                        Target.prototype = {
                            constructor: Target,
                            $get: function(key) {
                                return objPath(key, this);
                            },
                            $set: function(val, key) {
                                if (val == '*' && key == '*') return this;
                                else if (key && val) return objPath(key, this, val);
                                else if (val) return extend(new this.constructor(), val);
                                return this;
                            }
                        };
                        return Target;
                    }),
                    (function(Target) {
                        return function $target(obj) {
                            return new Target(obj);
                        };
                    })
                ),
                (function createSelect(assign, keys) {
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
                (function createParse(keys, values) {
                    function run(node, data, recur, ctor) {
                        var keyss = keys(data), valss = values(data), value, key;
                        while (keyss.length) {
                            value = valss.shift(), key = keyss.shift();
                            if (recur && typeof value == 'object' && key != 'args') {
                                if (value instanceof Array && key == node._children) {
                                    var items = node.node(key);
                                    value.map(function(v) {
                                        return items.child(v, ctor || node.constructor);
                                    });
                                }else if (value.isNode) {
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
                    return function parse() {
                        var args = [].slice.call(arguments);
                        if (args.length < 3 && args[args.length-1] instanceof Function) {
                            return run(this, args.shift(), false, args.pop());
                        }else {
                            args.unshift(this);
                            return run.apply(undefined, args);
                        }
                    };
                })
            )
        ),

        (function Scheduler(arrayExtAsync, makeTimers, wrapTimers, makeWrap, startWrap, doneWrap) {
            return function(base) {
                var Root      = base.root;
                var Scheduler = Root.child('scheduler');
                var NativeTms = makeTimers(Scheduler.child('native'));
                Scheduler.parse({
                    wrapped: wrapTimers(Scheduler),
                    nextTick: nextTick,
                    animFrame: self.dispatcher(unit, NativeTms.get('raf'))()
                });
                Scheduler.set('enqueue', Scheduler.get('wrapped')(makeWrap(doneWrap, startWrap, 'nextTick.enqueue')));
                return Scheduler;
            }
        })(
            (function MakeTimers(node) {
                return node.parse({
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

        (function Threads(mainFunc, lazyValue, lazyFunction, bindLazy, makeThread, makeInstruction, instructionMap, makeFree, bindFree, bindThread, mapThread, mapLazy, wrapThread, wrapLazy, makeScheduler) {

            function run(imap, bfree, mfree) {
              return mainFunc(
                lazyValue, lazyFunction,
                bindLazy, makeThread(mfree.pure),
                makeInstruction, imap, mfree,
                mfree.pure, mfree.roll, mfree.wrap, bfree, bindThread(bindLazy, bfree), mapThread, mapLazy, wrapThread, wrapLazy
              );
            };

            function create(imap, mkinstruction) {
              return run(imap, bindFree, makeFree(bindLazy, imap, mkinstruction));
            };

            return function(root, scheduler) {
                return root.get('types').set('Free', (create(instructionMap(makeInstruction), makeInstruction)(function(arr) {
                    var obj = {}, len = arr.length;
                    for (var i = 0; i < len; i++) { obj[arr[i].name] = arr[i]; };
                    var makeTimer  = obj.makeTimer = makeScheduler(scheduler);
                    obj.nextTick   = makeTimer('nextTick', 'native.sto', (obj.topLvLst = []));
                    obj.runThreads = obj.nextTick(function(values) {
                      values.timeLimit = 14;
                      return values;
                    });
                    obj.animFrame    = makeTimer('animFrame', false, (obj.rafLvLst = []));
                    obj.runAnimFrame = obj.animFrame(function(values) {
                      values.timeLimit = 14;
                      return values;
                    });
                    obj.select = root.get('utils.select')(obj);
                    return obj;
                })));
            };
        })(
            (function mainFunc(lazyValue, lazyFunction, bindLazy, makeThread, makeInstruction, instructionMap, makeFree, pure, roll, wrap, bindFree, bindThread, mapThread, mapLazy, wrapThread, wrapLazy) {

                function atom(lazyValue, next) {
                    return bindThread(lift(lazyValue), function(v) {
                          return bindThread(yyield(), function() {
                              return makeThread(v);
                          });
                    });
                };
                function atomize(f) {
                    return function() {
                          var args = arguments;
                          return atom(function() {
                              return f.apply(null, args);
                          });
                    };
                };
                function loop(lazyValue, next) {
                    return bindLazy(lazyValue, function(v) {
                          var loop = bindThread(result(v), function(v) {
                            return next(v) ? loop : done();
                          });
                          return loop;
                    });
                };
                function fork(thread) {
                    return bindThread(cFork(), function(child) {
                          return when(child, bindThread(thread, function() {
                              return done();
                          }));
                    });
                };
                function branch(thread, next) {
                    return bindThread(cBranch(), function(child) {
                          return when(child, bindThread(thread, function() {
                              return next();
                          }));
                    });
                };
                function yyield() {
                    return liftF(makeInstruction('yield', [null]));
                };
                function result(value) {
                    return liftF(makeInstruction('yield', [value]));
                };
                function done() {
                    return liftF(makeInstruction('done', []));
                };
                function cFork() {
                    return liftF(makeInstruction('fork', [false, true]));
                };
                function cBranch() {
                    return liftF(makeInstruction('branch', [true, false]));
                };
                function when(p, thread) {
                    return p ? thread : makeThread(null);
                };
                function lift(lazyValue) {
                    return bindLazy(lazyValue, makeThread);
                };
                function liftFn(fn) {
                    return function(value, free, inst) {
                          return makeThread(fn(value, free, inst));
                    }
                };
                function liftF(instruction) {
                    return wrap(instructionMap(instruction, makeThread));
                };
                function liftR(runnable) {
                    return runnable.wrap(
                      wrap(makeInstruction('yield', [ runnable ])),
                      wrap(makeInstruction('suspend', [ runnable ])),
                      done()
                    );
                };
                function thunk() {
                    var ret, dne = done();
                    function run(item) {
                          return (
                              ((item.length > 2) && (ret = item[0].apply(item[1], item[2])))
                                    ||
                              ((item.length > 0) && (ret = item[0](item[1])))
                          ) ? ret : dne;
                    };
                    return function(item) {
                          return function() {
                              return run(item);
                          };
                    };
                };
                return function(fn) {
                    return fn([
                          lazyValue, lazyFunction, bindLazy, makeThread,
                          makeInstruction, instructionMap, pure, roll, wrap, bindFree, loop,
                          bindThread, mapThread(bindThread, makeThread), mapLazy(bindLazy), wrapThread(bindThread), wrapLazy(bindLazy), makeFree, atom, atomize, 
                          fork, branch, yyield, done, result, cFork, cBranch, when, lift, liftFn, liftF, liftR, thunk
                    ]);
                }
            }),

            (function lazyValue(value) { return (function() { return value; }); }),

            (function lazyFunction(fn) { return (function() { return fn(); }); }),

            (function bindLazy(value, f) {
                return function() {
                    return f(value())();
                };
            }),

            (function makeThread(pure) {
                return function makeThread(value) {
                    return function() { return pure(value); };
                };
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

            (function instructionMap(makeInstruction) {
                return function instructionMap(instruction, f) {
                    return makeInstruction(instruction.mode, instruction.next.map(f));
                };
            }),

            (function makeFree(ctor, run, ext) {
                return function(bindLazy, instructionMap, makeInstruction) {
                    ctor.prototype = ext.call({
                        constructor: ctor,
                        isFree: true,
                        run: run(bindLazy, instructionMap, makeInstruction)
                    }, ctor);          
                    return ctor;
                }
            })(
                (function free(pure, value) {
                    this.pure  = pure;
                    this.value = value;
                }),
                (function run(bindLazy, instructionMap, makeInstruction) {
                    return function run(f, b) {
                        if (this.pure) {
                            if (this.value && this.value.chain) {
                                return this.value.chain(f);
                            }else {
                                return f(this.value);
                            }
                        }else if (this.value) {
                            return this.wrap(instructionMap(this.value, function(v) {
                                return bindLazy(v, b);
                            }));
                        }else {
                            return this.wrap(makeInstruction('fork', [ bindLazy(this, b) ]))
                        }
                    }
                }),
                (function ext(free) {
                    free.pure = function pure(value) {
                        return new free(true, value);
                    };
                    this.roll = free.roll = function roll(instruction) {
                        return new free(false, instruction);
                    };
                    this.wrap = free.wrap = function wrap(instruction) {
                        return function() { return new free(false, instruction); };
                    };
                    return this;
                })
            ),
            (function bindFree(f) {
                return function bindFunc(free) {
                    return free.run(f, bindFunc);
                }
            }),
            (function bindThread(bindLazy, bindFunc) {
                return function bindThread(thread, f) {
                    return bindLazy(thread, bindFunc(f));
                };
            }),
            (function mapThread(bindThread, makeThread) {
                return function mapThread(lazyValue, f) {
                    return bindThread(lazyValue, function(v) {
                        return makeThread(f(v));
                    });
                };
            }),
            (function mapLazy(bindLazy) {
                return function mapLazy(f) {
                    return function(lazyValue) {
                        return bindLazy(lazyValue, f);
                    }
                }
            }),
            (function wrapThread(bindThread) {
                return function wrapThread(thread, next) {
                    return function(value) {
                        return bindThread(thread(value), next);
                    }
                }
            }),
            (function wrapLazy(bindLazy) {
                return function wrapLazy(thread, next) {
                    return function(value) {
                        return bindLazy(thread(value), next);
                    }
                }
            }),
            (function makeScheduler(runner, makeTimer, wrapper) {
                return function(scheduler) {
                    return makeTimer(scheduler, wrapper, runner);
                }
            })(
            (function makeRun() {
                var totCount = 0, runCount = 0;

                function run(threads, timeLimit, info) {  
                  var thread, free, instruction, next, frameTime = 0,
                  start = info.ts, again = threads && threads.length,
                  currCount = 0; runCount++;

                  while (again && ++totCount) {

                    (again = ((
                      (
                        (thread = threads.shift())
                        && (free = thread.run ? thread.run(currCount) : thread(currCount))
                        && (!free.pure)
                        && (instruction = free.value)
                        && (next = instruction.next)
                      )

                      && (((instruction.cf.ps9)
                            && (threads.push.apply(threads, next)))
                        || ((instruction.cf.us0 && instruction.cf.ps1)
                            && (threads.unshift(next[0]))
                            && (threads.push.apply(threads, next.slice(1))))
                        || ((instruction.cf.us9)
                            && (threads.unshift.apply(threads, next)))
                      )
                    ) || true)
                      && ((frameTime = ((info.rs = self.now()) - start)) < timeLimit)
                      && !(info.suspend = instruction.cf.susp)
                      && threads.length
                      && ++currCount
                    );
                  }
                  return threads.length;
                }
                return run;
            })(),
            (function makeTimer(scheduler, wrapper, runner) {
                return function(nextTick, timeOut, topLvlLst, pendingLst) {
                    var node = scheduler.get(nextTick);
                    return (node.runThreads = wrapper(
                        runner,
                            typeof nextTick == 'string' ? node.enqueue : nextTick,
                            timeOut ? (typeof timeOut == 'string' ? scheduler.get(timeOut) : timeOut) : false,
                                topLvlLst || (topLvlLst = []),
                                    pendingLst || (pendingLst = [])
                        )
                    );
                }
            }),
            (function wrapTimer(run, nextTick, timeOut, topLvLst, pendingLst) {

                var totCount   = 0,
                    runCount   = 0,
                    maxCount   = 1000,
                    loopCount  = 0,
                    timeLimit  = 8,
                    timeOutMS  = 10,
                    frameID    = 1;

                function cont(threads) {
                    return function(info) {
                        run(threads, timeLimit, info, (frameID = info.frameid));
                        return !threads.length || (++loopCount > maxCount && !(loopCount = 0) && timeOut && timeOut(delay(threads), timeOutMS));
                    }
                };
                function delay(threads) {
                  return function() {
                    return nextTick(cont(threads)); 
                  }
                };
                function runThreads(initial) {
                  if (topLvLst.push(initial) == 1) {
                      nextTick(cont(topLvLst));
                  }
                  return frameID;
                };
                function runPending() {
                  var lst = pendingLst.slice(0);
                  while (pendingLst.length) {
                    runThreads(pendingLst.shift());
                  }
                  return lst;
                };
                function configure(fn) {
                    var values;
                    if (fn && (values = fn({
                        totCount: totCount, runCount: runCount,
                        loopCount: loopCount, maxCount: maxCount,
                        timeLimit: timeLimit, timeOut: timeOut, timeOutMS: timeOutMS,
                        pendingLst: pendingLst, topLvLst: topLvLst,
                        nextTick: nextTick
                    }))) {
                        maxCount  = values.maxCount;
                        timeLimit = values.timeLimit;
                        timeOutMS = values.timeOutMS;
                        timeOut   = values.timeOut;
                        nextTick  = values.nextTick;
                    };
                    return runThreads;
                };
                return configure;
            })
        )),

        (function XHR(wrap, newxhr, init, create, run, andThen) {
            return function(utils) {
                return utils.set('xhr', utils.get('target')(
                    wrap(
                        utils.get('pure'), utils.get('pure'),
                        init(run(create(newxhr), andThen), utils.get('pure'))
                )));
            }
        })(
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
                            console.log(request);
                            request.url = request.url.replace('.tmpl', '.txt');
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
        )
    ),