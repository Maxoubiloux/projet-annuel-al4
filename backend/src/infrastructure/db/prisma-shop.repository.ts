import { IShopRepository } from '@domain/repositories/IShopRepository'
import { Shop, UpdateShopParams } from '@domain/entities/Shop'
import prisma from './prisma.client'

export class PrismaShopRepository implements IShopRepository {
  async findAll(): Promise<Shop[]> {
    const records = await prisma.shop.findMany({ orderBy: { createdAt: 'desc' } })

    return records.map(
      (r) =>
        new Shop(
          r.id, r.name, r.address, r.city, r.zipCode,
          r.country, r.phone, r.email, r.createdAt,
        ),
    )
  }

  async findById(id: string): Promise<Shop | null> {
    const r = await prisma.shop.findUnique({ where: { id } })

    if (!r) return null

    return new Shop(
      r.id, r.name, r.address, r.city, r.zipCode,
      r.country, r.phone, r.email, r.createdAt,
    )
  }

  async save(shop: Shop): Promise<Shop> {
    const r = await prisma.shop.create({
      data: {
        id: shop.id,
        name: shop.name,
        address: shop.address,
        city: shop.city,
        zipCode: shop.zipCode,
        country: shop.country,
        phone: shop.phone,
        email: shop.email,
        createdAt: shop.createdAt,
      },
    })

    return new Shop(
      r.id, r.name, r.address, r.city, r.zipCode,
      r.country, r.phone, r.email, r.createdAt,
    )
  }

  async update(id: string, params: UpdateShopParams): Promise<Shop> {
    const r = await prisma.shop.update({
      where: { id },
      data: params,
    })

    return new Shop(
      r.id, r.name, r.address, r.city, r.zipCode,
      r.country, r.phone, r.email, r.createdAt,
    )
  }

  async delete(id: string): Promise<void> {
    await prisma.shop.delete({ where: { id } })
  }
}
