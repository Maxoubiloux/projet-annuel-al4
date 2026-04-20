import { FastifyRequest, FastifyReply } from 'fastify'
import { GetAllShopsUseCase } from '@domain/usecases/get-all-shops.usecase'

export class GetAllShopsController {
  constructor(private readonly getAllShopsUseCase: GetAllShopsUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, 'GET /shops')

    const shops = await this.getAllShopsUseCase.execute()

    reply.send({
      success: true,
      data: shops,
      meta: { total: shops.length },
    })
  }
}
