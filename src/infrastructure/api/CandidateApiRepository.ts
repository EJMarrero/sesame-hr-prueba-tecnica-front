import type { CandidateRepository } from '@domain/ports/CandidateRepository'
import type { Candidate, CandidateResponse, CreateCandidateDTO, UpdateCandidateDTO } from '@domain/models/Candidate'
import { httpClient } from './httpClient'

export class CandidateApiRepository implements CandidateRepository {
  async getByVacancyId(vacancyId: string): Promise<Candidate[]> {
    const response = await httpClient.get<CandidateResponse>(
      `/recruitment/v1/vacancies/${vacancyId}/candidates`
    )
    return response.data.data
  }

  async create(data: CreateCandidateDTO): Promise<Candidate> {
    const response = await httpClient.post<{ data: Candidate }>(
      '/recruitment/v1/candidates',
      data
    )
    return response.data.data
  }

  async update(candidateId: string, data: UpdateCandidateDTO): Promise<Candidate> {
    const response = await httpClient.put<{ data: Candidate }>(
      `/recruitment/v1/candidates/${candidateId}`,
      data
    )
    return response.data.data
  }
}
