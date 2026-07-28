import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ShieldOff } from 'lucide-react';
import { Button } from '@/core/components/ui/Button';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isUnauthorized, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-950">
        <div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-950 p-4">
        <div className="flex flex-col items-center text-center gap-4 max-w-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20">
            <ShieldOff className="h-7 w-7 text-red-400" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white">Accès refusé</h1>
            <p className="mt-1 text-sm text-gray-400">
              Votre compte n'a pas les droits nécessaires pour accéder à ce site.
            </p>
          </div>
          <Button variant="outline" size="md" onClick={logout} className="cursor-pointer">
            Se déconnecter
          </Button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
