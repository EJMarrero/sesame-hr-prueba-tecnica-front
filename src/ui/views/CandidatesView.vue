<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useVacancyStore } from '@application/stores/vacancyStore'

interface Props {
  searchQuery?: string
}

const props = defineProps<Props>()

const store = useVacancyStore()
const { statuses, candidates, isLoading } = storeToRefs(store)

// Filtrar candidatos por nombre
const filteredCandidates = computed(() => {
  const query = (props.searchQuery || '').toLowerCase().trim()
  if (!query) return candidates.value

  return candidates.value.filter((candidate) => {
    const fullName = `${candidate.firstName} ${candidate.lastName}`.toLowerCase()
    return fullName.includes(query)
  })
})

function getStatusName(statusId: string): string {
  const status = statuses.value.find(s => s.id === statusId)
  return status?.name || 'Sin estado'
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES')
}
</script>

<template>
  <div class="mt-6">
    <div v-if="isLoading" class="text-center py-12 text-gray-500">
      Cargando candidatos...
    </div>
    <div v-else-if="filteredCandidates.length === 0" class="text-center py-12 text-gray-500">
      {{ searchQuery ? 'No se encontraron candidatos' : 'No hay candidatos registrados' }}
    </div>
    <div v-else class="mb-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="candidate in filteredCandidates" :key="candidate.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">
                {{ candidate.firstName }} {{ candidate.lastName }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                {{ getStatusName(candidate.statusId) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(candidate.createdAt) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
