import { FastifyRequest, FastifyReply } from 'fastify'
import { GetDashboardRentalsUseCase } from '@domain/usecases/get-dashboard-rentals.usecase'

interface RentalsQuery {
  days?: string
}

export class GetDashboardRentalsController {
  constructor(private readonly getDashboardRentalsUseCase: GetDashboardRentalsUseCase) { }

  async handle(request: FastifyRequest<{ Querystring: RentalsQuery }>, reply: FastifyReply): Promise<void> {
    request.log.info({ correlationId: request.id }, 'GET /dashboard/rentals')

    const days = request.query.days ? Number(request.query.days) : 14
    const points = await this.getDashboardRentalsUseCase.execute(days)

    reply.send({ success: true, data: points })
  }
}
