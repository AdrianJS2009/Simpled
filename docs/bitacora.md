# 📘 Bitácora de Desarrollo - Proyecto TFG: Simpled

Registro de tareas realizadas durante el desarrollo del proyecto **Simpled**.

---

| Fecha       | Autor           | Tarea Realizada                                                                 |
|-------------|------------------|----------------------------------------------------------------------------------|
| 2025-03-18  | Adrián Jiménez   | Estructura inicial del backend con ASP.NET Core 8                               |
| 2025-03-19  | Elías Robles     | Creación de entidades: User, Board, Column, Item, Content                       |
| 2025-03-20  | Adrián Jiménez   | Configuración JWT para autenticación y protección de rutas                      |
| 2025-03-21  | Elías Robles     | Implementación de UserController + DTOs                                         |
| 2025-03-22  | Ambos            | Login con AuthController y roles con claims en JWT                              |
| 2025-03-23  | Adrián Jiménez   | CRUD completo para Items + Upload de ficheros                                   |
| 2025-03-23  | Elías Robles     | CRUD de Columns con validación de BoardId existente                             |
| 2025-03-24  | Ambos            | CRUD de Boards y validación de OwnerId                                          |
| 2025-03-24  | Adrián Jiménez   | Configuración de Swagger con autenticación Bearer                               |
| 2025-03-25  | Elías Robles     | Reestructuración en DTOs + protección de endpoints con [Authorize]              |
| 2025-03-25  | Ambos            | Preparación de anteproyecto en Notion y redacción del Readme.md                 |
| 2025-03-25  | Elías Robles     | Creación del esqueleto de front y algunas páginas de prueba                     |
| 2025-03-25  | Elías Robles     | Elección de fuentes y colores para la web + Creación de navbar                  |
| 2025-03-25  | Elías Robles     | Creación form login y registro + Agregar ShadCN + Toggle temas Claro/Oscuro     |
| 2025-03-28  | Adrián Jiménez   | Refactor completo a arquitectura por servicios + inyección de dependencias      |
| 2025-03-28  | Adrián Jiménez   | Implementación de excepciones personalizadas y middleware global                |
| 2025-03-28  | Adrián Jiménez   | CRUD completo para BoardMembers con soporte para inserción única o múltiple     |
| 2025-03-28  | Adrián Jiménez   | Aplicación de control de roles (`admin`, `editor`, `viewer`) en endpoints       |
| 2025-03-28  | Elías Robles     | Componentes navbar burguer, banner y footer con responsive para toda la web     |
| 2025-03-28  | Elías Robles     | Landing page responsive con componentes creados                                 |
| 2025-03-29  | Elías Robles     | Creación del context de auth, arreglos a algun textos                           |
| 2025-03-29  | Elías Robles     | Vincular los forms de login y registro con el context, cambios al layout        |
| 2025-03-29  | Adrián Jiménez   | Gestión completa de tableros por usuario con rol `admin` por defecto            |
| 2025-03-29  | Adrián Jiménez   | Filtrado de tableros públicos si no hay sesión, y propios si el usuario está logueado |
| 2025-03-29  | Adrián Jiménez   | Vista de tableros `/boards` terminada con botón editar/eliminar según propietario |
| 2025-03-29  | Adrián Jiménez   | Implementación de vista de detalle del tablero con columnas, items y miembros   |
| 2025-03-29  | Adrián Jiménez   | Correcciones en rutas dinámicas con `params.id` y errores con parse de tokens   |
| 2025-03-30  | Elías Robles     | Creacion de layout para un tablero individual                                   |
| 2025-03-30  | Elías Robles     | Maquetacion e intento de sidebar colapsable para la vista de tablero/id         |
| 2025-03-30  | Elías Robles     | Investigar como incluir TinyMCE para las tablas y los elementos                 |
| 2025-03-30  | Adrián Jiménez   | Implementación de creación de columnas e ítems desde la vista de tablero        |
| 2025-03-30  | Adrián Jiménez   | Integración de permisos personalizados para crear, editar y borrar ítems        |
| 2025-04-04  | Adrián Jiménez   | Implementación del sistema de invitaciones (crear, aceptar, rechazar) con SignalR y tokens |
| 2025-04-04  | Adrián Jiménez   | Creación del `SignalRContext` en el frontend y conexión global con eventos en tiempo real  |
| 2025-04-04  | Adrián Jiménez   | Corrección del filtrado de tableros por propiedad (`OwnerId`) y mejoras en visibilidad de boards |
| 2025-04-04  | Adrián Jiménez   | Verificación de toast en frontend, pruebas de eventos simultáneos en Swagger y conexión entre usuarios |
| 2025-04-04  | Elías Robles     | Mejoras visuales, mas componetizacion para reusabilidad de los componentes de link en el sidebar de tablero |
| 2025-04-05  | Elías Robles     | Mejoras visuales de la interfaz, mejoras visuales al Board y intento de Sidebar dinámico, aun queda cosas por implementar  |
| 2025-04-06  | Elías Robles     | Figma y inicio del sistema de gamificacion sin exito  |
| 2025-04-05  | Adrián Jiménez   | Vista "Sobre Nosotros" maquetada e implementada  |
| 2025-04-05  | Adrián Jiménez   | Figma: Paleta de colores, tipografia, componentes iniciales, vistas Landing y Registro/Login  |
| 2025-04-11  | Elías Robles     | Rutas restringidas en el front, reintento del sistema gamificación |
| 2025-04-13  | Elías Robles     | Continuacion sistema gamificación |
| 2025-04-20  | Elías Robles     | Continuacion sistema gamificación y preparacion de endpoints, controller y fix de lógica |
| 2025-04-21 | Adrián Jiménez    | Implementación completa de funcionalidad Drag & Drop para tareas entre columnas utilizando @dnd-kit/core |
| 2025-04-21  | Elías Robles     | Vista perfil, logica de authcontext para perfil y inicio vista logros |
| 2025-04-23  | Elías Robles     | Vista perfil tweaks, vista logros y modal de editar en front, endpoints de logros en back |
| 2025-04-23  | Elías Robles     | Instalación y ejecucion de prettier en el front |
| 2025-04-23  | Elías Robles     | Refactorización de variables, atributos y metodos de español a inglés |
| 2025-04-25  | Elías Robles     | Refactorización de variables de front, registro con nombre y foto, backend con foto, prettier, arreglos visuales |
| 2025-04-26  | Elías Robles     | Modificar perfil en backend |
| 2025-04-27  | Elías Robles     | Actualizar con las recomendaciones de la reunion del viernes, arreglos menores y nueva seccion del Navbar |
| 2025-04-27  | Adrián Jiménez   | Implementación de autenticación con GitHub y Google; mejoras en la vista de Gantt |
| 2025-04-28  | Adrián Jiménez   | Corrección de problemas detectados por SonarLint en frontend (uso de keys, accesibilidad, props readonly) |
| 2025-04-28  | Adrián Jiménez   | Refactorización y optimización de Gantt Chart (uso de `useMemo`, teclas accesibles, mejores keys) |
| 2025-04-28  | Adrián Jiménez   | Corrección de Contexts (`AuthContext`, `BoardsContext`) asegurando performance con `useMemo` |
| 2025-04-28  | Adrián Jiménez   | Refactorización de `Navbar` separando NavItems y solucionando problemas de tipos (`string | null`) |
| 2025-04-28  | Adrián Jiménez   | Mejoras visuales y de accesibilidad en componentes (role="button", tabindex, keydown handlers) |
| 2025-04-30  | Adrián Jiménez   | Implementación de gestión de **Teams**: modelos, DTOs, repositorios y servicios en backend |
| 2025-04-30  | Adrián Jiménez   | Endpoints de **Team** y **TeamMember** (CRUD, control de permisos) |
| 2025-04-30  | Adrián Jiménez   | Sistema de **TeamInvitations**: Create/Get/Accept/Reject y notificaciones en tiempo real con SignalR |
| 2025-04-30  | Adrián Jiménez   | Ajustes en `BoardHub` para eventos relacionados con invitaciones a equipos |
| 2025-04-30  | Adrián Jiménez   | Frontend de **Teams**: vista `/equipos`, componentes `TeamsList`, `TeamsPage`, `TeamCreateModal`, `TeamDetailModal` |
| 2025-04-30  | Adrián Jiménez   | Integración de flujos de invitación, aceptación y rechazo + TeamContext |
| 2025-04-30  | Adrián Jiménez   | Maquetación con ShadCN, manejo de estados, mensajes de vacío y consistencia visual en la vista de equipos |
| 2025-05-01  | Elías Robles     | Arreglos de los que hablamos en el video (modificar perfil) |
| 2025-05-01  | Elías Robles     | Arreglar ruta de equipo, fallo al desloguearte |
| 2025-05-01  | Elías Robles     | Inicio `/login-callback` de backend |
| 2025-05-01  | Elías Robles     | Inicio react-count-up para la vista de nosotros |
| 2025-05-04  | Elías Robles     | Finalizacion `/login-callback` de frontend |
| 2025-05-04  | Elías Robles     | Frontend y backend sistema de favoritos |
| 2025-05-05  | Adrián Jiménez   | Implementación de WS relaciadas con Columnas e Items, actualización a tiempo real de Items para todos los usuarios |
| 2025-05-05  | Adrián Jiménez   | Implementación de notificaciones de escritorio a través de la API `Notification` del navegador. |
| 2025-05-06  | Elías Robles     | Arreglo calendario  |
| 2025-05-06  | Elías Robles     | Finalizacion lista de tableros favoritos  |
| 2025-05-06  | Adrián Jiménez   | Implementado tablero a través de Day-Picker, agregado subtareas en los items de una columna, implementación de dependencias entre tareas |
| 2025-05-06  | Adrián Jiménez   | Fixes varios gracias a Sonar, limpieza de codigo|
| 2025-05-08  | Adrián Jiménez   | Implementación de combinaciones de teclas para acciones rapidas|
| 2025-05-08  | Adrián Jiménez   | Implementación de comentarios en tareas, y historial de acciones en Columnas |
| 2025-05-09  | Adrián Jiménez   | Documentación de toda la parte backend, refactorizacion y limpieza de código backend. |
| 2025-05-09  | Adrián Jiménez   | Implementado `Frame`, una libreria para implentar animaciones a componentes del Front, implmentadas animaciones varias a lo largo de la app web. |
| 2025-05-09  | Adrián Jiménez   | Implementada funciones de navegación/acceso rápido mediante combinaciones de teclas. |
| 2025-05-12  | Adrián Jiménez   | Figma vistas; Login/Registro - Perfil/Logros - Tableros/Gestión/Gantt - Sobre Nosotros |
| 2025-05-12  | Adrián Jiménez   | Arreglos de toda la parte de comentarios y historial de actividad |
| 2025-05-12  | Adrián Jiménez   | Implementación de CRUD de miembros en vista Tableros, y Chat en Tableros y Equipos |
| 2025-05-12  | Elías Robles     | Arreglos visuales front   |
| 2025-05-12  | Elías Robles     | Reactcountup funcional en el sobre nosotros |
| 2025-05-13  | Elías Robles     | Inicio despliegue básico, testing de compilación, pruebas |
| 2025-05-14  | Elías Robles     | Despliegue con base de datos |
| 2025-05-15  | Elías Robles     | TinyMCE integrado en algunas partes del front y testing con el backend |
| 2025-05-17  | Adrián Jiménez   | Implementación de `SSE` en las notificaciones, contador en las notificaciones visuales y revisado el responsive de la app en general |
| 2025-05-18  | Elías Robles   | Vista Admin y arreglos al navbar |
| 2025-05-18  | Elías Robles   | Figma vistas faltantes |
| 2025-05-18  | Adrián Jiménez   | Arregladas todas las referencias de `Simpled`a `Simpled.`, implementado el flujo de funcionamiento de admin en la vista Admin con validaciones |
| 2025-05-18  | Adrián Jiménez   | Mejorado el diseño del modal de los equipos y traducido al español palabras sueltas que teniamos en ingles, como `Dashboard`o `Viewer`|
| 2025-05-19  | Elías Robles   | Figma interacciones |
| 2025-05-20  | Elías Robles   | Figma navbar |
| 2025-05-22  | Elías Robles   | Despliegue intento de code deploy |
| 2025-05-22  | Elías Robles   | Despliegue ftp |
| 2025-05-22  | Elías Robles   | Despliegue cloudformation |
| 2025-05-23  | Elías Robles   | Plantillas de cloudformation BBDD, Backend |
| 2025-05-24  | Elías Robles   | Plantilla de cloudformation Frontend |
| 2025-05-24 | Adrián Jiménez | Revisión y refactorización completa del flujo OAuth (Google/GitHub): nombre e imagen de perfil dinámicos, actualización en cada login, y protección de edición de email/contraseña. |
| 2025-05-24 | Adrián Jiménez | Validación y refuerzo de unicidad de email en el registro.|
| 2025-05-24 | Adrián Jiménez | Corrección de la visualización de imágenes de perfil externas (Google/GitHub) en el frontend. |
| 2025-05-25 | Adrián Jiménez | Refactorización de DTOs para exponer correctamente los campos IsExternal y Provider al frontend. |
| 2025-05-25 | Adrián Jiménez | Refactorización y implementado dinamismo de las cards del dashboard: tareas completadas esta semana, pendientes hoy y distribución de tareas por estado. |
| 2025-05-25 | Adrián Jiménez | Corrección y mejora del registro de actividad reciente: mapeo de acciones, visualización de comentarios. |
| 2025-05-26  | Elías Robles   | Final figma por ahora |
| 2025-05-27  | Elías Robles   | Cloudformation + route 53 (fase de pruebas) |
| 2025-05-28  | Elías Robles   | Cloudformation back + front (fase de pruebas) |
| 2025-05-28  | Elías Robles   | Cloudformation LB Externo (fase de pruebas) |
| 2025-05-30  | Elías Robles   | Cloudformation resolucion de errores |
| 2025-06-01  | Elías Robles   | Cloudformation no funciona aún |
| 2025-06-02  | Elías Robles   | Cloudformation problemas con Route 53 como enrutador |
| 2025-06-03  | Elías Robles   | Cloudformation buscando soluciones al Route 53 |
| 2025-06-04  | Elías Robles   | Cloudformation puente entre backend y Load balancer roto |
| 2025-06-05  | Elías Robles   | Cloudformation intento de https con certificado externo y autofirmado |
| 2025-06-06  | Elías Robles   | Cloudformation funcionando con parametros genericos en la primera instancia y todas las configuraciones pertinentes |
| 2025-06-09  | Elías Robles   | Intento de arreglo del despliegue y backend funcionando |
| 2025-06-10  | Elías Robles   | Intento de arreglo del despliegue |
| 2025-06-11  | Elías Robles   | Deploy desde 0 con nueva estructura |
| 2025-06-[del 6 hasta el 13] | Adrián Jiménez | Corrección de múltiples errores tras desplegar, limpieza de código, asistencia en el despliege a Elías, terminar Figma, pasada de plugins como Lightweight o W3C Validator. |

---

📌 *Se continuará completando este fichero durante el resto del desarrollo y revisión previa a la entrega final.*
