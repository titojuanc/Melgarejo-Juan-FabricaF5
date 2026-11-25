import { NotFoundError } from "../exceptions/AppError.js";

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