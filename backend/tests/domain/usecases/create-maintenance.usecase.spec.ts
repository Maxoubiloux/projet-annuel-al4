import { CreateMaintenanceUseCase } from '@domain/usecases/create-maintenance.usecase'
import { IMaintenanceRepository } from '@domain/repositories/IMaintenanceRepository'
import { MaintenanceJob } from '@domain/entities/MaintenanceJob'

const makeMockRepository = (): IMaintenanceRepository => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findAlerts: jest.fn(),
  save: jest.fn(async (job: MaintenanceJob) => job),
  update: jest.fn(),
})

describe('CreateMaintenanceUseCase', () => {
  const validParams = {
    motoId: '550e8400-e29b-41d4-a716-446655440001',
    type: 'Oil change',
    date: '2026-08-01',
    km: '15000',
    cost: 89,
    sev: 'warning',
    status: 'open',
  }

  it('should create a maintenance job successfully', async () => {
    const repository = makeMockRepository()
    const useCase = new CreateMaintenanceUseCase(repository)

    const result = await useCase.execute(validParams)

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.type).toBe('Oil change')
    }
    expect(repository.save).toHaveBeenCalledTimes(1)
  })

  it('should reject a non-numeric mileage', async () => {
    const useCase = new CreateMaintenanceUseCase(makeMockRepository())

    const result = await useCase.execute({ ...validParams, km: 'abc' })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })

  it('should reject a negative cost', async () => {
    const useCase = new CreateMaintenanceUseCase(makeMockRepository())

    const result = await useCase.execute({ ...validParams, cost: -1 })

    expect(result.isErr).toBe(true)
  })

  it('should reject an invalid severity', async () => {
    const useCase = new CreateMaintenanceUseCase(makeMockRepository())

    const result = await useCase.execute({ ...validParams, sev: 'urgent' })

    expect(result.isErr).toBe(true)
  })
})
