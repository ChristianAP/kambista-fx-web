import { http } from '@/core/http/http-client';
import type { Transaction } from '@/shared/domain/transaction';

export interface HistoryFilters {
  startDate: string;
  endDate: string;
  userId?: string;
}

export const fetchHistory = ({
  startDate,
  endDate,
  userId,
}: HistoryFilters): Promise<Transaction[]> =>
  http.get<Transaction[]>('/transactions/history', { startDate, endDate, userId });
