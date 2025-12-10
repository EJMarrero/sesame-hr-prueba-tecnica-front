<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
})
</script>

<template>
  <button
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
      {
        'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500': variant === 'primary',
        'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500': variant === 'secondary',
        'text-gray-600 hover:bg-gray-100 focus:ring-gray-500': variant === 'ghost',
        'px-3 py-1.5 text-sm': size === 'sm',
        'px-4 py-2 text-sm': size === 'md',
        'px-6 py-3 text-base': size === 'lg',
        'opacity-50 cursor-not-allowed': disabled,
      },
    ]"
  >
    <slot />
  </button>
</template>
