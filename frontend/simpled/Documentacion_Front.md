## 1. CSS y Responsive Design

### 1.1 Puntos de ruptura (Breakpoints)

El proyecto utiliza **Tailwind CSS** como base para la gestión de estilos y el diseño responsive. Se emplean los breakpoints estándar de Tailwind:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

No se han personalizado los breakpoints en la configuración, lo que garantiza compatibilidad y predictibilidad en todos los dispositivos.

### 1.2 Adaptaciones y utilidades responsive

- **Contenedores y paddings**: Ajuste automático de paddings laterales en móviles para mejorar la legibilidad.
- **Tipografía**: Reducción progresiva del tamaño de los títulos (`h1`, `h2`, `h3`) en pantallas pequeñas.
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

- Pruebas manuales en dispositivos reales y emuladores (móvil, tablet, escritorio).
- Verificación visual de la correcta adaptación de menús, formularios, tablas, gráficos y modales.
- Comprobación de la usabilidad de los modales y notificaciones en móvil.
- Pruebas de accesibilidad visual: contraste, tamaño de fuente, foco en formularios y navegación por teclado.

### 1.5 Calidad del código y estructura CSS

- Uso de utilidades de Tailwind para mantener el CSS limpio, reutilizable y fácil de mantener.
- Separación de estilos globales en `app/globals.css` y uso de clases utilitarias en los componentes.
- Componentes desacoplados y reutilizables.
- Configuración de Prettier (`.prettierrc.json`) y ESLint (`.eslintrc.json`) para asegurar buenas prácticas y estilo consistente.
- Integración de `prettier-plugin-tailwindcss` para ordenar automáticamente las clases Tailwind.

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

---

**Autores:** Desarrolladores de Simpled. Adrián Jiménez Santiago y Elías Robles Ruíz

**Fecha:** Junio 2024
