var test = Array.of(
  Array.of([ 1,2,3,4, [7,8,9, [7,8,9]] ]).bind(function(x) { return x*4; }).flatten(),
  Array.of([ 11,12,13,14, [16,17,18,19, [7,8,9]] ]).bind(function(x) { return x*3; })
).lift(function(x, y) {
  return x.combine(function(a, b) {
    return Array.of(a,b);
  }, y);
}).chain(function(x) {
  return x.each(function(y) {
    return y.lift(function() {
      console.log.apply(console, arguments);
      return [].slice.call(arguments);
    });
  });
});


var arr = [1,2,3,[1,2,3,4,[11,12,13,14]],4,[11,12,13,14]].select(function(v) {
  return v%2 ? true : false;
});
arr.run(sys.log);

var test  = sys.eff('dom.elements.create').init('maybe', 'IO')('div');
var test2 = sys.eff('dom.elements.attrs').init('just').ap(test).pure();
var test3 = sys.eff('dom.elements.find').init();
var test4 = sys.eff('dom.elements.attach').init('just');

test4.ap(test3.run('#root')).ap(test2.run({id:'T123'}));


var test = Array.of(
  Array.of([ 1,2,3,4, [7,8,9, [7,8,9]] ]).bind(function(x) { return x*4; }).flatten(),
  Array.of([ 11,12,13,14, [16,17,18,19, [7,8,9]] ]).bind(function(x) { return x*3; })
).lift(function(x, y) {
  return x.combine(function(a, b) {
    return Array.of(a,b);
  }, y);
}).chain(function(x) {
  return x.each(function(y) {
    return y.lift(function() {
      console.log.apply(console, arguments);
      return [].slice.call(arguments);
    }).bind(unit);
  });
}).bind(unit).chain(unit);

var test  = Array.of(sys.get()._val, sys.get()._ids);
var test2 = test.lift(function(x, y) {
  return x.combine(function(a, b, i, j) {
    if (i == j) console.log([a._id, a,b,i,j]);
    return Array.of(a,b);
  }, y);
}).fmap(function(x) {
  x.first(function(y) {
    return y.index(function(r, i, j) {
       console.log([ i, j ]);
    }).run();
  }).run();
});

var test = Array.of(
  Array.of([ 1,2,3,4, [7,8,9, [7,8,9]] ]).bind(function(x) { return x*4; }),
  Array.of([ 11,12,13,14, [16,17,18,19, [7,8,9]] ]).bind(function(x) { return x*3; })
);
var test2 = test.lift(function(x, y) {
  return x.combine(function(a, b) {
    //console.log([a,b]);
    return Array.of(a,b);
  }, y);
}).flatten().fmap(function(x) {
  return x.bind(function(y) {
    return y.flatten().lift(function() {
      console.log.apply(console, arguments);
      return [].slice.call(arguments);
    });
  }).bind(function(x) {
    return x.run(unit);
  }).run(unit);
});

var test = Array.of(
  Array.of([ 1,2,3,4, [7,8,9, [7,8,9]] ]).bind(function(x) { return x*4; }),
  Array.of([ 11,12,13,14, [16,17,18,19, [7,8,9]] ]).bind(function(x) { return x*3; })
);
var test2 = test.lift(function(x, y) {
  return x.combine(function(a, b) {
    console.log([a,b]);
    return Array.of(a,b);
  }, y);
}).fmap(function(x) {
  return x.lift(function(y) {
    return y.lift(function(r) {
      console.log.apply(console, r);
	  //console.log(r);
      return [].slice.call(r);
    });
  }).bind(unit).first().run(unit);
});
