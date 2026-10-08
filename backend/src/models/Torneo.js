class Torneo {
    constructor(
        id,
        nombre,
        fechaInicio,
        fechaFin,
        estado,
        formato = null,
        intervaloDias = null,
    ) {
        this.id = id;
        this.nombre = nombre;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.estado = estado;
        this.formato = formato;
        this.intervaloDias = intervaloDias;
        this.fixtureGenerado = false;
        this.descansos = [];
        this.campeonId = null;
    }
}

export default Torneo;