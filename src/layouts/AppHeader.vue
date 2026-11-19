<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useSessionStore } from '@/features/auth/stores/session.store';
import AppButton from '@/shared/ui/AppButton.vue';
import BrandLogo from '@/shared/ui/BrandLogo.vue';

const links = [
  { name: 'exchange', label: 'Cambiar' },
  { name: 'history', label: 'Historial' },
] as const;

const session = useSessionStore();
const router = useRouter();

const initial = computed(() => session.user?.nombre.charAt(0).toUpperCase() ?? '');

const logout = async (): Promise<void> => {
  session.logout();
  await router.replace({ name: 'login' });
};
</script>

<template>
  <header class="border-b border-slate-200 bg-white">
    <div
      class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6"
    >
      <RouterLink :to="{ name: 'exchange' }" aria-label="Ir al inicio">
        <BrandLogo />
      </RouterLink>

      <nav class="order-last flex w-full gap-1 sm:order-none sm:w-auto" aria-label="Principal">
        <RouterLink
          v-for="link in links"
          :key="link.name"
          v-slot="{ isActive, href, navigate }"
          :to="{ name: link.name }"
          custom
        >
          <a
            :href="href"
            :aria-current="isActive ? 'page' : undefined"
            :class="[
              'rounded-lg px-3 py-2 text-sm font-medium transition',
              isActive
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            ]"
            @click="navigate"
          >
            {{ link.label }}
          </a>
        </RouterLink>
      </nav>

      <div class="flex items-center gap-3">
        <div class="hidden items-center gap-2.5 sm:flex">
          <span
            class="flex size-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800"
            aria-hidden="true"
          >
            {{ initial }}
          </span>
          <div class="hidden text-sm leading-tight sm:block">
            <p class="font-medium text-slate-900">{{ session.user?.nombre }}</p>
            <p v-if="session.isAdmin" class="text-xs font-medium text-brand-700">Administrador</p>
            <p v-else class="text-xs text-slate-500">{{ session.user?.email }}</p>
          </div>
        </div>
        <AppButton variant="secondary" @click="logout">Cerrar sesión</AppButton>
      </div>
    </div>
  </header>
</template>
