import { v4 as uuidv4 } from 'uuid'
import {
  IReservationRepository,
  ReservationListParams,
  ReservationListResult,
} from '@domain/repositories/IReservationRepository'
import { Reservation } from '@domain/entities/Reservation'
import prisma from './prisma.client'
import { Prisma } from '../../generated/prisma/client'

const include = {
  moto: { include: { brand: true } },
  user: true,
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
    { id: r.moto.id, brand: r.moto.brand.name, model: r.moto.model, plate: r.moto.registration },
    {
      id: r.user.id,
      firstName: r.user.firstName ?? '',
      lastName: r.user.lastName ?? '',
      phone: r.user.phone ?? '',
      email: r.user.email,
    },
  )
}

export class PrismaReservationRepository implements IReservationRepository {
  private async getDefaultShopId(): Promise<string> {
    const existing = await prisma.shop.findFirst()
    if (existing) return existing.id

    const created = await prisma.shop.create({
      data: {
        id: uuidv4(),
        name: 'City Moto Yard',
        address: '12 Rue des Motards',
        city: 'Paris',
        zipCode: '75011',
        country: 'France',
        phone: '+33142000000',
        email: 'contact@citymotoyard.fr',
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
}
