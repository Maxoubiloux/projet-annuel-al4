import { useAuth } from '@/core/auth/AuthContext';
import { Button } from '@/core/components/ui/Button';
import { Bike } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-950 p-4 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(37,99,235,0.18) 0%, transparent 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgb(255 255 255) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      <div className="relative z-10 w-full max-w-[380px]">
        <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-sm ring-1 ring-inset ring-white/5">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-blue-500/25">
              <Bike className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-white tracking-tight">MotoManager</h1>
            <p className="mt-1 text-sm text-gray-400">Accès administration</p>
          </div>

          <Button onClick={login} className="w-full cursor-pointer" size="lg">
            Se connecter avec Keycloak
          </Button>
        </div>
      </div>
    </div>
  );
}
