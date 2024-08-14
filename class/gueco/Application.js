/*
#ignore(RepositorioGuecoEscenario)
#ignore(gueco_peticion)
 */
qx.Class.define('gueco.Application', {

    extend : qx.application.Standalone,

    members : {
        main : function() {
            this.base(arguments);

            var disposicion = new qx.ui.layout.VBox();

            var contenedor = new qx.ui.container.Composite(disposicion)

            this.getRoot().add(contenedor, { edge: 0 });

            var cabecera = new gueco.iu.Cabecera();
            contenedor.add(cabecera, { flex: 0 });

            var divprincipal = new qx.ui.splitpane.Pane('horizontal');
            contenedor.add(divprincipal, { flex: 1 });

            this.__divinfo = new qx.ui.splitpane.Pane('horizontal');
            this.__divinfo.setDecorator(null);

            var diveditor = new qx.ui.splitpane.Pane('vertical');
            diveditor.setDecorator(null);

            this.__mapa = new gueco.iu.Mapa();
            this.__mapa.addListener('alternarM(ax/in)imizar',
                                    this._alternarMaximizar, this);

            diveditor.add(this.__mapa, 2);

            // Panel de misiones
            this.__panelEscenarios = new gueco.iu.Escenarios();
            this.__panelEscenarios.addListener('escenarioSeleccionado',
                                               this._escenarioSeleccionado,
                                               this);

            this.__panelEscenario = new gueco.iu.Escenario();
            this.__panelEscenario.addListener('guardarEscenario',
                                              this.guardarEscenario, this);
            this.__panelEscenario.addListener('evaluarEscenario',
                                              this.evaluarEscenario, this);

            this.__divinfo.add(this.__panelEscenarios, 1);
            this.__divinfo.add(this.__panelEscenario, 4);

            divprincipal.add(this.__divinfo, 6);
            divprincipal.add(diveditor, 5);
        },

        _alternarMaximizar : function () {
            this.__maximizado = !this.__maximizado;
            if (this.__maximizado) {
                this.__divinfo.exclude();
            } else {
                this.__divinfo.show();
            }
        },

        _escenarioSeleccionado : function (e) {
            var repositorioEscenario = new RepositorioGuecoEscenario();
            var self = this;
            this.escenarioIdSeleccionado = e.getData();
            repositorioEscenario.uno(e.getData(),
                function (escenario, estado) {
                    if (200 == estado) {
						self.__panelEscenario.info(escenario);
                        self.__mapa.cargarMapa(
                            escenario.mapa ? escenario.mapa : []);
                        self.__mapa.centrar();
                    }
                }
            );
        },

        guardarEscenario : function (e) {
            var self = this;
			var info = this.__panelEscenario.info();
            var escenario = {
                id          : self.escenarioIdSeleccionado,
                nombre      : info.nombre,
                descripcion : info.descripcion,
				tipo        : info.tipo,
                mapa        : self.__mapa.marcas()
            };

            var repositorioEscenario = new RepositorioGuecoEscenario();
            repositorioEscenario.almacenar(function (id, estado) {
				if (200 == estado) {
					self.__panelEscenarios.nombreSeleccionado(
						escenario.nombre);
				}
			}, escenario);
        },

        evaluarEscenario : function () {
            var aspectos = this.__mapa.aspectos();

            var soex = [
                'pue_',
                'rio_',
                'car_',
                'fer_',
                'tun_',
                'par_',
                'pae_',
                'pen_',
                'bos_',
                'mat_',
                'inu_',
                'mon_',
                'lag_',
                'zan_',
                'cam_',
                'sue_',
                'edi_',
                'pad_',
                'cra_',
                'veg_',
                'sen_',

                'pre_',
                'neb_',
                'tem_',
                'ilu_',
                'nub_',
                'fal_',
                'ace_',
                'nie_',

                'ebinf_',
                'ebcom_',
                'ebing_',
                'eblog_',
                'ebcab_',
                'ebrig_',
                'edivi_',

                'abinf_',
                'abcom_',
                'abing_',
                'ablog_',
                'abcab_',
                'abrig_',
                'adivi_'
            ];

            var l = aspectos.length;
            for (var i in soex) {
                var p = soex[i];
                var j;
                for (j = 0; j < l; j++) {
                    if (aspectos[j].match(p)) {
                        break;
                    }
                }
                if (j == l) aspectos.push(p + 'nex');
            }

            for (var i in aspectos) {
                aspectos[i] = '(' + aspectos[i].replace('_', ' ') + ')';
            }

            var self = this;
            gueco_peticion('POST', '/gueco', function (HTs,
                                                       estado) {
                if (200 == estado) {
                    var consejos = [];
                    for (var i = 0; i < HTs.length; i++) {
                        consejos.push('> ' + self.leyendaHT[HTs[i]]);
                    }
                    self.__panelEscenario.recomendaciones(consejos);
                    console.log(HTs);

                    for (var i in HTs) {
                        self.__mapa.dibujar(self.HTaMetodo[HTs[i]]);
                    }
                }
            }, {
				tipo : this.__panelEscenario.info().tipo,
				aspectos : aspectos
			});
        },

        __maximizado : null,
        escenarioIdSeleccionado : null,
        leyendaHT : {
            nbelsup       : 'nivel bélico superior',
            nbelinf       : 'nivel bélico inferior',
            nbelig        : 'nivel bélico igual que enemigo',
            nbelmed       : 'nivel bélico igual que enemigo',
            avaproxodespl :
                'avenida de aproximación oportuna al desplazamiento',
            obsnoidespl   : 'obstáculos no interfieren en el desplazamiento',
            cafop         : 'cubiertas y abrigos oportunos a las operaciones',
            vearma        : 'ventaja al usar armamento',
            fpsupmove     : 'fuerzas aliadas superior en capacidad ' +
                'de movimiento de enemigos',
            edmadrenspatq : 'hacer una defensa de tipo móvil para ' +
                'destruir enemigo en su posición de ataque',
            impocoptcr    : 'no es posible ubicarse y controlar ' +
                'puntos críticos',
            edszaratqe    : 'hacer una defensa en zona para resistir '+
                'ataque enemigo',
            pocvis        : 'poca visibilidad',
            enegmora      : 'efecto perjudicial en la moral',
            enegtranse    : 'efecto negativo en la transitabilidad de los ' +
                'enemigos',
            enegeqene     : 'efecto negativo en el equipamiento del enemigo',
            cdmenface     : 'clima no favorece a las acciones enemigas',
            oprecaq       : 'es posible realizar contraataque',
            ddzejcaqpe    : 'disponer defensa en zona para contraatacar ' +
                'a la posición del enemigo',
            cptoc         : 'determinante control de puntos críticos',
            enodef        : 'situación enemiga no definida de manera clara',
            fafue         : 'ataque ruptura, ataque sorpresa',
            dispamov      : 'gran posibilidad de movilidad'
        },

        HTaMetodo : {
            nbelsup       : function (mapa) {},
            nbelinf       : function (mapa) {},
            nbelig        : function (mapa) {},
            nbelmed       : function (mapa) {},

            avaproxodespl : function (mapa, marcas) {
                var origenes = [], destinos = [];

                for (var i in marcas) {
                    var marca = marcas[i];

                    if (marca.simbolo.match(/fer|rio|car/)) {
                        destinos.push(marca.posicion);
                    }

                    if (marca.simbolo.match(/^a(binf|bcab|brig|divi)/)) {
                        origenes.push(marca.posicion);
                    }

                }

                for (var i in origenes) {
                    var origen = origenes[i];
                    for (var j in destinos) {
                        mapa.iflecha([origen, destinos[j]]);
                    }
                }
            },
            obsnoidespl   : function (mapa) {},
            cafop         : function (mapa) {},
            vearma        : function (mapa, marcas) {
                var puntos = [];
                var gravis = [];

                for (var i in marcas) {
                    var marca = marcas[i];

                    if (marca.simbolo.match(/aarma/))
                        puntos.push(marca.posicion);

                    if (marca.simbolo.match(/earma/))
                        gravis.push(marca.posicion);
                }

                var gravim = { Lat : 0, Long : 0 };
                for (var i in gravis) {
                    var gravi = gravis[i];
                    gravim.Lat  += gravi.Lat;
                    gravim.Long += gravi.Long;
                }
                gravim.Lat  /= gravis.length;
                gravim.Long /= gravis.length;

                for (var i in puntos) {
                    var punto = puntos[i];
                    mapa.circulo(punto);

                    var x = gravim.Lat  - punto.Lat;
                    var y = gravim.Long - punto.Long;

                    var m = Math.sqrt(x * x + y * y) * 2.35;
                    x /= m;
                    y /= m;

                    mapa.flecha([punto,
                        { Lat : punto.Lat + x, Long : punto.Long + y}]);
                }
            },
            fpsupmove     : function (mapa) {},
            edmadrenspatq : function (mapa) {},
            impocoptcr    : function (mapa) {},
            edszaratqe    : function (mapa) {},
            pocvis        : function (mapa) {},
            enegmora      : function (mapa) {},
            enegtranse    : function (mapa) {},
            enegeqene     : function (mapa) {},
            cdmenface     : function (mapa) {},
            oprecaq       : function (mapa) {},
            ddzejcaqpe    : function (mapa) {},
            cptoc         : function (mapa) {},
            enodef        : function (mapa) {},
            fafue         : function (mapa) {},
            dispamov      : function (mapa) {}
        }
    }

});
