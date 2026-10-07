import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, LoaderCircle, PartyPopper } from "lucide-react";
import { Link } from "react-router-dom";
import PublicDataState from "../components/PublicDataState.jsx";
import { useAuth } from "../components/AuthProvider.jsx";
import { useNotifications } from "../components/Notifications.jsx";
import { createBirthdayInquiry, getBirthdayPackages } from "../services/publicInfo.js";
import { dateKey } from "../utils/turnos.js";

export default function BirthdayPage() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [packageId, setPackageId] = useState("");
    const [busy, setBusy] = useState(false);
    const [confirmation, setConfirmation] = useState(null);
    const { user, loading: authLoading } = useAuth();
    const { notify } = useNotifications();
    const isClient = user?.rol === "cliente";
    const minimumDate = dateKey(new Date(Date.now() + 48 * 60 * 60 * 1000));

    async function load(signal) {
        setLoading(true);
        setError("");
        try {
            const data = await getBirthdayPackages(signal);
            setPackages(data);
            setPackageId((current) => current || data[0]?.id || "");
        } catch (failure) {
            if (failure.name !== "AbortError") setError(failure.message);
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }

    useEffect(() => {
        const controller = new AbortController();
        load(controller.signal);
        return () => controller.abort();
    }, []);

    async function submit(event) {
        event.preventDefault();
        if (!event.currentTarget.reportValidity()) return;
        if (!isClient) return;
        const data = new FormData(event.currentTarget);
        setBusy(true);
        setConfirmation(null);
        try {
            const result = await createBirthdayInquiry({
                paqueteId: packageId,
                fecha: data.get("fecha"),
                horaInicio: data.get("horaInicio"),
            });
            setConfirmation(result);
            notify(result.mensaje);
        } catch (failure) {
            notify(failure.message, "error");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="page-container public-page birthday-page">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">FUTBOL · FAMILIA · AMIGOS</p>
                    <h1>TU CUMPLEAÑOS EN LA FÁBRICA</h1>
                    <p>Celebrá junto a tus seres queridos con una buena dosis de pelota.</p>
                </div>
            </div>
            <PublicDataState
                loading={loading}
                error={error}
                retry={() => load()}
                loadingLabel="Consultando paquetes..."
            />
            {!loading && !error && (
                <>
                    <fieldset className="birthday-packages">
                        <legend className="sr-only">Elegí un paquete</legend>
                        {packages.map((item, index) => (
                            <label
                                className={`birthday-package package-tone-${index + 1} ${packageId === item.id ? "selected" : ""}`}
                                key={item.id}
                            >
                                <input
                                    type="radio"
                                    name="paquete"
                                    value={item.id}
                                    checked={packageId === item.id}
                                    onChange={() => {
                                        setPackageId(item.id);
                                        setConfirmation(null);
                                    }}
                                />
                                <span className="package-name">{item.nombre}</span>
                                <span className="package-description">
                                    {item.duracionHoras} h · Mesa para invitados
                                    {item.buffetIncluido ? " · Buffet incluido" : ""}
                                    {` · ${item.cantidadChicos} chicos`}
                                </span>
                                <span className="package-action">Seleccionar paquete</span>
                            </label>
                        ))}
                    </fieldset>

                    <section className="birthday-inquiry-layout">
                        <form className="birthday-inquiry" onSubmit={submit} aria-busy={busy}>
                            <p className="eyebrow">CONSULTÁ TU FECHA</p>
                            <h2><PartyPopper size={21} /> Coordinemos el festejo</h2>
                            <label className="field" htmlFor="birthday-date">
                                <span>Día</span>
                                <input
                                    id="birthday-date"
                                    name="fecha"
                                    type="date"
                                    min={minimumDate}
                                    required
                                    disabled={busy}
                                />
                            </label>
                            <label className="field" htmlFor="birthday-time">
                                <span>Horario</span>
                                <input
                                    id="birthday-time"
                                    name="horaInicio"
                                    type="time"
                                    required
                                    disabled={busy}
                                />
                            </label>
                            <p className="form-hint">La consulta requiere al menos 48 horas de anticipación.</p>
                            {!authLoading && !isClient && (
                                <p className="form-hint">
                                    Para simular la consulta, ingresá con una cuenta de cliente. No se envían mensajes ni se confirma una reserva.
                                </p>
                            )}
                            <button className="button primary" type="submit" disabled={busy || authLoading || !isClient}>
                                {busy ? <LoaderCircle className="spin" size={18} /> : <CalendarDays size={18} />}
                                {busy ? "Consultando..." : "Simular consulta"}
                            </button>
                            {!authLoading && !user && (
                                <Link className="text-link" to="/cuenta">Ingresar o crear cuenta</Link>
                            )}
                        </form>
                        <div className="birthday-visual" role="img" aria-label="Imagen ilustrativa de la cancha">
                            <span>Festejá en equipo</span>
                        </div>
                    </section>

                    {confirmation && (
                        <section className="simulation-confirmation" role="status" aria-live="polite">
                            <CheckCircle2 size={21} />
                            <div>
                                <h2>Consulta simulada</h2>
                                <p>{confirmation.mensaje}</p>
                                <p>{confirmation.consulta.fecha} · {confirmation.consulta.horaInicio} · {confirmation.consulta.duracionHoras} h</p>
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
}