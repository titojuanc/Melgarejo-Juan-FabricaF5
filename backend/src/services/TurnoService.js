import turnoRepository from "../repositories/TurnoRepository.js";
import { validateTurnoData } from "../utils/validateTurno.js";
import { BadRequestError, ConflictError, NotFoundError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import authService from "./AuthService.js";

const editableFields = new Set([
    "fecha",
    "horaInicio",
    "horaFin",
    "cantidadJugadores",
    "incluyeLuces",
]);

export class TurnoService {
    constructor(repository = turnoRepository, auth = authService) {
        this.repository = repository;
        this.auth = auth;
    }

    getAll() {
        return this.repository.findAll();
    }

    getAvailability() {
        return this.repository.findAll().map(({ fecha, horaInicio, horaFin, estado }) => ({
            fecha,
            horaInicio,
            horaFin,
            estado,
        }));
    }

    getMine(clienteId) {
        return this.repository.findAll().filter((turno) => turno.clienteId === clienteId);
    }

    getById(id) {
        const turno = this.repository.findById(id);
        if (!turno) {
            throw new NotFoundError(Messages.TURNO_NOT_FOUND);
        }
        return turno;
    }

    create(data, user) {
        const clienteId =
            user.rol === "cliente" ? user.clienteId : data?.clienteId;
        const turnoData = { ...data, clienteId };
        validateTurnoData(turnoData);
        if (!this.auth.isClientId(clienteId)) {
            throw new BadRequestError(Messages.INVALID_DATA);
        }
        this.ensureAvailable(turnoData);
        return this.repository.create(turnoData);
    }

    update(id, data) {
        const current = this.getById(id);
        if (current.estado === "Cancelado") {
            throw new ConflictError("No se puede reprogramar un turno cancelado.");
        }
        if (
            !data ||
            typeof data !== "object" ||
            Array.isArray(data) ||
            Object.keys(data).length === 0 ||
            Object.keys(data).some((field) => !editableFields.has(field))
        ) {
            throw new BadRequestError(Messages.INVALID_DATA);
        }
        const updated = { ...current, ...data };
        validateTurnoData(updated);
        this.ensureAvailable(updated, id);
        return this.repository.update(id, data);
    }

    confirm(id) {
        const turno = this.getById(id);
        turno.confirmar();
        return turno;
    }

    cancel(id) {
        const turno = this.getById(id);
        turno.cancelar();
        return turno;
    }

    delete(id) {
        this.getById(id);
        this.repository.delete(id);
    }

    ensureAvailable(data, excludeId) {
        const conflict = this.repository.findAll().some(
            (turno) =>
                turno.id !== excludeId &&
                turno.estado !== "Cancelado" &&
                turno.fecha === data.fecha &&
                turno.horaInicio < data.horaFin &&
                turno.horaFin > data.horaInicio,
        );
        if (conflict) {
            throw new ConflictError("Ese horario ya no esta disponible.");
        }
    }
}

export default new TurnoService();
