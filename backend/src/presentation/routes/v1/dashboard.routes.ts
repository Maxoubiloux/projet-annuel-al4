import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { IDashboardRepository } from '@domain/repositories/IDashboardRepository'
import { GetDashboardKpisUseCase } from '@domain/usecases/get-dashboard-kpis.usecase'
import { GetDashboardRevenueUseCase } from '@domain/usecases/get-dashboard-revenue.usecase'
import { GetDashboardRentalsUseCase } from '@domain/usecases/get-dashboard-rentals.usecase'
import { GetDashboardKpisController } from '@presentation/controllers/get-dashboard-kpis.controller'
import { GetDashboardRevenueController } from '@presentation/controllers/get-dashboard-revenue.controller'
import { GetDashboardRentalsController } from '@presentation/controllers/get-dashboard-rentals.controller'

export async function dashboardRoutesV1(app: FastifyInstance, opts: { dashboardRepository: IDashboardRepository }) {
  const repo = opts.dashboardRepository

  const getDashboardKpisController = new GetDashboardKpisController(new GetDashboardKpisUseCase(repo))
  const getDashboardRevenueController = new GetDashboardRevenueController(new GetDashboardRevenueUseCase(repo))
  const getDashboardRentalsController = new GetDashboardRentalsController(new GetDashboardRentalsUseCase(repo))

  app.get('/dashboard/kpis', async (request: FastifyRequest, reply: FastifyReply) => {
    await getDashboardKpisController.handle(request, reply)
  })

  app.get('/dashboard/revenue', async (request: FastifyRequest, reply: FastifyReply) => {
    await getDashboardRevenueController.handle(request as never, reply)
  })

  app.get('/dashboard/rentals', async (request: FastifyRequest, reply: FastifyReply) => {
    await getDashboardRentalsController.handle(request as never, reply)
  })
}
