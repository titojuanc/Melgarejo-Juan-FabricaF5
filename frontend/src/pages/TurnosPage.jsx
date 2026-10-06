import { useState } from "react";
import { Link } from "react-router-dom";
import {
    CalendarDays,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    LoaderCircle,
} from "lucide-react";
import { useTurnos } from "../components/TurnosProvider.jsx";
import { useNotifications } from "../components/Notifications.jsx";
import LoadState from "../components/LoadState.jsx";
import Modal from "../components/Modal.jsx";
import TurnoForm from "../components/TurnoForm.jsx";
import { formatDate } from "../utils/turnos.js";

export default function TurnosPage() {
    const { turnos, loading, error, reload, remove } = useTurnos();
    const { notify } = useNotifications();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [busy, setBusy] = useState(false);
    const filtered = turnos
        .filter(
            (turno) =>
                (!status || turno.estado === status) &&
                `${turno.id} ${turno.clienteId} ${turno.fecha}`.includes(
                    search.trim(),
                ),
        )
        .sort((first, second) =>
            `${first.fecha} ${first.horaInicio}`.localeCompare(
                `${second.fecha} ${second.horaInicio}`,
            ),
        );

    async function confirmDelete() {
        setBusy(true);
        try {
            await remove(deleting.id);
            setDeleting(null);
        } catch (failure) {
            notify(failure.message, "error");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="page-container">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">LA FABRICA FUTBOL 5</p>
                    <h1>TURNOS DE CANCHA</h1>
                    <p>
                        {turnos.length}{" "}
                        {turnos.length === 1
                            ? "reserva registrada"
                            : "reservas registradas"}
                    </p>
                </div>
                <Link className="button primary" to="/">
                    <Plus size={18} /> Nueva reserva
                </Link>
            </div>
            <div className="list-toolbar">
                <div className="search-field">
                    <label className="sr-only" htmlFor="turno-search">
                        Buscar por turno, cliente o fecha
                    </label>
                    <Search size={18} />
                    <input
                        id="turno-search"
                        type="search"
                        placeholder="Turno, cliente o fecha"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>
                <div className="status-filter">
                    <label htmlFor="status-filter">Estado</label>
                    <select
                        id="status-filter"
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                    >
                        <option value="">Todos</option>
                        {[...new Set(turnos.map((turno) => turno.estado))].map(
                            (value) => (
                                <option key={value}>{value}</option>
                            ),
                        )}
                    </select>
                </div>
                <button
                    className="icon-button"
                    title="Actualizar turnos"
                    aria-label="Actualizar turnos"
                    disabled={loading}
                    onClick={() => reload()}
                >
                    <RefreshCw size={19} />
                </button>
            </div>
            <LoadState loading={loading} error={error} retry={() => reload()} />
            {!loading &&
                !error &&
                (filtered.length ? (
                    <div
                        className="records-scroll"
                        tabIndex={0}
                        role="region"
                        aria-label="Listado de turnos"
                    >
                        <table className="records-table">
                            <caption className="sr-only">
                                Turnos registrados
                            </caption>
                            <thead>
                                <tr>
                                    {[
                                        "Turno",
                                        "Fecha",
                                        "Horario",
                                        "Cliente",
                                        "Jugadores",
                                        "Luces",
                                        "Estado",
                                        "Acciones",
                                    ].map((heading) => (
                                        <th scope="col" key={heading}>
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((turno) => (
                                    <tr key={turno.id}>
                                        <th scope="row">#{turno.id}</th>
                                        <td>{formatDate(turno.fecha)}</td>
                                        <td className="nowrap">
                                            {turno.horaInicio} a {turno.horaFin}
                                        </td>
                                        <td>#{turno.clienteId}</td>
                                        <td>{turno.cantidadJugadores}</td>
                                        <td>
                                            {turno.incluyeLuces ? "Si" : "No"}
                                        </td>
                                        <td>
                                            <span
                                                className={`status-badge ${turno.estado === "Cancelado" ? "cancelled" : ""}`}
                                            >
                                                {turno.estado}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="row-actions">
                                                <button
                                                    className="icon-button"
                                                    title={`Editar turno ${turno.id}`}
                                                    aria-label={`Editar turno ${turno.id}`}
                                                    onClick={() =>
                                                        setEditing(turno)
                                                    }
                                                >
                                                    <Pencil size={17} />
                                                </button>
                                                <button
                                                    className="icon-button danger-icon"
                                                    title={`Eliminar turno ${turno.id}`}
                                                    aria-label={`Eliminar turno ${turno.id}`}
                                                    onClick={() =>
                                                        setDeleting(turno)
                                                    }
                                                >
                                                    <Trash2 size={17} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <CalendarDays size={38} />
                        <h2>
                            {turnos.length
                                ? "No hay coincidencias"
                                : "La cancha espera tu equipo"}
                        </h2>
                        <p>
                            {turnos.length
                                ? "No hay turnos para esta busqueda."
                                : "Todavia no hay reservas registradas."}
                        </p>
                        <Link className="button primary" to="/">
                            <Plus size={18} /> Reservar cancha
                        </Link>
                    </div>
                ))}
            {editing && (
                <Modal
                    title={`Editar turno #${editing.id}`}
                    busy={busy}
                    onClose={() => setEditing(null)}
                >
                    <TurnoForm
                        initial={editing}
                        onBusyChange={setBusy}
                        onSaved={() => setEditing(null)}
                    />
                </Modal>
            )}
            {deleting && (
                <Modal
                    title="Eliminar turno"
                    busy={busy}
                    onClose={() => setDeleting(null)}
                >
                    <p>
                        Vas a eliminar el turno #{deleting.id} del{" "}
                        {formatDate(deleting.fecha)}, de {deleting.horaInicio} a{" "}
                        {deleting.horaFin}.
                    </p>
                    <p className="muted">Esta accion no se puede deshacer.</p>
                    <div className="modal-actions">
                        <button
                            className="button secondary"
                            disabled={busy}
                            onClick={() => setDeleting(null)}
                        >
                            Cancelar
                        </button>
                        <button
                            className="button danger"
                            disabled={busy}
                            onClick={confirmDelete}
                        >
                            {busy ? (
                                <LoaderCircle className="spin" size={17} />
                            ) : (
                                <Trash2 size={17} />
                            )}
                            {busy ? "Eliminando..." : "Eliminar turno"}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
