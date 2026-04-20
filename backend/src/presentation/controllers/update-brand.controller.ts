import { FastifyRequest, FastifyReply } from 'fastify'
import { UpdateBrandUseCase } from '@domain/usecases/update-brand.usecase'
import { UpdateBrandParams } from '@domain/entities/Brand'

export class UpdateBrandController {
  constructor(private readonly updateBrandUseCase: UpdateBrandUseCase) {}

  async handle(request: FastifyRequest<{ Params: { id: string }; Body: UpdateBrandParams }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, `PUT /brands/${request.params.id}`)

    const result = await this.updateBrandUseCase.execute(request.params.id, request.body)

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
