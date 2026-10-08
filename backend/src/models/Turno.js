import { ConflictError } from "../exceptions/AppError.js";

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

    confirmar() {
        if (this.estado !== "Pendiente") {
            throw new ConflictError("Solo se pueden confirmar turnos pendientes.");
        }
        this.estado = "Confirmado";
    }

    cancelar() {
        if (!["Pendiente", "Confirmado"].includes(this.estado)) {
            throw new ConflictError("El turno ya esta cancelado.");
        }
        this.estado = "Cancelado";
    }

    iniciar() {}

    finalizar() {}
}

export default Turno;