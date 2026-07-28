import { Reservation } from '../entities/Reservation'

export interface ReservationListParams {
  page?: number
  limit?: number
  customerId?: string
}

export interface ReservationListResult {
  items: Reservation[]
  total: number
}

export interface ReservationCustomerUpsertParams {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
}

export interface IReservationRepository {
  findAll(params: ReservationListParams): Promise<ReservationListResult>
  findRecent(limit: number): Promise<Reservation[]>
  findById(id: string): Promise<Reservation | null>
  findMotoPricePerDay(motoId: string): Promise<number | null>
  hasActiveOverlap(motoId: string, startDate: string, endDate: string): Promise<boolean>
  ensureCustomer(params: ReservationCustomerUpsertParams): Promise<void>
  save(reservation: Reservation): Promise<Reservation>
  updateStatus(id: string, status: string): Promise<Reservation>
  updatePaymentStatus(id: string, paymentStatus: string): Promise<Reservation>
  updateContract(id: string, contractStatus: string, contractPdfUrl: string | null): Promise<Reservation>
}
