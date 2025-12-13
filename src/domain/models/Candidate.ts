export interface Candidate {
  id: string
  firstName: string
  lastName: string
  phone?: string
  vacancyId: string
  statusId: string
  createdAt: string
  updatedAt: string
  source?: string
}

export interface CandidateResponse {
  data: Candidate[]
  meta: {
    currentPage: number
    lastPage: number
    perPage: number
    total: number
  }
}

export interface CreateCandidateDTO {
  firstName: string
  lastName: string
  vacancyId: string
  statusId: string
}

export interface UpdateCandidateDTO {
  firstName: string
  lastName: string
  phone: string
  vacancyId: string
  statusId: string
}
