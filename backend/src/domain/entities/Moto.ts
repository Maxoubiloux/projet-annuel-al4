export interface CreateMotoParams {
  brandId: string
  model: string
  serialNumber: string
  registration: string
  categoryId: string
  statusId: string
  currentKm: number
  pricePerDay: number
  description: string
  style: string
  year: number
  hp: number
  torque: number
  consumption: number
  range: number
}

export interface UpdateMotoParams {
  brandId?: string
  model?: string
  serialNumber?: string
  registration?: string
  categoryId?: string
  statusId?: string
  currentKm?: number
  pricePerDay?: number
  description?: string
  style?: string
  year?: number
  hp?: number
  torque?: number
  consumption?: number
  range?: number
}

export class Moto {
  constructor(
    readonly id: string,
    readonly brandId: string,
    readonly model: string,
    readonly serialNumber: string,
    readonly registration: string,
    readonly categoryId: string,
    readonly statusId: string,
    readonly currentKm: number,
    readonly pricePerDay: number,
    readonly description: string,
    readonly style: string,
    readonly year: number,
    readonly hp: number,
    readonly torque: number,
    readonly consumption: number,
    readonly range: number,
    readonly createdAt: Date
  ) { }

  static create(id: string, params: CreateMotoParams): Moto {
    return new Moto(
      id,
      params.brandId,
      params.model,
      params.serialNumber,
      params.registration,
      params.categoryId,
      params.statusId,
      params.currentKm,
      params.pricePerDay,
      params.description,
      params.style,
      params.year,
      params.hp,
      params.torque,
      params.consumption,
      params.range,
      new Date()
    )
  }
}
