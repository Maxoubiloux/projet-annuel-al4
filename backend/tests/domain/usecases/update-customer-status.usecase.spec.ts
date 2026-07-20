import { UpdateCustomerStatusUseCase } from '@domain/usecases/update-customer-status.usecase'
import { ICustomerRepository } from '@domain/repositories/ICustomerRepository'
import { Customer } from '@domain/entities/Customer'

const fixture = new Customer('id-1', 'Jeanne', 'Dupont', 'jeanne@example.com', '0601020304', 'LIC-001', true, 'active', new Date())

const makeMockRepository = (customer: Customer | null): ICustomerRepository => ({
  findAll: jest.fn(),
  findById: jest.fn(async () => customer),
  findByEmail: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(async (id, status) => new Customer(
    id, fixture.firstName, fixture.lastName, fixture.email, fixture.phone,
    fixture.licenseNumber, fixture.licenseVerified, status, fixture.createdAt,
  )),
})

describe('UpdateCustomerStatusUseCase', () => {
  it('should suspend an active customer', async () => {
    const useCase = new UpdateCustomerStatusUseCase(makeMockRepository(fixture))

    const result = await useCase.execute('id-1', 'suspended')

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.status).toBe('suspended')
    }
  })

  it('should return NotFoundError when customer does not exist', async () => {
    const useCase = new UpdateCustomerStatusUseCase(makeMockRepository(null))

    const result = await useCase.execute('unknown', 'suspended')

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
  })

  it('should reject an invalid status', async () => {
    const useCase = new UpdateCustomerStatusUseCase(makeMockRepository(fixture))

    const result = await useCase.execute('id-1', 'banned')

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })
})
