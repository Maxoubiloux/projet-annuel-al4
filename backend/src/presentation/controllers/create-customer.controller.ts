import { FastifyRequest, FastifyReply } from 'fastify'
import { CreateCustomerUseCase } from '@domain/usecases/create-customer.usecase'
import { CreateCustomerParams } from '@domain/entities/Customer'

export class CreateCustomerController {
  constructor(private readonly createCustomerUseCase: CreateCustomerUseCase) { }

  async handle(request: FastifyRequest<{ Body: CreateCustomerParams }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, 'POST /customers — creating customer')

    const result = await this.createCustomerUseCase.execute(request.body)

    if (result.isErr) {
      reply.status(400).send({
        success: false,
        error: { code: result.error.code, message: result.error.message },
      })
      return
    }

    reply.status(201).send({ success: true, data: result.value })
  }
}
