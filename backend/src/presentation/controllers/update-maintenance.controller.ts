import { FastifyRequest, FastifyReply } from 'fastify'
import { UpdateMaintenanceUseCase } from '@domain/usecases/update-maintenance.usecase'
import { UpdateMaintenanceParams } from '@domain/entities/MaintenanceJob'

export class UpdateMaintenanceController {
  constructor(private readonly updateMaintenanceUseCase: UpdateMaintenanceUseCase) { }

  async handle(request: FastifyRequest<{ Params: { id: string }; Body: UpdateMaintenanceParams }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, `PATCH /maintenance/${request.params.id}`)

    const result = await this.updateMaintenanceUseCase.execute(request.params.id, request.body)

    if (result.isErr) {
      const status = result.error.code === 'NOT_FOUND' ? 404 : 400
      reply.status(status).send({
        success: false,
        error: { code: result.error.code, message: result.error.message },
      })
      return
    }

    reply.send({ success: true, data: result.value })
  }
}
