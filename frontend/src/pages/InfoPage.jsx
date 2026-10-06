import { Link } from "react-router-dom";
import {
    ArrowRight,
    Dumbbell,
    PartyPopper,
    Trophy,
    MapPin,
    CircleAlert,
} from "lucide-react";

const sections = {
    gym: {
        title: "GIMNASIO",
        subtitle: "Tu entrenamiento, en La Fabrica.",
        message: "Las reservas de gimnasio todavia no estan disponibles.",
        Icon: Dumbbell,
    },
    cumpleanos: {
        title: "CUMPLEANOS",
        subtitle: "Un festejo con todo el equipo.",
        message: "Las solicitudes de eventos todavia no estan disponibles.",
        Icon: PartyPopper,
    },
    torneos: {
        title: "TORNEOS",
        subtitle: "La competencia se juega en equipo.",
        message:
            "La inscripcion de equipos requiere coordinacion con la administracion. Inscripciones en linea no disponibles.",
        Icon: Trophy,
    },
    nosotros: {
        title: "SOBRE NOSOTROS",
        subtitle: "La Fabrica Futbol 5",
        message:
            "Un espacio para el futbol 5, el gimnasio, los eventos y los torneos.",
        Icon: MapPin,
    },
    notFound: {
        title: "PAGINA NO ENCONTRADA",
        subtitle: "Este enlace no esta disponible.",
        message: "La pagina solicitada no existe.",
        Icon: CircleAlert,
    },
};

export default function InfoPage({ section }) {
    const { title, subtitle, message, Icon } = sections[section];
    return (
        <div className="page-container">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">LA FABRICA FUTBOL 5</p>
                    <h1>{title}</h1>
                    <p>{subtitle}</p>
                </div>
            </div>
            <section className="info-section">
                <Icon size={44} />
                <h2>
                    {section === "nosotros"
                        ? "Nos une el juego."
                        : section === "notFound"
                          ? "Volvamos a la cancha."
                          : "Proximamente"}
                </h2>
                <p>{message}</p>
                <Link className="button primary" to="/">
                    Reservar cancha <ArrowRight size={18} />
                </Link>
            </section>
        </div>
    );
}
