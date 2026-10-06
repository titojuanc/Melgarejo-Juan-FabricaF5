import { useState } from "react";
import { ArrowRight, CalendarDays, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useTurnos } from "../components/TurnosProvider.jsx";
import LoadState from "../components/LoadState.jsx";
import WeekCalendar from "../components/WeekCalendar.jsx";
import TurnoForm from "../components/TurnoForm.jsx";
import { dateKey } from "../utils/turnos.js";

export default function ReservaPage() {
    const { turnos, loading, error, reload } = useTurnos();
    const [anchor, setAnchor] = useState(dateKey(new Date()));
    const [selected, setSelected] = useState(null);
    const [formVersion, setFormVersion] = useState(0);
    return (
        <div className="page-container reservation-page">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">LA FABRICA FUTBOL 5</p>
                    <h1>RESERVA TU CANCHA</h1>
                    <p>Un horario. Tu equipo. La cancha los espera.</p>
                </div>
                <Link className="text-link" to="/turnos">
                    Ver turnos <ArrowRight size={17} />
                </Link>
            </div>
            <div className="reservation-layout">
                <div className="availability">
                    <LoadState
                        loading={loading}
                        error={error}
                        retry={() => reload()}
                    />
                    {!loading && !error && (
                        <>
                            <WeekCalendar
                                anchor={anchor}
                                onWeekChange={setAnchor}
                                turnos={turnos}
                                selected={selected}
                                onSelect={(slot) => {
                                    setSelected(slot);
                                    setFormVersion(formVersion + 1);
                                }}
                            />
                            <div className="calendar-bottom">
                                <span>
                                    <CalendarDays size={17} /> Cancha de futbol
                                    5
                                </span>
                                <button
                                    className="text-link"
                                    onClick={() => reload()}
                                >
                                    <RefreshCw size={15} /> Actualizar
                                    disponibilidad
                                </button>
                            </div>
                        </>
                    )}
                </div>
                <aside
                    className="reservation-panel"
                    aria-labelledby="reservation-heading"
                >
                    <p className="eyebrow">A JUGAR</p>
                    <h2 id="reservation-heading">TU RESERVA</h2>
                    <div className="panel-rule" />
                    {!loading && !error ? (
                        <TurnoForm
                            key={formVersion}
                            initial={selected || {}}
                            reservation
                            onSaved={() => {
                                setSelected(null);
                                setFormVersion(formVersion + 1);
                            }}
                        />
                    ) : (
                        <p className="panel-placeholder">
                            {loading
                                ? "Consultando disponibilidad..."
                                : "Disponibilidad no disponible."}
                        </p>
                    )}
                </aside>
            </div>
        </div>
    );
}
