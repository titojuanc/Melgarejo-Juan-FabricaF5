# La Fábrica Fútbol 5

Sistema de reservas de cancha con React y una API Express. Entrega 3: frontend integrado con el recurso de turnos de la Entrega 2.

## Estructura

```text
backend/
    src/
frontend/
    src/
        assets/
        components/
        pages/
        services/
        utils/
        styles/
        App.jsx
        main.jsx
Proyecto/
    Entrega1.md
    Entrega3.md
```

El backend anterior se trasladó de `Proyecto/Backend` a `backend` para cumplir la estructura de esta entrega. Los documentos de entregas se conservan en `Proyecto`.

## Requisitos

Node.js 20.19 o superior y npm. Ejecutar los comandos desde la raíz del repositorio.

## Ejecutar

En una terminal:

```sh
npm --prefix backend install
npm --prefix backend start
```

En otra terminal:

```sh
npm --prefix frontend install
npm --prefix frontend run dev
```

Frontend: http://127.0.0.1:5173. API: http://localhost:3000/turnos. Vite elige el siguiente puerto libre si 5173 está ocupado.

El frontend se ejecuta de forma independiente. Si la API no está disponible, informa el error y permite reintentar; no reemplaza los datos por reservas ficticias.

Para otra API, crear `frontend/.env.local` usando [frontend/.env.example](frontend/.env.example) como referencia. `VITE_API_URL` contiene la URL base del backend, sin `/turnos`.

El backend permite los orígenes locales de Vite en 5173 y 5174. Para otro origen, configurar `FRONTEND_ORIGIN` antes de iniciarlo. En PowerShell:

```powershell
$env:FRONTEND_ORIGIN = "http://localhost:5175,http://127.0.0.1:5175"
npm --prefix backend start
```

## Verificación

```sh
npm --prefix backend test
npm --prefix frontend test
npm --prefix frontend run build
```

Las pruebas cubren el contrato HTTP y las validaciones del formulario. También se verificaron en navegador creación, edición, eliminación y su cancelación, errores HTTP, desconexión y reintento, Escape, restauración del foco, navegación móvil y carga de la imagen.

## Alcance

La reserva semanal respeta la composición del [wireframe original de Figma](https://www.figma.com/design/BzSyxA0BZY462Cntvvr5Dr/La-F%C3%A1brica-F%C3%BAtbol-5---Wireframe-Web?node-id=0-1): encabezado oscuro, disponibilidad verde/gris, reserva lateral y pie de página. La pantalla de gestión completa el CRUD de la API.

La API guarda las reservas en memoria: reiniciar el backend elimina los turnos. La autenticación incluye registro, login, logout, sesión actual y creación de cuentas internas por administradores; las cuentas persisten en un archivo local. El frontend público y Login/Register consumen la API. Contrato y creación del primer administrador: [backend/README.md](backend/README.md).

Las operaciones internas protegidas por rol permiten gestionar turnos, registrar pagos recibidos, membresías, asistencias y datos operativos de torneos. No hay cobros online, cálculo de precios, fixture automático ni mensajes reales de WhatsApp. La foto del Home es una referencia, no una fotografía verificada del establecimiento ni una ilustración exportada de Figma.

Las validaciones de superposición se realizan en el frontend; no garantizan exclusión entre usuarios concurrentes porque el backend todavía no impone esa regla. No debe publicarse como sistema de reservas definitivo sin validación transaccional, persistencia y control de acceso en el servidor.

Detalles, responsabilidades y decisiones: [Proyecto/Entrega3.md](Proyecto/Entrega3.md).

Plan acordado, respuestas del usuario y contexto para continuar el desarrollo: [Proyecto/PlanImplementacion.md](Proyecto/PlanImplementacion.md).
