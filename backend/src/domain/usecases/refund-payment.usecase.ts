import { Payment } from '../entities/Payment'
import { IPaymentRepository } from '../repositories/IPaymentRepository'
import { Result, ok, err } from '@shared/result/Result'
import { DomainError, NotFoundError, ValidationError } from '@shared/errors/DomainError'

export class RefundPaymentUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) { }

  async execute(id: string): Promise<Result<Payment, DomainError>> {
    const existing = await this.paymentRepository.findById(id)

    if (!existing) {
      return err(new NotFoundError('Payment', id))
    }

    if (existing.status === 'refunded') {
      return err(new ValidationError('Ce paiement a déjà été remboursé'))
    }

    const updated = await this.paymentRepository.refund(id)

    return ok(updated)
  }
}
