import { Motorbike } from '@/types';
import { apiClient } from './api.client';
import { mapToMotorbike } from './motos.service';

interface ApiListResponse<T> {
  success: boolean;
  data: T;
}

export const favoritesService = {
  getAll: async (): Promise<Motorbike[]> => {
    const res = await apiClient.get<ApiListResponse<Record<string, unknown>[]>>('/v1/favorites');
    return res.data.map(mapToMotorbike);
  },

  getIds: async (): Promise<string[]> => {
    const res = await apiClient.get<ApiListResponse<string[]>>('/v1/favorites/ids');
    return res.data;
  },

  add: async (motoId: string): Promise<Motorbike> => {
    const res = await apiClient.post<ApiListResponse<Record<string, unknown>>>(`/v1/favorites/${motoId}`, {});
    return mapToMotorbike(res.data);
  },

  remove: async (motoId: string): Promise<void> => {
    await apiClient.delete(`/v1/favorites/${motoId}`);
  },
};
