class Evento {
    constructor(
        id,
        fecha,
        horaInicio,
        horaFin,
        tipo,
        serviciosAdicionales,
        clienteId
    ) {
        this.id = id;
        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.tipo = tipo;
        this.serviciosAdicionales = serviciosAdicionales;
        this.clienteId = clienteId;
    }
}

export default Evento;