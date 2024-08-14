qx.Class.define('gueco.iu.Cabecera', {

    extend: qx.ui.container.Composite,

    construct: function () {
        this.base(arguments, new qx.ui.layout.HBox());
        this.setAppearance('app-header');

        this.addListener('appear', function () {
            var e = this.getContentElement()
            e.setStyle('top', (parseInt(e.getStyle('top'))+1) + 'px');
        }, this);

        this.add(new qx.ui.basic.Label(this.tr('Gueco')));
        this.add(new qx.ui.core.Spacer(), { flex: 1 });
        this.add(new qx.ui.basic.Label('0.0.1'));
    }

});
