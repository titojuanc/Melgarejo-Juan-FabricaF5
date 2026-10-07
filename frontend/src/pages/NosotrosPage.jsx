import { ArrowUpRight, MapPin } from "lucide-react";
import canchaImage from "../assets/cancha.jpg";

const mapUrl =
    "https://www.google.com/maps/search/?api=1&query=Ladines+3720%2C+Villa+Devoto%2C+Buenos+Aires";

export default function NosotrosPage() {
    return (
        <div className="page-container public-page about-page">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">VILLA DEVOTO · BUENOS AIRES</p>
                    <h1>SOBRE LA FÁBRICA</h1>
                </div>
            </div>
            <section className="about-intro">
                <figure className="about-photo">
                    <img
                        src={canchaImage}
                        alt="Imagen ilustrativa de una cancha de fútbol"
                    />
                    <figcaption>Imagen ilustrativa; no representa el establecimiento.</figcaption>
                </figure>
                <div className="about-copy">
                    <p className="eyebrow">UN LUGAR PARA ENCONTRARSE</p>
                    <h2>El juego nos reúne.</h2>
                    <p>
                        La Fábrica Fútbol 5 es un espacio de Villa Devoto para
                        juntarse, jugar y compartir. Cancha, gimnasio, cumpleaños
                        y torneos tienen lugar bajo el mismo techo.
                    </p>
                    <p>
                        Vení con tu equipo, organizá un festejo o acercate a
                        entrenar. Nos importa que cada visita se sienta cercana,
                        cómoda y hecha para disfrutar el juego.
                    </p>
                </div>
            </section>
            <section className="location-section" aria-labelledby="location-heading">
                <div className="location-copy">
                    <MapPin size={23} />
                    <p className="eyebrow">CÓMO LLEGAR</p>
                    <h2 id="location-heading">Ladines 3720</h2>
                    <p>Villa Devoto, Buenos Aires, Argentina</p>
                    <a className="button secondary" href={mapUrl} target="_blank" rel="noreferrer">
                        Abrir en Maps <ArrowUpRight size={17} />
                    </a>
                </div>
                <img
                    className="location-photo"
                    src={canchaImage}
                    alt="Vista ilustrativa de un campo deportivo"
                    loading="lazy"
                />
            </section>
        </div>
    );
}