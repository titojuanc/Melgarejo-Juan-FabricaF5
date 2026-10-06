import { BadRequestError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";

export const validateTurnoData = (data) => {
    const { fecha, horaInicio, horaFin, cantidadJugadores, clienteId } = data;

    if (!fecha || !horaInicio || !horaFin || !clienteId) {
        throw new BadRequestError(Messages.INVALID_DATA);
    }

    if (!cantidadJugadores || cantidadJugadores <= 0) {
        throw new BadRequestError(Messages.INVALID_DATA);
    }
};
