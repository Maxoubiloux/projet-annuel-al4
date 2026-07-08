import { useFetch } from '@/core/hooks/useFetch';
import { buildQuery } from '@/core/utils/buildQuery';
import { REFRESH_INTERVAL_MS } from '@/core/constants';
import type { Moto } from '../types';

export function useMotos(params: { page?: number; limit?: number } = {}) {
  const path = `/motos${buildQuery(params)}`;
  const result = useFetch<Moto[]>(path, { refetchInterval: REFRESH_INTERVAL_MS });
  return { ...result, data: result.data ?? [] };
}
