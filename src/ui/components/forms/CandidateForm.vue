<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CandidateStatus } from '@domain/models/CandidateStatus'
import Modal from '@ui/components/common/Modal.vue'
import Input from '@ui/components/common/Input.vue'
import Button from '@ui/components/common/Button.vue'

interface Props {
  isOpen: boolean
  statuses: CandidateStatus[]
  isSubmitting?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  submit: [data: { firstName: string; lastName: string; statusId: string }]
}>()

const firstName = ref('')
const lastName = ref('')
const statusId = ref('')

const errors = ref({
  firstName: '',
  lastName: '',
  statusId: '',
})

const isValid = computed(() => {
  return firstName.value.trim() && lastName.value.trim() && statusId.value
})

function validate(): boolean {
  errors.value = {
    firstName: '',
    lastName: '',
    statusId: '',
  }

  if (!firstName.value.trim()) {
    errors.value.firstName = 'El nombre es requerido'
  }
  if (!lastName.value.trim()) {
    errors.value.lastName = 'El apellido es requerido'
  }
  if (!statusId.value) {
    errors.value.statusId = 'Debe seleccionar un estado'
  }

  return !errors.value.firstName && !errors.value.lastName && !errors.value.statusId
}

function handleSubmit() {
  if (!validate()) return

  emit('submit', {
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    statusId: statusId.value,
  })
}

function handleClose() {
  firstName.value = ''
  lastName.value = ''
  statusId.value = ''
  errors.value = { firstName: '', lastName: '', statusId: '' }
  emit('close')
}
</script>

<template>
  <Modal :is-open="isOpen" title="Añadir candidato" @close="handleClose">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <Input
        v-model="firstName"
        label="Nombre"
        placeholder="Ej: Juan"
        :error="errors.firstName"
      />

      <Input
        v-model="lastName"
        label="Apellido"
        placeholder="Ej: García"
        :error="errors.lastName"
      />

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Estado inicial
        </label>
        <select
          v-model="statusId"
          :class="[
            'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors',
            errors.statusId ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white',
          ]"
        >
          <option value="" disabled>Seleccionar estado</option>
          <option v-for="status in statuses" :key="status.id" :value="status.id">
            {{ status.name }}
          </option>
        </select>
        <p v-if="errors.statusId" class="mt-1 text-sm text-red-500">
          {{ errors.statusId }}
        </p>
      </div>

      <div class="flex justify-end gap-3 pt-4">
        <Button variant="secondary" type="button" @click="handleClose">
          Cancelar
        </Button>
        <Button
          variant="primary"
          type="submit"
          :disabled="!isValid || isSubmitting"
        >
          {{ isSubmitting ? 'Guardando...' : 'Añadir candidato' }}
        </Button>
      </div>
    </form>
  </Modal>
</template>
