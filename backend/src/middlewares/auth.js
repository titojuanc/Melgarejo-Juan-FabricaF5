import { ForbiddenError, UnauthorizedError } from "../exceptions/AppError.js";
import { frontendOrigins } from "../config/auth.js";
import authService from "../services/AuthService.js";

export function requireTrustedOrigin(req, res, next) {
    if (!frontendOrigins.includes(req.get("Origin")))
        return next(
            new ForbiddenError("El origen de la solicitud no esta permitido.")
        );
    next();
}

export function authenticationMiddleware(service = authService) {
    return (req, res, next) => {
        try {
            if (!req.session?.userId) throw new UnauthorizedError();
            req.user = service.getSessionUser(req.session.userId);
            next();
        } catch (error) {
            next(error);
        }
    };
}

export const requireAuthentication = authenticationMiddleware();

export function requireRoles(...roles) {
    return (req, res, next) => {
        if (!req.user) return next(new UnauthorizedError());
        if (!roles.includes(req.user.rol)) return next(new ForbiddenError());
        next();
    };
}
