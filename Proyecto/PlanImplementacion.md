# Plan de implementacion y continuidad - Entrega 3

Actualizado: 8 de octubre de 2026. Fecha de entrega indicada por el usuario: 9 de noviembre de 2026, 23:59.

Este documento permite retomar el proyecto sin acceder a la conversacion original. Distingue decisiones confirmadas, codigo implementado y trabajo pendiente. Las decisiones posteriores del usuario prevalecen sobre los supuestos iniciales de los otros documentos.

## 1. Objetivo y forma de trabajo

Desarrollar el frontend React de La Fabrica Futbol 5 respetando el boceto original e integrandolo con la API Express. La entrega se centra en el frontend: no ampliar innecesariamente la base de datos ni construir un sistema productivo completo.

Trabajar paso a paso, una etapa verificable por vez. Al terminar cada etapa, ejecutar sus pruebas y build pertinentes, revisar el diff, crear un commit separado y hacer push a `origin/main`. No incluir datos locales, secretos, dependencias instaladas ni artefactos generados. Si el push falla, informar el commit y el motivo; no marcar la etapa como publicada.

No implementar todos los modulos ni los paneles internos de una sola vez sin acordar el avance con el usuario.

Requisitos de la consigna:

- Carpetas `backend` y `frontend` en la raiz; implementacion del frontend dentro de `frontend/src`.
- Separacion entre assets, componentes, paginas, servicios, utilidades y estilos. No concentrar la aplicacion en App.
- Respeto del boceto; mejoras justificadas, no sustitucion por una interfaz generica.
- Componentes reutilizables, accesibilidad basica, formularios validados y estados de carga.
- Un mismo sistema de notificaciones para errores y exitos, sin `alert()` como mecanismo principal.
- Confirmacion antes de eliminar cuando esa operacion corresponda al rol y a la pantalla.
- Peticiones centralizadas en servicios, datos reales de la API y errores procesados consistentemente.

## 2. Fuentes de informacion

- [Entrega 1](Entrega1.md): dominio inicial; contiene secciones incompletas y reglas aun no implementadas.
- [Analisis del sistema](La_Fabrica_F5_Analisis_Sistema.docx): documento del negocio, revisado el 7 de octubre de 2026 al abordar los contratos publicos.
- [Entrega 3](Entrega3.md): descripcion del frontend existente y sus limitaciones.
- [Backend y autenticacion](../backend/README.md): contrato HTTP, configuracion y procedimiento local para crear el primer administrador.
- [README general](../README.md): instalacion y ejecucion.
- [Figma original](https://www.figma.com/design/BzSyxA0BZY462Cntvvr5Dr/La-F%C3%A1brica-F%C3%BAtbol-5---Wireframe-Web?node-id=0-1).

Pantallas identificadas en Figma: Login/Register, Home, Reservar Cancha, Gym, Cumpleanos, Torneos y Sobre Nosotros.

Las referencias exportadas de todas las pantallas estan en [imagenes_referencia](imagenes_referencia/). Se revisaron visualmente y los contratos publicos se basan en esos recursos y en las decisiones posteriores del usuario. No hay precios en la pantalla de Cumpleanos.

Si el editor falla al mostrar el canvas, el modo presentacion permitio inspeccionar:

- [Reserva, frame 4-2](https://www.figma.com/proto/BzSyxA0BZY462Cntvvr5Dr/La-Fabrica-Futbol-5---Wireframe-Web?node-id=4-2&scaling=scale-down-width).
- [Login/Register, frame 1-4](https://www.figma.com/proto/BzSyxA0BZY462Cntvvr5Dr/La-Fabrica-Futbol-5---Wireframe-Web?node-id=1-4&scaling=scale-down-width).

Estos enlaces son referencias reproducibles; no depender de los identificadores de pestanas de un navegador de otra sesion. Si un recurso no puede leerse, pedir una captura o exportacion antes de reconstruirlo.

El prototipo interactivo de Figma no carga por WebGL, pero las capturas locales permiten revisar sus composiciones. El horario completo de Gym y los fixtures/resultados de Torneos no aparecen en las capturas; no completar esos datos por suposicion.

## 3. Respuestas del usuario a las dudas

### Persistencia

No hace falta profundizar en base de datos. La entrega prioriza el frontend y requiere una solucion simple. Se implementaron cuentas y clientes en un archivo JSON local, sin instalar un motor de base de datos. Las sesiones y los turnos existentes permanecen en memoria.

### Registro, login y roles

Los usuarios se registran e inician sesion desde la pantalla Login/Register de Figma. Cliente, empleado y administrador utilizan el mismo login. El registro publico crea exclusivamente clientes.

El administrador puede crear cuentas de empleados y otros administradores. El backend ya dispone de ese endpoint. Las vistas de empleado y administrador quedan pendientes para despues; seran similares, pero el administrador tendra mas permisos. No construirlas en esta etapa por iniciativa propia.

El Figma de registro incluye nombre, apellido, telefono, email, contrasena y equipo opcional. Ese equipo es un dato de perfil, no una inscripcion automatica a un torneo.

### Gimnasio

Hay una sola membresia normal, sin niveles y sin turnos de entrenamiento. Los horarios indican cuando esta disponible el gimnasio, no franjas reservables.

La asistencia se toma presencialmente por el recepcionista, quien registra a las personas que vienen a entrenar. Esta gestion corresponde al futuro flujo interno; no crear reservas de Gym ni controles de asistencia para clientes en el sitio publico.

### Cumpleanos

La referencia muestra tres paquetes: Basico (2 horas, mesa para invitados, 15 chicos), Full (2 horas, mesa para invitados y buffet, 20 chicos) y Premium (3 horas, mesa para invitados y buffet, 20 chicos). No muestra precios. El endpoint solo publica esos datos; una consulta requiere fecha/hora validas y 48 horas de anticipacion, pero su respuesta es simulada, no se persiste y no bloquea la cancha.

Los cumpleanos ocupan la misma cancha que las reservas de futbol. Cuando se implemente la confirmacion interna, la disponibilidad debe contemplar ambos recursos y evitar superposiciones.

### Torneos

El Figma define la presentacion publica. El usuario solicito agregar una vista o ventana mas detallada al pulsar el fixture: informacion del torneo, calendario, resultados y estadisticas que esten disponibles.

El empleado maneja los torneos activos y carga resultados y estadisticas. En un caso real, los jugadores se registrarian por WhatsApp y el empleado cargaria manualmente los equipos y jugadores, con nombre y DNI, al organizar el torneo.

El torneo debera generar su estructura segun la cantidad de equipos definida y el formato elegido, por ejemplo liga o copa. Las variantes exactas, reglas de puntuacion, desempates, cruces y manejo de cantidades impares no estan definidas: precisarlas al abordar el generador. Preferir una biblioteca adecuada para el motor si existe, en lugar de inventar reglas.

La captura muestra tres ejemplos referenciales de Torneo Barrial (8/12, 12/12 y 9/12 equipos) y una tabla parcial para el segundo (River Plate 18, Chacarita 14, O'Higgins 13 y Real Madrid 10). La API los marca `datosDeReferencia`; no son registros operativos. La captura no incluye fixture, fechas de partidos ni resultados.

No exponer DNI en endpoints publicos, fixtures o estadisticas visibles a clientes. La carga de equipos, jugadores y resultados sera privada y autorizada para el personal. La inscripcion no es un autoservicio publico dentro del sitio.

El analisis funcional tambien pide sena antes de confirmar, recargo por luces, anticipacion minima de 48 horas para eventos y controles de membresia vencida. En esta entrega prevalecen las decisiones posteriores del usuario: no hay cobros ni comprobantes online, WhatsApp es mock, Gym no tiene turnos reservables y no se debe inventar una penalizacion o tarifa. No activar esas reglas operativas sin cerrar primero el flujo y sus datos.

### Pagos y cancelaciones

En un caso real, el empleado registraria el pago al recibir el comprobante por WhatsApp. No hay cobro online ni carga publica de comprobantes en esta entrega.

Las cancelaciones se arreglan con anticipacion por fuera de la pagina. No ofrecer cancelacion o eliminacion de reservas como autoservicio de clientes. El CRUD de turnos existente es una base tecnica anterior y todavia necesita adaptacion de permisos e interfaz.

### WhatsApp: decision final

El usuario decidio que WhatsApp sea un mock para la entrega. No se necesita numero real, no se abren enlaces a WhatsApp y no se envia ningun mensaje ni comprobante.

Los formularios deben validar sus datos y mostrar una confirmacion identificada como consulta simulada. No afirmar que un mensaje fue enviado, un pago recibido o una reserva confirmada. Esto no reemplaza el consumo real de la API requerido por la consigna.

Las consultas mock de Cumpleanos se validan en la API, pero no se guardan, no confirman el evento ni bloquean la cancha. No se abre WhatsApp ni se envia un mensaje.

## 4. Estado implementado

### Estructura

El backend anterior se traslado de `Proyecto/Backend` a `backend`. El frontend esta en `frontend`. Los documentos permanecen en `Proyecto`.

El repositorio original tenia `node_modules` versionado dentro del backend antiguo. El traslado y el archivo de exclusiones eliminan esas copias del repositorio; no volver a incluir dependencias instaladas, builds, datos locales ni secretos en Git.

### Frontend

React con Vite, React Router y Lucide. Reserva semanal basada en la composicion del Figma, formulario reutilizable, listado de turnos con busqueda y filtro, edicion y eliminacion mediante dialogos, notificaciones compartidas y estilos responsive.

Referencias visuales compartidas: [Proyecto/imagenes_referencia](imagenes_referencia/). Archivos para retomar:

- [App](../frontend/src/App.jsx): rutas actuales, incluida cuenta y turnos.
- [Layout](../frontend/src/components/Layout.jsx): encabezado, navegacion y pie.
- [TurnoForm](../frontend/src/components/TurnoForm.jsx): el cliente no ingresa ID; el personal conserva asignacion interna.
- [TurnosProvider](../frontend/src/components/TurnosProvider.jsx): disponibilidad publica y listas privadas por rol.
- [Servicio de turnos](../frontend/src/services/turnos.js): fetch centralizado con credenciales de sesion.
- [Reserva](../frontend/src/pages/ReservaPage.jsx) y [gestion de turnos](../frontend/src/pages/TurnosPage.jsx).
- [Secciones informativas](../frontend/src/pages/InfoPage.jsx): Gym, Cumpleanos y Torneos siguen como placeholders; los contratos de API ya estan disponibles.

El Home no esta validado completamente contra Figma. Su foto es una referencia de Unsplash, no una imagen comprobada del establecimiento ni una ilustracion exportada del diseno.

La accesibilidad basica incluye labels, botones semanticos, nombres de iconos, foco visible, enlace para saltar al contenido y dialogos con restauracion de foco. Las notificaciones se muestran dentro del dialogo activo para no quedar detras del fondo modal.

### Backend de autenticacion: terminado en esta etapa

| Endpoint              | Comportamiento                                                                |
| --------------------- | ----------------------------------------------------------------------------- |
| `POST /auth/register` | Crea cuenta y cliente asociado, inicia sesion; registro publico solo cliente. |
| `POST /auth/login`    | Login comun a los tres roles; regenera la sesion.                             |
| `GET /auth/me`        | Devuelve usuario de la sesion o 401.                                          |
| `POST /auth/logout`   | Destruye la sesion y elimina la cookie.                                       |
| `POST /auth/users`    | Solo admin; crea empleado o admin sin cambiar la sesion de quien lo crea.     |

Roles exactos en la API: `cliente`, `empleado`, `admin`. Las cuentas de cliente tienen `clienteId`; las cuentas internas tienen `clienteId: null`.

Se utilizan bcryptjs, express-session y express-rate-limit. Cookie HttpOnly, SameSite=Lax y Secure en produccion. Las respuestas no incluyen contrasenas ni hashes y utilizan `{ success, data }` o `{ success: false, message }`.

Las cuentas y los perfiles de cliente persisten en `backend/data/auth.json`, excluido de Git. Reiniciar conserva cuentas y elimina sesiones. La sesion vence a las cuatro horas. No hay credenciales predeterminadas; el primer administrador se crea con el procedimiento de [backend/README.md](../backend/README.md), sin compartir secretos por chat.

Los POST de autenticacion exigen un `Origin` autorizado. Registro y login comparten un limite de 20 solicitudes por IP cada 15 minutos. Los middlewares [de autenticacion y roles](../backend/src/middlewares/auth.js) estan disponibles para los siguientes modulos.

### Turnos: adaptados a la sesion

`GET /turnos/disponibilidad` publica solo fecha, horario y estado; no incluye ID de turno ni cliente. `GET /turnos/mis` requiere un cliente autenticado y filtra por su `clienteId` de sesion. El listado completo y la consulta individual requieren rol `empleado` o `admin`. Crear requiere sesion; para clientes el servidor ignora el ID enviado y toma el del usuario autenticado. El personal solo puede asignar reservas a perfiles de cliente existentes. Actualizar y eliminar requieren personal y origen permitido.

La grilla consume disponibilidad publica. Los clientes ven solo sus reservas y no tienen acciones de edicion o cancelacion; el personal conserva el listado y CRUD. El backend valida fecha real y futura, horas, cantidad, ID de cliente y superposicion; las actualizaciones aceptan unicamente campos permitidos. Las pruebas usan sesiones, archivos y repositorios temporales.

## 5. Plan por etapas

| Etapa                                    | Estado     | Resultado esperado                                                            |
| ---------------------------------------- | ---------- | ----------------------------------------------------------------------------- |
| Definir autenticacion y permisos         | Completada | Registro cliente, login comun y alta interna solo admin.                      |
| Implementar autenticacion backend        | Completada | Endpoints, sesion, persistencia simple y diez pruebas.                        |
| Integrar Login/Register de Figma         | Completada | Formularios reales, recuperacion de sesion y logout.                          |
| Adaptar turnos y permisos                | Completada | Cliente desde sesion, datos propios, disponibilidad sin informacion personal. |
| Completar contratos y endpoints publicos | Completada | Horarios destacados, paquetes y torneos de referencia; mock sin bloqueo.      |
| Completar frontend publico conectado    | Completada | Home, Gym, Cumpleanos, Torneos y Nosotros con servicios existentes.           |
| Implementar backend interno por rol      | Completada | Turnos, pagos, membresias, asistencias y torneos manuales con persistencia.     |
| Implementar frontend interno por rol    | Siguiente  | Vistas de empleado/admin conectadas al backend y diferenciadas por rol.        |
| Verificar y documentar entrega completa  | Pendiente  | Pruebas, accesibilidad, responsive y contraste con las consignas.             |

### Login/Register implementado

Se inspecciono el frame 1-4. La ruta `/cuenta` conserva login y registro en paneles paralelos y se adapta a una columna en movil. El registro publico envia nombre, apellido, telefono, email, contrasena y equipo opcional; el backend asigna el rol cliente. El proveedor recupera `/auth/me`; un 401 inicial se interpreta como visitante. Login, registro, logout y llamadas de turnos incluyen credenciales de cookie. No se guardan contrasenas ni roles en `localStorage`. Vite y la API usan `localhost` para que `SameSite=Lax` funcione en desarrollo.

La prueba de servicios cubre rutas, cookies, cuerpos, sesion ausente y errores. Las pruebas del backend cubren el ciclo HTTP de registro, recuperacion, login y logout. Se verifico el layout a 1440 px y 390 px. No se construyeron paneles internos.

### Contratos publicos implementados

`GET /gym` publica la membresia normal y solo los cuatro horarios destacados legibles; marca que el horario completo no esta disponible. No expone estado de cuota, pagos ni asistencias de ejemplo. `GET /cumpleanos/paquetes` devuelve los tres paquetes visibles sin precios. `POST /cumpleanos/consultas` requiere cliente y origen confiable, valida paquete, fecha/hora y anticipacion de 48 horas; responde como simulacion, no persiste la solicitud, no confirma el evento y no bloquea la cancha.

`GET /torneos` y `GET /torneos/:id` entregan los conteos, estados y tabla parcial visibles en la captura, marcados `datosDeReferencia: true`. No exponen DNI ni inventan fixture, fechas o resultados. El prototipo no provee un horario completo de Gym ni fixture verificable.

### Frontend publico conectado: implementado

Home, Gym, Cumpleanos, Torneos y Sobre Nosotros consumen los endpoints disponibles cuando corresponden y siguen las capturas de `Proyecto/imagenes_referencia`. Torneos identifica sus datos referenciales y muestra estados vacios para fixture/resultados inexistentes. Cumpleanos usa los paquetes sin precio y presenta la consulta API como simulada; Gym no inventa estado de cuota ni ofrece turnos.

Verificado con 11 pruebas frontend, build de produccion y navegador a 1440 px y 390 px sin desbordamiento horizontal en las cinco paginas.

### Siguiente tarea concreta: frontend de empleado/admin

#### Punto de reanudacion

Estado al 8 de octubre de 2026: el frontend publico sigue conectado y validado. El backend interno ya esta implementado con pruebas HTTP; antes de iniciar esta etapa, confirmar que su commit separado este publicado en `origin/main`.

La API incluye autenticacion (`/auth/*`), turnos por rol (`/turnos/*`), operaciones internas (`/interno/*`) y lectura publica/consulta simulada (`/gym`, `/cumpleanos/*`, `/torneos/*`). El frontend interno debe consumir los contratos existentes, no duplicar reglas. Empleado y admin operan turnos, pagos, membresias, asistencias y torneos; solo admin crea usuarios internos. `GET /interno/clientes` es una consulta privada de solo lectura con id/nombre para asociar registros.

Archivos de entrada: [App](../frontend/src/App.jsx), [AuthProvider](../frontend/src/components/AuthProvider.jsx), [Layout](../frontend/src/components/Layout.jsx), [servicios frontend](../frontend/src/services/) y [backend README](../backend/README.md). Revisar rutas y convenciones actuales antes de añadir navegacion o componentes.

#### Orden de trabajo

1. Construir las vistas internas consumiendo `/turnos/*` y `/interno/*`, mostrando operaciones solo con una sesion real de empleado/admin.
2. Integrar registro manual de pagos, periodos de membresia, asistencia presencial, torneos/equipos/partidos y transiciones de estado de turnos.
3. Verificar en navegador el acceso permitido a empleado y admin y el rechazo a clientes; revisar estados de carga, error, vacio y formularios.
4. Ejecutar pruebas frontend, build y revision responsive a 1440 px y 390 px; publicar esta etapa con su propio commit/push.

#### Limites y decisiones pendientes

Alcance confirmado por el usuario: turnos, pagos manuales, membresias/asistencia de Gym y gestion de torneos. Empleado opera esos modulos; admin tiene esos permisos y ademas administra usuarios. El endpoint `POST /auth/users` ya esta disponible solo para admin.

No hay cobro online ni envio real de WhatsApp. Los pagos internos registran un importe ingresado por el empleado y no calculan precios, senas ni recargos. Las membresias registran fechas explicitas; la asistencia no se bloquea por vencimiento. Turnos se confirman/cancelan por acciones internas y pueden reprogramarse solo si no estan cancelados. Torneos aceptan equipos y resultados manuales; estadisticas limitadas a partidos y goles, sin fixture automatico, puntos o desempates. No incluir DNI ni datos personales en vistas/endpoints publicos.

### Backend interno implementado

Los cambios de estado de turnos son exclusivos de empleado/admin: pendiente puede confirmarse o cancelarse, confirmado puede cancelarse y cancelado es terminal. Las operaciones de pagos, membresias, asistencias, torneos, equipos y partidos se guardan en `backend/data/operations.json`, excluido de Git. Las consultas publicas de torneos siguen entregando solo datos de referencia; no se mezclan registros internos.

Verificado con la suite backend: 20 pruebas; incluye permisos, transiciones, persistencia, validacion de pagos/membresias y carga manual de resultados. La generacion automatica de cruces sigue pendiente de definir formato, desempates y manejo de cantidades impares.

## 6. Ejecucion y comprobaciones

Desde la raiz, Node.js 20.19 o superior y npm:

```sh
npm --prefix backend install
npm --prefix backend start
```

En otra terminal:

```sh
npm --prefix frontend install
npm --prefix frontend run dev
```

Verificaciones:

```sh
npm --prefix backend test
npm --prefix frontend test
npm --prefix frontend run build
```

Estado verificado al cerrar la implementacion:

- Backend: veinte pruebas de servicio, HTTP, sesiones, permisos, contratos publicos, operaciones internas y persistencia pasaron.
- Frontend: once pruebas de servicios y validacion, y compilacion de produccion pasaron con las paginas publicas conectadas.
- Se verificaron con navegador los flujos originales de crear, editar, cancelar eliminacion y eliminar turnos; errores de API, reintento, Escape, restauracion de foco, movil y carga de imagen.
- APIs públicas probadas: Gym, paquetes, torneos y detalle; consulta de cumpleaños requiere cliente y no confirma ni ocupa la cancha. No se crearon cuentas permanentes durante las pruebas.

Las pruebas de backend usan archivos temporales y puertos aleatorios. No depender de servidores que hayan quedado abiertos ni de datos locales de otra sesion.

### Advertencia importante sobre las cookies

El desarrollo y la vista previa de Vite ahora usan `localhost`, igual que la URL predeterminada de la API (`http://localhost:3000`), para que la cookie `SameSite=Lax` funcione. `VITE_API_URL` configura la base del backend y Vite debe reiniciarse si cambia su entorno. El backend permite los hosts locales en 5173/5174 y requiere `credentials: true` en CORS, ya configurado.

El backend no carga `.env` automaticamente. Configurar variables antes de iniciar el proceso; consultar [backend/README.md](../backend/README.md) para `SESSION_SECRET`, `FRONTEND_ORIGIN`, `AUTH_DATA_FILE` y el primer admin.

## 7. Riesgos y pendientes que no deben ocultarse

- Login/Register, turnos por rol, frontend publico y backend interno estan integrados. La prioridad inmediata es construir el frontend de empleado/admin.
- Siguen pendientes el horario completo de Gym y la generacion automatica de fixture; el backend permite cargar manualmente resultados operativos y registra membresias/asistencias.
- Cumpleanos y reservas comparten cancha; no validar su disponibilidad como recursos independientes al confirmar ocupaciones.
- Persistencia de cuentas en archivo y sesiones en memoria son para una sola instancia local, no para produccion.
- No se implementaron recuperacion de contrasena ni verificacion de email; no prometidas para este paso.
- La instalacion reporto tres alertas altas en dependencias de desarrollo de nodemon. No se ejecuto una actualizacion forzada incompatible; revisar por separado.
- Faltan fidelidad visual de las pantallas y una verificacion final de las tres partes de la consigna. Pruebas exitosas no equivalen a cumplimiento visual completo.

Al retomar, leer los archivos actuales antes de editar, conservar cambios ajenos y verificar cada avance con la prueba mas pequena que pueda detectar un fallo. No inventar informacion del negocio ni presentar un mock como una operacion real.
