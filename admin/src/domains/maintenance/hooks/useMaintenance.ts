import { useFetch } from '@/core/hooks/useFetch';
import type { MaintenanceJob } from '../types';

export function useMaintenance() {
  const result = useFetch<MaintenanceJob[]>('/maintenance');
  return { ...result, data: result.data ?? [] };
}
