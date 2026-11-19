<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppHeader from './AppHeader.vue';
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <main class="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <RouterView />
    </main>
  </div>
</template>
