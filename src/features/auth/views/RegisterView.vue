<script setup lang="ts">
import { RouterLink } from 'vue-router';
import AppAlert from '@/shared/ui/AppAlert.vue';
import AppButton from '@/shared/ui/AppButton.vue';
import AppInput from '@/shared/ui/AppInput.vue';
import { useRegisterForm } from '../composables/useRegisterForm';

const { values, errors, isSubmitting, submitError, touch, submit } = useRegisterForm();
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Crea tu cuenta</h1>
    <p class="mt-2 text-sm text-slate-600">Regístrate para empezar a cambiar divisas.</p>

    <form class="mt-8 space-y-5" novalidate @submit.prevent="submit">
      <AppAlert v-if="submitError" variant="error">{{ submitError }}</AppAlert>

      <AppInput
        v-model="values.nombre"
        label="Nombre completo"
        autocomplete="name"
        placeholder="Juan Pérez"
        :error="errors.nombre"
        @blur="touch('nombre')"
      />
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
        autocomplete="new-password"
        hint="Mínimo 8 caracteres"
        :error="errors.password"
        @blur="touch('password')"
      />

      <AppButton type="submit" block :loading="isSubmitting">Crear cuenta</AppButton>
    </form>

    <p class="mt-6 text-center text-sm text-slate-600">
      ¿Ya tienes una cuenta?
      <RouterLink :to="{ name: 'login' }" class="font-semibold text-brand-700 hover:text-brand-800">
        Inicia sesión
      </RouterLink>
    </p>
  </div>
</template>
