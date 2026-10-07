import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    CalendarDays,
    Dumbbell,
    Trophy,
    PartyPopper,
    MapPin,
} from "lucide-react";
import PublicDataState from "../components/PublicDataState.jsx";
import { getTournaments } from "../services/publicInfo.js";
import canchaImage from "../assets/cancha.jpg";

const sections = [
    { path: "/", title: "Reservar cancha", color: "green", Icon: CalendarDays },
    { path: "/gym", title: "Horarios de Gym", color: "orange", Icon: Dumbbell },
    { path: "/cumpleanos", title: "Cumpleaños", color: "yellow", Icon: PartyPopper },
    { path: "/torneos", title: "Torneos", color: "dark", Icon: Trophy },
];

export default function HomePage() {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");
        getTournaments(controller.signal)
            .then(setTournaments)
            .catch((failure) => {
                if (failure.name !== "AbortError") setError(failure.message);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [reloadKey]);

    return (
        <div className="page-container home-page">
            <section className="home-hero">
                <img src={canchaImage} alt="Imagen ilustrativa de una cancha de fútbol" />
                <div className="home-hero-copy">
                    <p className="eyebrow">LA FÁBRICA F5 · VILLA DEVOTO</p>
                    <h1>PICADOS, CUMPLES Y TORNEOS EN VILLA DEVOTO</h1>
                    <p>Cancha de fútbol 5, gimnasio y encuentros para compartir.</p>
                    <div className="hero-actions">
                        <Link className="button home-primary" to="/">Reservar cancha</Link>
                        <Link className="button home-secondary" to="/torneos">Ver torneos <ArrowRight size={17} /></Link>
                    </div>
                </div>
                <span className="photo-caption">Imagen ilustrativa</span>
            </section>

            <section className="home-services" aria-labelledby="home-services-heading">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow">LA FÁBRICA</p>
                        <h2 id="home-services-heading">¿Qué querés hacer hoy?</h2>
                    </div>
                </div>
                <div className="service-links" aria-label="Servicios">
                    {sections.map(({ path, title, color, Icon }) => (
                        <Link to={path} className={`service-link ${color}`} key={path}>
                            <Icon size={20} />
                            <span>{title}</span>
                            <ArrowRight size={17} />
                        </Link>
                    ))}
                </div>
            </section>

            <section className="home-tournaments" aria-labelledby="home-tournaments-heading">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow">COMPETENCIA EN EQUIPO</p>
                        <h2 id="home-tournaments-heading">Torneos jugando ahora</h2>
                    </div>
                    <Link className="text-link" to="/torneos">Todos los torneos <ArrowRight size={17} /></Link>
                </div>
                <PublicDataState
                    loading={loading}
                    error={error}
                    retry={() => setReloadKey((current) => current + 1)}
                    loadingLabel="Consultando torneos..."
                />
                {!loading && !error && (
                    <div className="home-tournament-list">
                        {tournaments.map((tournament) => (
                            <Link className="home-tournament" to="/torneos" key={tournament.id}>
                                <strong>{tournament.nombre}</strong>
                                <span>{tournament.equiposAnotados} equipos / {tournament.cupos} cupos</span>
                                <span className={tournament.estado === "En Juego" ? "status-playing" : "status-open"}>{tournament.estado}</span>
                            </Link>
                        ))}
                        {!tournaments.length && <p>No hay torneos publicados.</p>}
                    </div>
                )}
                {!loading && !error && tournaments.some((item) => item.datosDeReferencia) && (
                    <p className="reference-footnote">Torneos de referencia de la captura; no son inscripciones activas.</p>
                )}
            </section>

            <section className="home-about">
                <img src={canchaImage} alt="Imagen ilustrativa de una cancha" loading="lazy" />
                <div>
                    <p className="eyebrow"><MapPin size={15} /> VILLA DEVOTO</p>
                    <h2>Sobre La Fábrica</h2>
                    <p>Un espacio de barrio para juntarse con amigos, jugar y compartir.</p>
                    <Link className="text-link" to="/nosotros">Conocé más <ArrowRight size={17} /></Link>
                </div>
            </section>
        </div>
    );
}
