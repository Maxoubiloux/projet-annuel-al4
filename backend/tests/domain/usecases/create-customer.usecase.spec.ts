import { CreateCustomerUseCase } from '@domain/usecases/create-customer.usecase'
import { ICustomerRepository } from '@domain/repositories/ICustomerRepository'
import { Customer } from '@domain/entities/Customer'

const makeMockRepository = (existingEmail: Customer | null = null): ICustomerRepository => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(async () => existingEmail),
  save: jest.fn(async (c: Customer) => c),
  update: jest.fn(),
  updateStatus: jest.fn(),
})

describe('CreateCustomerUseCase', () => {
  const validParams = {
    firstName: 'Jeanne',
    lastName: 'Dupont',
    email: 'jeanne.dupont@example.com',
    phone: '0601020304',
    licenseNumber: 'LIC-001',
    licenseVerified: true,
    status: 'active',
  }

  it('should create a customer successfully', async () => {
    const repository = makeMockRepository()
    const useCase = new CreateCustomerUseCase(repository)

    const result = await useCase.execute(validParams)

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.firstName).toBe('Jeanne')
      expect(result.value.email).toBe('jeanne.dupont@example.com')
    }
    expect(repository.save).toHaveBeenCalledTimes(1)
  })

  it('should reject an invalid email', async () => {
    const useCase = new CreateCustomerUseCase(makeMockRepository())

    const result = await useCase.execute({ ...validParams, email: 'not-an-email' })

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })

  it('should reject a duplicate email', async () => {
    const existing = new Customer('id-2', 'Autre', 'Client', validParams.email, '060000', 'LIC-002', false, 'active', new Date())
    const useCase = new CreateCustomerUseCase(makeMockRepository(existing))

    const result = await useCase.execute(validParams)

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })
})
