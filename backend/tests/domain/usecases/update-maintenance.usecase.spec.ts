import { UpdateMaintenanceUseCase } from '@domain/usecases/update-maintenance.usecase'
import { IMaintenanceRepository } from '@domain/repositories/IMaintenanceRepository'
import { MaintenanceJob } from '@domain/entities/MaintenanceJob'

const fixture = new MaintenanceJob('job-1', 'moto-1', 'Oil change', '2026-08-01', '15000', 89, 'warning', 'open', new Date())

const makeMockRepository = (job: MaintenanceJob | null): IMaintenanceRepository => ({
  findAll: jest.fn(),
  findById: jest.fn(async () => job),
  findAlerts: jest.fn(),
  save: jest.fn(),
  update: jest.fn(async (id, params) => new MaintenanceJob(
    id, fixture.motoId, fixture.type, fixture.date, fixture.km,
    params.cost ?? fixture.cost, fixture.sev, params.status ?? fixture.status,
    fixture.createdAt, fixture.moto, fixture.plate, params.notes ?? fixture.notes,
  )),
})

describe('UpdateMaintenanceUseCase', () => {
  it('should mark a job as completed', async () => {
    const useCase = new UpdateMaintenanceUseCase(makeMockRepository(fixture))

    const result = await useCase.execute('job-1', { status: 'completed' })

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.status).toBe('completed')
    }
  })

  it('should return NotFoundError when job does not exist', async () => {
    const useCase = new UpdateMaintenanceUseCase(makeMockRepository(null))

    const result = await useCase.execute('unknown', { status: 'completed' })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
  })

  it('should reject a negative cost', async () => {
    const useCase = new UpdateMaintenanceUseCase(makeMockRepository(fixture))

    const result = await useCase.execute('job-1', { cost: -5 })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })

  it('should reject an invalid status', async () => {
    const useCase = new UpdateMaintenanceUseCase(makeMockRepository(fixture))

    const result = await useCase.execute('job-1', { status: 'urgent' })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })
})
