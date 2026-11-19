import { computed, ref } from 'vue';
import { useSessionStore } from '@/features/auth/stores/session.store';
import type { Transaction } from '@/shared/domain/transaction';
import { useForm } from '@/shared/composables/useForm';
import { daysAgo, toDateInputValue } from '@/shared/utils/dates';
import { fetchHistory } from '../api/history.api';
import { endDateRule, startDateRule } from '../validation';

const DEFAULT_RANGE_DAYS = 30;

interface HistoryFormValues {
  startDate: string;
  endDate: string;
  userId: string;
}

export function useHistory() {
  const session = useSessionStore();
  const transactions = ref<Transaction[] | null>(null);

  const form = useForm<HistoryFormValues, Transaction[]>({
    initialValues: {
      startDate: toDateInputValue(daysAgo(DEFAULT_RANGE_DAYS)),
      endDate: toDateInputValue(new Date()),
      userId: '',
    },
    rules: { startDate: startDateRule, endDate: endDateRule },
    submit: ({ startDate, endDate, userId }) =>
      fetchHistory({ startDate, endDate, userId: session.isAdmin ? userId.trim() : undefined }),
  });

  const load = async (): Promise<void> => {
    const result = await form.submit();
    if (result) {
      transactions.value = result;
    }
  };

  return { ...form, transactions, isAdmin: computed(() => session.isAdmin), load };
}
