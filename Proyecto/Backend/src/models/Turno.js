class Turno {
    constructor(
        id,
        fecha,
        horaInicio,
        horaFin,
        cantidadJugadores,
        incluyeLuces,
        estado,
        clienteId
    ) {
        this.id = id;
        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.cantidadJugadores = cantidadJugadores;
        this.incluyeLuces = incluyeLuces;
        this.estado = estado;
        this.clienteId = clienteId;
    }

    confirmar() {}

    cancelar() {}

    iniciar() {}

    finalizar() {}
}

export default Turno;