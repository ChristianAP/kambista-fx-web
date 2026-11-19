<script setup lang="ts">
defineProps<{ title: string; description: string }>();
</script>

<template>
  <div class="flex flex-col items-center px-6 py-14 text-center">
    <div class="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <svg
        class="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859M2.25 13.5V6.75A2.25 2.25 0 0 1 4.5 4.5h15a2.25 2.25 0 0 1 2.25 2.25v6.75m-19.5 0v4.5A2.25 2.25 0 0 0 4.5 20.25h15a2.25 2.25 0 0 0 2.25-2.25v-4.5"
        />
      </svg>
    </div>
    <h3 class="mt-4 text-sm font-semibold text-slate-900">{{ title }}</h3>
    <p class="mt-1 max-w-sm text-sm text-slate-500">{{ description }}</p>
    <div class="mt-5">
      <slot />
    </div>
  </div>
</template>
