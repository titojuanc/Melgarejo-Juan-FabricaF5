import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ConflictError } from "../exceptions/AppError.js";
import Cliente from "../models/Cliente.js";

export class AuthRepository {
    constructor(
        filePath = process.env.AUTH_DATA_FILE ||
            fileURLToPath(new URL("../../data/auth.json", import.meta.url))
    ) {
        this.filePath = filePath;
        try {
            this.state = JSON.parse(readFileSync(this.filePath, "utf8"));
            if (
                !Array.isArray(this.state.usuarios) ||
                !Array.isArray(this.state.clientes) ||
                !Number.isSafeInteger(this.state.nextUsuarioId) ||
                !Number.isSafeInteger(this.state.nextClienteId)
            ) {
                throw new Error(
                    "El archivo de cuentas no tiene un formato valido."
                );
            }
        } catch (error) {
            if (error.code !== "ENOENT") throw error;
            this.state = {
                usuarios: [],
                clientes: [],
                nextUsuarioId: 1,
                nextClienteId: 1
            };
        }
    }

    findByEmail(email) {
        return this.state.usuarios.find((usuario) => usuario.email === email);
    }

    findById(id) {
        return this.state.usuarios.find((usuario) => usuario.id === id);
    }

    findClientById(id) {
        return this.state.clientes.find((cliente) => cliente.id === id);
    }

    findAllClients() {
        return this.state.clientes.map(({ id, nombre }) => ({ id, nombre }));
    }

    hasAdmin() {
        return this.state.usuarios.some((usuario) => usuario.rol === "admin");
    }

    create(data) {
        if (this.findByEmail(data.email))
            throw new ConflictError("Ya existe una cuenta con ese email.");
        const clienteId =
            data.rol === "cliente" ? this.state.nextClienteId : null;
        const usuario = { ...data, id: this.state.nextUsuarioId, clienteId };
        const cliente =
            clienteId === null
                ? null
                : new Cliente(
                      clienteId,
                      `${data.nombre} ${data.apellido}`,
                      data.telefono,
                      data.email
                  );
        const nextState = {
            usuarios: [...this.state.usuarios, usuario],
            clientes: cliente
                ? [...this.state.clientes, cliente]
                : this.state.clientes,
            nextUsuarioId: this.state.nextUsuarioId + 1,
            nextClienteId: this.state.nextClienteId + (cliente ? 1 : 0)
        };
        mkdirSync(dirname(this.filePath), { recursive: true });
        const temporaryPath = `${this.filePath}.tmp`;
        writeFileSync(temporaryPath, JSON.stringify(nextState, null, 4), {
            mode: 0o600
        });
        renameSync(temporaryPath, this.filePath);
        this.state = nextState;
        return usuario;
    }
}

export default new AuthRepository();
