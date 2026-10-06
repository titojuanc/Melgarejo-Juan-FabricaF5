import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { AuthRepository } from "../repositories/AuthRepository.js";
import { AuthService } from "./AuthService.js";
import { createApp } from "../app.js";

export const clientData = {
    nombre: "Ana",
    apellido: "Perez",
    telefono: "1155551234",
    email: "ana@example.test",
    password: "PruebaSegura123",
    equipo: "Los verdes"
};

export function fixture(context) {
    const directory = mkdtempSync(join(tmpdir(), "fabrica-auth-"));
    context.after(() => rmSync(directory, { recursive: true, force: true }));
    const filePath = join(directory, "auth.json");
    const repository = new AuthRepository(filePath);
    return { service: new AuthService(repository), repository, filePath };
}

test("registro crea un cliente, persiste un hash y nunca expone la contrasena", async (context) => {
    const { service, repository, filePath } = fixture(context);
    const usuario = await service.register({
        ...clientData,
        email: " ANA@EXAMPLE.TEST ",
        clienteId: 999,
        passwordHash: "inventado"
    });
    assert.equal(usuario.rol, "cliente");
    assert.equal(usuario.clienteId, 1);
    assert.equal(usuario.email, clientData.email);
    assert.equal(usuario.password, undefined);
    assert.equal(usuario.passwordHash, undefined);
    const stored = repository.findById(usuario.id);
    assert.notEqual(stored.passwordHash, clientData.password);
    const state = JSON.parse(readFileSync(filePath, "utf8"));
    assert.equal(state.clientes.length, 1);
    assert.equal(
        new AuthRepository(filePath).findByEmail(clientData.email).id,
        usuario.id
    );
    assert.equal((await service.login(clientData)).id, usuario.id);
});

test("rechaza privilegios publicos, emails duplicados y credenciales incorrectas", async (context) => {
    const { service } = fixture(context);
    await assert.rejects(
        service.register({ ...clientData, rol: "admin" }),
        (error) => error.statusCode === 400
    );
    await assert.rejects(
        service.register({ ...clientData, password: "corta" }),
        (error) => error.statusCode === 400
    );
    await service.register(clientData);
    await assert.rejects(
        service.register({ ...clientData, email: "ANA@example.test" }),
        (error) => error.statusCode === 409
    );
    await assert.rejects(
        service.login({ ...clientData, password: "incorrecta" }),
        (error) => error.statusCode === 401
    );
    await assert.rejects(
        service.login({ ...clientData, email: "nadie@example.test" }),
        (error) =>
            error.statusCode === 401 &&
            error.message === "Email o contrasena incorrectos."
    );
});

test("las cuentas internas tienen rol validado y no crean clientes", async (context) => {
    const { service, repository } = fixture(context);
    const admin = await service.createStaff({ ...clientData, rol: "admin" });
    assert.equal(admin.clienteId, null);
    assert.equal(repository.hasAdmin(), true);
    assert.equal((await service.login(clientData)).rol, "admin");
    await assert.rejects(
        service.createStaff({
            ...clientData,
            email: "otro@example.test",
            rol: "superadmin"
        }),
        (error) => error.statusCode === 400
    );
});

async function httpFixture(context, limit = 20) {
    const setup = fixture(context);
    const app = createApp({ auth: setup.service, authLimit: limit });
    const server = app.listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    context.after(
        () =>
            new Promise((resolve, reject) =>
                server.close((error) => (error ? reject(error) : resolve()))
            )
    );
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    async function request(
        path,
        { method = "GET", data, cookie, origin = "http://127.0.0.1:5173" } = {}
    ) {
        const response = await fetch(`${baseUrl}${path}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                ...(origin ? { Origin: origin } : {}),
                ...(cookie ? { Cookie: cookie } : {})
            },
            ...(data !== undefined ? { body: JSON.stringify(data) } : {})
        });
        return {
            response,
            body: await response.json(),
            cookie: response.headers.get("set-cookie")?.split(";")[0]
        };
    }
    return { ...setup, request, baseUrl };
}

test("HTTP: registro inicia sesion, me recupera usuario, login rota cookie y logout invalida sesion", async (context) => {
    const { request } = await httpFixture(context);
    assert.equal((await request("/auth/me")).response.status, 401);
    const registered = await request("/auth/register", {
        method: "POST",
        data: clientData
    });
    assert.equal(registered.response.status, 201);
    assert.equal(registered.body.success, true);
    assert.equal(registered.body.data.passwordHash, undefined);
    assert.ok(registered.cookie.startsWith("fabrica.sid="));
    assert.match(registered.response.headers.get("set-cookie"), /HttpOnly/);
    assert.match(registered.response.headers.get("set-cookie"), /SameSite=Lax/);
    assert.equal(
        registered.response.headers.get("access-control-allow-credentials"),
        "true"
    );
    const me = await request("/auth/me", { cookie: registered.cookie });
    assert.equal(me.body.data.clienteId, 1);
    assert.equal(me.response.headers.get("cache-control"), "no-store");
    const login = await request("/auth/login", {
        method: "POST",
        data: clientData,
        cookie: registered.cookie
    });
    assert.equal(login.response.status, 200);
    assert.notEqual(login.cookie, registered.cookie);
    assert.equal(
        (await request("/auth/me", { cookie: registered.cookie })).response
            .status,
        401
    );
    const logout = await request("/auth/logout", {
        method: "POST",
        cookie: login.cookie
    });
    assert.equal(logout.response.status, 200);
    assert.match(
        logout.response.headers.get("set-cookie"),
        /Expires=Thu, 01 Jan 1970/
    );
    assert.equal(
        (await request("/auth/me", { cookie: login.cookie })).response.status,
        401
    );
});

test("HTTP: solo un administrador puede crear empleados y otros administradores", async (context) => {
    const { service, request } = await httpFixture(context);
    const payload = {
        ...clientData,
        email: "empleado@example.test",
        rol: "empleado"
    };
    assert.equal(
        (await request("/auth/users", { method: "POST", data: payload }))
            .response.status,
        401
    );
    const client = await request("/auth/register", {
        method: "POST",
        data: clientData
    });
    assert.equal(
        (
            await request("/auth/users", {
                method: "POST",
                data: payload,
                cookie: client.cookie
            })
        ).response.status,
        403
    );
    const adminData = {
        ...clientData,
        email: "admin@example.test",
        rol: "admin"
    };
    await service.createStaff(adminData);
    const admin = await request("/auth/login", {
        method: "POST",
        data: adminData
    });
    const staff = await request("/auth/users", {
        method: "POST",
        data: payload,
        cookie: admin.cookie
    });
    assert.equal(staff.response.status, 201);
    assert.equal(staff.body.data.rol, "empleado");
    const employee = await request("/auth/login", {
        method: "POST",
        data: payload
    });
    assert.equal(employee.response.status, 200);
    assert.equal(
        (
            await request("/auth/users", {
                method: "POST",
                data: { ...payload, email: "otro@example.test", rol: "admin" },
                cookie: employee.cookie
            })
        ).response.status,
        403
    );
    const anotherAdmin = await request("/auth/users", {
        method: "POST",
        data: { ...payload, email: "otro-admin@example.test", rol: "admin" },
        cookie: admin.cookie
    });
    assert.equal(anotherAdmin.response.status, 201);
    assert.equal(
        (await request("/auth/me", { cookie: admin.cookie })).body.data.email,
        adminData.email
    );
});

test("HTTP: rechaza origen externo o ausente, datos invalidos y elevacion de privilegios", async (context) => {
    const { request, baseUrl } = await httpFixture(context);
    assert.equal(
        (
            await request("/auth/register", {
                method: "POST",
                data: clientData,
                origin: "https://externo.example"
            })
        ).response.status,
        403
    );
    assert.equal(
        (
            await request("/auth/register", {
                method: "POST",
                data: clientData,
                origin: null
            })
        ).response.status,
        403
    );
    assert.equal(
        (
            await request("/auth/register", {
                method: "POST",
                data: { ...clientData, rol: "admin" }
            })
        ).response.status,
        400
    );
    assert.equal(
        (
            await request("/auth/register", {
                method: "POST",
                data: { ...clientData, telefono: "abc" }
            })
        ).response.status,
        400
    );
    const malformed = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Origin: "http://127.0.0.1:5173"
        },
        body: "{invalid"
    });
    assert.equal(malformed.status, 400);
    assert.equal((await malformed.json()).success, false);
    assert.equal(
        (await request("/auth/login", { method: "POST", data: clientData }))
            .response.status,
        401
    );
});

test("HTTP: limita intentos y no rompe el listado existente de turnos", async (context) => {
    const { request } = await httpFixture(context, 2);
    for (let index = 0; index < 2; index++)
        assert.equal(
            (await request("/auth/login", { method: "POST", data: {} }))
                .response.status,
            400
        );
    const limited = await request("/auth/login", { method: "POST", data: {} });
    assert.equal(limited.response.status, 429);
    assert.equal(limited.body.success, false);
    assert.ok(limited.response.headers.get("retry-after"));
    const turnos = await request("/turnos");
    assert.equal(turnos.response.status, 200);
    assert.ok(Array.isArray(turnos.body.data));
});

test("el registro simultaneo con un mismo email crea una sola cuenta", async (context) => {
    const { service, filePath } = fixture(context);
    const results = await Promise.allSettled([
        service.register(clientData),
        service.register(clientData)
    ]);
    assert.equal(
        results.filter((result) => result.status === "fulfilled").length,
        1
    );
    assert.equal(
        results.find((result) => result.status === "rejected").reason
            .statusCode,
        409
    );
    const state = JSON.parse(readFileSync(filePath, "utf8"));
    assert.equal(state.usuarios.length, 1);
    assert.equal(state.clientes.length, 1);
});

test("un archivo danado no se reemplaza silenciosamente por cuentas vacias", (context) => {
    const { filePath } = fixture(context);
    writeFileSync(filePath, "{broken", "utf8");
    assert.throws(() => new AuthRepository(filePath));
    assert.equal(readFileSync(filePath, "utf8"), "{broken");
});

test("el comando local crea solo el primer administrador y no imprime contrasenas", (context) => {
    const { filePath } = fixture(context);
    const script = fileURLToPath(
        new URL("../utils/createAdmin.js", import.meta.url)
    );
    const options = {
        encoding: "utf8",
        env: {
            ...process.env,
            AUTH_DATA_FILE: filePath,
            ADMIN_NOMBRE: clientData.nombre,
            ADMIN_APELLIDO: clientData.apellido,
            ADMIN_TELEFONO: clientData.telefono,
            ADMIN_EMAIL: clientData.email,
            ADMIN_PASSWORD: clientData.password
        }
    };
    const created = spawnSync(process.execPath, [script], options);
    assert.equal(created.status, 0, created.stderr);
    assert.ok(!created.stdout.includes(clientData.password));
    assert.equal(
        new AuthRepository(filePath).findByEmail(clientData.email).rol,
        "admin"
    );
    const repeated = spawnSync(process.execPath, [script], options);
    assert.equal(repeated.status, 1);
    assert.match(repeated.stderr, /Ya existe un administrador/);
    assert.ok(!repeated.stderr.includes(clientData.password));
});
