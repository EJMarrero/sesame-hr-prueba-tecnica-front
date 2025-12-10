<script setup lang="ts">
import { computed } from 'vue'
import { EllipsisVerticalIcon, ClockIcon } from '@heroicons/vue/24/outline'
import type { Candidate } from '@domain/models/Candidate'

interface Props {
  candidate: Candidate
}

const props = defineProps<Props>()

const fullName = computed(() => {
  return `${props.candidate.firstName} ${props.candidate.lastName}`
})

const createdAtFormatted = computed(() => {
  const date = new Date(props.candidate.createdAt)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
})
</script>

<template>
  <div class="bg-gray-50 rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
    <div class="flex items-start justify-between gap-2">
      <h4 class="text-sm font-medium text-gray-900 truncate flex-1" :title="fullName">
        {{ fullName }}
      </h4>
      <button class="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 shrink-0">
        <EllipsisVerticalIcon class="w-4 h-4" />
      </button>
    </div>
    <p class="text-xs text-gray-500 mt-1">
      Añadido por {{ candidate.source || 'ATS' }}
    </p>
    <div class="flex items-center gap-1 mt-2 text-xs text-gray-400">
      <ClockIcon class="w-3.5 h-3.5" />
      <span>{{ createdAtFormatted }}</span>
    </div>
  </div>
</template>
