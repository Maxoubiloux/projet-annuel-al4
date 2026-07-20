import { FastifyRequest, FastifyReply } from 'fastify'
import { CreateMaintenanceUseCase } from '@domain/usecases/create-maintenance.usecase'
import { CreateMaintenanceParams } from '@domain/entities/MaintenanceJob'

export class CreateMaintenanceController {
  constructor(private readonly createMaintenanceUseCase: CreateMaintenanceUseCase) { }

  async handle(request: FastifyRequest<{ Body: CreateMaintenanceParams }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, 'POST /maintenance — creating job')

    const result = await this.createMaintenanceUseCase.execute(request.body)

    if (result.isErr) {
      reply.status(400).send({
        success: false,
        error: { code: result.error.code, message: result.error.message },
      })
      return
    }

    reply.status(201).send({ success: true, data: result.value })
  }
}
