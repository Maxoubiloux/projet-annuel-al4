import { FastifyRequest, FastifyReply } from 'fastify'
import { UpdateCustomerStatusUseCase } from '@domain/usecases/update-customer-status.usecase'

export class UpdateCustomerStatusController {
  constructor(private readonly updateCustomerStatusUseCase: UpdateCustomerStatusUseCase) { }

  async handle(
    request: FastifyRequest<{ Params: { id: string }; Body: { status: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    request.log.info({ correlationId: request.id }, `PATCH /customers/${request.params.id}/status`)

    const result = await this.updateCustomerStatusUseCase.execute(request.params.id, request.body.status)

    if (result.isErr) {
      const status = result.error.code === 'NOT_FOUND' ? 404 : 400
      reply.status(status).send({
        success: false,
        error: { code: result.error.code, message: result.error.message },
      })
      return
    }

    reply.send({ success: true, data: result.value })
  }
}
