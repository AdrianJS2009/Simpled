## 1. CSS y Responsive Design

### 1.1 Puntos de ruptura (Breakpoints)

El proyecto utiliza **Tailwind CSS** como base para la gestión de estilos y el diseño responsive. Se emplean los breakpoints estándar de Tailwind:

- `sm`: 640px - Adaptación para móviles en modo horizontal
- `md`: 768px - Tablets pequeñas y dispositivos móviles grandes
- `lg`: 1024px - Tablets grandes y pantallas pequeñas
- `xl`: 1280px - Pantallas de escritorio estándar
- `2xl`: 1536px - Pantallas grandes y monitores de alta resolución

No se han personalizado los breakpoints en la configuración, lo que garantiza compatibilidad y predictibilidad en todos los dispositivos.

### 1.2 Adaptaciones y utilidades responsive

- **Contenedores y paddings**:

  - Ajuste automático de paddings laterales en móviles (16px) a desktop (24px)
  - Márgenes adaptativos para mantener la legibilidad en diferentes tamaños
  - Grid system flexible que se adapta de 1 a 4 columnas según el viewport

- **Tipografía**:

  - Escala tipográfica responsive:
    - h1: 2.5rem (móvil) → 3.5rem (desktop)
    - h2: 2rem (móvil) → 2.5rem (desktop)
    - h3: 1.5rem (móvil) → 2rem (desktop)
  - Ajuste automático del line-height para mejor legibilidad

- **Componentes específicos**:

  - Kanban: Cambio de layout horizontal a vertical en móviles
  - Gantt: Zoom adaptativo y scroll horizontal en móviles
  - Dashboard: Reorganización de widgets en grid responsive
  - Modales: Ancho completo en móviles, centrado en desktop
  - Tablas: Scroll horizontal en móviles con indicadores visuales

- **Scrollbars**: Scrollbars más finos en tablets y móviles para una experiencia más limpia.
- **Notificaciones**: El contenedor de Toastify se adapta al ancho de la pantalla en móviles.
- **Componentes**: Uso extensivo de utilidades como `flex-col md:flex-row` para cambiar la disposición según el tamaño de pantalla.
- **Soporte dark mode**: Implementado con la opción `darkMode: 'class'` de Tailwind y variables CSS para colores, permitiendo una experiencia visual coherente en ambos temas.

### 1.3 Variables, utilidades y estilos globales

- Variables CSS para colores, radios, y temas claros/oscuro, centralizadas en `globals.css`.
- Utilidades de animación personalizadas (`fade-in`, `slide-up`, etc.) y clases para animaciones (`animate-fadeIn`, etc.).
- Estilos específicos para componentes como Gantt, Toastify, scrollbars y formularios.
- Uso de fuentes personalizadas (Figtree) para una identidad visual moderna.

### 1.4 Pruebas de responsive y calidad visual

- **Pruebas manuales**:

  - Dispositivos móviles: iPhone SE, iPhone 12/13/14, Samsung Galaxy S21/S22
  - Tablets: iPad Mini, iPad Pro, Samsung Tab S7
  - Desktop: Monitores 1080p, 1440p y 4K
  - Navegadores: Chrome, Firefox, Safari, Edge.

- **Pruebas automatizadas**:

  - Lighthouse para rendimiento y accesibilidad
  - Validación de W3C y WCAG 2.1

- **Métricas de calidad**:
  - Performance Score: >90
  - Accessibility Score: >95
  - Best Practices Score: >95
  - SEO Score: >90

### 1.5 Calidad del código y estructura CSS

- **Metodología y organización**:

  - Atomic Design para componentes
  - BEM para nomenclatura de clases personalizadas
  - CSS Modules para estilos específicos de componentes
  - Variables CSS para temas y configuración global

- **Optimizaciones**:

  - PurgeCSS para eliminar CSS no utilizado
  - Minificación en producción
  - Lazy loading de componentes pesados
  - Optimización de imágenes con next/image

- **Herramientas de desarrollo**:
  - ESLint con reglas específicas para CSS/SCSS
  - Stylelint para mantener consistencia
  - Prettier para formateo automático

## 2. Framework, Librerías y Buenas Prácticas

### 2.1 Librerías de terceros principales

- **Next.js**: Framework principal para React, con sistema de rutas basado en archivos y soporte SSR/SSG.
- **Tailwind CSS**: Utilidades CSS para estilos, responsive y dark mode.
- **Radix UI**: Componentes accesibles y personalizables (`@radix-ui/react-*`), base de la librería de UI propia.
- **React Toastify**: Notificaciones y feedback inmediato al usuario.
- **Framer Motion**: Animaciones y transiciones suaves.
- **@dnd-kit/core y sortable**: Drag & drop avanzado para tableros y tareas.
- **@microsoft/signalr**: Comunicación en tiempo real para colaboración y notificaciones.
- **date-fns**: Manipulación y formateo de fechas.
- **lucide-react**: Iconografía moderna y consistente.
- **pikaday**: Selector de fechas ligero y personalizable.
- **react-countup, react-intersection-observer, recharts**: Métricas animadas, observadores y gráficos para el dashboard.

### 2.2 Sistema de rutas y navegación

- **Next.js App Router**: Estructura de rutas basada en carpetas dentro de `app/`, permitiendo layouts anidados y rutas protegidas.
- **Rutas protegidas**: Layouts y contextos restringen el acceso a rutas bajo `(protected)` y `(admin)`, redirigiendo a usuarios no autenticados o sin permisos.
- **Página no encontrada**: Implementación de una página 404 personalizada (`app/not-found.tsx`).
- **Navegación**: Uso de `useRouter` para navegación programática y control de redirecciones.

### 2.3 Estados y contextos

- **Context API**: Contextos para autenticación (`AuthContext`), tableros (`BoardsContext`), equipos (`TeamsContext`), invitaciones (`InvitationsContext`) y notificaciones en tiempo real (`SignalRContext`).
- **Estados locales**: Uso extensivo de `useState` y `useEffect` para estados locales y asincronía.
- **Reactividad**: Cambios en los datos se reflejan automáticamente en la UI sin necesidad de recargar la página.
- **Prop Drilling**: Evitado gracias al uso de contextos globales.

### 2.4 Fetching de datos y servicios

- **fetch API**: Uso de `fetch` para todas las llamadas a la API, con manejo de errores y estados de carga.
- **Autenticación**: Inclusión de tokens JWT en los headers para rutas protegidas.
- **Reactividad**: Los datos se actualizan automáticamente tras operaciones CRUD.
- **Servicios centralizados**: Carpeta `services/` para lógica de acceso a datos (comentarios, chat, logs, miembros de tablero, etc.).

### 2.5 Gestión y validación de formularios

- **useState**: Manejo de los valores de los formularios y validación básica (campos requeridos, formatos de email, tamaño de archivos, etc.).
- **Validación previa al backend**: Se valida en frontend antes de enviar datos (por ejemplo, tamaño de imagen, formato de email, campos obligatorios).
- **Componentes reutilizables**: Inputs, selects, datepickers y modales para edición y creación de entidades.
- **Soporte para subida de imágenes y archivos** en formularios de perfil y tareas.

### 2.6 Arquitectura de carpetas y ficheros

- **Estructura modular y escalable**:
  - `app/`: Rutas y páginas principales (autenticación, dashboard, tableros, equipos, perfil, administración, etc.).
  - `components/`: Componentes reutilizables (UI, dashboard, gantt-chart, Kanban, formularios, modales, etc.).
  - `components/ui/`: Librería propia de componentes UI (botón, input, select, dialog, sheet, tabla, etc.) basada en Radix UI y Tailwind.
  - `components/dashboard/` y `components/gantt-chart/`: Componentes avanzados para analítica y gestión de proyectos.
  - `contexts/`: Contextos globales para estado compartido.
  - `services/`: Lógica de acceso a datos y API.
  - `lib/`: Utilidades y helpers (animaciones, composición de clases, etc.).
  - `public/`: Recursos estáticos (imágenes, logos, etc.).
  - `types/`: Tipos TypeScript compartidos para robustez y autocompletado.

### 2.7 Gestión de errores

- **try/catch** en todas las operaciones asíncronas.
- **Notificaciones de error**: Uso de Toastify para mostrar errores al usuario.
- **Redirecciones automáticas** en caso de errores de autenticación o permisos.
- **Fallbacks visuales**: Mensajes de error y estados vacíos en la UI.

### 2.8 Modales y notificaciones

- **Modales**: Implementados con componentes propios y Radix UI (`Dialog`, `Sheet`).
- **Notificaciones**: Uso de `react-toastify` para feedback inmediato (éxito, error, advertencia, info).
- **Notificaciones en tiempo real**: Integración con SignalR para eventos colaborativos y banners de conexión.
- **Animaciones**: Transiciones suaves con Framer Motion y clases personalizadas para mejorar la experiencia de usuario.

### 2.9 Persistencia de datos

- **localStorage y sessionStorage**: Persistencia de tokens de autenticación y datos de usuario para mantener la sesión entre recargas.
- **Selección entre localStorage/sessionStorage** según preferencia del usuario (mantener sesión iniciada o no).
- **Gestión de favoritos**: Persistencia de tableros favoritos por usuario.

### 2.10 Tipado y robustez

- **TypeScript**: Todo el proyecto está tipado, con tipos compartidos en `types/` para usuarios, tableros, tareas, comentarios, logs, etc.
- **Configuración estricta** en `tsconfig.json` para evitar errores comunes y mejorar la mantenibilidad.
- **Tipos personalizados** para entidades clave: User, Board, Item, Column, Subtask, Comment, ActivityLog, etc.

### 2.11 Componentes y utilidades destacadas

- **KanbanBoard**: Gestión visual de tareas con drag & drop, edición en tiempo real y subtareas.
- **GanttChart**: Diagrama de Gantt interactivo con dependencias, zoom, filtros y edición en tiempo real.
- **Dashboard**: Estadísticas, gráficos y actividad reciente para una visión global del proyecto.
- **Modales reutilizables**: Para edición, creación, invitaciones, comentarios, etc.
- **Animaciones y feedback**: Transiciones, loaders y feedback visual en todas las acciones.
- **Librería de componentes UI**: Botones, inputs, selects, tablas, popovers, tooltips, avatares, badges, etc., todos accesibles y personalizables.

### 2.12 Pruebas y Calidad

- **Pruebas de integración**:

  - Cypress para flujos completos
  - Pruebas de autenticación y autorización
  - Validación de formularios
  - Comprobación de estados y contextos

- **Pruebas de rendimiento**:

  - Lighthouse CI

- **Calidad de código**:
  - SonarQube análisis
  - Code review guidelines
  - Documentación inline con JSDoc
  - TypeScript strict mode

---

**Autores:** Desarrolladores de Simpled. Adrián Jiménez Santiago y Elías Robles Ruíz

**Fecha:** Junio 2024
