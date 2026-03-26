export enum MotoStatus {
  PUBLISHED = 'PUBLISHED',
  RESERVED = 'RESERVED',
  RENTED = 'RENTED',
  MAINTENANCE = 'MAINTENANCE',
  DAMAGED = 'DAMAGED',
}

export enum MotoCategory {
  A1 = 'A1',
  A2 = 'A2',
  A = 'A',
  MAXI_SCOOTER = 'MAXI_SCOOTER',
}

export interface CreateMotoParams {
  brand: string
  model: string
  registration: string
  category: MotoCategory
  currentKm: number
  pricePerDay: number
}

export class Moto {
  constructor(
    readonly id: string,
    readonly brand: string,
    readonly model: string,
    readonly registration: string,
    readonly category: MotoCategory,
    readonly status: MotoStatus,
    readonly currentKm: number,
    readonly pricePerDay: number,
    readonly createdAt: Date
  ) { }

  static create(id: string, params: CreateMotoParams): Moto {
    return new Moto(
      id,
      params.brand,
      params.model,
      params.registration,
      params.category,
      MotoStatus.PUBLISHED,
      params.currentKm,
      params.pricePerDay,
      new Date()
    )
  }
}
