import { useEffect, useState } from "react";
import { Clock3, Dumbbell, Info } from "lucide-react";
import PublicDataState from "../components/PublicDataState.jsx";
import { getGymInfo } from "../services/publicInfo.js";

export default function GymPage() {
    const [gym, setGym] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function load(signal) {
        setLoading(true);
        setError("");
        try {
            setGym(await getGymInfo(signal));
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

    return (
        <div className="page-container public-page gym-page">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">FUERZA · MOVIMIENTO · EQUIPO</p>
                    <h1>ENTRENÁ EN LA FÁBRICA</h1>
                    <p>Una membresía y horarios destacados para organizar tu visita.</p>
                </div>
            </div>
            <PublicDataState
                loading={loading}
                error={error}
                retry={() => load()}
                loadingLabel="Consultando informacion del gimnasio..."
            />
            {!loading && !error && gym && (
                <>
                    <section className="gym-overview" aria-label="Informacion del gimnasio">
                        <article className="gym-membership">
                            <Dumbbell size={25} aria-hidden="true" />
                            <p className="eyebrow">MEMBRESÍA</p>
                            <h2>{gym.membresia.tipo}</h2>
                            <p>Un único plan, sin niveles.</p>
                        </article>
                        <article className="gym-schedule">
                            <div className="section-title-row">
                                <div>
                                    <p className="eyebrow">HORARIOS DESTACADOS</p>
                                    <h2><Clock3 size={19} /> Días disponibles</h2>
                                </div>
                            </div>
                            <ul className="gym-hours">
                                {gym.horariosDestacados.map((schedule) => (
                                    <li key={schedule.dia}>
                                        <span>{schedule.dia}</span>
                                        <strong>{schedule.horaInicio}–{schedule.horaFin}</strong>
                                    </li>
                                ))}
                            </ul>
                            <p className="inline-note">
                                <Info size={16} /> El horario completo no está disponible.
                            </p>
                        </article>
                    </section>
                    <section className="gym-attendance-note">
                        <h2>Tu entrenamiento, en persona</h2>
                        <p>La asistencia se registra presencialmente en recepción. El sitio no reserva turnos de gimnasio.</p>
                    </section>
                </>
            )}
        </div>
    );
}