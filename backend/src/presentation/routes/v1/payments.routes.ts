import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { IPaymentRepository } from '@domain/repositories/IPaymentRepository'
import { GetAllPaymentsUseCase } from '@domain/usecases/get-all-payments.usecase'
import { RefundPaymentUseCase } from '@domain/usecases/refund-payment.usecase'
import { GetAllPaymentsController } from '@presentation/controllers/get-all-payments.controller'
import { RefundPaymentController } from '@presentation/controllers/refund-payment.controller'
import { idParamSchema } from '@presentation/validators/id-param.validator'

export async function paymentRoutesV1(app: FastifyInstance, opts: { paymentRepository: IPaymentRepository }) {
  const repo = opts.paymentRepository

  const getAllPaymentsController = new GetAllPaymentsController(new GetAllPaymentsUseCase(repo))
  const refundPaymentController = new RefundPaymentController(new RefundPaymentUseCase(repo))

  app.get('/payments', async (request: FastifyRequest, reply: FastifyReply) => {
    await getAllPaymentsController.handle(request as never, reply)
  })

  app.post('/payments/:id/refund', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { error } = idParamSchema.validate(request.params)
    if (error) {
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.details.map(d => d.message).join(', ') },
      })
      return
    }
    await refundPaymentController.handle(request, reply)
  })
}
