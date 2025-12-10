import type { CandidateStatus } from '@domain/models/CandidateStatus'

export interface CandidateStatusRepository {
  getByVacancyId(vacancyId: string): Promise<CandidateStatus[]>
}
