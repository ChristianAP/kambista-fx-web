import { computed, reactive, ref, shallowReactive } from 'vue';
import { toErrorMessage } from '@/core/http/api-error';
import type { Rules } from '@/shared/validation/rules';

type FieldMessages<V> = { [K in keyof V]?: string };

interface UseFormOptions<V extends object, R> {
  initialValues: V;
  rules: Rules<V>;
  submit: (values: V) => Promise<R>;
}

export function useForm<V extends object, R>({
  initialValues,
  rules,
  submit,
}: UseFormOptions<V, R>) {
  const values = reactive({ ...initialValues }) as V;
  const touched = shallowReactive(new Set<keyof V>());
  const submitted = ref(false);
  const isSubmitting = ref(false);
  const submitError = ref<string | null>(null);

  const fields = Object.keys(rules) as (keyof V)[];

  const failures = computed(() => {
    const messages: FieldMessages<V> = {};
    for (const field of fields) {
      const message = rules[field]?.(values[field], values);
      if (message) {
        messages[field] = message;
      }
    }
    return messages;
  });

  const errors = computed(() => {
    const visible: FieldMessages<V> = {};
    for (const field of fields) {
      const message = failures.value[field];
      if (message && (submitted.value || touched.has(field))) {
        visible[field] = message;
      }
    }
    return visible;
  });

  const isValid = computed(() => Object.keys(failures.value).length === 0);

  const touch = (field: keyof V): void => {
    touched.add(field);
  };

  const reset = (): void => {
    Object.assign(values, initialValues);
    touched.clear();
    submitted.value = false;
    submitError.value = null;
  };

  const handleSubmit = async (): Promise<R | undefined> => {
    submitted.value = true;
    if (!isValid.value) {
      return undefined;
    }

    isSubmitting.value = true;
    submitError.value = null;
    try {
      return await submit(values);
    } catch (error) {
      submitError.value = toErrorMessage(error);
      return undefined;
    } finally {
      isSubmitting.value = false;
    }
  };

  return { values, errors, isValid, isSubmitting, submitError, touch, reset, submit: handleSubmit };
}
