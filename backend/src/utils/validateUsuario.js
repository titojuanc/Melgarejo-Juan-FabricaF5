import { BadRequestError } from "../exceptions/AppError.js";

function text(value, label, maxLength = 80) {
    if (
        typeof value !== "string" ||
        !value.trim() ||
        value.trim().length > maxLength
    ) {
        throw new BadRequestError(
            `${label} es obligatorio y admite hasta ${maxLength} caracteres.`
        );
    }
    return value.trim();
}

export function validateEmail(value) {
    const email = text(value, "El email", 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new BadRequestError("Ingresa un email valido.");
    }
    return email;
}

export function validatePassword(value) {
    if (
        typeof value !== "string" ||
        value.length < 8 ||
        Buffer.byteLength(value, "utf8") > 72
    ) {
        throw new BadRequestError(
            "La contrasena debe tener al menos 8 caracteres y hasta 72 bytes."
        );
    }
    return value;
}

export function validateUsuarioData(data, staff = false) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new BadRequestError("Los datos de la cuenta no son validos.");
    }
    if (
        staff
            ? !["empleado", "admin"].includes(data.rol)
            : data.rol !== undefined && data.rol !== "cliente"
    ) {
        throw new BadRequestError(
            staff
                ? "El rol debe ser empleado o admin."
                : "El registro publico solo permite cuentas de cliente."
        );
    }
    const telefono = text(data.telefono, "El telefono", 25);
    const digits = telefono.replace(/\D/g, "");
    if (
        !/^[+()\d\s-]+$/.test(telefono) ||
        digits.length < 7 ||
        digits.length > 15
    ) {
        throw new BadRequestError("Ingresa un telefono valido.");
    }
    if (
        data.equipo !== undefined &&
        (typeof data.equipo !== "string" || data.equipo.trim().length > 100)
    ) {
        throw new BadRequestError("El equipo admite hasta 100 caracteres.");
    }
    return {
        nombre: text(data.nombre, "El nombre"),
        apellido: text(data.apellido, "El apellido"),
        email: validateEmail(data.email),
        telefono,
        password: validatePassword(data.password),
        equipo: data.equipo?.trim() || "",
        rol: staff ? data.rol : "cliente"
    };
}
