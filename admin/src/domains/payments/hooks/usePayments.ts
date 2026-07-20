import { useFetch } from '@/core/hooks/useFetch';
import { buildQuery } from '@/core/utils/buildQuery';
import { REFRESH_INTERVAL_MS } from '@/core/constants';
import type { Payment } from '../types';

export function usePayments(params: { page?: number; limit?: number } = {}) {
  const path = `/payments${buildQuery(params)}`;
  const result = useFetch<Payment[]>(path, { refetchInterval: REFRESH_INTERVAL_MS });
  return { ...result, data: result.data ?? [] };
}
