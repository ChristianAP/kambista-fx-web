import { ref } from 'vue';
import type { Currency } from '@/shared/domain/currency';
import type { Transaction } from '@/shared/domain/transaction';
import { useForm } from '@/shared/composables/useForm';
import { all } from '@/shared/validation/rules';
import { createTransaction } from '../api/exchange.api';
import { amountRule, currencyRule, differsFromSource, normalizeAmount } from '../validation';

interface ExchangeFormValues {
  amount: string;
  sourceCurrency: Currency;
  targetCurrency: Currency;
}

const INITIAL_VALUES: ExchangeFormValues = {
  amount: '',
  sourceCurrency: 'USD',
  targetCurrency: 'PEN',
};

export function useExchangeForm() {
  const result = ref<Transaction | null>(null);

  const form = useForm<ExchangeFormValues, void>({
    initialValues: INITIAL_VALUES,
    rules: {
      amount: amountRule,
      sourceCurrency: currencyRule,
      targetCurrency: all(currencyRule, differsFromSource),
    },
    submit: async ({ amount, sourceCurrency, targetCurrency }) => {
      result.value = await createTransaction({
        monedaOrigen: sourceCurrency,
        monedaDestino: targetCurrency,
        monto: Number(normalizeAmount(amount)),
      });
    },
  });

  const swapCurrencies = (): void => {
    const { sourceCurrency, targetCurrency } = form.values;
    form.values.sourceCurrency = targetCurrency;
    form.values.targetCurrency = sourceCurrency;
  };

  const startOver = (): void => {
    result.value = null;
    form.reset();
  };

  return { ...form, result, swapCurrencies, startOver };
}
