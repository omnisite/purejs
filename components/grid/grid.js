define(function() {

	return this.enqueue({

		name: 'grid',

		deps: {

			core: [ 'pure', 'dom' ],

			templates: [ 'tmpl' ],

			components: [ 'view' ]

		}

	}, function(deps) {

		return {

			ext: {
				render: function(x, y, e, z) {
					var cell  = this.view().parent('$fn.render').run('item');
					var attrs = this.view().eff('attrs');
					return Array.range(0, x - 1).combine(function(a, b) {
						var attr = { id: 'r' + a + (b || z ? ('c' + b) : ''), row: a, col: b };
						var elem = e && e.length ? attrs.run(e.shift())(attr).unit() : cell.run(attr).unit();
						if (attr.row && !attr.col) elem.classList.add('clear');
						else if (elem.classList.contains('clear')) elem.classList.remove('clear');
						return elem;
					}, Array.range(0, y - 1));
				},
				chop: function(e, l) {
					while (e.childElementCount > l) {
						e.removeChild(e.children.item(e.childElementCount-1));
					}
				},
				elems: function(x, y, z) {
					var g = this;
					return this.render(x, y, this.get('elems'), z, this.chop(this.view().$el().run(), x * y)).flatten().chain(function(elems) {
						return g.set('elems', elems);
					});
				},
				vals: function(x, y, z) {
					return this.state('vals', this.view().$el().toMaybe().run().lift(function(el, vals) {
						var ch  = vals.clientHeight = el.clientHeight, cw = vals.clientWidth = el.clientWidth;
						var css = vals.css.run(el);
						var ph  = css('paddingTop') + css('paddingBottom'), pw = css('paddingLeft') + css('paddingRight');
						vals.marginHGHT = z*(vals.rows); vals.marginWDTH = z*(vals.cols);
						vals.cellHeight = (ch - vals.marginHGHT - ph) / vals.rows;
						vals.cellWidth  = (cw - vals.marginWDTH - pw) / vals.cols;
						return vals;
					}).ap({ css: this.view().eff('css'), row: 0, delay: 0, rows: parseInt(x), cols: parseInt(y) })).unit();
				},
				each: function(f) {
					return this.view().eff('children').run(this.$fn('el'))(f);
				},
				show: function() {
					this.view().eff('children').run(this.$fn('el'))(function(elem) {
					  elem.style.opacity = 1;
					  return elem;
					}).run(unit).run();
				}
			}

		};

	});

});