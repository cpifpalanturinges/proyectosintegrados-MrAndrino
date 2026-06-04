# TeamDraft (by Diverxia)

**TeamDraft** es una aplicación web para gestionar la formación de equipos en un hackatón mediante un sistema de selección por turnos o *draft*.  
El proyecto está vinculado a **Diverxia Consulting** y permite administrar usuarios, equipos, líderes, participantes, coordinadores y el estado del evento desde una interfaz web responsive.

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
| Anteproyecto | [`ANTEPROYECTO.md`](ANTEPROYECTO.md) / [Notion](https://app.notion.com/p/Anteproyecto-3292e73c9ca1801ca3bee15c8fb083d2?v=1132e73c9ca18058a8dc000c85ec9c30&source=copy_link) |
| Esquema E/R | [`docs/er-diagram.pdf`](docs/er-diagram.pdf) |
| Manual de uso | [`docs/manual-uso.md`](docs/manual-uso.md) |
| Bitácora | [`docs/bitacora.md`](docs/bitacora.md) |
| Bibliografía | [`docs/bibliografia.md`](docs/bibliografia.md) |
| Justificación de tecnologías | [`docs/justificacion-tecnologias.md`](docs/justificacion-tecnologias.md) |
| Diseño de interfaces | [`docs/diseno-interfaces.md`](docs/diseno-interfaces.md) |
| Aplicación desplegada | Pendiente de despliegue en AWS |
| Landing page | Pendiente de implementación/despliegue |
| Despliegue | Pendiente de documentar tras realizar el despliegue en AWS |
| Presentación PDF | Pendiente de añadir |
| Vídeo demostrativo | Pendiente de añadir |

---

## Objetivos del proyecto

- Digitalizar el proceso de formación de equipos durante un hackatón.
- Permitir que los líderes seleccionen participantes mediante un sistema de turnos controlado.
- Centralizar la gestión de usuarios, equipos, coordinadores y estado del evento.
- Ofrecer un panel de administración protegido por roles.
- Exponer una API REST para el consumo desde el frontend.
- Crear una interfaz responsive, usable en móvil, tablet y escritorio.
- Preparar el proyecto para su despliegue en AWS como entrega académica.
- Mantener una base reutilizable para un posible despliegue estable destinado al uso interno de la empresa.

---

## Descripción funcional

TeamDraft resuelve la organización de equipos en un evento tipo hackatón.

Los usuarios pueden registrarse como participantes o líderes. Los líderes tienen un equipo asociado y pueden seleccionar participantes disponibles cuando el draft está abierto. Las selecciones quedan registradas en un historial, pueden anularse desde administración y se reflejan en una vista pública pensada para mostrarse en pantalla o proyector.

La zona de gestión permite administrar usuarios, equipos, coordinadores, picks y estado del evento. El acceso a estas funcionalidades está restringido según el rol del usuario autenticado.

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
- C#
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

### Despliegue previsto

- AWS EC2
- Elastic IP
- SSH
- Nginx como servidor web y reverse proxy
- HTTPS con Certbot / Let’s Encrypt
- MySQL en la instancia EC2

---

## Justificación de tecnologías

Algunos requisitos originales plantean tecnologías como Laravel, Blade, Laravel Sanctum o Angular.  
En este proyecto se ha utilizado un stack adaptado a las tecnologías trabajadas durante la formación y autorizado por el tutor.

La justificación completa se encuentra en:

- [`docs/justificacion-tecnologias.md`](docs/justificacion-tecnologias.md)

Equivalencias principales:

| Requisito original | Tecnología utilizada |
|---|---|
| Laravel 11/12 | ASP.NET Core Web API |
| PHP | C# |
| Laravel Sanctum | JWT Bearer Authentication |
| Blade | React |
| Migraciones Laravel | Entity Framework Core Migrations |
| Seeders Laravel | `DbSeeder` |
| Middleware Laravel | `[Authorize]` en ASP.NET Core |
| Angular CLI | Vite |
| RouterModule | React Router |
| HttpClientModule | Cliente propio con `fetch` |
| Observables / Input / Output | Estado React, props y callbacks |
| LocalStorage / SessionStorage | `sessionStorage` |

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
│   ├── bibliografia.md
│   ├── bitacora.md
│   ├── diseno-interfaces.md
│   ├── er-diagram.pdf
│   ├── justificacion-tecnologias.md
│   └── manual-uso.md
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

## Documentación

| Documento | Descripción |
|---|---|
| [`ANTEPROYECTO.md`](ANTEPROYECTO.md) | Anteproyecto inicial del proyecto. |
| [`docs/er-diagram.pdf`](docs/er-diagram.pdf) | Esquema entidad-relación de la base de datos. |
| [`docs/manual-uso.md`](docs/manual-uso.md) | Tutorial básico de uso de la aplicación. |
| [`docs/bitacora.md`](docs/bitacora.md) | Diario de tareas realizadas durante el desarrollo. |
| [`docs/bibliografia.md`](docs/bibliografia.md) | Enlaces y documentación técnica consultada. |
| [`docs/justificacion-tecnologias.md`](docs/justificacion-tecnologias.md) | Justificación del cambio de tecnologías y equivalencias. |
| [`docs/diseno-interfaces.md`](docs/diseno-interfaces.md) | Explicación breve del diseño, identidad visual y responsive. |

> La documentación específica del despliegue se añadirá cuando se realice el despliegue definitivo en AWS, ya que deberá incluir IP, dominio, HTTPS, capturas y comandos reales.

---

## Esquema E/R

El esquema entidad-relación se encuentra en:

- [`docs/er-diagram.pdf`](docs/er-diagram.pdf)

Entidades principales:

- `User`: representa usuarios, participantes, líderes, coordinadores y administradores.
- `Team`: representa equipos del hackatón.
- `Pick`: representa selecciones realizadas durante el draft.
- `SystemState`: representa el estado global del sistema.

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
- Rutas privadas en frontend.
- Endpoints protegidos en backend mediante `[Authorize]`.
- Restricción por roles mediante `[Authorize(Roles = "...")]`.
- Validaciones en backend para proteger la integridad de datos.

La seguridad principal se aplica en el backend. El frontend adapta la navegación y visibilidad de acciones según el rol del usuario autenticado.

---

## Validación de datos

La aplicación valida datos tanto en frontend como en backend.

Ejemplos:

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

Las fotos de usuario se gestionan desde el backend mediante `PhotoService` y se almacenan en `wwwroot`.

La aplicación permite:

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

## Manual de uso

El tutorial básico de uso de la aplicación se encuentra en:

- [`docs/manual-uso.md`](docs/manual-uso.md)

Pendiente de añadir capturas finales cuando la interfaz y el despliegue estén cerrados.

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

La explicación breve del diseño se encuentra en:

- [`docs/diseno-interfaces.md`](docs/diseno-interfaces.md)

Resumen:

- Diseño responsive con enfoque mobile-first.
- CSS propio sin frameworks.
- Uso de colores corporativos de Diverxia Consulting.
- Uso del logotipo/SVG oficial de Diverxia.
- Diseño ajustado de forma iterativa durante el desarrollo.
- Componentes reutilizables para tarjetas, modales, acciones y vistas principales.

---

## Despliegue

El despliegue académico está pendiente de realizar en AWS.

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

Requisitos a cubrir cuando se disponga de acceso a AWS:

- Instancia EC2.
- Elastic IP.
- Acceso SSH.
- Servidor web Nginx.
- Backend ASP.NET Core publicado.
- Frontend React compilado.
- MySQL configurado.
- HTTPS mediante Certbot / Let’s Encrypt.
- URL pública de la aplicación.
- URL pública de la landing page.
- Capturas y comandos del proceso.

La documentación específica del despliegue se añadirá más adelante, cuando el despliegue sea real y verificable.

---

## Bitácora

La bitácora completa se encuentra en:

- [`docs/bitacora.md`](docs/bitacora.md)

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

## Bibliografía

La bibliografía y documentación técnica consultada se encuentra en:

- [`docs/bibliografia.md`](docs/bibliografia.md)

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
- Documentación base del proyecto.

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

## Autor

David Andrino Ferrera  
Proyecto Integrado - Desarrollo de Aplicaciones Web
