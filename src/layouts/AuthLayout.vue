<script setup lang="ts">
import { RouterView } from 'vue-router';
import BrandLogo from '@/shared/ui/BrandLogo.vue';

const highlights = [
  'Tipo de cambio de SUNAT actualizado cada 30 segundos',
  'Cálculo exacto, sin errores de redondeo',
  'Historial completo de todas tus operaciones',
];
</script>

<template>
  <div class="min-h-screen lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
    <aside
      class="relative hidden flex-col justify-between overflow-hidden bg-brand-900 p-12 text-white lg:flex"
    >
      <div
        class="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-brand-700/40 blur-3xl"
      />
      <div
        class="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full bg-brand-500/20 blur-3xl"
      />

      <BrandLogo light class="relative" />

      <div class="relative">
        <h2 class="text-3xl leading-tight font-semibold tracking-tight">
          Cambia dólares y soles al tipo de cambio de SUNAT
        </h2>
        <ul class="mt-8 space-y-4 text-brand-100">
          <li v-for="highlight in highlights" :key="highlight" class="flex items-start gap-3">
            <svg
              class="mt-0.5 size-5 shrink-0 text-brand-200"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ highlight }}</span>
          </li>
        </ul>
      </div>

      <p class="relative text-sm text-brand-200">USD ⇄ PEN</p>
    </aside>

    <main class="flex min-h-screen items-center justify-center px-6 py-12 lg:min-h-0">
      <div class="w-full max-w-md">
        <div class="mb-10 lg:hidden">
          <BrandLogo />
        </div>
        <RouterView />
      </div>
    </main>
  </div>
</template>
