import { apiClient } from './api.client';
import { Motorbike } from '@/types';

interface ApiMotoResponse {
  success: boolean;
  data: unknown;
}

function mapToMotorbike(raw: Record<string, unknown>): Motorbike {
  return {
    id: raw.id as string,
    brand: raw.brand as string,
    model: raw.model as string,
    registration: raw.registration as string,
    category: raw.category as 'A' | 'A2' | 'A1',
    style: raw.style as Motorbike['style'],
    status: raw.status as Motorbike['status'],
    currentKm: raw.currentKm as number,
    pricePerDay: raw.pricePerDay as number,
    imageUrl: (raw.imageUrl as string) || '/images/motos/default.jpg',
    description: raw.description as string,
    createdAt: raw.createdAt as string,
    year: raw.year as number,
    hp: raw.hp as number,
    torque: raw.torque as number,
    consumption: raw.consumption as number,
    range: raw.range as number,
  };
}

export const motosService = {
  getAll: async (): Promise<Motorbike[]> => {
    const res = await apiClient.get<ApiMotoResponse>('/v1/motos');
    const data = (res.data as Record<string, unknown>[]) ?? [];
    return data.map(mapToMotorbike);
  },

  getById: async (id: string): Promise<Motorbike> => {
    const res = await apiClient.get<ApiMotoResponse>(`/v1/motos/${id}`);
    return mapToMotorbike(res.data as Record<string, unknown>);
  },
};
