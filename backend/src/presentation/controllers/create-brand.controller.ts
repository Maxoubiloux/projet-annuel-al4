import { FastifyRequest, FastifyReply } from 'fastify'
import { CreateBrandUseCase } from '@domain/usecases/create-brand.usecase'
import { CreateBrandParams } from '@domain/entities/Brand'

export class CreateBrandController {
  constructor(private readonly createBrandUseCase: CreateBrandUseCase) {}

  async handle(request: FastifyRequest<{ Body: CreateBrandParams }>, reply: FastifyReply): Promise<void> {
    const correlationId = request.id

    request.log.info({ correlationId }, 'POST /brands — creating brand')

    const result = await this.createBrandUseCase.execute(request.body)

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
