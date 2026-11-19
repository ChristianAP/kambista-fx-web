<script setup lang="ts">
import { RouterLink } from 'vue-router';
import AppAlert from '@/shared/ui/AppAlert.vue';
import AppButton from '@/shared/ui/AppButton.vue';
import AppInput from '@/shared/ui/AppInput.vue';
import { useLoginForm } from '../composables/useLoginForm';

const { values, errors, isSubmitting, submitError, touch, submit } = useLoginForm();
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Inicia sesión</h1>
    <p class="mt-2 text-sm text-slate-600">
      Ingresa para cambiar divisas y revisar tus operaciones.
    </p>

    <form class="mt-8 space-y-5" novalidate @submit.prevent="submit">
      <AppAlert v-if="submitError" variant="error">{{ submitError }}</AppAlert>

      <AppInput
        v-model="values.email"
        label="Correo electrónico"
        type="email"
        autocomplete="email"
        placeholder="tucorreo@ejemplo.com"
        :error="errors.email"
        @blur="touch('email')"
      />
      <AppInput
        v-model="values.password"
        label="Contraseña"
        type="password"
        autocomplete="current-password"
        :error="errors.password"
        @blur="touch('password')"
      />

      <AppButton type="submit" block :loading="isSubmitting">Iniciar sesión</AppButton>
    </form>

    <p class="mt-6 text-center text-sm text-slate-600">
      ¿Aún no tienes cuenta?
      <RouterLink
        :to="{ name: 'register' }"
        class="font-semibold text-brand-700 hover:text-brand-800"
      >
        Regístrate
      </RouterLink>
    </p>
  </div>
</template>
