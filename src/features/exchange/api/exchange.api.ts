import { http } from '@/core/http/http-client';
import type { Currency } from '@/shared/domain/currency';
import type { Transaction } from '@/shared/domain/transaction';

export interface ExchangeRequest {
  monedaOrigen: Currency;
  monedaDestino: Currency;
  monto: number;
}

export const createTransaction = (request: ExchangeRequest): Promise<Transaction> =>
  http.post<Transaction>('/transactions', request);
