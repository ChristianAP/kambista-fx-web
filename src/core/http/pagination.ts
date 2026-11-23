export interface PageInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: PageInfo;
}

const readNumber = (headers: Headers, name: string, fallback: number): number => {
  const value = Number(headers.get(name));
  return Number.isInteger(value) && value > 0 ? value : fallback;
};

export const readPageInfo = (headers: Headers, itemCount: number): PageInfo => ({
  total: readNumber(headers, 'X-Total-Count', itemCount),
  page: readNumber(headers, 'X-Page', 1),
  limit: readNumber(headers, 'X-Limit', Math.max(itemCount, 1)),
  totalPages: readNumber(headers, 'X-Total-Pages', 1),
});
