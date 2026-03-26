import { IMotoRepository } from '@domain/repositories/IMotoRepository'
import { Moto, UpdateMotoParams } from '@domain/entities/Moto'
import prisma from './prisma.client'

export class PrismaMotoRepository implements IMotoRepository {
  async findAll(): Promise<Moto[]> {
    const records = await prisma.moto.findMany({ orderBy: { createdAt: 'desc' } })

    return records.map(
      (r) =>
        new Moto(
          r.id, r.brandId, r.model, r.serialNumber, r.registration,
          r.categoryId, r.statusId, r.currentKm, r.pricePerDay,
          r.description, r.createdAt,
        ),
    )
  }

  async findById(id: string): Promise<Moto | null> {
    const r = await prisma.moto.findUnique({ where: { id } })

    if (!r) return null

    return new Moto(
      r.id, r.brandId, r.model, r.serialNumber, r.registration,
      r.categoryId, r.statusId, r.currentKm, r.pricePerDay,
      r.description, r.createdAt,
    )
  }

  async save(moto: Moto): Promise<Moto> {
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
        createdAt: moto.createdAt,
      },
    })

    return new Moto(
      r.id, r.brandId, r.model, r.serialNumber, r.registration,
      r.categoryId, r.statusId, r.currentKm, r.pricePerDay,
      r.description, r.createdAt,
    )
  }

  async update(id: string, params: UpdateMotoParams): Promise<Moto> {
    const r = await prisma.moto.update({
      where: { id },
      data: params,
    })

    return new Moto(
      r.id, r.brandId, r.model, r.serialNumber, r.registration,
      r.categoryId, r.statusId, r.currentKm, r.pricePerDay,
      r.description, r.createdAt,
    )
  }

  async delete(id: string): Promise<void> {
    await prisma.moto.delete({ where: { id } })
  }
}
