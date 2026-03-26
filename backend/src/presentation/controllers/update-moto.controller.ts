import { FastifyRequest, FastifyReply } from 'fastify'
import { UpdateMotoUseCase } from '@domain/usecases/update-moto.usecase'
import { UpdateMotoParams } from '@domain/entities/Moto'

export class UpdateMotoController {
  constructor(private readonly updateMotoUseCase: UpdateMotoUseCase) {}

  async handle(request: FastifyRequest<{ Params: { id: string }; Body: UpdateMotoParams }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, `PUT /motos/${request.params.id}`)

    const result = await this.updateMotoUseCase.execute(request.params.id, request.body)

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
