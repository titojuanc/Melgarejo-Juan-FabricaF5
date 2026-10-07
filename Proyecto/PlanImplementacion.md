# Plan de implementacion y continuidad - Entrega 3

Actualizado: 6 de octubre de 2026. Fecha de entrega indicada por el usuario: 9 de noviembre de 2026, 23:59.

Este documento permite retomar el proyecto sin acceder a la conversacion original. Distingue decisiones confirmadas, codigo implementado y trabajo pendiente. Las decisiones posteriores del usuario prevalecen sobre los supuestos iniciales de los otros documentos.

## 1. Objetivo y forma de trabajo

Desarrollar el frontend React de La Fabrica Futbol 5 respetando el boceto original e integrandolo con la API Express. La entrega se centra en el frontend: no ampliar innecesariamente la base de datos ni construir un sistema productivo completo.

Trabajar paso a paso. El backend de autenticacion ya esta implementado; el siguiente paso acordado es Login/Register del frontend y su conexion con la sesion. No implementar todos los modulos ni los paneles internos de una sola vez sin acordar el avance con el usuario.

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
- [Analisis del sistema](La_Fabrica_F5_Analisis_Sistema.docx): documento existente del negocio. Revisarlo al retomar cada modulo; su contenido no fue extraido ni verificado durante esta sesion.
- [Entrega 3](Entrega3.md): descripcion del frontend existente y sus limitaciones.
- [Backend y autenticacion](../backend/README.md): contrato HTTP, configuracion y procedimiento local para crear el primer administrador.
- [README general](../README.md): instalacion y ejecucion.
- [Figma original](https://www.figma.com/design/BzSyxA0BZY462Cntvvr5Dr/La-F%C3%A1brica-F%C3%BAtbol-5---Wireframe-Web?node-id=0-1).

Pantallas identificadas en Figma: Login/Register, Home, Reservar Cancha, Gym, Cumpleanos, Torneos y Sobre Nosotros.

Se verificaron visualmente Reservar Cancha y Login/Register. Cumpleanos, Gym, Torneos y las restantes composiciones todavia necesitan una revision detallada. No asumir que sus contenidos ya fueron extraidos ni inventar paquetes o precios.

Si el editor falla al mostrar el canvas, el modo presentacion permitio inspeccionar:

- [Reserva, frame 4-2](https://www.figma.com/proto/BzSyxA0BZY462Cntvvr5Dr/La-Fabrica-Futbol-5---Wireframe-Web?node-id=4-2&scaling=scale-down-width).
- [Login/Register, frame 1-4](https://www.figma.com/proto/BzSyxA0BZY462Cntvvr5Dr/La-Fabrica-Futbol-5---Wireframe-Web?node-id=1-4&scaling=scale-down-width).

Estos enlaces son referencias reproducibles; no depender de los identificadores de pestanas de un navegador de otra sesion. Si un recurso no puede leerse, pedir una captura o exportacion antes de reconstruirlo.

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

Los paquetes, servicios y su presentacion estan en la pantalla Cumpleanos de Figma. Obtener la informacion de alli antes de implementar el catalogo y el formulario. No se conocen aun sus valores exactos en este documento.

Los cumpleanos ocupan la misma cancha que las reservas de futbol. Cuando se implemente la confirmacion interna, la disponibilidad debe contemplar ambos recursos y evitar superposiciones.

### Torneos

El Figma define la presentacion publica. El usuario solicito agregar una vista o ventana mas detallada al pulsar el fixture: informacion del torneo, calendario, resultados y estadisticas que esten disponibles.

El empleado maneja los torneos activos y carga resultados y estadisticas. En un caso real, los jugadores se registrarian por WhatsApp y el empleado cargaria manualmente los equipos y jugadores, con nombre y DNI, al organizar el torneo.

El torneo debera generar su estructura segun la cantidad de equipos definida y el formato elegido, por ejemplo liga o copa. Las variantes exactas, reglas de puntuacion, desempates, cruces y manejo de cantidades impares no estan definidas: precisarlas al abordar el generador. Preferir una biblioteca adecuada para el motor si existe, en lugar de inventar reglas.

No exponer DNI en endpoints publicos, fixtures o estadisticas visibles a clientes. La carga de equipos, jugadores y resultados sera privada y autorizada para el personal. La inscripcion no es un autoservicio publico dentro del sitio.

### Pagos y cancelaciones

En un caso real, el empleado registraria el pago al recibir el comprobante por WhatsApp. No hay cobro online ni carga publica de comprobantes en esta entrega.

Las cancelaciones se arreglan con anticipacion por fuera de la pagina. No ofrecer cancelacion o eliminacion de reservas como autoservicio de clientes. El CRUD de turnos existente es una base tecnica anterior y todavia necesita adaptacion de permisos e interfaz.

### WhatsApp: decision final

El usuario decidio que WhatsApp sea un mock para la entrega. No se necesita numero real, no se abren enlaces a WhatsApp y no se envia ningun mensaje ni comprobante.

Los formularios deben validar sus datos y mostrar una confirmacion identificada como consulta simulada. No afirmar que un mensaje fue enviado, un pago recibido o una reserva confirmada. Esto no reemplaza el consumo real de la API requerido por la consigna.

La decision resuelve la necesidad de una integracion externa. No define por si sola si cada consulta simulada debe guardarse como solicitud pendiente en la API ni cuando debe bloquear disponibilidad: cerrar ese pequeno contrato al implementar el recurso, sin tratar un mock como confirmacion real.

## 4. Estado implementado

### Estructura

El backend anterior se traslado de `Proyecto/Backend` a `backend`. El frontend esta en `frontend`. Los documentos permanecen en `Proyecto`.

El repositorio original tenia `node_modules` versionado dentro del backend antiguo. El traslado y el archivo de exclusiones eliminan esas copias del repositorio; no volver a incluir dependencias instaladas, builds, datos locales ni secretos en Git.

### Frontend

React con Vite, React Router y Lucide. Reserva semanal basada en la composicion del Figma, formulario reutilizable, listado de turnos con busqueda y filtro, edicion y eliminacion mediante dialogos, notificaciones compartidas y estilos responsive.

Archivos para retomar:

- [App](../frontend/src/App.jsx): rutas actuales; no existe ruta de Login/Register todavia.
- [Layout](../frontend/src/components/Layout.jsx): encabezado, navegacion y pie.
- [TurnoForm](../frontend/src/components/TurnoForm.jsx): formulario que aun pide ID de cliente manualmente.
- [TurnosProvider](../frontend/src/components/TurnosProvider.jsx): carga y mutaciones compartidas.
- [Servicio de turnos](../frontend/src/services/turnos.js): fetch centralizado; aun no incluye credenciales de sesion.
- [Reserva](../frontend/src/pages/ReservaPage.jsx) y [gestion de turnos](../frontend/src/pages/TurnosPage.jsx).
- [Secciones informativas](../frontend/src/pages/InfoPage.jsx): Gym, Cumpleanos y Torneos son placeholders, no implementaciones completas.

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

### Turnos: pendiente de adaptar

La API existente permite listado, consulta, alta, actualizacion y eliminacion, pero todavia no aplica autenticacion, propiedad de registros ni superposicion del lado del servidor. La actualizacion usa asignacion directa de propiedades y debe reemplazarse por campos permitidos y validacion cuando se integre la sesion.

No considerar esas rutas listas para produccion. No protegerlas aisladamente sin actualizar el frontend, porque romperia el flujo actual.

## 5. Plan por etapas

| Etapa                                    | Estado     | Resultado esperado                                                            |
| ---------------------------------------- | ---------- | ----------------------------------------------------------------------------- |
| Definir autenticacion y permisos         | Completada | Registro cliente, login comun y alta interna solo admin.                      |
| Implementar autenticacion backend        | Completada | Endpoints, sesion, persistencia simple y diez pruebas.                        |
| Integrar Login/Register de Figma         | Completada | Formularios reales, recuperacion de sesion y logout.                          |
| Adaptar turnos y permisos                | Pendiente  | Cliente desde sesion, datos propios, disponibilidad sin informacion personal. |
| Completar contratos y endpoints publicos | Pendiente  | Informacion de Gym, paquetes de Cumpleanos, torneos y detalle de fixture.     |
| Recrear las demas pantallas              | Pendiente  | Composicion y recursos de Figma, formularios mock y servicios reales.         |
| Verificar y documentar entrega completa  | Pendiente  | Pruebas, accesibilidad, responsive y contraste con las consignas.             |

### Login/Register implementado

Se inspecciono el frame 1-4. La ruta `/cuenta` conserva login y registro en paneles paralelos y se adapta a una columna en movil. El registro publico envia nombre, apellido, telefono, email, contrasena y equipo opcional; el backend asigna el rol cliente. El proveedor recupera `/auth/me`; un 401 inicial se interpreta como visitante. Login, registro, logout y llamadas de turnos incluyen credenciales de cookie. No se guardan contrasenas ni roles en `localStorage`. Vite y la API usan `localhost` para que `SameSite=Lax` funcione en desarrollo.

La prueba de servicios cubre rutas, cookies, cuerpos, sesion ausente y errores. Las pruebas del backend cubren el ciclo HTTP de registro, recuperacion, login y logout. Se verifico el layout a 1440 px y 390 px. No se construyeron paneles internos.

### Siguiente tarea concreta: adaptar turnos y permisos

### Adaptacion de turnos

- El cliente no escribe su ID: el servidor lo obtiene de la sesion, sin confiar en uno enviado por el navegador.
- Separar disponibilidad publica de listado privado; no publicar clientes ni datos personales en la grilla.
- Definir acceso a las reservas propias y restringir las operaciones internas por rol.
- Retirar del flujo cliente los botones de edicion o eliminacion que contradigan las reglas confirmadas; conservar las capacidades necesarias para la futura gestion interna.
- Validar fechas, horarios y superposicion en el backend; no basta la validacion del formulario.
- Resolver junto con el mock que representa una solicitud, que representa una reserva y cuando se ocupa la cancha.

### Otros recursos

Los nombres siguientes son propuestas, no endpoints ya implementados: `GET /gym`, `GET /cumpleanos/paquetes`, `GET /torneos`, `GET /torneos/:id` y lectura del fixture/resultados. Definir contratos pequenos y devolver la informacion de la API, no duplicar catalogos dentro de componentes.

La carga de datos internos debe quedar separada de la consulta publica. No inventar reservas de gimnasio ni pagos online. La generacion de torneos requiere reglas de formato confirmadas antes de elegir el motor. Las pantallas internas siguen fuera del alcance inmediato.

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

- Backend: diez pruebas de servicio, HTTP, sesiones, permisos, persistencia, duplicados simultaneos y bootstrap de admin pasaron.
- Frontend: ocho pruebas de servicios y validacion, y compilacion de produccion pasaron con Login/Register.
- Se verificaron con navegador los flujos originales de crear, editar, cancelar eliminacion y eliminar turnos; errores de API, reintento, Escape, restauracion de foco, movil y carga de imagen.
- API activa comprobada en navegador: `/auth/me` devuelve 401 sin sesion, tratado silenciosamente como visitante. No se crearon cuentas permanentes durante la verificacion.

Las pruebas de backend usan archivos temporales y puertos aleatorios. No depender de servidores que hayan quedado abiertos ni de datos locales de otra sesion.

### Advertencia importante sobre las cookies

El desarrollo y la vista previa de Vite ahora usan `localhost`, igual que la URL predeterminada de la API (`http://localhost:3000`), para que la cookie `SameSite=Lax` funcione. `VITE_API_URL` configura la base del backend y Vite debe reiniciarse si cambia su entorno. El backend permite los hosts locales en 5173/5174 y requiere `credentials: true` en CORS, ya configurado.

El backend no carga `.env` automaticamente. Configurar variables antes de iniciar el proceso; consultar [backend/README.md](../backend/README.md) para `SESSION_SECRET`, `FRONTEND_ORIGIN`, `AUTH_DATA_FILE` y el primer admin.

## 7. Riesgos y pendientes que no deben ocultarse

- Login/Register y la sesion compartida ya existen; el ID manual y las rutas de turnos sin permisos aun son deuda conocida.
- No hay backend funcional de Gym, Cumpleanos o Torneos ni generador de fixture.
- Cumpleanos y reservas comparten cancha; no validar su disponibilidad como recursos independientes al confirmar ocupaciones.
- Persistencia de cuentas en archivo y sesiones en memoria son para una sola instancia local, no para produccion.
- No se implementaron recuperacion de contrasena ni verificacion de email; no prometidas para este paso.
- La instalacion reporto tres alertas altas en dependencias de desarrollo de nodemon. No se ejecuto una actualizacion forzada incompatible; revisar por separado.
- Faltan fidelidad visual de todas las pantallas, recursos originales y una verificacion final de las tres partes de la consigna. Pruebas exitosas no equivalen a cumplimiento visual completo.

Al retomar, leer los archivos actuales antes de editar, conservar cambios ajenos y verificar cada avance con la prueba mas pequena que pueda detectar un fallo. No inventar informacion del negocio ni presentar un mock como una operacion real.
