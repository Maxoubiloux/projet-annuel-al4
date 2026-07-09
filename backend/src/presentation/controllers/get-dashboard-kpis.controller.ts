import { FastifyRequest, FastifyReply } from 'fastify'
import { GetDashboardKpisUseCase } from '@domain/usecases/get-dashboard-kpis.usecase'

export class GetDashboardKpisController {
  constructor(private readonly getDashboardKpisUseCase: GetDashboardKpisUseCase) { }

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, 'GET /dashboard/kpis')

    const kpis = await this.getDashboardKpisUseCase.execute()

    reply.send({ success: true, data: kpis })
  }
}
