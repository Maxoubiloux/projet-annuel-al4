import { IMotoRepository } from '@domain/repositories/IMotoRepository'
import { Moto, MotoCategory, MotoStatus } from '@domain/entities/Moto'
import prisma from './prisma.client'
import { MotoCategory as PrismaMotoCategory, MotoStatus as PrismaMotoStatus } from '../../generated/prisma'

export class PrismaMotoRepository implements IMotoRepository {
  async save(moto: Moto): Promise<Moto> {
    const record = await prisma.moto.create({
      data: {
        id: moto.id,
        brand: moto.brand,
        model: moto.model,
        registration: moto.registration,
        category: moto.category as unknown as PrismaMotoCategory,
        status: moto.status as unknown as PrismaMotoStatus,
        currentKm: moto.currentKm,
        pricePerDay: moto.pricePerDay,
        createdAt: moto.createdAt,
      },
    })

    return new Moto(
      record.id,
      record.brand,
      record.model,
      record.registration,
      record.category as unknown as MotoCategory,
      record.status as unknown as MotoStatus,
      record.currentKm,
      record.pricePerDay,
      record.createdAt,
    )
  }
}
