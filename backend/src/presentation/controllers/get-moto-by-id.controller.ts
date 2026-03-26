import { FastifyRequest, FastifyReply } from 'fastify'
import { GetMotoByIdUseCase } from '@domain/usecases/get-moto-by-id.usecase'

export class GetMotoByIdController {
  constructor(private readonly getMotoByIdUseCase: GetMotoByIdUseCase) {}

  async handle(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, `GET /motos/${request.params.id}`)

    const result = await this.getMotoByIdUseCase.execute(request.params.id)

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
