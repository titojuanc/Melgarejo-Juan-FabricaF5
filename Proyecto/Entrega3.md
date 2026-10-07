# Entrega 3 - Desarrollo del Frontend

## Objetivo y alcance

Interfaz React para La Fabrica Futbol 5, integrada con la API Express de turnos de la Entrega 2. Incluye alta, consulta, edicion y eliminacion. La informacion de reservas se obtiene exclusivamente del backend, sin datos de demostracion dentro de los componentes.

## Organizacion por responsabilidades

| Ubicacion                         | Responsabilidad                                                                                                 |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `frontend/src/assets`             | Fotografia local de referencia.                                                                                 |
| `frontend/src/components`         | Layout, calendario semanal, formulario de turnos, dialogo, carga, notificaciones y estado compartido de turnos. |
| `frontend/src/pages`              | Reserva, gestion de turnos, Home y secciones informativas.                                                      |
| `frontend/src/services/turnos.js` | URL configurable, peticiones HTTP, interpretacion de respuestas y errores.                                      |
| `frontend/src/services/auth.js`   | Login, registro, sesion actual, logout y manejo comun de errores HTTP.                                          |
| `frontend/src/components/AuthProvider.jsx` | Estado compartido de usuario y recuperacion inicial de sesion.                                         |
| `frontend/src/utils`              | Fechas locales, semana, horarios, superposicion y validaciones.                                                 |
| `frontend/src/styles`             | Estilos generales, responsive y estados visuales.                                                               |
| `frontend/src/App.jsx`            | Rutas y organizacion general.                                                                                   |
| `frontend/src/main.jsx`           | Montaje de React y proveedores.                                                                                 |

La configuracion de Vite, dependencias y HTML de entrada estan fuera de `src`; toda la implementacion de la aplicacion esta dentro de `frontend/src`.

## Diseno original

[La Fabrica Futbol 5 - Wireframe Web](https://www.figma.com/design/BzSyxA0BZY462Cntvvr5Dr/La-F%C3%A1brica-F%C3%BAtbol-5---Wireframe-Web?node-id=0-1).

Se verifico visualmente la pantalla "03 - Reservar Cancha" en la presentacion de Figma. Se conservan su encabezado y pie oscuros, grilla semanal de siete dias, disponibilidad verde/gris y panel lateral oscuro con acento amarillo.

### Mejoras justificadas

- Estados de horarios escritos ademas del color, con botones semanticos y etiquetas accesibles.
- Navegacion entre semanas y actualizacion de la disponibilidad.
- Panel de reserva con fecha, horario, jugadores y luces. El cliente no ingresa ID: el servidor lo obtiene de la sesion; el campo interno solo aparece para personal.
- Vista de reservas propias para clientes, sin edicion ni cancelacion; personal autorizado conserva busqueda, filtro, edicion y eliminacion.
- Adaptacion movil: menu expandible, panel apilado y desplazamiento interno de las tablas.
- Importe "A confirmar": no se replica el precio del boceto porque no existe calculo de tarifas en la API.
- Login/Register utiliza la API de autenticacion, restaura la sesion al iniciar y ofrece cierre de sesion desde la navegacion. El registro publico crea clientes; no permite elegir roles internos.

Las restantes secciones del boceto mantienen enlaces de navegacion, pero no se presentan como funcionalidades implementadas. Su composicion visual completa y las ilustraciones originales quedan pendientes de acceso a los recursos correspondientes y de los endpoints necesarios.

## Componentes reutilizables y experiencia de usuario

El formulario se comparte entre reserva y edicion; el dialogo se utiliza para edicion y confirmacion de eliminacion; el componente de carga y el sistema de notificaciones se utilizan en todas las operaciones de turnos.

- Consulta inicial y actualizacion con indicador de carga.
- Botones bloqueados mientras se guardan o eliminan registros.
- Exitos y errores mediante el mismo sistema de notificaciones, sin `alert()`.
- Errores de campos asociados a sus inputs y foco en el primer campo invalido.
- Comprobacion de fecha real, horario futuro, fin posterior al inicio, cantidades e IDs enteros positivos y superposicion con reservas cargadas.
- Confirmacion antes de eliminar y opcion de cancelar sin modificar datos.
- Recuperacion de errores de conexion con reintento.
- Estados vacios y busquedas sin resultados.

## Accesibilidad

HTML en espanol; regiones semanticas de encabezado, navegacion, contenido y pie; enlace para saltar al contenido; un titulo principal por pantalla; labels asociados; botones con nombres accesibles; tablas con titulos y encabezados; imagen con texto alternativo; mensajes mediante `status` o `alert`; foco visible; dialogos nativos con contencion de foco, Escape y restauracion del foco al cerrar; respeto a la preferencia de movimiento reducido.

Las notificaciones se colocan dentro del dialogo activo para no quedar ocultas detras del fondo modal ni fuera de su region accesible. Se comprobaron etiquetas y ancho de pagina en una pantalla de 390 px, ademas de la captura de escritorio. Estas comprobaciones basicas no equivalen a una auditoria WCAG completa.

## Integracion con la API

| Operacion             | Metodo y ruta                    | Acceso                                        |
| --------------------- | -------------------------------- | --------------------------------------------- |
| Disponibilidad        | `GET /turnos/disponibilidad`     | Publico; solo fecha, horario y estado.        |
| Reservas propias      | `GET /turnos/mis`                | Cliente autenticado; filtra por sesion.       |
| Listado y consulta    | `GET /turnos`, `GET /turnos/:id` | Empleado o admin.                             |
| Crear                 | `POST /turnos`                   | Sesion; clienteId del cliente viene del servidor. |
| Editar y eliminar     | `PUT/DELETE /turnos/:id`         | Empleado o admin; origen local permitido.    |

Los servicios centralizados procesan `{ success, data }` y lanzan errores ante fallos HTTP, JSON invalido o falta de conexion. Las peticiones incluyen credenciales de cookie. Un `401` inicial de `/auth/me` indica visitante y no genera una notificacion. Los componentes no realizan `fetch` directamente. La URL base es configurable con `VITE_API_URL`; Vite y la API usan `localhost` para compartir el host de la cookie.

`/cuenta` reproduce los formularios de ingreso y registro del frame 1-4. El registro publico valida los campos del contrato de API y deja equipo como opcional. Al iniciar sesion o registrarse, la navegacion vuelve al flujo publico de reserva; el encabezado muestra la cuenta y permite cerrar sesion. No se almacena la contrasena ni se construyen paneles internos.

El backend valida fechas reales y futuras, horas, cantidades y superposicion; devuelve 409 si el horario ya fue ocupado. La actualizacion valida campos permitidos y no acepta cambiar propietario ni estado. Los clientes no pueden editar ni cancelar sus reservas. El estado inicial "Pendiente" lo decide el backend; no se simulan confirmaciones de pago.

Las mutaciones exigen una sesion y un origen confiable. El personal solo puede asignar reservas a un perfil de cliente existente.

### Contenido publico

| Metodo y ruta                  | Resultado                                                           |
| ------------------------------ | ------------------------------------------------------------------- |
| `GET /gym`                     | Membresia normal y cuatro horarios destacados; horario completo no disponible. |
| `GET /cumpleanos/paquetes`     | Basico, Full y Premium segun referencia; no hay precios publicados. |
| `POST /cumpleanos/consultas`   | Cliente autenticado; valida 48 horas y devuelve consulta simulada sin persistir ni bloquear cancha. |
| `GET /torneos`                 | Conteos/estados de referencia, marcados `datosDeReferencia`.         |
| `GET /torneos/:id`             | Tabla parcial disponible; partidos vacios si no hay fixture real.   |

Las capturas incluyen valores de ejemplo para Torneos, no registros operativos. No se exponen DNI ni se inventan fixture, resultados o precios. El horario completo, vencimientos, pagos y asistencias de Gym no estan disponibles como datos reales.

## Pruebas

`npm --prefix frontend test`: nueve pruebas automaticas de autenticacion, servicios HTTP, fechas locales y validaciones.

`npm --prefix backend test`: dieciocho pruebas de autenticacion, turnos, contratos publicos y consultas simuladas.

`npm --prefix frontend run build`: compilacion de produccion, incluyendo la fotografia en el bundle.

Los flujos CRUD siguientes se verificaron en una iteracion previa a la proteccion de rutas por rol:

1. Envio de formulario invalido y errores de campos.
2. Seleccion de horario y creacion de reserva.
3. Edicion de cantidad de jugadores y actualizacion del listado.
4. Cancelacion del dialogo de eliminacion sin borrar el turno.
5. Eliminacion confirmada y estado vacio del listado.
6. Respuesta HTTP de error, fallo de conexion y reintento.
7. Error visible dentro de un dialogo de edicion.
8. Escape y restauracion del foco al boton que abrio el dialogo.
9. Navegacion movil, ausencia de desbordamiento de pagina y carga de fotografia.

Verificaciones con el contrato actual:

1. En navegador, `/auth/me` sin sesion devuelve 401 silencioso y la disponibilidad publica carga; el formulario solicita ingresar y no muestra ID de cliente.
2. Con rol cliente simulado en navegador, el formulario omite el ID y la tabla propia no muestra columna Cliente ni acciones.
3. Pruebas HTTP aisladas con sesiones y repositorios temporales verifican propiedad, roles, origen confiable, sanitizacion publica, IDs internos existentes y conflictos.
4. Pruebas HTTP de endpoints Gym, paquetes, torneos, detalle y consulta de cumpleaños autenticada, sin persistencia ni bloqueo.

Los registros temporales de las pruebas se eliminaron al finalizar.

## Limites y recursos

El backend guarda las reservas en memoria. La disponibilidad es publica y saneada; cada cliente consulta unicamente sus reservas y el personal puede gestionar el listado completo. La sesion determina el cliente al reservar; solo el personal puede editar o eliminar. Login/Register, turnos y contratos de lectura pública estan implementados. La UI de Gym/Cumpleaños/Torneos, registros reales de membresia/pagos/asistencia y fixture siguen pendientes.

Las consultas por WhatsApp se simularan para la entrega, sin numero real, enlaces externos ni mensajes enviados. Los paneles de empleado y administrador quedan para una etapa posterior. Contrato y pruebas de autenticacion: [backend/README.md](../backend/README.md).

La comprobacion de superposicion del frontend mejora la experiencia y el backend vuelve a validarla antes de crear o editar, para impedir conflictos concurrentes en esta instancia local. La persistencia de turnos sigue en memoria.

Fotografia de referencia: [Unsplash, recurso utilizado](https://images.unsplash.com/photo-1459865264687-595d652de67e). No representa de forma verificada el establecimiento. Iconos: Lucide. Tipografias: Barlow y Barlow Condensed mediante Google Fonts, con alternativa sans-serif si no estan disponibles.

La instalacion reporto tres alertas altas en la cadena de dependencias de desarrollo de `nodemon` (`braces`, `chokidar`, `nodemon`). No se aplico `npm audit fix --force` porque propone un cambio incompatible ajeno a esta entrega; queda pendiente revisar esa herramienta de desarrollo. La instalacion del frontend no reporto vulnerabilidades.
