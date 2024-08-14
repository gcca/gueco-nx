/*
#ignore(google.maps)
#ignore(google.maps.Map)
#ignore(google.maps.MapTypeId)
#ignore(google.maps.event)
#ignore(google.maps.LatLng)
#ignore(google.maps.drawing.OverlayType)
#ignore(google.maps.drawing)
#ignore(google.maps.ControlPosition)
#ignore(google.maps.Animation)
#ignore(google.maps.SymbolPath)
#asset(gueco/*)
 */
var prec = 'resource/gueco/mapa/factor/';

qx.Class.define('gueco.iu.Mapa', {

    extend : qx.ui.container.Composite,

    construct : function () {
        var estruc = new qx.ui.layout.VBox();
        estruc.setSeparator('separator-vertical');
        this.base(arguments, estruc);
        this.setDecorator('main');

        var gestorDibujo = this.gestorDibujo;

        var titulo = new qx.ui.container.Composite();
        titulo.setLayout(new qx.ui.layout.HBox);

        var botonMaximizar = new qx.ui.form.Button(null,
                'decoration/window/maximize.gif');
        botonMaximizar.setAppearance('toolbar-button');
        botonMaximizar.setMarginRight(6);
        botonMaximizar.addListener('execute', function () {
            this.fireEvent('alternarM(ax/in)imizar');
        }, this);

        var menuS = new qx.ui.container.Composite();
        menuS.setLayout(new qx.ui.layout.VBox);
        menuS.set({
            allowGrowY: false,
            maxWidth: 32
        });

        var botones = this.esquemaBotones;

        for (var i in botones) {
            var boton = botones[i];
            var btnOp = new qx.ui.form.Button(boton.titulo);
            btnOp.addListener('execute', (function (boton) {
                return  function () {
                    gestorDibujo.setOptions({
                        drawingMode: boton.tipo
                    });
                }
            })(boton), this);
            menuS.add(btnOp, { flex: 1 });
        }

        titulo.add(new qx.ui.basic.Label('Mapa').set({
            font       : "bold",
            padding    : 5,
            allowGrowX : true,
            allowGrowY : true
        }));
        titulo.add(new qx.ui.core.Spacer(), { flex: 1});
        titulo.add(botonMaximizar);

        /*var marcas = [
            {
                icono: 'user_police_england.png',
                titulo: 'policia'
            },
            {
                icono: 'user_zorro.png',
                titulo: 'zoro'
            },
            {
                icono: 'user_medical.png',
                titulo: 'medi'
            }
        ];

        for (var i in marcas) {
            var marca = marcas[i];
            var marcaOp = new qx.ui.form.Button(null,
                'resource/gueco/mapa/' + marca.icono);
            marcaOp.getChildControl('icon').set({
                width : 16,
                height : 16,
                scale : true
            });
            marcaOp.addListener('execute', (function (marca) {
                return  function () {
                    gestorDibujo.setOptions({
                        drawingControlOptions: {},
                        markerOptions: {
                            icon: 'resource/gueco/mapa/' + marca.icono,
                            draggable: true,
                            animation: google.maps.Animation.DROP,
                            title: marca.titulo
                        }
                    });
                }
            })(marca), this);
            menuS.add(marcaOp, { flex: 1 });
        }*/

        var ventFactores = new qx.ui.form.Button('Fs');
        ventFactores.addListener('execute', function () {
            this.crearVentana(gestorDibujo);
        }, this);
        menuS.add(ventFactores, { flex: 1 });

        var __mapa = new qx.ui.core.Widget();
        __mapa.setDecorator("main");

        __mapa.addListenerOnce('appear', function() {
            var el = __mapa.getContentElement().getDomElement();
            this.__mapa = new google.maps.Map(el, {
                zoom      : 6,
                center    : new google.maps.LatLng(-12.022867, -77.000771),
                mapTypeId : google.maps.MapTypeId.ROADMAP
            });

            gestorDibujo.setMap(this.__mapa);

            __mapa.addListener('resize', function() {
                qx.html.Element.flush();
                google.maps.event.trigger(this.__mapa, 'resize');
            }, this);

            var sims = [];
            var info = new google.maps.InfoWindow();
            var self = this;
            google.maps.event.addListener(gestorDibujo,
                                          'overlaycomplete',
                                          function (event) {
                if (event.type ==
                    google.maps.drawing.OverlayType.POLYLINE) {
                } else if
                    (event.type ==
                     google.maps.drawing.OverlayType.MARKER) {

                    var marca = event.overlay;
                    self.aspectosRecabados.push(event.overlay);
                    var sim = event.overlay;
                    sim.content = '' + sims.length +
                                  ': Aquí estoy <button>cliquéame</button>';
                    google.maps.event.addListener(sim,
                                                  'dblclick',
                                                  function () {
                        info.setContent(this.content);
                        info.open(self.__mapa, this);
                    });
                    sims.push(sim);
                  }
                });
        }, this);

        this.add(titulo);


        var panelMapa = new qx.ui.container.Composite();
        panelMapa.setLayout(new qx.ui.layout.HBox());
        panelMapa.add(menuS, { flex: 0 });
        panelMapa.add(__mapa, { flex: 1});

        this.add(panelMapa, { flex: 1 });

        this.set({ minWidth: 600 });
    },

    events : {
        'alternarM(ax/in)imizar': 'qx.event.type.Event'
    },

    members: {
        crearVentana : function (gestorDibujo) {
            var vent = new qx.ui.window.Window('Factores');
            vent.setLayout(new qx.ui.layout.VBox);
            vent.setAllowMaximize(false);
            vent.setAllowMinimize(false);
            vent.setShowMaximize(false);
            vent.setShowMinimize(false);
            vent.setResizable(false);

            var frame =
                new qx.ui.container.Composite(new qx.ui.layout.Grow);
            frame.setDecorator("main");

            var barra = new qx.ui.toolbar.ToolBar;

            var menupFactores = new qx.ui.toolbar.Part;

            var factores = this.factores;

            for (var i in factores) {
                var factor = factores[i];
                var menuBtn = new qx.ui.toolbar.MenuButton(factor.factor);
                var menu = new qx.ui.menu.Menu;

                for (var i in factor.aspectos) {
                    var aspecto = factor.aspectos[i];

                    var subMenu = new qx.ui.menu.Menu;
                    for (var j in aspecto.hechos) {
                        var hecho = aspecto.hechos[j];
                        var subBtn = new qx.ui.menu.Button(
                                /*null*/aspecto.eti[j], hecho);
                        subBtn.addListener('execute', (function (hecho) {
                            return function () {
                                gestorDibujo.setOptions({
                                    drawingControlOptions: {},
                                    markerOptions: {
                                        icon: hecho,
                                        draggable: true,
                                        animation:
                                            google.maps.Animation.DROP,
                                        title: ''
                                    }
                                });
                            }
                        })(hecho), this);
                        subMenu.add(subBtn);
                    }

                    var btn =
                        new qx.ui.menu.Button(/*null*/aspecto.ati,
                                              aspecto.aspecto,
                                              null, subMenu);
                    menu.add(btn);
                }

                menuBtn.setMenu(menu);

                menupFactores.add(menuBtn);
            }

            barra.add(menupFactores);
            frame.add(barra);
            vent.add(frame);

            var bounds = vent.getLayoutParent().getBounds();
            var hint = vent.getSizeHint();
            vent.moveTo(
                Math.round((bounds.width - hint.width) / 1.25),
                Math.round((bounds.height - hint.height) / 1.25));
            vent.open();
        },

        gestorDibujo : new google.maps.drawing.DrawingManager({
            drawingMode: null,
            drawingControl: false,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                rawingModes: [
                    google.maps.drawing.OverlayType.MARKER,
                    google.maps.drawing.OverlayType.POLYGON,
                    google.maps.drawing.OverlayType.CIRCLE,
                    google.maps.drawing.OverlayType.POLYLINE,
                    google.maps.drawing.OverlayType.RECTANGLE
                ]
            },
            circleOptions: {
                fillColor: '#ffff00',
                fillOpacity: 0.5,
                strokeWeight: 1,
                clickable: false,
                editable: true,
                zIndex: 1
            },
            rectangleOptions: {
                fillColor: '#ffffff',
                fillOpacity: 0.5,
                strokeWeight: 1,
                clickable: false,
                editable: true,
                zIndex: 1
            },
            polygonOptions: {
                fillColor: '#ffffff',
                fillOpacity: 0.5,
                strokeWeight: 1,
                clickable: false,
                editable: true,
                zIndex: 1
            },
            polylineOptions: {
                fillColor: '#ffffff',
                fillOpacity: 0.5,
                strokeWeight: 1,
                clickable: false,
                editable: true,
                zIndex: 1
            }
        }), // gestorDibujo
        esquemaBotones : [
            {
                titulo: 'R',
                tipo: google.maps.drawing.OverlayType.RECTANGLE
            },
            {
                titulo: 'C',
                tipo: google.maps.drawing.OverlayType.CIRCLE
            },
            {
                titulo: 'P',
                tipo: google.maps.drawing.OverlayType.POLYGON
            },
            {
                titulo: 'M',
                tipo: google.maps.drawing.OverlayType.MARKER
            },
            {
                titulo: '.',
                tipo: null
            }
        ],
        factores : [
            {
                factor: 'Terreno',
                aspectos: [
                    {
                        aspecto: prec + 'pue',
                        ati: 'Puentes',
                        eti: [
                            'Despejado',
                            'Destruido',
                            'Bloqueado'
                        ],
                        hechos: [
                            prec + 'pue_desp',
                            prec + 'pue_dstr',
                            prec + 'pue_bloq'
                        ]
                    },
                    {
                        aspecto: prec + 'rio',
                        ati: 'Río',
                        eti: [
                            'Caudaloso',
                            'Pasivo'
                        ],
                        hechos: [
                            prec + 'rio_caud',
                            prec + 'rio_pasi'
                        ]
                    },
                    {
                        aspecto: prec + 'car',
                        ati: 'Carreteras',
                        eti: [
                            'Bloqueadas',
                            'Despejado'
                        ],
                        hechos: [
                            prec + 'car_bloq',
                            prec + 'car_desp'
                        ]
                    },
                    {
                        aspecto: prec + 'fer',
                        ati: 'Ferrocarriles',
                        eti: [
                            'Ferrocarriles'
                        ],
                        hechos: [
                            prec + 'fer_ex'
                        ]
                    },
                    {
                        aspecto: prec + 'tun',
                        ati: 'Túneles',
                        eti: [
                            'Túneles'
                        ],
                        hechos: [
                            prec + 'tun_ex'
                        ]
                    },
                    {
                        aspecto: prec + 'par',
                        ati: 'Pantanos R',
                        eti: [
                            'P. Superficial',
                            'P. Profundo'
                        ],
                        hechos: [
                            prec + 'par_supe',
                            prec + 'par_prof'
                        ]
                    },
                    {
                        aspecto: prec + 'pae',
                        ati: 'Pantanos E',
                        eti: [
                            'P. Superficial',
                            'P. Profundo'
                        ],
                        hechos: [
                            prec + 'pae_supe',
                            prec + 'pae_prof'
                        ]
                    },
                    {
                        aspecto: prec + 'pen',
                        ati: 'Pendientes',
                        eti: [
                            'Pendientes'
                        ],
                        hechos: [
                            prec + 'pen_ex',
                        ]
                    },
                    {
                        aspecto: prec + 'bos',
                        ati: 'Bosques',
                        eti: [
                            'Cerrados',
                            'Abiertos'
                        ],
                        hechos: [
                            prec + 'bos_cerr',
                            prec + 'bos_abie'
                        ]
                    },
                    {
                        aspecto: prec + 'mat',
                        ati: 'Matorrales',
                        eti: [
                            'Matorrales'
                        ],
                        hechos: [
                            prec + 'mat_ex'
                        ]
                    },
                    {
                        aspecto: prec + 'inu',
                        ati: 'Inundaciones',
                        eti: [
                            'Inundaciones'
                        ],
                        hechos: [
                            prec + 'inu_ex'
                        ]
                    },
                    {
                        aspecto: prec + 'mon',
                        ati: 'Montañas',
                        eti: [
                            'Accesibles',
                            'Elevadas'
                        ],
                        hechos: [
                            prec + 'mon_acce',
                            prec + 'mon_elev'
                        ]
                    },
                    {
                        aspecto: prec + 'lag',
                        ati: 'Lagos',
                        eti: [
                            'Extensos',
                            'Reducidos'
                        ],
                        hechos: [
                            prec + 'lag_exte',
                            prec + 'lag_redu'
                        ]
                    },
                    {
                        aspecto: prec + 'zan',
                        ati: 'Zanjas',
                        eti: [
                            'Zanjas'
                        ],
                        hechos: [
                            prec + 'zan_ex'
                        ]
                    },
                    {
                        aspecto: prec + 'cam',
                        ati: 'Campo minado',
                        eti: [
                            'Campo minado'
                        ],
                        hechos: [
                            prec + 'cam_ex'
                        ]
                    },
                    {
                        aspecto: prec + 'sue',
                        ati: 'Suelos',
                        eti: [
                            '1',
                            '2',
                            '3',
                            '4',
                            '5'
                        ],
                        hechos: [
                            prec + 'sue_s1',
                            prec + 'sue_s2',
                            prec + 'sue_s3',
                            prec + 'sue_s4',
                            prec + 'sue_s5'
                        ]
                    },
                    {
                        aspecto: prec + 'edi',
                        ati: 'Edificios',
                        eti: [
                            'Edificios'
                        ],
                        hechos: [
                            prec + 'edi_ex'
                        ]
                    },
                    {
                        aspecto: prec + 'pad',
                        ati: 'Paredes',
                        eti: [
                            'Paredes'
                        ],
                        hechos: [
                            prec + 'pad_ex'
                        ]
                    },
                    {
                        aspecto: prec + 'cra',
                        ati: 'Cráteres',
                        eti: [
                            'Cráteres'
                        ],
                        hechos: [
                            prec + 'cra_ex'
                        ]
                    },
                    {
                        aspecto: prec + 'veg',
                        ati: 'Vegetación',
                        eti: [
                            'Penetrable',
                            'Impenetrable'
                        ],
                        hechos: [
                            prec + 'veg_pent',
                            prec + 'veg_impe'
                        ]
                    },
                    {
                        aspecto: prec + 'sen',
                        ati: 'Sendero',
                        eti: [
                            'Sendero'
                        ],
                        hechos: [
                            prec + 'sen_ex'
                        ]
                    }
                ]
            },
            {
                factor: 'Clima',
                aspectos: [
                    {
                        aspecto: prec + 'pre',
                        ati: 'Precipitaciones',
                        eti: [
                            'Intensa',
                            'Llovizna'
                        ],
                        hechos: [
                            prec + 'pre_inte',
                            prec + 'pre_llov'
                        ]
                    },
                    {
                        aspecto: prec + 'neb',
                        ati: 'Neblina',
                        eti: [
                            'Espesa',
                            'Rala'
                        ],
                        hechos: [
                            prec + 'neb_espe',
                            prec + 'neb_rala'
                        ]
                    },
                    {
                        aspecto: prec + 'tem',
                        ati: 'Temperatura',
                        eti: [
                            'Tropical',
                            'Templada',
                            'Fría',
                            'Congelamiento',
                            'Deshielo',
                            'Húmeda'
                        ],
                        hechos: [
                            prec + 'tem_trop',
                            prec + 'tem_temp',
                            prec + 'tem_fria',
                            prec + 'tem_cong',
                            prec + 'tem_desh',
                            prec + 'tem_hume'
                        ]
                    },
                    {
                        aspecto: prec + 'ilu',
                        ati: 'Iluminación',
                        eti: [
                            'Solar',
                            'Lunar'
                        ],
                        hechos: [
                            prec + 'ilu_sola',
                            prec + 'ilu_luna'
                        ]
                    },
                    {
                        aspecto: prec + 'nub',
                        ati: 'Nubes',
                        eti: [
                            'Nublado',
                            'Despejado'
                        ],
                        hechos: [
                            prec + 'nub_nubl',
                            prec + 'nub_desp'
                        ]
                    },
                    {
                        aspecto: prec + 'fal',
                        ati: 'Fase lunar',
                        eti: [
                            'LLena',
                            'Menguante',
                            'Creciente',
                            'Nueva'
                        ],
                        hechos: [
                            prec + 'fal_llen',
                            prec + 'fal_meng',
                            prec + 'fal_crec',
                            prec + 'fal_nuev'
                        ]
                    },
                    {
                        aspecto: prec + 'ace',
                        ati: 'Aclimatación',
                        eti: [
                            'Aclimatación'
                        ],
                        hechos: [
                            prec + 'ace_ex'
                        ]
                    },
                    {
                        aspecto: prec + 'nie',
                        ati: 'Nieve',
                        eti: [
                            'Nieve'
                        ],
                        hechos: [
                            prec + 'nie_ex'
                        ]
                    }
                ]
            },
            {
                factor: 'Enemigo',
                aspectos: [
                    {
                        aspecto: prec + 'ene',
                        ati: 'Enemigo',
                        eti: [
                            'Infantería',
                            'Caballería',
                            'Ingeniería',
                            'Logística',
                            'Comunicación',
                            'Brigada',
                            'División'
                        ],
                        hechos: [
                            prec + 'ebinf_ex',
                            prec + 'ebcab_ex',
                            prec + 'ebing_ex',
                            prec + 'eblog_ex',
                            prec + 'ebcom_ex',
                            prec + 'ebrig_ex',
                            prec + 'edivi_ex'
                        ]
                    },
                    {
                        aspecto: prec + 'emora',
                        ati: 'Moral',
                        eti: [
                            'Alta',
                            'Baja'
                        ],
                        hechos: [
                            prec + 'emora_al',
                            prec + 'emora_ba'
                        ]
                    },
                    {
                        aspecto: prec + 'earma',
                        ati: 'Armamento',
                        eti: [
                            'Tanque',
                            'Blindado',
                            'Aéreo',
                            'Mecánico'
                        ],
                        hechos: [
                            prec + 'earma_tanq',
                            prec + 'earma_blin',
                            prec + 'earma_aero',
                            prec + 'earma_meca'
                        ]
                    }
                ]
            },
            {
                factor: 'Aliado',
                aspectos: [
                    {
                        aspecto: prec + 'ali',
                        ati: 'Aliado',
                        eti: [
                            'Infantería',
                            'Caballería',
                            'Ingeniería',
                            'Logística',
                            'Comunicación',
                            'Brigada',
                            'División'
                        ],
                        hechos: [
                            prec + 'abinf_ex',
                            prec + 'abcab_ex',
                            prec + 'abing_ex',
                            prec + 'ablog_ex',
                            prec + 'abcom_ex',
                            prec + 'abrig_ex',
                            prec + 'adivi_ex'
                        ]
                    },
                    {
                        aspecto: prec + 'amora',
                        ati: 'Moral',
                        eti: [
                            'Alta',
                            'Baja'
                        ],
                        hechos: [
                            prec + 'amora_al',
                            prec + 'amora_ba'
                        ]
                    },
                    {
                        aspecto: prec + 'aarma',
                        ati: 'Arma',
                        eti: [
                            'Tanque',
                            'Blindado',
                            'Aéreo',
                            'Mecánico'
                        ],
                        hechos: [
                            prec + 'aarma_tanq',
                            prec + 'aarma_blin',
                            prec + 'aarma_aero',
                            prec + 'aarma_meca'
                        ]
                    }
                ]
            }
        ], // factores

        marcas : function () {
            var marcas = [];

            for(var i in this.aspectosRecabados) {
                var marca  = this.aspectosRecabados[i];
                var goopos = marca.getPosition();

                marcas.push({
                    icono    : marca.icon,
                    posicion : { lat : goopos.lat(), 'long' : goopos.lng() }
                });
            }

            return marcas;
        },

        aspectos : function () {
            var aspectos = [];

            for(var i in this.aspectosRecabados) {
                var aspecto = this.aspectosRecabados[i].icon.match(/\w+$/)[0];

                if (aspectos.indexOf(aspecto) == -1)
                    aspectos.push(aspecto);
            }

            return aspectos;
        },

        cargarMapa : function (marcas) {
            this.limpiar();

            for(var i in marcas) {
                var marca = marcas[i];

                this.aspectosRecabados.push(new google.maps.Marker({
                    position  : new google.maps.LatLng(marca.posicion.lat,
                                                       marca.posicion['long']),
                    icon      : marca.icono,
                    draggable : true,
                    editable  : true,
                    map       : this.__mapa
                }));
            }
        },

        limpiar : function () {
            for (var i in this.aspectosRecabados) {
                this.aspectosRecabados[i].setMap(null);
                delete this.aspectosRecabados[i];
            }

            delete this.aspectosRecabados;

            this.aspectosRecabados = [];
        },

        centrar : function () {
            if (!this.aspectosRecabados.length) return;

            var x = 0, y = 0;

            for (var m in this.aspectosRecabados) {
                var p = this.aspectosRecabados[m].getPosition();
                x += p.lat();
                y += p.lng();
            }

            var l = this.aspectosRecabados.length;
            x /= l;
            y /= l;

            this.__mapa.setCenter(new google.maps.LatLng(x, y));
        },

        dibujar : function (metodo) {
            var self = this;
            var dibujo = {
                iflecha : function (coordenadas) {
                    var coordenadasgoogle = [];
                    for (var i in coordenadas) {
                        var coordenada = coordenadas[i];
                        coordenadasgoogle.push(new google.maps.LatLng(
                            coordenada.Lat, coordenada.Long
                        ));
                    }

                    new google.maps.Polyline({
                        path          : coordenadasgoogle,
                        icons         : [{
                            icon   : {
                                path : 'M 0,-1 0,1',
                                strokeOpacity : 1,
                                scale : 2
                            },
                            offset : '0',
                            repeat : '20px'
                        }],
                        strokeColor   : self.algunColor(),
                        strokeOpacity : 0,
                        map           : self.__mapa
                    });
                },
                flecha : function (coordenadas) {
                    var coordenadasgoogle = [];
                    for (var i in coordenadas) {
                        var coordenada = coordenadas[i];
                        coordenadasgoogle.push(new google.maps.LatLng(
                            coordenada.Lat, coordenada.Long
                        ));
                    }

                    new google.maps.Polyline({
                        path          : coordenadasgoogle,
                        icons         : [{
                            icon   : {
                                path : google.maps.SymbolPath.
                                       FORWARD_CLOSED_ARROW
                            },
                            offset : '100%'
                        }],
                        strokeColor   : self.algunColor(),
                        strokeOpacity : 1.0,
                        strokeWeight  : 2,
                        map           : self.__mapa
                    });
                },

                circulo : function (coordenada) {
                    var coordenadagoogle = new google.maps.LatLng(
                        coordenada.Lat, coordenada.Long
                    );

                    var color = self.algunColor();

                    new google.maps.Circle({
                        strokeColor: color,
                        strokeOpacity: 0.6,
                        strokeWeight: 2,
                        fillColor: color,
                        fillOpacity: 0.35,
                        map: self.__mapa,
                        center: coordenadagoogle,
                        radius: 8900
                    });
                }
            };
            metodo(dibujo, this.marcasReducidas());
        },

        marcasReducidas : function () {
            var marcas = [];

            for(var i in this.aspectosRecabados) {
                var marca = this.aspectosRecabados[i];
                var p = marca.getPosition();

                marcas.push({
                    simbolo  : marca.icon.match(/\w+$/)[0],
                    posicion : {
                        Lat  : p.lat(),
                        Long : p.lng()
                    }
                });
            }

            return marcas;
        },

        algunColor : function () {
            var cs = [ '0', '1', '2', '3', '4', '5', '6', '7',
                       '8', '9', 'A', 'B', 'C', 'D', 'E', 'F' ];
            var color = '#';

            for (var i = 0; i < 6; i++) {
                color += cs[Math.floor(Math.random()*(16))];
            }

            return color;
        },

        __mapa: null,
        aspectosRecabados: []
    }
});
