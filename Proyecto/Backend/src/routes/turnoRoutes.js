import { Router } from "express";
import turnoController from "../controllers/TurnoController.js";

const router = Router();

router.get("/", turnoController.getAll);
router.get("/:id", turnoController.getById);
router.post("/", turnoController.create);
router.put("/:id", turnoController.update);
router.delete("/:id", turnoController.delete);

export default router;
