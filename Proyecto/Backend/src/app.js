import express from "express";
import routes from "./routes/index.js";
import { errorHandler, routeNotFoundHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(express.json());
app.use(routes);

app.use(routeNotFoundHandler);
app.use(errorHandler);

export default app;
