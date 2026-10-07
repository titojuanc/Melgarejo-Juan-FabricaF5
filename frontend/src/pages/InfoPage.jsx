import { Link } from "react-router-dom";
import { ArrowRight, CircleAlert } from "lucide-react";
import GymPage from "./GymPage.jsx";
import BirthdayPage from "./BirthdayPage.jsx";
import TorneosPage from "./TorneosPage.jsx";
import NosotrosPage from "./NosotrosPage.jsx";

export default function InfoPage({ section }) {
    if (section === "gym") return <GymPage />;
    if (section === "cumpleanos") return <BirthdayPage />;
    if (section === "torneos") return <TorneosPage />;
    if (section === "nosotros") return <NosotrosPage />;

    return (
        <div className="page-container public-page">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">LA FABRICA FUTBOL 5</p>
                    <h1>PÁGINA NO ENCONTRADA</h1>
                    <p>Este enlace no está disponible.</p>
                </div>
            </div>
            <section className="info-section">
                <CircleAlert size={44} />
                <h2>Volvamos a la cancha.</h2>
                <p>La página solicitada no existe.</p>
                <Link className="button primary" to="/">
                    Reservar cancha <ArrowRight size={18} />
                </Link>
            </section>
        </div>
    );
}
