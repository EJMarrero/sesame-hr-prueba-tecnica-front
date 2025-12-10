# Análisis del Dominio - Sistema de Vacantes y Candidatos

## Índice
1. [Introducción](#introducción)
2. [Fuente de la Información](#fuente-de-la-información)
3. [Respuestas de los Endpoints](#respuestas-de-los-endpoints)
4. [Análisis: De la API al Dominio](#análisis-de-la-api-al-dominio)
5. [Decisiones de Modelado](#decisiones-de-modelado)
6. [Impacto del Error 500](#impacto-del-error-500)

---

## Introducción

Este documento explica cómo se definió el dominio de la aplicación, qué información se utilizó como base y cómo las respuestas de la API influyeron en las decisiones de modelado.

---

## Fuente de la Información

El dominio se construyó a partir de **dos fuentes**:

1. **Requisitos de la prueba técnica** - Indicaban qué endpoints usar y qué campos enviar
2. **Respuestas reales de la API** - Revelaron la estructura exacta de los datos

La API es la **fuente de verdad**. Los modelos del dominio se diseñaron para representar los datos que la API devuelve y espera recibir.

---

## Respuestas de los Endpoints

### GET /recruitment/v1/candidate-status/{vacancyId}

**Respuesta real:**
```json
{
  "data": [
    {
      "id": "91b56d6d-eaf1-4f3c-b394-f07eabb06fe0",
      "name": "Nuevo",
      "order": 1,
      "companyId": "7ae449bc-620c-4851-9d56-d25ff4094e34",
      "createdAt": "2025-12-10T09:37:12+00:00",
      "updatedAt": "2025-12-10T09:37:27+00:00",
      "vacancyId": "2fd59040-bce0-498e-b8fa-101621138da6"
    },
    {
      "id": "5644397e-82be-4398-bd05-f702c9ce7f38",
      "name": "En proceso",
      "order": 2,
      ...
    },
    {
      "id": "3c6722f3-9704-4ad7-b91d-b6ccdb373be0",
      "name": "Oferta",
      "order": 3,
      ...
    },
    {
      "id": "01b4d054-8912-4059-8f6e-edbb1b8a3353",
      "name": "Seleccionado",
      "order": 4,
      ...
    },
    {
      "id": "bdb1aaf3-a86b-43eb-874a-72936aed918b",
      "name": "Descartado",
      "order": 5,
      ...
    }
  ],
  "meta": {
    "currentPage": 1,
    "lastPage": 1,
    "total": 5,
    "perPage": 20
  }
}
```

**Observaciones:**
- Cada estado tiene `id`, `name` y `order`
- **No hay campo `color`** en esta respuesta (aunque el diseño Figma muestra colores)
- Los estados están asociados a una `vacancyId` específica
- Hay metadatos de paginación

---

### GET /recruitment/v1/vacancies/{vacancyId}/candidates

**Respuesta real (simplificada):**
```json
{
  "data": [
    {
      "id": "62f45392-6177-41c4-b4d4-165e119abfe6",
      "companyId": "7ae449bc-620c-4851-9d56-d25ff4094e34",
      "vacancyId": "2fd59040-bce0-498e-b8fa-101621138da6",
      "firstName": "Eduardo",
      "lastName": "Marrero",
      "email": null,
      "phone": "",
      "type": "new",
      "statusId": "91b56d6d-eaf1-4f3c-b394-f07eabb06fe0",
      "status": {
        "id": "91b56d6d-eaf1-4f3c-b394-f07eabb06fe0",
        "name": "Nuevo",
        "order": 1,
        "color": null,
        "icon": null,
        ...
      },
      "vacancy": { ... },
      "sourceType": { "value": "api" },
      "createdAt": "2025-12-10T10:46:51+00:00",
      "updatedAt": "2025-12-10T10:46:51+00:00",
      ...
    }
  ],
  "meta": { ... }
}
```

**Observaciones:**
- Candidato tiene `firstName`, `lastName`, `statusId`
- Incluye objeto `status` anidado con detalles del estado
- Incluye objeto `vacancy` anidado con detalles de la vacante
- `sourceType.value` indica origen ("api", posiblemente otros como "manual", "import")
- Muchos campos adicionales que no usamos (email, phone, linkedInURL, etc.)

---

### POST /recruitment/v1/candidates

**Campos requeridos (según documentación):**
```json
{
  "firstName": "string",
  "lastName": "string",
  "vacancyId": "string",
  "statusId": "string"
}
```

**Estado: ✅ Funciona**

---

### PUT /recruitment/v1/candidates/{candidateId}

**Campos requeridos (según documentación):**
```json
{
  "firstName": "string",
  "lastName": "string",
  "vacancyId": "string",
  "statusId": "string"
}
```

**Estado: ❌ Error 500**

```json
{
  "error": {
    "status": 500,
    "message": "Unknown error",
    "errors": "unknown_error"
  }
}
```

---

## Análisis: De la API al Dominio

### Proceso de Extracción

```
API Response → Análisis → Modelo de Dominio → Interfaz TypeScript
```

### CandidateStatus

**De la API recibimos:**
```json
{
  "id": "91b56d6d-...",
  "name": "Nuevo",
  "order": 1,
  "companyId": "7ae449bc-...",
  "createdAt": "2025-12-10T09:37:12+00:00",
  "updatedAt": "2025-12-10T09:37:27+00:00",
  "vacancyId": "2fd59040-..."
}
```

**Modelo de dominio definido:**
```typescript
interface CandidateStatus {
  id: string
  name: string
  color: string   // ⚠️ No viene en GET /candidate-status
  order: number
}
```

**¿Por qué incluimos `color`?**
- El diseño Figma muestra colores por estado
- En GET /candidates, el objeto `status` anidado tiene campo `color` (aunque es `null`)
- Anticipamos que la API podría devolver colores en el futuro
- Mientras tanto, asignamos colores por defecto en el frontend

**¿Por qué excluimos `companyId`, `vacancyId`, timestamps?**
- No son necesarios para la lógica de presentación
- El dominio solo modela lo que la aplicación necesita
- Principio de segregación: interfaces mínimas y específicas

---

### Candidate

**De la API recibimos (campos relevantes):**
```json
{
  "id": "62f45392-...",
  "firstName": "Eduardo",
  "lastName": "Marrero",
  "vacancyId": "2fd59040-...",
  "statusId": "91b56d6d-...",
  "createdAt": "2025-12-10T10:46:51+00:00",
  "updatedAt": "2025-12-10T10:46:51+00:00",
  "sourceType": { "value": "api" }
}
```

**Modelo de dominio definido:**
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

**Decisiones:**

| Campo API | Campo Dominio | Razón |
|-----------|---------------|-------|
| `id` | `id` | Identificador único, esencial |
| `firstName` | `firstName` | Requerido para mostrar y enviar |
| `lastName` | `lastName` | Requerido para mostrar y enviar |
| `vacancyId` | `vacancyId` | Requerido para crear/actualizar |
| `statusId` | `statusId` | Define en qué columna está |
| `createdAt` | `createdAt` | Para mostrar "Hoy", "Ayer", etc. |
| `updatedAt` | `updatedAt` | Tracking de cambios |
| `sourceType.value` | `source` | Simplificado, para mostrar "Añadido por X" |
| `email`, `phone`, etc. | ❌ Excluidos | No se usan en esta vista |
| `vacancy`, `status` | ❌ Excluidos | Objetos anidados innecesarios |

---

### DTOs (Data Transfer Objects)

Para las operaciones de escritura, definimos DTOs basados en lo que la API espera:

```typescript
interface CreateCandidateDTO {
  firstName: string
  lastName: string
  vacancyId: string
  statusId: string
}

interface UpdateCandidateDTO {
  firstName: string
  lastName: string
  vacancyId: string
  statusId: string
}
```

Estos reflejan exactamente los campos requeridos documentados para POST y PUT.

---

## Decisiones de Modelado

### 1. Modelos Simplificados vs Respuesta Completa

**Opción A: Mapear toda la respuesta**
```typescript
interface Candidate {
  id: string
  companyId: string
  vacancyId: string
  vacancy: Vacancy
  firstName: string
  lastName: string
  email: string | null
  phone: string
  type: string
  statusId: string
  status: CandidateStatus
  linkedInURL: string | null
  // ... 40+ campos más
}
```

**Opción B: Modelo de dominio enfocado** ✅ Elegida
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

**Razón:** El dominio debe representar lo que la aplicación necesita, no todo lo que la API devuelve. Esto:
- Reduce complejidad
- Facilita mantenimiento
- Mejora legibilidad
- Sigue el principio de Interface Segregation (SOLID)

### 2. Color de Estados

La API no devuelve colores en GET `/candidate-status`, pero el diseño los requiere.

**Solución:** Asignar colores en el frontend basándose en el nombre del estado:

```typescript
// StatusColumn.vue
const statusColor = computed(() => {
  const name = props.status.name.toLowerCase()
  if (name.includes('nuevo')) return 'bg-green-500'
  if (name.includes('proceso')) return 'bg-blue-500'
  if (name.includes('oferta')) return 'bg-purple-500'
  if (name.includes('seleccionado')) return 'bg-emerald-500'
  if (name.includes('descartado')) return 'bg-red-500'
  return 'bg-gray-400'
})
```

### 3. Source del Candidato

La API devuelve:
```json
"sourceType": { "value": "api" }
```

El dominio simplifica a:
```typescript
source?: string  // "api" | "manual" | etc.
```

Y en la UI mostramos "Añadido por ATS" (o el valor real).

---

## Impacto del Error 500

### ¿Qué es el error?

El endpoint `PUT /candidates/{id}` devuelve error 500 al intentar actualizar un candidato, incluso con datos válidos.

### ¿Afecta al diseño del dominio?

**No.** El dominio se diseña basándose en:
1. Los datos que la API devuelve (GET)
2. Los datos que la API espera recibir (POST/PUT según documentación)

El error 500 es un **problema de implementación del servidor**, no un problema de contrato de API. Los campos documentados para PUT son:
- `firstName` ✓
- `lastName` ✓
- `vacancyId` ✓
- `statusId` ✓

Nuestro modelo `UpdateCandidateDTO` refleja esto correctamente.

### ¿Afecta a la arquitectura?

**Mínimamente.** Agregamos un fallback en la capa de aplicación:

```typescript
// vacancyStore.ts
async function moveCandidateToStatus(candidateId: string, newStatusId: string) {
  // Actualizar Pinia (optimistic update)
  candidate.statusId = newStatusId

  try {
    await api.put(...)  // Intenta persistir en servidor
  } catch {
    // Fallback: guardar en localStorage
    saveLocalStatusOverride(candidateId, newStatusId)
  }
}
```

### ¿Es correcto el fallback?

**Sí, por estas razones:**

1. **Separación de capas:** El dominio no sabe nada del fallback. La lógica está en la capa de aplicación (store).

2. **El modelo no cambia:** `Candidate` sigue teniendo `statusId`. El localStorage solo almacena overrides.

3. **Transparente para la UI:** Los componentes Vue no saben si el dato viene de API o localStorage.

4. **Reversible:** Cuando la API se arregle, podemos quitar el fallback sin tocar el dominio.

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                         DOMINIO                             │
│  (No cambia por el error - define contratos)                │
│                                                             │
│  ┌─────────────┐     ┌──────────────────┐                  │
│  │ Candidate   │     │ CandidateRepo    │                  │
│  │ - statusId  │     │ - update()       │                  │
│  └─────────────┘     └──────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      APLICACIÓN                             │
│  (Maneja el fallback aquí)                                  │
│                                                             │
│  moveCandidateToStatus() {                                  │
│    1. Actualizar Pinia                                      │
│    2. try { await api.put() }                               │
│    3. catch { localStorage.setItem() }  ← FALLBACK          │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    INFRAESTRUCTURA                          │
│  (Implementa el puerto - devuelve error 500)                │
│                                                             │
│  CandidateApiRepository.update() → throw Error(500)         │
└─────────────────────────────────────────────────────────────┘
```

---

## Pruebas Adicionales de la API

Además de los 4 endpoints proporcionados en la prueba técnica, se realizaron pruebas adicionales a todos los endpoints del módulo `/recruitment` documentados en el Swagger oficial: https://apidocs.sesametime.com/

### Endpoints Documentados vs Probados

| # | Método | Endpoint | En Prueba Técnica | Estado Real |
|---|--------|----------|-------------------|-------------|
| 1 | GET | `/recruitment/v1/vacancies/` | No | ⚠️ Redirect HTML |
| 2 | GET | `/recruitment/v1/vacancies/{id}` | No | ✅ Funciona |
| 3 | GET | `/recruitment/v1/vacancies/{vacancyId}/candidates` | **Sí** | ✅ Funciona |
| 4 | POST | `/recruitment/v1/candidates` | **Sí** | ✅ Funciona |
| 5 | GET | `/recruitment/v1/candidates/{id}` | No | ✅ Funciona |
| 6 | PUT | `/recruitment/v1/candidates/{id}` | **Sí** | ❌ Error 500 |
| 7 | DELETE | `/recruitment/v1/candidates/{id}` | No | ❌ 405 Not Allowed |
| 8 | GET | `/recruitment/v1/candidate-status/{vacancyId}` | **Sí** | ✅ Funciona |

### Hallazgos de las Pruebas Adicionales

#### 1. DELETE /candidates/{id} - No implementado

Aunque aparece en Swagger, el servidor responde:
```json
{
  "error": {
    "status": 405,
    "message": "Method Not Allowed (Allow: GET, PUT)",
    "errors": { "route": "method_not_allowed" }
  }
}
```

**Conclusión:** El endpoint está documentado pero no implementado en el servidor.

#### 2. GET /vacancies/ - Redirect

En lugar de devolver JSON, hace redirect a:
```
http://backt.sesametime.com/public/recruitment/v1/vacancies
```

**Conclusión:** Posible problema de configuración del servidor o endpoint deprecado.

#### 3. Campo `color` - Nunca presente

Se verificó en múltiples endpoints:
- `GET /candidate-status/{vacancyId}`: No incluye campo `color`
- `GET /candidates` (objeto `status` anidado): Devuelve `"color": null`
- `GET /candidates/{id}` (objeto `status` anidado): Devuelve `"color": null`

**Conclusión:** La API no proporciona colores para los estados. El diseño Figma muestra colores, por lo que se deben asignar en el frontend basándose en el nombre del estado.

### Impacto en el Dominio

Estas pruebas adicionales **confirman** las decisiones de modelado:

1. **`color?: string` (opcional)** - Correcto, la API nunca lo envía
2. **Fallback localStorage** - Necesario porque PUT no funciona
3. **No modelar DELETE** - El endpoint no existe realmente

Ver documento completo de pruebas en: [PRUEBAS_API.md](./PRUEBAS_API.md)

---

## Conclusión

El dominio de la aplicación se diseñó:

1. **Basándose en las respuestas reales de la API** - No en suposiciones
2. **Extrayendo solo los campos necesarios** - Modelos simples y enfocados
3. **Siguiendo los contratos documentados** - Para operaciones de escritura
4. **Independiente de errores de servidor** - El error 500 no afecta el modelado
5. **Validado con pruebas adicionales** - Se probaron todos los endpoints del Swagger

El error del PUT es un problema de **infraestructura**, no de **dominio**. La solución (localStorage) se implementó en la capa correcta (aplicación) sin contaminar el modelo de dominio.

Las pruebas adicionales revelaron discrepancias entre la documentación Swagger y la implementación real del servidor (DELETE no implementado, GET /vacancies/ con redirect, campo color ausente).
