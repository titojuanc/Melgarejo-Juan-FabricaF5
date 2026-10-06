import Turno from "../models/Turno.js";

class TurnoRepository {
    constructor() {
        this.turnos = [];
        this.nextId = 1;
    }

    findAll() {
        return this.turnos;
    }

    findById(id) {
        return this.turnos.find((turno) => turno.id === id);
    }

    create(data) {
        const turno = new Turno(
            this.nextId++,
            data.fecha,
            data.horaInicio,
            data.horaFin,
            data.cantidadJugadores,
            data.incluyeLuces ?? false,
            "Pendiente",
            data.clienteId
        );
        this.turnos.push(turno);
        return turno;
    }

    update(id, data) {
        const turno = this.findById(id);
        if (!turno) return null;
        Object.assign(turno, data);
        return turno;
    }

    delete(id) {
        const index = this.turnos.findIndex((turno) => turno.id === id);
        if (index === -1) return false;
        this.turnos.splice(index, 1);
        return true;
    }
}

export default new TurnoRepository();
