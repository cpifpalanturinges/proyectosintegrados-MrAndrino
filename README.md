# TeamDraft (by Diverxia)

**TeamDraft** es una aplicación web para gestionar la formación de equipos en un hackatón mediante un sistema de selección por turnos o *draft*. El proyecto está vinculado a **Diverxia Consulting** y permite administrar usuarios, equipos, líderes, participantes, coordinadores y el estado del evento desde una interfaz web responsive.

La aplicación cuenta con una zona de gestión protegida por roles y una API REST que comunica el frontend con el backend.

---

## Información del proyecto

| Dato | Información |
|---|---|
| Título | TeamDraft (by Diverxia) |
| Autor | David Andrino Ferrera |
| Ciclo | Desarrollo de Aplicaciones Web |
| Empresa vinculada | Diverxia Consulting |
| Repositorio | Repositorio privado de GitHub con acceso para el profesorado |
| Anteproyecto | [`ANTEPROYECTO.md`](ANTEPROYECTO.md) / [`Notion`](https://app.notion.com/p/Anteproyecto-3292e73c9ca1801ca3bee15c8fb083d2?v=1132e73c9ca18058a8dc000c85ec9c30&source=copy_link) |
| Esquema E/R | [`docs/er-diagram.pdf`](docs/er-diagram.pdf) |
| Aplicación desplegada | Pendiente de despliegue en AWS |
| Landing page | Pendiente de implementación/despliegue |
| Diseño de la aplicación | Diseño aplicado directamente sobre la interfaz funcional; enlace/capturas pendientes si procede |
| Presentación PDF | Pendiente de añadir |
| Vídeo demostrativo | Pendiente de añadir |

---

## Objetivos del proyecto

- Digitalizar el proceso de formación de equipos durante un hackatón.
- Permitir que los líderes seleccionen participantes mediante un sistema de turnos controlado.
- Centralizar la gestión de usuarios, equipos, coordinadores y estado del evento.
- Ofrecer un panel de administración protegido por roles.
- Exponer una API REST documentada para el consumo desde el frontend.
- Crear una interfaz responsive, usable en móvil, tablet y escritorio.
- Preparar el proyecto para su despliegue en AWS como entrega académica.
- Mantener una base reutilizable para un posible despliegue estable destinado al uso interno de la empresa.

---

## Descripción funcional

TeamDraft resuelve la organización de equipos en un evento tipo hackatón. Los usuarios pueden registrarse como participantes o líderes. Los líderes tienen un equipo asociado y pueden seleccionar participantes disponibles cuando el draft está abierto. Las selecciones quedan registradas en un historial, pueden anularse desde administración y se reflejan en una vista pública pensada para mostrarse en pantalla o proyector.

La parte de gestión permite administrar usuarios, equipos, coordinadores, picks y estado del evento. El acceso a estas funcionalidades está restringido según el rol del usuario autenticado.

---

## Roles de usuario

| Rol | Funciones principales |
|---|---|
| Admin | Gestión completa del sistema, usuarios, coordinadores, equipos, draft, historial y reinicio del evento. |
| Coordinator | Gestión operativa de usuarios, equipos, coordinadores, draft e historial, salvo acciones críticas reservadas al administrador. |
| Leader | Consulta su equipo y selecciona participantes disponibles durante el draft. |
| Participant | Usuario participante del evento, visible para ser seleccionado por líderes si está disponible. |

---

## Tecnologías utilizadas

### Backend

- ASP.NET Core Web API (.NET 8)
- Entity Framework Core
- MySQL
- Pomelo.EntityFrameworkCore.MySql
- JWT Bearer Authentication
- Swagger / OpenAPI
- ImageSharp

### Frontend

- React
- Vite
- TypeScript
- React Router DOM
- CSS3 propio
- SessionStorage
- Prettier

### Base de datos

- MySQL
- Migraciones de Entity Framework Core
- Seeder inicial para datos mínimos del sistema

### Despliegue previsto

- AWS EC2
- Elastic IP
- SSH
- Nginx como servidor web y reverse proxy
- HTTPS con Certbot / Let’s Encrypt
- MySQL en la instancia EC2

---

## Justificación de tecnologías

Los enunciados originales de algunos módulos proponen Laravel, Blade, Laravel Sanctum, Angular y una API PHP. En este proyecto se utiliza una arquitectura alternativa basada en **ASP.NET Core Web API + React + MySQL**, manteniendo las funcionalidades exigidas y adaptando la implementación al contexto tecnológico utilizado durante la fase FCT.

| Requisito original | Equivalencia en TeamDraft |
|---|---|
| Laravel 11/12 | ASP.NET Core Web API (.NET 8) |
| Migraciones Laravel | Entity Framework Core Migrations |
| Semilleros Laravel | `DbSeeder.cs` |
| Laravel Sanctum | JWT Bearer Authentication |
| Blade | React + Vite + TypeScript |
| Middlewares de autenticación/autorización | Middleware de autenticación de ASP.NET Core + `[Authorize]` |
| Rutas protegidas por rol | `[Authorize(Roles = "...")]` |
| Laravel Storage | `PhotoService` + `wwwroot` para almacenamiento de fotos |
| Angular CLI | Vite |
| Angular RouterModule | React Router DOM |
| Angular HttpClientModule | `fetch` centralizado en `apiClient.ts` |
| Observables / @Input / @Output | Estado de React, props y callbacks |
| LocalStorage / SessionStorage | SessionStorage |

---

## Estructura del proyecto

```txt
proyectosintegrados-MrAndrino/
├── backend/
│   └── TeamDraft.Api/
│       ├── Auth/
│       ├── Controllers/
│       ├── Data/
│       ├── DTOs/
│       ├── Entities/
│       ├── Migrations/
│       ├── Services/
│       ├── Program.cs
│       └── TeamDraft.Api.csproj
├── docs/
│   └── er-diagram.pdf
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.ts
├── ANTEPROYECTO.md
├── README.md
└── proyectosintegrados-MrAndrino.sln
```

---

## Esquema E/R

El esquema entidad-relación de la base de datos se encuentra en:

- [`docs/er-diagram.pdf`](docs/er-diagram.pdf)

Entidades principales:

- `User`: representa usuarios, participantes, líderes, coordinadores y administradores.
- `Team`: representa equipos del hackatón.
- `Pick`: representa selecciones realizadas durante el draft.
- `SystemState`: representa el estado global del sistema, especialmente si el draft está abierto o pausado.

---

## API REST

La API REST está desarrollada con ASP.NET Core Web API y documentada mediante Swagger/OpenAPI.

En entorno local, Swagger está disponible al ejecutar el backend en:

```txt
http://localhost:5146/swagger
```

### Endpoints principales

#### Autenticación

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/register` | Registrar usuario |
| GET | `/api/auth/me` | Obtener usuario autenticado |

#### Sistema y draft

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/system/status` | Consultar estado del sistema |
| GET | `/api/admin/system/status` | Consultar estado desde administración |
| POST | `/api/admin/system/draft/open` | Abrir draft |
| POST | `/api/admin/system/draft/pause` | Pausar draft |
| POST | `/api/admin/system/reset` | Reiniciar evento |
| GET | `/api/admin/system/picks` | Consultar historial de picks |
| POST | `/api/admin/system/picks/{pickId}/undo` | Anular pick |
| GET | `/api/admin/system/picks/latest-active` | Obtener última selección activa |

#### Usuarios

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/admin/users` | Listar usuarios |
| GET | `/api/admin/users/{id}` | Obtener detalle de usuario |
| PUT | `/api/admin/users/{id}` | Actualizar usuario |
| PUT | `/api/admin/users/{id}/password` | Cambiar contraseña |
| PUT | `/api/admin/users/{id}/photo` | Cambiar foto |
| DELETE | `/api/admin/users/{id}/photo` | Eliminar foto |
| DELETE | `/api/admin/users/{id}` | Eliminar usuario |

#### Equipos

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/teams` | Listar equipos |
| GET | `/api/teams/{id}` | Obtener detalle de equipo |
| GET | `/api/teams/my-team` | Obtener equipo del usuario líder |
| PUT | `/api/admin/teams/{id}` | Actualizar equipo |
| POST | `/api/admin/teams/{teamId}/members/{userId}/remove` | Expulsar miembro de un equipo |

#### Participantes y picks

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/participants/available` | Listar participantes disponibles |
| POST | `/api/picks` | Realizar una selección |

---

## Seguridad y control de acceso

- Autenticación mediante JWT.
- Token almacenado en `sessionStorage`.
- Rutas privadas en frontend mediante componentes protegidos.
- Endpoints protegidos en backend mediante `[Authorize]`.
- Restricción por roles mediante `[Authorize(Roles = "Admin")]`, `[Authorize(Roles = "Admin,Coordinator")]`, etc.
- Validaciones en backend para proteger la integridad de datos.

La seguridad principal se aplica en el backend. El frontend adapta la navegación y visibilidad de acciones según el rol del usuario autenticado.

---

## Validación de datos

La aplicación valida datos tanto en frontend como en backend.

Ejemplos de validaciones implementadas:

- Campos obligatorios en registro e inicio de sesión.
- Confirmación de contraseña.
- Nombre de usuario único.
- Foto obligatoria en registro de participantes/líderes.
- Habilidades con valores controlados.
- Control de roles válidos.
- Validación de permisos antes de ejecutar acciones administrativas.
- Validación de disponibilidad de participantes antes de realizar picks.

---

## Almacenamiento de archivos

Las fotos de usuario se gestionan desde el backend mediante `PhotoService` y se almacenan en `wwwroot`. La aplicación permite:

- Subir foto durante el registro.
- Cambiar foto de perfil.
- Eliminar foto de perfil.
- Servir imágenes como recursos estáticos.

---

## Instalación y ejecución local

### Requisitos previos

- .NET 8 SDK
- Node.js
- npm
- MySQL Server
- Git

### Backend

```bash
cd backend/TeamDraft.Api
dotnet restore
dotnet ef database update
dotnet run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### URLs locales habituales

```txt
Frontend: http://localhost:5173
Backend:  http://localhost:5146
Swagger:  http://localhost:5146/swagger
```

---

## Tutorial breve de uso

> Las capturas de pantalla o material multimedia deberán añadirse en `docs/` cuando estén preparadas.

### 1. Registro o inicio de sesión

El usuario accede a la pantalla inicial y puede iniciar sesión o registrarse. Durante el registro se solicitan datos personales, foto, estudios, habilidades y, si procede, configuración como líder.

### 2. Acceso a la aplicación

Tras autenticarse, el usuario accede a la interfaz principal. La navegación disponible depende del rol asociado.

### 3. Gestión administrativa

Los usuarios con rol `Admin` o `Coordinator` pueden acceder a las vistas de gestión para consultar usuarios, equipos, coordinadores, estado del draft e historial de selecciones.

### 4. Apertura del draft

Desde el área de sistema se puede abrir o pausar el draft. Cuando el draft está abierto, los líderes pueden seleccionar participantes.

### 5. Selección de participantes

El líder consulta la lista de participantes disponibles, puede buscar u ordenar por habilidades y seleccionar a una persona para incorporarla a su equipo.

### 6. Historial y display

Cada selección queda registrada en el historial. La aplicación incluye una vista pública pensada para mostrar la última selección activa durante el evento.

---

## Landing page

La landing page de presentación del proyecto está pendiente de implementación/despliegue.

Objetivo previsto:

- Presentar TeamDraft.
- Explicar el problema que resuelve.
- Mostrar una introducción visual del flujo de uso.
- Enlazar con la aplicación principal.
- Incluir recursos HTML5 requeridos para el módulo de Diseño de Interfaces.

URL pendiente:

```txt
Pendiente de añadir tras despliegue
```

---

## Diseño de la aplicación

El diseño visual se ha desarrollado de forma iterativa durante la implementación de la aplicación, adaptándose a cambios funcionales y a las necesidades reales del proyecto.

Decisiones principales:

- Interfaz responsive con enfoque mobile-first.
- Uso de colores corporativos de Diverxia Consulting.
- Uso del logotipo/SVG oficial de Diverxia, respetando la identidad visual de la empresa.
- Componentes reutilizables para tarjetas, modales, acciones y vistas principales.
- Priorización de una interfaz funcional real frente a un prototipo estático cerrado.

URL de diseño o capturas pendientes:

```txt
Pendiente de añadir si procede
```

---

## Despliegue

El despliegue académico está previsto en AWS para cumplir los requisitos del módulo de Despliegue de Aplicaciones Web.

Arquitectura prevista:

```txt
Usuario
  ↓ HTTPS
Nginx en EC2
  ├── Frontend React compilado
  └── Reverse proxy /api hacia backend ASP.NET Core
          ↓
        MySQL en EC2
```

Requisitos a cubrir:

- Instancia EC2.
- Elastic IP.
- Acceso SSH.
- Servidor web Nginx.
- Backend ASP.NET Core publicado.
- Frontend React compilado.
- MySQL configurado.
- HTTPS mediante Certbot / Let’s Encrypt.

URL pendiente:

```txt
Pendiente de añadir tras despliegue en AWS
```

---

## Bitácora de tareas

| Fecha | Responsable | Tarea realizada |
|---|---|---|
| 2026-03-18 | David Andrino Ferrera | Definición inicial del proyecto, nombre, temática y estructura base del repositorio. |
| 2026-03-20 | David Andrino Ferrera | Inicio del backend con ASP.NET Core, entidades principales, DbContext y migraciones iniciales. |
| 2026-03-21 | David Andrino Ferrera | Implementación de autenticación, registro, JWT, gestión de fotos y reestructuración de entidades. |
| 2026-03-24 | David Andrino Ferrera | Desarrollo de funcionalidades de equipos, picks, draft, administración y sistema. |
| 2026-03-26 | David Andrino Ferrera | Pruebas funcionales del backend y revisión de endpoints principales. |
| 2026-04-30 | David Andrino Ferrera | Inicio del frontend con React, Vite, TypeScript, routing y estructura visual base. |
| 2026-05-12 | David Andrino Ferrera | Desarrollo de componentes reutilizables, tarjetas de usuario, perfiles, equipos y vistas principales. |
| 2026-05-17 | David Andrino Ferrera | Revisión de formato, Prettier y organización del código frontend. |
| 2026-05-21 | David Andrino Ferrera | Optimización de estilos CSS y ajustes responsive. |
| 2026-05-28 | David Andrino Ferrera | Revisión global de requisitos por módulos, detección de pendientes y planificación de documentación/despliegue. |
| 2026-06-04 | David Andrino Ferrera | Ampliación del README y documentación general del proyecto. |

---

## Presentación y vídeo

### Presentación PDF

Pendiente de añadir al repositorio.

```txt
Pendiente de añadir ruta o enlace
```

### Vídeo demostrativo

Pendiente de grabar y enlazar.

Requisitos previstos:

- Duración máxima: 10 minutos.
- Introducción con nombre de la aplicación y descripción breve.
- Demostración de uso.
- Explicación breve de tecnologías.
- Fragmentos de código solo si aportan valor.

```txt
Pendiente de añadir URL
```

---

## Bibliografía y documentación de apoyo

- Documentación oficial de ASP.NET Core: https://learn.microsoft.com/aspnet/core
- Documentación oficial de Entity Framework Core: https://learn.microsoft.com/ef/core
- Documentación oficial de MySQL: https://dev.mysql.com/doc/
- Documentación de Pomelo.EntityFrameworkCore.MySql: https://github.com/PomeloFoundation/Pomelo.EntityFrameworkCore.MySql
- Documentación oficial de React: https://react.dev/
- Documentación oficial de Vite: https://vite.dev/
- Documentación de React Router: https://reactrouter.com/
- Documentación de TypeScript: https://www.typescriptlang.org/docs/
- Documentación de Swagger/OpenAPI: https://swagger.io/docs/
- Documentación de JWT: https://jwt.io/introduction
- Documentación de AWS EC2: https://docs.aws.amazon.com/ec2/
- Documentación de Nginx: https://nginx.org/en/docs/
- Documentación de Certbot: https://certbot.eff.org/

---

## Estado actual y pendientes

### Completado

- Backend ASP.NET Core Web API.
- Base de datos MySQL mediante EF Core.
- Migraciones.
- Seeder inicial.
- Autenticación JWT.
- Roles y protección de endpoints.
- Registro e inicio de sesión.
- Gestión de usuarios.
- Gestión de equipos.
- Sistema de draft.
- Historial de picks.
- Anulación de picks.
- Gestión de fotos.
- Frontend React + Vite + TypeScript.
- Rutas protegidas.
- Consumo real de API REST.
- Interfaz responsive.
- CSS propio sin frameworks.
- Swagger/OpenAPI.

### Pendiente

- Despliegue en AWS.
- Elastic IP, SSH y HTTPS.
- URL pública de la aplicación.
- URL pública de la landing page.
- Landing page de presentación.
- Recursos HTML5 específicos para Diseño de Interfaces.
- Internacionalización mínima español/inglés.
- Paginación en listados.
- Presentación PDF.
- Vídeo demostrativo.
- Capturas finales del tutorial de uso.

---

## Notas sobre mantenimiento

El proyecto se mantiene como una base única durante el desarrollo. Para la entrega académica se prevé realizar un despliegue temporal en AWS. Posteriormente, si la aplicación se mantiene para uso de la empresa, se podrá crear una rama o repositorio específico orientado a un despliegue estable y gratuito o de bajo coste.
