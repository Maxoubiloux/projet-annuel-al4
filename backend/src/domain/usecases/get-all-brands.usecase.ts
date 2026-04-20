import { Brand } from '../entities/Brand'
import { IBrandRepository } from '../repositories/IBrandRepository'

export class GetAllBrandsUseCase {
  constructor(private readonly brandRepository: IBrandRepository) {}

  async execute(): Promise<Brand[]> {
    return this.brandRepository.findAll()
  }
}
