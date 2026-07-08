import { useFetch } from '@/core/hooks/useFetch';
import type { Customer } from '@/domains/reservations/types';

export function useCustomers() {
  const result = useFetch<Customer[]>('/customers');
  return { ...result, data: result.data ?? [] };
}
