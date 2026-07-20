import { UpdateCustomerUseCase } from '@domain/usecases/update-customer.usecase'
import { ICustomerRepository } from '@domain/repositories/ICustomerRepository'
import { Customer } from '@domain/entities/Customer'

const fixture = new Customer('id-1', 'Jeanne', 'Dupont', 'jeanne@example.com', '0601020304', 'LIC-001', true, 'active', new Date())

const makeMockRepository = (customer: Customer | null, emailOwner: Customer | null = null): ICustomerRepository => ({
  findAll: jest.fn(),
  findById: jest.fn(async () => customer),
  findByEmail: jest.fn(async () => emailOwner),
  save: jest.fn(),
  update: jest.fn(async (id, params) => new Customer(
    id, params.firstName ?? fixture.firstName, params.lastName ?? fixture.lastName,
    params.email ?? fixture.email, params.phone ?? fixture.phone,
    params.licenseNumber ?? fixture.licenseNumber, params.licenseVerified ?? fixture.licenseVerified,
    params.status ?? fixture.status, fixture.createdAt,
  )),
  updateStatus: jest.fn(),
})

describe('UpdateCustomerUseCase', () => {
  it('should update a customer successfully', async () => {
    const useCase = new UpdateCustomerUseCase(makeMockRepository(fixture))

    const result = await useCase.execute('id-1', { phone: '0699999999' })

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.phone).toBe('0699999999')
    }
  })

  it('should return NotFoundError when customer does not exist', async () => {
    const useCase = new UpdateCustomerUseCase(makeMockRepository(null))

    const result = await useCase.execute('unknown', { phone: '0699999999' })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('NOT_FOUND')
    }
  })

  it('should reject an email already used by another customer', async () => {
    const otherOwner = new Customer('id-2', 'Autre', 'Client', 'taken@example.com', '060000', 'LIC-002', false, 'active', new Date())
    const useCase = new UpdateCustomerUseCase(makeMockRepository(fixture, otherOwner))

    const result = await useCase.execute('id-1', { email: 'taken@example.com' })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })
})
