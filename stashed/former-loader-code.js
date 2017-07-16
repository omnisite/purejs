                                (function(ref, wrap) {
                                    var path = ref.replace('.', '/').split('/');
                                    var name = path.length > 3 ? path.pop() : path.last();
                                    path = (ref = path.join('/')).replace(/\$/g, '').split('/');
                                    var node = sys.get('script').get(path) || sys.get('script').ensure(path);
                                    var type = node.set('type', name.toCamel());
                                    var base = path.first() == 'modules' ? 'Module' : (path.first() == 'system' ? 'System' : 'Component');
                                    var comp = sys.klass(base).extend(type);
                                    var loca = path.length == 3 ? ref : [ base == 'Module' ? 'modules' : 'components', name, name ].join('/');
                                    var cont = sys.get('sys.eff')('io.request.script').run({ url: loca, ref: node.uid(), type: type });
                                    var make = cont.create || (cont.create = comp.$ctor.create || (comp.$ctor.create = wrap(comp, cont)));
                                    return path.length > 1 ? cont : make;
                                }),