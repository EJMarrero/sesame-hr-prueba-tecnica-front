<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()
</script>

<template>
  <header class="flex items-center justify-between py-4">
    <h1 class="text-2xl font-semibold text-gray-900">{{ title }}</h1>
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
        <img
          src="https://ui-avatars.com/api/?name=User&background=6366f1&color=fff"
          alt="Avatar"
          class="w-full h-full object-cover"
        />
      </div>
    </div>
  </header>
</template>
