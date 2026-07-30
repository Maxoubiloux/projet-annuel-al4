import { v4 as uuidv4 } from 'uuid'
import { isMotoBookable } from '../entities/Moto'
import { Reservation, CreateReservationParams, RESERVATION_STATUSES, PAYMENT_STATUSES } from '../entities/Reservation'
import { Payment } from '../entities/Payment'
import { IReservationRepository } from '../repositories/IReservationRepository'
import { IPaymentRepository } from '../repositories/IPaymentRepository'
import { IContractQueuePublisher } from '../ports/IContractQueuePublisher'
import { Result, ok, err } from '@shared/result/Result'
import { ValidationError } from '@shared/errors/DomainError'

export class CreateReservationUseCase {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly paymentRepository: IPaymentRepository,
    private readonly contractPublisher?: IContractQueuePublisher,
  ) { }

  async execute(params: CreateReservationParams, correlationId: string): Promise<Result<Reservation, ValidationError>> {
    if (!params.motoId?.trim()) return err(new ValidationError('La moto est requise'))
    if (!params.customerId?.trim()) return err(new ValidationError('Le client est requis'))
    if (!params.startDate || !params.endDate) {
      return err(new ValidationError('Les dates de début et de fin sont requises'))
    }
    if (params.endDate < params.startDate) {
      return err(new ValidationError('La date de fin doit être postérieure ou égale à la date de début'))
    }
    if (params.totalAmount <= 0) return err(new ValidationError('Le montant total doit être supérieur à 0'))
    if (params.depositAmount < 0) return err(new ValidationError('La caution ne peut pas être négative'))
    if (!RESERVATION_STATUSES.includes(params.status as never)) {
      return err(new ValidationError('Statut de réservation invalide'))
    }
    if (!PAYMENT_STATUSES.includes(params.paymentStatus as never)) {
      return err(new ValidationError('Statut de paiement invalide'))
    }

    const motoStatus = await this.reservationRepository.findMotoStatus(params.motoId)
    if (motoStatus !== null && !isMotoBookable(motoStatus)) {
      return err(new ValidationError('Cette moto n\'est pas disponible à la réservation'))
    }

    const reservation = Reservation.create(uuidv4(), params)
    const saved = await this.reservationRepository.save(reservation)

    const payment = Payment.create(uuidv4(), {
      ref: `PAY-${saved.id.slice(0, 8).toUpperCase()}`,
      bookingId: saved.id,
      customerId: saved.customerId,
      amount: saved.totalAmount,
      deposit: saved.depositAmount,
      method: 'card',
      status: saved.paymentStatus,
    })
    await this.paymentRepository.save(payment)

    if (this.contractPublisher && saved.paymentStatus === 'paid') {
      try {
        await this.contractPublisher.publishContractGeneration({
          correlationId,
          reservation: {
            id: saved.id,
            motoId: saved.motoId,
            customerId: saved.customerId,
            startDate: saved.startDate,
            endDate: saved.endDate,
            totalAmount: saved.totalAmount,
            depositAmount: saved.depositAmount,
            customer: saved.customer,
            moto: saved.moto,
            shop: saved.shop,
          },
        })
      } catch {
        // La publication est best-effort : son échec ne doit pas bloquer la
        // création de la réservation. On acte quand même l'échec au lieu de
        // laisser le contrat bloqué indéfiniment sur son statut par défaut.
        try {
          await this.reservationRepository.updateContract(saved.id, 'failed', null)
        } catch {
          // best-effort également : une erreur ici ne doit pas remonter
        }
      }
    }

    return ok(saved)
  }
}
