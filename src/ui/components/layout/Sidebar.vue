<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDownIcon, StarIcon } from '@heroicons/vue/24/outline'

const isAdminOpen = ref(true)
const isTalentoOpen = ref(true)
</script>

<template>
  <aside class="w-72 min-w-72 max-w-72 bg-white border-r border-gray-200 min-h-screen flex flex-col">
    <!-- Logo -->
    <div class="p-4 border-b border-gray-200">
      <div class="w-full h-10 bg-white border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-xs">
        Slot logo
      </div>
    </div>

    <!-- Menu -->
    <nav class="flex-1 p-4">
      <!-- Administrador section -->
      <div class="mb-2">
        <button
          @click="isAdminOpen = !isAdminOpen"
          class="flex items-center justify-between w-full text-left text-xs text-gray-500 uppercase tracking-wider py-2"
        >
          <span>Administrador</span>
          <ChevronDownIcon
            class="w-4 h-4 transition-transform"
            :class="{ 'rotate-180': !isAdminOpen }"
          />
        </button>
      </div>

      <!-- Administrador content -->
      <div v-show="isAdminOpen">
        <!-- Talento card con sombreado gris -->
        <div class="bg-gray-50 rounded-xl p-3 ml-2">
          <button
            @click="isTalentoOpen = !isTalentoOpen"
            class="flex items-center justify-between w-full py-2 text-left text-sm px-2"
          >
            <div class="flex items-center gap-2">
              <StarIcon class="w-5 h-5 text-sesame-primary" />
              <span class="text-sesame-primary">Talento</span>
            </div>
            <ChevronDownIcon
              class="w-4 h-4 text-sesame-primary transition-transform"
              :class="{ 'rotate-180': !isTalentoOpen }"
            />
          </button>

          <!-- Reclutamiento link con barra vertical -->
          <div v-show="isTalentoOpen" class="ml-4 mt-1 flex items-center gap-0">
            <div class="w-0.5 h-6 bg-sesame-primary rounded-full" />
            <a
              href="#"
              class="block py-2 px-3 text-sm text-sesame-primary font-medium"
            >
              Reclutamiento
            </a>
          </div>
        </div>
      </div>
    </nav>
  </aside>
</template>
