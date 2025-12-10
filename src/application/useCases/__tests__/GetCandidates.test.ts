import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetCandidates } from '../GetCandidates'
import type { CandidateRepository } from '@domain/ports/CandidateRepository'
import type { Candidate } from '@domain/models/Candidate'

describe('GetCandidates Use Case', () => {
  let useCase: GetCandidates
  let mockRepository: CandidateRepository

  const mockCandidates: Candidate[] = [
    {
      id: '62f45392-6177-41c4-b4d4-165e119abfe6',
      firstName: 'Eduardo',
      lastName: 'Marrero',
      vacancyId: '2fd59040-bce0-498e-b8fa-101621138da6',
      statusId: '91b56d6d-eaf1-4f3c-b394-f07eabb06fe0',
      createdAt: '2025-12-10T10:46:51+00:00',
      updatedAt: '2025-12-10T10:46:51+00:00',
      source: 'api',
    },
    {
      id: 'another-candidate-id',
      firstName: 'Ana',
      lastName: 'García',
      vacancyId: '2fd59040-bce0-498e-b8fa-101621138da6',
      statusId: '5644397e-82be-4398-bd05-f702c9ce7f38',
      createdAt: '2025-12-10T11:00:00+00:00',
      updatedAt: '2025-12-10T11:00:00+00:00',
    },
  ]

  beforeEach(() => {
    // Principio SOLID - Dependency Inversion:
    // El caso de uso depende de una abstracción (CandidateRepository),
    // no de una implementación concreta (CandidateApiRepository)
    mockRepository = {
      getByVacancyId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    }
    useCase = new GetCandidates(mockRepository)
  })

  it('should call repository with correct vacancyId', async () => {
    const vacancyId = '2fd59040-bce0-498e-b8fa-101621138da6'
    vi.mocked(mockRepository.getByVacancyId).mockResolvedValue(mockCandidates)

    await useCase.execute(vacancyId)

    expect(mockRepository.getByVacancyId).toHaveBeenCalledWith(vacancyId)
    expect(mockRepository.getByVacancyId).toHaveBeenCalledTimes(1)
  })

  it('should return candidates from repository', async () => {
    vi.mocked(mockRepository.getByVacancyId).mockResolvedValue(mockCandidates)

    const result = await useCase.execute('any-vacancy-id')

    expect(result).toEqual(mockCandidates)
    expect(result).toHaveLength(2)
  })

  it('should return empty array when no candidates exist', async () => {
    vi.mocked(mockRepository.getByVacancyId).mockResolvedValue([])

    const result = await useCase.execute('empty-vacancy-id')

    expect(result).toEqual([])
    expect(result).toHaveLength(0)
  })

  it('should propagate repository errors', async () => {
    // El caso de uso no maneja errores - los propaga hacia arriba
    // El manejo de errores se hace en la capa de aplicación (store)
    const error = new Error('Network error')
    vi.mocked(mockRepository.getByVacancyId).mockRejectedValue(error)

    await expect(useCase.execute('any-id')).rejects.toThrow('Network error')
  })
})
