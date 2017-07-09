        // === Reader === //
            (function() {
                return {
                    klass: function Reader(f) {
                        this.f = fn;
                    },
                    ext: [
                        (function ask() {
                            return new this.constructor(unit);
                        }),
                        (function asks(fn) {
                            return new this.constructor(fn);
                        }),
                        (function unit(fn) {
                            return new this.constructor($const(fn));
                        }),
                        (function bind(k) {
                            return new this.constructor(function (r) {
                                return k.call(this, this.run(r)).run(r);
                            }.bind(this));
                        }),
                        (function run(ctx) {
                            return this.f(ctx);
                        })
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
            }),