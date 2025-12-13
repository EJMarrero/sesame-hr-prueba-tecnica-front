# Review de Swagger - Lecciones Aprendidas

**Fecha:** 13 de diciembre de 2025

---

## Contexto

Durante el desarrollo de la prueba técnica, el endpoint `PUT /recruitment/v1/candidates/{id}` devolvía error 500. Se implementó un workaround con localStorage como fallback.

Posteriormente, al revisar la documentación de Swagger, se identificó la causa real del problema.

---

## Pruebas Originales con cURL

Antes de implementar el workaround, se realizaron pruebas empíricas con cURL para entender el comportamiento del endpoint PUT.

### Prueba 1: statusId inválido

```bash
curl -X PUT "https://api-test.sesametime.com/recruitment/v1/candidates/{id}" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Eduardo",
    "lastName": "Marrero",
    "vacancyId": "2fd59040-bce0-498e-b8fa-101621138da6",
    "statusId": "00000000-0000-0000-0000-000000000000"
  }'
```

**Respuesta:**
```json
{
  "error": {
    "status": 422,
    "message": "Unprocessable entity",
    "errors": {
      "statusId": ["invalid_status"]
    }
  }
}
```

**Conclusión:** El servidor valida el `statusId` y devuelve un error descriptivo (422) cuando no existe.

### Prueba 2: statusId válido

```bash
curl -X PUT "https://api-test.sesametime.com/recruitment/v1/candidates/{id}" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Eduardo",
    "lastName": "Marrero",
    "vacancyId": "2fd59040-bce0-498e-b8fa-101621138da6",
    "statusId": "5644397e-82be-4398-bd05-f702c9ce7f38"
  }'
```

**Respuesta:**
```json
{
  "error": {
    "status": 500,
    "message": "Unknown error",
    "errors": "unknown_error"
  }
}
```

**Conclusión:** Con un `statusId` válido (obtenido de `GET /candidate-status/{vacancyId}`), el servidor devuelve error 500 genérico.

### Análisis de las pruebas

| Prueba | statusId | Respuesta | Interpretación |
|--------|----------|-----------|----------------|
| 1 | Inválido | 422 + mensaje descriptivo | El backend valida correctamente |
| 2 | Válido | 500 + "Unknown error" | ¿Bug del backend? |

Este comportamiento sugería que:
1. La validación del `statusId` funciona (422 con mensaje claro)
2. El error ocurre **después** de la validación, en el procesamiento interno
3. Parecía un bug del backend, no un problema de nuestro request

---

## Decisión Tomada: Workaround vs Investigación

### Opción A: Investigar más (consultar Swagger)
- Podría revelar campos faltantes
- Pero el spec también puede tener errores/discrepancias
- Riesgo de invertir tiempo en documentación incorrecta

### Opción B: Workaround + escalar a backend
- Entregar funcionalidad requerida
- Documentar el problema
- Contactar backend para resolución definitiva

**Se eligió la Opción B** por pragmatismo: ante un error 500 genérico y evidencia de que la validación funcionaba (422), la conclusión razonable era que existía un bug post-validación en el backend.

### Retrospectiva

El spec de Swagger contenía la respuesta: faltaba el campo `phone` (requerido). Si se hubiera consultado, el problema se habría resuelto sin workaround.

Sin embargo, la decisión tomada no fue incorrecta dado el contexto:
- El error 500 no indicaba qué campo faltaba
- El spec puede contener errores (como la discrepancia de `data` objeto vs array)
- Entregar con workaround + documentar + escalar es una estrategia válida

### Punto medio recomendado

Para futuros casos similares:

1. **Consultar el spec primero** - Revisar campos requeridos antes de probar
2. **Validar empíricamente** - Confirmar que el spec coincide con el comportamiento real
3. **Si hay discrepancia** - Documentar, implementar workaround si es necesario, y escalar
4. **No asumir** - Ni que el spec es perfecto, ni que el backend tiene bugs
5. **No existe panacea** - Este caso ilustra los límites de la programación defensiva:
   - El workaround fue óptimo para la demo, pero genera deuda técnica
   - Válido para entregar, inválido para escalar a producción
   - Revisar documentación "viva" (en estado cambiante) puede alejarnos del objetivo real
   - Con la capacidad de desarrollo generativo por IA actual, a veces es más eficiente iterar rápido que investigar exhaustivamente documentación que puede estar desactualizada

---

## Acceso al Spec de Swagger

**URL de la documentación:** https://apidocs.sesametime.com/#/

### Cómo obtener el spec JSON

1. Abrir DevTools (F12) en el navegador
2. Ir a la pestaña **Network**
3. Filtrar por **XHR**
4. Recargar la página
5. Buscar el archivo `index.json` - este contiene el spec completo de OpenAPI con todos los endpoints, incluyendo `/recruitment/v1`

---

## Problema Identificado: PUT /candidates/{id}

### Lo que enviábamos (incorrecto)

```json
{
  "firstName": "Eduardo",
  "lastName": "Marrero",
  "vacancyId": "2fd59040-bce0-498e-b8fa-101621138da6",
  "statusId": "5644397e-82be-4398-bd05-f702c9ce7f38"
}
```

### Lo que Swagger especifica como requerido

```json
"required": [
  "firstName",
  "lastName",
  "phone"        // <-- Este campo faltaba
]
```

### Solución

```json
{
  "firstName": "Eduardo",
  "lastName": "Marrero",
  "phone": "",   // <-- Añadido (puede ser string vacío)
  "vacancyId": "2fd59040-bce0-498e-b8fa-101621138da6",
  "statusId": "5644397e-82be-4398-bd05-f702c9ce7f38"
}
```

---

## Cambios Realizados en el Código

### 1. Modelo Candidate (`src/domain/models/Candidate.ts`)

```typescript
export interface Candidate {
  id: string
  firstName: string
  lastName: string
  phone?: string        // <-- Añadido (opcional en el modelo hasta implementar UI)
  vacancyId: string
  statusId: string
  // ...
}

export interface UpdateCandidateDTO {
  firstName: string
  lastName: string
  phone: string         // <-- Añadido (requerido en el DTO)
  vacancyId: string
  statusId: string
}
```

### 2. Store (`src/application/stores/vacancyStore.ts`)

```typescript
await updateCandidateStatusUseCase.execute(candidateId, {
  firstName: candidate.firstName,
  lastName: candidate.lastName,
  phone: candidate.phone ?? '',  // <-- Añadido
  vacancyId: candidate.vacancyId,
  statusId: newStatusId,
})
```

---

## Spec Completo del PUT (desde Swagger - index.json)

### Request Body

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `firstName` | string | **Sí** | Nombre del candidato |
| `lastName` | string | **Sí** | Apellido del candidato |
| `phone` | string | **Sí** | Teléfono del candidato |
| `email` | string (email) | No | Email del candidato |
| `vacancyId` | string (uuid) | No | ID de la vacante |
| `statusId` | string (uuid) | No | ID del estado |
| `linkedinURL` | string | No | URL de LinkedIn |
| `desiredSalary` | string | No | Salario deseado |
| `startWorkDate` | string | No | Fecha de inicio disponible |
| `web` | string | No | Sitio web personal |
| `location` | string | No | Ubicación |
| `address` | string | No | Dirección |
| `comment` | string | No | Comentarios |
| `appliedAt` | string (date) | No | Fecha de aplicación |
| `notify` | boolean | No | Notificar al candidato |

### Response 200

Devuelve el objeto `Candidate` actualizado con la misma estructura que GET.

---

## Otros Hallazgos del Spec

### GET /vacancies/{vacancyId}/candidates

Tiene un parámetro query opcional que no conocíamos:

```
GET /vacancies/{vacancyId}/candidates?statusId={statusId}
```

Esto permite filtrar candidatos por estado directamente desde la API, en lugar de cargar todos y filtrar en frontend. (Consultar con Backend)

### Discrepancia en el Spec

El spec documenta `data` como objeto singular:
```json
"data": { "type": "object", ... }
```

Pero la respuesta real es un array:
```json
"data": [ { ... }, { ... } ]
```

---

## Lecciones Aprendidas

1. **Consultar Swagger antes de implementar** - La documentación tenía la respuesta al error 500

2. **Los campos "required" son críticos** - Aunque el backend debería devolver 400/422 en lugar de 500, el problema era un campo faltante

3. **El spec puede tener errores** - La respuesta de `data` como objeto vs array es incorrecta en Swagger

4. **DevTools es tu amigo** - El spec JSON se puede extraer desde Network > XHR

5. **No asumir que un error 500 es un bug del backend** - Puede ser un problema de request incompleto

6. **Ante la duda, programación defensiva es válida** - Pero no siempre tiene por qué ser el único recurso.

---

## Estado Actual

| Endpoint | Estado Anterior | Estado Actual |
|----------|-----------------|---------------|
| PUT `/candidates/{id}` | Error 500 | ✅ Funciona |

El workaround con localStorage ya no es necesario para el funcionamiento normal, aunque permanece como fallback por si la API tiene problemas de disponibilidad.
