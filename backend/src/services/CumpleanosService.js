import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../exceptions/AppError.js";
import authService from "./AuthService.js";
import publicInfoService from "./PublicInfoService.js";
import turnoService from "./TurnoService.js";
import cumpleanosRepository from "../repositories/CumpleanosRepository.js";

const openingMinutes = 12 * 60;
const closingMinutes = 22 * 60;
const minimumNoticeMs = 48 * 60 * 60 * 1000;

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

function getRequestTime(data, birthdayPackage) {
    if (
        !isValidDate(data?.fecha) ||
        typeof data?.horaInicio !== "string" ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(data.horaInicio)
    ) {
        return null;
    }
    const [hour, minute] = data.horaInicio.split(":").map(Number);
    const startMinutes = hour * 60 + minute;
    const endMinutes = startMinutes + birthdayPackage.duracionHoras * 60;
    if (
        minute !== 0 ||
        startMinutes < openingMinutes ||
        endMinutes > closingMinutes
    ) {
        return null;
    }
    const start = new Date(`${data.fecha}T${data.horaInicio}:00`);
    if (Number.isNaN(start.getTime())) return null;
    return {
        start,
        horaFin: `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`,
    };
}

export class CumpleanosService {
    constructor(
        repository = cumpleanosRepository,
        auth = authService,
        turnos = turnoService,
        publicInfo = publicInfoService,
    ) {
        this.repository = repository;
        this.auth = auth;
        this.turnos = turnos;
        this.publicInfo = publicInfo;
    }

    create(data, user) {
        if (user?.rol !== "cliente" || !this.auth.isClientId(user.clienteId)) {
            throw new ForbiddenError();
        }
        const birthdayPackage = this.publicInfo
            .getBirthdayPackages()
            .find((item) => item.id === data?.paqueteId);
        const requestTime = birthdayPackage
            ? getRequestTime(data, birthdayPackage)
            : null;
        if (!birthdayPackage || !requestTime) {
            throw new BadRequestError(
                "Selecciona un paquete, una fecha y un horario validos entre las 12:00 y las 22:00.",
            );
        }
        if (requestTime.start.getTime() - Date.now() < minimumNoticeMs) {
            throw new BadRequestError(
                "Las solicitudes de cumpleanos requieren 48 horas de anticipacion.",
            );
        }
        if (
            this.repository.hasConfirmedConflict({
                fecha: data.fecha,
                horaInicio: data.horaInicio,
                horaFin: requestTime.horaFin,
            })
        ) {
            throw new ConflictError("Ese horario ya no esta disponible.");
        }
        return this.repository.create({
            clienteId: user.clienteId,
            paqueteId: birthdayPackage.id,
            fecha: data.fecha,
            horaInicio: data.horaInicio,
            horaFin: requestTime.horaFin,
            estado: "Pendiente",
        });
    }

    getMine(clienteId) {
        return this.repository
            .findAll()
            .filter((item) => item.clienteId === clienteId);
    }

    getAll() {
        return this.repository.findAll();
    }

    getById(id) {
        const item = this.repository.findById(id);
        if (!item) throw new NotFoundError("Solicitud de cumpleanos no encontrada.");
        return item;
    }

    confirm(id) {
        const item = this.getById(id);
        this.turnos.ensureAvailable(item);
        item.confirmar();
        this.repository.save();
        return item;
    }

    cancel(id) {
        const item = this.getById(id);
        item.cancelar();
        this.repository.save();
        return item;
    }
}

export default new CumpleanosService();
