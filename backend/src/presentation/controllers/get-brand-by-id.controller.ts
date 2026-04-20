import { FastifyRequest, FastifyReply } from 'fastify'
import { GetBrandByIdUseCase } from '@domain/usecases/get-brand-by-id.usecase'

export class GetBrandByIdController {
  constructor(private readonly getBrandByIdUseCase: GetBrandByIdUseCase) {}

  async handle(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, `GET /brands/${request.params.id}`)

    const result = await this.getBrandByIdUseCase.execute(request.params.id)

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
