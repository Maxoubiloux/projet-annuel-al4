import { useFetch } from '@/core/hooks/useFetch';
import { buildQuery } from '@/core/utils/buildQuery';
import { REFRESH_INTERVAL_MS } from '@/core/constants';
import type { ReservationRow } from '../types';

export function useReservations(params: { page?: number; limit?: number } = {}) {
  const path = `/reservations${buildQuery(params)}`;
  const result = useFetch<ReservationRow[]>(path, { refetchInterval: REFRESH_INTERVAL_MS });
  return { ...result, data: result.data ?? [] };
}
