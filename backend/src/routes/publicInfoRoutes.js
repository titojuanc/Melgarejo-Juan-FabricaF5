import { Router } from "express";
import { authenticationMiddleware, requireRoles, requireTrustedOrigin } from "../middlewares/auth.js";
import authService from "../services/AuthService.js";
import publicInfoService from "../services/PublicInfoService.js";

export function createPublicInfoRoutes(service = publicInfoService, auth = authService) {
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
            res.json({ success: true, data: service.getTournaments() });
        } catch (error) {
            next(error);
        }
    });
    router.get("/torneos/:id", (req, res, next) => {
        try {
            res.json({ success: true, data: service.getTournament(req.params.id) });
        } catch (error) {
            next(error);
        }
    });

    return router;
}