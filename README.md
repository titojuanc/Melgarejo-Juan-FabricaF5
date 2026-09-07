# La Fábrica Fútbol 5

## Entrega 1 - Diseño del dominio y organización del proyecto

### Descripción

Sistema de gestión para La Fábrica Fútbol 5, orientado a la
gestión de turnos de cancha, membresías de gimnasio,
eventos y torneos.

## Estructura

Proyecto/
├── Frontend/
└── Backend/
    └── src/
        └── models/

## Entidades

- Usuario
- Cliente
- Turno
- Pago
- Membresía
- Evento
- Torneo
- Equipo

## Estados de Turno

Pendiente → Confirmado → En curso → Finalizado

Pendiente → Cancelado
Confirmado → Cancelado

## Alcance de esta entrega

Esta entrega se limita a la representación del dominio.
No se implementa lógica de negocio, persistencia de datos,
base de datos ni Express.