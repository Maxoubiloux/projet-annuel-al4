import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/core/layout/MainLayout';
import { ProtectedRoute } from '@/core/auth/ProtectedRoute';
import { LoginPage } from '@/domains/auth/pages/LoginPage';
import { DashboardPage } from '@/domains/dashboard/pages/DashboardPage';
import { MotoListPage } from '@/domains/motos/pages/MotoListPage';
import { ReservationListPage } from '@/domains/reservations/pages/ReservationListPage';
import { CustomerListPage } from '@/domains/customers/pages/CustomerListPage';
import { MaintenanceListPage } from '@/domains/maintenance/pages/MaintenanceListPage';
import { PaymentListPage } from '@/domains/payments/pages/PaymentListPage';
import { SettingsPage } from '@/domains/settings/pages/SettingsPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="motos" element={<MotoListPage />} />
        <Route path="reservations" element={<ReservationListPage />} />
        <Route path="customers" element={<CustomerListPage />} />
        <Route path="maintenance" element={<MaintenanceListPage />} />
        <Route path="payments" element={<PaymentListPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
