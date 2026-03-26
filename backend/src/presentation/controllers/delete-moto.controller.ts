import { FastifyRequest, FastifyReply } from 'fastify'
import { DeleteMotoUseCase } from '@domain/usecases/delete-moto.usecase'

export class DeleteMotoController {
  constructor(private readonly deleteMotoUseCase: DeleteMotoUseCase) {}

  async handle(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, `DELETE /motos/${request.params.id}`)

    const result = await this.deleteMotoUseCase.execute(request.params.id)

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
