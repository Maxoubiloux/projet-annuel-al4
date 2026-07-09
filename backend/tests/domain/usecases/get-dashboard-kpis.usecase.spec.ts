import { GetDashboardKpisUseCase } from '@domain/usecases/get-dashboard-kpis.usecase'
import { IDashboardRepository } from '@domain/repositories/IDashboardRepository'
import { DashboardKPIs } from '@domain/entities/Dashboard'

const kpisFixture: DashboardKPIs = {
  fleetUtilization: 42, totalFleet: 35, onRoad: 15, availableCount: 18,
  activeRentals: 15, dueTodayCount: 2, overdueCount: 1,
  revenueMTD: 4200, revenuePrevMonth: 3900, revenueTotal12m: 48000,
  dailyAvgRevenue: 210, forecastRevenue: 6510,
  maintenanceDue: 4, maintenanceCritical: 1, maintenanceScheduled: 2,
}

describe('GetDashboardKpisUseCase', () => {
  it('should return the KPIs from the repository', async () => {
    const repository: IDashboardRepository = {
      getKpis: jest.fn(async () => kpisFixture),
      getRevenue: jest.fn(),
      getRentals: jest.fn(),
    }
    const useCase = new GetDashboardKpisUseCase(repository)

    const result = await useCase.execute()

    expect(result).toEqual(kpisFixture)
    expect(repository.getKpis).toHaveBeenCalledTimes(1)
  })
})
