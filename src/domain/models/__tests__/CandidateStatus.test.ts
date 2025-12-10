import { describe, it, expect } from 'vitest'
import type { CandidateStatus, CandidateStatusResponse } from '../CandidateStatus'

describe('CandidateStatus Model', () => {
  describe('CandidateStatus interface', () => {
    it('should have required properties', () => {
      const status: CandidateStatus = {
        id: '91b56d6d-eaf1-4f3c-b394-f07eabb06fe0',
        name: 'Nuevo',
        order: 1,
      }

      expect(status.id).toBeDefined()
      expect(status.name).toBe('Nuevo')
      expect(status.order).toBe(1)
    })

    it('should allow optional color property', () => {
      // NOTA: El campo color es opcional porque GET /candidate-status
      // NO devuelve este campo, aunque GET /candidates lo incluye
      // dentro del objeto status anidado (siempre como null)
      // Ver PRUEBAS_API.md para detalles
      const statusWithColor: CandidateStatus = {
        id: '123',
        name: 'En proceso',
        order: 2,
        color: '#3B82F6',
      }

      expect(statusWithColor.color).toBe('#3B82F6')
    })

    it('should work without optional color property', () => {
      // Este es el caso real - la API no devuelve colores
      const statusWithoutColor: CandidateStatus = {
        id: '123',
        name: 'Oferta',
        order: 3,
      }

      expect(statusWithoutColor.color).toBeUndefined()
    })
  })

  describe('Status ordering', () => {
    it('should sort statuses by order property', () => {
      // Los estados vienen de la API con un orden específico
      // que debe respetarse en la UI (columnas del Kanban)
      const statuses: CandidateStatus[] = [
        { id: '3', name: 'Oferta', order: 3 },
        { id: '1', name: 'Nuevo', order: 1 },
        { id: '5', name: 'Descartado', order: 5 },
        { id: '2', name: 'En proceso', order: 2 },
        { id: '4', name: 'Seleccionado', order: 4 },
      ]

      const sorted = [...statuses].sort((a, b) => a.order - b.order)

      expect(sorted[0].name).toBe('Nuevo')
      expect(sorted[1].name).toBe('En proceso')
      expect(sorted[2].name).toBe('Oferta')
      expect(sorted[3].name).toBe('Seleccionado')
      expect(sorted[4].name).toBe('Descartado')
    })
  })

  describe('CandidateStatusResponse', () => {
    it('should match API response structure', () => {
      // Estructura real de la respuesta de GET /candidate-status/{vacancyId}
      const response: CandidateStatusResponse = {
        data: [
          { id: '91b56d6d-eaf1-4f3c-b394-f07eabb06fe0', name: 'Nuevo', order: 1 },
          { id: '5644397e-82be-4398-bd05-f702c9ce7f38', name: 'En proceso', order: 2 },
          { id: '3c6722f3-9704-4ad7-b91d-b6ccdb373be0', name: 'Oferta', order: 3 },
          { id: '01b4d054-8912-4059-8f6e-edbb1b8a3353', name: 'Seleccionado', order: 4 },
          { id: 'bdb1aaf3-a86b-43eb-874a-72936aed918b', name: 'Descartado', order: 5 },
        ],
        meta: {
          currentPage: 1,
          lastPage: 1,
          total: 5,
          perPage: 20,
        },
      }

      expect(response.data).toHaveLength(5)
      expect(response.meta.total).toBe(5)
    })
  })

  describe('Known API behavior', () => {
    it('should handle Spanish status names (i18n limitation)', () => {
      // NOTA: La API devuelve nombres hardcodeados en español
      // sin una clave de internacionalización (key).
      // Esto es una limitación documentada - ver PRUEBAS_API.md
      // Recomendación al backend: incluir un campo "key" para i18n

      const statusFromApi: CandidateStatus = {
        id: '91b56d6d-eaf1-4f3c-b394-f07eabb06fe0',
        name: 'Nuevo', // Hardcoded en español
        order: 1,
      }

      // El frontend debe manejar estos nombres específicos
      // para asignar colores e iconos (ver StatusColumn.vue)
      const expectedNames = ['Nuevo', 'En proceso', 'Oferta', 'Seleccionado', 'Descartado']
      expect(expectedNames).toContain(statusFromApi.name)
    })
  })
})
