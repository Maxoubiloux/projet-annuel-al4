export interface DashboardKPIs {
  fleetUtilization: number
  totalFleet: number
  onRoad: number
  availableCount: number
  activeRentals: number
  dueTodayCount: number
  overdueCount: number
  revenueMTD: number
  revenuePrevMonth: number
  revenueTotal12m: number
  dailyAvgRevenue: number
  forecastRevenue: number
  maintenanceDue: number
  maintenanceCritical: number
  maintenanceScheduled: number
}

export interface RevenuePoint {
  m: string
  v: number
}

export interface RentalsPoint {
  i: number
  v: number
}
