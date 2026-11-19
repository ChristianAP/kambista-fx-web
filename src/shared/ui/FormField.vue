<script setup lang="ts">
import { computed, useId } from 'vue';

const props = defineProps<{ label: string; error?: string; hint?: string }>();

const id = useId();
const messageId = `${id}-message`;
const describedBy = computed(() => (props.error || props.hint ? messageId : undefined));
</script>

<template>
  <div class="space-y-1.5">
    <label :for="id" class="block text-sm font-medium text-slate-700">{{ label }}</label>
    <slot :id="id" :described-by="describedBy" :invalid="Boolean(error)" />
    <p v-if="error" :id="messageId" role="alert" class="text-sm text-red-600">{{ error }}</p>
    <p v-else-if="hint" :id="messageId" class="text-sm text-slate-500">{{ hint }}</p>
  </div>
</template>
