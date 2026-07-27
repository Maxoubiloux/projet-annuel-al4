import { Moto } from '../entities/Moto'

export interface IFavoriteRepository {
  findMotosByUserId(userId: string): Promise<Moto[]>
  findMotoIdsByUserId(userId: string): Promise<string[]>
  add(userId: string, motoId: string): Promise<Moto | null>
  remove(userId: string, motoId: string): Promise<void>
}
