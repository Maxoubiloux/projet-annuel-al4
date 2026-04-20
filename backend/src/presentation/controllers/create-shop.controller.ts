import { FastifyRequest, FastifyReply } from 'fastify'
import { CreateShopUseCase } from '@domain/usecases/create-shop.usecase'
import { CreateShopParams } from '@domain/entities/Shop'

export class CreateShopController {
  constructor(private readonly createShopUseCase: CreateShopUseCase) {}

  async handle(request: FastifyRequest<{ Body: CreateShopParams }>, reply: FastifyReply): Promise<void> {
    const correlationId = request.id

    request.log.info({ correlationId }, 'POST /shops — creating shop')

    const result = await this.createShopUseCase.execute(request.body)

    if (result.isErr) {
      reply.status(400).send({
        success: false,
        error: {
          code: result.error.code,
          message: result.error.message,
        },
      })
      return
    }

    reply.status(201).send({
      success: true,
      data: result.value,
    })
  }
}
