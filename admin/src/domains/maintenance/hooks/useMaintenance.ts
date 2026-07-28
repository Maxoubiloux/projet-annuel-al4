import { useFetch } from '@/core/hooks/useFetch';
import { buildQuery } from '@/core/utils/buildQuery';
import { REFRESH_INTERVAL_MS } from '@/core/constants';
import type { MaintenanceJob } from '../types';

export function useMaintenance(params: { page?: number; limit?: number } = {}) {
  const path = `/maintenance${buildQuery(params)}`;
  const result = useFetch<MaintenanceJob[]>(path, { refetchInterval: REFRESH_INTERVAL_MS });
  return { ...result, data: result.data ?? [] };
}
