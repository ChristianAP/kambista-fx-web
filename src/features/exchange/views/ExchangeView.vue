<script setup lang="ts">
import { CURRENCY_OPTIONS, CURRENCY_SYMBOLS } from '@/shared/domain/currency';
import AppAlert from '@/shared/ui/AppAlert.vue';
import AppButton from '@/shared/ui/AppButton.vue';
import AppInput from '@/shared/ui/AppInput.vue';
import AppSelect from '@/shared/ui/AppSelect.vue';
import ExchangeResult from '../components/ExchangeResult.vue';
import { useExchangeForm } from '../composables/useExchangeForm';

const {
  values,
  errors,
  isSubmitting,
  submitError,
  result,
  touch,
  submit,
  swapCurrencies,
  startOver,
} = useExchangeForm();
</script>

<template>
  <div>
    <header>
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Cambia tus divisas</h1>
      <p class="mt-1.5 text-slate-600">
        Calculamos tu operación con el último tipo de cambio de SUNAT.
      </p>
    </header>

    <div class="mt-8 grid gap-6 lg:grid-cols-2">
      <section class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <h2 class="text-lg font-semibold text-slate-900">Nueva operación</h2>

        <form class="mt-6 space-y-5" novalidate @submit.prevent="submit">
          <AppAlert v-if="submitError" variant="error">{{ submitError }}</AppAlert>

          <AppInput
            v-model="values.amount"
            label="Monto a cambiar"
            inputmode="decimal"
            autocomplete="off"
            placeholder="0.00"
            :prefix="CURRENCY_SYMBOLS[values.sourceCurrency]"
            :error="errors.amount"
            @blur="touch('amount')"
          />

          <div class="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
            <AppSelect
              v-model="values.sourceCurrency"
              label="Envías"
              :options="CURRENCY_OPTIONS"
              :error="errors.sourceCurrency"
              @change="touch('targetCurrency')"
            />
            <button
              type="button"
              class="mt-7 flex size-10 items-center justify-center rounded-full text-slate-500 ring-1 ring-slate-300 transition hover:bg-slate-50 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              aria-label="Intercambiar monedas"
              @click="swapCurrencies"
            >
              <svg class="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fill-rule="evenodd"
                  d="M13.2 2.24a.75.75 0 0 0 .04 1.06l2.1 1.95H6.75a.75.75 0 0 0 0 1.5h8.59l-2.1 1.95a.75.75 0 1 0 1.02 1.1l3.5-3.25a.75.75 0 0 0 0-1.1l-3.5-3.25a.75.75 0 0 0-1.06.04Zm-6.4 8a.75.75 0 0 0-1.06-.04l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 1 0 1.02-1.1l-2.1-1.95h8.59a.75.75 0 0 0 0-1.5H4.66l2.1-1.95a.75.75 0 0 0 .04-1.06Z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <AppSelect
              v-model="values.targetCurrency"
              label="Recibes"
              :options="CURRENCY_OPTIONS"
              :error="errors.targetCurrency"
              @change="touch('targetCurrency')"
            />
          </div>

          <AppButton type="submit" block :loading="isSubmitting">Cambiar</AppButton>
        </form>
      </section>

      <section
        class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8"
        aria-live="polite"
      >
        <ExchangeResult v-if="result" :transaction="result" @restart="startOver" />
        <div v-else class="flex h-full min-h-48 flex-col justify-center text-center">
          <p class="text-sm font-medium text-slate-900">Aquí verás el detalle de tu operación</p>
          <p class="mt-1 text-sm text-slate-500">
            Completa el formulario para ver cuánto recibirás y el tipo de cambio aplicado.
          </p>
        </div>
      </section>
    </div>
  </div>
</template>
