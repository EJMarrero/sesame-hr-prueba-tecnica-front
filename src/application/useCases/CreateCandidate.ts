import type { CandidateRepository } from '@domain/ports/CandidateRepository'
import type { Candidate, CreateCandidateDTO } from '@domain/models/Candidate'

export class CreateCandidate {
  private repository: CandidateRepository

  constructor(repository: CandidateRepository) {
    this.repository = repository
  }

  async execute(data: CreateCandidateDTO): Promise<Candidate> {
    return this.repository.create(data)
  }
}
