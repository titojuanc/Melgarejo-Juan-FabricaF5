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
- Los cumpleanos requieren 48 horas de anticipacion y confirmacion del empleado. Los paquetes ocupan la misma cancha durante dos o tres horas; solo una reserva confirmada bloquea disponibilidad. Se rechazan nuevas solicitudes que se superpongan con un cumpleaños confirmado; las pendientes no bloquean otras solicitudes.
- No hay cobro online ni mensajes reales de WhatsApp. Los datos personales no se exponen en endpoints publicos.

## Estado de partida

### Base ya implementada

- Arquitectura backend por capas, autenticacion por roles, registro de clientes y sesion.
- Turnos, reservas propias, disponibilidad publica, gestion interna y prevencion de superposiciones entre turnos.
- Operaciones internas de pagos, membresias, asistencias y torneos; frontend React con servicios HTTP centralizados y paneles por rol.
- Persistencia JSON de turnos implementada en `backend/src/repositories/TurnoRepository.js`, con escritura temporal y reemplazo atomico. El ultimo commit visible es `74d4053` (`Entrega 5 iniciada, persistencia de turnos creada`).

### Avances verificados

- Cumpleanos: el cliente crea solicitudes persistentes y consulta sus estados; el personal las consulta, confirma y cancela desde el panel interno.
- Disponibilidad unificada: turnos y cumpleanos confirmados comparten la cancha; la confirmacion rechaza cruces y cancelar libera el horario.
- Integracion: los formularios y acciones de cliente/personal usan servicios frontend centralizados y muestran estados de solicitud.
- Documentacion: README y contratos de cumpleaños actualizados. La verificacion manual en navegador y responsive queda para el cierre.

## Plan por etapas

| Etapa | Estado | Resultado y criterio de aceptacion |
| --- | --- | --- |
| 0. Cerrar Entrega 3 y fijar linea base | Completada | Plan anterior marcado como cerrado; el trabajo activo se registra aqui. Persistencia de turnos ya implementada. |
| 1. Franjas disponibles y reglas de turno | Completada | API por fecha y calendario con franjas libres de una hora entre 12:00 y 22:00; backend valida fecha, horario y duracion. Pasaron 37 pruebas backend, 14 frontend y el build. |
| 2. Cancelacion propia y cargo tardio | Completada | El cliente cancela solo sus turnos; con menos de 12 h se marca como tardia. El empleado registra manualmente cualquier pago efectivamente recibido. Pasaron 37 pruebas backend, 14 frontend y el build. |
| 3. Cumpleanos persistentes y gestionables | Completada | Solicitudes persistidas con validacion de paquete, fecha, horario y 48 h; cliente consulta las propias; personal confirma/cancela; pruebas cubren permisos y estados. |
| 4. Disponibilidad unificada | Completada | Se rechazan cruces turno-cumpleanos; los eventos confirmados quitan sus bloques de disponibilidad y cancelarlos los libera. |
| 5. Integracion de interfaz | Completada | Cliente solicita y ve sus estados; el panel interno consulta, confirma y cancela. Pasaron 39 pruebas backend, 14 frontend y el build. |
| 6. Validaciones y documentacion | Completada | Reglas centrales, permisos, fechas, formatos y registros inexistentes estan cubiertos; README y contratos fueron actualizados. `git diff --check` limpio. |
| 7. Verificacion integral y defensa | En curso | Suites/build aprobados. En navegador se hizo el flujo cliente → personal → disponibilidad y persistencia tras reinicio; queda revisar visualmente las pantallas responsive y grabar el video MP4 de 5–10 minutos. |

### Orden y dependencias

1. Etapas 0–6: implementadas/documentadas y verificadas con las suites de backend/frontend, build y revision de diff.
2. Completar la revision visual de las pantallas principales en escritorio y movil; ampliar la comprobacion responsive mas alla de la pagina de cumpleaños.
3. Ajustar el guion a la version final, grabar el video MP4 de 5–10 minutos y comprobarlo antes de entregar.

No se declara una etapa completada hasta que sus criterios se verifiquen. Las decisiones sobre importes o cualquier regla no especificada se consultan antes de implementarse.

### Decision confirmada: cargo por cancelacion tardia

El usuario eligio marcar `cancelacionTardia` en el turno y que el empleado registre manualmente cualquier pago que efectivamente reciba. No se crea una deuda con monto desconocido ni se inventa una tarifa. El backend solo permite asociar un pago recibido a un turno cancelado si tiene esa marca.

## Verificacion final

- `npm --prefix backend test`
- `npm --prefix frontend test`
- `npm --prefix frontend run build`
- Confirmar un flujo cliente desde la interfaz, observar el estado desde el panel del personal y verificar la persistencia tras reiniciar el backend.
- Probar una franja ocupada y un conflicto cruzado con cumpleanos confirmado; verificar errores claros y que no se creen datos incorrectos.
- Comprobar roles, fechas/horarios limite, cancelacion con exactamente 12 horas y con menos de 12 horas, y estados de carga/error/exito.
- Revisar navegacion y pantallas principales en escritorio y movil; actualizar el README y registrar cualquier limitacion que permanezca.

## Guion preliminar para el video de defensa

Duracion objetivo: aproximadamente 8 minutos, dentro del requisito de 5 a 10 minutos. Grabar una vez terminado el flujo y comprobar antes que el entorno de demostracion y los datos sean reproducibles. Se muestran una reserva y una solicitud de cumpleaños para explicar la cancha compartida y los permisos.

| Tiempo | Que mostrar | Que explicar |
| --- | --- | --- |
| 0:00–0:30 | Presentacion de la aplicacion y del caso de uso. | La necesidad del negocio y el objetivo: reservar una cancha evitando superposiciones. |
| 0:30–1:30 | Arbol del proyecto y capas backend relevantes. | Routes reciben la peticion; controller delega; service valida reglas; repository persiste; middleware y respuestas manejan acceso y errores. |
| 1:30–2:30 | Codigo de turnos/cumpleanos y pruebas enfocadas. | Mostrar validaciones, pertenencia/rol, conflictos cruzados y persistencia sin recorrer archivos irrelevantes. |
| 2:30–4:00 | Iniciar sesion como cliente, consultar disponibilidad y reservar una franja. | El frontend usa la API; mostrar la validacion y confirmacion visibles. |
| 4:00–5:15 | Solicitar un cumpleaños con anticipacion y consultar su estado pendiente. | Explicar que la solicitud persiste pero no bloquea la cancha hasta que el personal la confirme. |
| 5:15–6:30 | Cambiar a personal, revisar la solicitud y confirmarla desde el panel interno. | Mostrar permisos y que la confirmacion bloquea las horas del paquete; indicar que un cruce devuelve conflicto. |
| 6:30–7:30 | Verificar disponibilidad y, si el entorno lo permite, reiniciar el backend para comprobar persistencia. | Mostrar que la franja queda ocupada y que los datos no dependen de una simulacion del navegador. |
| 7:30–8:00 | Cierre y resumen de reglas cubiertas. | Resumir integracion, validacion, persistencia y manejo de roles; mencionar brevemente limitaciones reales si queda alguna. |

### Lista previa a grabar

- Usar cuentas y datos de demostracion preparados localmente, sin exponer contrasenas, tokens ni datos personales reales.
- Probar el recorrido completo una vez y confirmar que las cuentas cliente/empleado y los datos iniciales funcionan.
- Mostrar el codigo y la interfaz del mismo flujo; evitar una demostracion que dependa solo de Postman.
- No afirmar que una funcionalidad esta terminada si no se verifico en el flujo actual.
- Grabar en MP4, revisar audio/legibilidad y duracion, y adjuntar el archivo en la tarea de Teams.

Este guion es una estructura de preparacion; se ajustara al comportamiento real que quede implementado y probado antes de grabar.

## Guion detallado alternativo: cumpleaños

Este recorrido se concentra en **un solo flujo de punta a punta** y reemplaza el guion preliminar de arriba si se elige cumpleaños para la defensa. Duracion objetivo: **8 a 9 minutos**; la consigna pide entre 5 y 10 minutos en MP4. Los tiempos son orientativos.

### Antes de grabar

1. Iniciar backend y frontend desde la raiz del proyecto, en terminales separadas, con `npm --prefix backend start` y `npm --prefix frontend run dev`. Abrir `http://localhost:5173`. Si Node no esta en el PATH, habilitarlo en ambas terminales antes de ejecutar los comandos.
2. Tener preparadas una cuenta de **cliente** y una de **empleado o administrador**. Para cambiar de cuenta durante la grabacion, pausar o cortar el video mientras se introduce la contraseña; no mostrar credenciales, cookies ni datos personales reales.
3. En **Reservar cancha**, elegir una fecha futura que tenga mas de 48 horas de anticipacion y dos franjas libres consecutivas. Para este ejemplo se usan **12:00–13:00 y 13:00–14:00** del mismo dia, y el paquete **Basico** de dos horas. Anotar la fecha para usarla en todos los pasos. Cambiar de semana con la flecha si hace falta.
4. Verificar que no exista ya una reserva ni un cumpleaños confirmado que ocupe esas franjas. No borrar datos existentes: si estan ocupadas, elegir otra fecha libre. Preparar una solicitud nueva durante la grabacion para que sea facil distinguirla.
5. Abrir en el editor los archivos enlazados en los pasos siguientes. Aumentar el tamaño de letra, cerrar notificaciones personales y ensayar el recorrido una vez con otra fecha o solicitud de prueba.

### 0:00–0:30 — Presentacion

- **Mostrar:** la pagina principal de La Fabrica y, luego, la seccion **Cumpleaños**.
- **Decir:** «Voy a mostrar el flujo completo de una solicitud de cumpleaños: el cliente elige un paquete y una fecha, el personal la confirma y el sistema actualiza la disponibilidad de la cancha compartida».
- **Aclarar:** la solicitud empieza pendiente; no se confirma ni ocupa la cancha automaticamente.

### 0:30–1:20 — Formulario y conexion del frontend

- **Mostrar en el editor:** [BirthdayPage.jsx](../frontend/src/pages/BirthdayPage.jsx). Buscar `load`, `submit` y el formulario con paquete, dia y horario.
- **Señalar:** `getBirthdayPackages` trae los paquetes; `submit` envia `paqueteId`, `fecha` y `horaInicio`; al recibir respuesta actualiza la confirmacion y la lista de solicitudes.
- **Mostrar despues:** [publicInfo.js](../frontend/src/services/publicInfo.js), funciones `getBirthdayPackages`, `createBirthdayRequest` y `getMyBirthdayRequests`. Señalar `credentials: "include"` en `request`.
- **Decir:** «La pagina no inventa la respuesta: llama al servicio HTTP centralizado. La sesion se envia en la cookie y el backend devuelve la solicitud registrada».

### 1:20–2:10 — Rutas y permisos del backend

- **Mostrar en el editor:** [publicInfoRoutes.js](../backend/src/routes/publicInfoRoutes.js), rutas `POST /cumpleanos/consultas` y `GET /cumpleanos/mis`.
- **Señalar:** origen confiable, autenticacion y `requireRoles("cliente")`; la ruta crea con `birthdays.create(req.body, req.user)` y devuelve estado HTTP 201. La consulta de solicitudes propias usa el `clienteId` de la sesion.
- **Mostrar despues:** [operationsRoutes.js](../backend/src/routes/operationsRoutes.js), rutas de listado, confirmacion y cancelacion de cumpleaños.
- **Decir:** «Solo el cliente autenticado solicita y consulta sus solicitudes. Las acciones de confirmacion y cancelacion estan protegidas para empleado o administrador».
- **Nota tecnica:** estas rutas llaman directamente a los servicios mediante sus manejadores; no afirmar que existe un controlador especifico de cumpleaños.

### 2:10–3:10 — Reglas, estados y persistencia

- **Mostrar en el editor:** [CumpleanosService.js](../backend/src/services/CumpleanosService.js), primero `getRequestTime` y luego `create`.
- **Señalar:** paquete existente, fecha valida, horas enteras dentro de 12:00–22:00, duracion del paquete y minimo de 48 horas; el cliente se toma de la sesion. La solicitud se crea en estado `Pendiente`.
- **Mostrar despues:** `confirm` y `cancel` en el mismo archivo, y las transiciones `confirmar`/`cancelar` en [Cumpleanos.js](../backend/src/models/Cumpleanos.js).
- **Mostrar brevemente:** `create` y `save` en [CumpleanosRepository.js](../backend/src/repositories/CumpleanosRepository.js). Explicar que se guarda en JSON mediante archivo temporal y reemplazo, y que se lee al iniciar.
- **Decir:** «Las validaciones importantes estan en el servidor. La solicitud queda guardada aunque este pendiente; el personal solo puede confirmar una solicitud pendiente o cancelar una pendiente o confirmada».

### 3:10–3:50 — Cancha compartida

- **Mostrar en el editor:** [TurnoService.js](../backend/src/services/TurnoService.js), metodos `getAvailability` y `ensureAvailable`; volver a `confirm` en [CumpleanosService.js](../backend/src/services/CumpleanosService.js).
- **Señalar:** `getAvailability` excluye horas ocupadas por turnos y cumpleaños confirmados; `confirm` llama a `ensureAvailable` antes de cambiar el estado.
- **Decir:** «Hay una sola cancha. Si ya hay un turno o un cumpleaños confirmado que se superpone, la confirmacion se rechaza; una solicitud pendiente todavia no bloquea la cancha».

### 3:50–4:40 — Crear la solicitud como cliente

- **Mostrar en el navegador:** iniciar sesion como cliente sin mostrar la contraseña. Ir a **Cumpleaños**.
- Elegir **Basico**, seleccionar la fecha preparada y `12:00`. Señalar que el paquete dura dos horas y pulsar **Solicitar festejo**.
- **Resultado esperado:** aparece **Solicitud registrada**, el horario `12:00–14:00` y, debajo, la solicitud con estado **Pendiente** en **Mis solicitudes**.
- **Decir:** «El cliente solicito el festejo. Ya esta registrado, pero queda pendiente hasta que el personal lo revise».

### 4:40–5:10 — Mostrar que pendiente no bloquea

- **Mostrar:** ir a **Reservar cancha**, buscar la fecha preparada con las flechas de semana y pulsar **Actualizar disponibilidad** si es necesario.
- **Resultado esperado:** las franjas `12:00` y `13:00` siguen como **Libre**. No seleccionar ni reservar esas franjas: deben permanecer libres para poder confirmar el cumpleaños.
- **Decir:** «Como la solicitud aun esta pendiente, la cancha sigue disponible».

### 5:10–6:20 — Confirmar como personal y mostrar su codigo

- **Mostrar:** cerrar sesion, iniciar como empleado o administrador sin mostrar la contraseña e ir a **Panel interno → Cumpleaños**.
- Identificar la fila por cliente, fecha, paquete y horario. Pulsar **Confirmar**.
- **Resultado esperado:** la fila cambia de **Pendiente** a **Confirmado** y aparece la notificacion de confirmacion.
- **Mostrar brevemente en el editor:** `BirthdayRequestsPanel` y `updateRequest` en [GestionPage.jsx](../frontend/src/pages/GestionPage.jsx); despues `confirmBirthdayRequest` en [operations.js](../frontend/src/services/operations.js).
- **Decir:** «El panel invoca el endpoint protegido de confirmacion. El backend comprueba la disponibilidad, cambia el estado y lo guarda; el panel vuelve a consultar los datos».

### 6:20–7:10 — Comprobar el bloqueo

- **Mostrar:** volver a **Reservar cancha**, navegar hasta la misma fecha y pulsar **Actualizar disponibilidad**.
- **Resultado esperado:** `12:00` y `13:00` figuran como **No disponible**; una franja contigua libre, por ejemplo `14:00`, sigue disponible si no hay otra reserva.
- **Decir:** «El paquete de dos horas ocupa dos bloques consecutivos. La interfaz consulta la disponibilidad calculada por el backend, que cruza turnos y cumpleaños confirmados».
- No hace falta forzar una reserva por API: el calendario deshabilita las franjas ocupadas. El rechazo de una confirmacion en conflicto se puede mostrar con la prueba automatizada del paso siguiente.

### 7:10–7:50 — Pruebas y persistencia

- **Mostrar en el editor:** [CumpleanosService.test.js](../backend/src/services/CumpleanosService.test.js), especialmente la prueba HTTP que comprueba conflicto con un turno, confirmacion, disponibilidad y cancelacion. Mostrar tambien la prueba de persistencia en [CumpleanosRepository.test.js](../backend/src/repositories/CumpleanosRepository.test.js).
- **Decir:** «Estas pruebas verifican las reglas en el backend, los permisos, los cruces y que el repositorio recupere los estados guardados».
- **Opcional, si hay tiempo:** reiniciar el backend y volver a iniciar sesion, porque las sesiones se pierden al reiniciar. Mostrar la misma solicitud confirmada y las franjas bloqueadas. No mostrar el archivo de datos personales en pantalla. El repositorio persiste las solicitudes, no las sesiones.

### 7:50–8:40 — Cancelar y cierre

- **Mostrar:** volver a **Panel interno → Cumpleaños**, localizar la misma fila y pulsar **Cancelar**. Ver el estado **Cancelado**.
- Volver al calendario de **Reservar cancha**, buscar la fecha y pulsar **Actualizar disponibilidad**. Las franjas `12:00` y `13:00` vuelven a estar libres si ningun otro registro las ocupa.
- **Decir:** «Al cancelar, el evento deja de ocupar la cancha. El flujo conecta React, servicios HTTP, permisos, reglas del servidor y persistencia».
- Cerrar indicando que no hay cobro online ni envio real de WhatsApp, y que la confirmacion la realiza el personal.

### Si una demostracion no sale como se esperaba

- Si **Confirmar** muestra «Ese horario ya no esta disponible», hay una ocupacion superpuesta: no afirmar que quedo confirmada. Elegir otra fecha y crear una nueva solicitud para repetir el flujo.
- Si no se ven los cambios en el calendario, usar **Actualizar disponibilidad** y revisar que sea la misma fecha.
- Si se reinicio el backend, volver a iniciar sesion. La sesion en memoria se pierde, pero los datos guardados se conservan.
- Si falta tiempo, omitir el reinicio opcional; conservar el recorrido de creacion, confirmacion y bloqueo, y mostrar las pruebas sin afirmar que se ejecutaron durante la grabacion si no se ejecutaron.
