# Funcionalidades y Diseño de la Aplicación

## Pantalla de inicio e ingreso

- Interfaz básica con logo, opción de inicio de sesión con Google y contraseña.
- Acceso a distintas secciones según el rol del usuario.

## Roles y Permisos

- Roles contemplados: vendedor, supervisor, jefe de equipo, jefe de zona, dirección y posibilidad de un rol regional o superusuario.
- Un mismo usuario puede tener múltiples roles simultáneamente.
- Gestión de perfiles: edición de datos personales y de la empresa (nombre, dirección, CIF).

## Generación y Optimización de Rutas con IA

- La aplicación “tu ruta ya” optimiza las visitas comerciales mediante inteligencia artificial.

### Parámetros de entrada para la generación de rutas:

- Selección de sectores (ej. bodegas de vino, peluquerías, centros de estética).
- Definición de la zona geográfica (ciudad, provincia, región, nacional).
- Configuración del número de comerciales disponibles y visitas diarias estimadas.

### La IA calcula automáticamente:

- Número de comerciales necesarios para cubrir una zona en un plazo determinado (ejemplo: Madrid dividido en zonas según la cantidad de negocios y comerciales).
- Orden de visitas basándose en el punto de partida, aglomeración de clientes y distancia.
- Ajustes en tiempo real: reprogramación de visitas si se cancela o pospone una cita, reorganización en función de la jornada laboral.

## Configuración de Campañas y Zonas

- Posibilidad de crear campañas definiendo sectores y zonas de trabajo.

### Opciones:

- Generación automática de rutas mediante IA (usando bases de datos públicas o scraping, como directorios de empresas).
- Importación manual de bases de datos (CSV) para generar rutas con el listado propio de clientes.

### División de zonas:

- La IA puede dividir una ciudad o zona en secciones asignadas equitativamente entre los comerciales.
- Ejemplos: Vigo dividido en zonas, asignación según ubicación y concentración de negocios.

## Integración con Mapas y Geolocalización

- Uso de Google Maps para visualizar rutas y calcular distancias entre puntos de visita.
- Diferenciación entre vista “mapa” y “listado” de visitas.
- Visualización en tiempo real en el panel del supervisor: seguimiento aproximado de ubicaciones y rutas cerradas, sin requerir geolocalización exacta por visitante.

## Calendario y Gestión de Citas

- Calendario para visualizar visitas programadas del día y días futuros.
- Edición y reprogramación de citas según tiempo disponible y duración estimada de cada tipo de visita.
- Tipos de visitas (demostración, pedido, presupuesto) con tiempos preconfigurados para optimizar la jornada.

## Notificaciones y Mensajería

- Distinción entre notificaciones y mensajería interna:
  - Notificaciones: alertas específicas (apertura de nuevo local, cita cancelada, reprogramación).
  - Mensajería interna: se consideró, pero se priorizan notificaciones personalizadas.
- Configuración para que el usuario reciba solo alertas relevantes.

## Gestión de Pedidos, Presupuestos y Catálogo de Productos

- El comercial puede enviar pedidos o solicitar presupuestos desde la app, generando un correo automático en el panel de oficina.
- Catálogo de productos gestionado por un rol autorizado (supervisor o administrador).
- Registro inmediato del resultado de cada visita: “venta realizada” o “visita pospuesta” con anotaciones.

## Inventario y Asignación de Recursos

- Control de dispositivos y material (tablet, smartphone, flyers, etc.) asignados a cada comercial.
- Módulo de inventario integrado en la configuración o panel de administración.

## Estructura de la Base de Datos

- Diseño robusto, con relaciones entre usuarios, visitas, campañas, zonas y productos.
- Roles gestionados como entidad flexible, permitiendo nuevos niveles o combinaciones (administración, marketing, diseño, etc.).
- Persistencia de datos para estadísticas y seguimiento de rendimiento (número de visitas, duración de citas, rutas completadas, etc).

## Aspectos de la Experiencia del Usuario

### Interfaz para Comerciales

- Acceso sencillo a la ruta diaria: listado de visitas optimizadas, orden de recorridos y opción de visualizar la ruta en el mapa.
- Funcionalidad para marcar inicio y fin de cada visita, registrando el estado (cliente ausente, cita reprogramada, venta concluida).
- Pantalla que muestra la jornada laboral en relación con el tiempo disponible y número de visitas planificadas.

### Paneles de Administración y Supervisión

- Visualización consolidada de agentes y estado de cada visita.
- Estadísticas y reportes diarios/semanales sobre efectividad de rutas y conversión de visitas en ventas.
- Gestión de incidencias y ajustes de rutas de última hora (reasignación manual de visitas).

## Interacción y Flexibilidad

- Automatización de rutas mediante IA y posibilidad de intervenciones manuales por el administrador.
- Modificación del listado de visitas mediante filtros (ubicación, sector, prioridad) y búsquedas en tiempo real.

## Elementos Técnicos y Precios

- Integración con APIs externas (ej. Google Maps) para optimización y cálculo de distancias.
- Coste estimado: alrededor de 50 € por usuario al mes.
- Uso posible de scraping o integración con bases de datos públicas para información de empresas y clientes potenciales.
- Fases de desarrollo: versión básica inicial para uso interno y posterior escalabilidad para venta comercial a terceros.
