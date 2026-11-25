import { ConflictError } from "../exceptions/AppError.js";

class Cumpleanos {
    constructor(id, data) {
        this.id = id;
        this.clienteId = data.clienteId;
        this.paqueteId = data.paqueteId;
        this.fecha = data.fecha;
        this.horaInicio = data.horaInicio;
        this.horaFin = data.horaFin;
        this.estado = data.estado || "Pendiente";
    }

    confirmar() {
        if (this.estado !== "Pendiente") {
            throw new ConflictError("Solo se pueden confirmar solicitudes pendientes.");
        }
        this.estado = "Confirmado";
    }

    cancelar() {
        if (!["Pendiente", "Confirmado"].includes(this.estado)) {
            throw new ConflictError("La solicitud ya esta cancelada.");
        }
        this.estado = "Cancelado";
    }
}

export default Cumpleanos;
