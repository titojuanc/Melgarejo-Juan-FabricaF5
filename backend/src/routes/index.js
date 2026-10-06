import { Router } from "express";
import turnoRoutes from "./turnoRoutes.js";

const router = Router();

router.use("/turnos", turnoRoutes);

export default router;
