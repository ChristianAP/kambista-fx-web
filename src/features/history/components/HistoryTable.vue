<script setup lang="ts">
import type { Transaction } from '@/shared/domain/transaction';
import { formatDateTime, formatMoney, formatRate } from '@/shared/utils/formatters';

defineProps<{ transactions: Transaction[] }>();
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-slate-200 text-sm">
      <thead
        class="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
      >
        <tr>
          <th scope="col" class="px-6 py-3">Fecha</th>
          <th scope="col" class="px-6 py-3">Operación</th>
          <th scope="col" class="px-6 py-3 text-right">Monto enviado</th>
          <th scope="col" class="px-6 py-3 text-right">Monto recibido</th>
          <th scope="col" class="px-6 py-3 text-right">Tipo de cambio</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 bg-white">
        <tr v-for="transaction in transactions" :key="transaction.id" class="hover:bg-slate-50">
          <td class="px-6 py-4 whitespace-nowrap text-slate-600">
            {{ formatDateTime(transaction.fecha) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
              {{ transaction.monedaOrigen }} → {{ transaction.monedaDestino }}
            </span>
          </td>
          <td class="px-6 py-4 text-right whitespace-nowrap text-slate-900 tabular-nums">
            {{ formatMoney(transaction.monto, transaction.monedaOrigen) }}
          </td>
          <td
            class="px-6 py-4 text-right font-medium whitespace-nowrap text-slate-900 tabular-nums"
          >
            {{ formatMoney(transaction.montoCambiado, transaction.monedaDestino) }}
          </td>
          <td class="px-6 py-4 text-right whitespace-nowrap text-slate-600 tabular-nums">
            {{ formatRate(transaction.tipoCambio) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
