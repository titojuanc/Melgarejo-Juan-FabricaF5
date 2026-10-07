import { BadRequestError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";

export const validateTurnoData = (data) => {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new BadRequestError(Messages.INVALID_DATA);
    }
    const { fecha, horaInicio, horaFin, cantidadJugadores, clienteId } = data;
    const parsedDate = new Date(`${fecha}T00:00:00.000Z`);
    if (
        typeof fecha !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(fecha) ||
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== fecha
    ) {
        throw new BadRequestError("La fecha del turno no es valida.");
    }
    if (
        typeof horaInicio !== "string" ||
        typeof horaFin !== "string" ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(horaInicio) ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(horaFin) ||
        horaFin <= horaInicio
    ) {
        throw new BadRequestError("El horario del turno no es valido.");
    }
    if (new Date(`${fecha}T${horaInicio}:00`) <= new Date()) {
        throw new BadRequestError("El turno debe comenzar en una fecha y hora futuras.");
    }
    if (!Number.isSafeInteger(cantidadJugadores) || cantidadJugadores < 1) {
        throw new BadRequestError(Messages.INVALID_DATA);
    }
    if (!Number.isSafeInteger(clienteId) || clienteId < 1) {
        throw new BadRequestError(Messages.INVALID_DATA);
    }
    if (data.incluyeLuces !== undefined && typeof data.incluyeLuces !== "boolean") {
        throw new BadRequestError(Messages.INVALID_DATA);
    }
};
