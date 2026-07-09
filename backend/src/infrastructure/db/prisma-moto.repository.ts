import { v4 as uuidv4 } from 'uuid'
import { IMotoRepository } from '@domain/repositories/IMotoRepository'
import { Moto, UpdateMotoParams } from '@domain/entities/Moto'
import prisma from './prisma.client'
import { Prisma } from '../../generated/prisma/client'

const include = { brand: true, category: true, status: true, images: true } as const

type MotoRecord = Prisma.MotoGetPayload<{ include: typeof include }>

function toDateOnly(d: Date | null): string | undefined {
  return d ? d.toISOString().slice(0, 10) : undefined
}

function toDomain(r: MotoRecord): Moto {
  return new Moto(
    r.id,
    r.brand.name,
    r.model,
    r.registration,
    r.year,
    r.category.name,
    r.currentKm,
    r.pricePerDay,
    r.deposit,
    r.status.name,
    r.location,
    r.description,
    r.createdAt,
    r.images?.[0]?.url,
    toDateOnly(r.nextServiceDate),
  )
}

export class PrismaMotoRepository implements IMotoRepository {
  private async resolveBrandId(name: string): Promise<string> {
    const brand = await prisma.brand.upsert({
      where: { name },
      update: {},
      create: { id: uuidv4(), name },
    })
    return brand.id
  }

  private async resolveCategoryId(name: string): Promise<string> {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { id: uuidv4(), name },
    })
    return category.id
  }

  private async resolveStatusId(name: string): Promise<string> {
    const status = await prisma.status.upsert({
      where: { name },
      update: {},
      create: { id: uuidv4(), name },
    })
    return status.id
  }

  async findAll(): Promise<Moto[]> {
    const records = await prisma.moto.findMany({
      orderBy: { createdAt: 'desc' },
      include,
    })

    return records.map(toDomain)
  }

  async findById(id: string): Promise<Moto | null> {
    const r = await prisma.moto.findUnique({ where: { id }, include })
    return r ? toDomain(r) : null
  }

  async save(moto: Moto): Promise<Moto> {
    const [brandId, categoryId, statusId] = await Promise.all([
      this.resolveBrandId(moto.brand),
      this.resolveCategoryId(moto.category),
      this.resolveStatusId(moto.status),
    ])

    await prisma.moto.create({
      data: {
        id: moto.id,
        brandId,
        model: moto.model,
        registration: moto.plate,
        categoryId,
        statusId,
        year: moto.year,
        currentKm: moto.mileage,
        pricePerDay: moto.pricePerDay,
        deposit: moto.deposit,
        location: moto.location,
        description: moto.description,
        nextServiceDate: moto.nextServiceDate ? new Date(moto.nextServiceDate) : null,
        createdAt: moto.createdAt,
        images: moto.imageUrl ? { create: [{ id: uuidv4(), url: moto.imageUrl }] } : undefined,
      },
    })

    return moto
  }

  async update(id: string, params: UpdateMotoParams): Promise<Moto> {
    const [brandId, categoryId, statusId] = await Promise.all([
      params.brand !== undefined ? this.resolveBrandId(params.brand) : Promise.resolve(undefined),
      params.category !== undefined ? this.resolveCategoryId(params.category) : Promise.resolve(undefined),
      params.status !== undefined ? this.resolveStatusId(params.status) : Promise.resolve(undefined),
    ])

    if (params.imageUrl !== undefined) {
      await prisma.image.deleteMany({ where: { motoId: id } })
      if (params.imageUrl) {
        await prisma.image.create({ data: { id: uuidv4(), motoId: id, url: params.imageUrl } })
      }
    }

    const r = await prisma.moto.update({
      where: { id },
      data: {
        brandId,
        model: params.model,
        registration: params.plate,
        categoryId,
        statusId,
        year: params.year,
        currentKm: params.mileage,
        pricePerDay: params.pricePerDay,
        deposit: params.deposit,
        location: params.location,
        description: params.description,
        nextServiceDate: params.nextServiceDate !== undefined
          ? (params.nextServiceDate ? new Date(params.nextServiceDate) : null)
          : undefined,
      },
      include,
    })

    return toDomain(r)
  }

  async delete(id: string): Promise<void> {
    await prisma.image.deleteMany({ where: { motoId: id } })
    await prisma.moto.delete({ where: { id } })
  }
}
