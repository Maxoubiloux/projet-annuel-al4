import { Moto, UpdateMotoParams } from '../entities/Moto'

export interface MotoUnavailableRange {
  startDate: string
  endDate: string
}

export interface MotoAvailability {
  motoId: string
  isAvailableToday: boolean
  unavailableRanges: MotoUnavailableRange[]
}

export interface IMotoRepository {
  findAll(): Promise<Moto[]>
  findById(id: string): Promise<Moto | null>
  findReservedTodayIds(): Promise<string[]>
  findAvailability(id: string): Promise<MotoAvailability | null>
  save(moto: Moto): Promise<Moto>
  update(id: string, params: UpdateMotoParams): Promise<Moto>
  delete(id: string): Promise<void>
}
