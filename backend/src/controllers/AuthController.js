import authService from "../services/AuthService.js";
import { successResponse } from "../responses/ApiResponse.js";
import { sessionCookieName, sessionCookieOptions } from "../config/auth.js";

export class AuthController {
    constructor(service = authService) {
        this.service = service;
    }

    async startSession(req, userId) {
        await new Promise((resolve, reject) =>
            req.session.regenerate((error) =>
                error ? reject(error) : resolve()
            )
        );
        req.session.userId = userId;
        await new Promise((resolve, reject) =>
            req.session.save((error) => (error ? reject(error) : resolve()))
        );
    }

    async register(req, res) {
        const usuario = await this.service.register(req.body);
        await this.startSession(req, usuario.id);
        return successResponse(res, usuario, 201);
    }

    async login(req, res) {
        const usuario = await this.service.login(req.body);
        await this.startSession(req, usuario.id);
        return successResponse(res, usuario);
    }

    async logout(req, res) {
        await new Promise((resolve, reject) =>
            req.session.destroy((error) => (error ? reject(error) : resolve()))
        );
        const { maxAge, ...options } = sessionCookieOptions;
        res.clearCookie(sessionCookieName, options);
        return successResponse(res, {
            message: "Sesion cerrada correctamente."
        });
    }

    me(req, res) {
        return successResponse(res, req.user);
    }

    async createStaff(req, res) {
        const usuario = await this.service.createStaff(req.body);
        return successResponse(res, usuario, 201);
    }
}
