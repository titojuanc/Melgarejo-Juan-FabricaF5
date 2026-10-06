import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { AuthController } from "../controllers/AuthController.js";
import {
    authenticationMiddleware,
    requireRoles,
    requireTrustedOrigin
} from "../middlewares/auth.js";
import authService from "../services/AuthService.js";
import { errorResponse } from "../responses/ApiResponse.js";

export function createAuthRoutes(service = authService, limit = 20) {
    const router = Router();
    const controller = new AuthController(service);
    const authenticate = authenticationMiddleware(service);
    const attempts = rateLimit({
        windowMs: 15 * 60 * 1000,
        limit,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        handler: (req, res) =>
            errorResponse(
                res,
                "Demasiados intentos. Intenta nuevamente en 15 minutos.",
                429
            )
    });

    router.use((req, res, next) => {
        res.set("Cache-Control", "no-store");
        next();
    });
    router.post("/register", requireTrustedOrigin, attempts, (req, res) =>
        controller.register(req, res)
    );
    router.post("/login", requireTrustedOrigin, attempts, (req, res) =>
        controller.login(req, res)
    );
    router.post("/logout", requireTrustedOrigin, (req, res) =>
        controller.logout(req, res)
    );
    router.get("/me", authenticate, (req, res) => controller.me(req, res));
    router.post(
        "/users",
        requireTrustedOrigin,
        authenticate,
        requireRoles("admin"),
        (req, res) => controller.createStaff(req, res)
    );
    return router;
}
