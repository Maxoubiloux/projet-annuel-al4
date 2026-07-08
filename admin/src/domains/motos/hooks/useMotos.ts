import { useFetch } from '@/core/hooks/useFetch';
import type { Moto } from '../types';

export function useMotos() {
  const result = useFetch<Moto[]>('/motos');
  return { ...result, data: result.data ?? [] };
}
