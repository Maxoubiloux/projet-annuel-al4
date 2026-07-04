import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bike, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/core/components/ui/Button';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // TODO: POST /api/auth/forgot-password with { email }
      setSubmitted(true);
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
          {!submitted ? (
            <>
              <div className="mb-8 flex flex-col items-center text-center">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-blue-500/25">
                  <Bike className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-white tracking-tight">Mot de passe oublié</h1>
                <p className="mt-1 text-sm text-gray-400">
                  Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation.
                </p>
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

                <Button type="submit" className="mt-2 w-full" size="lg">
                  Envoyer le lien
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center text-center py-4">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: 'color-mix(in srgb,#22c55e 15%,transparent)' }}>
                <CheckCircle className="h-6 w-6" style={{ color: '#22c55e' }} />
              </div>
              <h2 className="text-lg font-semibold text-white tracking-tight">E-mail envoyé</h2>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                Si un compte existe pour <span className="text-gray-300">{email}</span>, vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              <p className="mt-3 text-xs text-gray-600">
                Pensez à vérifier vos spams.
              </p>
            </div>
          )}

          <p className="mt-6 text-center text-[11px] text-gray-600">
            <Link to="/login" className="text-gray-500 hover:text-gray-400 transition-colors inline-flex items-center gap-1">
              <ArrowLeft size={11} />Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
