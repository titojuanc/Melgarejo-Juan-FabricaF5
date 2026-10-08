import { useEffect, useState } from "react";
import { CalendarDays, Info, RefreshCw, Trophy } from "lucide-react";
import Modal from "../components/Modal.jsx";
import PublicDataState from "../components/PublicDataState.jsx";
import { getTournament, getTournaments } from "../services/publicInfo.js";
import { formatDate } from "../utils/turnos.js";

function fixtureRounds(matches = [], byes = []) {
    return [...new Set([
        ...matches.map((match) => match.ronda || 1),
        ...byes.map((bye) => bye.ronda),
    ])].sort((first, second) => first - second);
}

function StandingsTable({ entries, detailed = false, label }) {
    if (!entries.length) return <p className="empty-inline">Todavía no hay resultados para la tabla.</p>;
    return (
        <div className="records-scroll public-standings-scroll" role="region" tabIndex={0} aria-label={label}>
            <table className={`standings-table ${detailed ? "standings-detailed" : ""}`}>
                <caption className="sr-only">{label}</caption>
                {detailed ? (
                    <>
                        <thead><tr><th scope="col">Pos.</th><th scope="col">Equipo</th><th scope="col">PJ</th><th scope="col">PG</th><th scope="col">PE</th><th scope="col">PP</th><th scope="col">GF</th><th scope="col">GC</th><th scope="col">DG</th><th scope="col">Pts</th></tr></thead>
                        <tbody>{entries.map((entry) => <tr key={entry.posicion}><td>{entry.posicion}</td><th scope="row">{entry.equipo}</th><td>{entry.partidosJugados}</td><td>{entry.ganados}</td><td>{entry.empatados}</td><td>{entry.perdidos}</td><td>{entry.golesFavor}</td><td>{entry.golesContra}</td><td>{entry.diferenciaGoles}</td><td><strong>{entry.puntos}</strong></td></tr>)}</tbody>
                    </>
                ) : (
                    <>
                        <thead><tr><th scope="col">Equipo</th><th scope="col">Puntos</th></tr></thead>
                        <tbody>{entries.map((entry) => <tr key={entry.posicion}><th scope="row">{entry.equipo}</th><td>{entry.puntos} pts</td></tr>)}</tbody>
                    </>
                )}
            </table>
        </div>
    );
}

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
                    data.find((item) => !item.datosDeReferencia && item.fixtureGenerado)?.id ??
                    data.find((item) => !item.datosDeReferencia)?.id ??
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
    const featuredMatches = Array.isArray(featured?.partidos)
        ? featured.partidos
        : [];
    const featuredByes = Array.isArray(featured?.descansos)
        ? featured.descansos
        : [];

    function refresh() {
        load();
        if (detailId !== null) setDetailReloadKey((current) => current + 1);
    }

    return (
        <div className="page-container public-page tournaments-page">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">FUTBOL · COMPETENCIA · EQUIPO</p>
                    <h1>TORNEOS</h1>
                    <p>Fixture y posiciones actualizados con los resultados cargados.</p>
                </div>
                <button className="icon-button" title="Actualizar torneos" aria-label="Actualizar torneos" disabled={loading} onClick={refresh}>
                    <RefreshCw size={18} />
                </button>
            </div>
            {tournaments.some((item) => item.datosDeReferencia) && (
                <div className="reference-notice" role="note">
                    <Info size={17} /> Los torneos marcados como referencia son ilustrativos; los operativos reflejan los resultados cargados por el personal.
                </div>
            )}
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
                                <span className="tournament-capacity">{tournament.equiposAnotados} equipos{tournament.cupos ? ` / ${tournament.cupos} cupos` : " anotados"}</span>
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
                                <p className="eyebrow">{featured.datosDeReferencia ? "POSICIONES DE REFERENCIA" : featured.formato === "liga" ? "LIGA · PUNTAJE 3/1/0" : "COPA · ELIMINACIÓN DIRECTA"}</p>
                                <h2 id="tournament-table-heading">{featured.nombre}</h2>
                                {featured.formato === "copa" && !featured.datosDeReferencia ? (
                                    <p className="empty-inline">La copa avanza por rondas; no utiliza tabla de puntos.{featured.campeon ? ` Campeón: ${featured.campeon.equipo}.` : ""}</p>
                                ) : (
                                    <StandingsTable
                                        entries={featuredStandings}
                                        detailed={!featured.datosDeReferencia}
                                        label={`Tabla de posiciones de ${featured.nombre}`}
                                    />
                                )}
                                <button className="text-link" onClick={() => setDetailId(featured.id)}>
                                    Ver información del torneo <span aria-hidden="true">→</span>
                                </button>
                            </div>
                            <div className="fixture-placeholder">
                                <CalendarDays size={27} />
                                <h2>Fixture</h2>
                                {featured.fixtureGenerado ? (
                                    <div className="public-fixture-list">
                                        {fixtureRounds(featuredMatches, featuredByes).map((round) => (
                                            <section className="public-fixture-round" key={round}>
                                                <h3>{featured.formato === "copa" ? `Ronda ${round}` : `Jornada ${round}`}</h3>
                                                {featuredByes.filter((bye) => bye.ronda === round).map((bye, index) => <p className="fixture-bye" key={`${round}-${index}`}>Descansa: {bye.equipo}</p>)}
                                                {featuredMatches.filter((match) => (match.ronda || 1) === round).map((match) => <p className="public-fixture-match" key={match.id}><time dateTime={match.fecha}>{formatDate(match.fecha)}</time><span>{match.local} <strong>{match.resultado || "vs."}</strong> {match.visitante}</span><small>{match.estado === "Finalizado" ? "Resultado final" : "Pendiente"}</small></p>)}
                                            </section>
                                        ))}
                                    </div>
                                ) : featured.datosDeReferencia ? (
                                    <p>El fixture de referencia no está disponible.</p>
                                ) : (
                                    <p>El fixture todavía no fue generado por la administración.</p>
                                )}
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
                                <div><dt>Equipos</dt><dd>{detail.equiposAnotados}{detail.cupos ? ` / ${detail.cupos}` : ""}</dd></div>
                                {detail.formato && <div><dt>Formato</dt><dd>{detail.formato === "liga" ? "Liga única" : "Copa eliminatoria"}</dd></div>}
                            </dl>
                            <h3>Fixture y resultados</h3>
                            {detail.fixtureGenerado && detailMatches.length ? (
                                <div className="modal-fixture-rounds">
                                    {fixtureRounds(detailMatches, detail.descansos || []).map((round) => (
                                        <section key={round}>
                                            <h4>{detail.formato === "copa" ? `Ronda ${round}` : `Jornada ${round}`}</h4>
                                            {(detail.descansos || []).filter((bye) => bye.ronda === round).map((bye, index) => <p className="fixture-bye" key={`${round}-${index}`}>Descansa: {bye.equipo}</p>)}
                                            <ul className="fixture-list">
                                                {detailMatches.filter((match) => (match.ronda || 1) === round).map((match) => <li key={match.id}>{formatDate(match.fecha)} · {match.local} vs. {match.visitante} · {match.resultado || "Pendiente"}</li>)}
                                            </ul>
                                        </section>
                                    ))}
                                </div>
                            ) : detailMatches.length ? (
                                <ul className="fixture-list">
                                    {detailMatches.map((match, index) => <li key={match.id || index}>{match.fecha} · {match.local || `#${match.equipoLocalId}`} vs. {match.visitante || `#${match.equipoVisitanteId}`} · {match.resultado || (match.estado === "Finalizado" ? `${match.golesLocal} - ${match.golesVisitante}` : "Pendiente")}</li>)}
                                </ul>
                            ) : (
                                <p className="empty-inline">{detail.datosDeReferencia ? "Fixture, fechas y resultados todavía no disponibles." : "El fixture todavía no fue generado."}</p>
                            )}
                            {detail.campeon && <p className="tournament-champion"><Trophy size={17} /> Campeón: <strong>{detail.campeon.equipo}</strong></p>}
                            <h3>Tabla de posiciones</h3>
                            {detail.formato === "copa" && !detail.datosDeReferencia ? (
                                <p className="empty-inline">La copa se define por eliminación directa y no tiene tabla de puntos.</p>
                            ) : detailStandings.length ? (
                                <StandingsTable entries={detailStandings} detailed={!detail.datosDeReferencia} label={`Tabla de posiciones de ${detail.nombre}`} />
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