import type { CandidateRepository } from '@domain/ports/CandidateRepository'
import type { Candidate } from '@domain/models/Candidate'

export class GetCandidates {
  private repository: CandidateRepository

  constructor(repository: CandidateRepository) {
    this.repository = repository
  }

  async execute(vacancyId: string): Promise<Candidate[]> {
    return this.repository.getByVacancyId(vacancyId)
  }
}
