import { IMotoRepository } from '@domain/repositories/IMotoRepository'
import { Moto, UpdateMotoParams } from '@domain/entities/Moto'
import prisma from './prisma.client'

export class PrismaMotoRepository implements IMotoRepository {
  async findAll(): Promise<any[]> {
    const records = await prisma.moto.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        brand: true,
        category: true,
        status: true,
        images: true,
      }
    })

    return records.map(r => ({
      id: r.id,
      brand: r.brand.name,
      model: r.model,
      serialNumber: r.serialNumber,
      registration: r.registration,
      category: r.category.name,
      status: r.status.name,
      currentKm: r.currentKm,
      pricePerDay: r.pricePerDay,
      description: r.description,
      style: r.style,
      year: r.year,
      hp: r.hp,
      torque: r.torque,
      consumption: r.consumption,
      range: r.range,
      imageUrl: r.images?.[0]?.url || '/images/motos/default.jpg',
      createdAt: r.createdAt,
    }))
  }

  async findById(id: string): Promise<any | null> {
    const r = await prisma.moto.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
        status: true,
        images: true,
      }
    })

    if (!r) return null

    return {
      id: r.id,
      brand: r.brand.name,
      model: r.model,
      serialNumber: r.serialNumber,
      registration: r.registration,
      category: r.category.name,
      status: r.status.name,
      currentKm: r.currentKm,
      pricePerDay: r.pricePerDay,
      description: r.description,
      style: r.style,
      year: r.year,
      hp: r.hp,
      torque: r.torque,
      consumption: r.consumption,
      range: r.range,
      imageUrl: r.images?.[0]?.url || '/images/motos/default.jpg',
      createdAt: r.createdAt,
    }
  }

  async save(moto: Moto): Promise<any> {
    const r = await prisma.moto.create({
      data: {
        id: moto.id,
        brandId: moto.brandId,
        model: moto.model,
        serialNumber: moto.serialNumber,
        registration: moto.registration,
        categoryId: moto.categoryId,
        statusId: moto.statusId,
        currentKm: moto.currentKm,
        pricePerDay: moto.pricePerDay,
        description: moto.description,
        style: moto.style,
        year: moto.year,
        hp: moto.hp,
        torque: moto.torque,
        consumption: moto.consumption,
        range: moto.range,
        createdAt: moto.createdAt,
      },
    })

    return r
  }

  async update(id: string, params: UpdateMotoParams): Promise<any> {
    const r = await prisma.moto.update({
      where: { id },
      data: params,
    })

    return r
  }

  async delete(id: string): Promise<void> {
    await prisma.moto.delete({ where: { id } })
  }
}
