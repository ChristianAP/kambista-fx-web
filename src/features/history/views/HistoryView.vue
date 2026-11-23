<script setup lang="ts">
import { computed, onMounted } from 'vue';
import AppAlert from '@/shared/ui/AppAlert.vue';
import AppButton from '@/shared/ui/AppButton.vue';
import AppInput from '@/shared/ui/AppInput.vue';
import EmptyState from '@/shared/ui/EmptyState.vue';
import HistoryPagination from '../components/HistoryPagination.vue';
import HistorySkeleton from '../components/HistorySkeleton.vue';
import HistoryTable from '../components/HistoryTable.vue';
import { useHistory } from '../composables/useHistory';

const {
  values,
  errors,
  isSubmitting,
  submitError,
  transactions,
  pagination,
  isAdmin,
  touch,
  search,
  retry,
  goToPage,
} = useHistory();

const summary = computed(() => {
  const total = pagination.value?.total ?? 0;
  return `${total} ${total === 1 ? 'operación' : 'operaciones'}`;
});

onMounted(search);
</script>

<template>
  <div>
    <header>
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Historial de operaciones</h1>
      <p class="mt-1.5 text-slate-600">Consulta tus cambios de divisas por rango de fechas.</p>
    </header>

    <form
      class="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      novalidate
      @submit.prevent="search"
    >
      <div class="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AppInput
          v-model="values.startDate"
          label="Desde"
          type="date"
          :error="errors.startDate"
          @blur="touch('startDate')"
        />
        <AppInput
          v-model="values.endDate"
          label="Hasta"
          type="date"
          :error="errors.endDate"
          @blur="touch('endDate')"
        />
        <AppInput
          v-if="isAdmin"
          v-model="values.userId"
          label="ID de usuario"
          placeholder="Vacío para ver el tuyo"
          autocomplete="off"
        />
        <div class="sm:pt-[1.625rem]">
          <AppButton type="submit" block :loading="isSubmitting">Consultar</AppButton>
        </div>
      </div>
    </form>

    <section
      class="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
      aria-live="polite"
    >
      <HistorySkeleton v-if="isSubmitting" />

      <div v-else-if="submitError" class="space-y-4 p-6">
        <AppAlert variant="error">{{ submitError }}</AppAlert>
        <AppButton variant="secondary" @click="retry">Reintentar</AppButton>
      </div>

      <EmptyState
        v-else-if="transactions?.length === 0"
        title="Sin operaciones"
        description="No encontramos operaciones en el rango seleccionado. Prueba con otras fechas."
      />

      <template v-else-if="transactions && pagination">
        <p class="border-b border-slate-100 px-6 py-4 text-sm font-medium text-slate-600">
          {{ summary }}
        </p>
        <HistoryTable :transactions="transactions" />
        <HistoryPagination
          v-if="pagination.totalPages > 1"
          :pagination="pagination"
          :disabled="isSubmitting"
          @change="goToPage"
        />
      </template>
    </section>
  </div>
</template>
