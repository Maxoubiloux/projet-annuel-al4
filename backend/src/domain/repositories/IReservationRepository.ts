import { Reservation } from '../entities/Reservation'

export interface ReservationListParams {
  page?: number
  limit?: number
}

export interface ReservationListResult {
  items: Reservation[]
  total: number
}

export interface IReservationRepository {
  findAll(params: ReservationListParams): Promise<ReservationListResult>
  findRecent(limit: number): Promise<Reservation[]>
  findById(id: string): Promise<Reservation | null>
  save(reservation: Reservation): Promise<Reservation>
  updateStatus(id: string, status: string): Promise<Reservation>
  updatePaymentStatus(id: string, paymentStatus: string): Promise<Reservation>
}
