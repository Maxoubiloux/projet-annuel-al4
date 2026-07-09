export const MOTO_STATUSES = ['available', 'reserved', 'maintenance', 'inactive'] as const
export type MotoStatusName = (typeof MOTO_STATUSES)[number]

export interface CreateMotoParams {
  brand: string
  model: string
  plate: string
  year: number
  category: string
  mileage: number
  pricePerDay: number
  deposit: number
  status: string
  location: string
  description: string
  imageUrl?: string
  nextServiceDate?: string
}

export type UpdateMotoParams = Partial<CreateMotoParams>

export class Moto {
  constructor(
    readonly id: string,
    readonly brand: string,
    readonly model: string,
    readonly plate: string,
    readonly year: number,
    readonly category: string,
    readonly mileage: number,
    readonly pricePerDay: number,
    readonly deposit: number,
    readonly status: string,
    readonly location: string,
    readonly description: string,
    readonly createdAt: Date,
    readonly imageUrl?: string,
    readonly nextServiceDate?: string,
  ) { }

  static create(id: string, params: CreateMotoParams): Moto {
    return new Moto(
      id,
      params.brand,
      params.model,
      params.plate,
      params.year,
      params.category,
      params.mileage,
      params.pricePerDay,
      params.deposit,
      params.status,
      params.location,
      params.description,
      new Date(),
      params.imageUrl,
      params.nextServiceDate,
    )
  }
}
