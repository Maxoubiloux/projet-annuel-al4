import { FastifyRequest, FastifyReply } from 'fastify'
import { GetAllMotosUseCase } from '@domain/usecases/get-all-motos.usecase'

export class GetAllMotosController {
  constructor(private readonly getAllMotosUseCase: GetAllMotosUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, 'GET /motos')

    const motos = await this.getAllMotosUseCase.execute()

    reply.send({
      success: true,
      data: motos,
      meta: { total: motos.length },
    })
  }
}
