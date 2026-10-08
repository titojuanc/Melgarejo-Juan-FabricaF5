class Partido {
    constructor(
        id,
        torneoId,
        equipoLocalId,
        equipoVisitanteId,
        fecha,
        golesLocal = null,
        golesVisitante = null,
        ronda = 1,
        estado = "Pendiente",
        penalesLocal = null,
        penalesVisitante = null,
    ) {
        this.id = id;
        this.torneoId = torneoId;
        this.equipoLocalId = equipoLocalId;
        this.equipoVisitanteId = equipoVisitanteId;
        this.fecha = fecha;
        this.golesLocal = golesLocal;
        this.golesVisitante = golesVisitante;
        this.ronda = ronda;
        this.estado = estado;
        this.penalesLocal = penalesLocal;
        this.penalesVisitante = penalesVisitante;
    }
}

export default Partido;
