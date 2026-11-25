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

# Estado de implementación — Entrega 5

El plan activo y el estado por etapas se mantienen en [PlanEntrega5.md](PlanEntrega5.md). Este documento conserva la consigna y sus criterios de evaluación; no debe usarse como plan de trabajo anterior.

Al último avance verificado:

- La disponibilidad, la cancelación propia y el registro manual de pagos tardíos están implementados.
- Las solicitudes de cumpleaños se persisten, pueden consultarse por el cliente y gestionarse desde el panel interno.
- La cancha compartida impide superposiciones entre turnos y cumpleaños confirmados.
- La integración de cumpleaños ya consume los endpoints desde las interfaces de cliente y personal.
- La suite reportó 39 pruebas backend y 14 frontend aprobadas, y el build frontend finalizó correctamente.
- En navegador se verificó el recorrido de solicitud de cliente, confirmación del personal, bloqueo de disponibilidad y persistencia tras reiniciar el backend. La revisión visual responsive de todas las pantallas y la grabación del video siguen pendientes según el plan activo.
