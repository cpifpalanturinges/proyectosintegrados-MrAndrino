# Justificación de tecnologías

## Contexto

El proyecto TeamDraft se ha desarrollado como Proyecto Integrado del ciclo de Desarrollo de Aplicaciones Web.

Algunos enunciados de los módulos plantean el uso de tecnologías concretas como Laravel 11/12, Blade, Laravel Sanctum o Angular. Sin embargo, en mi caso pertenezco al plan antiguo del ciclo, por lo que esas tecnologías no se han trabajado durante mi formación de la misma forma que se plantean en los nuevos requisitos.

Por este motivo, y con permiso del tutor, el proyecto se ha adaptado a las tecnologías estudiadas durante los cursos anteriores y utilizadas durante el desarrollo del proyecto.

El objetivo principal ha sido cumplir las funcionalidades exigidas por los módulos, aunque la tecnología concreta utilizada sea diferente.

---

## Tecnologías utilizadas

### Backend

- ASP.NET Core Web API
- C#
- Entity Framework Core
- MySQL
- JWT
- Swagger / OpenAPI

### Frontend

- React
- Vite
- TypeScript
- React Router
- CSS3

---

## Equivalencias principales

| Requisito original | Tecnología utilizada en TeamDraft |
|---|---|
| Laravel 11/12 | ASP.NET Core Web API |
| PHP | C# |
| Laravel Sanctum | JWT Bearer Authentication |
| Blade | React |
| Migraciones Laravel | Migraciones de Entity Framework Core |
| Seeders Laravel | `DbSeeder` |
| Middleware Laravel | Autorización mediante `[Authorize]` |
| Angular CLI | Vite |
| RouterModule | React Router |
| HttpClientModule | Cliente HTTP propio con `fetch` |
| Observables / Input / Output | Estado React, props y callbacks |
| LocalStorage / SessionStorage | `sessionStorage` |

---

## Justificación del backend

En lugar de Laravel se ha utilizado ASP.NET Core Web API, ya que es una tecnología trabajada previamente y adecuada para crear una API REST.

Con ASP.NET Core se han implementado los requisitos funcionales principales del servidor:

- API REST.
- Autenticación de usuarios.
- Registro e inicio de sesión.
- Control de roles.
- Protección de rutas privadas.
- Validación de datos.
- Conexión con MySQL.
- Migraciones de base de datos.
- Semillero inicial.
- Gestión de imágenes de usuario.
- Documentación de API con Swagger.

Aunque no se utilice Laravel, las funciones solicitadas están cubiertas mediante tecnologías equivalentes.

---

## Justificación del frontend

En lugar de Angular se ha utilizado React con Vite y TypeScript.

React permite desarrollar una interfaz basada en componentes, consumir una API REST, gestionar estado, proteger vistas según sesión de usuario y reutilizar elementos de interfaz.

Con React se han implementado los requisitos principales del cliente:

- Login y registro.
- Almacenamiento del token en `sessionStorage`.
- Rutas protegidas.
- Navegación entre vistas.
- Componentes reutilizables.
- Comunicación mediante props, callbacks y estado.
- Consumo de API REST.
- Métodos `GET`, `POST`, `PUT` y `DELETE`.
- Gestión de errores en peticiones.
- Interfaz responsive.

---

## Diseño e identidad visual

La interfaz se ha desarrollado con CSS propio, sin frameworks como Bootstrap o Tailwind.

El diseño se ha ido ajustando de forma iterativa durante el desarrollo, ya que el proyecto ha cambiado varias veces según las necesidades funcionales.

El logotipo SVG utilizado pertenece a la identidad oficial de Diverxia Consulting, por lo que no se ha creado un logotipo alternativo. También se han usado colores corporativos de la empresa para mantener coherencia visual con el contexto real del proyecto.

---

## Conclusión

El proyecto no utiliza exactamente todas las tecnologías propuestas en los enunciados, pero sí cumple sus funcionalidades principales mediante tecnologías equivalentes.

La adaptación tecnológica se debe a que pertenezco al plan antiguo y no se me han impartido las tecnologías nuevas indicadas en algunos requisitos. Esta adaptación se ha realizado con permiso del tutor, priorizando el cumplimiento funcional del proyecto y el uso de tecnologías conocidas y trabajadas durante mi formación.
