import { Moto } from '../entities/Moto'

export interface IMotoRepository {
  save(moto: Moto): Promise<Moto>
}
