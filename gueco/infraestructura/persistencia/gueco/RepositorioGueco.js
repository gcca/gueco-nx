//! \package infraestructura.persistencia.gueco

/*! gueco_peticion
 * \brief Servicios Gueco.
 * \param metodo {GET, POST, PUT, DELETE}
 * \param recurso '/<recurso>(/<id>)'
 * \param retrollamada Función retrollamada
 * \param params {json: 'params', ...}
 */
function gueco_peticion (metodo, recurso, retrollamada, params) {
    var xhr = new XMLHttpRequest();

    xhr.open(metodo, GUECO_LUR+recurso, true);
    xhr.withCredentials = true
    xhr.onreadystatechange = function () {
        if (4 == this.readyState) {
            var respuesta;
            try {
                respuesta = JSON.parse(this.responseText);
            } catch (e) {
                respuesta = this.responseText;
            }
            retrollamada(respuesta, this.status);
        }
    }

    datos = (('GET' == metodo) ? undefined : JSON.stringify(params));
    xhr.send(datos);
}

RepositorioGueco.prototype.recurso = null; //! recurso

/*! todos
 * \brief Todos los recursos.
 * \param retrollamada Retrollamada
 */
RepositorioGueco.prototype.todos = function (retrollamada) {
    gueco_peticion('GET', this.recurso, retrollamada);
}

/*! uno
 * \brief Un recurso.
 * \param id Identificador de recurso
 * \param retrollamada Retrollamada
 */
RepositorioGueco.prototype.uno = function (id, retrollamada) {
    gueco_peticion('GET', this.recurso+'/'+id, retrollamada);
}

/*! almacenar
 * \brief Almacenar recurso.
 * \param id Identificador de recurso
 * \param retrollamada Retrollamada
 */
RepositorioGueco.prototype.almacenar = function (retrollamada, params) {
    gueco_peticion('POST', this.recurso, retrollamada, params);
}

/*! borrar
 * \brief borrar un recurso.
 * \param id Identificador de recurso
 * \param retrollamada Retrollamada
 */
RepositorioGueco.prototype.borrar = function (id, retrollamada) {
    gueco_peticion('DELETE', this.recurso+'/'+id, retrollamada);
}

/*! siguienteId
 * \brief Siguiente Identificador.
 */
RepositorioGueco.prototype.siguienteId = function (retrollamada, params) {
    gueco_peticion('POST', this.recurso, retrollamada, params);
}

function RepositorioGueco () {}
