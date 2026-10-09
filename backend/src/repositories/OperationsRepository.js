import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Pago from "../models/Pago.js";
import Membresia from "../models/Membresia.js";
import Torneo from "../models/Torneo.js";
import Equipo from "../models/Equipo.js";
import Partido from "../models/Partido.js";

const defaultDataPath = fileURLToPath(
    new URL("../../data/operations.json", import.meta.url),
);
const defaultSeedPath = fileURLToPath(
    new URL("../fixtures/operations.seed.json", import.meta.url),
);

const initialState = () => ({
    pagos: [],
    membresias: [],
    asistencias: [],
    torneos: [],
    equipos: [],
    partidos: [],
    nextPagoId: 1,
    nextMembresiaId: 1,
    nextAsistenciaId: 1,
    nextTorneoId: 1,
    nextEquipoId: 1,
    nextPartidoId: 1,
});

function isValidState(state) {
    return (
        state &&
        ["pagos", "membresias", "asistencias", "torneos", "equipos", "partidos"].every(
            (key) => Array.isArray(state[key]),
        ) &&
        [
            "nextPagoId",
            "nextMembresiaId",
            "nextAsistenciaId",
            "nextTorneoId",
            "nextEquipoId",
            "nextPartidoId",
        ].every((key) => Number.isSafeInteger(state[key]) && state[key] > 0)
    );
}

function readState(filePath) {
    const state = JSON.parse(readFileSync(filePath, "utf8"));
    if (!isValidState(state)) {
        throw new Error("El archivo de operaciones no tiene un formato valido.");
    }
    return state;
}

export function loadOperationsState(filePath, seedPath = null) {
    try {
        return readState(filePath);
    } catch (error) {
        if (error.code !== "ENOENT") throw error;
        return seedPath ? readState(seedPath) : initialState();
    }
}

export class OperationsRepository {
    constructor(
        filePath = process.env.OPERATIONS_DATA_FILE ||
            defaultDataPath,
    ) {
        this.filePath = filePath;
        const seedPath =
            filePath === defaultDataPath && !process.env.OPERATIONS_DATA_FILE
                ? defaultSeedPath
                : null;
        this.state = loadOperationsState(this.filePath, seedPath);
    }

    findAll(collection) {
        return this.state[collection];
    }

    findById(collection, id) {
        return this.state[collection].find((record) => record.id === id);
    }

    create(collection, counter, createRecord) {
        const id = this.state[counter];
        const record = createRecord(id);
        const nextState = {
            ...this.state,
            [collection]: [...this.state[collection], record],
            [counter]: id + 1,
        };
        this.save(nextState);
        return record;
    }

    update(collection, id, data) {
        const current = this.findById(collection, id);
        if (!current) return null;
        const updated = { ...current, ...data };
        const nextState = {
            ...this.state,
            [collection]: this.state[collection].map((record) =>
                record.id === id ? updated : record,
            ),
        };
        this.save(nextState);
        return updated;
    }

    save(nextState) {
        mkdirSync(dirname(this.filePath), { recursive: true });
        const temporaryPath = `${this.filePath}.tmp`;
        writeFileSync(temporaryPath, JSON.stringify(nextState, null, 4), {
            mode: 0o600,
        });
        renameSync(temporaryPath, this.filePath);
        this.state = nextState;
    }

    createPayment(data) {
        return this.create("pagos", "nextPagoId", (id) => new Pago(
            id,
            data.monto,
            data.fecha,
            data.tipo,
            "Pagado",
            data.turnoId ?? null,
            data.membresiaId ?? null,
            data.clienteId,
        ));
    }

    createMembership(data) {
        return this.create("membresias", "nextMembresiaId", (id) => new Membresia(
            id,
            data.fechaInicio,
            data.fechaVencimiento,
            data.estado,
            data.clienteId,
        ));
    }

    createAttendance(data) {
        return this.create("asistencias", "nextAsistenciaId", (id) => ({ id, ...data }));
    }

    createTournament(data) {
        return this.create("torneos", "nextTorneoId", (id) => new Torneo(
            id,
            data.nombre,
            data.fechaInicio,
            data.fechaFin,
            data.estado,
            data.formato,
            data.intervaloDias,
        ));
    }

    createTeam(data) {
        return this.create("equipos", "nextEquipoId", (id) => new Equipo(
            id,
            data.nombre,
            data.cantidadJugadores,
            data.torneoId,
        ));
    }

    createMatch(data) {
        return this.create("partidos", "nextPartidoId", (id) => new Partido(
            id,
            data.torneoId,
            data.equipoLocalId,
            data.equipoVisitanteId,
            data.fecha,
            data.golesLocal ?? null,
            data.golesVisitante ?? null,
            data.ronda ?? 1,
            data.estado ??
                (data.golesLocal !== undefined && data.golesVisitante !== undefined
                    ? "Finalizado"
                    : "Pendiente"),
            data.penalesLocal ?? null,
            data.penalesVisitante ?? null,
        ));
    }

    updateTournament(id, data) {
        return this.update("torneos", id, data);
    }

    updateMatch(id, data) {
        return this.update("partidos", id, data);
    }
}

export default new OperationsRepository();
