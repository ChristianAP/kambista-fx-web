import { all, required } from '@/shared/validation/rules';

export const startDateRule = required('Selecciona la fecha inicial');

export const endDateRule = all<string, { startDate: string }>(
  required('Selecciona la fecha final'),
  (endDate, { startDate }) =>
    startDate && endDate < startDate ? 'La fecha final no puede ser anterior a la inicial' : null,
);
