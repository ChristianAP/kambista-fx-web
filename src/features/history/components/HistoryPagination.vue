<script setup lang="ts">
import { computed } from 'vue';
import type { PageInfo } from '@/core/http/pagination';
import AppButton from '@/shared/ui/AppButton.vue';

const props = defineProps<{ pagination: PageInfo; disabled?: boolean }>();
const emit = defineEmits<{ change: [page: number] }>();

const hasPrevious = computed(() => props.pagination.page > 1);
const hasNext = computed(() => props.pagination.page < props.pagination.totalPages);
</script>

<template>
  <nav
    class="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4"
    aria-label="Paginación del historial"
  >
    <AppButton
      variant="secondary"
      :disabled="disabled || !hasPrevious"
      @click="emit('change', pagination.page - 1)"
    >
      Anterior
    </AppButton>
    <p class="text-sm text-slate-600">
      Página <span class="font-medium text-slate-900">{{ pagination.page }}</span> de
      <span class="font-medium text-slate-900">{{ pagination.totalPages }}</span>
    </p>
    <AppButton
      variant="secondary"
      :disabled="disabled || !hasNext"
      @click="emit('change', pagination.page + 1)"
    >
      Siguiente
    </AppButton>
  </nav>
</template>
