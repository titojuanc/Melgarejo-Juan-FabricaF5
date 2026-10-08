class Partido {
    constructor(
        id,
        torneoId,
        equipoLocalId,
        equipoVisitanteId,
        fecha,
        golesLocal,
        golesVisitante,
    ) {
        this.id = id;
        this.torneoId = torneoId;
        this.equipoLocalId = equipoLocalId;
        this.equipoVisitanteId = equipoVisitanteId;
        this.fecha = fecha;
        this.golesLocal = golesLocal;
        this.golesVisitante = golesVisitante;
    }
}

export default Partido;
