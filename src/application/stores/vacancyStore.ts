import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Candidate, CreateCandidateDTO } from '@domain/models/Candidate'
import type { CandidateStatus } from '@domain/models/CandidateStatus'
import { CandidateApiRepository } from '@infrastructure/api/CandidateApiRepository'
import { CandidateStatusApiRepository } from '@infrastructure/api/CandidateStatusApiRepository'
import { GetCandidates } from '@application/useCases/GetCandidates'
import { GetCandidateStatuses } from '@application/useCases/GetCandidateStatuses'
import { CreateCandidate } from '@application/useCases/CreateCandidate'
import { UpdateCandidateStatus } from '@application/useCases/UpdateCandidateStatus'
import { apiConfig } from '@infrastructure/config/api.config'

const candidateRepository = new CandidateApiRepository()
const statusRepository = new CandidateStatusApiRepository()

const getCandidatesUseCase = new GetCandidates(candidateRepository)
const getStatusesUseCase = new GetCandidateStatuses(statusRepository)
const createCandidateUseCase = new CreateCandidate(candidateRepository)
const updateCandidateStatusUseCase = new UpdateCandidateStatus(candidateRepository)

const LOCAL_STORAGE_KEY = 'sesame_candidate_status_overrides'

function getLocalStatusOverrides(): Record<string, string> {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveLocalStatusOverride(candidateId: string, statusId: string) {
  const overrides = getLocalStatusOverrides()
  overrides[candidateId] = statusId
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(overrides))
}

function applyLocalOverrides(candidates: Candidate[]): Candidate[] {
  const overrides = getLocalStatusOverrides()
  return candidates.map((candidate) => {
    const overrideStatusId = overrides[candidate.id]
    if (overrideStatusId) {
      return { ...candidate, statusId: overrideStatusId }
    }
    return candidate
  })
}

export const useVacancyStore = defineStore('vacancy', () => {
  const candidates = ref<Candidate[]>([])
  const statuses = ref<CandidateStatus[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const vacancyId = apiConfig.vacancyId

  const candidatesByStatus = computed(() => {
    const grouped: Record<string, Candidate[]> = {}
    statuses.value.forEach((status) => {
      grouped[status.id] = candidates.value.filter((c) => c.statusId === status.id)
    })
    return grouped
  })

  async function fetchStatuses() {
    try {
      statuses.value = await getStatusesUseCase.execute(vacancyId)
      statuses.value.sort((a, b) => a.order - b.order)
    } catch (e) {
      error.value = 'Error al cargar los estados'
      throw e
    }
  }

  async function fetchCandidates() {
    try {
      const apiCandidates = await getCandidatesUseCase.execute(vacancyId)
      // Aplicar overrides locales (fallback para cuando la API PUT falla)
      candidates.value = applyLocalOverrides(apiCandidates)
    } catch (e) {
      error.value = 'Error al cargar los candidatos'
      throw e
    }
  }

  async function loadAll() {
    isLoading.value = true
    error.value = null
    try {
      await Promise.all([fetchStatuses(), fetchCandidates()])
    } finally {
      isLoading.value = false
    }
  }

  async function addCandidate(data: Omit<CreateCandidateDTO, 'vacancyId'>) {
    try {
      const newCandidate = await createCandidateUseCase.execute({
        ...data,
        vacancyId,
      })
      candidates.value.push(newCandidate)
      return newCandidate
    } catch (e) {
      error.value = 'Error al crear el candidato'
      throw e
    }
  }

  async function moveCandidateToStatus(candidateId: string, newStatusId: string) {
    const candidate = candidates.value.find((c) => c.id === candidateId)
    if (!candidate) return

    const oldStatusId = candidate.statusId

    // Optimistic update en Pinia
    candidate.statusId = newStatusId

    try {
      await updateCandidateStatusUseCase.execute(candidateId, {
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        vacancyId: candidate.vacancyId,
        statusId: newStatusId,
      })
    } catch (e) {
      // API falló (500) - guardar en localStorage como fallback
      console.warn('API PUT falló, guardando cambio en localStorage')
      saveLocalStatusOverride(candidateId, newStatusId)
      // NO hacemos rollback - mantenemos el cambio en Pinia y localStorage
    }
  }

  return {
    candidates,
    statuses,
    isLoading,
    error,
    candidatesByStatus,
    loadAll,
    addCandidate,
    moveCandidateToStatus,
  }
})
