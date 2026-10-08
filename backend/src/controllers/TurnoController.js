import turnoService from "../services/TurnoService.js";
import { successResponse } from "../responses/ApiResponse.js";
import { Messages } from "../enums/Messages.js";

export class TurnoController {
    constructor(service = turnoService) {
        this.service = service;
    }

    getAll(req, res, next) {
        try {
            const turnos = this.service.getAll();
            return successResponse(res, turnos);
        } catch (error) {
            next(error);
        }
    }

    getAvailability(req, res, next) {
        try {
            return successResponse(res, this.service.getAvailability());
        } catch (error) {
            next(error);
        }
    }

    getMine(req, res, next) {
        try {
            return successResponse(res, this.service.getMine(req.user.clienteId));
        } catch (error) {
            next(error);
        }
    }

    getById(req, res, next) {
        try {
            const id = Number(req.params.id);
            const turno = this.service.getById(id);
            return successResponse(res, turno);
        } catch (error) {
            next(error);
        }
    }

    create(req, res, next) {
        try {
            const turno = this.service.create(req.body, req.user);
            return successResponse(res, turno, 201);
        } catch (error) {
            next(error);
        }
    }

    update(req, res, next) {
        try {
            const id = Number(req.params.id);
            const turno = this.service.update(id, req.body);
            return successResponse(res, turno);
        } catch (error) {
            next(error);
        }
    }

    confirm(req, res, next) {
        try {
            const id = Number(req.params.id);
            return successResponse(res, this.service.confirm(id));
        } catch (error) {
            next(error);
        }
    }

    cancel(req, res, next) {
        try {
            const id = Number(req.params.id);
            return successResponse(res, this.service.cancel(id));
        } catch (error) {
            next(error);
        }
    }

    delete(req, res, next) {
        try {
            const id = Number(req.params.id);
            this.service.delete(id);
            return successResponse(res, { message: Messages.TURNO_DELETED });
        } catch (error) {
            next(error);
        }
    }
}

export default new TurnoController();
