export type MaintenanceSeverity = 'critical' | 'warning' | 'ok';
export type MaintenanceStatus = 'open' | 'scheduled' | 'completed';

export interface MaintenanceJob {
  id: string;
  moto: string;
  motoId?: string;
  plate: string;
  type: string;
  date: string;
  km: string;
  cost: number;
  sev: MaintenanceSeverity;
  status: MaintenanceStatus;
  notes?: string;
}
