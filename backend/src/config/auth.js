import { randomBytes } from "node:crypto";

export const frontendOrigins = (
    process.env.FRONTEND_ORIGIN ||
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174"
)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
export const sessionCookieName = "fabrica.sid";
export const sessionCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 4 * 60 * 60 * 1000
};

export function getSessionSecret() {
    const secret = process.env.SESSION_SECRET;
    if (secret !== undefined && secret.length < 32)
        throw new Error("SESSION_SECRET debe tener al menos 32 caracteres.");
    if (!secret && process.env.NODE_ENV === "production")
        throw new Error(
            "Configura SESSION_SECRET antes de iniciar en produccion."
        );
    return secret || randomBytes(32).toString("hex");
}
