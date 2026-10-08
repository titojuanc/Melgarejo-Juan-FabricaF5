import bcrypt from "bcryptjs";
import authRepository from "../repositories/AuthRepository.js";
import {
    BadRequestError,
    ConflictError,
    UnauthorizedError
} from "../exceptions/AppError.js";
import {
    validateEmail,
    validateUsuarioData
} from "../utils/validateUsuario.js";

export class AuthService {
    constructor(repository = authRepository) {
        this.repository = repository;
        this.dummyHash = bcrypt.hashSync("non-user-comparison", 12);
    }

    publicUser(usuario) {
        const {
            id,
            nombre,
            apellido,
            email,
            telefono,
            equipo,
            rol,
            clienteId
        } = usuario;
        return {
            id,
            nombre,
            apellido,
            email,
            telefono,
            equipo,
            rol,
            clienteId
        };
    }

    async create(data, staff = false) {
        const validated = validateUsuarioData(data, staff);
        if (this.repository.findByEmail(validated.email))
            throw new ConflictError("Ya existe una cuenta con ese email.");
        const { password, ...profile } = validated;
        const passwordHash = await bcrypt.hash(password, 12);
        return this.publicUser(
            this.repository.create({ ...profile, passwordHash })
        );
    }

    register(data) {
        return this.create(data);
    }

    createStaff(data) {
        return this.create(data, true);
    }

    async login(data) {
        if (
            !data ||
            typeof data !== "object" ||
            Array.isArray(data) ||
            typeof data.password !== "string" ||
            !data.password ||
            Buffer.byteLength(data.password, "utf8") > 72
        ) {
            throw new BadRequestError("Ingresa tu email y contrasena.");
        }
        const email = validateEmail(data.email);
        const usuario = this.repository.findByEmail(email);
        const matches = await bcrypt.compare(
            data.password,
            usuario?.passwordHash || this.dummyHash
        );
        if (!usuario || !matches)
            throw new UnauthorizedError("Email o contrasena incorrectos.");
        return this.publicUser(usuario);
    }

    getSessionUser(id) {
        const usuario = this.repository.findById(id);
        if (!usuario) throw new UnauthorizedError();
        return this.publicUser(usuario);
    }

    isClientId(id) {
        return Boolean(this.repository.findClientById(id));
    }

    getClients() {
        return this.repository.findAllClients();
    }
}

export default new AuthService();
