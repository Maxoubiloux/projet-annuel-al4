import { IDashboardRepository } from '@domain/repositories/IDashboardRepository'
import { DashboardKPIs, RevenuePoint, RentalsPoint } from '@domain/entities/Dashboard'
import prisma from './prisma.client'

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 86_400_000)
}

function addMonths(d: Date, months: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + months, 1)
}

async function sumPaidAmount(from: Date, to: Date): Promise<number> {
  const result = await prisma.payment.aggregate({
    where: { status: 'paid', date: { gte: from, lt: to } },
    _sum: { amount: true },
  })
  return result._sum.amount ?? 0
}

export class PrismaDashboardRepository implements IDashboardRepository {
  async getKpis(): Promise<DashboardKPIs> {
    const now = new Date()
    const today = startOfDay(now)
    const tomorrow = addDays(today, 1)
    const monthStart = startOfMonth(now)
    const prevMonthStart = addMonths(monthStart, -1)
    const twelveMonthsAgo = addMonths(monthStart, -11)

    const [
      totalFleet,
      onRoad,
      availableCount,
      activeRentals,
      dueTodayCount,
      overdueCount,
      revenueMTD,
      revenuePrevMonth,
      revenueTotal12m,
      maintenanceDue,
      maintenanceCritical,
      maintenanceScheduled,
    ] = await Promise.all([
      prisma.moto.count(),
      prisma.moto.count({ where: { status: { name: 'reserved' } } }),
      prisma.moto.count({ where: { status: { name: 'available' } } }),
      prisma.booking.count({ where: { status: 'in_progress' } }),
      prisma.booking.count({ where: { status: 'in_progress', endDate: { gte: today, lt: tomorrow } } }),
      prisma.booking.count({ where: { status: 'in_progress', endDate: { lt: today } } }),
      sumPaidAmount(monthStart, addMonths(monthStart, 1)),
      sumPaidAmount(prevMonthStart, monthStart),
      sumPaidAmount(twelveMonthsAgo, addMonths(monthStart, 1)),
      prisma.maintenanceJob.count({ where: { status: { not: 'completed' } } }),
      prisma.maintenanceJob.count({ where: { status: { not: 'completed' }, sev: 'critical' } }),
      prisma.maintenanceJob.count({ where: { status: 'scheduled' } }),
    ])

    const dayOfMonth = now.getDate()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const dailyAvgRevenue = dayOfMonth > 0 ? revenueMTD / dayOfMonth : 0
    const forecastRevenue = dailyAvgRevenue * daysInMonth

    return {
      fleetUtilization: totalFleet > 0 ? Math.round((onRoad / totalFleet) * 100) : 0,
      totalFleet,
      onRoad,
      availableCount,
      activeRentals,
      dueTodayCount,
      overdueCount,
      revenueMTD: Math.round(revenueMTD),
      revenuePrevMonth: Math.round(revenuePrevMonth),
      revenueTotal12m: Math.round(revenueTotal12m),
      dailyAvgRevenue: Math.round(dailyAvgRevenue),
      forecastRevenue: Math.round(forecastRevenue),
      maintenanceDue,
      maintenanceCritical,
      maintenanceScheduled,
    }
  }

  async getRevenue(months: number): Promise<RevenuePoint[]> {
    const now = new Date()
    const currentMonthStart = startOfMonth(now)
    const points: RevenuePoint[] = []

    for (let i = months - 1; i >= 0; i--) {
      const from = addMonths(currentMonthStart, -i)
      const to = addMonths(from, 1)
      const total = await sumPaidAmount(from, to)
      points.push({ m: from.toLocaleString('en-US', { month: 'short' }), v: Math.round((total / 1000) * 10) / 10 })
    }

    return points
  }

  async getRentals(days: number): Promise<RentalsPoint[]> {
    const now = new Date()
    const today = startOfDay(now)
    const from = addDays(today, -(days - 1))

    const bookings = await prisma.booking.findMany({
      where: { startDate: { gte: from, lt: addDays(today, 1) } },
      select: { startDate: true },
    })

    const counts = new Array(days).fill(0)
    for (const b of bookings) {
      const dayIndex = Math.floor((startOfDay(b.startDate).getTime() - from.getTime()) / 86_400_000)
      if (dayIndex >= 0 && dayIndex < days) counts[dayIndex]++
    }

    return counts.map((v, i) => ({ i, v }))
  }
}
