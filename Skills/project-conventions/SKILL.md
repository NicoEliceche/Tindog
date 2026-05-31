---
name: project-conventions
description: Convenciones de arquitectura y estilo para este proyecto. Cubre arquitectura feature-based, archivos de estilo screenStyled.ts, sistema de colores/espaciado en theme.ts, diseño full responsive, organización de tipos TypeScript (core/types, shared/types, SelectOption), capa de servicios (HTTP fuera de contexts), almacenamiento seguro de claves (no localStorage para tokens/private keys) e interceptor Axios con firma dinámica. Se activa al crear o editar componentes, pantallas, archivos de estilo, types, contexts o servicios API.
metadata:
  priority: 10
  pathPatterns:
    - 'src/app/**/*.tsx'
    - 'src/app/**/*.ts'
    - 'src/components/**/*.tsx'
    - 'src/components/**/*.ts'
    - 'src/core/**/*.ts'
    - 'src/core/**/*.tsx'
    - 'src/features/**/*.ts'
    - 'src/features/**/*.tsx'
    - 'src/shared/**/*.ts'
retrieval:
  aliases:
    - project conventions
    - architecture
    - feature based
    - styles
    - theme
    - responsive
    - styled components
    - types
    - interfaces
    - domain types
    - SelectOption
    - service layer
    - api calls
    - context
    - redux
    - localStorage
    - private key
    - auth token
    - security
    - axios interceptor
  intents:
    - crear pantalla
    - crear componente
    - agregar estilos
    - refactorizar feature
    - agregar colores
    - hacer responsive
    - crear tipos
    - organizar interfaces
    - extraer tipos
    - crear servicio
    - llamar api
    - guardar token
    - almacenar clave
