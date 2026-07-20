import { useFetch } from '@/core/hooks/useFetch';
import { REFRESH_INTERVAL_MS } from '@/core/constants';
import type {
  DashboardKPIs,
  RevenuePoint,
  RentalsPoint,
  DashboardRecentReservation,
  DashboardMaintenanceAlert,
} from '../types';

export function useDashboard() {
  const opts = { refetchInterval: REFRESH_INTERVAL_MS };
  const kpis = useFetch<DashboardKPIs>('/dashboard/kpis', opts);
  const revenue = useFetch<RevenuePoint[]>('/dashboard/revenue?period=12m', opts);
  const rentals = useFetch<RentalsPoint[]>('/dashboard/rentals?days=14', opts);
  const reservations = useFetch<DashboardRecentReservation[]>(
    '/reservations?limit=5&sort=-createdAt',
    opts,
  );
  const alerts = useFetch<DashboardMaintenanceAlert[]>('/maintenance/alerts', opts);

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
