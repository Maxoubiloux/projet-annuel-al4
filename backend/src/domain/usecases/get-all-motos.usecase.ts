import { Moto } from '../entities/Moto'
import { IMotoRepository } from '../repositories/IMotoRepository'

export class GetAllMotosUseCase {
  constructor(private readonly motoRepository: IMotoRepository) {}

  async execute(): Promise<Moto[]> {
    return this.motoRepository.findAll()
  }
}
