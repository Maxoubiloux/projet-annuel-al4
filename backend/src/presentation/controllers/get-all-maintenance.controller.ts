import { FastifyRequest, FastifyReply } from 'fastify'
import { GetAllMaintenanceUseCase } from '@domain/usecases/get-all-maintenance.usecase'

interface MaintenanceQuery {
  page?: string
  limit?: string
}

export class GetAllMaintenanceController {
  constructor(private readonly getAllMaintenanceUseCase: GetAllMaintenanceUseCase) { }

  async handle(request: FastifyRequest<{ Querystring: MaintenanceQuery }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, 'GET /maintenance')

    const page = request.query.page ? Number(request.query.page) : 1
    const limit = request.query.limit ? Number(request.query.limit) : 10
    const { items, total } = await this.getAllMaintenanceUseCase.execute({ page, limit })

    reply.send({ success: true, data: items, meta: { total, page, limit } })
  }
}
