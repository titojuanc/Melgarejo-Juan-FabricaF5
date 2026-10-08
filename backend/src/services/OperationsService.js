import {
    BadRequestError,
    ConflictError,
    NotFoundError,
} from "../exceptions/AppError.js";
import operationsRepository from "../repositories/OperationsRepository.js";
import {
    addFixtureDays,
    createCupRound,
    createLeagueFixture,
} from "../utils/tournamentFixture.js";
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
    "formato",
    "intervaloDias",
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
            !tournamentStates.has(data.estado) ||
            !["liga", "copa"].includes(data.formato) ||
            !Number.isSafeInteger(data.intervaloDias) ||
            data.intervaloDias < 1 ||
            data.intervaloDias > 365
        ) {
            throw new BadRequestError("Indica nombre, fechas, formato e intervalo validos para el torneo.");
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
                diferenciaGoles: 0,
                puntos: 0,
            }));
        const statsByTeam = new Map(teams.map((team) => [team.id, team]));
        const matches = this.repository
            .findAll("partidos")
            .filter((match) => match.torneoId === id)
            .sort((first, second) =>
                first.ronda - second.ronda ||
                first.fecha.localeCompare(second.fecha) ||
                first.id - second.id,
            );

        for (const match of matches) {
            const isLegacyResult =
                match.estado === undefined &&
                Number.isSafeInteger(match.golesLocal) &&
                Number.isSafeInteger(match.golesVisitante);
            if (match.estado !== "Finalizado" && !isLegacyResult) continue;
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
                home.puntos += 3;
            } else if (match.golesLocal < match.golesVisitante) {
                away.ganados += 1;
                home.perdidos += 1;
                away.puntos += 3;
            } else {
                home.empatados += 1;
                away.empatados += 1;
                home.puntos += 1;
                away.puntos += 1;
            }
        }

        for (const team of teams) {
            team.diferenciaGoles = team.golesFavor - team.golesContra;
        }
        const tabla = [...teams]
            .sort((first, second) =>
                second.puntos - first.puntos ||
                second.diferenciaGoles - first.diferenciaGoles ||
                second.golesFavor - first.golesFavor ||
                first.nombre.localeCompare(second.nombre, "es"),
            )
            .map((team, index) => ({ posicion: index + 1, ...team }));
        const descansos = (tournament.descansos || []).map((bye) => ({
            ...bye,
            equipo: statsByTeam.get(bye.equipoId)?.nombre || "Equipo",
        }));

        return {
            ...tournament,
            equipos: teams,
            tabla: tournament.formato === "liga" ? tabla : [],
            partidos: matches,
            descansos,
            campeon: tournament.campeonId
                ? statsByTeam.get(tournament.campeonId) || null
                : null,
        };
    }

    generateFixture(id) {
        const tournament = this.getTournament(id);
        const teams = this.repository
            .findAll("equipos")
            .filter((team) => team.torneoId === tournament.id);
        if (tournament.fixtureGenerado || tournament.partidos.length) {
            throw new ConflictError("El fixture de este torneo ya fue generado.");
        }
        if (teams.length < 2) {
            throw new BadRequestError("Carga al menos dos equipos antes de generar el fixture.");
        }

        const totalMatches =
            tournament.formato === "liga"
                ? (teams.length * (teams.length - 1)) / 2
                : teams.length - 1;
        const lastDate = addFixtureDays(
            tournament.fechaInicio,
            (totalMatches - 1) * tournament.intervaloDias,
        );
        if (lastDate > tournament.fechaFin) {
            throw new BadRequestError(
                `Con ${tournament.intervaloDias} dias entre partidos, el fixture termina el ${lastDate}, fuera del periodo del torneo.`,
            );
        }

        const teamIds = teams.map(({ id: teamId }) => teamId);
        const generated =
            tournament.formato === "liga"
                ? createLeagueFixture(
                      teamIds,
                      tournament.fechaInicio,
                      tournament.intervaloDias,
                  )
                : createCupRound(
                      teamIds,
                      tournament.fechaInicio,
                      tournament.intervaloDias,
                  );
        for (const fixture of generated.fixtures) {
            this.repository.createMatch({
                ...fixture,
                torneoId: tournament.id,
                golesLocal: null,
                golesVisitante: null,
                estado: "Pendiente",
            });
        }
        this.repository.updateTournament(tournament.id, {
            fixtureGenerado: true,
            descansos: generated.byes,
        });
        return this.getTournament(tournament.id);
    }

    recordMatchResult(tournamentId, matchId, data) {
        const tournament = this.getTournament(tournamentId);
        const resultFields = new Set([
            "golesLocal",
            "golesVisitante",
            "penalesLocal",
            "penalesVisitante",
        ]);
        if (
            !hasFields(data, resultFields, ["golesLocal", "golesVisitante"]) ||
            !Number.isSafeInteger(data.golesLocal) ||
            data.golesLocal < 0 ||
            !Number.isSafeInteger(data.golesVisitante) ||
            data.golesVisitante < 0
        ) {
            throw new BadRequestError("Indica un resultado valido.");
        }
        const hasPenalties =
            Object.hasOwn(data, "penalesLocal") ||
            Object.hasOwn(data, "penalesVisitante");
        if (tournament.formato === "copa" && data.golesLocal === data.golesVisitante) {
            if (
                !Number.isSafeInteger(data.penalesLocal) ||
                data.penalesLocal < 0 ||
                !Number.isSafeInteger(data.penalesVisitante) ||
                data.penalesVisitante < 0 ||
                data.penalesLocal === data.penalesVisitante
            ) {
                throw new BadRequestError(
                    "Un empate de copa requiere un ganador por penales.",
                );
            }
        } else if (hasPenalties) {
            throw new BadRequestError(
                "Los penales solo se cargan cuando el partido termina empatado.",
            );
        }
        const match = this.repository.findById("partidos", matchId);
        if (!match || match.torneoId !== tournament.id) {
            throw new NotFoundError("Partido no encontrado.");
        }
        if (match.estado !== "Pendiente") {
            throw new ConflictError("Este partido ya tiene un resultado cargado.");
        }

        const updated = this.repository.updateMatch(match.id, {
            golesLocal: data.golesLocal,
            golesVisitante: data.golesVisitante,
            penalesLocal: data.penalesLocal ?? null,
            penalesVisitante: data.penalesVisitante ?? null,
            estado: "Finalizado",
        });

        if (tournament.formato === "copa") {
            this.advanceCup(tournament, match.ronda);
        }
        return { partido: updated, torneo: this.getTournament(tournament.id) };
    }

    advanceCup(tournament, round) {
        const roundMatches = this.repository
            .findAll("partidos")
            .filter((match) => match.torneoId === tournament.id && match.ronda === round);
        if (!roundMatches.length || roundMatches.some((match) => match.estado !== "Finalizado")) {
            return;
        }

        const byeIds = (tournament.descansos || [])
            .filter((bye) => bye.ronda === round)
            .map(({ equipoId }) => equipoId);
        const winners = [
            ...byeIds,
            ...roundMatches.map((match) => {
                if (match.golesLocal > match.golesVisitante) {
                    return match.equipoLocalId;
                }
                if (match.golesLocal < match.golesVisitante) {
                    return match.equipoVisitanteId;
                }
                return match.penalesLocal > match.penalesVisitante
                    ? match.equipoLocalId
                    : match.equipoVisitanteId;
            }),
        ];
        if (winners.length === 1) {
            this.repository.updateTournament(tournament.id, {
                campeonId: winners[0],
                estado: "Finalizado",
            });
            return;
        }

        const lastPlayedDate = roundMatches
            .map(({ fecha }) => fecha)
            .sort()
            .at(-1);
        const startDate = addFixtureDays(lastPlayedDate, tournament.intervaloDias);
        const nextRound = round + 1;
        for (let index = 0; index < winners.length; index += 2) {
            this.repository.createMatch({
                torneoId: tournament.id,
                ronda: nextRound,
                fecha: addFixtureDays(startDate, (index / 2) * tournament.intervaloDias),
                equipoLocalId: winners[index],
                equipoVisitanteId: winners[index + 1],
                estado: "Pendiente",
            });
        }
    }

    getPublicTournaments() {
        return this.listTournaments().map(({ id }) => this.getPublicTournament(id));
    }

    getPublicTournament(id) {
        if (!isId(id)) throw new BadRequestError("El id del torneo no es valido.");
        const tournament = this.getTournament(id);
        const names = new Map(tournament.equipos.map((team) => [team.id, team.nombre]));
        return {
            id: `operativo-${tournament.id}`,
            nombre: tournament.nombre,
            fechaInicio: tournament.fechaInicio,
            fechaFin: tournament.fechaFin,
            formato: tournament.formato,
            estado: tournament.estado,
            equiposAnotados: tournament.equipos.length,
            fixtureGenerado: tournament.fixtureGenerado,
            tabla:
                tournament.formato === "liga"
                    ? tournament.tabla.map((team) => ({
                          posicion: team.posicion,
                          equipo: team.nombre,
                          partidosJugados: team.partidosJugados,
                          ganados: team.ganados,
                          empatados: team.empatados,
                          perdidos: team.perdidos,
                          golesFavor: team.golesFavor,
                          golesContra: team.golesContra,
                          diferenciaGoles: team.diferenciaGoles,
                          puntos: team.puntos,
                      }))
                    : [],
            descansos: tournament.descansos.map(({ ronda, equipo }) => ({
                ronda,
                equipo,
            })),
            campeon: tournament.campeon
                ? { equipo: tournament.campeon.nombre }
                : null,
            partidos: tournament.partidos.map((match) => ({
                id: match.id,
                ronda: match.ronda,
                fecha: match.fecha,
                local: names.get(match.equipoLocalId) || "Por definir",
                visitante: names.get(match.equipoVisitanteId) || "Por definir",
                golesLocal: match.golesLocal,
                golesVisitante: match.golesVisitante,
                resultado:
                    match.estado === "Finalizado"
                        ? `${match.golesLocal} - ${match.golesVisitante}${match.penalesLocal === null ? "" : ` (${match.penalesLocal} - ${match.penalesVisitante} pen.)`}`
                        : null,
                estado: match.estado,
            })),
            datosDeReferencia: false,
        };
    }

    addTeam(tournamentId, data) {
        const tournament = this.getTournament(tournamentId);
        if (tournament.fixtureGenerado) {
            throw new ConflictError("No se pueden agregar equipos luego de generar el fixture.");
        }
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
        if (tournament.fixtureGenerado) {
            throw new ConflictError("Carga el resultado sobre un partido del fixture generado.");
        }
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
