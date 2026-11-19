<script setup lang="ts">
withDefaults(defineProps<{ light?: boolean }>(), { light: false });
</script>

<template>
  <span class="inline-flex items-center gap-2.5">
    <svg class="size-9" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" :fill="light ? '#ffffff' : '#047857'" />
      <path
        d="M9 12h12l-3-3M23 20H11l3 3"
        fill="none"
        :stroke="light ? '#047857' : '#ffffff'"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <span
      :class="['text-lg font-semibold tracking-tight', light ? 'text-white' : 'text-slate-900']"
    >
      Cambio de Divisas
    </span>
  </span>
</template>
