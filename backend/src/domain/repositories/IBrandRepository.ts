import { Brand, UpdateBrandParams } from '../entities/Brand'

export interface IBrandRepository {
  findAll(): Promise<Brand[]>
  findById(id: string): Promise<Brand | null>
  findByName(name: string): Promise<Brand | null>
  save(brand: Brand): Promise<Brand>
  update(id: string, params: UpdateBrandParams): Promise<Brand>
  delete(id: string): Promise<void>
}
