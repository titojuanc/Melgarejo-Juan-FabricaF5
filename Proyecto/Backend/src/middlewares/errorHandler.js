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
    console.error(err);
    return errorResponse(res, Messages.INTERNAL_SERVER_ERROR, 500);
};
