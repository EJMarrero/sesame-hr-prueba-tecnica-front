import type { CandidateRepository } from '@domain/ports/CandidateRepository'
import type { Candidate, UpdateCandidateDTO } from '@domain/models/Candidate'

export class UpdateCandidateStatus {
  private repository: CandidateRepository

  constructor(repository: CandidateRepository) {
    this.repository = repository
  }

  async execute(candidateId: string, data: UpdateCandidateDTO): Promise<Candidate> {
    return this.repository.update(candidateId, data)
  }
}
