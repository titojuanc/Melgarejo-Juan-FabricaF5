import { Link } from "react-router-dom";
import {
    ArrowRight,
    CalendarDays,
    Dumbbell,
    Trophy,
    PartyPopper,
} from "lucide-react";
import { useTurnos } from "../components/TurnosProvider.jsx";
import canchaImage from "../assets/cancha.jpg";

const sections = [
    { path: "/", title: "Cancha de futbol 5", Icon: CalendarDays },
    { path: "/gym", title: "Gimnasio", Icon: Dumbbell },
    { path: "/cumpleanos", title: "Cumpleanos", Icon: PartyPopper },
    { path: "/torneos", title: "Torneos", Icon: Trophy },
];

export default function HomePage() {
    const { turnos, loading, error } = useTurnos();
    return (
        <div className="page-container">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">FUTBOL · ENCUENTROS · EQUIPO</p>
                    <h1>LA FABRICA FUTBOL 5</h1>
                    <p>El proximo partido empieza aca.</p>
                </div>
            </div>
            <section className="home-feature">
                <div>
                    <CalendarDays size={36} />
                    <h2>Tu equipo tiene lugar.</h2>
                    <p>
                        {loading
                            ? "Consultando reservas..."
                            : error
                              ? "Disponibilidad no disponible."
                              : `${turnos.filter((turno) => turno.estado !== "Cancelado").length} turnos registrados en la cancha.`}
                    </p>
                    <Link className="button primary" to="/">
                        Reservar cancha <ArrowRight size={18} />
                    </Link>
                </div>
                <img
                    src={canchaImage}
                    alt="Vista de referencia de un estadio de futbol con cancha de cesped"
                />
                <span className="photo-caption">Imagen de referencia</span>
            </section>
            <section className="service-links" aria-label="Servicios">
                {sections.map(({ path, title, Icon }) => (
                    <Link to={path} key={path}>
                        <Icon size={23} />
                        <h2>{title}</h2>
                        <ArrowRight size={19} />
                    </Link>
                ))}
            </section>
        </div>
    );
}
