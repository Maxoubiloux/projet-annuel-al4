import { useFetch } from '@/core/hooks/useFetch';
import type { ReservationRow } from '../types';

export function useReservations() {
  const result = useFetch<ReservationRow[]>('/reservations');
  return { ...result, data: result.data ?? [] };
}
