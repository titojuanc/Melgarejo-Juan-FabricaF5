import { NavLink } from "react-router-dom";
import { CalendarDays, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider.jsx";
import { useNotifications } from "./Notifications.jsx";

const links = [
    ["/inicio", "Home"],
    ["/", "Reservar cancha"],
    ["/gym", "Gym"],
    ["/cumpleanos", "Cumpleanos"],
    ["/torneos", "Torneos"],
    ["/nosotros", "Nosotros"],
];

export default function Layout({ children }) {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();
    const { notify } = useNotifications();

    async function signOut() {
        try {
            await logout();
            notify("Sesion cerrada correctamente.");
        } catch (error) {
            notify(error.message, "error");
        }
    }

    return (
        <>
            <a className="skip-link" href="#main-content">
                Saltar al contenido
            </a>
            <header className="site-header">
                <div className="header-inner">
                    <NavLink
                        className="brand"
                        to="/"
                        aria-label="La Fabrica Futbol 5, reservas"
                    >
                        <span className="brand-mark" aria-hidden="true">
                            <CalendarDays size={23} />
                        </span>
                        <span>
                            LA FABRICA <strong>F5</strong>
                        </span>
                    </NavLink>
                    <button
                        className="icon-button mobile-menu"
                        aria-label={open ? "Cerrar menu" : "Abrir menu"}
                        aria-expanded={open}
                        aria-controls="main-nav"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <X /> : <Menu />}
                    </button>
                    <nav
                        id="main-nav"
                        aria-label="Navegacion principal"
                        className={open ? "nav-open" : ""}
                    >
                        {links.map(([path, label]) => (
                            <NavLink
                                key={path}
                                to={path}
                                end
                                onClick={() => setOpen(false)}
                            >
                                {label}
                            </NavLink>
                        ))}
                        {user && (
                            <NavLink to="/turnos" end onClick={() => setOpen(false)}>
                                {user.rol === "cliente"
                                    ? "Mis reservas"
                                    : "Gestionar turnos"}
                            </NavLink>
                        )}
                        {user && ["empleado", "admin"].includes(user.rol) && (
                            <NavLink
                                to="/gestion"
                                onClick={() => setOpen(false)}
                            >
                                Panel interno
                            </NavLink>
                        )}
                        {user ? (
                            <>
                                <Link to="/cuenta" onClick={() => setOpen(false)}>
                                    {user.nombre}
                                </Link>
                                <button className="nav-logout" onClick={signOut}>
                                    <LogOut size={16} /> Cerrar sesion
                                </button>
                            </>
                        ) : (
                            <NavLink to="/cuenta" onClick={() => setOpen(false)}>
                                Ingresar
                            </NavLink>
                        )}
                    </nav>
                </div>
            </header>
            <main id="main-content" tabIndex={-1}>
                {children}
            </main>
            <footer className="site-footer">
                <div className="footer-inner">
                    <strong>La Fabrica Futbol 5</strong>
                    <span>Cancha · Gimnasio · Eventos · Torneos</span>
                    <span>Hecho para compartir el juego.</span>
                </div>
            </footer>
        </>
    );
}
