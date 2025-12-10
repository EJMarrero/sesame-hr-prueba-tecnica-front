<script setup lang="ts">
import Sidebar from '@ui/components/layout/Sidebar.vue'
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <Sidebar />
    <main class="flex-1 px-6 pt-4">
      <slot />
    </main>
  </div>
</template>
