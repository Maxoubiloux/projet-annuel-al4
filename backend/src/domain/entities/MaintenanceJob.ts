export const MAINTENANCE_SEVERITIES = ['critical', 'warning', 'ok'] as const
export type MaintenanceSeverityName = (typeof MAINTENANCE_SEVERITIES)[number]

export const MAINTENANCE_STATUSES = ['open', 'scheduled', 'completed'] as const
export type MaintenanceStatusName = (typeof MAINTENANCE_STATUSES)[number]

export interface CreateMaintenanceParams {
  motoId: string
  type: string
  date: string
  km: string
  cost: number
  sev: string
  status: string
  notes?: string
}

export interface UpdateMaintenanceParams {
  status?: string
  notes?: string
  cost?: number
}

export class MaintenanceJob {
  constructor(
    readonly id: string,
    readonly motoId: string,
    readonly type: string,
    readonly date: string,
    readonly km: string,
    readonly cost: number,
    readonly sev: string,
    readonly status: string,
    readonly createdAt: Date,
    readonly moto?: string,
    readonly plate?: string,
    readonly notes?: string,
  ) { }

  static create(id: string, params: CreateMaintenanceParams): MaintenanceJob {
    return new MaintenanceJob(
      id,
      params.motoId,
      params.type,
      params.date,
      params.km,
      params.cost,
      params.sev,
      params.status,
      new Date(),
      undefined,
      undefined,
      params.notes,
    )
  }
}
