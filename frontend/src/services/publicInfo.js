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

export const getGymInfo = (signal) => request("/gym", { signal });
export const getBirthdayPackages = (signal) =>
    request("/cumpleanos/paquetes", { signal });
export const createBirthdayInquiry = (data) =>
    request("/cumpleanos/consultas", {
        method: "POST",
        body: JSON.stringify(data),
    });
export const getTournaments = (signal) => request("/torneos", { signal });
export const getTournament = (id, signal) =>
    request(`/torneos/${encodeURIComponent(id)}`, { signal });