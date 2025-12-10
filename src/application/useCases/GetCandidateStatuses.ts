import type { CandidateStatusRepository } from '@domain/ports/CandidateStatusRepository'
import type { CandidateStatus } from '@domain/models/CandidateStatus'

export class GetCandidateStatuses {
  private repository: CandidateStatusRepository

  constructor(repository: CandidateStatusRepository) {
    this.repository = repository
  }

  async execute(vacancyId: string): Promise<CandidateStatus[]> {
    return this.repository.getByVacancyId(vacancyId)
  }
}
