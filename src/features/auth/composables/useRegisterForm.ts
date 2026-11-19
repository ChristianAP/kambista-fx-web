import { useRouter } from 'vue-router';
import { useForm } from '@/shared/composables/useForm';
import { useSessionStore } from '../stores/session.store';
import { DEFAULT_REDIRECT } from '../utils/redirect';
import { emailRule, nameRule, newPasswordRule } from '../validation';

export function useRegisterForm() {
  const session = useSessionStore();
  const router = useRouter();

  return useForm({
    initialValues: { nombre: '', email: '', password: '' },
    rules: { nombre: nameRule, email: emailRule, password: newPasswordRule },
    submit: async ({ nombre, email, password }) => {
      await session.register({ nombre: nombre.trim(), email: email.trim(), password });
      await router.replace(DEFAULT_REDIRECT);
    },
  });
}
