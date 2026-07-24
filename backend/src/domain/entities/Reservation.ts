import { PAYMENT_STATUSES } from './Payment'

export const RESERVATION_STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const
export type ReservationStatusName = (typeof RESERVATION_STATUSES)[number]

// Cycle de vie de la génération asynchrone du contrat PDF par le worker.
export const CONTRACT_STATUSES = ['pending', 'processing', 'ready', 'failed'] as const
export type ContractStatusName = (typeof CONTRACT_STATUSES)[number]

export { PAYMENT_STATUSES }

export interface CreateReservationParams {
  motoId: string
  customerId: string
  startDate: string
  endDate: string
  totalAmount: number
  depositAmount: number
  status: string
  paymentStatus: string
}

export interface ReservationMotoSummary {
  id: string
  brand: string
  model: string
  plate: string
}

export interface ReservationCustomerSummary {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
}

export class Reservation {
  constructor(
    readonly id: string,
    readonly motoId: string,
    readonly customerId: string,
    readonly startDate: string,
    readonly endDate: string,
    readonly totalAmount: number,
    readonly depositAmount: number,
    readonly status: string,
    readonly paymentStatus: string,
    readonly createdAt: Date,
    readonly moto?: ReservationMotoSummary,
    readonly customer?: ReservationCustomerSummary,
    // État du contrat PDF généré de façon asynchrone par le worker.
    readonly contractStatus: string = 'pending',
    readonly contractPdfUrl?: string,
  ) { }

  static create(id: string, params: CreateReservationParams): Reservation {
    return new Reservation(
      id,
      params.motoId,
      params.customerId,
      params.startDate,
      params.endDate,
      params.totalAmount,
      params.depositAmount,
      params.status,
      params.paymentStatus,
      new Date(),
    )
  }
}
