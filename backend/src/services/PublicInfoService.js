import { BadRequestError, NotFoundError } from "../exceptions/AppError.js";

const birthdayPackages = [
    {
        id: "basico",
        nombre: "Basico",
        duracionHoras: 2,
        mesaParaInvitados: true,
        buffetIncluido: false,
        cantidadChicos: 15,
    },
    {
        id: "full",
        nombre: "Full",
        duracionHoras: 2,
        mesaParaInvitados: true,
        buffetIncluido: true,
        cantidadChicos: 20,
    },
    {
        id: "premium",
        nombre: "Premium",
        duracionHoras: 3,
        mesaParaInvitados: true,
        buffetIncluido: true,
        cantidadChicos: 20,
    },
];

const tournaments = [
    {
        id: 1,
        nombre: "Torneo Barrial #1",
        equiposAnotados: 8,
        cupos: 12,
        estado: "Inscripciones abiertas",
        tabla: [],
        partidos: [],
    },
    {
        id: 2,
        nombre: "Torneo Barrial #2",
        equiposAnotados: 12,
        cupos: 12,
        estado: "En Juego",
        tabla: [
            { posicion: 1, equipo: "River Plate", puntos: 18 },
            { posicion: 2, equipo: "Chacarita", puntos: 14 },
            { posicion: 3, equipo: "O'Higgins", puntos: 13 },
            { posicion: 4, equipo: "Real Madrid", puntos: 10 },
        ],
        partidos: [],
    },
    {
        id: 3,
        nombre: "Torneo Barrial #3",
        equiposAnotados: 9,
        cupos: 12,
        estado: "Inscripciones abiertas",
        tabla: [],
        partidos: [],
    },
];

function validDateTime(fecha, horaInicio) {
    if (
        typeof fecha !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(fecha) ||
        typeof horaInicio !== "string" ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(horaInicio)
    ) {
        return null;
    }
    const date = new Date(`${fecha}T${horaInicio}:00`);
    if (
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== fecha
    ) {
        return null;
    }
    return date;
}

export class PublicInfoService {
    getGym() {
        return {
            membresia: { tipo: "Normal", niveles: false },
            reservasDeEntrenamiento: false,
            horariosDestacados: [
                { dia: "Lunes", horaInicio: "08:00", horaFin: "20:00" },
                { dia: "Martes", horaInicio: "08:00", horaFin: "20:00" },
                { dia: "Miercoles", horaInicio: "08:00", horaFin: "20:00" },
                { dia: "Jueves", horaInicio: "18:00", horaFin: "20:00" },
            ],
            horarioCompletoDisponible: false,
            nota: "La imagen de referencia solo muestra horarios destacados.",
        };
    }

    getBirthdayPackages() {
        return structuredClone(birthdayPackages);
    }

    createBirthdayInquiry(data) {
        const birthdayPackage = birthdayPackages.find(
            (item) => item.id === data?.paqueteId,
        );
        const date = validDateTime(data?.fecha, data?.horaInicio);
        if (!birthdayPackage || !date) {
            throw new BadRequestError(
                "Selecciona un paquete, una fecha y una hora validos.",
            );
        }
        if (date.getTime() - Date.now() < 48 * 60 * 60 * 1000) {
            throw new BadRequestError(
                "Las consultas de cumpleaños requieren 48 horas de anticipacion.",
            );
        }
        return {
            mensaje:
                "Consulta simulada. No se confirmo ni se bloqueo la cancha.",
            consulta: {
                paqueteId: birthdayPackage.id,
                fecha: data.fecha,
                horaInicio: data.horaInicio,
                duracionHoras: birthdayPackage.duracionHoras,
                confirmada: false,
                bloqueaCancha: false,
            },
        };
    }

    getTournaments() {
        return structuredClone(tournaments).map(
            ({ tabla, partidos, ...tournament }) => ({
                ...tournament,
                datosDeReferencia: true,
            }),
        );
    }

    getTournament(id) {
        const tournament = tournaments.find((item) => item.id === Number(id));
        if (!tournament) throw new NotFoundError("Torneo no encontrado.");
        return { ...structuredClone(tournament), datosDeReferencia: true };
    }
}

export default new PublicInfoService();