class Pago {
    constructor(id, monto, fecha, tipo, estado, turnoId, clienteId) {
        this.id = id;
        this.monto = monto;
        this.fecha = fecha;
        this.tipo = tipo;
        this.estado = estado;
        this.turnoId = turnoId;
        this.clienteId = clienteId;
    }
}

export default Pago;