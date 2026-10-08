import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Pago from "../models/Pago.js";
import Membresia from "../models/Membresia.js";
import Torneo from "../models/Torneo.js";
import Equipo from "../models/Equipo.js";
import Partido from "../models/Partido.js";

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

export class OperationsRepository {
    constructor(
        filePath = process.env.OPERATIONS_DATA_FILE ||
            fileURLToPath(new URL("../../data/operations.json", import.meta.url)),
    ) {
        this.filePath = filePath;
        try {
            this.state = JSON.parse(readFileSync(this.filePath, "utf8"));
            if (!isValidState(this.state)) {
                throw new Error("El archivo de operaciones no tiene un formato valido.");
            }
        } catch (error) {
            if (error.code !== "ENOENT") throw error;
            this.state = initialState();
        }
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
        mkdirSync(dirname(this.filePath), { recursive: true });
        const temporaryPath = `${this.filePath}.tmp`;
        writeFileSync(temporaryPath, JSON.stringify(nextState, null, 4), {
            mode: 0o600,
        });
        renameSync(temporaryPath, this.filePath);
        this.state = nextState;
        return record;
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
            data.golesLocal,
            data.golesVisitante,
        ));
    }
}

export default new OperationsRepository();
