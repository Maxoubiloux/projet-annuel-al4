export interface DashboardKPIs {
  fleetUtilization: number;
  totalFleet: number;
  onRoad: number;
  availableCount: number;
  activeRentals: number;
  dueTodayCount: number;
  overdueCount: number;
  revenueMTD: number;
  revenuePrevMonth: number;
  revenueTotal12m: number;
  dailyAvgRevenue: number;
  forecastRevenue: number;
  maintenanceDue: number;
  maintenanceCritical: number;
  maintenanceScheduled: number;
}

export interface RevenuePoint { m: string; v: number; }
export interface RentalsPoint { i: number; v: number; }

export interface DashboardRecentReservation {
  id: string;
  customer: string;
  moto: string;
  period: string;
  days: number;
  amount: string;
  status: 'active' | 'pending' | 'done' | 'overdue';
}

export interface DashboardMaintenanceAlert {
  sev: 'critical' | 'warning' | 'ok';
  title: string;
  moto: string;
  id: string;
  km: string;
  due: string;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  revenueData: RevenuePoint[];
  rentalsData: RentalsPoint[];
  recentReservations: DashboardRecentReservation[];
  maintenanceAlerts: DashboardMaintenanceAlert[];
  openMaintenanceCount: number;
}
