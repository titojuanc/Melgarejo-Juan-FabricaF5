import { createContext, useContext, useEffect, useState } from "react";
import * as service from "../services/turnos.js";
import { useNotifications } from "./Notifications.jsx";

const TurnosContext = createContext(null);

export function TurnosProvider({ children }) {
    const [turnos, setTurnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { notify } = useNotifications();

    async function reload(signal) {
        setLoading(true);
        setError("");
        try {
            const data = await service.getTurnos(signal);
            if (!Array.isArray(data))
                throw new Error("El listado de turnos no es valido.");
            setTurnos(data);
        } catch (failure) {
            if (failure.name === "AbortError") return;
            setError(failure.message);
            notify(failure.message, "error");
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }

    useEffect(() => {
        const controller = new AbortController();
        reload(controller.signal);
        return () => controller.abort();
    }, []);

    async function save(data, id) {
        const turno =
            id === undefined
                ? await service.createTurno(data)
                : await service.updateTurno(id, data);
        setTurnos((current) =>
            id === undefined
                ? [...current, turno]
                : current.map((item) => (item.id === id ? turno : item)),
        );
        notify(
            id === undefined
                ? "Reserva creada correctamente."
                : "Turno actualizado correctamente.",
        );
        return turno;
    }

    async function remove(id) {
        await service.deleteTurno(id);
        setTurnos((current) => current.filter((item) => item.id !== id));
        notify("Turno eliminado correctamente.");
    }

    return (
        <TurnosContext.Provider
            value={{ turnos, loading, error, reload, save, remove }}
        >
            {children}
        </TurnosContext.Provider>
    );
}

export const useTurnos = () => useContext(TurnosContext);
