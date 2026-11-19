<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import type { Transaction } from '@/shared/domain/transaction';
import { formatDateTime, formatMoney, formatRate } from '@/shared/utils/formatters';
import AppAlert from '@/shared/ui/AppAlert.vue';
import AppButton from '@/shared/ui/AppButton.vue';

const props = defineProps<{ transaction: Transaction }>();

defineEmits<{ restart: [] }>();

const details = computed(() => [
  {
    label: 'Enviaste',
    value: formatMoney(props.transaction.monto, props.transaction.monedaOrigen),
  },
  { label: 'Tipo de cambio aplicado', value: formatRate(props.transaction.tipoCambio) },
  { label: 'Fecha', value: formatDateTime(props.transaction.fecha) },
  { label: 'N.º de operación', value: props.transaction.id.slice(0, 8).toUpperCase() },
]);
</script>

<template>
  <div class="space-y-6">
    <AppAlert variant="success">Tu operación se registró correctamente.</AppAlert>

    <div>
      <p class="text-sm font-medium text-slate-500">Recibes</p>
      <p class="mt-1 text-4xl font-semibold tracking-tight text-slate-900">
        {{ formatMoney(transaction.montoCambiado, transaction.monedaDestino) }}
      </p>
    </div>

    <dl class="divide-y divide-slate-100 rounded-lg bg-slate-50 px-4 text-sm">
      <div v-for="detail in details" :key="detail.label" class="flex justify-between gap-4 py-3">
        <dt class="text-slate-500">{{ detail.label }}</dt>
        <dd class="font-medium text-slate-900">{{ detail.value }}</dd>
      </div>
    </dl>

    <div class="flex flex-wrap gap-3">
      <AppButton @click="$emit('restart')">Nueva operación</AppButton>
      <RouterLink
        :to="{ name: 'history' }"
        class="inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
      >
        Ver historial
      </RouterLink>
    </div>
  </div>
</template>
