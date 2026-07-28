import { v4 as uuidv4 } from 'uuid'
import { CreateClientReservationParams, Reservation } from '../entities/Reservation'
import { Payment } from '../entities/Payment'
import { IReservationRepository } from '../repositories/IReservationRepository'
import { IPaymentRepository } from '../repositories/IPaymentRepository'
import { IContractQueuePublisher } from '../ports/IContractQueuePublisher'
import { Result, ok, err } from '@shared/result/Result'
import { NotFoundError, ValidationError } from '@shared/errors/DomainError'

function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000))
}

function isPastDate(value: string): boolean {
  const input = new Date(value)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return input.getTime() < today.getTime()
}

export class CreateClientReservationUseCase {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly paymentRepository: IPaymentRepository,
    private readonly contractPublisher?: IContractQueuePublisher,
  ) { }

  async execute(params: CreateClientReservationParams): Promise<Result<Reservation, ValidationError | NotFoundError>> {
    if (!params.userId?.trim()) return err(new ValidationError('Utilisateur connecté requis'))
    if (!params.motoId?.trim()) return err(new ValidationError('La moto est requise'))
    if (!params.startDate || !params.endDate) {
      return err(new ValidationError('Les dates de début et de fin sont requises'))
    }
    if (params.endDate < params.startDate) {
      return err(new ValidationError('La date de fin doit être postérieure ou égale à la date de début'))
    }
    if (isPastDate(params.startDate)) {
      return err(new ValidationError('La date de départ ne peut pas être passée'))
    }

    const pricePerDay = await this.reservationRepository.findMotoPricePerDay(params.motoId)
    if (pricePerDay === null) return err(new NotFoundError('Moto', params.motoId))

    const hasOverlap = await this.reservationRepository.hasActiveOverlap(params.motoId, params.startDate, params.endDate)
    if (hasOverlap) {
      return err(new ValidationError('Cette moto est déjà réservée sur cette période'))
    }

    await this.reservationRepository.ensureCustomer({
      id: params.userId,
      email: params.email,
      firstName: params.firstName,
      lastName: params.lastName,
      phone: params.phone,
    })

    const totalAmount = daysBetween(params.startDate, params.endDate) * pricePerDay
    const reservation = Reservation.create(uuidv4(), {
      motoId: params.motoId,
      customerId: params.userId,
      startDate: params.startDate,
      endDate: params.endDate,
      totalAmount,
      depositAmount: 0,
      status: 'pending',
      paymentStatus: 'pending',
    })

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

    // Déclenche la génération asynchrone du contrat (fire-and-forget) : un échec
    // de publication ne doit jamais annuler une réservation déjà persistée. Le
    // contrat reste alors en statut "pending" et pourra être régénéré.
    if (this.contractPublisher) {
      try {
        await this.contractPublisher.publishContractGeneration({
          correlationId: uuidv4(),
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
        // Erreur de publication ignorée volontairement (voir commentaire ci-dessus).
        // L'implémentation d'infrastructure loggue le détail de l'échec.
      }
    }

    return ok(saved)
  }
}
