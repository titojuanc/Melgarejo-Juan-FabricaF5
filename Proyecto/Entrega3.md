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
- Panel de reserva con fecha, horario, jugadores, ID de cliente y luces, acordes al contrato de la API.
- Vista de turnos para busqueda, filtro, edicion y eliminacion, completando las operaciones existentes.
- Adaptacion movil: menu expandible, panel apilado y desplazamiento interno de las tablas.
- Importe "A confirmar": no se replica el precio del boceto porque no existe calculo de tarifas en la API.
- No se muestra un usuario autenticado ficticio: la API de autenticacion ya existe, pero Login/Register del frontend sigue pendiente.

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

| Operacion | Metodo y ruta        |
| --------- | -------------------- |
| Listar    | `GET /turnos`        |
| Crear     | `POST /turnos`       |
| Editar    | `PUT /turnos/:id`    |
| Eliminar  | `DELETE /turnos/:id` |

El servicio centralizado procesa `{ success, data }` y lanza errores ante fallos HTTP, JSON invalido o falta de conexion. Los componentes no realizan `fetch` directamente. La URL base es configurable con `VITE_API_URL`.

La creacion envia fecha, inicio, fin, cantidad de jugadores, luces e ID de cliente. El estado inicial "Pendiente" lo decide el backend. El frontend conserva el estado existente al editar; no simula confirmaciones de pago.

Se agrego CORS al backend para la comunicacion entre puertos locales. No se modificaron las reglas del servicio ni la persistencia original.

## Pruebas

`npm --prefix frontend test`: seis pruebas automaticas del servicio HTTP, fechas locales y validaciones.

`npm --prefix frontend run build`: compilacion de produccion, incluyendo la fotografia en el bundle.

Flujos verificados con navegador automatizado contra Express:

1. Envio de formulario invalido y errores de campos.
2. Seleccion de horario y creacion de reserva.
3. Edicion de cantidad de jugadores y actualizacion del listado.
4. Cancelacion del dialogo de eliminacion sin borrar el turno.
5. Eliminacion confirmada y estado vacio del listado.
6. Respuesta HTTP de error, fallo de conexion y reintento.
7. Error visible dentro de un dialogo de edicion.
8. Escape y restauracion del foco al boton que abrio el dialogo.
9. Navegacion movil, ausencia de desbordamiento de pagina y carga de fotografia.

Los registros temporales de las pruebas se eliminaron al finalizar.

## Limites y recursos

El backend guarda las reservas en memoria. Se incorporo autenticacion con registro, login, logout, sesion actual y creacion de empleados y administradores restringida a administradores. Las cuentas y perfiles de cliente persisten en un archivo local; las sesiones estan en memoria. Login/Register del frontend y la adaptacion de turnos a la sesion quedan pendientes del siguiente paso. No hay gestion publica de clientes, gimnasio, membresias, pagos, eventos o torneos.

Las consultas por WhatsApp se simularan para la entrega, sin numero real, enlaces externos ni mensajes enviados. Los paneles de empleado y administrador quedan para una etapa posterior. Contrato y pruebas de autenticacion: [backend/README.md](../backend/README.md).

La comprobacion de superposicion del frontend mejora la experiencia, pero no impide reservas simultaneas entre distintos usuarios. El backend debe imponer esa regla antes de un uso real. Tampoco hay control de acceso para la gestion de turnos.

Fotografia de referencia: [Unsplash, recurso utilizado](https://images.unsplash.com/photo-1459865264687-595d652de67e). No representa de forma verificada el establecimiento. Iconos: Lucide. Tipografias: Barlow y Barlow Condensed mediante Google Fonts, con alternativa sans-serif si no estan disponibles.

La instalacion reporto tres alertas altas en la cadena de dependencias de desarrollo de `nodemon` (`braces`, `chokidar`, `nodemon`). No se aplico `npm audit fix --force` porque propone un cambio incompatible ajeno a esta entrega; queda pendiente revisar esa herramienta de desarrollo. La instalacion del frontend no reporto vulnerabilidades.
