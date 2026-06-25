import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/core/auth/AuthContext';
import { Button } from '@/core/components/ui/Button';
import { Bike } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (email && password) {
      login(email);
      navigate(from, { replace: true });
    }
  };

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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-medium text-gray-400">
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@entreprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-gray-600 transition-colors focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-medium text-gray-400">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-gray-600 transition-colors focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>

            <Button type="submit" className="mt-2 w-full" size="lg">
              Se connecter
            </Button>
          </form>

          <p className="mt-6 text-center text-[11px] text-gray-600">
            Tout email / mot de passe fonctionne pour cette démo.
          </p>
        </div>
      </div>
    </div>
  );
}
