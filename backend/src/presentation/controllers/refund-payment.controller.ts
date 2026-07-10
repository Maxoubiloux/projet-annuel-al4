import { FastifyRequest, FastifyReply } from 'fastify'
import { RefundPaymentUseCase } from '@domain/usecases/refund-payment.usecase'
import { toPaymentResponse } from './payment-response.mapper'

export class RefundPaymentController {
  constructor(private readonly refundPaymentUseCase: RefundPaymentUseCase) { }

  async handle(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, `POST /payments/${request.params.id}/refund`)

    const result = await this.refundPaymentUseCase.execute(request.params.id)

    if (result.isErr) {
      const status = result.error.code === 'NOT_FOUND' ? 404 : 400
      reply.status(status).send({
        success: false,
        error: { code: result.error.code, message: result.error.message },
      })
      return
    }

    reply.send({ success: true, data: toPaymentResponse(result.value) })
  }
}
