import test from "node:test";
import assert from "node:assert/strict";
import {
    getAvailability,
    getMine,
    getTurnos,
    createTurno,
    updateTurno,
    confirmTurno,
    cancelTurno,
    deleteTurno,
} from "./turnos.js";

test("los servicios respetan las rutas, metodos y formato de la API", async (context) => {
    const calls = [];
    const turno = { id: 1, fecha: "2026-11-09" };
    context.mock.method(globalThis, "fetch", async (url, options) => {
        calls.push({ url, ...options });
        return Response.json({ success: true, data: turno });
    });
    assert.deepEqual(await getAvailability(), turno);
    assert.deepEqual(await getMine(), turno);
    assert.deepEqual(await getTurnos(), turno);
    await createTurno(turno);
    await updateTurno(1, turno);
    await confirmTurno(1);
    await cancelTurno(1);
    await deleteTurno(1);
    assert.equal(calls[0].url, "http://localhost:3000/turnos/disponibilidad");
    assert.equal(calls[0].credentials, "include");
    assert.equal(calls[1].url, "http://localhost:3000/turnos/mis");
    assert.equal(calls[2].url, "http://localhost:3000/turnos");
    assert.equal(calls[3].method, "POST");
    assert.deepEqual(JSON.parse(calls[3].body), turno);
    assert.equal(calls[4].url, "http://localhost:3000/turnos/1");
    assert.equal(calls[4].method, "PUT");
    assert.equal(calls[5].url, "http://localhost:3000/turnos/1/confirmar");
    assert.equal(calls[5].method, "POST");
    assert.equal(calls[6].url, "http://localhost:3000/turnos/1/cancelar");
    assert.equal(calls[6].method, "POST");
    assert.equal(calls[7].method, "DELETE");
});

test("propaga errores del backend", async (context) => {
    context.mock.method(globalThis, "fetch", async () =>
        Response.json(
            { success: false, message: "Turno no encontrado" },
            { status: 404 },
        ),
    );
    await assert.rejects(getTurnos(), /Turno no encontrado/);
});

test("informa fallos de conexion y respuestas no JSON", async (context) => {
    const fetchMock = context.mock.method(globalThis, "fetch", async () => {
        throw new TypeError("offline");
    });
    await assert.rejects(getTurnos(), /conectar con el servidor/);
    fetchMock.mock.mockImplementation(async () => new Response("error"));
    await assert.rejects(getTurnos(), /respuesta no valida/);
});
