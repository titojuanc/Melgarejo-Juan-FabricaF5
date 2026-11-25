import turnoRepository from "../repositories/TurnoRepository.js";
import { validateTurnoData } from "../utils/validateTurno.js";
import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
} from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import authService from "./AuthService.js";
import cumpleanosRepository from "../repositories/CumpleanosRepository.js";

const openingHour = 12;
const closingHour = 22;

function isValidDate(fecha) {
    if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return false;
    }
    const parsedDate = new Date(`${fecha}T00:00:00.000Z`);
    return (
        !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === fecha
    );
}

function localDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatHour(hour) {
    return `${String(hour).padStart(2, "0")}:00`;
}

const editableFields = new Set([
    "fecha",
    "horaInicio",
    "horaFin",
    "cantidadJugadores",
    "incluyeLuces",
]);

export class TurnoService {
    constructor(
        repository = turnoRepository,
        auth = authService,
        birthdays = cumpleanosRepository,
    ) {
        this.repository = repository;
        this.auth = auth;
        this.birthdays = birthdays;
    }

    getAll() {
        return this.repository.findAll();
    }

    getAvailability(fecha) {
        if (!isValidDate(fecha)) {
            throw new BadRequestError("La fecha consultada no es valida.");
        }
        const now = new Date();
        if (fecha < localDateKey(now)) {
            throw new BadRequestError("La fecha consultada debe ser futura.");
        }

        const occupiedTurnos = this.repository.findAll().filter(
            (turno) => turno.fecha === fecha && turno.estado !== "Cancelado",
        );
        const confirmedBirthdays = this.birthdays
            .findAll()
            .filter(
                (item) => item.fecha === fecha && item.estado === "Confirmado",
            );
        const slots = [];
        for (let hour = openingHour; hour < closingHour; hour += 1) {
            const horaInicio = formatHour(hour);
            const horaFin = formatHour(hour + 1);
            const startsAt = new Date(`${fecha}T${horaInicio}:00`);
            const occupied =
                occupiedTurnos.some(
                    (turno) =>
                        turno.horaInicio < horaFin &&
                        turno.horaFin > horaInicio,
                ) ||
                confirmedBirthdays.some(
                    (item) =>
                        item.horaInicio < horaFin && item.horaFin > horaInicio,
                );
            if (!occupied && startsAt > now) {
                slots.push({ fecha, horaInicio, horaFin });
            }
        }
        return slots;
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
        this.repository.save();
        return turno;
    }

    cancel(id) {
        const turno = this.getById(id);
        turno.cancelar();
        this.repository.save();
        return turno;
    }

    cancelOwn(id, user) {
        const turno = this.getById(id);
        if (user?.rol !== "cliente" || turno.clienteId !== user.clienteId) {
            throw new ForbiddenError();
        }
        const startsAt = new Date(`${turno.fecha}T${turno.horaInicio}:00`);
        const late = startsAt.getTime() - Date.now() < 12 * 60 * 60 * 1000;
        turno.cancelar();
        if (late) turno.cancelacionTardia = true;
        this.repository.save();
        return turno;
    }

    delete(id) {
        this.getById(id);
        this.repository.delete(id);
    }

    ensureAvailable(data, excludeId) {
        const turnoConflict = this.repository.findAll().some(
            (turno) =>
                turno.id !== excludeId &&
                turno.estado !== "Cancelado" &&
                turno.fecha === data.fecha &&
                turno.horaInicio < data.horaFin &&
                turno.horaFin > data.horaInicio,
        );
        const birthdayConflict = this.birthdays.hasConfirmedConflict(data);
        if (turnoConflict || birthdayConflict) {
            throw new ConflictError("Ese horario ya no esta disponible.");
        }
    }
}

export default new TurnoService();
