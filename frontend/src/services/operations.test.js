import test from "node:test";
import assert from "node:assert/strict";
import {
    createMembership,
    createTeam,
    createTournament,
    getClients,
    getManagedTournament,
    getManagedTournaments,
    getPayments,
    generateFixture,
    recordAttendance,
    recordMatch,
    recordPayment,
    recordMatchResult,
} from "./operations.js";

test("los servicios internos envian cookies, rutas y datos operativos", async (context) => {
    const calls = [];
    const data = { id: 1, ok: true };
    context.mock.method(globalThis, "fetch", async (url, options) => {
        calls.push({ url, ...options });
        return Response.json({ success: true, data });
    });
    const payment = { monto: 1000, tipo: "membresia", membresiaId: 4 };

    assert.deepEqual(await getClients(), data);
    assert.deepEqual(await getPayments(), data);
    await recordPayment(payment);
    await createMembership({ clienteId: 3 });
    await recordAttendance({ clienteId: 3 });
    await getManagedTournaments();
    await createTournament({ nombre: "Copa" });
    await getManagedTournament(5);
    await createTeam(5, { nombre: "Verdes" });
    await generateFixture(5);
    await recordMatch(5, { golesLocal: 2, golesVisitante: 1 });
    await recordMatchResult(5, 7, { golesLocal: 3, golesVisitante: 0 });

    assert.deepEqual(
        calls.map(({ url }) => url),
        [
            "http://localhost:3000/interno/clientes",
            "http://localhost:3000/interno/pagos",
            "http://localhost:3000/interno/pagos",
            "http://localhost:3000/interno/gym/membresias",
            "http://localhost:3000/interno/gym/asistencias",
            "http://localhost:3000/interno/torneos",
            "http://localhost:3000/interno/torneos",
            "http://localhost:3000/interno/torneos/5",
            "http://localhost:3000/interno/torneos/5/equipos",
            "http://localhost:3000/interno/torneos/5/fixture",
            "http://localhost:3000/interno/torneos/5/partidos",
            "http://localhost:3000/interno/torneos/5/partidos/7",
        ],
    );
    assert.ok(calls.every(({ credentials }) => credentials === "include"));
    assert.equal(calls[2].method, "POST");
    assert.deepEqual(JSON.parse(calls[2].body), payment);
    assert.equal(calls[9].method, "POST");
    assert.deepEqual(JSON.parse(calls[9].body), {});
    assert.equal(calls[10].method, "POST");
    assert.equal(calls[11].method, "PUT");
    assert.deepEqual(JSON.parse(calls[11].body), {
        golesLocal: 3,
        golesVisitante: 0,
    });
});

test("los servicios internos propagan errores HTTP y de conexion", async (context) => {
    const fetchMock = context.mock.method(globalThis, "fetch", async () =>
        Response.json(
            { success: false, message: "No hay permisos." },
            { status: 403 },
        ),
    );
    await assert.rejects(getClients(), /No hay permisos/);
    fetchMock.mock.mockImplementation(async () => {
        throw new TypeError("offline");
    });
    await assert.rejects(getPayments(), /conectar con el servidor/);
});
