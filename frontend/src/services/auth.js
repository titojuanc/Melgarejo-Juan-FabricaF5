import { API_URL } from "./turnos.js";

async function request(path, options = {}, allowAnonymous = false) {
    let response;
    try {
        response = await fetch(`${API_URL}/auth${path}`, {
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

    if (allowAnonymous && response.status === 401) return null;

    let result;
    try {
        result = await response.json();
    } catch {
        throw new Error("El servidor devolvio una respuesta no valida.");
    }

    if (!response.ok || result.success !== true) {
        const error = new Error(
            result.message || "No se pudo completar la operacion.",
        );
        error.status = response.status;
        throw error;
    }
    return result.data;
}

export const getCurrentUser = (signal) =>
    request("/me", { signal }, true);
export const login = (data) =>
    request("/login", { method: "POST", body: JSON.stringify(data) });
export const register = (data) =>
    request("/register", { method: "POST", body: JSON.stringify(data) });
export const createStaffUser = (data) =>
    request("/users", { method: "POST", body: JSON.stringify(data) });
export const logout = () => request("/logout", { method: "POST" });