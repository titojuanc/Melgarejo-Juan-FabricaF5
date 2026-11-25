import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AuthRepository } from "../repositories/AuthRepository.js";
import { OperationsRepository } from "../repositories/OperationsRepository.js";
import { TurnoRepository } from "../repositories/TurnoRepository.js";
import { CumpleanosRepository } from "../repositories/CumpleanosRepository.js";
import { AuthService } from "./AuthService.js";
import { OperationsService } from "./OperationsService.js";
import { TurnoService } from "./TurnoService.js";
import { CumpleanosService } from "./CumpleanosService.js";
import { PublicInfoService } from "./PublicInfoService.js";
import { createApp } from "../app.js";

const clientData = {
    nombre: "Ana",
    apellido: "Perez",
    telefono: "1155551234",
    email: "ana@example.test",
    password: "PruebaSegura123",
};

async function fixture(context) {
    const directory = mkdtempSync(join(tmpdir(), "fabrica-cumpleanos-"));
    context.after(() => rmSync(directory, { recursive: true, force: true }));
    const auth = new AuthService(new AuthRepository(join(directory, "auth.json")));
    const birthdays = new CumpleanosRepository(
        join(directory, "cumpleanos.json"),
    );
    const turnos = new TurnoService(new TurnoRepository(), auth, birthdays);
    const publicInfo = new PublicInfoService();
    const cumpleanos = new CumpleanosService(
        birthdays,
        auth,
        turnos,
        publicInfo,
    );
    const operations = new OperationsService(
        new OperationsRepository(join(directory, "operations.json")),
        auth,
        turnos,
    );
    const server = createApp({
        auth,
        turnos,
        operations,
        publicInfo,
        birthdays: cumpleanos,
    }).listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    context.after(
        () =>
            new Promise((resolve, reject) =>
                server.close((error) => (error ? reject(error) : resolve())),
            ),
    );

    async function request(
        path,
        { method = "GET", data, cookie, origin = "http://127.0.0.1:5173" } = {},
    ) {
        const response = await fetch(
            `http://127.0.0.1:${server.address().port}${path}`,
            {
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...(origin ? { Origin: origin } : {}),
                    ...(cookie ? { Cookie: cookie } : {}),
                },
                ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
            },
        );
        return {
            response,
            body: await response.json(),
            cookie: response.headers.get("set-cookie")?.split(";")[0],
        };
    }

    return { auth, birthdays, request };
}

test("HTTP: crea solicitudes autenticadas, valida anticipacion y muestra solo las propias", async (context) => {
    context.mock.timers.enable({
        apis: ["Date"],
        now: new Date("2099-12-29T12:00:00"),
    });
    const { request, birthdays } = await fixture(context);
    const client = await request("/auth/register", {
        method: "POST",
        data: clientData,
    });
    const anotherClient = await request("/auth/register", {
        method: "POST",
        data: { ...clientData, email: "otra@example.test" },
    });
    const requestData = {
        paqueteId: "basico",
        fecha: "2099-12-31",
        horaInicio: "12:00",
    };

    const unauthorized = await request("/cumpleanos/consultas", {
        method: "POST",
        data: requestData,
    });
    assert.equal(unauthorized.response.status, 401);
    const created = await request("/cumpleanos/consultas", {
        method: "POST",
        cookie: client.cookie,
        data: requestData,
    });
    assert.equal(created.response.status, 201);
    assert.equal(created.body.data.clienteId, client.body.data.clienteId);
    assert.equal(created.body.data.horaFin, "14:00");
    assert.equal(created.body.data.estado, "Pendiente");
    assert.equal(
        (await request("/cumpleanos/mis", { cookie: client.cookie })).body.data
            .length,
        1,
    );
    assert.equal(
        (await request("/cumpleanos/mis", { cookie: anotherClient.cookie })).body
            .data.length,
        0,
    );
    assert.equal(
        new CumpleanosRepository(birthdays.filePath).findAll().length,
        1,
    );

    context.mock.timers.setTime(new Date("2099-12-29T13:00:00").getTime());
    const tooSoon = await request("/cumpleanos/consultas", {
        method: "POST",
        cookie: client.cookie,
        data: requestData,
    });
    assert.equal(tooSoon.response.status, 400);
    const invalidDate = await request("/cumpleanos/consultas", {
        method: "POST",
        cookie: client.cookie,
        data: { ...requestData, fecha: "2099-02-30" },
    });
    assert.equal(invalidDate.response.status, 400);
    const invalidPackage = await request("/cumpleanos/consultas", {
        method: "POST",
        cookie: client.cookie,
        data: { ...requestData, paqueteId: "desconocido" },
    });
    assert.equal(invalidPackage.response.status, 400);
    const outsideHours = await request("/cumpleanos/consultas", {
        method: "POST",
        cookie: client.cookie,
        data: {
            paqueteId: "premium",
            fecha: "2099-12-31",
            horaInicio: "20:00",
        },
    });
    assert.equal(outsideHours.response.status, 400);
    const premium = await request("/cumpleanos/consultas", {
        method: "POST",
        cookie: anotherClient.cookie,
        data: {
            paqueteId: "premium",
            fecha: "2099-12-31",
            horaInicio: "18:00",
        },
    });
    assert.equal(premium.response.status, 201);
    assert.equal(premium.body.data.horaFin, "21:00");
});

test("HTTP: personal confirma solicitudes, coordina disponibilidad y cancela eventos", async (context) => {
    const { auth, request } = await fixture(context);
    const client = await request("/auth/register", {
        method: "POST",
        data: clientData,
    });
    const created = await request("/cumpleanos/consultas", {
        method: "POST",
        cookie: client.cookie,
        data: {
            paqueteId: "basico",
            fecha: "2099-12-31",
            horaInicio: "12:00",
        },
    });
    assert.equal(created.response.status, 201);

    const turn = await request("/turnos", {
        method: "POST",
        cookie: client.cookie,
        data: {
            fecha: "2099-12-31",
            horaInicio: "12:00",
            horaFin: "13:00",
            cantidadJugadores: 10,
        },
    });
    assert.equal(turn.response.status, 201);

    const employeeData = {
        ...clientData,
        email: "empleado@example.test",
        rol: "empleado",
    };
    await auth.createStaff(employeeData);
    const employee = await request("/auth/login", {
        method: "POST",
        data: employeeData,
    });
    assert.equal(
        (await request("/interno/cumpleanos", { cookie: client.cookie })).response
            .status,
        403,
    );
    assert.equal(
        (
            await request(
                `/interno/cumpleanos/${created.body.data.id}/confirmar`,
                { method: "POST", cookie: client.cookie },
            )
        ).response.status,
        403,
    );
    assert.equal(
        (await request("/interno/cumpleanos", { cookie: employee.cookie })).body
            .data.length,
        1,
    );
    assert.equal(
        (
            await request("/interno/cumpleanos/999/confirmar", {
                method: "POST",
                cookie: employee.cookie,
            })
        ).response.status,
        404,
    );
    const blockedConfirmation = await request(
        `/interno/cumpleanos/${created.body.data.id}/confirmar`,
        { method: "POST", cookie: employee.cookie },
    );
    assert.equal(blockedConfirmation.response.status, 409);

    const canceledTurn = await request(`/turnos/${turn.body.data.id}/cancelar`, {
        method: "POST",
        cookie: employee.cookie,
    });
    assert.equal(canceledTurn.response.status, 200);
    const confirmed = await request(
        `/interno/cumpleanos/${created.body.data.id}/confirmar`,
        { method: "POST", cookie: employee.cookie },
    );
    assert.equal(confirmed.response.status, 200);
    assert.equal(confirmed.body.data.estado, "Confirmado");

    const availability = await request(
        "/turnos/disponibilidad?fecha=2099-12-31",
    );
    assert.equal(
        availability.body.data.some((slot) => slot.horaInicio === "12:00"),
        false,
    );
    assert.equal(
        availability.body.data.some((slot) => slot.horaInicio === "13:00"),
        false,
    );
    const overlappingTurn = await request("/turnos", {
        method: "POST",
        cookie: client.cookie,
        data: {
            fecha: "2099-12-31",
            horaInicio: "13:00",
            horaFin: "14:00",
            cantidadJugadores: 10,
        },
    });
    assert.equal(overlappingTurn.response.status, 409);

    const canceledBirthday = await request(
        `/interno/cumpleanos/${created.body.data.id}/cancelar`,
        { method: "POST", cookie: employee.cookie },
    );
    assert.equal(canceledBirthday.response.status, 200);
    assert.equal(canceledBirthday.body.data.estado, "Cancelado");
    const refreshedAvailability = await request(
        "/turnos/disponibilidad?fecha=2099-12-31",
    );
    assert.equal(
        refreshedAvailability.body.data.some((slot) => slot.horaInicio === "12:00"),
        true,
    );
    assert.equal(
        refreshedAvailability.body.data.some((slot) => slot.horaInicio === "13:00"),
        true,
    );
});

test("HTTP: no crea solicitudes que se superponen con un cumpleaños confirmado", async (context) => {
    const { auth, birthdays, request } = await fixture(context);
    const client = await request("/auth/register", {
        method: "POST",
        data: clientData,
    });
    const employeeData = {
        ...clientData,
        email: "empleado@example.test",
        rol: "empleado",
    };
    await auth.createStaff(employeeData);
    const employee = await request("/auth/login", {
        method: "POST",
        data: employeeData,
    });
    const data = {
        paqueteId: "basico",
        fecha: "2099-12-31",
        horaInicio: "13:00",
    };
    const create = (details) =>
        request("/cumpleanos/consultas", {
            method: "POST",
            cookie: client.cookie,
            data: details,
        });

    const original = await create(data);
    assert.equal(original.response.status, 201);
    assert.equal((await create(data)).response.status, 201);
    assert.equal(
        (
            await request(`/interno/cumpleanos/${original.body.data.id}/confirmar`, {
                method: "POST",
                cookie: employee.cookie,
            })
        ).response.status,
        200,
    );

    for (const conflict of [
        data,
        { ...data, paqueteId: "premium", horaInicio: "12:00" },
        { ...data, horaInicio: "14:00" },
    ]) {
        const result = await create(conflict);
        assert.equal(result.response.status, 409);
        assert.match(result.body.message, /horario ya no esta disponible/);
    }
    assert.equal(birthdays.findAll().length, 2);
    assert.equal(
        new CumpleanosRepository(birthdays.filePath).findAll().length,
        2,
    );
    assert.equal((await create({ ...data, horaInicio: "15:00" })).response.status, 201);
    assert.equal((await create({ ...data, fecha: "2099-12-30" })).response.status, 201);

    assert.equal(
        (
            await request(`/interno/cumpleanos/${original.body.data.id}/cancelar`, {
                method: "POST",
                cookie: employee.cookie,
            })
        ).response.status,
        200,
    );
    assert.equal((await create(data)).response.status, 201);
});
