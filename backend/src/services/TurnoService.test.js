import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AuthRepository } from "../repositories/AuthRepository.js";
import { TurnoRepository } from "../repositories/TurnoRepository.js";
import { CumpleanosRepository } from "../repositories/CumpleanosRepository.js";
import { AuthService } from "./AuthService.js";
import { TurnoService } from "./TurnoService.js";
import { CumpleanosService } from "./CumpleanosService.js";
import { createApp } from "../app.js";

const clientData = {
    nombre: "Ana",
    apellido: "Perez",
    telefono: "1155551234",
    email: "ana@example.test",
    password: "PruebaSegura123",
    equipo: "Los verdes",
};

async function fixture(context) {
    const directory = mkdtempSync(join(tmpdir(), "fabrica-turnos-"));
    context.after(() => rmSync(directory, { recursive: true, force: true }));
    const auth = new AuthService(new AuthRepository(join(directory, "auth.json")));
    const birthdays = new CumpleanosRepository();
    const turnos = new TurnoService(new TurnoRepository(), auth, birthdays);
    const birthdayService = new CumpleanosService(
        birthdays,
        auth,
        turnos,
    );
    const server = createApp({ auth, turnos, birthdays: birthdayService }).listen(
        0,
        "127.0.0.1",
    );
    await new Promise((resolve) => server.once("listening", resolve));
    context.after(
        () =>
            new Promise((resolve, reject) =>
                server.close((error) => (error ? reject(error) : resolve())),
            ),
    );

    async function request(
        path,
        {
            method = "GET",
            data,
            cookie,
            origin = "http://127.0.0.1:5173",
        } = {},
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

    return { auth, request };
}

test("HTTP: clientes solo acceden a sus reservas y no pueden modificar identidades", async (context) => {
    const { auth, request } = await fixture(context);
    const registered = await request("/auth/register", {
        method: "POST",
        data: clientData,
    });
    const secondClient = await request("/auth/register", {
        method: "POST",
        data: { ...clientData, email: "otra@example.test" },
    });
    const payload = {
        fecha: "2099-12-31",
        horaInicio: "20:00",
        horaFin: "21:00",
        cantidadJugadores: 10,
        incluyeLuces: false,
        clienteId: 999,
    };
    const created = await request("/turnos", {
        method: "POST",
        data: payload,
        cookie: registered.cookie,
    });

    assert.equal(created.response.status, 201);
    assert.equal(created.body.data.clienteId, registered.body.data.clienteId);
    assert.equal(
        (
            await request("/turnos", {
                method: "POST",
                data: { ...payload, horaInicio: "22:00", horaFin: "23:00" },
                cookie: registered.cookie,
                origin: "https://externo.example",
            })
        ).response.status,
        403,
    );
    assert.equal((await request("/turnos")).response.status, 401);
    assert.equal(
        (await request("/turnos", { cookie: registered.cookie })).response.status,
        403,
    );
    assert.equal(
        (await request("/turnos/mis", { cookie: registered.cookie })).body.data.length,
        1,
    );
    assert.equal(
        (await request("/turnos/mis", { cookie: secondClient.cookie })).body.data.length,
        0,
    );
    const availability = await request(
        "/turnos/disponibilidad?fecha=2099-12-31",
    );
    assert.equal(availability.response.status, 200);
    assert.equal(availability.body.data.length, 9);
    assert.deepEqual(Object.keys(availability.body.data[0]).sort(), [
        "fecha",
        "horaFin",
        "horaInicio",
    ]);
    assert.equal(
        availability.body.data.some((slot) => slot.horaInicio === "20:00"),
        false,
    );
    assert.equal(
        (await request("/turnos/mis", { cookie: registered.cookie })).body.data[0]
            .clienteId,
        registered.body.data.clienteId,
    );
    assert.equal(
        (
            await request(`/turnos/${created.body.data.id}`, {
                method: "PUT",
                data: { clienteId: 2 },
                cookie: registered.cookie,
            })
        ).response.status,
        403,
    );
    assert.equal(
        (
            await request(`/turnos/${created.body.data.id}`, {
                method: "DELETE",
                cookie: registered.cookie,
            })
        ).response.status,
        403,
    );

    const staffData = {
        ...clientData,
        email: "empleado@example.test",
        rol: "empleado",
    };
    await auth.createStaff(staffData);
    const staff = await request("/auth/login", {
        method: "POST",
        data: staffData,
    });
    const staffList = await request("/turnos", { cookie: staff.cookie });
    assert.equal(staffList.response.status, 200);
    assert.equal(staffList.body.data.length, 1);
    const invalidOwner = await request("/turnos", {
        method: "POST",
        data: {
            fecha: "2099-12-31",
            horaInicio: "21:00",
            horaFin: "22:00",
            cantidadJugadores: 10,
            incluyeLuces: false,
            clienteId: 999,
        },
        cookie: staff.cookie,
    });
    assert.equal(invalidOwner.response.status, 400);
    const updated = await request(`/turnos/${created.body.data.id}`, {
        method: "PUT",
        data: { cantidadJugadores: 12 },
        cookie: staff.cookie,
    });
    assert.equal(updated.response.status, 200);
    assert.equal(updated.body.data.cantidadJugadores, 12);
    const lastSlot = await request("/turnos", {
        method: "POST",
        cookie: staff.cookie,
        data: {
            ...payload,
            horaInicio: "21:00",
            horaFin: "22:00",
            clienteId: registered.body.data.clienteId,
        },
    });
    assert.equal(lastSlot.response.status, 201);
});

test("HTTP: turnos rechaza fechas invalidas y reservas superpuestas", async (context) => {
    const { request } = await fixture(context);
    const registered = await request("/auth/register", {
        method: "POST",
        data: clientData,
    });
    const payload = {
        fecha: "2099-12-31",
        horaInicio: "20:00",
        horaFin: "21:00",
        cantidadJugadores: 10,
        incluyeLuces: false,
    };
    const first = await request("/turnos", {
        method: "POST",
        data: payload,
        cookie: registered.cookie,
    });
    assert.equal(first.response.status, 201);
    const overlap = await request("/turnos", {
        method: "POST",
        data: payload,
        cookie: registered.cookie,
    });
    assert.equal(overlap.response.status, 409);
    const invalid = await request("/turnos", {
        method: "POST",
        data: { ...payload, fecha: "2099-02-30" },
        cookie: registered.cookie,
    });
    assert.equal(invalid.response.status, 400);
    const outsideHours = await request("/turnos", {
        method: "POST",
        data: { ...payload, horaInicio: "11:00", horaFin: "12:00" },
        cookie: registered.cookie,
    });
    assert.equal(outsideHours.response.status, 400);
    const wrongDuration = await request("/turnos", {
        method: "POST",
        data: { ...payload, horaFin: "22:00" },
        cookie: registered.cookie,
    });
    assert.equal(wrongDuration.response.status, 400);
    assert.equal(
        (await request("/turnos/disponibilidad")).response.status,
        400,
    );
    assert.equal(
        (
            await request(
                "/turnos/disponibilidad?fecha=2099-02-30",
            )
        ).response.status,
        400,
    );
    assert.equal(
        (
            await request(
                "/turnos/disponibilidad?fecha=2020-01-01",
            )
        ).response.status,
        400,
    );
});

test("HTTP: el personal confirma y cancela turnos con transiciones validas", async (context) => {
    const { auth, request } = await fixture(context);
    const registered = await request("/auth/register", {
        method: "POST",
        data: clientData,
    });
    const created = await request("/turnos", {
        method: "POST",
        data: {
            fecha: "2099-12-31",
            horaInicio: "20:00",
            horaFin: "21:00",
            cantidadJugadores: 10,
            incluyeLuces: false,
        },
        cookie: registered.cookie,
    });
    const turnId = created.body.data.id;
    const staffData = {
        ...clientData,
        email: "empleado@example.test",
        rol: "empleado",
    };
    await auth.createStaff(staffData);
    const staff = await request("/auth/login", {
        method: "POST",
        data: staffData,
    });

    assert.equal(
        (
            await request(`/turnos/${turnId}/confirmar`, {
                method: "POST",
                cookie: registered.cookie,
            })
        ).response.status,
        403,
    );
    const confirmed = await request(`/turnos/${turnId}/confirmar`, {
        method: "POST",
        cookie: staff.cookie,
    });
    assert.equal(confirmed.response.status, 200);
    assert.equal(confirmed.body.data.estado, "Confirmado");

    const canceled = await request(`/turnos/${turnId}/cancelar`, {
        method: "POST",
        cookie: staff.cookie,
    });
    assert.equal(canceled.response.status, 200);
    assert.equal(canceled.body.data.estado, "Cancelado");
    const refreshedList = await request("/turnos", { cookie: staff.cookie });
    assert.equal(
        refreshedList.body.data.find((turno) => turno.id === turnId).estado,
        "Cancelado",
    );
    assert.equal(
        (
            await request(`/turnos/${turnId}`, {
                method: "PUT",
                cookie: staff.cookie,
                data: { cantidadJugadores: 12 },
            })
        ).response.status,
        409,
    );
    assert.equal(
        (
            await request(`/turnos/${turnId}/confirmar`, {
                method: "POST",
                cookie: staff.cookie,
            })
        ).response.status,
        409,
    );
    const availability = await request(
        "/turnos/disponibilidad?fecha=2099-12-31",
    );
    assert.equal(
        availability.body.data.some((slot) => slot.horaInicio === "20:00"),
        true,
    );
    const replacement = await request("/turnos", {
        method: "POST",
        cookie: registered.cookie,
        data: {
            fecha: "2099-12-31",
            horaInicio: "20:00",
            horaFin: "21:00",
            cantidadJugadores: 10,
            incluyeLuces: false,
        },
    });
    assert.equal(replacement.response.status, 201);
});

test("HTTP: el cliente cancela solo sus turnos y los menores a 12 horas quedan marcados", async (context) => {
    context.mock.timers.enable({
        apis: ["Date"],
        now: new Date("2099-12-31T08:00:00"),
    });
    const { request } = await fixture(context);
    const firstClient = await request("/auth/register", {
        method: "POST",
        data: clientData,
    });
    const turnoData = {
        fecha: "2099-12-31",
        horaInicio: "20:00",
        horaFin: "21:00",
        cantidadJugadores: 10,
        incluyeLuces: false,
    };
    const exactCutoff = await request("/turnos", {
        method: "POST",
        cookie: firstClient.cookie,
        data: turnoData,
    });
    const exactCutoffCancellation = await request(
        `/turnos/${exactCutoff.body.data.id}/cancelar`,
        { method: "POST", cookie: firstClient.cookie },
    );
    assert.equal(exactCutoffCancellation.response.status, 200);
    assert.equal(exactCutoffCancellation.body.data.cancelacionTardia, false);

    context.mock.timers.setTime(new Date("2099-12-31T12:00:00").getTime());
    const lateClient = await request("/auth/register", {
        method: "POST",
        data: { ...clientData, email: "tarde@example.test" },
    });
    const lateOtherClient = await request("/auth/register", {
        method: "POST",
        data: { ...clientData, email: "otra-tarde@example.test" },
    });
    const lateTurno = await request("/turnos", {
        method: "POST",
        cookie: lateClient.cookie,
        data: turnoData,
    });
    const otherOwnerCancellation = await request(
        `/turnos/${lateTurno.body.data.id}/cancelar`,
        { method: "POST", cookie: lateOtherClient.cookie },
    );
    assert.equal(otherOwnerCancellation.response.status, 403);
    const lateCancellation = await request(
        `/turnos/${lateTurno.body.data.id}/cancelar`,
        { method: "POST", cookie: lateClient.cookie },
    );
    assert.equal(lateCancellation.response.status, 200);
    assert.equal(lateCancellation.body.data.estado, "Cancelado");
    assert.equal(lateCancellation.body.data.cancelacionTardia, true);
});