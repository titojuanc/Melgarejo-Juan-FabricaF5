# Plan de implementacion — Entrega 5

Actualizado: 22 de noviembre de 2026.

## Objetivo

Completar y verificar el flujo de negocio de La Fabrica Futbol 5 de punta a punta. Se conserva lo ya implementado y se trabaja solo sobre brechas de la Entrega 5: reglas de negocio, persistencia, integracion de la interfaz, validaciones y funcionamiento general.

La consigna de referencia es [Entrega5.md](Entrega5.md). El plan de la etapa anterior queda cerrado en [PlanImplementacion.md](PlanImplementacion.md).

## Criterios de trabajo

- Mantener la arquitectura existente: routes, controllers, services, repositories, models, middlewares, exceptions y responses.
- Centralizar las llamadas HTTP del frontend en `frontend/src/services`.
- Implementar las reglas de negocio principalmente en el backend; no confiar solo en validaciones visuales.
- Hacer cada avance comprobable con pruebas enfocadas; ejecutar pruebas y build pertinentes antes de cerrar la etapa.
- No inventar tarifas, informacion del negocio ni resultados. No presentar una operacion simulada como real.
- Mantener los datos de pruebas aislados y no versionar datos locales, secretos ni dependencias instaladas.

## Contexto confirmado y decisiones vigentes

- El negocio tiene una sola cancha y el horario de atencion es de 12:00 a 22:00.
- Cada turno de cancha dura exactamente una hora: existen diez franjas posibles por dia.
- Un cliente puede cancelar su propio turno. Con 12 horas o mas de anticipacion, no corresponde cargo; con menos de 12 horas, la cancelacion se permite, se marca como tardia y deja un cargo pendiente para registrar en pagos. No bloquear la cancelacion tardia ni inventar un importe.
- Los cumpleanos requieren 48 horas de anticipacion y confirmacion del empleado. Los paquetes ocupan la misma cancha durante dos o tres horas; solo una reserva confirmada bloquea disponibilidad.
- No hay cobro online ni mensajes reales de WhatsApp. Los datos personales no se exponen en endpoints publicos.

## Estado de partida

### Base ya implementada

- Arquitectura backend por capas, autenticacion por roles, registro de clientes y sesion.
- Turnos, reservas propias, disponibilidad publica, gestion interna y prevencion de superposiciones entre turnos.
- Operaciones internas de pagos, membresias, asistencias y torneos; frontend React con servicios HTTP centralizados y paneles por rol.
- Persistencia JSON de turnos implementada en `backend/src/repositories/TurnoRepository.js`, con escritura temporal y reemplazo atomico. El ultimo commit visible es `74d4053` (`Entrega 5 iniciada, persistencia de turnos creada`).

### Brechas por resolver

- Disponibilidad: el endpoint actual expone turnos ocupados, no las franjas libres de una fecha.
- Cancelacion: falta autoservicio del cliente, comprobacion de pertenencia y registro del cargo cuando la cancelacion es tardia.
- Cumpleanos: la consulta es simulada, no se persiste ni puede gestionarse/confirmarse por el personal.
- Disponibilidad unificada: un cumpleanos confirmado debe impedir turnos superpuestos en la cancha compartida.
- Integracion y cierre: conectar las nuevas operaciones a la UI, validar errores y estados visibles, y comprobar los flujos desde navegador.

## Plan por etapas

| Etapa | Estado | Resultado y criterio de aceptacion |
| --- | --- | --- |
| 0. Cerrar Entrega 3 y fijar linea base | Completada | Plan anterior marcado como cerrado; el trabajo activo se registra aqui. Persistencia de turnos ya implementada. |
| 1. Franjas disponibles y reglas de turno | Pendiente | Por fecha futura, devolver solo franjas libres de una hora entre 12:00 y 22:00; validar fecha real, horario y duracion en backend. La interfaz permite seleccionar una franja libre. |
| 2. Cancelacion propia y cargo tardio | Pendiente | El cliente solo cancela sus turnos cancelables; personal conserva sus permisos. A partir de 12 h no se genera cargo; con menos de 12 h se permite cancelar, se marca como tardia y queda registrado el cargo pendiente sin inventar tarifa. |
| 3. Cumpleanos persistentes y gestionables | Pendiente | Cliente crea una solicitud valida; queda pendiente y no bloquea la cancha. El personal puede consultar, confirmar o cancelar. Confirmar persiste el cambio y ocupa 2 o 3 horas segun el paquete. |
| 4. Disponibilidad unificada | Pendiente | Turnos y cumpleanos confirmados comparten la cancha; se rechazan conflictos cruzados en backend, tambien ante solicitudes concurrentes dentro del modelo de persistencia existente. |
| 5. Integracion de interfaz | Pendiente | Formularios y acciones consumen los endpoints desde servicios; estados de carga, error y exito son claros; los datos y transiciones se reflejan en pantalla. |
| 6. Validaciones y documentacion | Pendiente | Revisar campos requeridos, formatos, duplicados pertinentes, fechas, estados y registros inexistentes; actualizar README y contratos afectados. |
| 7. Verificacion integral y defensa | Pendiente | Pasan pruebas backend/frontend y build; recorrer al menos un caso de uso completo; revisar roles, errores, persistencia, navegacion y responsive; grabar el video final de 5–10 minutos en MP4. |

### Orden y dependencias

1. Verificar los tests actuales de persistencia y usarlos como linea base.
2. Completar franjas disponibles y validaciones de turnos.
3. Implementar cancelacion de cliente y cargo tardio.
4. Implementar solicitudes persistentes de cumpleanos y acciones de empleado.
5. Unificar disponibilidad para conflictos turno-cumpleanos; esta etapa depende de que exista el flujo de confirmacion de cumpleanos.
6. Conectar o adaptar pantallas y servicios frontend para las operaciones anteriores.
7. Actualizar documentacion, ejecutar pruebas/build, hacer una pasada manual de flujos y preparar/grabar la defensa.

No se declara una etapa completada hasta que sus criterios se verifiquen. Las decisiones sobre importes o cualquier regla no especificada se consultan antes de implementarse.

## Verificacion final

- `npm --prefix backend test`
- `npm --prefix frontend test`
- `npm --prefix frontend run build`
- Confirmar un flujo cliente desde la interfaz, observar el estado desde el panel del personal y verificar la persistencia tras reiniciar el backend.
- Probar una franja ocupada y un conflicto cruzado con cumpleanos confirmado; verificar errores claros y que no se creen datos incorrectos.
- Comprobar roles, fechas/horarios limite, cancelacion con exactamente 12 horas y con menos de 12 horas, y estados de carga/error/exito.
- Revisar navegacion y pantallas principales en escritorio y movil; actualizar el README y registrar cualquier limitacion que permanezca.

## Guion preliminar para el video de defensa

Duracion objetivo: aproximadamente 7 minutos, dentro del requisito de 5 a 10 minutos. Grabar una vez terminado el flujo y comprobar antes que el entorno de demostracion y los datos sean reproducibles. El caso elegido es reserva de cancha por cliente y confirmacion por empleado, que permite mostrar frontend, backend, roles y recorrido completo.

| Tiempo | Que mostrar | Que explicar |
| --- | --- | --- |
| 0:00–0:30 | Presentacion de la aplicacion y del caso de uso. | La necesidad del negocio y el objetivo: reservar una cancha evitando superposiciones. |
| 0:30–1:30 | Arbol del proyecto y capas backend relevantes. | Routes reciben la peticion; controller delega; service valida reglas; repository persiste; middleware y respuestas manejan acceso y errores. |
| 1:30–2:30 | Codigo del flujo de turnos y sus pruebas. | Validacion de fecha/franja, pertenencia/rol donde corresponda, conflicto de horario y persistencia. Mostrar las pruebas asociadas sin recorrer archivos irrelevantes. |
| 2:30–4:30 | Interfaz: iniciar sesion como cliente, consultar disponibilidad y reservar una franja. | El frontend consume la API desde el servicio centralizado; mostrar validacion, confirmacion y actualizacion visible. |
| 4:30–5:45 | Cambiar al usuario empleado y confirmar la reserva desde gestion. | Explicar el control de permisos y mostrar que el cambio proviene del backend y se refleja en la interfaz. |
| 5:45–6:30 | Verificar disponibilidad/estado actualizado y, si el entorno lo permite, persistencia tras reiniciar. | Mostrar que la franja queda ocupada y que los datos no dependen de una simulacion del navegador. |
| 6:30–7:00 | Cierre y resumen de reglas cubiertas. | Resumir integracion, validacion, persistencia y manejo de roles; mencionar brevemente limitaciones reales si queda alguna. |

### Lista previa a grabar

- Usar cuentas y datos de demostracion preparados localmente, sin exponer contrasenas, tokens ni datos personales reales.
- Probar el recorrido completo una vez y confirmar que las cuentas cliente/empleado y los datos iniciales funcionan.
- Mostrar el codigo y la interfaz del mismo flujo; evitar una demostracion que dependa solo de Postman.
- No afirmar que una funcionalidad esta terminada si no se verifico en el flujo actual.
- Grabar en MP4, revisar audio/legibilidad y duracion, y adjuntar el archivo en la tarea de Teams.

Este guion es una estructura de preparacion; se ajustara al comportamiento real que quede implementado y probado antes de grabar.
