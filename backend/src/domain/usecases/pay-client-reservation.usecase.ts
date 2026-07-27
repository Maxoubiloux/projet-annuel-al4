import { Reservation } from '../entities/Reservation'
import { IReservationRepository } from '../repositories/IReservationRepository'
import { IPaymentRepository } from '../repositories/IPaymentRepository'
import { Result, err, ok } from '@shared/result/Result'
import { DomainError, ForbiddenError, NotFoundError, ValidationError } from '@shared/errors/DomainError'

export interface SimulatedCardInput {
  cardholder: string
  cardNumber: string
  expiry: string
  cvc: string
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function isValidExpiry(value: string): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(value.trim())
  if (!match) return false

  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  if (month < 1 || month > 12) return false

  const expiryEnd = new Date(year, month, 0, 23, 59, 59, 999)
  return expiryEnd.getTime() >= Date.now()
}

function shouldFail(card: SimulatedCardInput): boolean {
  const number = onlyDigits(card.cardNumber)
  return number.startsWith('4000') || card.cvc === '000'
}

export class PayClientReservationUseCase {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly paymentRepository: IPaymentRepository,
  ) { }

  async execute(
    bookingId: string,
    userId: string,
    card: SimulatedCardInput,
  ): Promise<Result<Reservation, DomainError>> {
    const reservation = await this.reservationRepository.findById(bookingId)
    if (!reservation) return err(new NotFoundError('Reservation', bookingId))
    if (reservation.customerId !== userId) return err(new ForbiddenError('Cette réservation ne vous appartient pas'))
    if (reservation.paymentStatus === 'paid') return err(new ValidationError('Cette réservation est déjà payée'))
    if (reservation.status === 'cancelled') return err(new ValidationError('Cette réservation est annulée'))

    const cardNumber = onlyDigits(card.cardNumber)
    if (!card.cardholder.trim() || cardNumber.length < 12 || cardNumber.length > 19 || !isValidExpiry(card.expiry) || !/^\d{3,4}$/.test(card.cvc)) {
      return err(new ValidationError('Informations de carte invalides'))
    }

    const payment = await this.paymentRepository.findByBookingId(bookingId)
    if (!payment) return err(new NotFoundError('Payment for booking', bookingId))

    if (shouldFail(card)) {
      await this.paymentRepository.updateStatus(payment.id, 'failed')
      await this.reservationRepository.updatePaymentStatus(bookingId, 'failed')
      const cancelled = await this.reservationRepository.updateStatus(bookingId, 'cancelled')
      return ok(cancelled)
    }

    await this.paymentRepository.updateStatus(payment.id, 'paid')
    await this.reservationRepository.updatePaymentStatus(bookingId, 'paid')
    const confirmed = await this.reservationRepository.updateStatus(bookingId, 'confirmed')

    return ok(confirmed)
  }
}
