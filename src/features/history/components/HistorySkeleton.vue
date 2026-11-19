<template>
  <div role="status" class="animate-pulse divide-y divide-slate-100">
    <span class="sr-only">Cargando operaciones</span>
    <div v-for="row in 5" :key="row" class="flex items-center gap-6 px-6 py-4">
      <div class="h-4 w-32 rounded bg-slate-200" />
      <div class="h-6 w-24 rounded-full bg-slate-200" />
      <div class="ml-auto h-4 w-24 rounded bg-slate-200" />
      <div class="h-4 w-24 rounded bg-slate-200" />
      <div class="hidden h-4 w-16 rounded bg-slate-200 sm:block" />
    </div>
  </div>
</template>
