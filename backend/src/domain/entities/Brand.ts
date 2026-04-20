export interface CreateBrandParams {
  name: string
}

export interface UpdateBrandParams {
  name?: string
}

export class Brand {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly createdAt: Date
  ) { }

  static create(id: string, params: CreateBrandParams): Brand {
    return new Brand(id, params.name, new Date())
  }
}
