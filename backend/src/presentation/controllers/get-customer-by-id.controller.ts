import { FastifyRequest, FastifyReply } from 'fastify'
import { GetCustomerByIdUseCase } from '@domain/usecases/get-customer-by-id.usecase'

export class GetCustomerByIdController {
  constructor(private readonly getCustomerByIdUseCase: GetCustomerByIdUseCase) {}

  async handle(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, `GET /customers/${request.params.id}`)

    const result = await this.getCustomerByIdUseCase.execute(request.params.id)

    if (result.isErr) {
      reply.status(404).send({
        success: false,
        error: {
          code: result.error.code,
          message: result.error.message,
        },
      })
      return
    }

    reply.send({
      success: true,
      data: result.value,
    })
  }
}
