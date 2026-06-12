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
| Aplicación desplegada | [`https://teamdraft.duckdns.org`](https://teamdraft.duckdns.org) |
| Landing page | No incluida como página independiente; se prioriza la aplicación funcional principal |
| Despliegue | [`docs/despliegue-aws.md`](docs/despliegue-aws.md) |
| Presentación PDF | Material complementario de defensa, no incluido en el repositorio |
| Vídeo demostrativo | Material complementario de defensa, no incluido en el repositorio |

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

### Despliegue

El despliegue académico se ha realizado en **AWS Academy Learner Lab** mediante una instancia EC2 Ubuntu con IP elástica, Nginx, MySQL, backend ASP.NET Core publicado como servicio `systemd`, frontend React compilado y HTTPS mediante Certbot/Let’s Encrypt.

URL pública de la aplicación:

```txt
https://teamdraft.duckdns.org
```

Arquitectura desplegada:

```txt
Usuario
  ↓ HTTPS
DuckDNS
  ↓
Elastic IP 52.86.160.80
  ↓
Nginx en EC2
  ├── Frontend React compilado
  ├── Reverse proxy /api hacia backend ASP.NET Core
  ├── Reverse proxy /images hacia recursos estáticos del backend
  └── Reverse proxy /uploads hacia fotos subidas por usuarios
          ↓
        MySQL local en EC2
```

La documentación completa del proceso se encuentra en:

- [`docs/despliegue-aws.md`](docs/despliegue-aws.md)

---

## Bitácora

La bitácora completa se encuentra en:

- [`docs/bitacora.md`](docs/bitacora.md)

---

## Presentación y vídeo

La presentación y el vídeo demostrativo se consideran material complementario de la defensa y pueden entregarse por los canales indicados por el centro educativo si se solicitan aparte del repositorio.

El repositorio contiene el código fuente, la documentación técnica, la bitácora, el manual de uso, la justificación de tecnologías, el diseño de interfaces y la documentación del despliegue.

---

## Bibliografía

La bibliografía y documentación técnica consultada se encuentra en:

- [`docs/bibliografia.md`](docs/bibliografia.md)

---

## Estado actual y limitaciones

### Completado

- Backend ASP.NET Core Web API.
- Base de datos MySQL mediante Entity Framework Core.
- Migraciones aplicadas.
- Seeder inicial.
- Autenticación JWT.
- Roles y protección de endpoints.
- Registro e inicio de sesión.
- Gestión de usuarios.
- Gestión de equipos.
- Sistema de draft.
- Historial de picks.
- Anulación de picks.
- Gestión de fotos de usuario.
- Paginación en listados principales.
- Frontend React + Vite + TypeScript.
- Rutas protegidas.
- Consumo real de API REST.
- Interfaz responsive.
- CSS propio sin frameworks.
- Swagger/OpenAPI en entorno local.
- Documentación base del proyecto.
- Documentación de justificación tecnológica.
- Documentación de diseño de interfaces.
- Manual de uso.
- Bitácora.
- Bibliografía.
- Despliegue en AWS Academy Learner Lab.
- Elastic IP, SSH y HTTPS.
- Dominio DuckDNS público.
- Documentación del despliegue con capturas.

### Limitaciones y posibles mejoras

- El despliegue depende de AWS Academy Learner Lab, por lo que la instancia EC2 debe iniciarse manualmente al comenzar una sesión del laboratorio.
- No se incluye landing page independiente; se priorizó la aplicación funcional principal.
- La internacionalización español/inglés queda como mejora futura.
- Para un entorno de producción real se recomienda valorar una instancia superior, RDS, copias de seguridad y monitorización.

---

## Autor

David Andrino Ferrera  
Proyecto Integrado - Desarrollo de Aplicaciones Web
