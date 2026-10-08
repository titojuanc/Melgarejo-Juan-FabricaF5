import { Router } from "express";
import { authenticationMiddleware, requireRoles, requireTrustedOrigin } from "../middlewares/auth.js";
import authService from "../services/AuthService.js";
import operationsService from "../services/OperationsService.js";
import publicInfoService from "../services/PublicInfoService.js";

export function createPublicInfoRoutes(
    service = publicInfoService,
    auth = authService,
    operations = operationsService,
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
                res.json({
                    success: true,
                    data: service.createBirthdayInquiry(req.body, req.user),
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