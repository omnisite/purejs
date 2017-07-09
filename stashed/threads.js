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


            (function $atom(bindThread, lift, yyield, makeThread) {
                return function atom(lazyValue) {
                    return bindThread(lift(lazyValue), function(v) {
                          return bindThread(yyield(), function() {
                              return makeThread(v);
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
            })





})


        (function tick(f) {
            return function() {
                return f();
            }
        }),

        (function _1(f) {
          return function(t) {
            return f(t);
          };
        })





