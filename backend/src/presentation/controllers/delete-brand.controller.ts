import { FastifyRequest, FastifyReply } from 'fastify'
import { DeleteBrandUseCase } from '@domain/usecases/delete-brand.usecase'

export class DeleteBrandController {
  constructor(private readonly deleteBrandUseCase: DeleteBrandUseCase) {}

  async handle(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, `DELETE /brands/${request.params.id}`)

    const result = await this.deleteBrandUseCase.execute(request.params.id)

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

    reply.status(204).send()
  }
}
