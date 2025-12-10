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

// Mapeo de estados (nombres de la API) a configuración visual
const statusConfig: Record<string, { icon: typeof EnvelopeIcon; color: string; textColor: string }> = {
  'nuevo': { icon: EnvelopeIcon, color: 'bg-green-500', textColor: 'text-green-500' },
  'en proceso': { icon: UserIcon, color: 'bg-blue-500', textColor: 'text-blue-500' },
  'oferta': { icon: SparklesIcon, color: 'bg-purple-500', textColor: 'text-purple-500' },
  'seleccionado': { icon: SparklesIcon, color: 'bg-emerald-500', textColor: 'text-emerald-500' },
  'descartado': { icon: NoSymbolIcon, color: 'bg-red-500', textColor: 'text-red-500' },
}

const defaultConfig = { icon: EnvelopeIcon, color: 'bg-gray-400', textColor: 'text-gray-400' }

const currentConfig = computed(() => {
  const name = props.status.name.toLowerCase()
  return statusConfig[name] || defaultConfig
})

const statusIcon = computed(() => currentConfig.value.icon)
const statusColor = computed(() => currentConfig.value.color)
const iconColorClass = computed(() => currentConfig.value.textColor)

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
