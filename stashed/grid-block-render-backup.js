				rrender: function(x, y, e, z) {
					var cell  = this.view().parent('$fn.render').run('item');
					var attrs = this.view().eff('attrs');
					return (x instanceof Array ? x : Array.range(0, x - 1)).combine(function(a, b) {
						var attr = { id: 'r' + a + (b || z ? ('c' + b) : ''), row: a, col: b };
						var elem = e && e.length ? attrs.run(e.shift())(attr).unit() : cell.run(attr).unit();
						if ((attr.row || x == 1) && !attr.col) elem.classList.add('clear');
						else if (elem.classList.contains('clear')) elem.classList.remove('clear');
						return elem;
					}, y instanceof Array ? y.map(function(v) {
						return Array.range(0, v - 1);
					}) : Array.range(0, y - 1));
				},

						return (x instanceof Array ? x.map(function(xx) {

							return xx instanceof Array ? $map(xx, y);(y instanceof Array ? y.map(function(yy) {

								return yy instanceof Array ? $map(xx, yy) : $map(xx, Array.range(0, yy - 1));

							}) : $map((y instanceof Array ? $map(xx, Array.range(0, y - 1))) : (yy instanceof Array ? );

						}) : (y instanceof Array ? $map(x, y.map(function(yy) {

							return yy;

						})) : $grid(Array.range(0, x - 1), Array.range(0, y - 1))