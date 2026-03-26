import { Moto, UpdateMotoParams } from '../entities/Moto'

export interface IMotoRepository {
  findAll(): Promise<Moto[]>
  findById(id: string): Promise<Moto | null>
  save(moto: Moto): Promise<Moto>
  update(id: string, params: UpdateMotoParams): Promise<Moto>
  delete(id: string): Promise<void>
}
