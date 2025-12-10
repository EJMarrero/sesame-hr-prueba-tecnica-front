<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { EllipsisVerticalIcon, ClockIcon, TrashIcon } from '@heroicons/vue/24/outline'
import type { Candidate } from '@domain/models/Candidate'

interface Props {
  candidate: Candidate
}

const props = defineProps<Props>()
const emit = defineEmits<{
  delete: [candidateId: string]
}>()

const isMenuOpen = ref(false)
const cardRef = ref<HTMLElement | null>(null)

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

function toggleMenu(event: Event) {
  event.stopPropagation()
  isMenuOpen.value = !isMenuOpen.value
}

function handleDelete(event: Event) {
  event.stopPropagation()
  isMenuOpen.value = false
  emit('delete', props.candidate.id)
}

function handleClickOutside(event: MouseEvent) {
  if (cardRef.value && !cardRef.value.contains(event.target as Node)) {
    isMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    ref="cardRef"
    class="relative bg-gray-50 rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
  >
    <div class="flex items-start justify-between gap-2">
      <h4 class="text-sm font-medium text-gray-900 truncate flex-1" :title="fullName">
        {{ fullName }}
      </h4>
      <button
        class="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 shrink-0"
        @click="toggleMenu"
      >
        <EllipsisVerticalIcon class="w-4 h-4" />
      </button>
    </div>

    <!-- Dropdown menu -->
    <div
      v-if="isMenuOpen"
      class="absolute right-2 top-10 z-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px]"
    >
      <button
        class="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
        @click="handleDelete"
      >
        <TrashIcon class="w-4 h-4" />
        Eliminar
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
