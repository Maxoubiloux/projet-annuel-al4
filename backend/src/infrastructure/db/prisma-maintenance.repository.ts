import {
  IMaintenanceRepository,
  MaintenanceListParams,
  MaintenanceListResult,
  MaintenanceAlert,
} from '@domain/repositories/IMaintenanceRepository'
import { MaintenanceJob, UpdateMaintenanceParams } from '@domain/entities/MaintenanceJob'
import prisma from './prisma.client'
import { Prisma } from '../../generated/prisma/client'

const include = { moto: { include: { brand: true } } } as const

type MaintenanceRecord = Prisma.MaintenanceJobGetPayload<{ include: typeof include }>

const SEVERITY_RANK: Record<string, number> = { critical: 0, warning: 1, ok: 2 }

function toDomain(r: MaintenanceRecord): MaintenanceJob {
  return new MaintenanceJob(
    r.id,
    r.motoId,
    r.type,
    r.date.toISOString().slice(0, 10),
    r.km,
    r.cost,
    r.sev,
    r.status,
    r.createdAt,
    `${r.moto.brand.name} ${r.moto.model}`,
    r.moto.registration,
    r.notes ?? undefined,
  )
}

export class PrismaMaintenanceRepository implements IMaintenanceRepository {
  async findAll(params: MaintenanceListParams): Promise<MaintenanceListResult> {
    const page = params.page ?? 1
    const limit = params.limit ?? 10

    const [records, total] = await Promise.all([
      prisma.maintenanceJob.findMany({
        include,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.maintenanceJob.count(),
    ])

    return { items: records.map(toDomain), total }
  }

  async findById(id: string): Promise<MaintenanceJob | null> {
    const r = await prisma.maintenanceJob.findUnique({ where: { id }, include })
    return r ? toDomain(r) : null
  }

  async findAlerts(limit: number): Promise<MaintenanceAlert[]> {
    const records = await prisma.maintenanceJob.findMany({
      where: { status: { not: 'completed' } },
      include,
      orderBy: { date: 'asc' },
    })

    return records
      .sort((a, b) => (SEVERITY_RANK[a.sev] ?? 9) - (SEVERITY_RANK[b.sev] ?? 9))
      .slice(0, limit)
      .map(r => ({
        id: r.id,
        sev: r.sev,
        title: r.type,
        moto: `${r.moto.brand.name} ${r.moto.model}`,
        km: r.km,
        due: r.date.toISOString().slice(0, 10),
      }))
  }

  async save(job: MaintenanceJob): Promise<MaintenanceJob> {
    const r = await prisma.maintenanceJob.create({
      data: {
        id: job.id,
        motoId: job.motoId,
        type: job.type,
        date: new Date(job.date),
        km: job.km,
        cost: job.cost,
        sev: job.sev,
        status: job.status,
        notes: job.notes,
        createdAt: job.createdAt,
      },
      include,
    })

    return toDomain(r)
  }

  async update(id: string, params: UpdateMaintenanceParams): Promise<MaintenanceJob> {
    const r = await prisma.maintenanceJob.update({
      where: { id },
      data: { status: params.status, notes: params.notes, cost: params.cost },
      include,
    })

    return toDomain(r)
  }
}
