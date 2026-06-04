# Diseño de Interfaces

## Contexto

TeamDraft es una aplicación web para gestionar la formación de equipos en un evento tipo hackatón mediante un sistema de selección por turnos.

La interfaz se ha diseñado para que sea clara, rápida de usar y adaptable a móvil, tablet y ordenador.

---

## Objetivo de la interfaz

El objetivo principal es que cada usuario pueda acceder fácilmente a las funciones que le corresponden según su rol:

- Administrador: gestión general del sistema.
- Coordinador: gestión de usuarios, equipos y draft.
- Líder: selección de participantes para su equipo.
- Participante: acceso a su información.
- Display público: visualización del último pick realizado.

---

## Metodología de diseño

El diseño se ha realizado de forma iterativa durante el desarrollo del proyecto.

No se ha creado un prototipo completo en Figma/FigJam porque la aplicación ha cambiado varias veces durante el desarrollo. En su lugar, se ha ido ajustando la interfaz directamente sobre la aplicación funcional.

Se ha priorizado:

- Que la aplicación funcione correctamente.
- Que sea fácil de usar.
- Que se adapte a distintos dispositivos.
- Que mantenga coherencia visual con Diverxia Consulting.

---

## Identidad visual

El logotipo utilizado es el SVG oficial de Diverxia Consulting. Por ese motivo no se ha creado un logotipo nuevo en Inkscape, ya que lo correcto era respetar la identidad visual de la empresa.

La paleta de colores también se basa en los colores corporativos de Diverxia, principalmente tonos azules combinados con fondos oscuros.

Esta decisión permite que la aplicación mantenga relación visual con la empresa para la que se desarrolla.

---

## Estructura de la interfaz

La aplicación cuenta con varias vistas principales:

- Login y registro.
- Selección de participantes.
- Equipos.
- Usuarios.
- Sistema.
- Perfil de usuario.
- Display público.

También se han usado componentes reutilizables, como tarjetas de usuario, tarjetas de equipo, modales, formularios y botones de acción.

---

## CSS y responsive design

La interfaz se ha desarrollado con CSS propio, sin utilizar frameworks como Bootstrap o Tailwind.

Se han usado:

- Media queries.
- Flexbox.
- CSS Grid.
- Variables CSS.
- Transiciones y animaciones.
- Diseño mobile-first.

La aplicación está pensada para funcionar correctamente en móvil, tablet y escritorio.

---

## Accesibilidad y usabilidad

Se han aplicado criterios básicos de accesibilidad y usabilidad:

- Contraste entre texto y fondo.
- Botones grandes y fáciles de pulsar.
- Mensajes de error en formularios.
- Navegación clara por pestañas.
- Separación visual entre acciones normales y acciones peligrosas.
- Diseño responsive para evitar problemas en pantallas pequeñas.

---

## Recursos HTML5

El proyecto utiliza algunos recursos HTML5 y multimedia:

- SVG oficial de Diverxia.
- Imágenes en la pantalla de autenticación.
- Vídeo para la cámara en registro o cambio de imagen.
- Canvas para capturar la imagen desde la cámara.
- Animaciones y transiciones CSS.

Como mejora pendiente, se puede añadir una landing page con audio y otros recursos multimedia para cubrir mejor los requisitos de la asignatura.

---

## Conclusión

Aunque no se ha realizado un prototipo completo en Figma/FigJam, el proyecto cuenta con una interfaz real, funcional, responsive y adaptada a los distintos roles de usuario.

El diseño se ha ajustado durante el desarrollo y mantiene la identidad visual de Diverxia mediante el uso de su logotipo oficial y colores corporativos.
