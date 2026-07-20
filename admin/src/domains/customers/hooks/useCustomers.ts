import { useFetch } from '@/core/hooks/useFetch';
import { buildQuery } from '@/core/utils/buildQuery';
import { REFRESH_INTERVAL_MS } from '@/core/constants';
import type { Customer } from '@/domains/reservations/types';

export function useCustomers(params: { page?: number; limit?: number } = {}) {
  const path = `/customers${buildQuery(params)}`;
  const result = useFetch<Customer[]>(path, { refetchInterval: REFRESH_INTERVAL_MS });
  return { ...result, data: result.data ?? [] };
}
