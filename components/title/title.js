define(function() {

	return this.enqueue({

		name: 'title',

		deps: {

			core: [ 'pure', 'dom' ],

			templates: [ 'tmpl' ],

			components: [ 'view' ]

		}

	}, function() {

		return {

			ext: {
				render: function(str) {
					this.$fn('render').run('text').run({
						text: str.split('')
					});
				}
			},
			control: {
				main: {
					anim: function(opts) {
						var data = this.root('data');
						var base = sys.eff('dom.elements.animate').run().run({
							duration: 40, easing: 'swing', toggle: true
						});
						return this.run(opts || {}).chain(function(a) {
							var cntrl = sys.klass('Control');
							var anim1 = cntrl.of(base(a.shift())).delay(500).then(
								cntrl.of(base(a.shift()), base(a.shift())).times(3)	
							);
							var anim2 = cntrl.of(base(a.shift())).times(2);
							var anim3 = cntrl.of(base(a.shift())).times(10);
							var anim4 = cntrl.of(base(a.shift())).times(3);
							return data.set('anim', anim1.delay(500).then(anim2.mv, anim3.mv, anim4.mv));
						});
					},
					run: function(o) {
						var root = this.root();
						return root.$el().map(function(el) {
							var list = [];
							var xtnd = sys.get('utils.extend');

							list.push({ prop: 'top', from: -50, to: 400, stagger: 100, duration: '400%', toggle: false, fn: 'px' });
							list.push({ prop: 'color', from: 100, to: 255, stagger: 40, delay: 100, duration: '500%', fn: { tmpl: 'rgb(10,%,100)', dec: 1 } });
							list.push({ prop: 'backgroundColor', from: 0, to: 1, stagger: 40, delay: 100, times: 2, duration: '200%', fn: { tmpl: 'rgba(100,10,100,%)', dec: 1 } });
							list.push({ prop: 'color', from: 255, to: 100, stagger: 120, fn: { tmpl: 'rgb(10,%,100)', dec: 1 } });
							list.push({ prop: 'backgroundColor', from: 100, to: 255, stagger: 80, fn: { tmpl: 'rgb(%,10,100)', dec: 1 } });
							list.push({ prop: 'opacity', from: 0, to: 1, stagger: 120, duration: '400%' });
							return list.map(function(val) {
								return sys.eff('dom.elements.query').just('li span', el).map(function(elem, index) {
									var res   = xtnd({ elem: elem }, val);
									res.delay = ((val.delay || 0) + (index*val.stagger))+'%';
									return res;
								});
							});
						}).runMaybe();
					}
				}
			},
			events: {
				dom: {
					'click:ul' : 'data.control.main.click'
				}
			}
		};

	});

});
