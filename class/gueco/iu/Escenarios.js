/*
   #ignore(RepositorioGuecoEscenario)
 */
var escenarioIdXnombre = {};

qx.Class.define('gueco.iu.Escenarios', {

    extend : qx.ui.container.Composite,

    construct : function () {
        this.base(arguments);

        var disposicion = new qx.ui.layout.VBox();
        this.setLayout(disposicion);

        var titulo = new qx.ui.basic.Label(this.tr("Escenarios")).set({
            font       : "bold",
            padding    : 5,
            allowGrowX : true,
            allowGrowY : true
        });
        this.add(titulo);

        this.__lista = new qx.ui.list.List;
        this.add(this.__lista, { flex : 1 });
        this._crearLista();


        var btnsAgrElm =
            new qx.ui.container.Composite(new qx.ui.layout.HBox);
        var btnAgr = new qx.ui.form.Button('+');
        var btnElm = new qx.ui.form.Button('-');
        btnsAgrElm.add(btnAgr, { flex : 1 });
        btnsAgrElm.add(btnElm, { flex : 1 });

        this.add(btnsAgrElm);

        btnAgr.addListener('execute', function () {
            var nuevo = 'Escenario #';

			var lista = this.__lista.getModel().toArray();

			var max = 0;
			for (var i = 0; i < lista.length; i++) {
				var nom = lista[i].match(/Escenario #(.*)/);
				if (nom) {
					var n = parseInt(nom[1]);
					if (n > max) max = n;
				}
			}

			nuevo += max + 1;

            var escenario = {
                nombre      : nuevo,
                descripcion : null,
                tipo        : null,
                mapa        : null
            };
            var self = this;
            var repositorioEscenario = new RepositorioGuecoEscenario();
            repositorioEscenario.almacenar(function (id, estado) {
                if (200 == estado) {
                    escenarioIdXnombre[nuevo] = id;
                    self.__lista.getModel().push(nuevo);
                }
            }, escenario);
        }, this);

        btnElm.addListener('execute', function () {
            var nombre = this.__lista.getSelection().getItem(0);
            var self = this;
            if (nombre) {
                var repositorioEscenario = new RepositorioGuecoEscenario;
                repositorioEscenario.borrar(
                    escenarioIdXnombre[nombre],
                    function (r, estado) {

                    if (200 == estado) {
                        self.__lista.getModel().remove(nombre);
                    }
                });
            }
        }, this);


        this.set({ minWidth : 110 });
    },

    events : {
        'escenarioSeleccionado' : 'qx.event.type.Data'
    },

    members : {
        _crearLista : function () {
            var repositorioEscenario = new RepositorioGuecoEscenario;

            var self = this;

            repositorioEscenario.todos(function (escenarios, estado) {
                if (200 == estado) {

                    var arreglo = new qx.data.Array();

                    for (var i in escenarios) {
                        var escenario = escenarios[i];
                        arreglo.push(escenario.nombre);
                        escenarioIdXnombre[escenario.nombre] = i;
                    }

                    self.__lista.setModel(arreglo);
                    self.__lista.setDecorator('separator-vertical');
                    //self.__lista.setLabelPath('nombre');

                    self.__lista.getSelection().addListener('change',
                        function () {
                            var escenarioNombre =
                                self.__lista.getSelection().getItem(0);

                            if (escenarioNombre) {
                                self.fireDataEvent(
                                    'escenarioSeleccionado',
                                     escenarioIdXnombre[escenarioNombre]);
                            }
                        });
                }
            });
        },

        nombreSeleccionado : function (nombre) {
            var s = this.__lista.getSelection().getItem(0);
            if (nombre) {
				if (nombre != s) {
					var m = this.__lista.getModel();
					escenarioIdXnombre[nombre] = escenarioIdXnombre[s];
					m.setItem(m.indexOf(s), nombre);
					delete escenarioIdXnombre[s];
					this.__lista.setSelection(new qx.data.Array([nombre]));
				} return;
            }
            return s;
        }
    }
});
