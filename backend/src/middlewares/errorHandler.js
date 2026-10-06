import AppError, { NotFoundError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { errorResponse } from "../responses/ApiResponse.js";

export const routeNotFoundHandler = (req, res, next) => {
    next(new NotFoundError(Messages.ROUTE_NOT_FOUND));
};

export const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        return errorResponse(res, err.message, err.statusCode);
    }
    if (err.type === "entity.parse.failed") {
        return errorResponse(
            res,
            "El cuerpo de la solicitud debe ser JSON valido.",
            400
        );
    }
    if (err.type === "entity.too.large") {
        return errorResponse(
            res,
            "La solicitud supera el tamano permitido.",
            413
        );
    }
    console.error(err);
    return errorResponse(res, Messages.INTERNAL_SERVER_ERROR, 500);
};
