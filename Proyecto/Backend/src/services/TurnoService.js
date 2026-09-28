import turnoRepository from "../repositories/TurnoRepository.js";
import { validateTurnoData } from "../utils/validateTurno.js";
import { NotFoundError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";

class TurnoService {
    getAll() {
        return turnoRepository.findAll();
    }

    getById(id) {
        const turno = turnoRepository.findById(id);
        if (!turno) {
            throw new NotFoundError(Messages.TURNO_NOT_FOUND);
        }
        return turno;
    }

    create(data) {
        validateTurnoData(data);
        return turnoRepository.create(data);
    }

    update(id, data) {
        this.getById(id);
        return turnoRepository.update(id, data);
    }

    delete(id) {
        this.getById(id);
        turnoRepository.delete(id);
    }
}

export default new TurnoService();
