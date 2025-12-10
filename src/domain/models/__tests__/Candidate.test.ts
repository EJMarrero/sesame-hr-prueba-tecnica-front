import { describe, it, expect } from 'vitest'
import type { Candidate, CreateCandidateDTO, UpdateCandidateDTO } from '../Candidate'

describe('Candidate Model', () => {
  describe('Candidate interface', () => {
    it('should have all required properties', () => {
      const candidate: Candidate = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'Juan',
        lastName: 'García',
        vacancyId: '987fcdeb-51a2-3b4c-d5e6-789012345678',
        statusId: 'abc12345-6789-0def-ghij-klmnopqrstuv',
        createdAt: '2025-12-10T10:00:00+00:00',
        updatedAt: '2025-12-10T10:00:00+00:00',
      }

      expect(candidate.id).toBeDefined()
      expect(candidate.firstName).toBe('Juan')
      expect(candidate.lastName).toBe('García')
      expect(candidate.vacancyId).toBeDefined()
      expect(candidate.statusId).toBeDefined()
      expect(candidate.createdAt).toBeDefined()
      expect(candidate.updatedAt).toBeDefined()
    })

    it('should allow optional source property', () => {
      const candidateWithSource: Candidate = {
        id: '123',
        firstName: 'Ana',
        lastName: 'López',
        vacancyId: '456',
        statusId: '789',
        createdAt: '2025-12-10T10:00:00+00:00',
        updatedAt: '2025-12-10T10:00:00+00:00',
        source: 'api',
      }

      expect(candidateWithSource.source).toBe('api')
    })

    it('should work without optional source property', () => {
      const candidateWithoutSource: Candidate = {
        id: '123',
        firstName: 'Carlos',
        lastName: 'Martín',
        vacancyId: '456',
        statusId: '789',
        createdAt: '2025-12-10T10:00:00+00:00',
        updatedAt: '2025-12-10T10:00:00+00:00',
      }

      expect(candidateWithoutSource.source).toBeUndefined()
    })
  })

  describe('CreateCandidateDTO', () => {
    it('should contain only required fields for creation', () => {
      // Según la documentación de la API, estos son los campos requeridos
      const dto: CreateCandidateDTO = {
        firstName: 'María',
        lastName: 'Rodríguez',
        vacancyId: '2fd59040-bce0-498e-b8fa-101621138da6',
        statusId: '91b56d6d-eaf1-4f3c-b394-f07eabb06fe0',
      }

      expect(dto.firstName).toBe('María')
      expect(dto.lastName).toBe('Rodríguez')
      expect(dto.vacancyId).toBeDefined()
      expect(dto.statusId).toBeDefined()
      // No debe tener id, createdAt, updatedAt - esos los genera el servidor
      expect((dto as Candidate).id).toBeUndefined()
    })
  })

  describe('UpdateCandidateDTO', () => {
    it('should contain required fields for update', () => {
      // NOTA: La API requiere enviar todos estos campos en PUT,
      // aunque solo queramos cambiar el statusId
      const dto: UpdateCandidateDTO = {
        firstName: 'Eduardo',
        lastName: 'Marrero',
        vacancyId: '2fd59040-bce0-498e-b8fa-101621138da6',
        statusId: '5644397e-82be-4398-bd05-f702c9ce7f38', // Cambio a "En proceso"
      }

      expect(dto.firstName).toBeDefined()
      expect(dto.lastName).toBeDefined()
      expect(dto.vacancyId).toBeDefined()
      expect(dto.statusId).toBeDefined()
    })
  })
})
