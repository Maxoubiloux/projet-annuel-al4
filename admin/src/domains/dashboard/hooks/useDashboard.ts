import { useFetch } from '@/core/hooks/useFetch';
import type {
  DashboardKPIs,
  RevenuePoint,
  RentalsPoint,
  DashboardRecentReservation,
  DashboardMaintenanceAlert,
} from '../types';

export function useDashboard() {
  const kpis = useFetch<DashboardKPIs>('/dashboard/kpis');
  const revenue = useFetch<RevenuePoint[]>('/dashboard/revenue?period=12m');
  const rentals = useFetch<RentalsPoint[]>('/dashboard/rentals?days=14');
  const reservations = useFetch<DashboardRecentReservation[]>(
    '/reservations?limit=5&sort=-createdAt',
  );
  const alerts = useFetch<DashboardMaintenanceAlert[]>('/maintenance/alerts');

  return {
    kpis: kpis.data,
    revenueData: revenue.data,
    rentalsData: rentals.data,
    recentReservations: reservations.data,
    maintenanceAlerts: alerts.data,
    isLoading:
      kpis.isLoading ||
      revenue.isLoading ||
      rentals.isLoading ||
      reservations.isLoading ||
      alerts.isLoading,
    error: kpis.error ?? revenue.error ?? rentals.error ?? reservations.error ?? alerts.error,
    refetch: () => {
      kpis.refetch();
      revenue.refetch();
      rentals.refetch();
      reservations.refetch();
      alerts.refetch();
    },
  };
}
