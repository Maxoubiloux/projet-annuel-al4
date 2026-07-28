import {
  IPaymentRepository,
  PaymentListParams,
  PaymentListResult,
} from '@domain/repositories/IPaymentRepository'
import { Payment } from '@domain/entities/Payment'
import prisma from './prisma.client'
import { Prisma } from '../../generated/prisma/client'

const include = { customer: true } as const

type PaymentRecord = Prisma.PaymentGetPayload<{ include: typeof include }>

function toDomain(r: PaymentRecord): Payment {
  return new Payment(
    r.id,
    r.ref,
    r.customerId,
    r.amount,
    r.deposit,
    r.method,
    r.date,
    r.status,
    `${r.customer.firstName ?? ''} ${r.customer.lastName ?? ''}`.trim() || r.customer.name,
    r.bookingId ?? undefined,
  )
}

export class PrismaPaymentRepository implements IPaymentRepository {
  async findAll(params: PaymentListParams): Promise<PaymentListResult> {
    const page = params.page ?? 1
    const limit = params.limit ?? 10

    const [records, total] = await Promise.all([
      prisma.payment.findMany({
        include,
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count(),
    ])

    return { items: records.map(toDomain), total }
  }

  async findById(id: string): Promise<Payment | null> {
    const r = await prisma.payment.findUnique({ where: { id }, include })
    return r ? toDomain(r) : null
  }

  async findByBookingId(bookingId: string): Promise<Payment | null> {
    const r = await prisma.payment.findUnique({ where: { bookingId }, include })
    return r ? toDomain(r) : null
  }

  async save(payment: Payment): Promise<Payment> {
    const r = await prisma.payment.create({
      data: {
        id: payment.id,
        ref: payment.ref,
        bookingId: payment.bookingId,
        customerId: payment.customerId,
        amount: payment.amount,
        deposit: payment.deposit,
        method: payment.method,
        date: payment.date,
        status: payment.status,
      },
      include,
    })

    return toDomain(r)
  }

  async updateStatus(id: string, status: string): Promise<Payment> {
    const r = await prisma.payment.update({ where: { id }, data: { status }, include })
    return toDomain(r)
  }

  async refund(id: string): Promise<Payment> {
    const r = await prisma.payment.update({ where: { id }, data: { status: 'refunded' }, include })
    return toDomain(r)
  }
}
