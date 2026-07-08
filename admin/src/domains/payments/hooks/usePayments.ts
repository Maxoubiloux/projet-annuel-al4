import { useFetch } from '@/core/hooks/useFetch';
import type { Payment } from '../types';

export function usePayments() {
  const result = useFetch<Payment[]>('/payments');
  return { ...result, data: result.data ?? [] };
}
