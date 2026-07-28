import { FastifyRequest, FastifyReply } from 'fastify'
import { GetMaintenanceAlertsUseCase } from '@domain/usecases/get-maintenance-alerts.usecase'

interface AlertsQuery {
  limit?: string
}

export class GetMaintenanceAlertsController {
  constructor(private readonly getMaintenanceAlertsUseCase: GetMaintenanceAlertsUseCase) { }

  async handle(request: FastifyRequest<{ Querystring: AlertsQuery }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, 'GET /maintenance/alerts')

    const limit = request.query.limit ? Number(request.query.limit) : 5
    const alerts = await this.getMaintenanceAlertsUseCase.execute(limit)

    reply.send({ success: true, data: alerts })
  }
}
