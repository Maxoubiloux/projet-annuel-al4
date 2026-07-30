import { apiClient } from './api.client';
import { Motorbike } from '@/types';

interface ApiMotoResponse {
  success: boolean;
  data: unknown;
}

export interface MotoAvailability {
  motoId: string;
  unavailableRanges: { startDate: string; endDate: string }[];
}

export function mapToMotorbike(raw: Record<string, unknown>): Motorbike {
  return {
    id: raw.id as string,
    brand: raw.brand as string,
    model: raw.model as string,
    registration: (raw.registration ?? raw.plate) as string,
    category: raw.category as 'A' | 'A2' | 'A1',
    style: ((raw.style as string) || 'Roadster') as Motorbike['style'],
    status: raw.status as Motorbike['status'],
    currentKm: (raw.currentKm ?? raw.mileage ?? 0) as number,
    pricePerDay: raw.pricePerDay as number,
    location: (raw.location as string) || '',
    imageUrl: (raw.imageUrl as string) || '/images/motos/default.jpg',
    description: raw.description as string,
    createdAt: raw.createdAt as string,
    year: raw.year as number,
    hp: (raw.hp ?? 0) as number,
    torque: (raw.torque ?? 0) as number,
    consumption: (raw.consumption ?? 0) as number,
    range: (raw.range ?? 0) as number,
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

  getAvailability: async (id: string): Promise<MotoAvailability> => {
    const res = await apiClient.get<{ success: boolean; data: MotoAvailability }>(`/v1/motos/${id}/availability`);
    return res.data;
  },
};
