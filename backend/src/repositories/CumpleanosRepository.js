import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Cumpleanos from "../models/Cumpleanos.js";

const defaultDataPath = fileURLToPath(
    new URL("../../data/cumpleanos.json", import.meta.url),
);

function toCumpleanos(record) {
    return new Cumpleanos(record.id, record);
}

function loadState(filePath) {
    try {
        const state = JSON.parse(readFileSync(filePath, "utf8"));
        if (
            !Array.isArray(state?.cumpleanos) ||
            !Number.isSafeInteger(state.nextId) ||
            state.nextId < 1
        ) {
            throw new Error("El archivo de cumpleanos no tiene un formato valido.");
        }
        return {
            cumpleanos: state.cumpleanos.map(toCumpleanos),
            nextId: state.nextId,
        };
    } catch (error) {
        if (error.code !== "ENOENT") throw error;
        return { cumpleanos: [], nextId: 1 };
    }
}

export class CumpleanosRepository {
    constructor(filePath = null) {
        this.filePath = filePath;
        const state = filePath
            ? loadState(filePath)
            : { cumpleanos: [], nextId: 1 };
        this.cumpleanos = state.cumpleanos;
        this.nextId = state.nextId;
    }

    findAll() {
        return this.cumpleanos;
    }

    findById(id) {
        return this.cumpleanos.find((item) => item.id === id);
    }

    hasConfirmedConflict(data) {
        return this.cumpleanos.some(
            (item) =>
                item.estado === "Confirmado" &&
                item.fecha === data.fecha &&
                item.horaInicio < data.horaFin &&
                item.horaFin > data.horaInicio,
        );
    }

    create(data) {
        const item = new Cumpleanos(this.nextId, data);
        this.cumpleanos.push(item);
        this.nextId += 1;
        this.save();
        return item;
    }

    save() {
        if (!this.filePath) return;
        mkdirSync(dirname(this.filePath), { recursive: true });
        const temporaryPath = `${this.filePath}.tmp`;
        writeFileSync(
            temporaryPath,
            JSON.stringify(
                { cumpleanos: this.cumpleanos, nextId: this.nextId },
                null,
                4,
            ),
            { mode: 0o600 },
        );
        renameSync(temporaryPath, this.filePath);
    }
}

export default new CumpleanosRepository(
    process.env.BIRTHDAYS_DATA_FILE || defaultDataPath,
);
