import { useId, useState } from "react";
import { Check, LoaderCircle, Save } from "lucide-react";
import { useTurnos } from "./TurnosProvider.jsx";
import { useNotifications } from "./Notifications.jsx";
import { dateKey, validateReserva } from "../utils/turnos.js";
import { useAuth } from "./AuthProvider.jsx";

export default function TurnoForm({
    initial = {},
    onSaved,
    onBusyChange,
    reservation = false,
}) {
    const prefix = useId();
    const [data, setData] = useState({
        fecha: initial.fecha || "",
        horaInicio: initial.horaInicio || "",
        horaFin: initial.horaFin || "",
        cantidadJugadores: initial.cantidadJugadores ?? 10,
        clienteId: initial.clienteId ?? "",
        incluyeLuces: initial.incluyeLuces ?? false,
    });
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);
    const { availability, save } = useTurnos();
    const { user } = useAuth();
    const isClient = user?.rol === "cliente";
    const { notify } = useNotifications();

    function change(event) {
        const { name, value, checked, type } = event.target;
        setData((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
        setErrors((current) => ({ ...current, [name]: "" }));
    }

    async function submit(event) {
        event.preventDefault();
        const nextErrors = validateReserva(data, availability, initial.id, {
            requireClientId: !isClient,
        });
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
            notify("Revisa los campos de la reserva.", "error");
            document
                .getElementById(`${prefix}-${Object.keys(nextErrors)[0]}`)
                ?.focus();
            return;
        }
        setBusy(true);
        onBusyChange?.(true);
        try {
            const turnoData = {
                ...data,
                cantidadJugadores: Number(data.cantidadJugadores),
            };
            if (isClient) delete turnoData.clienteId;
            else turnoData.clienteId = Number(data.clienteId);
            const turno = await save(turnoData, initial.id);
            onSaved?.(turno);
        } catch (error) {
            notify(error.message, "error");
        } finally {
            setBusy(false);
            onBusyChange?.(false);
        }
    }

    function field(name, label, type, extra = {}) {
        const id = `${prefix}-${name}`;
        return (
            <div className="field">
                <label htmlFor={id}>{label}</label>
                <input
                    id={id}
                    name={name}
                    type={type}
                    value={data[name]}
                    onChange={change}
                    required
                    aria-invalid={Boolean(errors[name])}
                    aria-describedby={errors[name] ? `${id}-error` : undefined}
                    {...extra}
                />
                {errors[name] && (
                    <span className="field-error" id={`${id}-error`}>
                        {errors[name]}
                    </span>
                )}
            </div>
        );
    }

    return (
        <form
            className="turno-form"
            noValidate
            onSubmit={submit}
            aria-busy={busy}
        >
            <fieldset disabled={busy}>
                <legend className="sr-only">Datos de la reserva</legend>
                {field("fecha", "Fecha", "date", { min: dateKey(new Date()) })}
                <div className="form-row">
                    {field("horaInicio", "Desde", "time")}
                    {field("horaFin", "Hasta", "time")}
                </div>
                <div className={isClient ? "form-row single-field" : "form-row"}>
                    {field("cantidadJugadores", "Jugadores", "number", {
                        min: 1,
                        step: 1,
                    })}
                    {!isClient &&
                        field("clienteId", "ID de cliente", "number", {
                            min: 1,
                            step: 1,
                        })}
                </div>
                <label className="checkbox-field" htmlFor={`${prefix}-luces`}>
                    <input
                        id={`${prefix}-luces`}
                        name="incluyeLuces"
                        type="checkbox"
                        checked={data.incluyeLuces}
                        onChange={change}
                    />
                    <span>Incluir luces</span>
                </label>
            </fieldset>
            {reservation && (
                <dl className="reservation-total">
                    <div>
                        <dt>Estado inicial</dt>
                        <dd>Pendiente</dd>
                    </div>
                    <div>
                        <dt>Importe</dt>
                        <dd>A confirmar</dd>
                    </div>
                </dl>
            )}
            <button className="button primary" type="submit" disabled={busy}>
                {busy ? (
                    <LoaderCircle className="spin" size={18} />
                ) : reservation ? (
                    <Check size={18} />
                ) : (
                    <Save size={18} />
                )}
                {busy
                    ? "Guardando..."
                    : reservation
                      ? "Reservar cancha"
                      : "Guardar cambios"}
            </button>
        </form>
    );
}
