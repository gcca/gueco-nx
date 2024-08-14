qx.Class.define('gueco.iu.Escenario', {

    extend : qx.ui.container.Composite,

    construct : function () {
        this.base(arguments);

        var disposicion = new qx.ui.layout.VBox;
        disposicion.setSeparator('separator-vertical');
        this.setLayout(disposicion);

        var titulo = new qx.ui.basic.Label(this.tr('Escenario')).set({
            font       : 'bold',
            padding    : 5,
            allowGrowX : true,
            allowGrowY : true
        });
        this.add(titulo);

        var btnes = new qx.ui.container.Composite(new qx.ui.layout.HBox);

        var btnGuardar = new qx.ui.form.Button('Guardar');
        //btnGuardar.setAppearance('toolbar-button');
        btnGuardar.addListener('execute', function () {
            this.fireEvent('guardarEscenario');
        }, this);

        var btnEvaluar = new qx.ui.form.Button('Evaluar');
        //btnEvaluar.setAppearance('toolbar-button');
        btnEvaluar.addListener('execute', function () {
            this.fireDataEvent('evaluarEscenario', 'uno');
        }, this);

        btnes.add(btnGuardar);
        btnes.add(btnEvaluar);

        this.add(btnes);

        var seccionEscenario =
            new qx.ui.groupbox.GroupBox('Descripción general');
        seccionEscenario.setLayout(new qx.ui.layout.VBox);

        var formEscenario = new qx.ui.form.Form();

        this.formEscenarioNombre = new qx.ui.form.TextField();
        this.formEscenarioDescripcion = new qx.ui.form.TextArea().set({
            minHeight : 120
        });

        formEscenario.add(this.formEscenarioNombre, 'Nombre',
						  null, 'nombre');
        formEscenario.add(this.formEscenarioDescripcion, 'Descripción',
						  null, 'descripcion');
        this.formEscenarioTipo = new qx.ui.form.ComboBox();
		this.formEscenarioTipo.add(new qx.ui.form.ListItem('Ofensivo'));
        this.formEscenarioTipo.add(new qx.ui.form.ListItem('Defensivo'));
        //this.formEscenarioTipo.add(new qx.ui.form.ListItem('Retrógrada'));
        formEscenario.add(this.formEscenarioTipo, 'Tipo');

        seccionEscenario.add(
			new qx.ui.form.renderer.SinglePlaceholder(formEscenario),
            { flex : 1 });
        this.add(seccionEscenario, { flex : 1 });

        /*var formEs = [
            this.formEscenarioNombre,
            this.formEscenarioDescripcion
        ];
        for (var i in formEs) {
            var formE = formEs[i];
            //console.log(formE);
            formE.addListener('input', function () {
                console.log(formE.getValue());
            });
        }
        var tr = new Worker('tempi.js');
        tr.postMessage(23);
        tr.onmessage = function (ev) {
          console.log(ev.data);
        }*/

        var seccionResultado = new qx.ui.groupbox.GroupBox('Conclusiones');
        seccionResultado.setLayout(new qx.ui.layout.VBox);

        var formResultado = new qx.ui.form.Form();

        this.formResultadoRecomendaciones = new qx.ui.form.TextArea().set({
            minHeight : 190
        });
        formResultado.add(this.formResultadoRecomendaciones,
						  'Conclusiones');
        seccionResultado.add(
            new qx.ui.form.renderer.SinglePlaceholder(formResultado),
            { flex : 1 });

        this.add(seccionResultado, { flex : 1 });
    },

    members : {
        recomendaciones : function (lista) {
            var v = '';
            for (var i in lista) {
                v += lista[i] + '\n';
            }
            this.formResultadoRecomendaciones.setValue(v);
        },

		info : function (info) {
			if (undefined == info) {
				return {
					nombre      : this.formEscenarioNombre.getValue(),
					descripcion : this.formEscenarioDescripcion.getValue(),
					tipo        : this.formEscenarioTipo.getValue()
				}
			}

			this.formEscenarioNombre.setValue(
				info.nombre ? info.nombre : '');
			this.formEscenarioDescripcion.setValue(
				info.descripcion ? info.descripcion : '');
			this.formEscenarioTipo.setValue(
				info.tipo ? info.tipo : '');


			this.formResultadoRecomendaciones.setValue('');
		},

        formEscenarioNombre          : null,
        formEscenarioDescripcion     : null,
		formEscenarioTipo            : null,
		formResultadoRecomendaciones : null
    }
});
