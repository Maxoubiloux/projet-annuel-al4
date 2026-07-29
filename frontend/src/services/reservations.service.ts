import { apiClient } from './api.client';

export interface ReservationSummary {
  id: string;
  motoId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  depositAmount: number;
  status: string;
  paymentStatus: string;
  contractStatus?: string;
  contractPdfUrl?: string;
  createdAt: string;
  moto?: {
    id: string;
    brand: string;
    model: string;
    plate: string;
    category?: string;
    imageUrl?: string;
  };
  shop?: {
    id: string;
    name: string;
    city: string;
  };
}

export interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const reservationsService = {
  getMine: async (): Promise<ReservationSummary[]> => {
    const res = await apiClient.get<ApiResponse<ReservationSummary[]>>('/v1/reservations/me');
    return res.data;
  },

  createMine: async (input: { motoId: string; startDate: string; endDate: string }): Promise<ReservationSummary> => {
    const res = await apiClient.post<ApiResponse<ReservationSummary>>('/v1/reservations/me', input);
    return res.data;
  },

  payMine: async (reservationId: string): Promise<CheckoutSessionResponse> => {
    const res = await apiClient.post<ApiResponse<CheckoutSessionResponse>>(`/v1/reservations/me/${reservationId}/pay`, {});
    return res.data;
  },

  confirmPayment: async (reservationId: string, sessionId: string): Promise<ReservationSummary> => {
    const res = await apiClient.post<ApiResponse<ReservationSummary>>(`/v1/reservations/me/${reservationId}/confirm-payment`, { sessionId });
    return res.data;
  },

  getContractPdf: async (reservationId: string): Promise<Blob> => {
    return apiClient.getBlob(`/v1/reservations/${reservationId}/contract`);
  },
};
