<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'error' | 'success' | 'info' }>(), { variant: 'info' });

const styles = {
  error: 'bg-red-50 text-red-800 ring-red-200',
  success: 'bg-brand-50 text-brand-800 ring-brand-200',
  info: 'bg-sky-50 text-sky-800 ring-sky-200',
} as const;
</script>

<template>
  <div
    :role="variant === 'error' ? 'alert' : 'status'"
    :class="['rounded-lg px-4 py-3 text-sm ring-1 ring-inset', styles[variant]]"
  >
    <slot />
  </div>
</template>
