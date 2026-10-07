import test from "node:test";
import assert from "node:assert/strict";
import {
    createBirthdayInquiry,
    getBirthdayPackages,
    getGymInfo,
    getTournament,
    getTournaments,
} from "./publicInfo.js";

test("los servicios publicos usan las rutas y credenciales esperadas", async (context) => {
    const calls = [];
    const data = { id: 1, ok: true };
    context.mock.method(globalThis, "fetch", async (url, options) => {
        calls.push({ url, ...options });
        return Response.json({ success: true, data });
    });

    assert.deepEqual(await getGymInfo(), data);
    assert.deepEqual(await getBirthdayPackages(), data);
    assert.deepEqual(
        await createBirthdayInquiry({ paqueteId: "full", fecha: "2099-12-31" }),
        data,
    );
    assert.deepEqual(await getTournaments(), data);
    assert.deepEqual(await getTournament(2), data);

    assert.deepEqual(
        calls.map(({ url }) => url),
        [
            "http://localhost:3000/gym",
            "http://localhost:3000/cumpleanos/paquetes",
            "http://localhost:3000/cumpleanos/consultas",
            "http://localhost:3000/torneos",
            "http://localhost:3000/torneos/2",
        ],
    );
    assert.ok(calls.every(({ credentials }) => credentials === "include"));
    assert.equal(calls[2].method, "POST");
    assert.deepEqual(JSON.parse(calls[2].body), {
        paqueteId: "full",
        fecha: "2099-12-31",
    });
});

test("propaga errores de la API y fallos de conexion", async (context) => {
    const fetchMock = context.mock.method(globalThis, "fetch", async () =>
        Response.json(
            { success: false, message: "No hay sesion activa." },
            { status: 401 },
        ),
    );
    await assert.rejects(createBirthdayInquiry({}), /No hay sesion activa/);
    fetchMock.mock.mockImplementation(async () => {
        throw new TypeError("offline");
    });
    await assert.rejects(getGymInfo(), /conectar con el servidor/);
});