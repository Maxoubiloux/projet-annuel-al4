import { FastifyRequest, FastifyReply } from 'fastify'
import { GetDashboardRevenueUseCase } from '@domain/usecases/get-dashboard-revenue.usecase'

interface RevenueQuery {
  period?: string
}

export class GetDashboardRevenueController {
  constructor(private readonly getDashboardRevenueUseCase: GetDashboardRevenueUseCase) { }

  async handle(request: FastifyRequest<{ Querystring: RevenueQuery }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, 'GET /dashboard/revenue')

    const match = /^(\d+)m$/.exec(request.query.period ?? '')
    const months = match ? Number(match[1]) : 12
    const points = await this.getDashboardRevenueUseCase.execute(months)

    reply.send({ success: true, data: points })
  }
}
