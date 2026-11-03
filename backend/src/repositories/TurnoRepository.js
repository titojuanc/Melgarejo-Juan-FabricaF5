import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Turno from "../models/Turno.js";

const defaultDataPath = fileURLToPath(
    new URL("../../data/turnos.json", import.meta.url)
);

function toTurno(record) {
    return new Turno(
        record.id,
        record.fecha,
        record.horaInicio,
        record.horaFin,
        record.cantidadJugadores,
        record.incluyeLuces,
        record.estado,
        record.clienteId
    );
}

function loadState(filePath) {
    try {
        const state = JSON.parse(readFileSync(filePath, "utf8"));
        if (!Array.isArray(state?.turnos) || !Number.isSafeInteger(state.nextId) || state.nextId < 1) {
            throw new Error("El archivo de turnos no tiene un formato valido.");
        }
        return { turnos: state.turnos.map(toTurno), nextId: state.nextId };
    } catch (error) {
        if (error.code !== "ENOENT") throw error;
        return { turnos: [], nextId: 1 };
    }
}

export class TurnoRepository {
    // Sin filePath los turnos quedan solo en memoria (util para pruebas).
    constructor(filePath = null) {
        this.filePath = filePath;
        const state = filePath ? loadState(filePath) : { turnos: [], nextId: 1 };
        this.turnos = state.turnos;
        this.nextId = state.nextId;
    }

    findAll() {
        return this.turnos;
    }

    findById(id) {
        return this.turnos.find((turno) => turno.id === id);
    }

    create(data) {
        const turno = new Turno(
            this.nextId,
            data.fecha,
            data.horaInicio,
            data.horaFin,
            data.cantidadJugadores,
            data.incluyeLuces ?? false,
            "Pendiente",
            data.clienteId
        );
        this.turnos.push(turno);
        this.nextId += 1;
        this.save();
        return turno;
    }

    update(id, data) {
        const turno = this.findById(id);
        if (!turno) return null;
        Object.assign(turno, data);
        this.save();
        return turno;
    }

    delete(id) {
        const index = this.turnos.findIndex((turno) => turno.id === id);
        if (index === -1) return false;
        this.turnos.splice(index, 1);
        this.save();
        return true;
    }

    // Persiste el estado actual; tambien se usa tras cambios de estado hechos sobre el modelo.
    save() {
        if (!this.filePath) return;
        mkdirSync(dirname(this.filePath), { recursive: true });
        const temporaryPath = `${this.filePath}.tmp`;
        writeFileSync(
            temporaryPath,
            JSON.stringify({ turnos: this.turnos, nextId: this.nextId }, null, 4),
            { mode: 0o600 }
        );
        renameSync(temporaryPath, this.filePath);
    }
}

export default new TurnoRepository(process.env.TURNOS_DATA_FILE || defaultDataPath);
