import test from "node:test";
import assert from "node:assert/strict";
import { getCurrentUser, login, logout, register } from "./auth.js";

test("autenticacion usa las rutas, credenciales y cuerpos esperados", async (context) => {
    const calls = [];
    const user = { id: "u-1", nombre: "Ana", rol: "cliente" };
    context.mock.method(globalThis, "fetch", async (url, options) => {
        calls.push({ url, ...options });
        return Response.json({ success: true, data: user });
    });

    assert.deepEqual(await getCurrentUser(), user);
    await login({ email: "ana@example.test", password: "clave-segura" });
    await register({ nombre: "Ana", password: "clave-segura" });
    await logout();

    assert.equal(calls[0].url, "http://localhost:3000/auth/me");
    assert.equal(calls[0].credentials, "include");
    assert.equal(calls[1].url, "http://localhost:3000/auth/login");
    assert.deepEqual(JSON.parse(calls[1].body), {
        email: "ana@example.test",
        password: "clave-segura",
    });
    assert.equal(calls[2].url, "http://localhost:3000/auth/register");
    assert.equal(calls[3].method, "POST");
    assert.equal(calls[3].url, "http://localhost:3000/auth/logout");
});

test("una sesion ausente se interpreta como visitante y los errores se conservan", async (context) => {
    context.mock.method(globalThis, "fetch", async () =>
        Response.json(
            { success: false, message: "No hay sesion activa." },
            { status: 401 },
        ),
    );
    assert.equal(await getCurrentUser(), null);

    await assert.rejects(login({ email: "x", password: "x" }), {
        message: "No hay sesion activa.",
        status: 401,
    });
});