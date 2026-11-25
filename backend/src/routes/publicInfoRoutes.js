import { Router } from "express";
import { authenticationMiddleware, requireRoles, requireTrustedOrigin } from "../middlewares/auth.js";
import authService from "../services/AuthService.js";
import operationsService from "../services/OperationsService.js";
import cumpleanosService from "../services/CumpleanosService.js";
import publicInfoService from "../services/PublicInfoService.js";

export function createPublicInfoRoutes(
    service = publicInfoService,
    auth = authService,
    operations = operationsService,
    birthdays = cumpleanosService,
) {
    const router = Router();
    const authenticate = authenticationMiddleware(auth);

    router.get("/gym", (req, res, next) => {
        try {
            res.json({ success: true, data: service.getGym() });
        } catch (error) {
            next(error);
        }
    });
    router.get("/cumpleanos/paquetes", (req, res, next) => {
        try {
            res.json({ success: true, data: service.getBirthdayPackages() });
        } catch (error) {
            next(error);
        }
    });
    router.post(
        "/cumpleanos/consultas",
        requireTrustedOrigin,
        authenticate,
        requireRoles("cliente"),
        (req, res, next) => {
            try {
                res.status(201).json({
                    success: true,
                    data: birthdays.create(req.body, req.user),
                });
            } catch (error) {
                next(error);
            }
        },
    );
    router.get(
        "/cumpleanos/mis",
        authenticate,
        requireRoles("cliente"),
        (req, res, next) => {
            try {
                res.json({
                    success: true,
                    data: birthdays.getMine(req.user.clienteId),
                });
            } catch (error) {
                next(error);
            }
        },
    );
    router.get("/torneos", (req, res, next) => {
        try {
            res.json({
                success: true,
                data: [...service.getTournaments(), ...operations.getPublicTournaments()],
            });
        } catch (error) {
            next(error);
        }
    });
    router.get("/torneos/:id", (req, res, next) => {
        try {
            const data = String(req.params.id).startsWith("operativo-")
                ? operations.getPublicTournament(
                      Number(String(req.params.id).slice("operativo-".length)),
                  )
                : service.getTournament(req.params.id);
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    });

    return router;
}