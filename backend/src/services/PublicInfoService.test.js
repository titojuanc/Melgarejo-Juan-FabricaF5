import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AuthRepository } from "../repositories/AuthRepository.js";
import { AuthService } from "./AuthService.js";
import { createApp } from "../app.js";
import { PublicInfoService } from "./PublicInfoService.js";

async function httpFixture(context) {
    const directory = mkdtempSync(join(tmpdir(), "fabrica-public-info-"));
    context.after(() => rmSync(directory, { recursive: true, force: true }));
    const auth = new AuthService(new AuthRepository(join(directory, "auth.json")));
    const server = createApp({ auth }).listen(0, "127.0.0.1");
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
                    Origin: origin,
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

test("Gym expone solo membresia normal y el horario destacado de la referencia", () => {
    const service = new PublicInfoService();
    const data = service.getGym();
    assert.deepEqual(data.membresia, { tipo: "Normal", niveles: false });
    assert.equal(data.reservasDeEntrenamiento, false);
    assert.equal(data.horariosDestacados.length, 4);
    assert.equal(data.horarioCompletoDisponible, false);
    assert.equal(data.pagos, undefined);
    assert.equal(data.asistencias, undefined);
});

test("los paquetes de cumpleaños reflejan la referencia y no inventan precios", () => {
    const service = new PublicInfoService();
    const packages = service.getBirthdayPackages();
    assert.deepEqual(
        packages.map(({ id, duracionHoras, buffetIncluido, cantidadChicos }) => ({
            id,
            duracionHoras,
            buffetIncluido,
            cantidadChicos,
        })),
        [
            {
                id: "basico",
                duracionHoras: 2,
                buffetIncluido: false,
                cantidadChicos: 15,
            },
            {
                id: "full",
                duracionHoras: 2,
                buffetIncluido: true,
                cantidadChicos: 20,
            },
            {
                id: "premium",
                duracionHoras: 3,
                buffetIncluido: true,
                cantidadChicos: 20,
            },
        ],
    );
    assert.ok(packages.every((item) => item.precio === undefined));
});

test("una consulta de cumpleaños valida antelacion y no confirma ni ocupa cancha", () => {
    const service = new PublicInfoService();
    const result = service.createBirthdayInquiry({
        paqueteId: "full",
        fecha: "2099-12-31",
        horaInicio: "20:00",
    });
    assert.equal(result.consulta.duracionHoras, 2);
    assert.equal(result.consulta.confirmada, false);
    assert.equal(result.consulta.bloqueaCancha, false);
    assert.match(result.mensaje, /Consulta simulada/);
    assert.throws(
        () =>
            service.createBirthdayInquiry({
                paqueteId: "desconocido",
                fecha: "2099-12-31",
                horaInicio: "20:00",
            }),
        { statusCode: 400 },
    );
    assert.throws(
        () =>
            service.createBirthdayInquiry({
                paqueteId: "basico",
                fecha: "2026-10-08",
                horaInicio: "20:00",
            }),
        { statusCode: 400 },
    );
});

test("torneos publica cupos y tabla mostrada sin DNI ni partidos inventados", () => {
    const service = new PublicInfoService();
    const tournaments = service.getTournaments();
    assert.deepEqual(
        tournaments.map(({ nombre, equiposAnotados, cupos, estado }) => ({
            nombre,
            equiposAnotados,
            cupos,
            estado,
        })),
        [
            {
                nombre: "Torneo Barrial #1",
                equiposAnotados: 8,
                cupos: 12,
                estado: "Inscripciones abiertas",
            },
            {
                nombre: "Torneo Barrial #2",
                equiposAnotados: 12,
                cupos: 12,
                estado: "En Juego",
            },
            {
                nombre: "Torneo Barrial #3",
                equiposAnotados: 9,
                cupos: 12,
                estado: "Inscripciones abiertas",
            },
        ],
    );
    const detail = service.getTournament(2);
    assert.deepEqual(detail.tabla.map(({ equipo, puntos }) => [equipo, puntos]), [
        ["River Plate", 18],
        ["Chacarita", 14],
        ["O'Higgins", 13],
        ["Real Madrid", 10],
    ]);
    assert.deepEqual(detail.partidos, []);
    assert.equal(JSON.stringify(detail).includes("dni"), false);
    assert.throws(() => service.getTournament(404), { statusCode: 404 });
});

test("HTTP: contenido publico y consulta simulada autenticada", async (context) => {
    const { request } = await httpFixture(context);
    assert.equal((await request("/gym")).response.status, 200);
    assert.equal(
        (await request("/cumpleanos/paquetes")).body.data.length,
        3,
    );
    assert.equal((await request("/torneos")).body.data.length, 3);
    const detail = await request("/torneos/2");
    assert.equal(detail.response.status, 200);
    assert.equal(detail.body.data.tabla.length, 4);
    assert.equal((await request("/cumpleanos/consultas", {
        method: "POST",
        data: {
            paqueteId: "full",
            fecha: "2099-12-31",
            horaInicio: "20:00",
        },
    })).response.status, 401);

    const registered = await request("/auth/register", {
        method: "POST",
        data: {
            nombre: "Ana",
            apellido: "Perez",
            telefono: "1155551234",
            email: "ana@example.test",
            password: "PruebaSegura123",
        },
    });
    const inquiry = await request("/cumpleanos/consultas", {
        method: "POST",
        cookie: registered.cookie,
        data: {
            paqueteId: "full",
            fecha: "2099-12-31",
            horaInicio: "20:00",
        },
    });
    assert.equal(inquiry.response.status, 200);
    assert.equal(inquiry.body.data.consulta.confirmada, false);
    assert.equal(inquiry.body.data.consulta.bloqueaCancha, false);
    const externalInquiry = await request("/cumpleanos/consultas", {
        method: "POST",
        cookie: registered.cookie,
        origin: "https://externo.example",
        data: {
            paqueteId: "full",
            fecha: "2099-12-31",
            horaInicio: "20:00",
        },
    });
    assert.equal(externalInquiry.response.status, 403);
});