import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import * as service from "../services/turnos.js";
import { useNotifications } from "./Notifications.jsx";
import { useAuth } from "./AuthProvider.jsx";
import { dateKey, weekDates } from "../utils/turnos.js";

const TurnosContext = createContext(null);

function currentWeek() {
    return weekDates(dateKey(new Date())).map(dateKey);
}

export function TurnosProvider({ children }) {
    const [turnos, setTurnos] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [availabilityLoading, setAvailabilityLoading] = useState(true);
    const [availabilityError, setAvailabilityError] = useState("");
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState("");
    const availabilityDates = useRef(currentWeek());
    const { user, loading: authLoading } = useAuth();
    const { notify } = useNotifications();

    async function reloadAvailability(
        dates = availabilityDates.current,
        signal,
    ) {
        availabilityDates.current = [...dates];
        const futureDates = dates.filter(
            (fecha) => fecha >= dateKey(new Date()),
        );
        setAvailabilityLoading(true);
        setAvailabilityError("");
        try {
            const results = await Promise.all(
                futureDates.map((fecha) =>
                    service.getAvailability(fecha, signal),
                ),
            );
            if (results.some((data) => !Array.isArray(data)))
                throw new Error("La disponibilidad no es valida.");
            setAvailability(results.flat());
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
        reloadAvailability(availabilityDates.current, controller.signal);
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

    async function transition(id, action) {
        const turno =
            action === "confirmar"
                ? await service.confirmTurno(id)
                : await service.cancelTurno(id);
        setTurnos((current) =>
            current.map((item) => (item.id === id ? turno : item)),
        );
        await reloadAvailability();
        notify(
            action === "confirmar"
                ? "Turno confirmado correctamente."
                : "Turno cancelado correctamente.",
        );
        return turno;
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
                transition,
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
