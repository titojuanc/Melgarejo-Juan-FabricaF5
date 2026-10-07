import { createContext, useContext, useEffect, useState } from "react";
import * as service from "../services/turnos.js";
import { useNotifications } from "./Notifications.jsx";
import { useAuth } from "./AuthProvider.jsx";

const TurnosContext = createContext(null);

export function TurnosProvider({ children }) {
    const [turnos, setTurnos] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [availabilityLoading, setAvailabilityLoading] = useState(true);
    const [availabilityError, setAvailabilityError] = useState("");
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState("");
    const { user, loading: authLoading } = useAuth();
    const { notify } = useNotifications();

    async function reloadAvailability(signal) {
        setAvailabilityLoading(true);
        setAvailabilityError("");
        try {
            const data = await service.getAvailability(signal);
            if (!Array.isArray(data))
                throw new Error("La disponibilidad no es valida.");
            setAvailability(data);
        } catch (failure) {
            if (failure.name === "AbortError") return;
            setAvailabilityError(failure.message);
            notify(failure.message, "error");
        } finally {
            if (!signal?.aborted) setAvailabilityLoading(false);
        }
    }

    async function reload(signal) {
        if (authLoading) return;
        if (!user) {
            setTurnos([]);
            setListError("");
            setListLoading(false);
            return;
        }
        setListLoading(true);
        setListError("");
        try {
            const data =
                user.rol === "cliente"
                    ? await service.getMine(signal)
                    : await service.getTurnos(signal);
            if (!Array.isArray(data))
                throw new Error("El listado de turnos no es valido.");
            setTurnos(data);
        } catch (failure) {
            if (failure.name === "AbortError") return;
            setListError(failure.message);
            notify(failure.message, "error");
        } finally {
            if (!signal?.aborted) setListLoading(false);
        }
    }

    useEffect(() => {
        const controller = new AbortController();
        reloadAvailability(controller.signal);
        if (!authLoading) reload(controller.signal);
        return () => controller.abort();
    }, [user?.id, user?.rol, authLoading]);

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
        await reloadAvailability();
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
        await reloadAvailability();
        notify("Turno eliminado correctamente.");
    }

    return (
        <TurnosContext.Provider
            value={{
                turnos,
                loading: listLoading,
                error: listError,
                reload,
                save,
                remove,
                availability,
                availabilityLoading,
                availabilityError,
                reloadAvailability,
            }}
        >
            {children}
        </TurnosContext.Provider>
    );
}

export const useTurnos = () => useContext(TurnosContext);
