import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CumpleanosRepository } from "./CumpleanosRepository.js";

test("persiste solicitudes y estados entre reinicios", (context) => {
    const directory = mkdtempSync(join(tmpdir(), "fabrica-cumpleanos-"));
    context.after(() => rmSync(directory, { recursive: true, force: true }));
    const filePath = join(directory, "cumpleanos.json");
    const first = new CumpleanosRepository(filePath);
    const created = first.create({
        clienteId: 1,
        paqueteId: "basico",
        fecha: "2099-12-31",
        horaInicio: "12:00",
        horaFin: "14:00",
    });

    created.confirmar();
    first.save();
    const restored = new CumpleanosRepository(filePath);
    assert.equal(restored.findById(created.id).estado, "Confirmado");
    assert.equal(
        restored.create({
            clienteId: 2,
            paqueteId: "premium",
            fecha: "2099-12-31",
            horaInicio: "15:00",
            horaFin: "18:00",
        }).id,
        2,
    );
});
