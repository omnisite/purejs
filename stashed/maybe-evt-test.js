


var click = list.addEventListener('dom', 'click', 'root', '.top .left', function(x) {
  console.log('root.top.left', x);
  return x;
});
var mousemove = list.addEventListener('dom', 'mousemove', 'root', 500, function(x) {
  console.log('root.mousemove', x);
  return x;
});

var change = node.addEventListener('store', 'change', sys.get('utils'), '%aa%', function(x) {
  console.log('%aa%', x);
  return x;
});
