class Pago {
    constructor(id, monto, fecha, tipo, estado, turnoId, membresiaId, clienteId) {
        this.id = id;
        this.monto = monto;
        this.fecha = fecha;
        this.tipo = tipo;
        this.estado = estado;
        this.turnoId = turnoId;
        this.membresiaId = membresiaId;
        this.clienteId = clienteId;
    }
}

export default Pago;