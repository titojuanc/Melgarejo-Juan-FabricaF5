import authService from "../services/AuthService.js";

try {
    if (authService.repository.hasAdmin())
        throw new Error(
            "Ya existe un administrador. Las cuentas adicionales se crean mediante POST /auth/users."
        );
    const usuario = await authService.createStaff({
        nombre: process.env.ADMIN_NOMBRE,
        apellido: process.env.ADMIN_APELLIDO,
        telefono: process.env.ADMIN_TELEFONO,
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        rol: "admin"
    });
    console.log(`Primera cuenta administradora creada: ${usuario.email}`);
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
} finally {
    delete process.env.ADMIN_PASSWORD;
}
