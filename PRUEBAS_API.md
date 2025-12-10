# Pruebas de Endpoints API - Recruitment

**Fecha:** 10 de diciembre de 2025
**Base URL:** `https://api-test.sesametime.com`
**Autenticación:** Bearer Token

---

## Resumen de Endpoints

| # | Método | Endpoint | En Prueba Técnica | Estado |
|---|--------|----------|-------------------|--------|
| 1 | GET | `/recruitment/v1/vacancies/` | No | Redirect (no funciona) |
| 2 | GET | `/recruitment/v1/vacancies/{id}` | No | ✅ Funciona |
| 3 | GET | `/recruitment/v1/vacancies/{vacancyId}/candidates` | **Sí** | ✅ Funciona |
| 4 | POST | `/recruitment/v1/candidates` | **Sí** | ✅ Funciona |
| 5 | GET | `/recruitment/v1/candidates/{id}` | No | ✅ Funciona |
| 6 | PUT | `/recruitment/v1/candidates/{id}` | **Sí** | ❌ Error 500 |
| 7 | DELETE | `/recruitment/v1/candidates/{id}` | No | ❌ Method Not Allowed |
| 8 | GET | `/recruitment/v1/candidate-status/{vacancyId}` | **Sí** | ✅ Funciona |

---

## Pruebas Detalladas

### 1. GET /recruitment/v1/vacancies/

**Request:**
```bash
curl -s "https://api-test.sesametime.com/recruitment/v1/vacancies/" \
  -H "Authorization: Bearer {token}"
```

**Response:** Redirect HTML (no funciona correctamente)
```html
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="refresh" content="0;url='http://backt.sesametime.com/public/recruitment/v1/vacancies'" />
        <title>Redirecting to http://backt.sesametime.com/public/recruitment/v1/vacancies</title>
    </head>
    <body>
        Redirecting to <a href="...">...</a>.
    </body>
</html>
```

**Estado:** ⚠️ Redirect - No devuelve JSON
**Nota:** El endpoint parece requerir trailing slash o tiene problemas de configuración

---

### 2. GET /recruitment/v1/vacancies/{id}

**Request:**
```bash
curl -s "https://api-test.sesametime.com/recruitment/v1/vacancies/2fd59040-bce0-498e-b8fa-101621138da6" \
  -H "Authorization: Bearer {token}"
```

**Response:**
```json
{
  "data": {
    "id": "2fd59040-bce0-498e-b8fa-101621138da6",
    "companyId": "7ae449bc-620c-4851-9d56-d25ff4094e34",
    "name": "Eduardo M.",
    "description": "<p class=\"min-h-4\">Eduardo M.</p>",
    "contractType": "full_time",
    "experience": null,
    "createdById": "8504e625-90c2-4cc6-8f44-f7810e0b1215",
    "status": "draft",
    "openedAt": null,
    "createdAt": "2025-12-10 09:37:12",
    "updatedAt": "2025-12-10 09:37:12",
    "public": false,
    "locationVacancy": null,
    "scheduleType": {
      "id": "68e37e70-eca4-4d05-bbde-c5df190b37f9",
      "companyId": "7ae449bc-620c-4851-9d56-d25ff4094e34",
      "name": "Jornada completa",
      "createdAt": "2024-04-29 06:43:13"
    },
    "category": {
      "id": "e9fe995a-403f-4acc-afa2-99882fa460f9",
      "companyId": "7ae449bc-620c-4851-9d56-d25ff4094e34",
      "name": "Dev",
      "createdAt": "2024-06-25 06:16:17"
    },
    "officeIds": ["65c8dd78-4325-4b04-bbcd-21f4a3515f1f"],
    "departmentIds": [],
    "evaluationId": null
  },
  "meta": {
    "currentPage": 1,
    "lastPage": 1,
    "total": 1,
    "perPage": 1
  }
}
```

**Estado:** ✅ Funciona
**Campos relevantes:** `id`, `name`, `description`, `contractType`, `status`, `scheduleType`, `category`

---

### 3. GET /recruitment/v1/vacancies/{vacancyId}/candidates

**Request:**
```bash
curl -s "https://api-test.sesametime.com/recruitment/v1/vacancies/2fd59040-bce0-498e-b8fa-101621138da6/candidates" \
  -H "Authorization: Bearer {token}"
```

**Response:** (simplificada)
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
        "icon": null
      },
      "vacancy": { ... },
      "sourceType": { "value": "api" },
      "createdAt": "2025-12-10T10:46:51+00:00",
      "updatedAt": "2025-12-10T10:46:51+00:00"
    }
  ],
  "meta": {
    "currentPage": 1,
    "lastPage": 1,
    "total": 1,
    "perPage": 20
  }
}
```

**Estado:** ✅ Funciona
**Usado en la prueba técnica:** Sí
**Observación:** Incluye objetos anidados `status` y `vacancy` con información completa

---

### 4. POST /recruitment/v1/candidates

**Request:**
```bash
curl -X POST "https://api-test.sesametime.com/recruitment/v1/candidates" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "vacancyId": "2fd59040-bce0-498e-b8fa-101621138da6",
    "statusId": "91b56d6d-eaf1-4f3c-b394-f07eabb06fe0"
  }'
```

**Estado:** ✅ Funciona
**Usado en la prueba técnica:** Sí
**Campos requeridos:** `firstName`, `lastName`, `vacancyId`, `statusId`

---

### 5. GET /recruitment/v1/candidates/{id}

**Request:**
```bash
curl -s "https://api-test.sesametime.com/recruitment/v1/candidates/62f45392-6177-41c4-b4d4-165e119abfe6" \
  -H "Authorization: Bearer {token}"
```

**Response:** (simplificada)
```json
{
  "data": {
    "id": "62f45392-6177-41c4-b4d4-165e119abfe6",
    "companyId": "7ae449bc-620c-4851-9d56-d25ff4094e34",
    "vacancyId": "2fd59040-bce0-498e-b8fa-101621138da6",
    "firstName": "Eduardo",
    "lastName": "Marrero",
    "email": "",
    "phone": "",
    "type": "new",
    "statusId": "91b56d6d-eaf1-4f3c-b394-f07eabb06fe0",
    "status": {
      "id": "91b56d6d-eaf1-4f3c-b394-f07eabb06fe0",
      "name": "Nuevo",
      "order": 1,
      "color": null,
      "icon": null
    },
    "vacancy": { ... },
    "createdAt": "2025-12-10T10:46:51+00:00",
    "updatedAt": "2025-12-10T10:46:51+00:00"
  },
  "meta": {
    "currentPage": 1,
    "lastPage": 1,
    "total": 1,
    "perPage": 1
  }
}
```

**Estado:** ✅ Funciona
**Usado en la prueba técnica:** No
**Observación:** Similar a GET /vacancies/{id}/candidates pero para un candidato específico

---

### 6. PUT /recruitment/v1/candidates/{id}

**Request:**
```bash
curl -X PUT "https://api-test.sesametime.com/recruitment/v1/candidates/62f45392-6177-41c4-b4d4-165e119abfe6" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Eduardo",
    "lastName": "Marrero",
    "vacancyId": "2fd59040-bce0-498e-b8fa-101621138da6",
    "statusId": "5644397e-82be-4398-bd05-f702c9ce7f38"
  }'
```

**Response:**
```json
{
  "error": {
    "status": 500,
    "message": "Unknown error",
    "errors": "unknown_error"
  }
}
```

**Estado:** ❌ Error 500
**Usado en la prueba técnica:** Sí
**Bug:** El servidor devuelve error interno incluso con datos válidos

---

### 7. DELETE /recruitment/v1/candidates/{id}

**Request:**
```bash
curl -X DELETE "https://api-test.sesametime.com/recruitment/v1/candidates/{id}" \
  -H "Authorization: Bearer {token}"
```

**Response:**
```json
{
  "error": {
    "status": 405,
    "message": "No route found for DELETE http://backt.sesametime.com/public/recruitment/v1/candidates/{id}: Method Not Allowed (Allow: GET, PUT)",
    "errors": {
      "route": "method_not_allowed"
    }
  }
}
```

**Estado:** ❌ Method Not Allowed (405)
**Usado en la prueba técnica:** No
**Nota:** El endpoint aparece en Swagger pero **no está implementado**. Solo permite GET y PUT.

---

### 8. GET /recruitment/v1/candidate-status/{vacancyId}

**Request:**
```bash
curl -s "https://api-test.sesametime.com/recruitment/v1/candidate-status/2fd59040-bce0-498e-b8fa-101621138da6" \
  -H "Authorization: Bearer {token}"
```

**Response:**
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

**Estado:** ✅ Funciona
**Usado en la prueba técnica:** Sí
**Observación:** No incluye campo `color` ni `icon`

---

## Conclusiones

### Endpoints Funcionales para la Prueba Técnica

| Endpoint | Uso |
|----------|-----|
| GET `/candidate-status/{vacancyId}` | Obtener columnas del Kanban |
| GET `/vacancies/{vacancyId}/candidates` | Obtener candidatos |
| POST `/candidates` | Crear candidatos |

### Endpoints con Problemas

| Endpoint | Problema | Impacto |
|----------|----------|---------|
| PUT `/candidates/{id}` | Error 500 | No se puede cambiar estado via API |
| DELETE `/candidates/{id}` | Method Not Allowed | No se puede eliminar candidatos |
| GET `/vacancies/` | Redirect HTML | No se puede listar vacantes |

### Observaciones sobre el Campo `color`

- **GET `/candidate-status/{vacancyId}`**: NO devuelve campo `color`
- **GET `/candidates` (objeto status anidado)**: Devuelve `color: null`
- **Conclusión**: La API no proporciona colores de estado, se deben asignar en frontend

### Solución Implementada para PUT

Debido al error 500 del PUT, se implementó fallback con localStorage:
1. Se intenta la llamada PUT
2. Si falla, se guarda el cambio en localStorage
3. Al recargar, se aplican los overrides locales sobre los datos de la API

---

## Recomendaciones para el Backend

### 1. Campo `color` ausente

**Problema:** El campo `color` no se devuelve en `GET /candidate-status/{vacancyId}` y viene como `null` en los objetos anidados.

**Impacto:** El frontend debe hardcodear colores basándose en el nombre del estado, lo cual es frágil y propenso a errores.

**Recomendación:** Incluir el campo `color` con valor hexadecimal en la respuesta:
```json
{
  "id": "...",
  "name": "Nuevo",
  "color": "#22c55e",
  "order": 1
}
```

---

### 2. Nombres de estados hardcodeados en español

**Problema:** Los nombres de estados vienen directamente en español desde el servidor:
```json
{ "name": "Nuevo" }
{ "name": "En proceso" }
{ "name": "Oferta" }
{ "name": "Seleccionado" }
{ "name": "Descartado" }
```

**Impacto:**
- Imposibilita la internacionalización (i18n) del frontend
- El frontend tendría que mapear strings en español a claves de traducción
- Si el backend cambia el texto ("Nuevo" → "New"), el frontend se rompe

**Recomendación:** Añadir un campo `key` o `code` inmutable para identificación:
```json
{
  "id": "...",
  "key": "new",
  "name": "Nuevo",
  "color": "#22c55e",
  "order": 1
}
```

Así el frontend puede:
- Usar `key` para lógica y traducciones
- Mostrar `name` si quiere usar el valor del servidor
- Traducir `key` a cualquier idioma con archivos de i18n

---

### 3. Endpoint DELETE no implementado

**Problema:** `DELETE /candidates/{id}` aparece en Swagger pero devuelve 405 Method Not Allowed.

**Recomendación:**
- Implementar el endpoint si es funcionalidad deseada
- O removerlo de la documentación Swagger si no está planeado

---

### 4. Endpoint PUT devuelve Error 500

**Problema:** `PUT /candidates/{id}` devuelve error 500 con datos válidos.

**Recomendación:** Revisar logs del servidor para identificar la causa del error interno.

---

### 5. GET /vacancies/ hace redirect

**Problema:** El endpoint devuelve HTML con redirect en lugar de JSON.

**Recomendación:** Verificar configuración de rutas del servidor.
