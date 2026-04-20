import { FastifyRequest, FastifyReply } from 'fastify'
import { DeleteShopUseCase } from '@domain/usecases/delete-shop.usecase'

export class DeleteShopController {
  constructor(private readonly deleteShopUseCase: DeleteShopUseCase) {}

  async handle(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, `DELETE /shops/${request.params.id}`)

    const result = await this.deleteShopUseCase.execute(request.params.id)

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
