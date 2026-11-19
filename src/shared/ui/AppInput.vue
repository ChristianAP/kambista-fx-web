<script setup lang="ts">
import FormField from './FormField.vue';

defineOptions({ inheritAttrs: false });

const model = defineModel<string>({ required: true });

defineProps<{ label: string; error?: string; hint?: string; prefix?: string }>();
</script>

<template>
  <FormField v-slot="{ id, describedBy, invalid }" :label="label" :error="error" :hint="hint">
    <div class="relative">
      <span
        v-if="prefix"
        class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-medium text-slate-500"
      >
        {{ prefix }}
      </span>
      <input
        :id="id"
        v-model="model"
        v-bind="$attrs"
        :aria-invalid="invalid"
        :aria-describedby="describedBy"
        :class="[
          'block w-full rounded-lg bg-white py-2.5 pr-3.5 text-slate-900 ring-1 ring-inset transition placeholder:text-slate-400 focus:outline-none focus:ring-2',
          prefix ? 'pl-12' : 'pl-3.5',
          invalid ? 'ring-red-400 focus:ring-red-500' : 'ring-slate-300 focus:ring-brand-600',
        ]"
      />
    </div>
  </FormField>
</template>
