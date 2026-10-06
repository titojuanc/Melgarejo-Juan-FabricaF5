import { NavLink } from "react-router-dom";
import { CalendarDays, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
    ["/inicio", "Home"],
    ["/", "Reservar cancha"],
    ["/turnos", "Turnos"],
    ["/gym", "Gym"],
    ["/cumpleanos", "Cumpleanos"],
    ["/torneos", "Torneos"],
    ["/nosotros", "Nosotros"],
];

export default function Layout({ children }) {
    const [open, setOpen] = useState(false);
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
