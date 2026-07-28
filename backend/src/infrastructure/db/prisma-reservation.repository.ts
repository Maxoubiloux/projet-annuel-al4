import { v4 as uuidv4 } from 'uuid'
import {
  IReservationRepository,
  ReservationCustomerUpsertParams,
  ReservationListParams,
  ReservationListResult,
} from '@domain/repositories/IReservationRepository'
import { Reservation } from '@domain/entities/Reservation'
import prisma from './prisma.client'
import { Prisma } from '../../generated/prisma/client'

const include = {
  moto: { include: { brand: true, category: true, images: true } },
  user: true,
  shop: true,
} as const

type BookingRecord = Prisma.BookingGetPayload<{ include: typeof include }>

function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function toDomain(r: BookingRecord): Reservation {
  return new Reservation(
    r.id,
    r.motoId,
    r.userId,
    toDateOnly(r.startDate),
    toDateOnly(r.endDate),
    r.totalAmount,
    r.depositAmount,
    r.status,
    r.paymentStatus,
    r.createdAt,
    {
      id: r.moto.id,
      brand: r.moto.brand.name,
      model: r.moto.model,
      plate: r.moto.registration,
      category: r.moto.category.name,
      imageUrl: r.moto.images?.[0]?.url,
    },
    {
      id: r.user.id,
      firstName: r.user.firstName ?? '',
      lastName: r.user.lastName ?? '',
      phone: r.user.phone ?? '',
      email: r.user.email,
    },
    r.contractStatus,
    r.contractPdfUrl ?? undefined,
    { id: r.shop.id, name: r.shop.name, city: r.shop.city },
  )
}

export class PrismaReservationRepository implements IReservationRepository {
  private async getDefaultShopId(): Promise<string> {
    const existing = await prisma.shop.findFirst()
    if (existing) return existing.id

    const created = await prisma.shop.create({
      data: {
        id: uuidv4(),
        name: 'Plein Gaz Loc',
        address: '12 Rue des Motards',
        city: 'Paris',
        zipCode: '75011',
        country: 'France',
        phone: '+33142000000',
        email: 'contact@pleingazloc.fr',
      },
    })
    return created.id
  }

  async findAll(params: ReservationListParams): Promise<ReservationListResult> {
    const page = params.page ?? 1
    const limit = params.limit ?? 10
    const where = params.customerId ? { userId: params.customerId } : {}

    const [records, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ])

    return { items: records.map(toDomain), total }
  }

  async findRecent(limit: number): Promise<Reservation[]> {
    const records = await prisma.booking.findMany({
      include,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    return records.map(toDomain)
  }

  async findById(id: string): Promise<Reservation | null> {
    const r = await prisma.booking.findUnique({ where: { id }, include })
    return r ? toDomain(r) : null
  }

  async findMotoPricePerDay(motoId: string): Promise<number | null> {
    const moto = await prisma.moto.findUnique({
      where: { id: motoId },
      select: { pricePerDay: true },
    })

    return moto?.pricePerDay ?? null
  }

  async hasActiveOverlap(motoId: string, startDate: string, endDate: string): Promise<boolean> {
    const count = await prisma.booking.count({
      where: {
        motoId,
        status: { notIn: ['cancelled', 'completed'] },
        startDate: { lte: new Date(endDate) },
        endDate: { gte: new Date(startDate) },
      },
    })

    return count > 0
  }

  async ensureCustomer(params: ReservationCustomerUpsertParams): Promise<void> {
    const firstName = params.firstName?.trim() || params.email.split('@')[0] || 'Client'
    const lastName = params.lastName?.trim() || ''
    const name = `${firstName} ${lastName}`.trim()

    await prisma.user.upsert({
      where: { id: params.id },
      update: {
        email: params.email,
        name,
        firstName,
        lastName,
        phone: params.phone,
      },
      create: {
        id: params.id,
        email: params.email,
        name,
        password: 'managed-by-keycloak',
        firstName,
        lastName,
        phone: params.phone,
        status: 'active',
      },
    })
  }

  async save(reservation: Reservation): Promise<Reservation> {
    const shopId = await this.getDefaultShopId()

    const r = await prisma.booking.create({
      data: {
        id: reservation.id,
        motoId: reservation.motoId,
        userId: reservation.customerId,
        shopId,
        startDate: new Date(reservation.startDate),
        endDate: new Date(reservation.endDate),
        status: reservation.status,
        paymentStatus: reservation.paymentStatus,
        totalAmount: reservation.totalAmount,
        depositAmount: reservation.depositAmount,
        createdAt: reservation.createdAt,
      },
      include,
    })

    return toDomain(r)
  }

  async updateStatus(id: string, status: string): Promise<Reservation> {
    const r = await prisma.booking.update({ where: { id }, data: { status }, include })
    return toDomain(r)
  }

  async updatePaymentStatus(id: string, paymentStatus: string): Promise<Reservation> {
    const r = await prisma.booking.update({ where: { id }, data: { paymentStatus }, include })
    return toDomain(r)
  }

  async updateContract(id: string, contractStatus: string, contractPdfUrl: string | null): Promise<Reservation> {
    const r = await prisma.booking.update({
      where: { id },
      data: { contractStatus, contractPdfUrl },
      include,
    })
    return toDomain(r)
  }
}
