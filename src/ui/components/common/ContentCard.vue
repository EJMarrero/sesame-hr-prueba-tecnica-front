<script setup lang="ts">
defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <div class="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
    <slot />
  </div>
</template>
