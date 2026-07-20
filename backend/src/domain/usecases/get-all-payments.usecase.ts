import { IPaymentRepository, PaymentListParams, PaymentListResult } from '../repositories/IPaymentRepository'

export class GetAllPaymentsUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) { }

  async execute(params: PaymentListParams): Promise<PaymentListResult> {
    return this.paymentRepository.findAll(params)
  }
}
