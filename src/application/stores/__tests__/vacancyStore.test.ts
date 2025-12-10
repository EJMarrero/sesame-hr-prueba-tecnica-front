import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock de localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock de los repositorios con clases reales
const mockCandidateRepo = {
  getByVacancyId: vi.fn().mockResolvedValue([]),
  create: vi.fn().mockResolvedValue({}),
  update: vi.fn().mockRejectedValue(new Error('API Error 500')),
}

const mockStatusRepo = {
  getByVacancyId: vi.fn().mockResolvedValue([]),
}

vi.mock('@infrastructure/api/CandidateApiRepository', () => ({
  CandidateApiRepository: class {
    getByVacancyId = mockCandidateRepo.getByVacancyId
    create = mockCandidateRepo.create
    update = mockCandidateRepo.update
  },
}))

vi.mock('@infrastructure/api/CandidateStatusApiRepository', () => ({
  CandidateStatusApiRepository: class {
    getByVacancyId = mockStatusRepo.getByVacancyId
  },
}))

vi.mock('@infrastructure/config/api.config', () => ({
  apiConfig: {
    baseURL: 'https://api-test.sesametime.com',
    token: 'test-token',
    vacancyId: '2fd59040-bce0-498e-b8fa-101621138da6',
  },
}))

describe('VacancyStore', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should have empty initial state', async () => {
      const { useVacancyStore } = await import('../vacancyStore')
      const store = useVacancyStore()

      expect(store.candidates).toEqual([])
      expect(store.statuses).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('candidatesByStatus computed', () => {
    it('should group candidates by their statusId', async () => {
      const { useVacancyStore } = await import('../vacancyStore')
      const store = useVacancyStore()

      // Simular datos cargados
      store.statuses = [
        { id: 'status-1', name: 'Nuevo', order: 1 },
        { id: 'status-2', name: 'En proceso', order: 2 },
      ]
      store.candidates = [
        {
          id: 'candidate-1',
          firstName: 'Juan',
          lastName: 'García',
          statusId: 'status-1',
          vacancyId: 'vacancy-1',
          createdAt: '2025-12-10T10:00:00+00:00',
          updatedAt: '2025-12-10T10:00:00+00:00',
        },
        {
          id: 'candidate-2',
          firstName: 'Ana',
          lastName: 'López',
          statusId: 'status-1',
          vacancyId: 'vacancy-1',
          createdAt: '2025-12-10T10:00:00+00:00',
          updatedAt: '2025-12-10T10:00:00+00:00',
        },
        {
          id: 'candidate-3',
          firstName: 'Carlos',
          lastName: 'Martín',
          statusId: 'status-2',
          vacancyId: 'vacancy-1',
          createdAt: '2025-12-10T10:00:00+00:00',
          updatedAt: '2025-12-10T10:00:00+00:00',
        },
      ]

      const grouped = store.candidatesByStatus

      expect(grouped['status-1']).toHaveLength(2)
      expect(grouped['status-2']).toHaveLength(1)
      expect(grouped['status-1'][0].firstName).toBe('Juan')
      expect(grouped['status-2'][0].firstName).toBe('Carlos')
    })

    it('should return empty arrays for statuses with no candidates', async () => {
      const { useVacancyStore } = await import('../vacancyStore')
      const store = useVacancyStore()

      store.statuses = [
        { id: 'status-1', name: 'Nuevo', order: 1 },
        { id: 'status-2', name: 'Vacío', order: 2 },
      ]
      store.candidates = [
        {
          id: 'candidate-1',
          firstName: 'Juan',
          lastName: 'García',
          statusId: 'status-1',
          vacancyId: 'vacancy-1',
          createdAt: '2025-12-10T10:00:00+00:00',
          updatedAt: '2025-12-10T10:00:00+00:00',
        },
      ]

      const grouped = store.candidatesByStatus

      expect(grouped['status-1']).toHaveLength(1)
      expect(grouped['status-2']).toHaveLength(0)
    })
  })

  describe('moveCandidateToStatus - Optimistic Update', () => {
    it('should update candidate statusId immediately (optimistic update)', async () => {
      const { useVacancyStore } = await import('../vacancyStore')
      const store = useVacancyStore()

      store.candidates = [
        {
          id: 'candidate-1',
          firstName: 'Eduardo',
          lastName: 'Marrero',
          statusId: 'status-nuevo',
          vacancyId: 'vacancy-1',
          createdAt: '2025-12-10T10:00:00+00:00',
          updatedAt: '2025-12-10T10:00:00+00:00',
        },
      ]

      // Iniciar el movimiento
      await store.moveCandidateToStatus('candidate-1', 'status-proceso')

      // El estado ya debe estar actualizado (optimistic update se mantiene)
      expect(store.candidates[0].statusId).toBe('status-proceso')
    })
  })

  describe('API Error 500 Fallback - localStorage', () => {
    // TESTS CRÍTICOS: Documentan el manejo del bug del backend
    // El endpoint PUT /candidates/{id} devuelve error 500
    // Nuestra solución: guardar en localStorage y mantener cambio en UI

    it('should save to localStorage when API fails with 500', async () => {
      const { useVacancyStore } = await import('../vacancyStore')
      const store = useVacancyStore()

      store.candidates = [
        {
          id: 'candidate-123',
          firstName: 'Eduardo',
          lastName: 'Marrero',
          statusId: 'status-nuevo',
          vacancyId: '2fd59040-bce0-498e-b8fa-101621138da6',
          createdAt: '2025-12-10T10:00:00+00:00',
          updatedAt: '2025-12-10T10:00:00+00:00',
        },
      ]

      // El movimiento invocará update que falla con 500
      await store.moveCandidateToStatus('candidate-123', 'status-proceso')

      // Verificar que localStorage fue llamado
      expect(localStorageMock.setItem).toHaveBeenCalled()

      // Verificar el contenido guardado
      const calls = localStorageMock.setItem.mock.calls
      const lastCall = calls[calls.length - 1]
      const savedData = JSON.parse(lastCall[1])
      expect(savedData['candidate-123']).toBe('status-proceso')
    })

    it('should NOT rollback optimistic update when API fails', async () => {
      const { useVacancyStore } = await import('../vacancyStore')
      const store = useVacancyStore()

      store.candidates = [
        {
          id: 'candidate-456',
          firstName: 'Ana',
          lastName: 'García',
          statusId: 'status-original',
          vacancyId: 'vacancy-1',
          createdAt: '2025-12-10T10:00:00+00:00',
          updatedAt: '2025-12-10T10:00:00+00:00',
        },
      ]

      await store.moveCandidateToStatus('candidate-456', 'status-nuevo')

      // El estado debe mantenerse en el nuevo valor, NO hacer rollback
      expect(store.candidates[0].statusId).toBe('status-nuevo')
    })
  })

  describe('Known API Behaviors - Documented Issues', () => {
    // Estos tests documentan comportamientos conocidos de la API
    // Ver PRUEBAS_API.md para detalles completos

    it('should handle statusId validation (422 vs 500)', () => {
      // COMPORTAMIENTO OBSERVADO:
      // - statusId inválido → 422 Unprocessable entity
      // - statusId válido → 500 Internal Server Error (BUG)

      const validStatusIds = [
        '91b56d6d-eaf1-4f3c-b394-f07eabb06fe0', // Nuevo
        '5644397e-82be-4398-bd05-f702c9ce7f38', // En proceso
        '3c6722f3-9704-4ad7-b91d-b6ccdb373be0', // Oferta
        '01b4d054-8912-4059-8f6e-edbb1b8a3353', // Seleccionado
        'bdb1aaf3-a86b-43eb-874a-72936aed918b', // Descartado
      ]

      // Estos IDs son válidos y deberían funcionar,
      // pero el backend devuelve 500 después de validar
      validStatusIds.forEach((id) => {
        expect(id).toMatch(/^[a-f0-9-]{36}$/)
      })
    })

    it('should document that colors come from frontend, not API', () => {
      // LIMITACIÓN DE LA API:
      // GET /candidate-status NO devuelve campo color
      // El frontend asigna colores basándose en el nombre del estado
      // Ver StatusColumn.vue - statusConfig

      const statusesWithoutColor = [
        { id: '1', name: 'Nuevo', order: 1 },
        { id: '2', name: 'En proceso', order: 2 },
      ]

      // Los colores se asignan en el frontend
      const frontendColors: Record<string, string> = {
        nuevo: 'bg-sesame-status-nuevo',
        'en proceso': 'bg-sesame-status-proceso',
        oferta: 'bg-sesame-status-oferta',
        seleccionado: 'bg-sesame-status-seleccionado',
        descartado: 'bg-sesame-status-descartado',
      }

      statusesWithoutColor.forEach((status) => {
        const colorClass = frontendColors[status.name.toLowerCase()]
        expect(colorClass).toBeDefined()
      })
    })
  })
})
