# Entrega 5

## Objetivo

Completar el desarrollo del sistema correspondiente al negocio elegido, integrando el frontend y el backend para que todas las funcionalidades principales de la aplicación funcionen correctamente.

En esta entrega deberán implementar la lógica de negocio necesaria para que el sistema pueda utilizarse de principio a fin.

El objetivo no es volver a desarrollar lo realizado en las entregas anteriores, sino completar las funcionalidades pendientes y lograr que la aplicación funcione como un sistema completo.

Cada proyecto deberá resolver las necesidades particulares del negocio seleccionado.

## Parte 1 — Implementación de la lógica de negocio

Completar las funcionalidades del backend que sean necesarias para el funcionamiento del sistema.

En la Entrega 2 se solicitó implementar únicamente un CRUD de una entidad principal. En esta entrega deberán desarrollar las operaciones restantes que permitan resolver las necesidades del negocio.

Ejemplos (orientativos):

**Sistema de reserva de canchas**
- Registrar usuarios.
- Iniciar sesión.
- Consultar canchas disponibles.
- Consultar horarios disponibles.
- Realizar una reserva.
- Consultar las reservas realizadas.
- Cancelar una reserva.
- Evitar reservas duplicadas para una misma cancha y horario.

**Sistema de turnos**
- Registrar clientes.
- Consultar servicios disponibles.
- Consultar horarios.
- Solicitar un turno.
- Modificar o cancelar un turno.
- Evitar turnos superpuestos.

**Sistema de venta de productos**
- Consultar productos.
- Agregar productos a un carrito.
- Modificar cantidades.
- Confirmar una compra.
- Consultar las compras realizadas.
- Actualizar el stock cuando corresponda.

Cada alumno deberá implementar las funcionalidades correspondientes a su propio proyecto. No será necesario desarrollar funcionalidades que no tengan relación con el negocio elegido.

### Arquitectura

Mantener la arquitectura de la Entrega 2, respetando la separación de responsabilidades entre:

- Routes.
- Controllers.
- Services.
- Repositories.
- Models.
- Middlewares.
- Exceptions.
- Responses.

La lógica de negocio deberá implementarse en la capa correspondiente, evitando colocar todas las operaciones dentro de los controladores. También deberán conservar el manejo centralizado de errores y el formato consistente de las respuestas HTTP.

## Parte 2 — Integración completa entre frontend y backend

Todas las funcionalidades principales del sistema deberán poder utilizarse desde la interfaz desarrollada en React.

No será suficiente que una operación funcione únicamente mediante una petición realizada desde Postman o herramientas similares. El usuario deberá poder realizar las operaciones correspondientes directamente desde la aplicación.

Ejemplo en un sistema de reservas:

1. El usuario ingresa a la aplicación.
2. Inicia sesión.
3. Consulta las canchas disponibles.
4. Selecciona una cancha.
5. Consulta los horarios disponibles.
6. Realiza una reserva.
7. Recibe una confirmación.
8. Puede consultar o cancelar su reserva.

Todo este proceso deberá funcionar correctamente mediante la comunicación entre el frontend y el backend.

### Requisitos

- Las operaciones deberán consumir los endpoints correspondientes.
- Las peticiones HTTP deberán continuar centralizadas en `frontend/src/services`.
- La información mostrada deberá provenir del backend.
- Los formularios deberán enviar y procesar correctamente los datos.
- Las acciones realizadas deberán reflejarse en la interfaz.
- Se deberán mostrar mensajes de éxito y error cuando corresponda.
- No deberán existir botones o funcionalidades principales que solamente simulen una operación.

## Parte 3 — Validaciones y reglas de negocio

El sistema deberá contemplar las validaciones necesarias para evitar operaciones incorrectas. Estas validaciones deberán implementarse principalmente en el backend, sin depender únicamente de las comprobaciones del frontend.

Ejemplos:

- No permitir registros con datos obligatorios faltantes.
- Evitar registros duplicados cuando corresponda.
- No permitir reservar horarios que ya se encuentran ocupados.
- No permitir comprar cantidades superiores al stock disponible.
- Impedir operaciones sobre registros inexistentes.
- Validar que los datos recibidos tengan el formato esperado.

Cada alumno deberá identificar e implementar las reglas de negocio de su aplicación. Los errores deberán manejarse utilizando la estructura desarrollada en las entregas anteriores.

## Parte 4 — Funcionamiento general del sistema

El proyecto deberá estar completamente integrado y permitir recorrer sus funcionalidades principales sin errores.

Verificar que:

- El frontend y el backend se ejecuten correctamente.
- Las distintas pantallas permitan navegar por la aplicación.
- Los formularios funcionen correctamente.
- Las operaciones realizadas se reflejen en el sistema.
- Las funcionalidades estén conectadas entre sí.
- Los mensajes de error sean claros.
- No existan funcionalidades principales incompletas.

Mantener la organización del código y las buenas prácticas trabajadas durante las entregas anteriores.

**Importante:** si ya se desarrolló parte de estas funcionalidades en entregas anteriores, no volver a implementarlas. Verificar su correcto funcionamiento y completar únicamente lo pendiente.

## Parte 5 — Entrega de video en defensa del proyecto

Video de entre 5 y 10 minutos, en formato mp4, adjunto en la tarea de Teams.

Demostración técnica completa del sistema (Web + Front + Back), enfocada en uno de los flujos funcionales implementados (a elección del alumno). Se espera que se detalle:

- La implementación del flujo en el Back-End.
- La implementación del flujo en el Front-End.
- El recorrido completo del flujo dentro de la interfaz gráfica.

## Criterios de evaluación

- Implementación de las funcionalidades principales del negocio.
- Correcta aplicación de las reglas de negocio.
- Integración completa entre frontend y backend.
- Funcionamiento de las operaciones desde la interfaz.
- Separación de responsabilidades y respeto por la arquitectura MVC.
- Validaciones realizadas desde el backend.
- Manejo adecuado de errores.
- Comunicación correcta con la API.
- Coherencia entre las distintas funcionalidades.
- Funcionamiento general del sistema.
- Código claro, ordenado y correctamente indentado.
- Demostración de un caso de uso completo.

---

# Plan de trabajo — Parte 1 (lógica de negocio en backend)

Estado revisado el 3 de noviembre de 2026.

## Estado actual del backend (ya implementado, no rehacer)

| Área | Estado |
| --- | --- |
| Arquitectura en capas (routes/controllers/services/repositories/models/middlewares/exceptions/responses) | Hecha. `ApiResponse` + `errorHandler` centralizados. |
| Auth: registro público (solo clientes), login, logout, `/auth/me`, alta de staff por admin | Hecha, con roles, sesión, rate-limit y origen confiable. Persiste en `data/auth.json`. |
| Turnos (reservas de cancha): crear, disponibilidad pública, "mis turnos", listar, ver, reprogramar, confirmar, cancelar, eliminar | Hecha. Evita superposición (`ensureAvailable`). |
| Operaciones internas (`/interno`): clientes, pagos, membresías de gym, asistencias, torneos (equipos, fixture, partidos, resultados) | Hecha. Persiste en `data/operations.json`. |
| Info pública: gym, paquetes de cumpleaños, torneos | Hecha (datos estáticos + torneos operativos). |

## Brechas detectadas (pendiente para esta entrega)

1. **Turnos en memoria**: `TurnoRepository` guarda en un array; se pierden al reiniciar y los pagos quedan huérfanos. Persistir en JSON como los otros repositorios.
2. **El cliente no puede cancelar su propio turno**: `POST /turnos/:id/cancelar` es solo empleado/admin. Falta cancelación propia con validación de pertenencia y de anticipación.
3. **Cumpleaños simulado**: `createBirthdayInquiry` no persiste ni bloquea la cancha (la respuesta dice "Consulta simulada"). La consigna prohíbe funcionalidades que solo simulen.
4. **Cumpleaños no ocupa la cancha**: `ensureAvailable` solo mira turnos; debe considerar también las reservas de cumpleaños confirmadas.
5. **Cancha única implícita**: no hay entidad cancha; confirmar si el negocio tiene una o varias (afecta disponibilidad).
6. **Horarios disponibles**: `/turnos/disponibilidad` devuelve los turnos ocupados, no franjas libres. Agregar cálculo de franjas libres por fecha (horario de apertura, duración).
7. **Validaciones a revisar**: fechas pasadas, horario de atención, duración mínima/máxima, límite de jugadores, duplicados de email/teléfono en registro.
8. **Tests**: faltan tests de cancelación propia, persistencia de turnos, cumpleaños y franjas libres.

## Pasos propuestos (uno por commit, con tests)

1. **Persistencia de turnos**: `TurnoRepository` lee/escribe `data/turnos.json` (patrón de `OperationsRepository`: escritura atómica, seed vacío). Tests de repositorio.
2. **Franjas disponibles**: `TurnoService.getAvailableSlots(fecha)` + `GET /turnos/disponibilidad?fecha=`; reglas de horario de atención y fechas pasadas en `validateTurno.js`.
3. **Cancelación por el cliente**: `POST /turnos/:id/cancelar` habilitado para `cliente` (solo si es suyo, estado cancelable y con anticipación mínima); errores con `ForbiddenError`/`ConflictError`. Tests de servicio y rutas.
4. **Reservas de cumpleaños reales**: modelo `Cumpleanos`, repositorio JSON, `PublicInfoService` → servicio propio; crear (cliente), listar "mis cumpleaños", confirmar/cancelar (empleado). Estado inicial "Pendiente" sin bloqueo; al confirmar, bloquea la cancha.
5. **Disponibilidad unificada**: `ensureAvailable` considera turnos y cumpleaños confirmados (mismo recurso físico). Tests de conflicto cruzado.
6. **Revisión de validaciones y mensajes**: duplicados en registro, formatos, registros inexistentes; mensajes en `Messages.js`. 
7. **Cierre**: `npm test` en backend, actualizar `backend/README.md` con los endpoints nuevos.

## Decisiones confirmadas por el usuario

- Hay **una sola cancha**.
- Cada turno dura **exactamente 1 hora**.
- El cliente puede cancelar sin cargo con **hasta 12 h de anticipación**. Con menos anticipación **se le cobra igual**: la cancelación tardía se permite pero queda marcada (ej. `cancelacionTardia: true`) y genera un cargo pendiente para registrar en pagos.
- Las consultas de cumpleaños **requieren confirmación del empleado**; al confirmarse bloquean la cancha.

- Horario de atención: **de 12:00 a 22:00**. Las franjas libres son 10 bloques de 1 hora (12-13 ... 21-22); ningún turno puede terminar después de las 22:00.

### Impacto en el plan

- Paso 2: las franjas libres son bloques de 1 hora; `validateTurno.js` debe exigir `horaFin = horaInicio + 1 h`.
- Paso 3: la cancelación del cliente nunca se bloquea por anticipación; si faltan menos de 12 h se registra el cargo.
- Paso 4 y 5: cumpleaños (2 o 3 h) ocupa varias franjas consecutivas de la única cancha.

## Después de la Parte 1

Partes 2–5: conectar la UI (`frontend/src/services` + páginas) a los endpoints nuevos, validar flujo completo, y grabar el video sobre un flujo (propuesta: reserva de cancha cliente → confirmación del empleado).
