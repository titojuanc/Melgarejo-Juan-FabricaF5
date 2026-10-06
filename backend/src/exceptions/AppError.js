class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
    }
}

export class BadRequestError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}

export class NotFoundError extends AppError {
    constructor(message) {
        super(message, 404);
    }
}

export class ConflictError extends AppError {
    constructor(message) {
        super(message, 409);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = "Necesitas iniciar sesion.") {
        super(message, 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = "No tienes permiso para realizar esta operacion.") {
        super(message, 403);
    }
}

export default AppError;
