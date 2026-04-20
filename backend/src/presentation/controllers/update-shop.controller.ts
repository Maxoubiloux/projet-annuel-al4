import { FastifyRequest, FastifyReply } from 'fastify'
import { UpdateShopUseCase } from '@domain/usecases/update-shop.usecase'
import { UpdateShopParams } from '@domain/entities/Shop'

export class UpdateShopController {
  constructor(private readonly updateShopUseCase: UpdateShopUseCase) {}

  async handle(request: FastifyRequest<{ Params: { id: string }; Body: UpdateShopParams }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, `PUT /shops/${request.params.id}`)

    const result = await this.updateShopUseCase.execute(request.params.id, request.body)

    if (result.isErr) {
      const status = result.error.code === 'NOT_FOUND' ? 404 : 400
      reply.status(status).send({
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
