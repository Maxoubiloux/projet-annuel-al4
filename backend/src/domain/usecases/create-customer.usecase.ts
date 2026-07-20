import { v4 as uuidv4 } from 'uuid'
import { Customer, CreateCustomerParams, CUSTOMER_STATUSES } from '../entities/Customer'
import { ICustomerRepository } from '../repositories/ICustomerRepository'
import { Result, ok, err } from '@shared/result/Result'
import { ValidationError } from '@shared/errors/DomainError'

export class CreateCustomerUseCase {
  constructor(private readonly customerRepository: ICustomerRepository) { }

  async execute(params: CreateCustomerParams): Promise<Result<Customer, ValidationError>> {
    if (!params.firstName?.trim()) return err(new ValidationError('Le prénom est requis'))
    if (!params.lastName?.trim()) return err(new ValidationError('Le nom est requis'))
    if (!params.email?.includes('@')) return err(new ValidationError("L'email est invalide"))
    if (!params.phone?.trim()) return err(new ValidationError('Le téléphone est requis'))
    if (!params.licenseNumber?.trim()) return err(new ValidationError('Le numéro de permis est requis'))
    if (!CUSTOMER_STATUSES.includes(params.status as never)) {
      return err(new ValidationError(`Statut invalide, doit être l'un de : ${CUSTOMER_STATUSES.join(', ')}`))
    }

    const existing = await this.customerRepository.findByEmail(params.email)
    if (existing) {
      return err(new ValidationError('Un client avec cet email existe déjà'))
    }

    const customer = Customer.create(uuidv4(), params)
    const saved = await this.customerRepository.save(customer)

    return ok(saved)
  }
}
