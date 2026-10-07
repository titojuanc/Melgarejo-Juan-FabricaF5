import { Router } from "express";
import { TurnoController } from "../controllers/TurnoController.js";
import {
	authenticationMiddleware,
	requireRoles,
	requireTrustedOrigin,
} from "../middlewares/auth.js";
import authService from "../services/AuthService.js";
import turnoService from "../services/TurnoService.js";

export function createTurnoRoutes(service = turnoService, auth = authService) {
	const router = Router();
	const controller = new TurnoController(service);
	const authenticate = authenticationMiddleware(auth);

	router.get("/disponibilidad", controller.getAvailability.bind(controller));
	router.get(
		"/mis",
		authenticate,
		requireRoles("cliente"),
		controller.getMine.bind(controller),
	);
	router.get(
		"/",
		authenticate,
		requireRoles("empleado", "admin"),
		controller.getAll.bind(controller),
	);
	router.get(
		"/:id",
		authenticate,
		requireRoles("empleado", "admin"),
		controller.getById.bind(controller),
	);
	router.post(
		"/",
		requireTrustedOrigin,
		authenticate,
		requireRoles("cliente", "empleado", "admin"),
		controller.create.bind(controller),
	);
	router.put(
		"/:id",
		requireTrustedOrigin,
		authenticate,
		requireRoles("empleado", "admin"),
		controller.update.bind(controller),
	);
	router.delete(
		"/:id",
		requireTrustedOrigin,
		authenticate,
		requireRoles("empleado", "admin"),
		controller.delete.bind(controller),
	);

	return router;
}
