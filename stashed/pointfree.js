        (function fn() {
            // map :: Monad m => (a -> b) -> m a -> m b
            this.map = this.curry(function(fn, m) {
                return m.map(fn);
            });

            // chain :: Monad m => (a -> m b) -> m a -> m b
            this.chain = this.curry(function(fn, m) {
                return m.chain(fn);
            });

            // ap :: Monad m => m (a -> b) -> m a -> m b
            this.ap = this.curry(function(mf, m) { // mf, not fn, because this is a wrapped function
                return mf.ap(m);
            });

            // orElse :: Monad m => m a -> a -> m a
            this.orElse = this.curry(function(val, m) {
                return m.orElse(val);
            });

            this.lift = this.curry(function(f, m) {
                return m.lift(f);
            });

            this.lift2 = this.curry(function(f, m1, m2) {
                return m1.map(f).ap(m2);
            });

            this.lift2M = function(f, t1, t2) {
                var lift2 = this.lift2(f);
                return this.curry(function(v1, v2) {
                    return lift2(t1 ? t1(v1) : v1, t2 ? t2(v2) : (t1 ? t1(v2) : v2));
                }, this);
            };

            return this;
        })
