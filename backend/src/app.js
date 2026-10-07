import express from "express";
import cors from "cors";
import session from "express-session";
import { createRoutes } from "./routes/index.js";
import {
    errorHandler,
    routeNotFoundHandler
} from "./middlewares/errorHandler.js";
import {
    frontendOrigins,
    getSessionSecret,
    sessionCookieName,
    sessionCookieOptions
} from "./config/auth.js";
import { createAuthRoutes } from "./routes/authRoutes.js";
import authService from "./services/AuthService.js";
import { TurnoService } from "./services/TurnoService.js";
import turnoService from "./services/TurnoService.js";

export function createApp({
    auth = authService,
    turnos,
    authLimit = 20,
    sessionSecret = getSessionSecret()
} = {}) {
    const turnoApi =
        turnos ||
        (auth === authService
            ? turnoService
            : new TurnoService(undefined, auth));
    const app = express();
    app.disable("x-powered-by");
    app.use(cors({ origin: frontendOrigins, credentials: true }));
    app.use(express.json({ limit: "16kb" }));
    app.use(
        session({
            name: sessionCookieName,
            secret: sessionSecret,
            resave: false,
            saveUninitialized: false,
            cookie: { ...sessionCookieOptions }
        })
    );
    app.use("/auth", createAuthRoutes(auth, authLimit));
    app.use(createRoutes(turnoApi, auth));

    app.use(routeNotFoundHandler);
    app.use(errorHandler);
    return app;
}

export default createApp();
