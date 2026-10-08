import { Router } from "express";
import { successResponse } from "../responses/ApiResponse.js";
import {
    authenticationMiddleware,
    requireRoles,
    requireTrustedOrigin,
} from "../middlewares/auth.js";
import authService from "../services/AuthService.js";
import operationsService from "../services/OperationsService.js";

function endpoint(action, status = 200) {
    return (req, res, next) => {
        try {
            return successResponse(res, action(req), status);
        } catch (error) {
            next(error);
        }
    };
}

export function createOperationsRoutes(service = operationsService, auth = authService) {
    const router = Router();
    const authenticate = authenticationMiddleware(auth);
    const staffOnly = [authenticate, requireRoles("empleado", "admin")];
    const staffMutation = [requireTrustedOrigin, ...staffOnly];

    router.get("/clientes", ...staffOnly, endpoint(() => service.listClients()));
    router.get("/pagos", ...staffOnly, endpoint(() => service.listPayments()));
    router.post(
        "/pagos",
        ...staffMutation,
        endpoint((req) => service.registerPayment(req.body), 201),
    );
    router.get(
        "/gym/membresias",
        ...staffOnly,
        endpoint(() => service.listMemberships()),
    );
    router.post(
        "/gym/membresias",
        ...staffMutation,
        endpoint((req) => service.createMembership(req.body), 201),
    );
    router.get(
        "/gym/asistencias",
        ...staffOnly,
        endpoint(() => service.listAttendances()),
    );
    router.post(
        "/gym/asistencias",
        ...staffMutation,
        endpoint((req) => service.registerAttendance(req.body), 201),
    );
    router.get(
        "/torneos",
        ...staffOnly,
        endpoint(() => service.listTournaments()),
    );
    router.post(
        "/torneos",
        ...staffMutation,
        endpoint((req) => service.createTournament(req.body), 201),
    );
    router.get(
        "/torneos/:id",
        ...staffOnly,
        endpoint((req) => service.getTournament(Number(req.params.id))),
    );
    router.post(
        "/torneos/:id/equipos",
        ...staffMutation,
        endpoint(
            (req) => service.addTeam(Number(req.params.id), req.body),
            201,
        ),
    );
    router.post(
        "/torneos/:id/fixture",
        ...staffMutation,
        endpoint(
            (req) => service.generateFixture(Number(req.params.id)),
            201,
        ),
    );
    router.post(
        "/torneos/:id/partidos",
        ...staffMutation,
        endpoint(
            (req) => service.addMatch(Number(req.params.id), req.body),
            201,
        ),
    );
    router.put(
        "/torneos/:id/partidos/:partidoId",
        ...staffMutation,
        endpoint((req) =>
            service.recordMatchResult(
                Number(req.params.id),
                Number(req.params.partidoId),
                req.body,
            ),
        ),
    );

    return router;
}

export default createOperationsRoutes();
