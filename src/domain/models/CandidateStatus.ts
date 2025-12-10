export interface CandidateStatus {
  id: string
  name: string
  color?: string
  order: number
}

export interface CandidateStatusResponse {
  data: CandidateStatus[]
  meta: {
    currentPage: number
    lastPage: number
    perPage: number
    total: number
  }
}
