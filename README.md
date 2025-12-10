# Sistema de Vacantes y Candidatos - Sesame HR

Aplicación de gestión de candidatos con tablero Kanban, desarrollada con Vue 3, TypeScript y arquitectura hexagonal.

## Requisitos Previos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Docker** (opcional, para ejecución containerizada)

## Inicio Rápido

### Opción 1: Desarrollo Local

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd sesame-hr-prueba-tecnica

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en: **http://localhost:5173**

### Opción 2: Docker (Producción)

```bash
# Construir y ejecutar con Docker Compose
docker-compose up --build

# O construir manualmente
docker build -t sesame-hr-app .
docker run -p 3000:80 sesame-hr-app
```

La aplicación estará disponible en: **http://localhost:3000**

### Opción 3: Docker (Desarrollo)

```bash
docker-compose --profile dev up
```

La aplicación estará disponible en: **http://localhost:5173** con hot-reload.

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo con hot-reload |
| `npm run build` | Genera build de producción en `/dist` |
| `npm run preview` | Previsualiza el build de producción |
| `npm run test` | Ejecuta tests unitarios |
| `npm run test:watch` | Ejecuta tests en modo watch |
| `npm run test:coverage` | Ejecuta tests con reporte de cobertura |

## Tests

### Ejecutar Tests

```bash
# Todos los tests
npm run test

# Con cobertura
npm run test:coverage

# Modo watch (desarrollo)
npm run test:watch
```

### Estructura de Tests

```
src/
├── domain/models/__tests__/           # Tests de modelos de dominio
│   ├── Candidate.test.ts              # Validación de entidad Candidate
│   └── CandidateStatus.test.ts        # Validación de entidad Status
├── application/
│   ├── useCases/__tests__/            # Tests de casos de uso
│   │   ├── GetCandidates.test.ts      # Mock de repositorio, DI
│   │   └── UpdateCandidateStatus.test.ts  # Manejo error 500
│   └── stores/__tests__/
│       └── vacancyStore.test.ts       # Optimistic update, localStorage fallback
└── infrastructure/api/__tests__/
    └── api-integration.test.ts        # Documentación de comportamiento API
```

### Tests Destacados

Los tests documentan hallazgos importantes de la API:

- **Error 500 en PUT**: El endpoint de actualización falla con error 500 incluso con datos válidos
- **Fallback localStorage**: Estrategia de persistencia local cuando la API falla
- **Optimistic Update**: La UI se actualiza inmediatamente sin esperar respuesta del servidor
- **Limitaciones de i18n**: Nombres de estados hardcodeados en español (sin clave de traducción)
- **Colores ausentes**: La API no devuelve colores para estados, se asignan en frontend

## Estructura del Proyecto

```
src/
├── domain/           # Capa de Dominio (entidades, puertos)
│   ├── models/       # Candidate, CandidateStatus
│   └── ports/        # Interfaces de repositorios
├── infrastructure/   # Capa de Infraestructura (adaptadores)
│   ├── api/          # Implementación de repositorios con Axios
│   └── config/       # Configuración de API
├── application/      # Capa de Aplicación
│   ├── useCases/     # Casos de uso (GetCandidates, CreateCandidate, etc.)
│   └── stores/       # Estado global con Pinia
└── ui/               # Capa de Presentación
    ├── components/   # Componentes Vue (board/, common/, forms/, layout/)
    └── views/        # Vistas (RecruitmentView, CandidatesView)
```

## Arquitectura

La aplicación sigue los principios de **Arquitectura Hexagonal** y **SOLID**:

### Capas

| Capa | Responsabilidad | Ejemplo |
|------|-----------------|---------|
| **Domain** | Entidades y reglas de negocio | `Candidate.ts`, `CandidateRepository.ts` |
| **Application** | Orquestación de casos de uso | `GetCandidates.ts`, `vacancyStore.ts` |
| **Infrastructure** | Adaptadores externos | `CandidateApiRepository.ts`, `httpClient.ts` |
| **UI** | Presentación | `KanbanBoard.vue`, `CandidateCard.vue` |

### Principios SOLID

- **S**: Cada clase/componente tiene una única responsabilidad
- **O**: Extensible sin modificar código existente (puertos/adaptadores)
- **L**: Los repositorios son intercambiables (API real ↔ Mock)
- **I**: Interfaces específicas por entidad
- **D**: Dependencias inyectadas, no instanciadas

## Funcionalidades

- Visualización de estados en columnas Kanban
- Crear candidatos mediante formulario modal
- Drag & drop para mover candidatos entre estados (con highlight visual)
- Vista alternativa de candidatos en formato tabla
- Búsqueda/filtrado de candidatos por nombre
- Sidebar colapsable con secciones expandibles
- Persistencia local (fallback) cuando la API falla

## Stack Tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Vue | 3.5 | Framework frontend |
| TypeScript | 5.9 | Tipado estático |
| Vite | 7.2 | Build tool |
| Tailwind CSS | 4.1 | Estilos |
| Pinia | 3.0 | Estado global |
| Axios | 1.13 | Cliente HTTP |
| vuedraggable | 4.1 | Drag & drop |
| Vitest | 4.0 | Testing |

## Configuración de la API

La configuración está en `src/infrastructure/config/api.config.ts`:

```typescript
export const apiConfig = {
  baseURL: 'https://api-test.sesametime.com',
  token: 'Bearer cf3851069b6ad0c13f365cda737b71e349c2ee94a9203d07930c23009eaeafdc',
  vacancyId: '2fd59040-bce0-498e-b8fa-101621138da6',
}
```

## Documentación Adicional

| Documento | Descripción |
|-----------|-------------|
| [docs/DOCUMENTACION.md](./docs/DOCUMENTACION.md) | Documentación técnica completa |
| [docs/ANALISIS_DOMINIO.md](./docs/ANALISIS_DOMINIO.md) | Análisis del dominio y decisiones |
| [docs/PRUEBAS_API.md](./docs/PRUEBAS_API.md) | Pruebas de endpoints y hallazgos |

## Notas de Desarrollo

### Bug Conocido: PUT /candidates/{id}

El endpoint PUT de la API devuelve error 500 con datos válidos. Se implementó:

1. **Optimistic update**: La UI se actualiza inmediatamente
2. **Fallback localStorage**: Cambios se persisten localmente
3. **Merge al recargar**: Los cambios locales se aplican sobre datos de la API

Ver [PRUEBAS_API.md](./PRUEBAS_API.md) para detalles del análisis.

### Limitaciones del Backend

Durante el desarrollo se identificaron las siguientes limitaciones de la API:

| Problema | Impacto | Workaround |
|----------|---------|------------|
| PUT devuelve 500 | No se puede cambiar estado vía API | localStorage fallback |
| Nombres en español | Imposibilita i18n | Mapeo por nombre en frontend |
| Sin campo `color` | Colores no vienen de API | Configuración en `StatusColumn.vue` |
| DELETE no implementado | No se pueden eliminar candidatos | No hay workaround |

### Sistema de Colores

Los colores del diseño Figma están centralizados en `src/style.css` usando Tailwind v4 `@theme`.

Como la API no devuelve colores, el frontend los asigna basándose en el nombre del estado (en español):

| Estado | Color | Clase Tailwind |
|--------|-------|----------------|
| Nuevo | #22C55F (verde) | `bg-sesame-status-nuevo` |
| En proceso | #2CB8A6 (turquesa) | `bg-sesame-status-proceso` |
| Oferta | #3B82F6 (azul) | `bg-sesame-status-oferta` |
| Seleccionado | #8B5CF6 (violeta) | `bg-sesame-status-seleccionado` |
| Descartado | #F82C37 (rojo) | `bg-sesame-status-descartado` |

Ver sección "Sistema de Temas" en [DOCUMENTACION.md](./DOCUMENTACION.md).

## Autor

Desarrollado como prueba técnica para Sesame HR.
