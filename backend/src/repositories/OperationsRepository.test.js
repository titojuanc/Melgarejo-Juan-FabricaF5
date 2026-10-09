import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadOperationsState } from "./OperationsRepository.js";

const seedPath = fileURLToPath(
    new URL("../fixtures/operations.seed.json", import.meta.url),
);

function temporaryPath(context) {
    const directory = mkdtempSync(join(tmpdir(), "fabrica-operations-seed-"));
    context.after(() => rmSync(directory, { recursive: true, force: true }));
    return join(directory, "operations.json");
}

test("usa la semilla versionada cuando falta el archivo operativo", (context) => {
    const dataPath = temporaryPath(context);
    const state = loadOperationsState(dataPath, seedPath);

    assert.equal(state.torneos.length, 1);
    assert.equal(state.torneos[0].nombre, "Torneo demostracion");
    assert.equal(state.equipos.length, 4);
    assert.equal(state.partidos.length, 6);
    assert.equal(existsSync(dataPath), false);
});

test("respeta un archivo operativo existente aunque este vacio", (context) => {
    const dataPath = temporaryPath(context);
    const emptyState = {
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
    };
    writeFileSync(dataPath, JSON.stringify(emptyState));

    const state = loadOperationsState(dataPath, seedPath);
    assert.deepEqual(state, emptyState);
});

test("una ruta OPERATIONS_DATA_FILE personalizada no importa la demo", (context) => {
    const dataPath = temporaryPath(context);
    const state = loadOperationsState(dataPath);
    assert.equal(state.torneos.length, 0);
    assert.equal(state.partidos.length, 0);
});

test("un archivo operativo invalido no se sustituye silenciosamente", (context) => {
    const dataPath = temporaryPath(context);
    writeFileSync(dataPath, "{invalid json");
    assert.throws(() => loadOperationsState(dataPath, seedPath), SyntaxError);
});
