<script setup lang="ts">
import type { CandidateStatus } from '@domain/models/CandidateStatus'
import type { Candidate } from '@domain/models/Candidate'
import StatusColumn from './StatusColumn.vue'

interface Props {
  statuses: CandidateStatus[]
  candidatesByStatus: Record<string, Candidate[]>
}

defineProps<Props>()
const emit = defineEmits<{
  'candidate-moved': [candidateId: string, newStatusId: string]
}>()

function onCandidateMoved(candidateId: string, newStatusId: string) {
  emit('candidate-moved', candidateId, newStatusId)
}
</script>

<template>
  <div class="flex gap-4 overflow-x-auto pb-4">
    <StatusColumn
      v-for="status in statuses"
      :key="status.id"
      :status="status"
      :candidates="candidatesByStatus[status.id] || []"
      @candidate-moved="onCandidateMoved"
    />
  </div>
</template>
