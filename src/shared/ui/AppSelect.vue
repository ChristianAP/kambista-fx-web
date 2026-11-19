<script setup lang="ts" generic="T extends string">
import FormField from './FormField.vue';

defineOptions({ inheritAttrs: false });

const model = defineModel<T>({ required: true });

defineProps<{
  label: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  error?: string;
}>();
</script>

<template>
  <FormField v-slot="{ id, describedBy, invalid }" :label="label" :error="error">
    <div class="relative">
      <select
        :id="id"
        v-model="model"
        v-bind="$attrs"
        :aria-invalid="invalid"
        :aria-describedby="describedBy"
        :class="[
          'block w-full appearance-none rounded-lg bg-white py-2.5 pr-10 pl-3.5 text-slate-900 ring-1 ring-inset transition focus:outline-none focus:ring-2',
          invalid ? 'ring-red-400 focus:ring-red-500' : 'ring-slate-300 focus:ring-brand-600',
        ]"
      >
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <svg
        class="pointer-events-none absolute inset-y-0 right-3 my-auto size-4 text-slate-500"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
          clip-rule="evenodd"
        />
      </svg>
    </div>
  </FormField>
</template>
