import turnoService from "../services/TurnoService.js";
import { successResponse } from "../responses/ApiResponse.js";
import { Messages } from "../enums/Messages.js";

class TurnoController {
    getAll(req, res, next) {
        try {
            const turnos = turnoService.getAll();
            return successResponse(res, turnos);
        } catch (error) {
            next(error);
        }
    }

    getById(req, res, next) {
        try {
            const id = Number(req.params.id);
            const turno = turnoService.getById(id);
            return successResponse(res, turno);
        } catch (error) {
            next(error);
        }
    }

    create(req, res, next) {
        try {
            const turno = turnoService.create(req.body);
            return successResponse(res, turno, 201);
        } catch (error) {
            next(error);
        }
    }

    update(req, res, next) {
        try {
            const id = Number(req.params.id);
            const turno = turnoService.update(id, req.body);
            return successResponse(res, turno);
        } catch (error) {
            next(error);
        }
    }

    delete(req, res, next) {
        try {
            const id = Number(req.params.id);
            turnoService.delete(id);
            return successResponse(res, { message: Messages.TURNO_DELETED });
        } catch (error) {
            next(error);
        }
    }
}

export default new TurnoController();
