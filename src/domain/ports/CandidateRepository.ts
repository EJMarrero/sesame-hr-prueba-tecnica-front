import type { Candidate, CreateCandidateDTO, UpdateCandidateDTO } from '@domain/models/Candidate'

export interface CandidateRepository {
  getByVacancyId(vacancyId: string): Promise<Candidate[]>
  create(data: CreateCandidateDTO): Promise<Candidate>
  update(candidateId: string, data: UpdateCandidateDTO): Promise<Candidate>
}
