import { MaintenanceJob, UpdateMaintenanceParams } from '../entities/MaintenanceJob'

export interface MaintenanceListParams {
  page?: number
  limit?: number
}

export interface MaintenanceListResult {
  items: MaintenanceJob[]
  total: number
}

export interface MaintenanceAlert {
  id: string
  sev: string
  title: string
  moto: string
  km: string
  due: string
}

export interface IMaintenanceRepository {
  findAll(params: MaintenanceListParams): Promise<MaintenanceListResult>
  findById(id: string): Promise<MaintenanceJob | null>
  findAlerts(limit: number): Promise<MaintenanceAlert[]>
  save(job: MaintenanceJob): Promise<MaintenanceJob>
  update(id: string, params: UpdateMaintenanceParams): Promise<MaintenanceJob>
}
