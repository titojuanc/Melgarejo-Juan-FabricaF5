import { useEffect, useId, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
    BadgeCheck,
    CalendarDays,
    CreditCard,
    Dumbbell,
    Flag,
    LoaderCircle,
    Plus,
    RefreshCw,
    Trophy,
    Users,
} from "lucide-react";
import { useAuth } from "../components/AuthProvider.jsx";
import { useNotifications } from "../components/Notifications.jsx";
import { useTurnos } from "../components/TurnosProvider.jsx";
import { createStaffUser } from "../services/auth.js";
import * as service from "../services/operations.js";
import { formatDate } from "../utils/turnos.js";

const panels = [
    { id: "pagos", label: "Pagos", icon: CreditCard },
    { id: "gym", label: "Gimnasio", icon: Dumbbell },
    { id: "torneos", label: "Torneos", icon: Trophy },
    { id: "usuarios", label: "Usuarios", icon: Users, adminOnly: true },
];

function clientName(clients, id) {
    return clients.find((client) => client.id === Number(id))?.nombre || `#${id}`;
}

function dateTime(value) {
    return new Intl.DateTimeFormat("es-AR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

function ClientSelect({ clients, id, value, onChange }) {
    return (
        <div className="field">
            <label htmlFor={id}>Cliente</label>
            <select id={id} value={value} onChange={onChange} required>
                <option value="">Seleccionar cliente</option>
                {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                        {client.nombre} · #{client.id}
                    </option>
                ))}
            </select>
        </div>
    );
}

function PaymentPanel({ clients, payments, memberships, turnos, onChanged }) {
    const prefix = useId();
    const { notify } = useNotifications();
    const [tipo, setTipo] = useState("turno");
    const [turnoId, setTurnoId] = useState("");
    const [membresiaId, setMembresiaId] = useState("");
    const [monto, setMonto] = useState("");
    const [busy, setBusy] = useState(false);
    const activeTurnos = turnos.filter((turno) => turno.estado !== "Cancelado");

    async function submit(event) {
        event.preventDefault();
        setBusy(true);
        try {
            await service.recordPayment({
                monto: Number(monto),
                tipo,
                ...(tipo === "turno"
                    ? { turnoId: Number(turnoId) }
                    : { membresiaId: Number(membresiaId) }),
            });
            setMonto("");
            setTurnoId("");
            setMembresiaId("");
            notify("Pago recibido registrado.");
            await onChanged();
        } catch (error) {
            notify(error.message, "error");
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className="management-panel" aria-labelledby="payments-title">
            <div className="management-section-heading">
                <div>
                    <p className="eyebrow">REGISTRO MANUAL</p>
                    <h2 id="payments-title">Pagos recibidos</h2>
                </div>
                <span className="management-count">{payments.length} registros</span>
            </div>
            <form className="management-form" onSubmit={submit}>
                <div className="management-fields">
                    <div className="field">
                        <label htmlFor={`${prefix}-tipo`}>Concepto</label>
                        <select
                            id={`${prefix}-tipo`}
                            value={tipo}
                            onChange={(event) => setTipo(event.target.value)}
                        >
                            <option value="turno">Turno</option>
                            <option value="membresia">Membresía</option>
                        </select>
                    </div>
                    {tipo === "turno" ? (
                        <div className="field">
                            <label htmlFor={`${prefix}-turno`}>Turno</label>
                            <select
                                id={`${prefix}-turno`}
                                value={turnoId}
                                onChange={(event) => setTurnoId(event.target.value)}
                                required
                            >
                                <option value="">Seleccionar turno</option>
                                {activeTurnos.map((turno) => (
                                    <option key={turno.id} value={turno.id}>
                                        #{turno.id} · {formatDate(turno.fecha)} · {turno.horaInicio} · {clientName(clients, turno.clienteId)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="field">
                            <label htmlFor={`${prefix}-membresia`}>Membresía</label>
                            <select
                                id={`${prefix}-membresia`}
                                value={membresiaId}
                                onChange={(event) => setMembresiaId(event.target.value)}
                                required
                            >
                                <option value="">Seleccionar membresía</option>
                                {memberships.map((membership) => (
                                    <option key={membership.id} value={membership.id}>
                                        {clientName(clients, membership.clienteId)} · #{membership.id} · {membership.estado}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="field">
                        <label htmlFor={`${prefix}-monto`}>Importe recibido</label>
                        <input
                            id={`${prefix}-monto`}
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={monto}
                            onChange={(event) => setMonto(event.target.value)}
                            required
                        />
                    </div>
                </div>
                <button className="button primary" type="submit" disabled={busy}>
                    {busy ? <LoaderCircle className="spin" size={17} /> : <Plus size={17} />}
                    {busy ? "Registrando..." : "Registrar pago"}
                </button>
                <p className="form-hint light-hint">
                    Solo se registra el importe recibido. No se calculan tarifas ni recargos.
                </p>
            </form>
            <RecordsScroll label="Pagos recibidos">
                {payments.length ? (
                    <table className="records-table management-table">
                        <caption className="sr-only">Pagos recibidos</caption>
                        <thead><tr><th scope="col">Fecha</th><th scope="col">Cliente</th><th scope="col">Concepto</th><th scope="col">Importe</th><th scope="col">Estado</th></tr></thead>
                        <tbody>{[...payments].reverse().map((payment) => (
                            <tr key={payment.id}>
                                <td>{dateTime(payment.fecha)}</td>
                                <td>{clientName(clients, payment.clienteId)}</td>
                                <td>{payment.tipo === "turno" ? `Turno #${payment.turnoId}` : `Membresía #${payment.membresiaId}`}</td>
                                <td>{Number(payment.monto).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td><span className="status-badge status-confirmed">{payment.estado}</span></td>
                            </tr>
                        ))}</tbody>
                    </table>
                ) : <p className="empty-inline">Todavía no hay pagos registrados.</p>}
            </RecordsScroll>
        </section>
    );
}

function GymPanel({ clients, memberships, attendances, onChanged }) {
    const membershipPrefix = useId();
    const attendancePrefix = useId();
    const { notify } = useNotifications();
    const [membership, setMembership] = useState({ clienteId: "", fechaInicio: "", fechaVencimiento: "" });
    const [attendanceClientId, setAttendanceClientId] = useState("");
    const [busy, setBusy] = useState(false);

    async function submitMembership(event) {
        event.preventDefault();
        if (membership.fechaVencimiento < membership.fechaInicio) {
            notify("La fecha de vencimiento debe ser posterior al inicio.", "error");
            return;
        }
        setBusy(true);
        try {
            await service.createMembership({
                ...membership,
                clienteId: Number(membership.clienteId),
            });
            setMembership({ clienteId: "", fechaInicio: "", fechaVencimiento: "" });
            notify("Período de membresía registrado.");
            await onChanged();
        } catch (error) {
            notify(error.message, "error");
        } finally {
            setBusy(false);
        }
    }

    async function submitAttendance(event) {
        event.preventDefault();
        setBusy(true);
        try {
            await service.recordAttendance({ clienteId: Number(attendanceClientId) });
            setAttendanceClientId("");
            notify("Asistencia registrada.");
            await onChanged();
        } catch (error) {
            notify(error.message, "error");
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className="management-panel" aria-labelledby="gym-title">
            <div className="management-section-heading">
                <div>
                    <p className="eyebrow">GESTIÓN PRESENCIAL</p>
                    <h2 id="gym-title">Gimnasio</h2>
                </div>
            </div>
            <div className="management-columns">
                <section className="management-operation" aria-labelledby="membership-title">
                    <h3 id="membership-title">Registrar período</h3>
                    <form className="management-form" onSubmit={submitMembership}>
                        <ClientSelect
                            clients={clients}
                            id={`${membershipPrefix}-cliente`}
                            value={membership.clienteId}
                            onChange={(event) => setMembership({ ...membership, clienteId: event.target.value })}
                        />
                        <div className="form-row">
                            <div className="field"><label htmlFor={`${membershipPrefix}-inicio`}>Inicio</label><input id={`${membershipPrefix}-inicio`} type="date" value={membership.fechaInicio} onChange={(event) => setMembership({ ...membership, fechaInicio: event.target.value })} required /></div>
                            <div className="field"><label htmlFor={`${membershipPrefix}-fin`}>Vencimiento</label><input id={`${membershipPrefix}-fin`} type="date" value={membership.fechaVencimiento} onChange={(event) => setMembership({ ...membership, fechaVencimiento: event.target.value })} required /></div>
                        </div>
                        <button className="button primary" type="submit" disabled={busy}><Plus size={17} /> Registrar período</button>
                    </form>
                </section>
                <section className="management-operation" aria-labelledby="attendance-title">
                    <h3 id="attendance-title">Tomar asistencia</h3>
                    <form className="management-form" onSubmit={submitAttendance}>
                        <ClientSelect
                            clients={clients}
                            id={`${attendancePrefix}-cliente`}
                            value={attendanceClientId}
                            onChange={(event) => setAttendanceClientId(event.target.value)}
                        />
                        <p className="form-hint light-hint">La fecha y hora se registran automáticamente. La asistencia no depende del estado de la membresía.</p>
                        <button className="button primary" type="submit" disabled={busy}><BadgeCheck size={17} /> Registrar asistencia</button>
                    </form>
                </section>
            </div>
            <h3 className="management-subheading">Membresías</h3>
            <RecordsScroll label="Membresías">
                {memberships.length ? (
                    <table className="records-table management-table">
                        <caption className="sr-only">Membresías registradas</caption>
                        <thead><tr><th scope="col">Cliente</th><th scope="col">Inicio</th><th scope="col">Vencimiento</th><th scope="col">Estado</th></tr></thead>
                        <tbody>{[...memberships].reverse().map((item) => <tr key={item.id}><td>{clientName(clients, item.clienteId)}</td><td>{formatDate(item.fechaInicio)}</td><td>{formatDate(item.fechaVencimiento)}</td><td><span className={`status-badge ${item.estado === "Vencida" ? "cancelled" : "status-confirmed"}`}>{item.estado}</span></td></tr>)}</tbody>
                    </table>
                ) : <p className="empty-inline">Todavía no hay períodos registrados.</p>}
            </RecordsScroll>
            <h3 className="management-subheading">Asistencias recientes</h3>
            <RecordsScroll label="Asistencias">
                {attendances.length ? (
                    <table className="records-table management-table">
                        <caption className="sr-only">Asistencias</caption>
                        <thead><tr><th scope="col">Fecha y hora</th><th scope="col">Cliente</th></tr></thead>
                        <tbody>{[...attendances].reverse().map((item) => <tr key={item.id}><td>{dateTime(item.fechaHora)}</td><td>{clientName(clients, item.clienteId)}</td></tr>)}</tbody>
                    </table>
                ) : <p className="empty-inline">Todavía no hay asistencias registradas.</p>}
            </RecordsScroll>
        </section>
    );
}

function TournamentsPanel({ tournaments, onChanged }) {
    const prefix = useId();
    const teamPrefix = useId();
    const matchPrefix = useId();
    const { notify } = useNotifications();
    const [selectedId, setSelectedId] = useState("");
    const [detail, setDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState("");
    const [busy, setBusy] = useState(false);
    const [newTournament, setNewTournament] = useState({ nombre: "", fechaInicio: "", fechaFin: "", estado: "Inscripciones abiertas" });
    const [newTeam, setNewTeam] = useState({ nombre: "", cantidadJugadores: "" });
    const [newMatch, setNewMatch] = useState({ equipoLocalId: "", equipoVisitanteId: "", fecha: "", golesLocal: "", golesVisitante: "" });

    useEffect(() => {
        if (!selectedId && tournaments.length) setSelectedId(String(tournaments[0].id));
        if (selectedId && !tournaments.some((item) => String(item.id) === selectedId)) setSelectedId("");
    }, [tournaments, selectedId]);

    useEffect(() => {
        if (!selectedId) {
            setDetail(null);
            return undefined;
        }
        const controller = new AbortController();
        setDetailLoading(true);
        setDetailError("");
        service.getManagedTournament(selectedId, controller.signal)
            .then(setDetail)
            .catch((error) => {
                if (error.name !== "AbortError") setDetailError(error.message);
            })
            .finally(() => {
                if (!controller.signal.aborted) setDetailLoading(false);
            });
        return () => controller.abort();
    }, [selectedId]);

    async function submitTournament(event) {
        event.preventDefault();
        if (newTournament.fechaFin < newTournament.fechaInicio) {
            notify("El final del torneo debe ser posterior al inicio.", "error");
            return;
        }
        setBusy(true);
        try {
            const tournament = await service.createTournament(newTournament);
            setSelectedId(String(tournament.id));
            setNewTournament({ nombre: "", fechaInicio: "", fechaFin: "", estado: "Inscripciones abiertas" });
            notify("Torneo creado.");
            await onChanged();
        } catch (error) {
            notify(error.message, "error");
        } finally {
            setBusy(false);
        }
    }

    async function submitTeam(event) {
        event.preventDefault();
        if (!selectedId) return;
        setBusy(true);
        try {
            await service.createTeam(selectedId, { ...newTeam, cantidadJugadores: Number(newTeam.cantidadJugadores) });
            setNewTeam({ nombre: "", cantidadJugadores: "" });
            notify("Equipo agregado al torneo.");
            await refreshDetail();
            await onChanged();
        } catch (error) {
            notify(error.message, "error");
        } finally {
            setBusy(false);
        }
    }

    async function submitMatch(event) {
        event.preventDefault();
        if (!selectedId) return;
        setBusy(true);
        try {
            await service.recordMatch(selectedId, {
                ...newMatch,
                equipoLocalId: Number(newMatch.equipoLocalId),
                equipoVisitanteId: Number(newMatch.equipoVisitanteId),
                golesLocal: Number(newMatch.golesLocal),
                golesVisitante: Number(newMatch.golesVisitante),
            });
            setNewMatch({ equipoLocalId: "", equipoVisitanteId: "", fecha: "", golesLocal: "", golesVisitante: "" });
            notify("Resultado cargado.");
            await refreshDetail();
        } catch (error) {
            notify(error.message, "error");
        } finally {
            setBusy(false);
        }
    }

    async function refreshDetail() {
        if (!selectedId) return;
        try {
            setDetail(await service.getManagedTournament(selectedId));
        } catch (error) {
            notify(error.message, "error");
        }
    }

    const teamName = (id) => detail?.equipos.find((team) => team.id === Number(id))?.nombre || `#${id}`;

    return (
        <section className="management-panel" aria-labelledby="tournaments-title">
            <div className="management-section-heading">
                <div><p className="eyebrow">GESTIÓN MANUAL</p><h2 id="tournaments-title">Torneos</h2></div>
                <span className="management-count">{tournaments.length} torneos</span>
            </div>
            <section className="management-operation" aria-labelledby="new-tournament-title">
                <h3 id="new-tournament-title">Crear torneo</h3>
                <form className="management-form" onSubmit={submitTournament}>
                    <div className="management-fields tournament-create-fields">
                        <div className="field"><label htmlFor={`${prefix}-nombre`}>Nombre</label><input id={`${prefix}-nombre`} value={newTournament.nombre} onChange={(event) => setNewTournament({ ...newTournament, nombre: event.target.value })} maxLength={100} required /></div>
                        <div className="field"><label htmlFor={`${prefix}-inicio`}>Inicio</label><input id={`${prefix}-inicio`} type="date" value={newTournament.fechaInicio} onChange={(event) => setNewTournament({ ...newTournament, fechaInicio: event.target.value })} required /></div>
                        <div className="field"><label htmlFor={`${prefix}-fin`}>Fin</label><input id={`${prefix}-fin`} type="date" value={newTournament.fechaFin} onChange={(event) => setNewTournament({ ...newTournament, fechaFin: event.target.value })} required /></div>
                        <div className="field"><label htmlFor={`${prefix}-estado`}>Estado</label><select id={`${prefix}-estado`} value={newTournament.estado} onChange={(event) => setNewTournament({ ...newTournament, estado: event.target.value })}><option>Inscripciones abiertas</option><option>En Juego</option><option>Finalizado</option></select></div>
                    </div>
                    <button className="button primary" type="submit" disabled={busy}><Plus size={17} /> Crear torneo</button>
                </form>
            </section>
            <div className="management-toolbar">
                <label htmlFor={`${prefix}-seleccion`}>Torneo seleccionado</label>
                <select id={`${prefix}-seleccion`} value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
                    <option value="">Seleccionar torneo</option>
                    {tournaments.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                </select>
            </div>
            {detailLoading ? <p className="management-inline-state" role="status"><LoaderCircle className="spin" size={18} /> Cargando torneo...</p> : detailError ? <p className="management-error" role="alert">{detailError}</p> : detail && (
                <>
                    <div className="management-tournament-meta"><span><Flag size={16} /> {detail.estado}</span><span><CalendarDays size={16} /> {formatDate(detail.fechaInicio)} – {formatDate(detail.fechaFin)}</span><span><Users size={16} /> {detail.equipos.length} equipos</span></div>
                    <div className="management-columns">
                        <section className="management-operation" aria-labelledby="new-team-title">
                            <h3 id="new-team-title">Agregar equipo</h3>
                            <form className="management-form" onSubmit={submitTeam}>
                                <div className="form-row"><div className="field"><label htmlFor={`${teamPrefix}-nombre`}>Nombre del equipo</label><input id={`${teamPrefix}-nombre`} value={newTeam.nombre} onChange={(event) => setNewTeam({ ...newTeam, nombre: event.target.value })} required maxLength={100} /></div><div className="field"><label htmlFor={`${teamPrefix}-jugadores`}>Cantidad de jugadores</label><input id={`${teamPrefix}-jugadores`} type="number" min="1" step="1" value={newTeam.cantidadJugadores} onChange={(event) => setNewTeam({ ...newTeam, cantidadJugadores: event.target.value })} required /></div></div>
                                <button className="button primary" type="submit" disabled={busy}><Plus size={17} /> Agregar equipo</button>
                            </form>
                        </section>
                        <section className="management-operation" aria-labelledby="new-match-title">
                            <h3 id="new-match-title">Cargar resultado manual</h3>
                            <form className="management-form" onSubmit={submitMatch}>
                                <div className="form-row"><div className="field"><label htmlFor={`${matchPrefix}-local`}>Equipo local</label><select id={`${matchPrefix}-local`} value={newMatch.equipoLocalId} onChange={(event) => setNewMatch({ ...newMatch, equipoLocalId: event.target.value })} required><option value="">Seleccionar equipo</option>{detail.equipos.map((team) => <option key={team.id} value={team.id}>{team.nombre}</option>)}</select></div><div className="field"><label htmlFor={`${matchPrefix}-visitante`}>Equipo visitante</label><select id={`${matchPrefix}-visitante`} value={newMatch.equipoVisitanteId} onChange={(event) => setNewMatch({ ...newMatch, equipoVisitanteId: event.target.value })} required><option value="">Seleccionar equipo</option>{detail.equipos.map((team) => <option key={team.id} value={team.id}>{team.nombre}</option>)}</select></div></div>
                                <div className="form-row management-score-fields"><div className="field"><label htmlFor={`${matchPrefix}-fecha`}>Fecha</label><input id={`${matchPrefix}-fecha`} type="date" min={detail.fechaInicio} max={detail.fechaFin} value={newMatch.fecha} onChange={(event) => setNewMatch({ ...newMatch, fecha: event.target.value })} required /></div><div className="field"><label htmlFor={`${matchPrefix}-goles-local`}>Goles local</label><input id={`${matchPrefix}-goles-local`} type="number" min="0" step="1" value={newMatch.golesLocal} onChange={(event) => setNewMatch({ ...newMatch, golesLocal: event.target.value })} required /></div><div className="field"><label htmlFor={`${matchPrefix}-goles-visitante`}>Goles visitante</label><input id={`${matchPrefix}-goles-visitante`} type="number" min="0" step="1" value={newMatch.golesVisitante} onChange={(event) => setNewMatch({ ...newMatch, golesVisitante: event.target.value })} required /></div></div>
                                <button className="button primary" type="submit" disabled={busy || detail.equipos.length < 2}><BadgeCheck size={17} /> Cargar resultado</button>
                            </form>
                        </section>
                    </div>
                    <h3 className="management-subheading">Estadísticas disponibles</h3>
                    <RecordsScroll label="Estadísticas de equipos">
                        {detail.equipos.length ? <table className="records-table management-table"><caption className="sr-only">Estadísticas manuales del torneo</caption><thead><tr><th scope="col">Equipo</th><th scope="col">PJ</th><th scope="col">G</th><th scope="col">E</th><th scope="col">P</th><th scope="col">GF</th><th scope="col">GC</th></tr></thead><tbody>{detail.equipos.map((team) => <tr key={team.id}><th scope="row">{team.nombre}</th><td>{team.partidosJugados}</td><td>{team.ganados}</td><td>{team.empatados}</td><td>{team.perdidos}</td><td>{team.golesFavor}</td><td>{team.golesContra}</td></tr>)}</tbody></table> : <p className="empty-inline">Todavía no hay equipos cargados.</p>}
                    </RecordsScroll>
                    <h3 className="management-subheading">Resultados</h3>
                    <RecordsScroll label="Resultados del torneo">
                        {detail.partidos.length ? <table className="records-table management-table"><caption className="sr-only">Resultados registrados</caption><thead><tr><th scope="col">Fecha</th><th scope="col">Partido</th><th scope="col">Resultado</th></tr></thead><tbody>{[...detail.partidos].reverse().map((match) => <tr key={match.id}><td>{formatDate(match.fecha)}</td><td>{teamName(match.equipoLocalId)} – {teamName(match.equipoVisitanteId)}</td><td>{match.golesLocal} – {match.golesVisitante}</td></tr>)}</tbody></table> : <p className="empty-inline">No hay resultados cargados.</p>}
                    </RecordsScroll>
                    <p className="form-hint light-hint management-note">Los equipos y resultados se cargan manualmente. No se genera fixture ni tabla de puntos.</p>
                </>
            )}
            {!tournaments.length && <p className="empty-inline">Todavía no hay torneos operativos. Los ejemplos públicos son datos de referencia.</p>}
        </section>
    );
}

function UsersPanel() {
    const prefix = useId();
    const { notify } = useNotifications();
    const [data, setData] = useState({ nombre: "", apellido: "", telefono: "", email: "", password: "", rol: "empleado" });
    const [busy, setBusy] = useState(false);

    async function submit(event) {
        event.preventDefault();
        setBusy(true);
        try {
            await createStaffUser(data);
            setData({ nombre: "", apellido: "", telefono: "", email: "", password: "", rol: "empleado" });
            notify("Cuenta interna creada.");
        } catch (error) {
            notify(error.message, "error");
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className="management-panel" aria-labelledby="users-title">
            <div className="management-section-heading"><div><p className="eyebrow">SOLO ADMINISTRACIÓN</p><h2 id="users-title">Cuentas internas</h2></div></div>
            <form className="management-form" onSubmit={submit}>
                <div className="management-fields">
                    <div className="field"><label htmlFor={`${prefix}-nombre`}>Nombre</label><input id={`${prefix}-nombre`} value={data.nombre} onChange={(event) => setData({ ...data, nombre: event.target.value })} required maxLength={80} /></div>
                    <div className="field"><label htmlFor={`${prefix}-apellido`}>Apellido</label><input id={`${prefix}-apellido`} value={data.apellido} onChange={(event) => setData({ ...data, apellido: event.target.value })} required maxLength={80} /></div>
                    <div className="field"><label htmlFor={`${prefix}-telefono`}>Teléfono</label><input id={`${prefix}-telefono`} type="tel" value={data.telefono} onChange={(event) => setData({ ...data, telefono: event.target.value })} required maxLength={30} /></div>
                    <div className="field"><label htmlFor={`${prefix}-email`}>Email</label><input id={`${prefix}-email`} type="email" autoComplete="email" value={data.email} onChange={(event) => setData({ ...data, email: event.target.value })} required /></div>
                    <div className="field"><label htmlFor={`${prefix}-password`}>Contraseña temporal</label><input id={`${prefix}-password`} type="password" autoComplete="new-password" value={data.password} onChange={(event) => setData({ ...data, password: event.target.value })} required minLength={8} /></div>
                    <div className="field"><label htmlFor={`${prefix}-rol`}>Rol</label><select id={`${prefix}-rol`} value={data.rol} onChange={(event) => setData({ ...data, rol: event.target.value })}><option value="empleado">Empleado</option><option value="admin">Administrador</option></select></div>
                </div>
                <button className="button primary" type="submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} /> : <Plus size={17} />}{busy ? "Creando..." : "Crear cuenta"}</button>
                <p className="form-hint light-hint">Las cuentas internas no crean perfiles de cliente. Entregá la contraseña temporal por un canal seguro.</p>
            </form>
        </section>
    );
}

function RecordsScroll({ label, children }) {
    return <div className="records-scroll management-records" tabIndex={0} role="region" aria-label={label}>{children}</div>;
}

export default function GestionPage() {
    const { user, loading: authLoading } = useAuth();
    const { turnos, loading: turnosLoading } = useTurnos();
    const { notify } = useNotifications();
    const [section, setSection] = useState("pagos");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [data, setData] = useState({ clients: [], payments: [], memberships: [], attendances: [], tournaments: [] });
    const isStaff = user && ["empleado", "admin"].includes(user.rol);
    const visiblePanels = panels.filter((panel) => !panel.adminOnly || user?.rol === "admin");

    async function loadData(signal) {
        setError("");
        try {
            const [clients, payments, memberships, attendances, tournaments] = await Promise.all([
                service.getClients(signal),
                service.getPayments(signal),
                service.getMemberships(signal),
                service.getAttendances(signal),
                service.getManagedTournaments(signal),
            ]);
            if (signal?.aborted) return;
            setData({ clients, payments, memberships, attendances, tournaments });
        } catch (failure) {
            if (failure.name === "AbortError") return;
            setError(failure.message);
            notify(failure.message, "error");
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }

    useEffect(() => {
        if (authLoading || !isStaff) return undefined;
        const controller = new AbortController();
        loadData(controller.signal);
        return () => controller.abort();
    }, [authLoading, user?.id, user?.rol]);

    if (authLoading) return <div className="page-container" role="status">Cargando sesión...</div>;
    if (!user) return <Navigate to="/cuenta" replace />;
    if (!isStaff) return <Navigate to="/" replace />;

    async function refresh() {
        setLoading(true);
        await loadData();
    }

    async function refreshQuietly() {
        await loadData();
    }

    const activePanel = visiblePanels.find((item) => item.id === section);
    const ActiveIcon = activePanel?.icon || CreditCard;

    return (
        <div className="page-container management-page">
            <div className="page-heading">
                <div><p className="eyebrow">LA FÁBRICA FÚTBOL 5 · {user.rol === "admin" ? "ADMINISTRACIÓN" : "PERSONAL"}</p><h1>OPERACIONES INTERNAS</h1><p>Gestión operativa · {user.nombre}</p></div>
                <div className="management-heading-actions"><Link className="button secondary" to="/turnos"><CalendarDays size={17} /> Gestionar turnos</Link><button className="icon-button" title="Actualizar datos" aria-label="Actualizar datos" disabled={loading} onClick={refresh}><RefreshCw size={18} /></button></div>
            </div>
            <div className="management-tabs" aria-label="Operaciones">
                {visiblePanels.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-pressed={section === id} className={section === id ? "active" : ""} onClick={() => setSection(id)}><Icon size={18} /> {label}</button>)}
            </div>
            {loading ? <div className="management-state" role="status"><LoaderCircle className="spin" /> Cargando operaciones...</div> : error ? <div className="management-state management-error" role="alert"><p>{error}</p><button className="button secondary" onClick={refresh}><RefreshCw size={16} /> Reintentar</button></div> : (
                <div className="management-tabpanel">
                    <div className="management-panel-title"><ActiveIcon size={20} /><h2>{activePanel?.label}</h2></div>
                    {section === "pagos" && <PaymentPanel clients={data.clients} payments={data.payments} memberships={data.memberships} turnos={turnos} onChanged={refreshQuietly} />}
                    {section === "gym" && <GymPanel clients={data.clients} memberships={data.memberships} attendances={data.attendances} onChanged={refreshQuietly} />}
                    {section === "torneos" && <TournamentsPanel tournaments={data.tournaments} onChanged={refreshQuietly} />}
                    {section === "usuarios" && user.rol === "admin" && <UsersPanel />}
                    {section === "pagos" && turnosLoading && <p className="form-hint light-hint">Cargando turnos para asociar pagos...</p>}
                </div>
            )}
        </div>
    );
}
