import { FastifyRequest, FastifyReply } from 'fastify'
import { UpdateCustomerUseCase } from '@domain/usecases/update-customer.usecase'
import { UpdateCustomerParams } from '@domain/entities/Customer'

export class UpdateCustomerController {
  constructor(private readonly updateCustomerUseCase: UpdateCustomerUseCase) { }

  async handle(request: FastifyRequest<{ Params: { id: string }; Body: UpdateCustomerParams }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, `PUT /customers/${request.params.id}`)

    const result = await this.updateCustomerUseCase.execute(request.params.id, request.body)

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
