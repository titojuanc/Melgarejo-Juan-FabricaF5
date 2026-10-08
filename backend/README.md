# Backend - Autenticacion

Autenticacion sencilla para la entrega: Express, bcrypt y sesiones por cookie. No se necesita instalar una base de datos. Las cuentas se guardan en `backend/data/auth.json`, excluido de Git; las sesiones estan en memoria y vencen a las cuatro horas. Reiniciar el servidor conserva las cuentas, pero cierra las sesiones.

## Ejecutar y probar

Desde la raiz del repositorio:

```sh
npm --prefix backend install
npm --prefix backend start
npm --prefix backend test
```

Los tests usan archivos temporales y servidores con puertos aleatorios; no crean cuentas reales en el proyecto.

## Endpoints

Todas las respuestas mantienen `{ success: true, data }` o `{ success: false, message }`. No se devuelve la contrasena ni su hash.

| Metodo y ruta         | Acceso                          | Resultado                                    |
| --------------------- | ------------------------------- | -------------------------------------------- |
| `POST /auth/register` | Publico, origen permitido       | Crea cliente y cuenta, inicia sesion; 201.   |
| `POST /auth/login`    | Publico, origen permitido       | Login comun para cliente, empleado y admin.  |
| `GET /auth/me`        | Sesion activa                   | Datos del usuario autenticado.               |
| `POST /auth/logout`   | Origen permitido                | Destruye la sesion y elimina la cookie.      |
| `POST /auth/users`    | Administrador, origen permitido | Crea empleados u otros administradores; 201. |

### Contenido publico

| Metodo y ruta                 | Acceso                              | Resultado                                                        |
| ----------------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| `GET /gym`                    | Publico                             | Membresia normal y horarios destacados visibles en referencia.   |
| `GET /cumpleanos/paquetes`    | Publico                             | Basico, Full y Premium; no incluye precios.                      |
| `POST /cumpleanos/consultas`  | Cliente y origen permitido          | Consulta simulada con 48 h de anticipacion; no persiste ni reserva cancha. |
| `GET /torneos`                | Publico                             | Conteos/estados de referencia marcados `datosDeReferencia`.      |
| `GET /torneos/:id`            | Publico                             | Detalle y tabla parcial; sin DNI ni partidos inventados.         |

El horario completo del gimnasio no se ve en la captura. Los torneos son datos ilustrativos de Figma, no registros reales. Una consulta de cumpleaños valida el paquete y fecha/hora, pero no confirma el evento, no se guarda y no bloquea la cancha.

### Turnos

| Metodo y ruta                     | Acceso                            | Resultado                                                |
| ---------------------------------- | --------------------------------- | -------------------------------------------------------- |
| `GET /turnos/disponibilidad`      | Publico                           | Fecha, horario y estado; sin datos del cliente.          |
| `GET /turnos/mis`                 | Cliente autenticado               | Solo reservas asociadas al cliente de la sesion.         |
| `GET /turnos`, `GET /turnos/:id`  | Empleado o admin                  | Listado y consulta interna.                              |
| `POST /turnos`                    | Sesion y origen permitido         | El cliente se asigna desde la sesion; personal debe indicar uno existente. |
| `PUT/DELETE /turnos/:id`           | Empleado/admin y origen permitido | Actualiza campos permitidos o elimina turno.             |

El backend valida fecha real y futura, horario, cantidad de jugadores, perfil de cliente y superposicion. Un conflicto devuelve 409. Los clientes no pueden cambiar propietario, editar ni cancelar reservas; tampoco pueden consultar el listado interno.

### Operaciones internas

Las rutas bajo `/interno` requieren sesion de empleado o administrador. Ambos roles pueden operar turnos, pagos, membresias, asistencias y torneos; solo el administrador puede crear cuentas internas. Las mutaciones requieren un origen permitido.

| Metodo y ruta                        | Operacion                                           |
| ------------------------------------ | --------------------------------------------------- |
| `GET /interno/clientes`              | Buscar clientes por id/nombre para asociar registros. |
| `GET/POST /interno/pagos`            | Consultar y registrar pagos recibidos manualmente. |
| `GET/POST /interno/gym/membresias`   | Consultar y registrar periodos de membresia.       |
| `GET/POST /interno/gym/asistencias`  | Consultar y registrar asistencia presencial.       |
| `GET/POST /interno/torneos`          | Consultar y crear torneos operativos.              |
| `GET /interno/torneos/:id`           | Consultar equipos, partidos y estadisticas.        |
| `POST /interno/torneos/:id/equipos`  | Cargar un equipo y su cantidad de jugadores.        |
| `POST /interno/torneos/:id/partidos` | Cargar manualmente fecha y resultado de un partido. |

Los pagos guardan el importe ingresado por el personal y deben asociarse a un turno o una membresia; no calculan precios, senas ni recargos. Las membresias registran fechas explicitas, sin tarifa. La asistencia no se bloquea por estado de membresia. Los partidos y resultados son manuales: no se genera fixture ni tabla de puntos/desempates. Las estadisticas operativas se limitan a partidos jugados, ganados, empatados, perdidos y goles.

Estos datos se guardan en `backend/data/operations.json`, excluido de Git. No se mezclan con los torneos ilustrativos de las rutas publicas ni se exponen datos personales en ellas.
La consulta interna de clientes devuelve solo `id` y `nombre`; no permite editar perfiles ni devuelve telefono o email.

Registro:

```json
{
    "nombre": "Ana",
    "apellido": "Perez",
    "telefono": "1155551234",
    "email": "ana@example.test",
    "password": "ContrasenaDeEjemplo123",
    "equipo": "Los verdes"
}
```

El equipo es opcional y no inscribe al usuario en un torneo. El email se normaliza a minusculas y es unico. La contrasena requiere al menos ocho caracteres y un maximo de 72 bytes UTF-8. El registro publico solo permite el rol `cliente`: no puede asignar privilegios ni elegir su `clienteId`.

Login requiere `email` y `password`. El administrador crea cuentas con los mismos datos del registro y `rol: "empleado"` o `rol: "admin"`. Las cuentas internas no generan un perfil de cliente; su `clienteId` es `null`. Crear otra cuenta no reemplaza la sesion del administrador.

Errores: 400 para datos invalidos, 401 para falta de sesion o credenciales incorrectas, 403 para origen o permisos rechazados, 409 para email duplicado o horario ocupado, 413 para cuerpos demasiado grandes y 429 para exceso de intentos. Registro y login comparten un limite de 20 peticiones por IP cada 15 minutos.

## Integracion del frontend

Las peticiones deben incluir `credentials: "include"`. Para POST/PUT/DELETE el navegador envia automaticamente el encabezado `Origin`; los clientes de API o las pruebas manuales deben agregar un origen permitido, por ejemplo `http://localhost:5173`. Se rechazan los origenes ausentes o externos en operaciones que modifican estado, como proteccion CSRF.

Frontend y API deben utilizar el mismo nombre de host para la cookie `SameSite=Lax`: usar ambos con `localhost`, o ambos con `127.0.0.1`. No mezclar `http://127.0.0.1:5173` con `http://localhost:3000` para las sesiones. Login/Register y las rutas de turnos utilizan esta misma cookie.

La cookie `fabrica.sid` es HttpOnly, SameSite=Lax y Secure en produccion. La sesion se regenera al registrar o iniciar sesion; el servidor consulta el rol real de la cuenta, no un rol enviado por el navegador. Las respuestas de autenticacion no se almacenan en cache.

## Primera cuenta administradora

No hay credenciales predeterminadas ni un endpoint publico para crear administradores. Ejecutar el siguiente procedimiento directamente en una terminal local; no compartir la contrasena por chat. Completar los datos no sensibles con los de la cuenta deseada:

```powershell
$env:ADMIN_NOMBRE = "Nombre"
$env:ADMIN_APELLIDO = "Apellido"
$env:ADMIN_TELEFONO = "1155551234"
$env:ADMIN_EMAIL = "administracion@example.test"
$password = Read-Host "Contrasena del primer administrador" -AsSecureString
$credential = [System.Net.NetworkCredential]::new("", $password)
try {
    $env:ADMIN_PASSWORD = $credential.Password
    npm --prefix backend run create-admin
} finally {
    Remove-Item Env:ADMIN_PASSWORD -ErrorAction SilentlyContinue
    $credential = $null
    $password = $null
}
```

El comando solo funciona si aun no hay administradores. Las cuentas internas posteriores se crean con `POST /auth/users`, autenticado como administrador. Si se crea la primera cuenta mientras el servidor ya esta abierto, reiniciarlo para que lea el archivo actualizado.

## Configuracion y limites

Configuracion por variables de entorno antes de iniciar Node; no se cargan archivos `.env` automaticamente:

- `PORT`: puerto del backend, por defecto 3000.
- `FRONTEND_ORIGIN`: origenes permitidos separados por comas; por defecto localhost y 127.0.0.1 en 5173 y 5174.
- `AUTH_DATA_FILE`: ruta del archivo local de cuentas, opcional.
- `SESSION_SECRET`: secreto de al menos 32 caracteres. En desarrollo se genera uno aleatorio si no se configura. En produccion es obligatorio.
- `NODE_ENV=production`: activa cookies Secure; requiere HTTPS y configuracion adecuada del despliegue.

El archivo local soporta una unica instancia del backend. Las altas simultaneas en esa instancia verifican nuevamente la unicidad del email y escriben usuario y cliente juntos mediante reemplazo de archivo. Un archivo danado provoca un error: no se borra ni se reinicia silenciosamente. Las sesiones en memoria y este almacenamiento son para la entrega, no para un despliegue productivo con multiples instancias.

Los middlewares `requireAuthentication`, `requireRoles` y `requireTrustedOrigin` protegen las operaciones de turnos. Los paneles internos, recuperacion de contrasena y verificacion de email quedan pendientes.

WhatsApp sera simulado en la entrega, sin mensajes ni enlaces reales. El backend implementa autenticacion y turnos ligados a la sesion.
