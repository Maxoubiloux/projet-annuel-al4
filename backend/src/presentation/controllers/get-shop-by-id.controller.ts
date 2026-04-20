import { FastifyRequest, FastifyReply } from 'fastify'
import { GetShopByIdUseCase } from '@domain/usecases/get-shop-by-id.usecase'

export class GetShopByIdController {
  constructor(private readonly getShopByIdUseCase: GetShopByIdUseCase) {}

  async handle(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, `GET /shops/${request.params.id}`)

    const result = await this.getShopByIdUseCase.execute(request.params.id)

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
