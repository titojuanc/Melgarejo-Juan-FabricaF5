import test from "node:test";
import assert from "node:assert/strict";
import {
    dateKey,
    weekDates,
    HORARIOS,
    isAvailable,
    isOccupied,
    validateReserva,
} from "./turnos.js";

const valid = {
    fecha: "2099-11-09",
    horaInicio: "18:00",
    horaFin: "19:00",
    cantidadJugadores: 10,
    clienteId: 1,
};

test("la semana comienza el lunes sin conversion UTC", () => {
    const days = weekDates("2026-10-06");
    assert.equal(dateKey(days[0]), "2026-10-05");
    assert.equal(dateKey(days[6]), "2026-10-11");
});

test("expone las diez franjas de una hora entre las 12 y las 22", () => {
    assert.equal(HORARIOS.length, 10);
    assert.equal(HORARIOS[0], "12:00");
    assert.equal(HORARIOS[9], "21:00");
    assert.equal(
        isAvailable(
            [{ fecha: valid.fecha, horaInicio: "12:00", horaFin: "13:00" }],
            valid.fecha,
            "12:00",
            "13:00",
        ),
        true,
    );
});

test("detecta superposicion, permite horarios consecutivos e ignora cancelados", () => {
    const turno = { ...valid, id: 1, estado: "Pendiente" };
    assert.equal(isOccupied([turno], valid.fecha, "18:30", "19:30"), true);
    assert.equal(isOccupied([turno], valid.fecha, "19:00", "20:00"), false);
    assert.equal(isOccupied([turno], valid.fecha, "18:00", "19:00", 1), false);
    assert.equal(
        isOccupied(
            [{ ...turno, estado: "Cancelado" }],
            valid.fecha,
            "18:00",
            "19:00",
        ),
        false,
    );
});

test("valida fechas reales, orden de horas, enteros y fechas pasadas", () => {
    assert.deepEqual(validateReserva(valid), {});
    assert.deepEqual(
        validateReserva({
            ...valid,
            horaInicio: "21:00",
            horaFin: "22:00",
        }),
        {},
    );
    assert.ok(validateReserva({ ...valid, fecha: "2099-02-31" }).fecha);
    assert.ok(validateReserva({ ...valid, fecha: "2020-01-01" }).fecha);
    assert.ok(validateReserva({ ...valid, horaFin: "17:00" }).horaFin);
    assert.ok(
        validateReserva({ ...valid, cantidadJugadores: 1.5 }).cantidadJugadores,
    );
    assert.ok(validateReserva({ ...valid, clienteId: "" }).clienteId);
    assert.ok(validateReserva(valid, [{ ...valid, id: 2 }]).horaInicio);
    assert.ok(
        validateReserva({ ...valid, horaInicio: "11:00", horaFin: "12:00" })
            .horaInicio,
    );
    assert.ok(
        validateReserva({ ...valid, horaInicio: "21:00", horaFin: "23:00" })
            .horaFin,
    );
    assert.ok(
        validateReserva({ ...valid, horaInicio: "12:00", horaFin: "14:00" })
            .horaFin,
    );
    assert.ok(
        validateReserva(
            { ...valid, horaInicio: "12:00", horaFin: "13:00" },
            [],
            undefined,
            { availableSlotsOnly: true },
        ).horaInicio,
    );
});

test("no exige clienteId cuando la reserva pertenece a la sesion", () => {
    assert.deepEqual(
        validateReserva(
            { ...valid, clienteId: "" },
            [],
            undefined,
            { requireClientId: false },
        ),
        {},
    );
});
