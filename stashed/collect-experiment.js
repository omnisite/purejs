        // === Collect === //
            (function() {
                return {
                    klass: function Collect(x) {
                        this.i = 0;
                        this.x = x;
                    },
                    ext: [
                        (function collect() {
                            return [].slice.call(arguments).apply();
                        })(
                            (function(wrap, make, add, scheduler) {
                                return wrap(add(make, scheduler.nextTick.enqueue, scheduler.nextTick.lazy));
                            }),
                            (function _$_collect(queue) {
                                return function collect(x) {
                                    return function $_pure(k) {
                                        return queue.push(x.slice(0), k);
                                    }
                                };
                            }),
                            (function() {
                                return [].slice.call(arguments).apply();
                            })(
                                (function(make, set, run) {
                                    return function() {
                                        return make(set, run);
                                    }
                                }),
                                (function(set, run) {
                                    return function make(x, k) {
                                        x.set = set; x.c = 0; x.i = 0; x.v = x.map($const(undefined)), x.k = k; x.run = run(x);
                                        this.enqueue(x);
                                    }
                                }),
                                (function set(r, i) {
                                    this.v[i] = r;
                                    if (++this.c == this.v.length) {
                                        this.k(this.v);
                                    }
                                }),
                                (function run(o) {
                                    return function(i) {
                                        return function(r) {
                                            o.set(r, i);
                                        }
                                    };
                                })
                            ),
                            (function() {
                                return [].slice.call(arguments).apply();
                            })(
                                (function(wrap, next, run, get, arr, push) {
                                    return function(make, enqueue, lazy) {
                                        return wrap.call(push.call({}, arr, enqueue, lazy), next, run, get, arr, make);
                                    }
                                }),
                                (function(next, run, get, arr, make) {
                                    this.push = make(this);
                                    this.next = next(run, get(this.push), arr);
                                    return this;
                                }),
                                (function next(r, f, a) {
                                    return function next() {
                                        if (a.length && r(f, a[0])) a.shift();
                                        return !a.length;
                                    }
                                }),
                                (function run(f, x) {
                                    f(x.run(x.i++), x.shift());
                                    return !x.length;
                                }),
                                (function get(r) {
                                    return function get(k, x) {
                                        if (x instanceof Function && x.name == '$_pure') {
                                            x(k);
                                        }else if (x instanceof Array) {
                                            x.length ? r(x, k) : k(x);
                                        }else {
                                            k(x);
                                        }
                                    };
                                }),
                                (function arr() {
                                    return [];
                                })(),
                                (function push(arr, enqueue) {
                                    this.enqueue = function(item) {
                                        if (!(arr.length*arr.push(item))) {
                                            enqueue(this);
                                        }
                                    };
                                    return this;
                                })
                            ),
                            this.scheduler
                        )
                    ],
                    attrs: [
                        (function of(f, x) {
                            return new this(f, x);
                        })
                    ],
                    init: function(type, klass, sys) {
                        klass.prototype.enqueue = sys.scheduler.nextTick.enqueue;
                    }
                };
            }),