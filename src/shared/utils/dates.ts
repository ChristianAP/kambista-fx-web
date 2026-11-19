const pad = (value: number): string => String(value).padStart(2, '0');

export const toDateInputValue = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const daysAgo = (days: number, from: Date = new Date()): Date => {
  const date = new Date(from);
  date.setDate(date.getDate() - days);
  return date;
};
