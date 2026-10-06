import express from "express";
import cors from "cors";
import session from "express-session";
import routes from "./routes/index.js";
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

export function createApp({
    auth = authService,
    authLimit = 20,
    sessionSecret = getSessionSecret()
} = {}) {
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
    app.use(routes);

    app.use(routeNotFoundHandler);
    app.use(errorHandler);
    return app;
}

export default createApp();
