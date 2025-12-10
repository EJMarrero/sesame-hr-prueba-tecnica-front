<script setup lang="ts">
import { ChevronDownIcon, StarIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <aside class="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
    <!-- Logo -->
    <div class="p-4 border-b border-gray-200">
      <div class="w-full h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">
        Slot logo
      </div>
    </div>

    <!-- Menu -->
    <nav class="flex-1 p-4">
      <!-- Administrador section -->
      <div class="mb-4">
        <button class="flex items-center justify-between w-full text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
          <span>Administrador</span>
          <ChevronDownIcon class="w-4 h-4" />
        </button>
      </div>

      <!-- Talento submenu -->
      <div class="ml-2">
        <button class="flex items-center justify-between w-full py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg px-2">
          <div class="flex items-center gap-2">
            <StarIcon class="w-5 h-5 text-gray-400" />
            <span>Talento</span>
          </div>
          <ChevronDownIcon class="w-4 h-4 text-gray-400" />
        </button>

        <!-- Reclutamiento link -->
        <div class="ml-4 mt-1">
          <a
            href="#"
            class="block py-2 px-2 text-sm text-sesame-primary bg-sesame-primary/10 rounded-lg font-medium"
          >
            Reclutamiento
          </a>
        </div>
      </div>
    </nav>
  </aside>
</template>
