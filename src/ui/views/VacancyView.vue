<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useVacancyStore } from '@application/stores/vacancyStore'
import type { Candidate } from '@domain/models/Candidate'
import MainLayout from '@ui/layouts/MainLayout.vue'
import Header from '@ui/components/layout/Header.vue'
import TabBar from '@ui/components/layout/TabBar.vue'
import SearchBar from '@ui/components/layout/SearchBar.vue'
import Button from '@ui/components/common/Button.vue'
import KanbanBoard from '@ui/components/board/KanbanBoard.vue'
import CandidateForm from '@ui/components/forms/CandidateForm.vue'
import CandidatesView from './CandidatesView.vue'

const store = useVacancyStore()
const { statuses, candidatesByStatus, isLoading, error } = storeToRefs(store)

// Filtrar candidatos por nombre
const filteredCandidatesByStatus = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return candidatesByStatus.value

  const filtered: Record<string, Candidate[]> = {}
  for (const statusId in candidatesByStatus.value) {
    const candidates = candidatesByStatus.value[statusId]
    if (candidates) {
      filtered[statusId] = candidates.filter((candidate) => {
        const fullName = `${candidate.firstName} ${candidate.lastName}`.toLowerCase()
        return fullName.includes(query)
      })
    }
  }
  return filtered
})

const tabs = [
  { id: 'vacantes', label: 'Vacantes' },
  { id: 'candidatos', label: 'Candidatos' },
]
const activeTab = ref('vacantes')
const searchQuery = ref('')
const isFormOpen = ref(false)
const isSubmitting = ref(false)

onMounted(async () => {
  await store.loadAll()
})

async function handleCandidateMoved(candidateId: string, newStatusId: string) {
  await store.moveCandidateToStatus(candidateId, newStatusId)
}

async function handleAddCandidate(data: { firstName: string; lastName: string; statusId: string }) {
  isSubmitting.value = true
  try {
    await store.addCandidate(data)
    isFormOpen.value = false
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <MainLayout>
    <div class="max-w-full">
      <Header title="Reclutamiento" />

      <!-- Card contenedora principal -->
      <div class="mt-0 bg-white rounded-[44px] shadow-sm border border-gray-200 overflow-hidden">
        <!-- Tabs -->
        <div class="px-6 pt-3">
          <TabBar :tabs="tabs" :active-tab="activeTab" @update:active-tab="activeTab = $event" />
        </div>

        <!-- Búsqueda y botón añadir -->
        <div class="px-6 py-4 flex items-center justify-between gap-4">
          <div class="max-w-md flex-1">
            <SearchBar v-model="searchQuery" placeholder="Buscar" />
          </div>
          <Button variant="primary" @click="isFormOpen = true">
            Añadir candidato
          </Button>
        </div>

        <!-- Loading state -->
        <div v-if="isLoading" class="px-6 pb-6 flex items-center justify-center py-12">
          <div class="flex flex-col items-center gap-3">
            <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p class="text-sm text-gray-500">Cargando datos...</p>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="px-6 pb-6">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-sm text-red-600">{{ error }}</p>
            <Button variant="secondary" size="sm" class="mt-2" @click="store.loadAll()">
              Reintentar
            </Button>
          </div>
        </div>

        <!-- Tab content -->
        <div v-else class="px-6">
          <KanbanBoard
            v-if="activeTab === 'vacantes'"
            :statuses="statuses"
            :candidates-by-status="filteredCandidatesByStatus"
            @candidate-moved="handleCandidateMoved"
          />
          <CandidatesView v-else-if="activeTab === 'candidatos'" :search-query="searchQuery" />
        </div>
      </div>

      <!-- Add candidate form -->
      <CandidateForm
        :is-open="isFormOpen"
        :statuses="statuses"
        :is-submitting="isSubmitting"
        @close="isFormOpen = false"
        @submit="handleAddCandidate"
      />
    </div>
  </MainLayout>
</template>
