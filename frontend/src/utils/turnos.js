export const HORARIOS = ["18:00", "19:00", "20:00", "21:00", "22:00"];

export function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function weekDates(anchor) {
    const first = new Date(`${anchor}T12:00:00`);
    first.setDate(first.getDate() - ((first.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(first);
        date.setDate(date.getDate() + index);
        return date;
    });
}

export function endTime(start) {
    return `${String(Number(start.slice(0, 2)) + 1).padStart(2, "0")}:00`;
}

export function isOccupied(turnos, fecha, horaInicio, horaFin, excludeId) {
    return turnos.some(
        (turno) =>
            turno.id !== excludeId &&
            turno.estado !== "Cancelado" &&
            turno.fecha === fecha &&
            turno.horaInicio < horaFin &&
            turno.horaFin > horaInicio,
    );
}

export function validateReserva(
    data,
    turnos = [],
    excludeId,
    { requireClientId = true } = {},
) {
    const errors = {};
    const parsedDate = new Date(`${data.fecha}T12:00:00`);
    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(data.fecha) ||
        Number.isNaN(parsedDate.getTime()) ||
        dateKey(parsedDate) !== data.fecha
    )
        errors.fecha = "Selecciona una fecha valida.";
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(data.horaInicio))
        errors.horaInicio = "Indica la hora de inicio.";
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(data.horaFin))
        errors.horaFin = "Indica la hora de fin.";
    if (
        !errors.horaInicio &&
        !errors.horaFin &&
        data.horaFin <= data.horaInicio
    )
        errors.horaFin = "La hora de fin debe ser posterior al inicio.";
    if (
        !errors.fecha &&
        !errors.horaInicio &&
        new Date(`${data.fecha}T${data.horaInicio}:00`) < new Date()
    )
        errors.fecha = "El turno debe comenzar en una fecha y hora futuras.";
    if (
        !Number.isSafeInteger(Number(data.cantidadJugadores)) ||
        Number(data.cantidadJugadores) < 1
    )
        errors.cantidadJugadores =
            "Ingresa una cantidad entera mayor que cero.";
    if (
        requireClientId &&
        !Number.isSafeInteger(Number(data.clienteId)) ||
        requireClientId && Number(data.clienteId) < 1
    )
        errors.clienteId = "Ingresa un ID de cliente entero mayor que cero.";
    if (
        !errors.fecha &&
        !errors.horaInicio &&
        !errors.horaFin &&
        isOccupied(turnos, data.fecha, data.horaInicio, data.horaFin, excludeId)
    )
        errors.horaInicio = "El horario se superpone con otro turno.";
    return errors;
}

export const formatDate = (value) =>
    new Intl.DateTimeFormat("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(`${value}T12:00:00`));
