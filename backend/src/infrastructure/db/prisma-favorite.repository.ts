import { IFavoriteRepository } from '@domain/repositories/IFavoriteRepository'
import { Moto } from '@domain/entities/Moto'
import prisma from './prisma.client'
import { Prisma } from '../../generated/prisma/client'

const motoInclude = { brand: true, category: true, status: true, images: true } as const
const favoriteInclude = { moto: { include: motoInclude } } as const

type FavoriteRecord = Prisma.FavoriteGetPayload<{ include: typeof favoriteInclude }>
type MotoRecord = Prisma.MotoGetPayload<{ include: typeof motoInclude }>

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
    r.style ?? undefined,
    r.hp ?? undefined,
    r.torque ?? undefined,
    r.consumption ?? undefined,
    r.range ?? undefined,
  )
}

export class PrismaFavoriteRepository implements IFavoriteRepository {
  async findMotosByUserId(userId: string): Promise<Moto[]> {
    const records = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: favoriteInclude,
    })

    return records.map((record: FavoriteRecord) => toDomain(record.moto))
  }

  async findMotoIdsByUserId(userId: string): Promise<string[]> {
    const records = await prisma.favorite.findMany({
      where: { userId },
      select: { motoId: true },
    })

    return records.map((record) => record.motoId)
  }

  async add(userId: string, motoId: string): Promise<Moto | null> {
    const moto = await prisma.moto.findUnique({ where: { id: motoId }, include: motoInclude })
    if (!moto) return null

    await prisma.favorite.upsert({
      where: { userId_motoId: { userId, motoId } },
      update: {},
      create: { userId, motoId },
    })

    return toDomain(moto)
  }

  async remove(userId: string, motoId: string): Promise<void> {
    await prisma.favorite.deleteMany({ where: { userId, motoId } })
  }
}
