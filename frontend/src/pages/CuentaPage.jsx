import { useId, useState } from "react";
import { ArrowRight, LoaderCircle, LogIn, UserRoundPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider.jsx";
import { useNotifications } from "../components/Notifications.jsx";

function Field({ id, name, label, type = "text", ...props }) {
    return (
        <div className="field">
            <label htmlFor={id}>{label}</label>
            <input id={id} name={name} type={type} required {...props} />
        </div>
    );
}

export default function CuentaPage() {
    const prefix = useId();
    const navigate = useNavigate();
    const { user, loading, login, register } = useAuth();
    const { notify } = useNotifications();
    const [busy, setBusy] = useState(false);

    async function submit(event, action, successMessage) {
        event.preventDefault();
        if (!event.currentTarget.reportValidity()) return;
        const data = Object.fromEntries(new FormData(event.currentTarget));
        setBusy(true);
        try {
            await action(data);
            notify(successMessage);
            navigate("/", { replace: true });
        } catch (error) {
            notify(error.message, "error");
        } finally {
            setBusy(false);
        }
    }

    if (loading) {
        return (
            <div className="page-container account-page" aria-busy="true">
                <p role="status">Recuperando sesion...</p>
            </div>
        );
    }

    if (user) {
        return (
            <section className="page-container account-page">
                <p className="eyebrow">LA FABRICA FUTBOL 5</p>
                <h1>BIENVENIDO, {user.nombre}</h1>
                <p>Tu sesion esta activa.</p>
                <Link className="button primary" to="/">
                    Reservar cancha <ArrowRight size={18} />
                </Link>
            </section>
        );
    }

    const loginId = `${prefix}-login`;
    const registerId = `${prefix}-register`;

    return (
        <section className="page-container account-page">
            <div className="account-forms">
                <section
                    className="account-card login-card"
                    aria-labelledby="login-heading"
                >
                    <p className="eyebrow">TU PROXIMO PARTIDO</p>
                    <h1 id="login-heading">INGRESA A LA CANCHA</h1>
                    <p className="account-intro">Inicia sesion para continuar.</p>
                    <form
                        onSubmit={(event) =>
                            submit(event, login, "Sesion iniciada correctamente.")
                        }
                        aria-busy={busy}
                    >
                        <fieldset disabled={busy}>
                            <Field
                                id={`${loginId}-email`}
                                name="email"
                                label="Email"
                                type="email"
                                autoComplete="email"
                                maxLength={254}
                            />
                            <Field
                                id={`${loginId}-password`}
                                name="password"
                                label="Contrasena"
                                type="password"
                                autoComplete="current-password"
                            />
                        </fieldset>
                        <button className="button primary" type="submit" disabled={busy}>
                            {busy ? (
                                <LoaderCircle className="spin" size={18} />
                            ) : (
                                <LogIn size={18} />
                            )}
                            {busy ? "Ingresando..." : "Entrar"}
                        </button>
                    </form>
                </section>

                <section
                    className="account-card register-card"
                    aria-labelledby="register-heading"
                >
                    <p className="eyebrow">SUMATE AL EQUIPO</p>
                    <h2 id="register-heading">CREA TU CUENTA</h2>
                    <p className="account-intro">
                        Registrate para reservar cancha, anotar tu equipo y mas.
                    </p>
                    <form
                        onSubmit={(event) =>
                            submit(event, register, "Cuenta creada correctamente.")
                        }
                        aria-busy={busy}
                    >
                        <fieldset disabled={busy}>
                            <Field
                                id={`${registerId}-nombre`}
                                name="nombre"
                                label="Nombre"
                                autoComplete="given-name"
                                maxLength={80}
                            />
                            <Field
                                id={`${registerId}-apellido`}
                                name="apellido"
                                label="Apellido"
                                autoComplete="family-name"
                                maxLength={80}
                            />
                            <Field
                                id={`${registerId}-telefono`}
                                name="telefono"
                                label="Telefono"
                                type="tel"
                                autoComplete="tel"
                                maxLength={25}
                            />
                            <Field
                                id={`${registerId}-email`}
                                name="email"
                                label="Email"
                                type="email"
                                autoComplete="email"
                                maxLength={254}
                            />
                            <Field
                                id={`${registerId}-password`}
                                name="password"
                                label="Contrasena"
                                type="password"
                                autoComplete="new-password"
                                minLength={8}
                                maxLength={72}
                            />
                            <Field
                                id={`${registerId}-equipo`}
                                name="equipo"
                                label="Equipo (opcional)"
                                autoComplete="organization"
                                maxLength={100}
                                required={false}
                            />
                        </fieldset>
                        <button
                            className="button account-submit"
                            type="submit"
                            disabled={busy}
                        >
                            {busy ? (
                                <LoaderCircle className="spin" size={18} />
                            ) : (
                                <UserRoundPlus size={18} />
                            )}
                            {busy ? "Creando cuenta..." : "Crear cuenta"}
                        </button>
                    </form>
                </section>
            </div>
        </section>
    );
}