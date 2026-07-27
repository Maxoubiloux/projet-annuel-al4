import { v4 as uuidv4 } from 'uuid'
import { IMotoRepository, MotoAvailability } from '@domain/repositories/IMotoRepository'
import { Moto, UpdateMotoParams } from '@domain/entities/Moto'
import prisma from './prisma.client'
import { Prisma } from '../../generated/prisma/client'

const include = { brand: true, category: true, status: true, images: true } as const

type MotoRecord = Prisma.MotoGetPayload<{ include: typeof include }>

function toDateOnly(d: Date | null): string | undefined {
  return d ? d.toISOString().slice(0, 10) : undefined
}

function dayBounds(value: Date): { start: Date; end: Date } {
  const start = new Date(value)
  start.setHours(0, 0, 0, 0)
  const end = new Date(value)
  end.setHours(23, 59, 59, 999)
  return { start, end }
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
    r.style ?? undefined,
    r.hp ?? undefined,
    r.torque ?? undefined,
    r.consumption ?? undefined,
    r.range ?? undefined,
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

  async findReservedTodayIds(): Promise<string[]> {
    const { start, end } = dayBounds(new Date())
    const records = await prisma.booking.findMany({
      where: {
        status: { notIn: ['cancelled', 'completed'] },
        startDate: { lte: end },
        endDate: { gte: start },
      },
      distinct: ['motoId'],
      select: { motoId: true },
    })

    return records.map((record) => record.motoId)
  }

  async findAvailability(id: string): Promise<MotoAvailability | null> {
    const moto = await prisma.moto.findUnique({ where: { id }, select: { id: true } })
    if (!moto) return null

    const { start, end } = dayBounds(new Date())
    const [todayCount, bookings] = await Promise.all([
      prisma.booking.count({
        where: {
          motoId: id,
          status: { notIn: ['cancelled', 'completed'] },
          startDate: { lte: end },
          endDate: { gte: start },
        },
      }),
      prisma.booking.findMany({
        where: {
          motoId: id,
          status: { notIn: ['cancelled', 'completed'] },
          endDate: { gte: start },
        },
        orderBy: { startDate: 'asc' },
        select: { startDate: true, endDate: true },
      }),
    ])

    return {
      motoId: id,
      isAvailableToday: todayCount === 0,
      unavailableRanges: bookings.map((booking) => ({
        startDate: booking.startDate.toISOString().slice(0, 10),
        endDate: booking.endDate.toISOString().slice(0, 10),
      })),
    }
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
        style: moto.style,
        hp: moto.hp,
        torque: moto.torque,
        consumption: moto.consumption,
        range: moto.range,
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
        style: params.style,
        hp: params.hp,
        torque: params.torque,
        consumption: params.consumption,
        range: params.range,
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
