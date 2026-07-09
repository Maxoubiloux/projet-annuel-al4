import { v4 as uuidv4 } from 'uuid'
import {
  ICustomerRepository,
  CustomerListParams,
  CustomerListResult,
} from '@domain/repositories/ICustomerRepository'
import { Customer, UpdateCustomerParams } from '@domain/entities/Customer'
import prisma from './prisma.client'
import { Prisma } from '../../generated/prisma/client'

type UserRecord = Prisma.UserGetPayload<{ include: { _count: { select: { bookings: true } } } }>

function toDomain(r: UserRecord, totalSpent: number): Customer {
  return new Customer(
    r.id,
    r.firstName ?? '',
    r.lastName ?? '',
    r.email,
    r.phone ?? '',
    r.licenseNumber ?? '',
    r.licenseVerified,
    r.status,
    r.createdAt,
    r._count.bookings,
    totalSpent,
  )
}

async function totalSpentByCustomer(customerIds: string[]): Promise<Map<string, number>> {
  if (customerIds.length === 0) return new Map()

  const sums = await prisma.payment.groupBy({
    by: ['customerId'],
    where: { customerId: { in: customerIds }, status: 'paid' },
    _sum: { amount: true },
  })

  return new Map(sums.map(s => [s.customerId, s._sum.amount ?? 0]))
}

export class PrismaCustomerRepository implements ICustomerRepository {
  async findAll(params: CustomerListParams): Promise<CustomerListResult> {
    const page = params.page ?? 1
    const limit = params.limit ?? 10

    const [records, total] = await Promise.all([
      prisma.user.findMany({
        include: { _count: { select: { bookings: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count(),
    ])

    const spentMap = await totalSpentByCustomer(records.map(r => r.id))

    return { items: records.map(r => toDomain(r, spentMap.get(r.id) ?? 0)), total }
  }

  async findById(id: string): Promise<Customer | null> {
    const r = await prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { bookings: true } } },
    })
    if (!r) return null

    const spentMap = await totalSpentByCustomer([id])
    return toDomain(r, spentMap.get(id) ?? 0)
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const r = await prisma.user.findUnique({
      where: { email },
      include: { _count: { select: { bookings: true } } },
    })
    if (!r) return null

    const spentMap = await totalSpentByCustomer([r.id])
    return toDomain(r, spentMap.get(r.id) ?? 0)
  }

  async save(customer: Customer): Promise<Customer> {
    await prisma.user.create({
      data: {
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`.trim(),
        email: customer.email,
        password: uuidv4(),
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        licenseNumber: customer.licenseNumber,
        licenseVerified: customer.licenseVerified,
        status: customer.status,
        createdAt: customer.createdAt,
      },
    })

    return customer
  }

  async update(id: string, params: UpdateCustomerParams): Promise<Customer> {
    const nameUpdate =
      params.firstName !== undefined || params.lastName !== undefined
        ? {
          name: `${params.firstName ?? ''} ${params.lastName ?? ''}`.trim() || undefined,
        }
        : {}

    const r = await prisma.user.update({
      where: { id },
      data: {
        ...nameUpdate,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        phone: params.phone,
        licenseNumber: params.licenseNumber,
        licenseVerified: params.licenseVerified,
        status: params.status,
      },
      include: { _count: { select: { bookings: true } } },
    })

    const spentMap = await totalSpentByCustomer([id])
    return toDomain(r, spentMap.get(id) ?? 0)
  }

  async updateStatus(id: string, status: string): Promise<Customer> {
    const r = await prisma.user.update({
      where: { id },
      data: { status },
      include: { _count: { select: { bookings: true } } },
    })

    const spentMap = await totalSpentByCustomer([id])
    return toDomain(r, spentMap.get(id) ?? 0)
  }
}
