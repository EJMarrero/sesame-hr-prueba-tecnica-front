<script setup lang="ts">
interface Tab {
  id: string
  label: string
}

interface Props {
  tabs: Tab[]
  activeTab: string
}

defineProps<Props>()
const emit = defineEmits<{
  'update:activeTab': [tabId: string]
}>()
</script>

<template>
  <div class="border-b border-gray-200">
    <nav class="flex gap-6">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="emit('update:activeTab', tab.id)"
        :class="[
          'py-3 text-sm font-medium border-b-2 transition-colors',
          activeTab === tab.id
            ? 'text-blue-600 border-blue-600'
            : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300',
        ]"
      >
        {{ tab.label }}
      </button>
    </nav>
  </div>
</template>
