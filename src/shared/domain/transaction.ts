import type { Currency } from './currency';

export interface Transaction {
  id: string;
  monedaOrigen: Currency;
  monedaDestino: Currency;
  monto: number;
  montoCambiado: number;
  tipoCambio: number;
  fecha: string;
}
