<script setup lang="ts">
import Sidebar from '@ui/components/layout/Sidebar.vue'
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <Sidebar />
    <main class="flex-1 p-6">
      <slot />
    </main>
  </div>
</template>
