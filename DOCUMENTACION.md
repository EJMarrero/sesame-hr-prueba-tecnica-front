# Documentación Técnica - Sistema de Vacantes y Candidatos

## Índice
1. [Resumen del Proyecto](#resumen-del-proyecto)
2. [Requisitos Técnicos](#requisitos-técnicos)
3. [Arquitectura Hexagonal](#arquitectura-hexagonal)
4. [Principios SOLID](#principios-solid)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [Endpoints de la API](#endpoints-de-la-api)
7. [Funcionalidades Implementadas](#funcionalidades-implementadas)
8. [Decisiones Técnicas](#decisiones-técnicas)
9. [Ejecución del Proyecto](#ejecución-del-proyecto)

---

## Resumen del Proyecto

Sistema de gestión de vacantes y candidatos desarrollado como prueba técnica para Sesame HR. Permite visualizar candidatos en un tablero Kanban organizado por estados, crear nuevos candidatos y moverlos entre estados mediante drag & drop.

---

## Requisitos Técnicos

### Stack Tecnológico (Requerido → Implementado)

| Requisito | Implementación |
|-----------|----------------|
| Vue 3 | `vue@3.5.24` con Composition API |
| TypeScript | `typescript@5.9.3` |
| Vite | `vite@7.2.4` |
| Tailwind CSS | `tailwindcss@4.1.17` |

### Dependencias Adicionales

```json
{
  "dependencies": {
    "axios": "^1.13.2",        // Cliente HTTP
    "pinia": "^3.0.4",         // Estado global
    "vuedraggable": "^4.1.0",  // Drag & drop
    "@heroicons/vue": "^2.2.0" // Iconos
  }
}
```

---

## Arquitectura Hexagonal

La arquitectura hexagonal (ports & adapters) separa el código en capas con responsabilidades claras:

```
src/
├── domain/           # Núcleo de negocio (sin dependencias externas)
├── infrastructure/   # Adaptadores (implementaciones concretas)
├── application/      # Casos de uso y orquestación
└── ui/               # Interfaz de usuario (Vue components)
```

### Capa de Dominio (`src/domain/`)

Contiene las entidades y contratos del negocio. No depende de ninguna otra capa.

#### Modelos (`domain/models/`)

**`Candidate.ts`** - Entidad candidato:
```typescript
interface Candidate {
  id: string
  firstName: string
  lastName: string
  vacancyId: string
  statusId: string
  createdAt: string
  updatedAt: string
  source?: string
}
```

**`CandidateStatus.ts`** - Entidad estado:
```typescript
interface CandidateStatus {
  id: string
  name: string
  color: string
  order: number
}
```

#### Puertos (`domain/ports/`)

Interfaces que definen contratos para los repositorios:

**`CandidateRepository.ts`**:
```typescript
interface CandidateRepository {
  getByVacancyId(vacancyId: string): Promise<Candidate[]>
  create(data: CreateCandidateDTO): Promise<Candidate>
  update(candidateId: string, data: UpdateCandidateDTO): Promise<Candidate>
}
```

**`CandidateStatusRepository.ts`**:
```typescript
interface CandidateStatusRepository {
  getByVacancyId(vacancyId: string): Promise<CandidateStatus[]>
}
```

### Capa de Infraestructura (`src/infrastructure/`)

Implementaciones concretas de los puertos (adaptadores).

#### Configuración (`infrastructure/config/`)

**`api.config.ts`** - Configuración centralizada de la API:
```typescript
export const apiConfig = {
  baseURL: 'https://api-test.sesametime.com',
  token: 'Bearer token...',
  vacancyId: '2fd59040-bce0-498e-b8fa-101621138da6',
}
```

#### Cliente HTTP (`infrastructure/api/`)

**`httpClient.ts`** - Instancia de Axios configurada:
- Base URL configurada
- Headers de autorización (Bearer token)
- Interceptor de errores

**`CandidateApiRepository.ts`** - Implementación del puerto:
```typescript
class CandidateApiRepository implements CandidateRepository {
  async getByVacancyId(vacancyId: string): Promise<Candidate[]>
  async create(data: CreateCandidateDTO): Promise<Candidate>
  async update(candidateId: string, data: UpdateCandidateDTO): Promise<Candidate>
}
```

**`CandidateStatusApiRepository.ts`** - Implementación del puerto:
```typescript
class CandidateStatusApiRepository implements CandidateStatusRepository {
  async getByVacancyId(vacancyId: string): Promise<CandidateStatus[]>
}
```

### Capa de Aplicación (`src/application/`)

Orquesta los casos de uso y gestiona el estado.

#### Casos de Uso (`application/useCases/`)

Cada caso de uso encapsula una operación de negocio:

| Archivo | Responsabilidad |
|---------|-----------------|
| `GetCandidateStatuses.ts` | Obtener estados de una vacante |
| `GetCandidates.ts` | Obtener candidatos de una vacante |
| `CreateCandidate.ts` | Crear un nuevo candidato |
| `UpdateCandidateStatus.ts` | Actualizar estado de un candidato |

Ejemplo de implementación:
```typescript
class GetCandidates {
  private repository: CandidateRepository

  constructor(repository: CandidateRepository) {
    this.repository = repository
  }

  async execute(vacancyId: string): Promise<Candidate[]> {
    return this.repository.getByVacancyId(vacancyId)
  }
}
```

#### Store (`application/stores/`)

**`vacancyStore.ts`** - Store de Pinia con:
- Estado reactivo (`candidates`, `statuses`, `isLoading`, `error`)
- Computed (`candidatesByStatus` - agrupa candidatos por estado)
- Acciones (`loadAll`, `addCandidate`, `moveCandidateToStatus`)
- Fallback a localStorage cuando la API PUT falla

### Capa de UI (`src/ui/`)

Componentes Vue organizados por función.

#### Componentes Comunes (`ui/components/common/`)

| Componente | Descripción |
|------------|-------------|
| `Button.vue` | Botón reutilizable con variantes (primary, secondary, ghost) |
| `Input.vue` | Input con label y manejo de errores |
| `Modal.vue` | Modal con Teleport y transiciones |

#### Componentes de Layout (`ui/components/layout/`)

| Componente | Descripción |
|------------|-------------|
| `Sidebar.vue` | Menú lateral (decorativo) |
| `Header.vue` | Cabecera con título y avatar |
| `TabBar.vue` | Tabs de navegación |
| `SearchBar.vue` | Barra de búsqueda |

#### Componentes del Tablero (`ui/components/board/`)

| Componente | Descripción |
|------------|-------------|
| `KanbanBoard.vue` | Contenedor del tablero |
| `StatusColumn.vue` | Columna de estado con drag & drop |
| `CandidateCard.vue` | Tarjeta de candidato |

#### Formularios (`ui/components/forms/`)

| Componente | Descripción |
|------------|-------------|
| `CandidateForm.vue` | Modal para crear candidatos |

#### Vistas (`ui/views/`)

| Componente | Descripción |
|------------|-------------|
| `VacancyView.vue` | Vista principal con tabs, búsqueda y tablero Kanban |
| `CandidatesView.vue` | Vista de tabla con listado de todos los candidatos |

---

## Principios SOLID

### S - Single Responsibility (Responsabilidad Única)

Cada clase/componente tiene una única responsabilidad:

- `CandidateApiRepository`: Solo comunicación con API de candidatos
- `CandidateCard.vue`: Solo renderizar un candidato
- `GetCandidates`: Solo obtener candidatos

### O - Open/Closed (Abierto/Cerrado)

El código está abierto a extensión pero cerrado a modificación:

- Los puertos (interfaces) permiten cambiar implementaciones sin modificar el dominio
- Podríamos crear `MockCandidateRepository` para testing sin tocar el código existente

### L - Liskov Substitution (Sustitución de Liskov)

Los adaptadores son intercambiables:

```typescript
// Ambos implementan CandidateRepository
const apiRepo = new CandidateApiRepository()
const mockRepo = new MockCandidateRepository()

// El caso de uso funciona con cualquiera
const useCase = new GetCandidates(apiRepo) // o mockRepo
```

### I - Interface Segregation (Segregación de Interfaces)

Interfaces específicas en lugar de una genérica:

- `CandidateRepository` - operaciones de candidatos
- `CandidateStatusRepository` - operaciones de estados

### D - Dependency Inversion (Inversión de Dependencias)

Las capas superiores dependen de abstracciones, no de implementaciones:

```typescript
// El caso de uso depende del PUERTO (interfaz)
class GetCandidates {
  constructor(private repository: CandidateRepository) {}
}

// No de la implementación concreta
// ❌ constructor(private repository: CandidateApiRepository)
```

---

## Estructura del Proyecto

```
src/
├── domain/
│   ├── models/
│   │   ├── Candidate.ts
│   │   └── CandidateStatus.ts
│   └── ports/
│       ├── CandidateRepository.ts
│       └── CandidateStatusRepository.ts
│
├── infrastructure/
│   ├── config/
│   │   └── api.config.ts
│   └── api/
│       ├── httpClient.ts
│       ├── CandidateApiRepository.ts
│       └── CandidateStatusApiRepository.ts
│
├── application/
│   ├── useCases/
│   │   ├── GetCandidateStatuses.ts
│   │   ├── GetCandidates.ts
│   │   ├── CreateCandidate.ts
│   │   └── UpdateCandidateStatus.ts
│   └── stores/
│       └── vacancyStore.ts
│
├── ui/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.vue
│   │   │   ├── Input.vue
│   │   │   └── Modal.vue
│   │   ├── layout/
│   │   │   ├── Sidebar.vue
│   │   │   ├── Header.vue
│   │   │   ├── TabBar.vue
│   │   │   ├── SearchBar.vue
│   │   │   └── MainLayout.vue
│   │   ├── board/
│   │   │   ├── KanbanBoard.vue
│   │   │   ├── StatusColumn.vue
│   │   │   └── CandidateCard.vue
│   │   └── forms/
│   │       └── CandidateForm.vue
│   └── views/
│       ├── VacancyView.vue
│       └── CandidatesView.vue
│
├── App.vue
├── main.ts
└── style.css
```

---

## Endpoints de la API

Base URL: `https://api-test.sesametime.com`

| Método | Endpoint | Descripción | Estado |
|--------|----------|-------------|--------|
| GET | `/recruitment/v1/candidate-status/{vacancyId}` | Obtener estados | ✅ Funciona |
| GET | `/recruitment/v1/vacancies/{vacancyId}/candidates` | Obtener candidatos | ✅ Funciona |
| POST | `/recruitment/v1/candidates` | Crear candidato | ✅ Funciona |
| PUT | `/recruitment/v1/candidates/{candidateId}` | Actualizar candidato | ❌ Error 500 |

### Bug Detectado: PUT /candidates/{id}

El endpoint PUT devuelve error 500 al intentar actualizar un candidato con datos válidos. Ver [Informe de Bug](#informe-de-bug-put-endpoint) para más detalles.

**Solución implementada**: Fallback a localStorage para persistir cambios de estado localmente.

---

## Funcionalidades Implementadas

### 1. Visualizar Estados en Columnas

**Requisito**: Visualizar los estados de la candidatura en columnas.

**Implementación**:
- `GET /candidate-status/{vacancyId}` obtiene los estados
- `KanbanBoard.vue` renderiza una `StatusColumn.vue` por cada estado
- Estados ordenados por campo `order`

### 2. Visualizar Candidatos

**Requisito**: Visualizar los candidatos en su respectiva columna.

**Implementación**:
- `GET /vacancies/{vacancyId}/candidates` obtiene los candidatos
- `candidatesByStatus` (computed) agrupa candidatos por `statusId`
- `CandidateCard.vue` muestra nombre, fuente y fecha

### 3. Crear Candidatos

**Requisito**: Crear un formulario para añadir candidatos.

**Implementación**:
- Botón "Añadir candidato" abre modal
- `CandidateForm.vue` con campos: nombre, apellido, estado inicial
- Validación de campos requeridos
- `POST /candidates` crea el candidato

### 4. Mover Candidatos (Drag & Drop)

**Requisito**: Cambiar estado de candidatos.

**Implementación**:
- `vuedraggable` permite arrastrar entre columnas
- Evento `@change` detecta cuando un candidato se añade a una columna
- Intenta `PUT /candidates/{id}` para persistir
- Si falla (error 500), guarda en localStorage como fallback
- Highlight visual de la columna destino durante el drag (bg-gray-50)

### 5. Búsqueda de Candidatos

**Requisito adicional**: Filtrar candidatos por nombre.

**Implementación**:
- Input de búsqueda en `SearchBar.vue`
- Filtrado en frontend por `firstName + lastName` (case-insensitive)
- Funciona tanto en vista Kanban como en vista de tabla
- `filteredCandidatesByStatus` computed en `VacancyView.vue`
- `filteredCandidates` computed en `CandidatesView.vue`

### 6. Vista de Candidatos (Tabla)

**Implementación**:
- Tab "Candidatos" muestra listado en formato tabla
- Componente `CandidatesView.vue` separado (Single Responsibility)
- Columnas: Nombre, Estado, Fecha de creación
- Comparte estado con Kanban via Pinia store
- Filtrado de búsqueda compartido

### 7. Sidebar Colapsable

**Implementación**:
- Sección "ADMINISTRADOR" colapsable
- Sección "Talento" colapsable con animación de chevron
- Ancho fijo de 288px (`w-72 min-w-72 max-w-72`)
- Indicador visual de sección activa ("Reclutamiento")

---

## Sistema de Temas (Colores)

### Configuración

Los colores del diseño Figma están centralizados en `src/style.css` usando la directiva `@theme` de Tailwind v4:

```css
@theme {
  /* Color principal de Sesame HR */
  --color-sesame-primary: #6C63FF;

  /* Colores de estados del Kanban */
  --color-sesame-status-nuevo: #22C55F;
  --color-sesame-status-proceso: #2CB8A6;
  --color-sesame-status-oferta: #3B82F6;
  --color-sesame-status-seleccionado: #8B5CF6;
  --color-sesame-status-descartado: #F82C37;
}
```

### Uso en Componentes

Los colores se usan como clases de Tailwind:

```html
<!-- Backgrounds -->
<div class="bg-sesame-primary">...</div>
<div class="bg-sesame-status-nuevo">...</div>

<!-- Textos -->
<span class="text-sesame-primary">...</span>
<span class="text-sesame-status-descartado">...</span>

<!-- Con opacidad -->
<div class="bg-sesame-primary/10">...</div>
```

### Colores Extraídos del Figma

| Variable | Hex | Uso |
|----------|-----|-----|
| `sesame-primary` | `#6C63FF` | Botones, tabs activos, enlaces |
| `sesame-status-nuevo` | `#22C55F` | Columna "Nuevo" (verde) |
| `sesame-status-proceso` | `#2CB8A6` | Columna "En proceso" (turquesa) |
| `sesame-status-oferta` | `#3B82F6` | Columna "Oferta" (azul) |
| `sesame-status-seleccionado` | `#8B5CF6` | Columna "Seleccionado" (violeta) |
| `sesame-status-descartado` | `#F82C37` | Columna "Descartado" (rojo) |

### Componentes que Usan el Tema

| Componente | Clases utilizadas |
|------------|-------------------|
| `Button.vue` | `bg-sesame-primary` |
| `TabBar.vue` | `text-sesame-primary`, `border-sesame-primary` |
| `Sidebar.vue` | `text-sesame-primary`, `bg-sesame-primary/10` |
| `StatusColumn.vue` | `bg-sesame-status-*`, `text-sesame-status-*` |

---

## Decisiones Técnicas

### 1. Pinia sobre Vuex

- API más simple con Composition API
- Mejor soporte TypeScript
- Sin mutations, solo acciones

### 2. vuedraggable para Drag & Drop

- Integración nativa con Vue 3
- Basado en SortableJS (estable y probado)
- Soporte para grupos (mover entre listas)

### 3. Fallback a localStorage

Debido al bug del servidor (PUT 500), implementamos persistencia local:

```typescript
// Al mover candidato
try {
  await api.put(...)
} catch {
  saveLocalStatusOverride(candidateId, newStatusId)
}

// Al cargar candidatos
const apiCandidates = await api.get(...)
return applyLocalOverrides(apiCandidates)
```

### 4. Alias de Paths

Configurados en `vite.config.ts` y `tsconfig.app.json`:

```typescript
'@domain/*': ['src/domain/*']
'@infrastructure/*': ['src/infrastructure/*']
'@application/*': ['src/application/*']
'@ui/*': ['src/ui/*']
```

---

## Ejecución del Proyecto

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
# Abre http://localhost:5173
```

### Build de Producción

```bash
npm run build
```

### Preview de Producción

```bash
npm run preview
```

---

## Informe de Bug: PUT Endpoint

### Descripción
El endpoint `PUT /recruitment/v1/candidates/{candidateId}` devuelve error 500.

### Reproducción
```bash
curl -X PUT "https://api-test.sesametime.com/recruitment/v1/candidates/{id}" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"...","lastName":"...","vacancyId":"...","statusId":"..."}'
```

### Respuesta
```json
{"error":{"status":500,"message":"Unknown error","errors":"unknown_error"}}
```

### Impacto
- No es posible persistir cambios de estado en el servidor
- Implementado fallback con localStorage

---

## Autor

Desarrollado como prueba técnica para Sesame HR.
