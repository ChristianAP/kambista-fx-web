import { computed, ref } from 'vue';
import type { Paginated } from '@/core/http/pagination';
import { useSessionStore } from '@/features/auth/stores/session.store';
import type { Transaction } from '@/shared/domain/transaction';
import { useForm } from '@/shared/composables/useForm';
import { daysAgo, toDateInputValue } from '@/shared/utils/dates';
import { fetchHistory } from '../api/history.api';
import { endDateRule, startDateRule } from '../validation';

const DEFAULT_RANGE_DAYS = 30;
export const PAGE_SIZE = 10;

interface HistoryFormValues {
  startDate: string;
  endDate: string;
  userId: string;
}

export function useHistory() {
  const session = useSessionStore();
  const result = ref<Paginated<Transaction> | null>(null);
  const requestedPage = ref(1);

  const form = useForm<HistoryFormValues, Paginated<Transaction>>({
    initialValues: {
      startDate: toDateInputValue(daysAgo(DEFAULT_RANGE_DAYS)),
      endDate: toDateInputValue(new Date()),
      userId: '',
    },
    rules: { startDate: startDateRule, endDate: endDateRule },
    submit: ({ startDate, endDate, userId }) =>
      fetchHistory({
        startDate,
        endDate,
        userId: session.isAdmin ? userId.trim() : undefined,
        page: requestedPage.value,
        limit: PAGE_SIZE,
      }),
  });

  const goToPage = async (page: number): Promise<void> => {
    requestedPage.value = page;
    const loaded = await form.submit();

    if (loaded) {
      result.value = loaded;
    }
  };

  const search = (): Promise<void> => goToPage(1);
  const retry = (): Promise<void> => goToPage(requestedPage.value);

  return {
    ...form,
    transactions: computed(() => result.value?.items ?? null),
    pagination: computed(() => result.value?.pagination ?? null),
    isAdmin: computed(() => session.isAdmin),
    search,
    retry,
    goToPage,
  };
}
