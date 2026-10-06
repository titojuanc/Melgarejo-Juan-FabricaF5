import { ChevronLeft, ChevronRight, Sun, Moon } from "lucide-react";
import {
    dateKey,
    weekDates,
    HORARIOS,
    endTime,
    isOccupied,
} from "../utils/turnos.js";

export default function WeekCalendar({
    anchor,
    onWeekChange,
    turnos,
    selected,
    onSelect,
}) {
    const days = weekDates(anchor);
    const today = dateKey(new Date());
    function moveWeek(amount) {
        const date = new Date(`${anchor}T12:00:00`);
        date.setDate(date.getDate() + amount * 7);
        onWeekChange(dateKey(date));
    }
    return (
        <section
            className="calendar-section"
            aria-label="Disponibilidad semanal"
        >
            <div className="calendar-toolbar">
                <div>
                    <h2>Horarios de la semana</h2>
                    <p>
                        {new Intl.DateTimeFormat("es-AR", {
                            month: "long",
                            year: "numeric",
                        }).format(days[0])}
                    </p>
                </div>
                <div className="calendar-navigation">
                    <button
                        className="icon-button"
                        title="Semana anterior"
                        aria-label="Semana anterior"
                        disabled={dateKey(days[0]) <= today}
                        onClick={() => moveWeek(-1)}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        className="button today-button"
                        onClick={() => onWeekChange(today)}
                    >
                        Hoy
                    </button>
                    <button
                        className="icon-button"
                        title="Semana siguiente"
                        aria-label="Semana siguiente"
                        onClick={() => moveWeek(1)}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
            <div
                className="calendar-scroll"
                tabIndex={0}
                role="region"
                aria-label="Grilla de horarios"
            >
                <table className="week-calendar">
                    <caption className="sr-only">
                        Disponibilidad de cancha, de lunes a domingo
                    </caption>
                    <thead>
                        <tr>
                            <th scope="col">
                                <span className="sr-only">Hora</span>
                            </th>
                            {days.map((date) => (
                                <th
                                    scope="col"
                                    key={dateKey(date)}
                                    className={
                                        dateKey(date) === today ? "today" : ""
                                    }
                                >
                                    <span>
                                        {new Intl.DateTimeFormat("es-AR", {
                                            weekday: "short",
                                        })
                                            .format(date)
                                            .replace(".", "")}
                                    </span>
                                    <strong>
                                        {String(date.getDate()).padStart(
                                            2,
                                            "0",
                                        )}
                                        /
                                        {String(date.getMonth() + 1).padStart(
                                            2,
                                            "0",
                                        )}
                                    </strong>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {HORARIOS.map((hora) => (
                            <tr key={hora}>
                                <th scope="row">
                                    <span
                                        className="hour-icon"
                                        aria-hidden="true"
                                    >
                                        {hora < "20:00" ? (
                                            <Sun size={13} />
                                        ) : (
                                            <Moon size={13} />
                                        )}
                                    </span>
                                    {hora}
                                </th>
                                {days.map((date) => {
                                    const fecha = dateKey(date);
                                    const occupied = isOccupied(
                                        turnos,
                                        fecha,
                                        hora,
                                        endTime(hora),
                                    );
                                    const past =
                                        new Date(`${fecha}T${hora}:00`) <=
                                        new Date();
                                    const active =
                                        selected?.fecha === fecha &&
                                        selected?.horaInicio === hora;
                                    return (
                                        <td key={fecha}>
                                            <button
                                                className={`time-slot ${active ? "selected" : ""}`}
                                                disabled={occupied || past}
                                                aria-pressed={active}
                                                aria-label={`${fecha}, ${hora}, ${past ? "horario pasado" : occupied ? "ocupado" : "disponible"}`}
                                                title={
                                                    past
                                                        ? "Horario pasado"
                                                        : occupied
                                                          ? "Ocupado"
                                                          : `${hora} a ${endTime(hora)}`
                                                }
                                                onClick={() =>
                                                    onSelect({
                                                        fecha,
                                                        horaInicio: hora,
                                                        horaFin: endTime(hora),
                                                    })
                                                }
                                            >
                                                {active
                                                    ? "Elegido"
                                                    : occupied
                                                      ? "Ocupado"
                                                      : past
                                                        ? "Pasado"
                                                        : "Libre"}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="calendar-legend">
                <span>
                    <i className="available" />
                    Disponible
                </span>
                <span>
                    <i className="unavailable" />
                    No disponible
                </span>
                <span>
                    <i className="chosen" />
                    Tu seleccion
                </span>
            </div>
        </section>
    );
}
