import { useRoute, useRouter } from 'vue-router';
import { useForm } from '@/shared/composables/useForm';
import { useSessionStore } from '../stores/session.store';
import { currentPasswordRule, emailRule } from '../validation';
import { resolveRedirect } from '../utils/redirect';

export function useLoginForm() {
  const session = useSessionStore();
  const router = useRouter();
  const route = useRoute();

  return useForm({
    initialValues: { email: '', password: '' },
    rules: { email: emailRule, password: currentPasswordRule },
    submit: async ({ email, password }) => {
      await session.login({ email: email.trim(), password });
      await router.replace(resolveRedirect(route.query.redirect));
    },
  });
}
