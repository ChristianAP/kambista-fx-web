<script setup lang="ts">
import AppSpinner from './AppSpinner.vue';

withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost';
    type?: 'button' | 'submit';
    loading?: boolean;
    block?: boolean;
  }>(),
  { variant: 'primary', type: 'button', loading: false, block: false },
);

const variants = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700',
  secondary: 'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
} as const;
</script>

<template>
  <button
    :type="type"
    :disabled="loading"
    :aria-busy="loading"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-60',
      variants[variant],
      block && 'w-full',
    ]"
  >
    <AppSpinner v-if="loading" class="size-4" />
    <slot />
  </button>
</template>
