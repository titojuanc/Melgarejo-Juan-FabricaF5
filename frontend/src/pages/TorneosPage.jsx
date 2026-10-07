import { useEffect, useState } from "react";
import { CalendarDays, Info, Trophy } from "lucide-react";
import Modal from "../components/Modal.jsx";
import PublicDataState from "../components/PublicDataState.jsx";
import { getTournament, getTournaments } from "../services/publicInfo.js";

export default function TorneosPage() {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [featuredId, setFeaturedId] = useState(null);
    const [detailId, setDetailId] = useState(null);
    const [detail, setDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState("");
    const [detailReloadKey, setDetailReloadKey] = useState(0);

    async function load(signal) {
        setLoading(true);
        setError("");
        try {
            const data = await getTournaments(signal);
            setTournaments(data);
            setFeaturedId(
                (current) =>
                    current ??
                    data.find((item) => item.tabla?.length)?.id ??
                    data[0]?.id ??
                    null,
            );
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

    useEffect(() => {
        if (detailId === null) return undefined;
        const controller = new AbortController();
        setDetail(null);
        setDetailError("");
        setDetailLoading(true);
        getTournament(detailId, controller.signal)
            .then(setDetail)
            .catch((failure) => {
                if (failure.name !== "AbortError") setDetailError(failure.message);
            })
            .finally(() => {
                if (!controller.signal.aborted) setDetailLoading(false);
            });
        return () => controller.abort();
    }, [detailId, detailReloadKey]);

    const featured = tournaments.find((item) => item.id === featuredId);
    const featuredStandings = Array.isArray(featured?.tabla)
        ? featured.tabla
        : [];
    const detailMatches = Array.isArray(detail?.partidos)
        ? detail.partidos
        : [];
    const detailStandings = Array.isArray(detail?.tabla) ? detail.tabla : [];

    return (
        <div className="page-container public-page tournaments-page">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">FUTBOL · COMPETENCIA · EQUIPO</p>
                    <h1>TORNEOS</h1>
                    <p>Seguí las posiciones y novedades disponibles.</p>
                </div>
            </div>
            <div className="reference-notice" role="note">
                <Info size={17} /> Los torneos y la tabla visibles son datos de referencia, no inscripciones operativas.
            </div>
            <PublicDataState
                loading={loading}
                error={error}
                retry={() => load()}
                loadingLabel="Consultando torneos..."
            />
            {!loading && !error && (
                <>
                    <section className="tournament-list" aria-label="Torneos disponibles">
                        {tournaments.map((tournament) => (
                            <article className={`tournament-row ${featuredId === tournament.id ? "is-featured" : ""}`} key={tournament.id}>
                                <Trophy size={20} aria-hidden="true" />
                                <h2>{tournament.nombre}</h2>
                                <span className="tournament-capacity">{tournament.equiposAnotados} equipos anotados / {tournament.cupos} cupos</span>
                                <span className={`status-badge ${tournament.estado === "En Juego" ? "status-playing" : "status-open"}`}>
                                    {tournament.estado}
                                </span>
                                <div className="tournament-actions">
                                    <button className="text-link" onClick={() => setFeaturedId(tournament.id)}>
                                        Ver tabla
                                    </button>
                                    <button className="button secondary" onClick={() => setDetailId(tournament.id)}>
                                        Detalle y fixture
                                    </button>
                                </div>
                            </article>
                        ))}
                    </section>

                    {featured && (
                        <section className="tournament-feature" aria-labelledby="tournament-table-heading">
                            <div className="tournament-standing">
                                <p className="eyebrow">POSICIONES DE REFERENCIA</p>
                                <h2 id="tournament-table-heading">{featured.nombre}</h2>
                                {featuredStandings.length ? (
                                    <table className="standings-table">
                                        <caption className="sr-only">Tabla de posiciones de {featured.nombre}</caption>
                                        <thead><tr><th scope="col">Equipo</th><th scope="col">Puntos</th></tr></thead>
                                        <tbody>
                                            {featuredStandings.map((entry) => (
                                                <tr key={entry.posicion}>
                                                    <th scope="row">{entry.equipo}</th>
                                                    <td>{entry.puntos} pts</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="empty-inline">Todavía no hay posiciones publicadas.</p>
                                )}
                                <button className="text-link" onClick={() => setDetailId(featured.id)}>
                                    Ver información del torneo <span aria-hidden="true">→</span>
                                </button>
                            </div>
                            <div className="fixture-placeholder">
                                <CalendarDays size={27} />
                                <h2>Fixture</h2>
                                <p>El calendario de partidos todavía no está disponible.</p>
                            </div>
                        </section>
                    )}
                    <p className="tournament-contact-note">La participación se coordina con la administración. Este sitio no registra equipos.</p>
                </>
            )}
            {detailId !== null && (
                <Modal title={detail?.nombre || "Detalle del torneo"} onClose={() => setDetailId(null)}>
                    <PublicDataState
                        loading={detailLoading}
                        error={detailError}
                        retry={() => setDetailReloadKey((current) => current + 1)}
                        loadingLabel="Cargando detalle..."
                    />
                    {!detailLoading && !detailError && detail && (
                        <div className="tournament-detail">
                            {detail.datosDeReferencia && <p className="reference-notice">Información de referencia.</p>}
                            <dl className="tournament-meta">
                                <div><dt>Estado</dt><dd>{detail.estado}</dd></div>
                                <div><dt>Equipos</dt><dd>{detail.equiposAnotados} / {detail.cupos}</dd></div>
                            </dl>
                            <h3>Fixture y resultados</h3>
                            {detailMatches.length ? (
                                <ul className="fixture-list">
                                    {detailMatches.map((match, index) => <li key={match.id || index}>{match.fecha} · {match.local} vs. {match.visitante} · {match.resultado || "Pendiente"}</li>)}
                                </ul>
                            ) : (
                                <p className="empty-inline">Fixture, fechas y resultados todavía no disponibles.</p>
                            )}
                            <h3>Tabla de posiciones</h3>
                            {detailStandings.length ? (
                                <ol className="detail-standings">
                                    {detailStandings.map((entry) => <li key={entry.posicion}><span>{entry.equipo}</span><strong>{entry.puntos} pts</strong></li>)}
                                </ol>
                            ) : (
                                <p className="empty-inline">No hay posiciones publicadas para este torneo.</p>
                            )}
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
}