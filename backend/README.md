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

Errores: 400 para datos invalidos, 401 para falta de sesion o credenciales incorrectas, 403 para origen o permisos rechazados, 409 para email duplicado, 413 para cuerpos demasiado grandes y 429 para exceso de intentos. Registro y login comparten un limite de 20 peticiones por IP cada 15 minutos.

## Integracion del frontend

Las peticiones deben incluir `credentials: "include"`. Para los POST el navegador envia automaticamente el encabezado `Origin`; los clientes de API o las pruebas manuales deben agregar un origen permitido, por ejemplo `http://localhost:5173`. Se rechazan los origenes ausentes o externos en operaciones de autenticacion que modifican estado, como proteccion CSRF.

Frontend y API deben utilizar el mismo nombre de host para la cookie `SameSite=Lax`: usar ambos con `localhost`, o ambos con `127.0.0.1`. No mezclar `http://127.0.0.1:5173` con `http://localhost:3000` para las sesiones. La integracion de Login/Register y el ajuste de los servicios del frontend pertenecen al siguiente paso.

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

Los middlewares `requireAuthentication` y `requireRoles` quedan disponibles para los siguientes recursos. Las rutas anteriores de `/turnos` todavia no se protegen ni obtienen el cliente desde la sesion: esa adaptacion se hara junto con el frontend, para no romper el flujo actual durante esta etapa. Los paneles internos, recuperacion de contrasena y verificacion de email quedan pendientes.

WhatsApp sera simulado en la entrega, sin mensajes ni enlaces reales. Esta etapa solo implementa el backend de autenticacion.
