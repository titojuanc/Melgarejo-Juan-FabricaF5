export const API_URL = (
    import.meta.env?.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

async function request(path = "", options = {}) {
    let response;
    try {
        response = await fetch(`${API_URL}/turnos${path}`, {
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

export const getAvailability = (signal) =>
    request("/disponibilidad", { signal });
export const getMine = (signal) => request("/mis", { signal });
export const getTurnos = (signal) => request("", { signal });
export const createTurno = (data) =>
    request("", { method: "POST", body: JSON.stringify(data) });
export const updateTurno = (id, data) =>
    request(`/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
export const deleteTurno = (id) =>
    request(`/${encodeURIComponent(id)}`, { method: "DELETE" });
