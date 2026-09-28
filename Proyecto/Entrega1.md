# Entrega 1 - Diseño del dominio y organización del proyecto

## 1. Información del proyecto

### 1.1 Negocio
La Fábrica Fútbol 5

### 1.2 Descripción
Breve descripción del sistema.

### 1.3 Objetivo de la entrega
Explicar que esta entrega representa el dominio inicial,
sin implementar funcionalidades, base de datos ni Express.

---

## 2. Organización del repositorio

### 2.1 Estructura

Proyecto/
├── Frontend/
└── Backend/
    └── src/
        └── models/
            ├── Cliente.js
            ├── Empleado.js
            ├── Administrador.js
            ├── Turno.js
            ├── Pago.js
            ├── Membresia.js
            ├── Evento.js
            ├── Torneo.js
            ├── Equipo.js
            └── Usuario.js

### 2.2 Descripción de las carpetas

---

## 3. Análisis del dominio

### 3.1 Entidades identificadas

#### Usuario
Atributos:
- id
- nombre
- email
- telefono
- contraseña
- rol

Métodos:
- ...

#### Cliente
Atributos:
- id
- nombre
- telefono
- email

Métodos:
- ...

#### Turno
Atributos:
- id
- fecha
- horaInicio
- horaFin
- cantidadJugadores
- incluyeLuces
- estado
- clienteId

Métodos:
- ...

#### Pago
...

#### Membresía
...

#### Evento
...

#### Torneo
...

#### Equipo
...

---

## 4. Relaciones entre entidades

- Cliente 1 ─── N Turno
- Cliente 1 ─── N Pago
- Cliente 1 ─── 0..1 Membresía
- Cliente 1 ─── N Evento
- Torneo 1 ─── N Equipo
- Turno 1 ─── 0..N Pago

---

## 5. Diagrama de clases

[Insertar diagrama]

---

## 6. Modelo del dominio en JavaScript

### Cliente.js
Descripción de la clase.

### Turno.js
Descripción de la clase.

...

---

## 7. Estados de Turno

Pendiente → Confirmado → En curso → Finalizado

Pendiente → Cancelado
Confirmado → Cancelado

---

## 8. Reglas de negocio consideradas

- No se pueden superponer turnos.
- Un turno necesita una seña para ser confirmado.
- Los turnos nocturnos pueden tener recargo.
- Una membresía vencida impide utilizar el gimnasio.
- Etc.

> Estas reglas se documentan, pero NO se implementan en esta entrega.