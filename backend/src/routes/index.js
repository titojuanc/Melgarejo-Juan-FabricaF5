import { Router } from "express";
import { createTurnoRoutes } from "./turnoRoutes.js";
import turnoService from "../services/TurnoService.js";
import authService from "../services/AuthService.js";

export function createRoutes(turnos = turnoService, auth = authService) {
	const router = Router();
	router.use("/turnos", createTurnoRoutes(turnos, auth));
	return router;
}

export default createRoutes();
