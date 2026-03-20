# TeamDraft (by Diverxia)

## Autor

David Andrino Ferrera
GitHub: https://github.com/MrAndrino

## Título del proyecto

**TeamDraft (by Diverxia): sistema web para la formación de equipos mediante draft interactivo**

## Descripción del proyecto

TeamDraft es una aplicación web orientada a la gestión de la formación de equipos en eventos. El sistema permitirá organizar el proceso de selección de participantes por parte de distintos líderes mediante un sistema de draft, centralizando la información y facilitando tanto la gestión previa del evento como su desarrollo durante la fase de selección.

La aplicación estará planteada como una solución web con enfoque **mobile-first**, optimizada para dispositivos móviles y compatible con escritorio.

## Contexto y justificación

Este proyecto surge a partir de una necesidad real planteada en el entorno de prácticas de empresa, Diverxia Consulting, donde se plantea la posibilidad de utilizar una herramienta web para apoyar la organización de un hackatón interno.

Actualmente, este tipo de dinámicas puede resultar poco ágil si se realiza de forma manual, especialmente en lo relativo a la visualización de participantes disponibles, el control de las selecciones realizadas y el seguimiento general del proceso. Por este motivo, se propone el desarrollo de una aplicación que permita estructurar el draft de equipos de forma más clara, rápida y visual.

Además de cubrir una necesidad real, el proyecto permite integrar en una única solución los distintos conocimientos adquiridos durante el ciclo formativo, incluyendo desarrollo frontend, backend, gestión de base de datos, diseño de interfaces, despliegue y documentación técnica.

## Objetivo general

Desarrollar una aplicación web completa que permita gestionar de forma organizada la creación de equipos en un hackatón mediante un sistema de draft.

## Objetivos específicos

- Implementar autenticación con roles diferenciados.
- Desarrollar una interfaz de administración para preparar el evento.
- Permitir la importación de participantes desde un archivo Excel.
- Gestionar líderes, participantes y equipos.
- Implementar el proceso de selección de participantes mediante draft.
- Registrar el historial de selecciones realizadas.
- Permitir la revisión y posible anulación de selecciones incorrectas por parte del administrador.
- Mostrar una vista pública del proceso de selección.
- Exponer una API REST para la comunicación con el frontend.
- Desplegar la aplicación en AWS.
- Documentar el proyecto y sus principales decisiones técnicas.

## Usuarios del sistema

### Administrador

Usuario encargado de preparar y supervisar el evento. Podrá importar participantes, gestionar líderes, consultar equipos y revisar el historial de selecciones.

### Líder

Usuario autenticado que participa en el draft seleccionando participantes para su equipo cuando corresponda.

### Público

No interactúa directamente con el sistema, pero podrá visualizar una pantalla pública en la que se mostrarán las selecciones realizadas durante el evento.

## Funcionalidades principales

### Área de administración

- Importación de participantes desde Excel.
- Gestión de líderes.
- Consulta de participantes.
- Visualización de equipos.
- Revisión y posible anulación de selecciones incorrectas.

### Área de líder

- Inicio de sesión.
- Acceso a la lista de participantes disponibles.
- Filtrado de participantes por habilidades.
- Selección de participantes para el equipo.

### Pantalla pública

- Visualización del último participante seleccionado.
- Información del equipo que ha realizado la selección.
- Presentación visual orientada al seguimiento del evento.

## Tecnologías utilizadas

### Frontend

- React
- JavaScript o TypeScript
- CSS3

### Backend

- C#
- ASP.NET Core Web API

### Base de datos

- MySQL

### Otras herramientas

- JWT para autenticación
- Swagger/OpenAPI para documentación de API
- Git y GitHub para control de versiones
- AWS para despliegue
- Figma y FigJam para diseño y prototipado

## Arquitectura de la aplicación

La solución seguirá una arquitectura cliente-servidor desacoplada. El frontend se desarrollará como una aplicación web en React, mientras que el backend expondrá una API REST implementada en ASP.NET Core. La comunicación entre ambas partes se realizará mediante peticiones HTTP y respuestas en formato JSON. La autenticación se gestionará mediante tokens.

## Modelo de datos

El modelo inicial de la base de datos estará compuesto por las siguientes entidades principales:

- **User**: usuarios autenticados del sistema, con roles de administrador o líder.
- **Participant**: participantes cargados en el sistema para poder ser seleccionados durante el draft.
- **Team**: equipos asociados a cada líder.
- **Pick**: historial de selecciones realizadas durante el draft.

La entidad **Pick** permitirá registrar no solo el resultado final, sino también el proceso seguido para formar los equipos, incluyendo orden de selección y posibilidad de anulación.

## Esquema E/R de la base de datos

### Entidades

**User**

- UserId (PK)
- Name
- Email
- PasswordHash
- Role

**Team**

- TeamId (PK)
- Name
- LeaderUserId (FK → User.UserId)

**Participant**

- ParticipantId (PK)
- Name
- Photo
- Skill1
- Skill2
- Skill3
- Skill4
- IsLeader
- IsAvailable

**Pick**

- PickId (PK)
- TeamId (FK → Team.TeamId)
- ParticipantId (FK → Participant.ParticipantId)
- PickOrder
- CreatedAt
- IsCancelled

### Relaciones principales

- Un líder tiene asociado un equipo.
- Un equipo puede realizar múltiples selecciones.
- Un participante puede aparecer en varias selecciones históricas si alguna ha sido anulada, aunque solo podrá tener una selección activa válida a la vez.

## Diseño de la aplicación

El diseño de la interfaz y el prototipado se realizarán en **Figma** y **FigJam**, incluyendo análisis inicial, wireframes, UI Kit y prototipo de alta fidelidad. El enlace al diseño será añadido al repositorio del proyecto.

## Despliegue previsto

La aplicación se desplegará en **AWS**, cumpliendo con los requisitos del módulo de despliegue. Se prevé el uso de una instancia **EC2** accesible mediante **SSH**, con **IP elástica** y soporte **HTTPS**.

## Planificación inicial

### Fase 1. Análisis y anteproyecto

- Definición funcional del sistema
- Diseño inicial del modelo de datos
- Redacción del anteproyecto
- Preparación del repositorio

### Fase 2. Desarrollo base

- Configuración del backend
- Configuración del frontend
- Implementación de autenticación
- Modelado inicial de base de datos

### Fase 3. Desarrollo funcional

- Importación de participantes
- Gestión de líderes y equipos
- Lógica del draft
- Vista pública del evento

### Fase 4. Integración y pruebas

- Conexión entre frontend y backend
- Validaciones y manejo de errores
- Ajustes funcionales

### Fase 5. Despliegue y documentación

- Despliegue en AWS
- Documentación técnica
- Preparación de presentación y entrega final

## Repositorio del proyecto

El proyecto se alojará en un repositorio de GitHub con acceso para el profesorado. En él se incluirán el código fuente, el esquema E/R, la documentación del proyecto, el enlace al diseño y el resto de entregables requeridos.