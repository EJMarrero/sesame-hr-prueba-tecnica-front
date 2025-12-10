import type { CandidateRepository } from '@domain/ports/CandidateRepository'

export class DeleteCandidate {
  private repository: CandidateRepository

  constructor(repository: CandidateRepository) {
    this.repository = repository
  }

  async execute(candidateId: string): Promise<void> {
    return this.repository.delete(candidateId)
  }
}
