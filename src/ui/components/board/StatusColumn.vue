<script setup lang="ts">
import { computed } from 'vue'
import draggable from 'vuedraggable'
import {
  EnvelopeIcon,
  UserIcon,
  SparklesIcon,
  NoSymbolIcon,
} from '@heroicons/vue/24/outline'
import type { CandidateStatus } from '@domain/models/CandidateStatus'
import type { Candidate } from '@domain/models/Candidate'
import CandidateCard from './CandidateCard.vue'

interface Props {
  status: CandidateStatus
  candidates: Candidate[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'candidate-moved': [candidateId: string, newStatusId: string]
}>()

const statusIcon = computed(() => {
  const name = props.status.name.toLowerCase()
  if (name.includes('new') || name.includes('nuev')) return EnvelopeIcon
  if (name.includes('interview') || name.includes('entrevista')) return UserIcon
  if (name.includes('hired') || name.includes('contratad')) return SparklesIcon
  if (name.includes('not') || name.includes('no ') || name.includes('rechaz')) return NoSymbolIcon
  return EnvelopeIcon
})

const statusColor = computed(() => {
  const color = props.status.color?.toLowerCase() || ''
  if (color.includes('green') || color === '#22c55e' || color === '#10b981') return 'bg-green-500'
  if (color.includes('blue') || color === '#3b82f6' || color === '#0ea5e9') return 'bg-blue-500'
  if (color.includes('purple') || color === '#8b5cf6' || color === '#a855f7') return 'bg-purple-500'
  if (color.includes('red') || color === '#ef4444' || color === '#f43f5e') return 'bg-red-500'
  if (color.includes('yellow') || color === '#eab308') return 'bg-yellow-500'
  if (color.includes('orange') || color === '#f97316') return 'bg-orange-500'
  return 'bg-gray-400'
})

const iconColorClass = computed(() => {
  const color = props.status.color?.toLowerCase() || ''
  if (color.includes('green') || color === '#22c55e' || color === '#10b981') return 'text-green-500'
  if (color.includes('blue') || color === '#3b82f6' || color === '#0ea5e9') return 'text-blue-500'
  if (color.includes('purple') || color === '#8b5cf6' || color === '#a855f7') return 'text-purple-500'
  if (color.includes('red') || color === '#ef4444' || color === '#f43f5e') return 'text-red-500'
  if (color.includes('yellow') || color === '#eab308') return 'text-yellow-500'
  if (color.includes('orange') || color === '#f97316') return 'text-orange-500'
  return 'text-gray-400'
})

const localCandidates = computed({
  get: () => props.candidates,
  set: () => {},
})

interface ChangeEvent {
  added?: { element: Candidate }
}

function onChange(evt: ChangeEvent) {
  // Solo actuar cuando un elemento es AÑADIDO a esta columna
  if (evt.added) {
    const candidate = evt.added.element
    // Solo emitir si el status realmente cambió
    if (candidate.statusId !== props.status.id) {
      emit('candidate-moved', candidate.id, props.status.id)
    }
  }
}
</script>

<template>
  <div class="flex flex-col bg-gray-100 rounded-lg min-w-[280px] max-w-[280px]">
    <!-- Color bar -->
    <div :class="['h-1 rounded-t-lg', statusColor]" />

    <!-- Header -->
    <div class="flex items-center gap-2 p-3 border-b border-gray-200">
      <component :is="statusIcon" :class="['w-5 h-5', iconColorClass]" />
      <h3 class="text-sm font-semibold text-gray-900">{{ status.name }}</h3>
    </div>

    <!-- Candidates list -->
    <draggable
      :list="localCandidates"
      group="candidates"
      item-key="id"
      :animation="200"
      ghost-class="opacity-50"
      drag-class="rotate-2"
      class="flex-1 p-2 space-y-2 min-h-[200px] overflow-y-auto"
      @change="onChange"
    >
      <template #item="{ element }">
        <div :data-id="element.id">
          <CandidateCard :candidate="element" />
        </div>
      </template>
    </draggable>
  </div>
</template>
