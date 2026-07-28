import { DashboardKPIs, RevenuePoint, RentalsPoint } from '../entities/Dashboard'

export interface IDashboardRepository {
  getKpis(): Promise<DashboardKPIs>
  getRevenue(months: number): Promise<RevenuePoint[]>
  getRentals(days: number): Promise<RentalsPoint[]>
}
