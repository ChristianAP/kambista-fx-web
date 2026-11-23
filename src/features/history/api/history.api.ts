import { http } from '@/core/http/http-client';
import type { Paginated } from '@/core/http/pagination';
import type { Transaction } from '@/shared/domain/transaction';

export interface HistoryFilters {
  startDate: string;
  endDate: string;
  userId?: string;
  page: number;
  limit: number;
}

export const fetchHistory = ({
  startDate,
  endDate,
  userId,
  page,
  limit,
}: HistoryFilters): Promise<Paginated<Transaction>> =>
  http.getPage<Transaction>('/transactions/history', { startDate, endDate, userId, page, limit });
