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
// Colores definidos en @theme (style.css) - extraídos del Figma
const statusConfig: Record<string, { icon: typeof EnvelopeIcon; color: string; textColor: string }> = {
  'nuevo': { icon: EnvelopeIcon, color: 'bg-sesame-status-nuevo', textColor: 'text-sesame-status-nuevo' },
  'en proceso': { icon: UserIcon, color: 'bg-sesame-status-proceso', textColor: 'text-sesame-status-proceso' },
  'oferta': { icon: SparklesIcon, color: 'bg-sesame-status-oferta', textColor: 'text-sesame-status-oferta' },
  'seleccionado': { icon: SparklesIcon, color: 'bg-sesame-status-seleccionado', textColor: 'text-sesame-status-seleccionado' },
  'descartado': { icon: NoSymbolIcon, color: 'bg-sesame-status-descartado', textColor: 'text-sesame-status-descartado' },
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
  <div class="flex flex-col bg-white rounded-2xl border border-gray-200 min-w-[280px] max-w-[280px]">
    <!-- Color bar (dentro de la card, con márgenes) -->
    <div class="mx-4 mt-4">
      <div :class="['h-1 rounded-full', statusColor]" />
    </div>

    <!-- Header -->
    <div class="flex items-center gap-2 px-4 pt-3 pb-4">
      <component :is="statusIcon" :class="['w-5 h-5', iconColorClass]" />
      <h3 class="text-sm font-semibold text-gray-900">{{ status.name }}</h3>
    </div>

    <!-- Candidates list -->
    <draggable
      :list="localCandidates"
      group="candidates"
      item-key="id"
      :animation="200"
      ghost-class="sortable-ghost"
      drag-class="rotate-2"
      class="drop-zone flex-1 px-3 pb-3 space-y-2 min-h-[200px] overflow-y-auto rounded-xl transition-colors"
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

<style scoped>
/* Sombrear la zona de drop cuando un elemento ghost está dentro */
.drop-zone:has(.sortable-ghost) {
  background-color: rgb(249 250 251); /* bg-gray-50 */
}

/* Estilo del elemento ghost (placeholder) */
:deep(.sortable-ghost) {
  opacity: 0.5;
}
</style>
