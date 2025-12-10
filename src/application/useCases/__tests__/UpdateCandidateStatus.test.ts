import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UpdateCandidateStatus } from '../UpdateCandidateStatus'
import type { CandidateRepository } from '@domain/ports/CandidateRepository'
import type { Candidate, UpdateCandidateDTO } from '@domain/models/Candidate'

describe('UpdateCandidateStatus Use Case', () => {
  let useCase: UpdateCandidateStatus
  let mockRepository: CandidateRepository

  const candidateId = '62f45392-6177-41c4-b4d4-165e119abfe6'

  const updateData: UpdateCandidateDTO = {
    firstName: 'Eduardo',
    lastName: 'Marrero',
    vacancyId: '2fd59040-bce0-498e-b8fa-101621138da6',
    statusId: '5644397e-82be-4398-bd05-f702c9ce7f38', // "En proceso"
  }

  const updatedCandidate: Candidate = {
    id: candidateId,
    ...updateData,
    createdAt: '2025-12-10T10:46:51+00:00',
    updatedAt: '2025-12-10T12:00:00+00:00',
  }

  beforeEach(() => {
    mockRepository = {
      getByVacancyId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    }
    useCase = new UpdateCandidateStatus(mockRepository)
  })

  it('should call repository.update with correct parameters', async () => {
    vi.mocked(mockRepository.update).mockResolvedValue(updatedCandidate)

    await useCase.execute(candidateId, updateData)

    expect(mockRepository.update).toHaveBeenCalledWith(candidateId, updateData)
    expect(mockRepository.update).toHaveBeenCalledTimes(1)
  })

  it('should return updated candidate on success', async () => {
    vi.mocked(mockRepository.update).mockResolvedValue(updatedCandidate)

    const result = await useCase.execute(candidateId, updateData)

    expect(result).toEqual(updatedCandidate)
    expect(result.statusId).toBe(updateData.statusId)
  })

  describe('API Error 500 - Known Backend Bug', () => {
    // IMPORTANTE: Este test documenta un bug conocido del backend
    // El endpoint PUT /candidates/{id} devuelve error 500
    // incluso con datos válidos.
    // Ver PRUEBAS_API.md para detalles completos

    it('should propagate server error 500 from repository', async () => {
      // Simula el comportamiento real del backend
      const serverError = new Error('Request failed with status code 500')
      vi.mocked(mockRepository.update).mockRejectedValue(serverError)

      await expect(useCase.execute(candidateId, updateData))
        .rejects.toThrow('Request failed with status code 500')
    })

    it('should handle validation error 422 for invalid statusId', async () => {
      // La API SÍ valida correctamente el statusId antes del error 500
      // Un statusId inválido devuelve 422 con mensaje descriptivo
      const validationError = new Error('Unprocessable entity: statusId invalid_status')
      vi.mocked(mockRepository.update).mockRejectedValue(validationError)

      const invalidData: UpdateCandidateDTO = {
        ...updateData,
        statusId: 'status-id-que-no-existe', // ID inválido
      }

      await expect(useCase.execute(candidateId, invalidData))
        .rejects.toThrow('Unprocessable entity')
    })
  })

  describe('UpdateCandidateDTO requirements', () => {
    // La API requiere enviar todos los campos en PUT,
    // no permite actualizaciones parciales

    it('should require all mandatory fields', () => {
      // Verificar que DTO tiene todos los campos requeridos
      expect(updateData.firstName).toBeDefined()
      expect(updateData.lastName).toBeDefined()
      expect(updateData.vacancyId).toBeDefined()
      expect(updateData.statusId).toBeDefined()
    })

    it('should use statusId to change candidate status in Kanban', async () => {
      // Este es el caso de uso principal: mover candidato entre columnas
      // El drag & drop cambia el statusId para mover el candidato
      const newStatusId = '3c6722f3-9704-4ad7-b91d-b6ccdb373be0' // "Oferta"
      const moveToOferta: UpdateCandidateDTO = {
        ...updateData,
        statusId: newStatusId,
      }

      vi.mocked(mockRepository.update).mockResolvedValue({
        ...updatedCandidate,
        statusId: newStatusId,
      })

      const result = await useCase.execute(candidateId, moveToOferta)

      expect(result.statusId).toBe(newStatusId)
    })
  })
})
