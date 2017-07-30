var modal = sys.eff('sys.loader.component').run('components/modal/modal').bind(function(x) {

  return x.create({ name: 'test', parent: sys.get('components.home') }).pure();

}).run(function(mdl) {

  mdl.read = mdl.view().read().run('main', { title: 'T123' });
  mdl.addButton('test', 'Test');
  mdl.addForm({
        method: { elem: 'dropdown',  label: 'Method',      options: [ 'Of', 'Pure', 'Lift' ] },
        arg1:   { elem: 'input',     label: 'Argument 1',  type: 'text',  placeholder: 'argument 1'  },
        arg2:   { elem: 'input',     label: 'Argument 2',  type: 'text',  placeholder: 'argument 2'  },
        run:    { elem: 'button',    label: 'Run',         type: 'button' }
      }, 'test-form');
  return mdl;
});

          var attach2 = x.attach().nest().lift(function(io, ctx) {
            return io.nest().lift(function(elem, selector) {
              return elem.runIO(selector ? ctx.eff('query').run(selector) : ctx.view.module().$el());
            }).map(function(el) {
              return el.map(function(e) {
                return e.parentElement;
              }).chain(function(e) {
                ctx.view.state('attach', e.id || e.className);
                return e;
              });
            });
          }).ap(x.io()).run();

var modal = sys.eff('sys.loader.component').run('components/modal/modal').bind(function(x) {

  return x.create({ name: 'test', parent: sys.get('components.home') }).pure();

}).run(function(x) {

  var bnd1 = x.view().reader.bind(function(x) {

    var attach = x.lift().ap(function(ctx, selector) {
      return ctx.attach().ap(selector || ctx.view.module().$el()).run().map(function(elem) {
         ctx.view.parent().state('attach', elem.id || elem.className);
         return ctx;
      }).run(selector);
    }).run();//.run(/*selector*/);

    var render = x.lift().ap(function(ctx, type) {
      ctx.render().ap(ctx.view.tmpl('item', type));
      return ctx;
    }).run();//.run(/*type e.g. 'main' */).run(/* {title:'Testttt'} */);

    return this.ask();
  });

  bnd1.run(x.view());


  
//mdl.toggle();
  x.addButton('test', 'Test');

  var mdl = sys.get('components.home.test');

  mdl.addForm({
        method: { elem: 'dropdown',  label: 'Method',      options: [ 'Of', 'Pure', 'Lift' ] },
        arg1:   { elem: 'input',     label: 'Argument 1',  type: 'text',  placeholder: 'argument 1'  },
        arg2:   { elem: 'input',     label: 'Argument 2',  type: 'text',  placeholder: 'argument 2'  },
        run:    { elem: 'button',    label: 'Run',         type: 'button' }
      }, 'test-form');

  var view = mdl.view();
  var test = mdl.reader = view.reader.ask(function(view) {
    console.log(this, view);
  });

});