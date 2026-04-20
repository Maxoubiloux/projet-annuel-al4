import { IBrandRepository } from '@domain/repositories/IBrandRepository'
import { Brand, UpdateBrandParams } from '@domain/entities/Brand'
import prisma from './prisma.client'

export class PrismaBrandRepository implements IBrandRepository {
  async findAll(): Promise<Brand[]> {
    const records = await prisma.brand.findMany({ orderBy: { createdAt: 'desc' } })
    return records.map((r) => new Brand(r.id, r.name, r.createdAt))
  }

  async findById(id: string): Promise<Brand | null> {
    const r = await prisma.brand.findUnique({ where: { id } })
    if (!r) return null
    return new Brand(r.id, r.name, r.createdAt)
  }

  async findByName(name: string): Promise<Brand | null> {
    const r = await prisma.brand.findUnique({ where: { name } })
    if (!r) return null
    return new Brand(r.id, r.name, r.createdAt)
  }

  async save(brand: Brand): Promise<Brand> {
    const r = await prisma.brand.create({
      data: {
        id: brand.id,
        name: brand.name,
        createdAt: brand.createdAt,
      },
    })
    return new Brand(r.id, r.name, r.createdAt)
  }

  async update(id: string, params: UpdateBrandParams): Promise<Brand> {
    const r = await prisma.brand.update({
      where: { id },
      data: params,
    })
    return new Brand(r.id, r.name, r.createdAt)
  }

  async delete(id: string): Promise<void> {
    await prisma.brand.delete({ where: { id } })
  }
}
