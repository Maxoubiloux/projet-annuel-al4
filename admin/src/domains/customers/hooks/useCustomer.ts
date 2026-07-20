import { useFetch } from '@/core/hooks/useFetch';
import type { Customer } from '@/domains/reservations/types';

export function useCustomer(id: string | null) {
  return useFetch<Customer>(id ? `/customers/${id}` : null);
}
