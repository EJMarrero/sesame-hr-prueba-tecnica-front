import type { CandidateStatusRepository } from '@domain/ports/CandidateStatusRepository'
import type { CandidateStatus, CandidateStatusResponse } from '@domain/models/CandidateStatus'
import { httpClient } from './httpClient'

export class CandidateStatusApiRepository implements CandidateStatusRepository {
  async getByVacancyId(vacancyId: string): Promise<CandidateStatus[]> {
    const response = await httpClient.get<CandidateStatusResponse>(
      `/recruitment/v1/candidate-status/${vacancyId}`
    )
    return response.data.data
  }
}
