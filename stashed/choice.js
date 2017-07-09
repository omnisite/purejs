        (function SetupChoiceLogic(meta, values) {
            return function choice() {
                return meta(this.types.find('Choice'), this.root.get('choice'), values);
            }
        })(
            (function meta(choice, store, values) {
                choice.ext('_when', store.node('when'));
                choice.ext('_then', store.node('then'));
                choice.ext('_sets', store.child('sets'));

                return [ store.load, values ].pure(0, true)(store);
            }),
            (function values() {
                return [
                    function run(next) {
                        return function values(node, recur) {
                            var store = node.current();
                            return store && store._val ? store._val.reduce(function(result, value, index) {
                              result[store._ids[index]] = next(value, recur, node);
                              return result;
                            }, {}) : {};
                        };
                    },
                    function whenNodeThenMap(value, recur, node) {
                        if (recur && node.isNode(value))
                            return value.cid() == node._children
                                ? this.get('thenMapValues')(value.vals(), recur, node)
                                : value.values(typeof recur == 'number' ? (recur - 1) : recur);
                    },
                    function whenArrayThenMap(value, recur, node) {
                        if (value instanceof Array)
                            return this.get('thenMapValues')(value, recur, node);
                    },
                    function whenElseReturnValue(value, recur, node) {
                        return this.get('thenReturnValue')(value);
                    },
                    function thenRecurseValues(recur) {
                        return typeof recur == 'number' ? (recur - 1) : recur;
                    },
                    function thenMapValues(value, recur, node) {
                        return value.map(function(v) {
                            return node.isNode(v) ? v.values(typeof recur == 'number' ? (recur - 1) : recur) : v;
                        });
                    },
                    function thenReturnValue(value) {
                        return value;
                    }
                ];                        
            })
        )