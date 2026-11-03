import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TurnoRepository } from "./TurnoRepository.js";

const turnoData = {
    fecha: "2026-12-01",
    horaInicio: "18:00",
    horaFin: "19:00",
    cantidadJugadores: 10,
    incluyeLuces: true,
    clienteId: 1,
};

function temporaryPath(context) {
    const directory = mkdtempSync(join(tmpdir(), "fabrica-turnos-"));
    context.after(() => rmSync(directory, { recursive: true, force: true }));
    return join(directory, "turnos.json");
}

test("sin archivo trabaja en memoria y no escribe en disco", (context) => {
    const repository = new TurnoRepository();
    repository.create(turnoData);

    assert.equal(repository.findAll().length, 1);
    assert.equal(repository.filePath, null);
});

test("conserva los turnos y el contador al reiniciar", (context) => {
    const filePath = temporaryPath(context);
    const first = new TurnoRepository(filePath);
    const created = first.create(turnoData);

    const second = new TurnoRepository(filePath);
    assert.equal(second.findAll().length, 1);
    assert.equal(second.findById(created.id).horaInicio, "18:00");
    assert.equal(second.create({ ...turnoData, horaInicio: "19:00", horaFin: "20:00" }).id, 2);
});

test("persiste cambios de estado, actualizaciones y eliminaciones", (context) => {
    const filePath = temporaryPath(context);
    const repository = new TurnoRepository(filePath);
    const turno = repository.create(turnoData);

    turno.confirmar();
    repository.save();
    assert.equal(new TurnoRepository(filePath).findById(turno.id).estado, "Confirmado");

    repository.update(turno.id, { horaInicio: "20:00", horaFin: "21:00" });
    assert.equal(new TurnoRepository(filePath).findById(turno.id).horaInicio, "20:00");

    repository.delete(turno.id);
    assert.equal(new TurnoRepository(filePath).findAll().length, 0);
});

test("los turnos cargados conservan los metodos del modelo", (context) => {
    const filePath = temporaryPath(context);
    new TurnoRepository(filePath).create(turnoData);

    const turno = new TurnoRepository(filePath).findById(1);
    turno.confirmar();
    assert.equal(turno.estado, "Confirmado");
});

test("arranca vacio si el archivo no existe", (context) => {
    const filePath = temporaryPath(context);
    const repository = new TurnoRepository(filePath);

    assert.equal(repository.findAll().length, 0);
    assert.equal(existsSync(filePath), false);
});

test("rechaza un archivo con formato invalido", (context) => {
    const filePath = temporaryPath(context);
    writeFileSync(filePath, JSON.stringify({ turnos: "x" }));

    assert.throws(() => new TurnoRepository(filePath), /formato valido/);
});
