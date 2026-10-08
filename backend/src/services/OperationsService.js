import {
    BadRequestError,
    ConflictError,
    NotFoundError,
} from "../exceptions/AppError.js";
import operationsRepository from "../repositories/OperationsRepository.js";
import authService from "./AuthService.js";
import turnoService from "./TurnoService.js";

const tournamentStates = new Set([
    "Inscripciones abiertas",
    "En Juego",
    "Finalizado",
]);
const paymentFields = new Set(["monto", "tipo", "turnoId", "membresiaId"]);
const membershipFields = new Set(["clienteId", "fechaInicio", "fechaVencimiento"]);
const attendanceFields = new Set(["clienteId"]);
const tournamentFields = new Set([
    "nombre",
    "fechaInicio",
    "fechaFin",
    "estado",
]);
const teamFields = new Set(["nombre", "cantidadJugadores"]);
const matchFields = new Set([
    "equipoLocalId",
    "equipoVisitanteId",
    "fecha",
    "golesLocal",
    "golesVisitante",
]);

function hasFields(data, fields, required = fields) {
    return (
        data &&
        typeof data === "object" &&
        !Array.isArray(data) &&
        Object.keys(data).every((field) => fields.has(field)) &&
        [...required].every((field) => Object.hasOwn(data, field))
    );
}

function isId(value) {
    return Number.isSafeInteger(value) && value > 0;
}

function isDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isText(value, maxLength = 100) {
    return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength;
}

function getMembershipState(membership, today = new Date().toISOString().slice(0, 10)) {
    if (membership.fechaInicio > today) return "Programada";
    if (membership.fechaVencimiento < today) return "Vencida";
    return "Vigente";
}

export class OperationsService {
    constructor(repository = operationsRepository, auth = authService, turnos = turnoService) {
        this.repository = repository;
        this.auth = auth;
        this.turnos = turnos;
    }

    listClients() {
        return this.auth.getClients();
    }

    listPayments() {
        return this.repository.findAll("pagos");
    }

    registerPayment(data) {
        if (
            !hasFields(data, paymentFields, ["monto", "tipo"]) ||
            !Number.isFinite(data.monto) ||
            data.monto <= 0
        ) {
            throw new BadRequestError("Indica un importe recibido valido y su concepto.");
        }

        let clienteId;
        let turnoId = null;
        let membresiaId = null;
        if (data.tipo === "turno" && isId(data.turnoId) && !Object.hasOwn(data, "membresiaId")) {
            const turno = this.turnos.getById(data.turnoId);
            if (turno.estado === "Cancelado") {
                throw new BadRequestError("No se pueden registrar pagos de turnos cancelados.");
            }
            clienteId = turno.clienteId;
            turnoId = turno.id;
        } else if (
            data.tipo === "membresia" &&
            isId(data.membresiaId) &&
            !Object.hasOwn(data, "turnoId")
        ) {
            const membership = this.repository.findById("membresias", data.membresiaId);
            if (!membership) throw new NotFoundError("Membresia no encontrada.");
            clienteId = membership.clienteId;
            membresiaId = membership.id;
        } else {
            throw new BadRequestError("Asocia el pago a un turno o una membresia validos.");
        }

        return this.repository.createPayment({
            monto: data.monto,
            fecha: new Date().toISOString(),
            tipo: data.tipo,
            turnoId,
            membresiaId,
            clienteId,
        });
    }

    listMemberships() {
        return this.repository
            .findAll("membresias")
            .map((membership) => ({
                ...membership,
                estado: getMembershipState(membership),
            }));
    }

    createMembership(data) {
        if (
            !hasFields(data, membershipFields) ||
            !isId(data.clienteId) ||
            !isDate(data.fechaInicio) ||
            !isDate(data.fechaVencimiento) ||
            data.fechaVencimiento < data.fechaInicio ||
            !this.auth.isClientId(data.clienteId)
        ) {
            throw new BadRequestError("Indica un cliente y un periodo de membresia validos.");
        }

                const estado = getMembershipState(data);
        return this.repository.createMembership({ ...data, estado });
    }

    listAttendances() {
        return this.repository.findAll("asistencias");
    }

    registerAttendance(data) {
        if (
            !hasFields(data, attendanceFields) ||
            !isId(data.clienteId) ||
            !this.auth.isClientId(data.clienteId)
        ) {
            throw new BadRequestError("Indica un cliente valido para registrar la asistencia.");
        }
        return this.repository.createAttendance({
            clienteId: data.clienteId,
            fechaHora: new Date().toISOString(),
        });
    }

    listTournaments() {
        return this.repository.findAll("torneos").map((torneo) => ({
            ...torneo,
            equiposAnotados: this.repository
                .findAll("equipos")
                .filter((team) => team.torneoId === torneo.id).length,
        }));
    }

    createTournament(data) {
        if (
            !hasFields(data, tournamentFields) ||
            !isText(data.nombre) ||
            !isDate(data.fechaInicio) ||
            !isDate(data.fechaFin) ||
            data.fechaFin < data.fechaInicio ||
            !tournamentStates.has(data.estado)
        ) {
            throw new BadRequestError("Indica nombre, fechas y estado validos para el torneo.");
        }
        return this.repository.createTournament({
            ...data,
            nombre: data.nombre.trim(),
        });
    }

    getTournament(id) {
        if (!isId(id)) throw new BadRequestError("El id del torneo no es valido.");
        const tournament = this.repository.findById("torneos", id);
        if (!tournament) throw new NotFoundError("Torneo no encontrado.");
        const teams = this.repository
            .findAll("equipos")
            .filter((team) => team.torneoId === id)
            .map((team) => ({
                ...team,
                partidosJugados: 0,
                ganados: 0,
                empatados: 0,
                perdidos: 0,
                golesFavor: 0,
                golesContra: 0,
            }));
        const statsByTeam = new Map(teams.map((team) => [team.id, team]));
        const matches = this.repository
            .findAll("partidos")
            .filter((match) => match.torneoId === id);

        for (const match of matches) {
            const home = statsByTeam.get(match.equipoLocalId);
            const away = statsByTeam.get(match.equipoVisitanteId);
            if (!home || !away) continue;
            home.partidosJugados += 1;
            away.partidosJugados += 1;
            home.golesFavor += match.golesLocal;
            home.golesContra += match.golesVisitante;
            away.golesFavor += match.golesVisitante;
            away.golesContra += match.golesLocal;
            if (match.golesLocal > match.golesVisitante) {
                home.ganados += 1;
                away.perdidos += 1;
            } else if (match.golesLocal < match.golesVisitante) {
                away.ganados += 1;
                home.perdidos += 1;
            } else {
                home.empatados += 1;
                away.empatados += 1;
            }
        }

        return { ...tournament, equipos: teams, partidos: matches };
    }

    addTeam(tournamentId, data) {
        const tournament = this.getTournament(tournamentId);
        if (
            !hasFields(data, teamFields) ||
            !isText(data.nombre) ||
            !Number.isSafeInteger(data.cantidadJugadores) ||
            data.cantidadJugadores < 1
        ) {
            throw new BadRequestError("Indica el nombre del equipo y una cantidad valida de jugadores.");
        }
        const normalizedName = data.nombre.trim().toLocaleLowerCase();
        const duplicate = this.repository.findAll("equipos").some(
            (team) =>
                team.torneoId === tournament.id &&
                team.nombre.toLocaleLowerCase() === normalizedName,
        );
        if (duplicate) throw new ConflictError("Ese equipo ya esta cargado en el torneo.");
        return this.repository.createTeam({
            ...data,
            nombre: data.nombre.trim(),
            torneoId: tournament.id,
        });
    }

    addMatch(tournamentId, data) {
        const tournament = this.getTournament(tournamentId);
        if (
            !hasFields(data, matchFields) ||
            !isId(data.equipoLocalId) ||
            !isId(data.equipoVisitanteId) ||
            data.equipoLocalId === data.equipoVisitanteId ||
            !isDate(data.fecha) ||
            data.fecha < tournament.fechaInicio ||
            data.fecha > tournament.fechaFin ||
            !Number.isSafeInteger(data.golesLocal) ||
            data.golesLocal < 0 ||
            !Number.isSafeInteger(data.golesVisitante) ||
            data.golesVisitante < 0
        ) {
            throw new BadRequestError("Indica un partido y un resultado validos dentro del periodo del torneo.");
        }
        const teams = this.repository.findAll("equipos");
        const home = teams.find(
            (team) => team.id === data.equipoLocalId && team.torneoId === tournament.id,
        );
        const away = teams.find(
            (team) => team.id === data.equipoVisitanteId && team.torneoId === tournament.id,
        );
        if (!home || !away) {
            throw new BadRequestError("Los dos equipos deben pertenecer al torneo.");
        }
        return this.repository.createMatch({ ...data, torneoId: tournament.id });
    }
}

export default new OperationsService();
