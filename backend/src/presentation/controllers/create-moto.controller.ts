import { FastifyRequest, FastifyReply } from 'fastify'
import { CreateMotoUseCase } from '@domain/usecases/create-moto.usecase'
import { CreateMotoParams } from '@domain/entities/Moto'

export class CreateMotoController {
  constructor(private readonly createMotoUseCase: CreateMotoUseCase) {}

  async handle(request: FastifyRequest<{ Body: CreateMotoParams }>, reply: FastifyReply): Promise<void> {
    const correlationId = request.id

    request.log.info({ correlationId }, 'POST /motos — creating moto')

    const result = await this.createMotoUseCase.execute(request.body)

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
