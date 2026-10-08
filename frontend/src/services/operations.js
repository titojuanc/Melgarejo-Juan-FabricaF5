import { API_URL } from "./turnos.js";

async function request(path, options = {}) {
    let response;
    try {
        response = await fetch(`${API_URL}${path}`, {
            ...options,
            credentials: "include",
            headers: { "Content-Type": "application/json", ...options.headers },
        });
    } catch (error) {
        if (error.name === "AbortError") throw error;
        throw new Error(
            "No se pudo conectar con el servidor. Intentalo nuevamente.",
        );
    }

    let result;
    try {
        result = await response.json();
    } catch {
        throw new Error("El servidor devolvio una respuesta no valida.");
    }

    if (!response.ok || result.success !== true) {
        throw new Error(result.message || "No se pudo completar la operacion.");
    }
    return result.data;
}

function post(path, data) {
    return request(path, { method: "POST", body: JSON.stringify(data) });
}

export const getClients = (signal) => request("/interno/clientes", { signal });
export const getPayments = (signal) => request("/interno/pagos", { signal });
export const recordPayment = (data) => post("/interno/pagos", data);
export const getMemberships = (signal) =>
    request("/interno/gym/membresias", { signal });
export const createMembership = (data) =>
    post("/interno/gym/membresias", data);
export const getAttendances = (signal) =>
    request("/interno/gym/asistencias", { signal });
export const recordAttendance = (data) =>
    post("/interno/gym/asistencias", data);
export const getManagedTournaments = (signal) =>
    request("/interno/torneos", { signal });
export const createTournament = (data) => post("/interno/torneos", data);
export const getManagedTournament = (id, signal) =>
    request(`/interno/torneos/${encodeURIComponent(id)}`, { signal });
export const createTeam = (id, data) =>
    post(`/interno/torneos/${encodeURIComponent(id)}/equipos`, data);
export const recordMatch = (id, data) =>
    post(`/interno/torneos/${encodeURIComponent(id)}/partidos`, data);
