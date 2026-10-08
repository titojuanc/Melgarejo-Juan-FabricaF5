import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AuthRepository } from "../repositories/AuthRepository.js";
import { OperationsRepository } from "../repositories/OperationsRepository.js";
import { TurnoRepository } from "../repositories/TurnoRepository.js";
import { AuthService } from "./AuthService.js";
import { OperationsService } from "./OperationsService.js";
import { TurnoService } from "./TurnoService.js";
import { createApp } from "../app.js";

const clientData = {
    nombre: "Ana",
    apellido: "Perez",
    telefono: "1155551234",
    email: "ana@example.test",
    password: "PruebaSegura123",
};

async function fixture(context) {
    const directory = mkdtempSync(join(tmpdir(), "fabrica-operaciones-"));
    context.after(() => rmSync(directory, { recursive: true, force: true }));
    const auth = new AuthService(new AuthRepository(join(directory, "auth.json")));
    const turnos = new TurnoService(new TurnoRepository(), auth);
    const repository = new OperationsRepository(join(directory, "operations.json"));
    const operations = new OperationsService(repository, auth, turnos);
    const server = createApp({ auth, turnos, operations }).listen(0, "127.0.0.1");
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

    return { auth, operations, repository, request };
}

test("HTTP: operaciones internas requieren personal y persisten datos manuales", async (context) => {
    const { auth, operations, repository, request } = await fixture(context);
    const registered = await request("/auth/register", {
        method: "POST",
        data: clientData,
    });
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

    assert.equal((await request("/interno/pagos")).response.status, 401);
    assert.equal(
        (await request("/interno/pagos", { cookie: registered.cookie })).response
            .status,
        403,
    );
    assert.equal(
        (
            await request("/interno/gym/asistencias", {
                method: "POST",
                cookie: registered.cookie,
                data: { clienteId: registered.body.data.clienteId },
            })
        ).response.status,
        403,
    );
    assert.deepEqual(
        (
            await request("/interno/clientes", {
                cookie: staff.cookie,
            })
        ).body.data,
        [{ id: registered.body.data.clienteId, nombre: "Ana Perez" }],
    );
    assert.equal(
        (
            await request("/interno/clientes", {
                cookie: registered.cookie,
            })
        ).response.status,
        403,
    );

    const membership = await request("/interno/gym/membresias", {
        method: "POST",
        cookie: staff.cookie,
        data: {
            clienteId: registered.body.data.clienteId,
            fechaInicio: "2099-01-01",
            fechaVencimiento: "2099-01-31",
        },
    });
    assert.equal(membership.response.status, 201);
    assert.equal(membership.body.data.estado, "Programada");
    const expiredMembership = await request("/interno/gym/membresias", {
        method: "POST",
        cookie: staff.cookie,
        data: {
            clienteId: registered.body.data.clienteId,
            fechaInicio: "2000-01-01",
            fechaVencimiento: "2000-01-31",
        },
    });
    assert.equal(expiredMembership.body.data.estado, "Vencida");
    const membershipList = await request("/interno/gym/membresias", {
        cookie: staff.cookie,
    });
    assert.equal(
        membershipList.body.data.find((item) => item.id === expiredMembership.body.data.id)
            .estado,
        "Vencida",
    );

    const attendance = await request("/interno/gym/asistencias", {
        method: "POST",
        cookie: staff.cookie,
        data: { clienteId: registered.body.data.clienteId },
    });
    assert.equal(attendance.response.status, 201);
    assert.ok(attendance.body.data.fechaHora);

    const payment = await request("/interno/pagos", {
        method: "POST",
        cookie: staff.cookie,
        data: {
            monto: 5000,
            tipo: "membresia",
            membresiaId: membership.body.data.id,
        },
    });
    assert.equal(payment.response.status, 201);
    assert.equal(payment.body.data.estado, "Pagado");
    assert.equal(payment.body.data.clienteId, registered.body.data.clienteId);

    const tournament = await request("/interno/torneos", {
        method: "POST",
        cookie: staff.cookie,
        data: {
            nombre: "Copa de prueba",
            fechaInicio: "2099-04-01",
            fechaFin: "2099-04-30",
            estado: "En Juego",
            formato: "liga",
            intervaloDias: 7,
        },
    });
    assert.equal(tournament.response.status, 201);
    const homeTeam = await request(
        `/interno/torneos/${tournament.body.data.id}/equipos`,
        {
            method: "POST",
            cookie: staff.cookie,
            data: { nombre: "Verdes", cantidadJugadores: 10 },
        },
    );
    const awayTeam = await request(
        `/interno/torneos/${tournament.body.data.id}/equipos`,
        {
            method: "POST",
            cookie: staff.cookie,
            data: { nombre: "Rojos", cantidadJugadores: 10 },
        },
    );
    assert.equal(homeTeam.response.status, 201);
    assert.equal(awayTeam.response.status, 201);
    const match = await request(
        `/interno/torneos/${tournament.body.data.id}/partidos`,
        {
            method: "POST",
            cookie: staff.cookie,
            data: {
                equipoLocalId: homeTeam.body.data.id,
                equipoVisitanteId: awayTeam.body.data.id,
                fecha: "2099-04-10",
                golesLocal: 2,
                golesVisitante: 1,
            },
        },
    );
    assert.equal(match.response.status, 201);

    const details = await request(
        `/interno/torneos/${tournament.body.data.id}`,
        { cookie: staff.cookie },
    );
    assert.equal(details.body.data.equipos[0].ganados, 1);
    assert.equal(details.body.data.equipos[0].golesFavor, 2);
    assert.equal(details.body.data.equipos[1].perdidos, 1);
    assert.equal(details.body.data.partidos.length, 1);
    assert.deepEqual(
        Object.keys(details.body.data.partidos[0]).sort(),
        [
            "equipoLocalId",
            "equipoVisitanteId",
            "estado",
            "fecha",
            "golesLocal",
            "golesVisitante",
            "id",
            "penalesLocal",
            "penalesVisitante",
            "ronda",
            "torneoId",
        ],
    );

    const publicTournaments = await request("/torneos");
    assert.equal(publicTournaments.body.data[0].datosDeReferencia, true);
    assert.equal(
        publicTournaments.body.data.find((item) => item.nombre === "Copa de prueba")
            .datosDeReferencia,
        false,
    );

    const restored = new OperationsRepository(repository.filePath);
    assert.equal(restored.findAll("pagos").length, 1);
    assert.equal(restored.findAll("membresias").length, 2);
    assert.equal(restored.findAll("asistencias").length, 1);
    assert.equal(restored.findAll("partidos").length, 1);
});

test("HTTP: fixture de liga actualiza tabla y detalle publico despues de cada resultado", async (context) => {
    const { auth, request } = await fixture(context);
    const staffData = {
        ...clientData,
        email: "liga@example.test",
        rol: "empleado",
    };
    await auth.createStaff(staffData);
    const staff = await request("/auth/login", {
        method: "POST",
        data: staffData,
    });
    const tournament = await request("/interno/torneos", {
        method: "POST",
        cookie: staff.cookie,
        data: {
            nombre: "Liga pública",
            fechaInicio: "2099-05-01",
            fechaFin: "2099-06-30",
            estado: "En Juego",
            formato: "liga",
            intervaloDias: 7,
        },
    });
    const tournamentId = tournament.body.data.id;
    const teams = [];
    for (const name of ["Alfa", "Beta", "Gamma"]) {
        const result = await request(`/interno/torneos/${tournamentId}/equipos`, {
            method: "POST",
            cookie: staff.cookie,
            data: { nombre: name, cantidadJugadores: 10 },
        });
        teams.push(result.body.data);
    }

    const generated = await request(`/interno/torneos/${tournamentId}/fixture`, {
        method: "POST",
        cookie: staff.cookie,
    });
    assert.equal(generated.response.status, 201);
    assert.equal(generated.body.data.partidos.length, 3);
    assert.equal(generated.body.data.descansos.length, 3);
    assert.equal(generated.body.data.tabla.every((team) => team.puntos === 0), true);

    const matches = generated.body.data.partidos;
    const scores = [
        [1, 1],
        [1, 2],
        [2, 0],
    ];
    for (const [index, match] of matches.entries()) {
        const [golesLocal, golesVisitante] = scores[index];
        const result = await request(
            `/interno/torneos/${tournamentId}/partidos/${match.id}`,
            {
                method: "PUT",
                cookie: staff.cookie,
                data: { golesLocal, golesVisitante },
            },
        );
        assert.equal(result.response.status, 200);
        assert.equal(result.body.data.torneo.partidos[index].estado, "Finalizado");
    }

    const publicList = await request("/torneos");
    const publicTournament = publicList.body.data.find(
        (item) => item.nombre === "Liga pública",
    );
    assert.equal(publicTournament.id, `operativo-${tournamentId}`);
    assert.equal(publicTournament.tabla[0].equipo, "Gamma");
    assert.equal(publicTournament.tabla[0].puntos, 4);
    assert.equal(publicTournament.tabla[0].partidosJugados, 2);
    assert.equal(publicTournament.tabla[0].diferenciaGoles, 1);
    assert.equal(publicTournament.partidos.length, 3);
    assert.ok(publicTournament.partidos.every((match) => match.resultado));

    const detail = await request(`/torneos/${publicTournament.id}`);
    assert.equal(detail.response.status, 200);
    assert.equal(detail.body.data.tabla[0].equipo, "Gamma");
    assert.equal(detail.body.data.descansos.length, 3);
    assert.equal(JSON.stringify(detail.body.data).toLowerCase().includes("telefono"), false);
    assert.equal(JSON.stringify(detail.body.data).toLowerCase().includes("email"), false);
    assert.equal(teams.length, 3);
});

test("HTTP: copa avanza ganadores y publica el campeon al completar la llave", async (context) => {
    const { auth, request } = await fixture(context);
    const staffData = {
        ...clientData,
        email: "copa@example.test",
        rol: "empleado",
    };
    await auth.createStaff(staffData);
    const staff = await request("/auth/login", {
        method: "POST",
        data: staffData,
    });
    const tournament = await request("/interno/torneos", {
        method: "POST",
        cookie: staff.cookie,
        data: {
            nombre: "Copa directa",
            fechaInicio: "2099-07-01",
            fechaFin: "2099-07-20",
            estado: "En Juego",
            formato: "copa",
            intervaloDias: 2,
        },
    });
    const tournamentId = tournament.body.data.id;
    for (const name of ["Uno", "Dos", "Tres"]) {
        await request(`/interno/torneos/${tournamentId}/equipos`, {
            method: "POST",
            cookie: staff.cookie,
            data: { nombre: name, cantidadJugadores: 10 },
        });
    }

    const generated = await request(`/interno/torneos/${tournamentId}/fixture`, {
        method: "POST",
        cookie: staff.cookie,
    });
    assert.equal(generated.body.data.partidos.length, 1);
    assert.equal(generated.body.data.descansos.length, 1);
    const firstMatch = generated.body.data.partidos[0];
    const tiedWithoutPenalties = await request(
        `/interno/torneos/${tournamentId}/partidos/${firstMatch.id}`,
        {
            method: "PUT",
            cookie: staff.cookie,
            data: { golesLocal: 1, golesVisitante: 1 },
        },
    );
    assert.equal(tiedWithoutPenalties.response.status, 400);
    const firstResult = await request(
        `/interno/torneos/${tournamentId}/partidos/${firstMatch.id}`,
        {
            method: "PUT",
            cookie: staff.cookie,
            data: {
                golesLocal: 1,
                golesVisitante: 1,
                penalesLocal: 4,
                penalesVisitante: 3,
            },
        },
    );
    assert.equal(firstResult.body.data.torneo.partidos.length, 2);
    assert.equal(firstResult.body.data.torneo.partidos[1].ronda, 2);

    const finalMatch = firstResult.body.data.torneo.partidos[1];
    const finalResult = await request(
        `/interno/torneos/${tournamentId}/partidos/${finalMatch.id}`,
        {
            method: "PUT",
            cookie: staff.cookie,
            data: { golesLocal: 2, golesVisitante: 1 },
        },
    );
    assert.equal(finalResult.body.data.torneo.estado, "Finalizado");
    assert.ok(finalResult.body.data.torneo.campeon);

    const publicTournament = await request(
        `/torneos/operativo-${tournamentId}`,
    );
    assert.equal(publicTournament.body.data.formato, "copa");
    assert.equal(publicTournament.body.data.campeon.equipo, finalResult.body.data.torneo.campeon.nombre);
    assert.equal(publicTournament.body.data.partidos.length, 2);
    assert.match(publicTournament.body.data.partidos[0].resultado, /pen\./);
});
